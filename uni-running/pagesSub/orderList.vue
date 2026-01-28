<template>
	<view class="page">
		<!-- 分类标签 -->
		<view class="tab-container">
			<view class="category-tags">
				<view class="tags-inner">
					<view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
					<view
						v-for="(item, index) in tabList"
						:key="item.value"
						:id="'tab-' + index"
						class="tag-item"
						:class="{ active: currentIndex === index }"
						@click="handleTabChange(item, index)"
					>
						{{ item.label }}
					</view>
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-wrapper"
			@touchstart="onTouchStart"
			@touchend="handleTouchEnd">
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="0">
				<view class="order-list" :class="['list-transition', listAnimClass]">
					<view class="order-item" v-for="(order, index) in filteredList" :key="order.order_no || index">
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
					<view v-if="filteredList.length === 0 && !listAnimClass" class="empty-state">
						<text>暂无订单</text>
					</view>
				</view>
			</mescroll-body>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	computed,
	watch
} from "vue";
import {
	onLoad,
	onShow,
	onPageScroll,
	onReachBottom
} from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import { useTabAnimation } from "@/composables/useTabAnimation.js";
import request from "@/utils/request.js";
import { useShare } from "@/composables/useShare.js";

// 分享配置
useShare({
	title: '我的订单',
	path: '/pagesSub/orderList'
});

const {
	mescrollInit,
	downCallback,
	getMescroll
} = useMescroll(onPageScroll, onReachBottom);

// Tab 配置
const tabList = ref([
	{ label: "全部", value: "" },
	{ label: "已付款", value: "SUCC" },
	{ label: "已退款", value: "RFUND" },
	{ label: "已过期", value: "EXP" },
]);

// 使用 Tab 动画 composable
const {
	currentIndex,
	sliderStyle,
	sliderAnimClass,
	listAnimClass,
	changeTab,
	initTabRects,
	onTouchStart,
	onTouchEnd
} = useTabAnimation({
	tabCount: tabList.value.length,
	loop: true
});

// 当前选中的 tab
const curTab = computed(() => tabList.value[currentIndex.value]);

// 数据
const dataList = ref([]);

// 列表数据（后端已根据 status 过滤，无需前端再过滤）
const filteredList = computed(() => dataList.value);

// Tab 切换处理
const handleTabChange = (item, index) => {
	if (currentIndex.value === index) return;
	changeTab(index);
};

// 监听 tab 切换，重新加载数据
watch(currentIndex, () => {
	// 立即清空旧数据，避免切换时显示旧 tab 的数据
	dataList.value = [];
	setTimeout(() => {
		refreshList();
	}, 300);
});

// 手势切换处理
const handleTouchEnd = (e) => {
	onTouchEnd(e, tabList.value);
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
					refreshList();
				}).catch((err) => {
					uni.$u.toast(err.msg || err.message || "退款申请失败，请稍后重试");
				});
			}
		},
	});
}

const refreshList = () => {
	getMescroll().resetUpScroll();
	getMescroll().scrollTo(0, 0);
};

const getList = (mescroll) => {
	uni.showLoading({ mask: true });

	const data = {
		pageIndex: mescroll.num - 1,
		pageSize: 10,
	};

	// 如果选中了具体状态，传给后端过滤
	const status = curTab.value.value;
	if (status) {
		data.orderStatus = status;
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

		if (mescroll.num == 1) {
			dataList.value = [];
		}

		dataList.value = dataList.value.concat(res);
	})
	.catch((error) => {
		uni.hideLoading();
		mescroll.endErr();
	});
};

function getRefundInfo(orderTime, endHour) {
	const orderDate = new Date(orderTime.replace(/-/g, '/'));
	const now = new Date();
	const refundDeadline = new Date(orderDate.getTime() + endHour * 60 * 60 * 1000);
	const canRefund = now < refundDeadline;

	let remainingTimeStr = '';

	if (canRefund) {
		const diffMs = refundDeadline - now;
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
			uni.$u.toast("支付未完成");
			setTimeout(() => {
				uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
			}, 300);
		},
	});
};

onLoad(() => {
	initTabRects();
});

onShow(() => {
	initTabRects();
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
@import '@/styles/tab-animation.scss';

.page {
	min-height: 100vh;
	background: #f5f5f5;
}

.tab-container {
	background-color: #f5f5f5;
	position: fixed;
	width: 100%;
	z-index: 10;
	top: 0;
	padding: 16rpx 24rpx;
}

.category-tags {
	.tags-inner {
		display: inline-flex;
		position: relative;
		gap: 12rpx;
		padding: 6rpx;
		background: #fff;
		border-radius: 999rpx;
	}

	.tag-slider {
		position: absolute;
		top: 6rpx;
		left: 6rpx;
		height: calc(100% - 12rpx);
		background: #FF8C00;
		border-radius: 999rpx;
		transition: transform 0.3s ease-out, width 0.3s ease-out;
		z-index: 0;

		&.no-transition {
			transition: none !important;
		}

		&.slider-hidden {
			opacity: 0;
		}
	}

	.tag-item {
		position: relative;
		z-index: 1;
		padding: 12rpx 24rpx;
		font-size: 26rpx;
		color: #666;
		line-height: 40rpx;
		white-space: nowrap;
		transition: color 0.3s ease;

		&.active {
			color: #fff;
			font-weight: bold;
		}
	}
}

.content-wrapper {
	padding-top: 100rpx;
}

.order-list {
	padding: 16rpx 0;
}

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
	border-radius: 16rpx;
	border: 2rpx solid rgba(0, 0, 0, 0.06);
	padding: 24rpx 24rpx 20rpx;

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

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
	color: #999;
	font-size: 28rpx;
}
</style>
