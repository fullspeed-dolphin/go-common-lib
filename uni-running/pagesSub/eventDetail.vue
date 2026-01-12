<template>
	<u-navbar :title="null" bgColor="transparent"></u-navbar>
	
	<view class="pb30" style="background: #f5f5f5" :class="{
      isFixedNavbar: isFixedNavbar,
      isLoadedPage: isLoadedPage,
    }">
		<view class="event-status flex-center" v-if="detail.status === 'ACT'">
			活动进行中
		</view>

		<section style="padding: 0; overflow: hidden; height: 750rpx">
			<image class="img" :src="detail.background_image_url + '?x-oss-process=image/resize,w_700,h_700,m_fill'"
				mode="aspectFill" style="width: 100%; display: block; height: 100%"></image>
		</section>

		<view class="container">
			<section class="section-event panel bgf" style="position: relative; z-index: 10">
				<view class="h2">
					<view class="ellipsis2">
						{{ detail.name }}
					</view>
				</view>

				<view class="panel-item">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-time@2x.png'" mode="aspectFill"></image>
						<text>报名时间：</text>
					</view>
					<view class="value">{{ detail.registration_time }}</view>
				</view>

				<view class="panel-item">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-date@2x.png'" mode="aspectFill"></image>
						<text>活动开始时间：</text>
					</view>
					<view class="value">{{
            dayjs(detail.event_time).format("YYYY-MM-DD HH:mm")
          }}</view>
				</view>
				<view class="panel-item">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-location@2x.png'" mode="aspectFill"></image>
						<text>活动地点：</text>
					</view>
					<view class="value" @click="copyText(detail.event_location)">{{
            detail.event_location
          }}</view>
				</view>

				<view class="cell flex-row1 pl20">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-item@2x.png'" mode="aspectFill"></image>
						<text>活动项目：</text>
					</view>
					<view class="flex-row flex-wrap">
						<view class="event-item flex-center" v-for="(item, index) in detail.eventItems" :key="index">
							{{ item }}
						</view>
					</view>
				</view>

				<view class="cell flex-start pl20 customer-phone">
					<view class="label">联系电话：</view>
					<view class="value flex-start">
						<view style="color: #43a047; margin-right: 10rpx" @click="callPhone(detail.contact)">{{detail.contact}}</view>
					</view>
					<u-button type="primary" color="#43A047" shape="circle" size="mini" @click="copyText(detail.contact)"
						class="copy-btn"
						customStyle="min-width: 76rpx; width: 76rpx;height: 34rpx; padding: 0; margin-left: 20rpx; font-weight: bold;font-size: 24rpx;color: #FFFFFF;">
						复制
					</u-button>
				</view>
			</section>

			<section class="panel" style="padding: 20rpx 0 0">
				<view class="cell event-description" style="margin-top: 0">
					<view class="label" style="font-size: 28rpx">活动说明：</view>
				</view>
				<rich-text :nodes="detail.text"></rich-text>
			</section>

			<view class="section-bottom1">
				<!-- <view class="txt">
				  {{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			  </view> -->
				<view class="u-border-top1" :class="{ isSignUp: isSignUp }">
					<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;" @click="routeTo()">
						<block v-if="detail.status === 'ACT'">{{
              isSignUp ? "取消报名" : "活动报名"
            }}</block>
						<block v-if="detail.status === 'PND'">活动暂未开始</block>
						<block v-if="detail.status === 'EXP'">查看报名详情</block>
					</u-button>
				</view>
			</view>
		</view>

		<button class="share-btn flex-center" :class="{ active: isScroll }" open-type="share">
			<u-icon name="share" color="#fff" size="18"></u-icon>
		</button>

		<PhoneLogin ref="refPhoneLogin" />
	</view>
</template>
<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		staticBaseUrl
	} from "@/utils/config.js";
	import {
		onLoad,
		onUnload,
		onPageScroll,
		onShareAppMessage,
		onShareTimeline,
	} from "@dcloudio/uni-app";
	import {
		useStore
	} from "vuex";
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
	import dayjs from "dayjs";
	import request from "@/utils/request.js"

	const store = useStore();

	// 模板引用
	const refPhoneLogin = ref(null);

	// 响应式数据
	const isScroll = ref(false);
	const isSignUp = ref(false);
	const detail = ref({});
	const isFixedNavbar = ref(true);
	const isLoadedPage = ref(false);
	const routerParams = ref({});

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// 定时器
	let timer = null;

	// 页面加载
	onLoad((options) => {
		// #ifdef MP-WEIXIN
		// 启用分享给好友和分享到朋友圈
		// 实现了 onShareTimeline 后，微信会自动在右上角菜单显示"分享到朋友圈"选项
		wx.showShareMenu({
			withShareTicket: true,
		});
		// #endif

		routerParams.value = options;
		getDetail();
	});

	// 页面卸载
	onUnload(() => {
		isLoadedPage.value = false;
		uni.removeStorageSync("eventDetail");
	});
	
	const navBarBg = ref('transparent');
	onPageScroll((e) => {
		isFixedNavbar.value = parseInt(e.scrollTop) < 30;

		isScroll.value = true;

		clearTimeout(timer);
		timer = setTimeout(() => {
			isScroll.value = false;
		}, 100);
		
		if (e.scrollTop  >= 5) {
		  navBarBg.value = "#ffffff";
		} else {
		  navBarBg.value = 'transparent';
		}
	});

	// 分享给好友
	onShareAppMessage(() => {
		return {
			title: detail.value.name || "活动详情", // 分享标题
			path: `/pagesSub/eventDetail?id=${routerParams.value.id}`, // 分享路径
			imageUrl: detail.value.background_image_url || "", // 分享时显示的封面图
		};
	});

	// 分享到朋友圈
	onShareTimeline(() => {
		return {
			title: detail.value.name || "活动详情", // 分享标题
			query: `id=${routerParams.value.id}`, // 分享参数
			imageUrl: detail.value.background_image_url || "", // 分享时显示的封面图
		};
	});

	// 方法定义
	const getDetail = () => {
		const eventDetail = uni.getStorageSync("eventDetail");
		if (eventDetail) {
			detail.value = eventDetail;
		}

		uni.showLoading({
			mask: true,
		});
		let url = routerParams.value.fsc_id ? '/event-api/fsc_events/' : '/event-api/api/v1/events/';
		request.get(`${url}${routerParams.value.id}`)
			.then((res) => {
				res.text = `<img src="${res.long_image_url}?x-oss-process=image/resize,w_500" style="max-width:100%;" />`;
				res.eventItems = res.event_projects.split("、");
				
				try {
					const list = JSON.parse(res.registration_time)
					res.registration_time = `${dayjs(list[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(list[1]).format('YYYY-MM-DD HH:mm').slice(5)}`
				} catch (e) {
					console.error(e)
				}
				// test
				// res.status = "ACT";
				console.log("res", res);

				detail.value = res;

				isLoadedPage.value = true;
			});
	};

	const routeTo = () => {
		if (!userInfo.value.id) {
			return refPhoneLogin.value.open();
		}

		if (detail.value.status === "EXP" && !!detail.value.event_detail_url) {
			uni.$u.route(
				`pagesSub/settings/webView?link=${detail.value.event_detail_url}`
			);
			return;
		}

		if (detail.value.status !== "ACT") {
			return uni.$u.toast("活动无效");
		}

		if (isSignUp.value) {
			cancelSignUp();
			return false;
		}
		uni.$u.route("pagesSub/orderIn?event_id=" + routerParams.value.id);
	};

	const cancelSignUp = () => {
		uni.showModal({
			title: "提示",
			content: "确定取消报名吗？",
			success: (res) => {
				if (res.confirm) {
					
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	const copyText = (txt) => {
		uni.setClipboardData({
			data: String(txt),
		});
	};

	const callPhone = (phoneNumber) => {
		uni.makePhoneCall({
			phoneNumber,
		});
	};
</script>

<style lang="less" scoped>
	.share-btn {
		position: fixed;
		right: 20rpx;
		bottom: 200rpx;
		width: 90rpx;
		height: 90rpx;
		border-radius: 200rpx;
		color: #fff;
		z-index: 20;
		border: 1px solid #18b566;
		background-color: #18b566 !important;
		margin-bottom: 20rpx !important;
		flex-direction: column;
		font-size: 20rpx;
		box-shadow: 0px 0px 6rpx rgba(0, 0, 0, 0.4);
		transition: transform 0.3s;

		&:after {
			display: none;
		}

		&.active {
			transform: translate(100rpx);
		}
	}

	.event-item {
		color: #fff;
		background: #f66761;
		padding: 18rpx 26rpx;
		margin: 20rpx 20rpx 0rpx 0;
		border-radius: 16rpx;
		font-size: 32rpx;
	}

	.panel-item {
		padding: 18rpx 14rpx;
		margin-top: 20rpx;
		background: #f6fafb;
		border-radius: 16rpx;

		.label {
			margin-bottom: 10rpx;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
			display: flex;
			align-items: center;

			.icon {
				width: 44rpx;
				height: 44rpx;
				margin-right: 10rpx;
			}
		}

		.value {
			font-weight: bold;
			font-size: 28rpx;
			color: #000000;
			line-height: 40rpx;
		}
	}

	.offlineEvents {
		padding: 34rpx;
	}

	.panel {
		margin: 30rpx auto;
		padding: 20rpx;
		border-radius: 26rpx;
		box-shadow: unset;
		background: #fff;
	}

	.h2 {
		font-weight: 600;
		font-size: 34rpx;
		text-align: center;
		line-height: 1.4;
	}

	.cell {
		margin-top: 20rpx;
		font-size: 24rpx;
		line-height: 34rpx;

		.label {
			min-width: 120rpx;
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
			line-height: 40rpx;

			.icon {
				width: 44rpx;
				height: 44rpx;
				margin-right: 10rpx;
			}
		}
	}

	.customer-phone {
		display: flex;
		align-items: center;

		.label {
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
		}
	}

	.event-description {
		.label {
			padding: 16rpx 20rpx 14rpx 20rpx;
		}
	}

	.section-bottom1 {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		z-index: 10;
		padding: 48rpx 54rpx;
		transform: translateY(100%);

		.txt {
			font-size: 24rpx;
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}

	.section-event {
		transform: translateY(0%);
		// margin-top: -110rpx;
	}

	.isLoadedPage {
		.section-bottom1 {
			// transition: transform 0.5s;
			// transform: translateY(0%);
			animation: slideIn 0.5s 0.5s forwards;
		}

		.section-event {
			transition: margin 0.5s;
			// transform: translateY(-100rpx);
			margin-top: -100rpx;
		}
	}

	::v-deep {
		.isSignUp {
			.u-button {
				color: #ff8c00;
				background: #f2f2f2;
				border-color: #f2f2f2;
			}
		}

		.isFixedNavbar {
			.up-navbar--fixed {
				background: none !important;

				.navbar-badge {
					background: #fff;
				}
			}
		}
	}

	.event-status {
		position: absolute;
		top: 200rpx;
		right: 0rpx;
		z-index: 2;
		background: rgba(25, 190, 107, .8);
		color: #fff;
		border-radius: 99rpx 0 0 99rpx;
		padding: 20rpx 30rpx;
	}

	@keyframes slideIn {
		0% {
			transform: translateY(100%);
			opacity: 0;
		}

		50% {
			transform: translateY(10px);
		}

		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>