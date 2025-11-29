<template>
	<view class="index-page">
		<view class="header">
			<view class="plaeholder" :style="{height: menuBtnInfo.placeholder} " ></view>
			<view class="search-box flex-start" :style="menuBtnInfo" @click="$u.route('pagesSub/groupList')">
				<u-icon name="search" size="24"></u-icon>
				<view class="ml5">请输入名称或团号或地址</view>
			</view>
		</view>
		<view class="content">
			<view class="container">
				<view class="section-banner">
					<swiper class="swiper" circular indicator-dots indicator-active-color="#FF8C00" :autoplay="true"
						:interval="3000">
						<swiper-item v-for="(item, index) in bannerList" :key="index">
							<image class="img" :src="item.image_url" mode="aspectFill" @click="clickSwiper(item)"></image>
						</swiper-item>
					</swiper>
				</view>
			</view>
			
			<HomeNavigator />

			<view class="section-title">
				<view class="section-title-left">线下活动</view>
				<view class="section-title-right" @click="$u.route('pagesSub/orderList')">
					<view class="section-title-right-item">查看更多</view>
					<u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
				</view>
			</view>
			<swiper class="event-swiper" circular indicator-active-color="#FF8C00" :autoplay="true" :interval="3000"
				:display-multiple-items="1.2">
				<swiper-item v-for="(item, index) in bannerEventList" :key="index">
					<view class="event-swiper-item">
						<EventItem :item="item" :key="index" height="474rpx" />
					</view>
				</swiper-item>
			</swiper>

			<view class="section-title" v-if="onlineEventList && onlineEventList.length > 0">
				<view class="section-title-left">线上赛事</view>
				<view class="section-title-right">
					<view class="section-title-right-item">查看更多</view>
					<u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
				</view>
			</view>
			<swiper class="event-swiper" circular indicator-active-color="#FF8C00" :autoplay="true" :interval="3000"
				:next-margin="126" v-if="onlineEventList && onlineEventList.length > 0">
				<swiper-item v-for="(item, index) in onlineEventList" :key="index">
					<view class="event-swiper-item">
						<EventItem :item="item" :key="index" height="474rpx" />
					</view>
				</swiper-item>
			</swiper>

			<!-- <view class="section-title">线上赛事</view>
			<section class="section-offline"  @click="$u.route('pagesSub/offlineEvents')">
				<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				<view class="flex-start">
					<view class="text">
						<view class="name ellipsis">奔跑吧！广州·增城站奔跑吧！广州·增城站广州·增城站</view>
						<view class="time">2025.10.26 8:00</view>
					</view>
					<u-button type="primary" size="small" shape="circle" disabled color="#f4f4f4" text="未开始"></u-button>
				</view>
			</section> -->

			<view class="section-title">
				<view class="section-title-left">跑团风采</view>
				<view class="section-title-right" @click="$u.route('pagesSub/groupList')">
					<view class="section-title-right-item">查看更多</view>
					<u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<GroupItem :item="item" v-for="(item, index) in GroupList" :key="index" />
			</section>

			<!-- <view class="section-title flex-between-center">
				名人达人
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<view class="group-item flex-start" v-for="(item,index) in 3" :key="index">
					<image class="poster radius999" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
					<view class="text">
						<view class="flex-between-center" style="width: 520rpx;">
							<view class="">
								<view class="name ellipsis">昵称</view>
								<view class="city ellipsis">广东广州</view>
							</view>
							<u-button type="primary" size="small" shape="circle" text="关注"></u-button>
						</view>
						<view class="desc ellipsis" style="color:#333;">全国跑友一家亲，SEA跑团来相聚。生命不息，跑···</view>
					</view>
				</view>
			</section> -->
		</view>

		<tabbar type="index" />
		
		<UserLogin ref="refUserLogin" />
	</view>
</template>
<script setup>
	import {
		ref,
		onMounted,
		computed
	} from "vue";
	import {
		onLoad,
		onShow,
		onPageScroll,
		onShareAppMessage,
		onShareTimeline
	} from "@dcloudio/uni-app";
	import {
		getCurrentInstance
	} from "vue";
	import {
		useStore
	} from "vuex";
	import tabbar from "@/components/tabBar.vue";
	import GroupItem from "@/components/GroupItem.vue";
	import HomeNavigator from "@/components/HomeNavigator.vue";
	import EventItem from "@/components/EventItem.vue";
	import UserLogin from "@/components/UserLogin.vue";
	import request from "@/utils/request.js"
	import {
		staticBaseUrl
	} from "@/utils/config";

	// 使用store
	const store = useStore();

	const eventList = ref([]);
	const bannerEventList = ref([]);
	const bannerList = ref([]);
	const GroupList = ref([]);
	const onlineEventList = ref([]);
	const refUserLogin = ref(null);

	// 计算属性
	const menuBtnInfo = computed(() => {
		const menuBtn = uni?.getMenuButtonBoundingClientRect?.() || {};
		
		return {
			top: (menuBtn.top - 1) + 'px',
			height: menuBtn.height + 1 + 'px',
			width: menuBtn.left - 30 + 'px',
			placeholder: menuBtn.top + menuBtn.height + 10 + 'px'
		}
	});
	
	const userInfo = computed(() => store.state.userInfo);

	const ensureLogin = () => {
		const token = uni.getStorageSync("token");
		const hasLogin = !!(
			token || (userInfo.value && Object.keys(userInfo.value).length)
		);
		if (hasLogin) return true;

		refUserLogin.value?.open();
		return false;
	};

	// 页面加载
	onLoad((options) => {
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline'] // 开启分享给朋友和分享到朋友圈
		});
		// #endif
	});

	// 分享给朋友
	onShareAppMessage(() => {
		return {
			title: '跑了没 - 跑，一切活力的泉源',
			path: '/pages/index',
			imageUrl: '', // 可以设置自定义分享图片，留空则使用当前页面截图
		};
	});

	// 分享到朋友圈
	onShareTimeline(() => {
		return {
			title: '跑了没 - 跑，一切活力的泉源',
			query: '', // 可以携带参数
			imageUrl: '', // 可以设置自定义分享图片
		};
	});

	// 页面显示
	onShow(() => {
		getGroupList();
		getEvents();
		getBannerList();
		getOnlineEvents();
	});

	// 方法定义
	const clickSwiper = (item) => {
		if (!ensureLogin()) return;

		// 判断是否是特定的轮播图，跳转到其他小程序
		// 注意：这里假设后端返回的数据中有 id 或 banner_id 字段
		// 如果字段名不同，请修改 item.id 为实际的字段名
		if (item.id === '01KA8MPFAF0VBY1G35CVCNC1CW' || item.banner_id === '01KA8MPFAF0VBY1G35CVCNC1CW') {
			// 跳转到其他小程序
			uni.navigateToMiniProgram({
				appId: 'wx42a8cf3627cc70a5',
				path: '/pages/themes/t3/home/index?stage_code=xp6aC0kldn', // ⚠️ 这里需要替换为实际的页面路径
				extraData: {},
				envVersion: 'release', // 正式版：release，开发版：develop，体验版：trial
				success: res => {
					console.log('跳转成功', res);
				},
				fail: (err) => {
					console.error('跳转失败', err);
					uni.showToast({
						title: '跳转失败',
						icon: 'none',
						duration: 2000
					});
				}
			});
			return;
		}

		if (item.event_id) {
			uni.$u.route(`pagesSub/offlineEvents?id=${item.event_id}`);
			return;
		}
		if (item.redirect_url) {
			uni.$u.route(`pagesSub/settings/webView?link=${item.redirect_url}`);
			return;
		}
	};

	const routeTo = (link) => {
		console.log(link);
		uni.$u.route(link);
	};

	const getEvents = () => {
		request.get(`/event-api/getOfflineEventSwiper`).then(res => {
			bannerEventList.value = res;
		});
	};

	const getOnlineEvents = () => {
		request.get(`/event-api/getOnlineEventSwiper`).then(res => {
			onlineEventList.value = res;
		});
	};

	const getBannerList = () => {
		if (!bannerList.value.length) {
			uni.showLoading({
				mask: true
			});
		}

		request.get(`/event-api/getTopSwiper`).then(res => {
			bannerList.value = res;
		});
	};

	const getGroupList = () => {
		const data = {
			pageIndex: 0,
			pageSize: 5,
			keyword: "",
		};
		request.get(`/running-group/api/v1/groups/list`, data).then(res => {
			GroupList.value = res.data;
		});
	};
</script>

<style lang="less" scoped>
	.header {
		.search-box {
			position: fixed;
			top: 100rpx;
			left: 30rpx;
			width: 100%;
			padding: 0 20rpx;
			color: #999;
			background: rgba(250,250,250, .7);
			z-index: 11;
			border-radius: 36rpx 36rpx 36rpx 36rpx;
			border: 2rpx solid #f58700;
			box-sizing: border-box;
	
			::v-deep {
				.u-search__content {
				}
			}
		}
	}
	
	.index-page {
		.content {
			background: #fafafa;
		}

		.event-swiper {
			padding: 0 34rpx;
			height: 474rpx;
			background: #fafafa;

			.event-swiper-item {
				padding-right: 20rpx;
			}
		}

		.radius999 {
			border-radius: 999em !important;
		}

		.section-offline {
			.poster {
				display: block;
				width: 100%;
				height: 270rpx;
				background: #f5f5f5;
				border-radius: 16rpx 16rpx 16rpx 16rpx;
			}

			.text {
				padding: 20rpx 16rpx;

				.name {
					line-height: 40rpx;
					margin-bottom: 10rpx;
				}

				.time {
					line-height: 28rpx;
					font-size: 20rpx;
				}
			}

			// ::v-deep {
			//   .u-button--disabled {
			//     color: #707070!important;
			//   }
			// }
		}

		.section-banner {
			min-height: 344rpx;
			width: 100%;
			margin: 0 auto;
			border-radius: 16rpx !important;
			overflow: hidden;

			.swiper {
				height: 344rpx;
			}

			.img {
				display: block;
				width: 100%;
				height: 344rpx;
				border-radius: 16rpx !important;
				overflow: hidden;
			}
		}

		.section-title {
			margin: 40rpx 0 30rpx 0;
			padding: 0 34rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
			font-weight: 800;
			font-size: 36rpx;
			color: #000000;
			line-height: 48rpx;

			.txt {
				font-size: 28rpx;
				font-weight: 400;
			}

			.section-title-right {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 10rpx;

				.section-title-right-item {
					font-size: 28rpx;
					color: #ff8c00;
				}
			}
		}
	}

	.section-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
</style>