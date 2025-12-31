<template>
	<view class="tab-container">
		<u-tabs :inactiveStyle="{ color: '#000' }" :activeStyle="{ color: '#FF8C00' }" :list="tab.items" @change="changeTab"
			:scrollable="false" keyName="label" lineColor="#FF8C00" />
	</view>
	<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" :top="100">
		<view class="order-item" v-for="(order, index) in dataList" :key="order.order_no || index">
			<view class="flex-between-center u-mb-20">
				<view class="order-no flex-row" @click="setClipboardData(order.order_no)">
					订单号:
					<text style="color: #666;">{{order.order_no}}</text>
					<view class="iconfont copy icon-fuzhi c9">
					</view>
				</view>
				<view class="order-item-info-status">
					<u-text v-if="order.status == 'PND'" size="14" type="error" text="待支付"></u-text>
					<u-text v-if="order.status == 'SUCC'" size="14" type="success" text="已付款"></u-text>
					<u-text v-if="order.status == 'FAIL'" size="14" type="error" text="失败"></u-text>
					<u-text v-if="order.status == 'RFUND'" size="14" type="info" text="已退款"></u-text>
					<u-text v-if="order.status == 'CXL'" size="14" type="info" text="已取消"></u-text>
					<u-text v-if="order.status == 'EXP'" size="14" type="info" text="已过期"></u-text>
				</view>
			</view>
			<view class="">
				<view v-if="order.event_info" class="u-flex" @click="viewDetail(order)">
					<view class="u-mr-20" style="width:180rpx;height: 184rpx;">
						<up-lazy-load borderRadius="10" :image="
								  (order.event_info.background_image_url)  + '?x-oss-process=image/resize,w_180,h_180,m_fill'
								" mode="aspectFill" />
					</view>
					<view class="" style="width: 450rpx;">
						<view class="b u-mt-10 ellipsis2" style="font-size: 32rpx;">
							{{order.event_info.name}}
						</view>
						<view class="c9 u-mt-20 fs24" style="line-height: 1.2;">
							{{order.event_info.event_location}}
						</view>

						<view class="flex-between-center u-mt-10">
							<view v-if="order.sign_info_list" class="c9 fs24 ellipsis" style="max-width:380rpx;">
								报名人: {{order.sign_list}}
							</view>
							<view class="b" style="color: red;">
								<text style="font-size: 20rpx;">￥</text>{{order.amount_yuan}}
							</view>
						</view>
						
						<view v-if="!order.canRefund && order.status == 'SUCC'" class="c9 u-mt-10 fs24" style="">
							{{order.remainingTimeStr}}
						</view>
					</view>
				</view>
				<view class="flex-between-center van-hairline--top u-mt-20 u-pt-20">
					<view class="c9 fs24">
						创建时间:{{order.created_at}}
					</view>
					<view v-if="order.status == 'SUCC' && order.canRefund">
						<u-button type="primary" @click="refundOrder(order)" color="#FF8C00" customStyle="height: 50rpx;"
							size="small" plain shape="circle">
							申请退款
						</u-button>
					</view>
					<view v-if="order.status == 'PND'">
						<u-button type="primary" @click="payOrder(order)" color="#18b566" customStyle="height: 50rpx;" size="small"
							shape="circle">
							微信支付
						</u-button>
					</view>
				</view>
			</view>
		</view>
	</mescroll-body>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		onPageScroll,
		onReachBottom
	} from "@dcloudio/uni-app";
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const {
		mescrollInit,
		downCallback,
		getMescroll
	} = useMescroll(
		onPageScroll,
		onReachBottom
	);
	import request from "@/utils/request.js";
	import dayjs from "dayjs";

	const dataList = ref([]);

	// 响应式数据
	const tab = ref({
		active: 0,
		items: [
			{
				label: "全部订单",
				value: "",
			},
			{
				label: "已付款",
				value: "SUCC",
			},
			{
				label: "已退款",
				value: "RFUND",
			},
			{
				label: "已过期",
				value: "EXP",
			},
		],
	});
	
	const orderStatus = ref('')
	const changeTab = (detail) => {
		console.log(detail)
		orderStatus.value = detail.value;
		refreshList();
	};

	function setClipboardData(data) {
		uni.setClipboardData({
			data,
			success() {
				uni.$u.toast('订单号已复制')
			}
		});
	}

	const viewDetail = (item) => {
		uni.$u.route(`pagesSub/orderSuccess?order_no=${item.order_no}`);
	};

	function refundOrder(item) {
		uni.showModal({
			title: "提示",
			content: "确定申请退款吗？",
			success: (res) => {
				if (res.confirm) {
					const params = {
						"order_no": item.order_no,
						"reason": "用户申请退款",
						"refund_amount": item.amount
					}
					request.post(`/pay/wechat/refund `, params).then((res) => {
						uni.$u.toast(res.msg || res.message || "退款申请已提交");
						// 刷新列表
						refreshList();
					}).catch((err) => {
						uni.$u.toast(err.msg || err.message || "退款申请失败，请稍后重试");
					});
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	}

	const refreshList = () => {
		getMescroll().resetUpScroll(); // 重置列表数据为第一页
		getMescroll().scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
	};

	const getList = (mescroll) => {
		if (tab.value.active === 1) {
			dataList.value = [];
			uni.hideLoading();
			mescroll.endBySize(0, 0);
			return;
		}
		uni.showLoading({
			mask: true,
		});

		const data = {
			pageIndex: mescroll.num - 1,
			pageSize: 10,
			orderStatus: orderStatus.value,
		};
		
		
		let url = `/pay/order/list`
		if (orderStatus.value) {
			url = `/pay/order/statusByUser`
		}
		
		request.post(`/pay/order/list`, data).then((res) => {
				res = res.orders.map(item => {
					const sign_info_list = item.sign_info_list
					return {
						...item,
						...(getRefundInfo(item.created_at, item.refund_valid_hour || 24)),
						sign_list: sign_info_list?.map(i => i.full_name).join(',') || ''
					}
				})
				
				mescroll.endSuccess(res.length);

				//如果是第一页需手动制空列表
				if (mescroll.num == 1) {
					dataList.value = [];
				}

				dataList.value = dataList.value.concat(res); //追加新数据
			})
			.catch((error) => {
				uni.hideLoading();
				mescroll.endErr();
			});
	};
	
	function getRefundInfo(orderTime, endHour) {
		const orderDate = new Date(orderTime.replace(/-/g, '/'));
		const now = new Date();
		
		// 计算 endHour 小时后的截止时间（毫秒）
		const refundDeadline = new Date(orderDate.getTime() + endHour * 60 * 60 * 1000);
	
		// 是否还在退款时间内
		const canRefund = now < refundDeadline;
	
		let remainingTimeStr = '';
	
		if (canRefund) {
			const diffMs = refundDeadline - now;
	
			// 转换为小时和分钟
			const hours = Math.floor(diffMs / (1000 * 60 * 60));
			const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
	
			remainingTimeStr = `还剩 ${hours} 小时 ${minutes} 分钟可申请退款`;
		} else {
			remainingTimeStr = `已超过 ${endHour} 小时，无法退款`;
		}
	
		return {
			canRefund,
			refundDeadline,
			remainingTimeStr
		};
	}

	const payOrder = (item) => {
		const respay = item.payment_params;
		// 触发微信支付
		wx.requestPayment({
			timeStamp: respay.timeStamp,
			nonceStr: respay.nonceStr,
			package: respay.package,
			signType: respay.signType,
			paySign: respay.paySign,
			success: (res) => {
				uni.hideLoading();
				uni.$u.toast("支付成功");
				setTimeout(() => {
					refreshList()
					uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
				}, 300);
			},
			fail: (res) => {
				uni.hideLoading();
				console.log("res======>", res);
				uni.$u.toast("支付未完成");
				setTimeout(() => {
					// uni.navigateBack()
					uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
				}, 300);
			},
		});
	};

	defineOptions({
		options: {
			styleIsolation: "shared",
		},
	});
</script>

<style lang="scss" scoped>
	.order-no {
		font-size: 26rpx;

		.txt {
			background: #1989fa;
			border-radius: 99rpx;
			color: #fff;
			padding: 5rpx 10rpx;
			font-size: 20rpx;
		}

		.copy {
			width: 28rpx;
			height: 28rpx;
			margin-left: 5rpx;
			margin-top: -3rpx;
		}
	}

	.order-item {
		background: #ffffff;
		margin: 0rpx 34rpx 20rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid rgba(0, 0, 0, 0.06);
		padding: 24rpx 24rpx 20rpx;
		margin-bottom: 20rpx;

		.order-item-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 24rpx;
			margin-top: 24rpx;

			.order-item-info-name {
				font-weight: bold;
				font-size: 28rpx;
				color: #999999;

				.value {
					color: #000000;
				}
			}

			.order-item-info-status {
				::v-deep {
					.u-text__value {
						font-weight: bold !important;
						font-size: 28rpx !important;
					}
				}
			}
		}
	}

	.tab-container {
		background-color: #fafafa;
		position: fixed;
		width: 100%;
		z-index: 10;
		top: 0;
		margin: 0rpx auto 20rpx;
	}
</style>