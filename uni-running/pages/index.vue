<template>
	<view class="index-page">
		<view class="header">
			<view class="plaeholder" :style="{height: menuBtnInfo.placeholder} " ></view>
			<view class="search-box flex-start" :style="menuBtnInfo" @click="$u.route('pagesSub/runningTeam/teamList')">
				<u-icon name="search" size="24"></u-icon>
				<view class="u-ml-5">请输入名称或团号或地址</view>
			</view>
		</view>
		<scroll-view class="content" scroll-y :show-scrollbar="false" enhanced>
			<view class="container">
				<view class="section-banner">
					<swiper class="swiper" circular indicator-dots indicator-active-color="#FF8C00" :autoplay="true"
						:interval="3000">
						<swiper-item v-for="(item, index) in bannerList" :key="index">
							<image class="img" :src="item.image_url + '?x-oss-process=image/resize,w_700,h_350,m_fill'" mode="aspectFill" @click="clickSwiper(item)"></image>
						</swiper-item>
					</swiper>
				</view>
			</view>
			
			<HomeNavigator />

			<view class="section-title">
				<view class="section-title-left">线下活动</view>
				<view class="section-title-right" @click="$u.route('pagesSub/eventList')">
					<view class="section-title-right-item">查看更多</view>
					<u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
				</view>
			</view>
			<view class="category-tags">
				<view class="tags-inner">
					<view class="tag-slider" :style="getSliderStyle(eventCategoryIndex, 'event')"></view>
					<view
						v-for="(item, index) in eventCategoryList"
						:key="item.value"
						:id="'event-tag-' + index"
						class="tag-item"
						:class="{ active: eventCategoryIndex === index }"
						@click="onEventCategoryChange(index)"
					>
						{{ item.name }}
					</view>
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
			<section class="section-offline"  @click="$u.route('pagesSub/eventDetail')">
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
				<view class="section-title-left">全速俱乐部</view>
				<view class="section-title-right" @click="$u.route('pagesSub/runningTeam/teamList')">
					<view class="section-title-right-item">查看更多</view>
					<u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
				</view>
			</view>
			<view class="category-tags">
				<view class="tags-inner">
					<view class="tag-slider" :style="clubSliderStyle" :class="clubSliderAnimClass"></view>
					<view
						v-for="(item, index) in clubCategoryList"
						:key="item.value"
						:id="'club-tag-' + index"
						class="tag-item"
						:class="{ active: clubSliderPosition === index }"
						@click="onClubCategoryChange(index)"
					>
						{{ item.name }}
					</view>
				</view>
			</view>
			<section class="section-group" :class="['list-transition', listAnimationClass]"
			@touchstart="onClubTouchStart"
			@touchend="onClubTouchEnd">
				<GroupItem :item="item" v-for="(item, index) in GroupList" :key="index" />
				<view v-if="GroupList.length === 0 && !listAnimationClass" class="empty-state">
					<text>暂无俱乐部</text>
				</view>
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
			
			<view style="margin-top: 150rpx; padding: 0 34rpx; padding-bottom: calc(224rpx + env(safe-area-inset-bottom));">
				<u-divider text="已经到底了~"></u-divider>
			</view>
		</scroll-view>

		<tabbar type="index" />
		
		<UserLogin ref="refUserLogin" />
	</view>
</template>
<script setup>
	import {
		ref,
		onMounted,
		computed,
		nextTick
	} from "vue";
	import {
		onLoad,
		onShow,
		onPageScroll,
		onShareAppMessage,
		onShareTimeline
	} from "@dcloudio/uni-app";
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
	const refUserLogin = ref(null);

	const eventList = ref([]);
	const bannerEventList = ref([]);
	const bannerList = ref([]);
	const GroupList = ref([]);
	const onlineEventList = ref([]);

	// 分类 tag 数据
	const eventCategoryList = ref([
		{ name: '全部', value: 'all' },
		{ name: '跑步', value: 'running' },
		{ name: '骑行', value: 'cycling' }
	]);
	const eventCategoryIndex = ref(0);

	const clubCategoryList = ref([
		{ name: '我的', value: 'mine' },
		{ name: '全部', value: 'all' },
		{ name: '跑步', value: 'running' },
		{ name: '骑行', value: 'cycling' }
	]);
	const clubCategoryIndex = ref(0);

	// 列表切换动画状态
	const listAnimationClass = ref('');
	const slideDirection = ref('right'); // 'left' 或 'right'

	// 滑块动画状态
	const clubSliderAnimClass = ref('');
	const clubSliderPosition = ref(0); // 当前滑块显示的 index
	const clubSliderOffset = ref(0); // 额外偏移量（用于循环动画）
	const isClubTabSwitching = ref(false); // 防止动画重叠

	// 存储每个 tag 的位置信息 { width, left }
	const eventTagRects = ref([]);
	const clubTagRects = ref([]);
	const eventContainerLeft = ref(0);
	const clubContainerLeft = ref(0);

	// 全速俱乐部滑块样式（支持循环动画）
	const clubSliderStyle = computed(() => {
		const rects = clubTagRects.value;
		const containerLeft = clubContainerLeft.value;
		const activeIndex = clubSliderPosition.value;
		const offset = clubSliderOffset.value;
		if (!rects.length || activeIndex >= rects.length) return {};

		const rect = rects[activeIndex];
		const left = rect.left - containerLeft + offset;

		return {
			width: rect.width + 'px',
			transform: `translateX(${left}px)`
		};
	});

	// 获取滑块样式
	const getSliderStyle = (activeIndex, type) => {
		const rects = type === 'event' ? eventTagRects.value : clubTagRects.value;
		const containerLeft = type === 'event' ? eventContainerLeft.value : clubContainerLeft.value;
		if (!rects.length || activeIndex >= rects.length) return {};

		const rect = rects[activeIndex];
		// 计算相对于容器的偏移（需要减去容器的 left 和 padding 6rpx）
		const padding = 6 * (uni.getSystemInfoSync().windowWidth / 750); // rpx to px
		const left = rect.left - containerLeft;

		return {
			width: rect.width + 'px',
			transform: `translateX(${left}px)`
		};
	};

	// 获取 tag 宽度和位置
	const getTagWidths = () => {
		nextTick(() => {
			// 获取线下活动分类容器位置
			const eventContainerQuery = uni.createSelectorQuery();
			eventContainerQuery.select('#event-tag-0').boundingClientRect();
			eventContainerQuery.exec((res) => {
				if (res[0]) {
					eventContainerLeft.value = res[0].left;
				}
			});

			// 获取线下活动分类 tag 位置
			const eventQuery = uni.createSelectorQuery();
			eventQuery.selectAll('#event-tag-0, #event-tag-1, #event-tag-2').boundingClientRect();
			eventQuery.exec((res) => {
				if (res[0]) {
					eventTagRects.value = res[0].map(item => ({ width: item.width, left: item.left }));
				}
			});

			// 获取全速俱乐部分类容器位置
			const clubContainerQuery = uni.createSelectorQuery();
			clubContainerQuery.select('#club-tag-0').boundingClientRect();
			clubContainerQuery.exec((res) => {
				if (res[0]) {
					clubContainerLeft.value = res[0].left;
				}
			});

			// 获取全速俱乐部分类 tag 位置
			const clubQuery = uni.createSelectorQuery();
			clubQuery.selectAll('#club-tag-0, #club-tag-1, #club-tag-2, #club-tag-3').boundingClientRect();
			clubQuery.exec((res) => {
				if (res[0]) {
					clubTagRects.value = res[0].map(item => ({ width: item.width, left: item.left }));
				}
			});
		});
	};

	// 分类切换
	const onEventCategoryChange = (index) => {
		eventCategoryIndex.value = index;
	};

	// direction: 'left' 表示内容从左边进入，'right' 表示内容从右边进入
	// isLoop: 是否是循环切换（用于滑块动画）
	const onClubCategoryChange = (index, direction = null, isLoop = false) => {
		if (index === clubCategoryIndex.value || isClubTabSwitching.value) return;
		isClubTabSwitching.value = true;

		const maxIndex = clubCategoryList.value.length - 1;

		// 如果没有指定方向，根据 index 位置自动判断
		if (direction === null) {
			direction = index > clubCategoryIndex.value ? 'right' : 'left';
		}
		slideDirection.value = direction;

		// 触发列表滑出动画
		listAnimationClass.value = slideDirection.value === 'right' ? 'slide-out-left' : 'slide-out-right';

		// 处理滑块动画
		if (isLoop) {
			// 循环切换：滑块从目标位置的边缘滑入
			// 计算偏移量（从左侧或右侧进入）
			const slideOffset = direction === 'left' ? -60 : 60; // 左滑从左边进入，右滑从右边进入

			// 1. 隐藏滑块，禁用过渡
			clubSliderAnimClass.value = 'no-transition slider-hidden';
			// 2. 设置起始偏移位置
			clubSliderOffset.value = slideOffset;
			// 3. 更新目标位置
			clubSliderPosition.value = index;

			// 4. 等待 DOM 更新后，开始滑入动画
			setTimeout(() => {
				clubSliderAnimClass.value = ''; // 恢复过渡
				clubSliderOffset.value = 0; // 滑动到正确位置
			}, 30);
		} else {
			// 普通切换：滑块直接过渡
			clubSliderAnimClass.value = '';
			clubSliderOffset.value = 0;
			clubSliderPosition.value = index;
		}

		// slide-out 动画结束后切换数据
		setTimeout(() => {
			clubCategoryIndex.value = index;
			// 动画结束后清空旧数据，避免新数据加载前显示旧数据
			GroupList.value = [];
			// 数据加载完成后再触发滑入动画
			getGroupList(() => {
				listAnimationClass.value = slideDirection.value === 'right' ? 'slide-in-right' : 'slide-in-left';
				// 动画完成后解锁
				setTimeout(() => {
					isClubTabSwitching.value = false;
					listAnimationClass.value = '';
				}, 350);
			});
		}, 250);
	};

	// 全速俱乐部滑动切换相关
	const clubTouchStartX = ref(0);
	const clubTouchStartY = ref(0);

	const onClubTouchStart = (e) => {
		clubTouchStartX.value = e.touches[0].clientX;
		clubTouchStartY.value = e.touches[0].clientY;
	};

	const onClubTouchEnd = (e) => {
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;
		const deltaX = touchEndX - clubTouchStartX.value;
		const deltaY = touchEndY - clubTouchStartY.value;

		// 确保是水平滑动（水平距离大于垂直距离）且滑动距离超过阈值
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			const maxIndex = clubCategoryList.value.length - 1;
			// 左滑（手指从右往左）：内容从左边进入
			// 右滑（手指从左往右）：内容从右边进入
			const swipeDirection = deltaX < 0 ? 'left' : 'right';
			if (deltaX < 0) {
				// 左滑，切换到下一个 tab（循环到第一个）
				const nextIndex = clubCategoryIndex.value >= maxIndex ? 0 : clubCategoryIndex.value + 1;
				const isLoop = clubCategoryIndex.value >= maxIndex; // 从最后一个循环到第一个
				onClubCategoryChange(nextIndex, swipeDirection, isLoop);
			} else if (deltaX > 0) {
				// 右滑，切换到上一个 tab（循环到最后一个）
				const prevIndex = clubCategoryIndex.value <= 0 ? maxIndex : clubCategoryIndex.value - 1;
				const isLoop = clubCategoryIndex.value <= 0; // 从第一个循环到最后一个
				onClubCategoryChange(prevIndex, swipeDirection, isLoop);
			}
		}
	};

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
			token || userInfo.value.id
		);
		if (hasLogin) return true;

		openUserLogin();
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

		openUserLogin()
	});

	function openUserLogin () {
		// #ifdef MP-WEIXIN
		const envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
		if (!userInfo.value.id && envVersion === 'release') {
			nextTick(() => {
				refUserLogin.value.open();
			})
		}
		// #endif
	}

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
		getTagWidths();
	});

	// 方法定义
	const clickSwiper = (item) => {
		if (!ensureLogin()) return;

		if (item.id === '01KA8MPFAF0VBY1G35CVCNC1CW' || item.banner_id === '01KA8MPFAF0VBY1G35CVCNC1CW') {
			// 跳转到其他小程序
			uni.navigateToMiniProgram({
				appId: 'wx42a8cf3627cc70a5',
				path: '/pages/themes/t3/home/index?stage_code=xp6aC0kldn',
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
			uni.$u.route(`pagesSub/eventDetail?id=${item.event_id}&fsc_id=${item.fsc_id || ''}`);
			return;
		}
		if (item.redirect_url) {
			uni.$u.route(`pagesSub/settings/webView?link=${encodeURIComponent(item.redirect_url)}&title=${encodeURIComponent(item.description || '跑了没')}`);
			return;
		}
	};

	const routeTo = (link) => {
		console.log(link);
		uni.$u.route(link);
	};

	const getEvents = () => {
		Promise.all([request.get(`/event-api/fsc_swipers?status=ACT&visibility=public`), request.get(`/event-api/getOfflineEventSwiper`)]).then(res => {
			const list = res.flat();
			// dirty code: 将特定 swiper 标记为跑团活动
			const targetItem = list.find(item => item.id === '01KEH51YPXSHF4QRT5C82HZFH1');
			if (targetItem) targetItem.fsc_id = 'dirty';
			bannerEventList.value = list;
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
		
		Promise.all([request.get(`/event-api/fsc_swipers?status=ACT&visibility=public&is_top=1`), request.get(`/event-api/getTopSwiper`)]).then(res => {
			bannerList.value = res.flat();
		});
	};

	const getGroupList = (onComplete = null) => {
		const clubType = clubCategoryList.value[clubCategoryIndex.value].value;

		// "我的"tab：获取用户所属的俱乐部
		if (clubType === 'mine') {
			const groupId = userInfo.value.running_group;
			if (!groupId) {
				GroupList.value = [];
				if (onComplete) onComplete();
				return;
			}
			request.get(`/running-group/api/v1/groups/info?group_id=${groupId}`).then(res => {
				GroupList.value = res ? [res] : [];
				if (onComplete) onComplete();
			});
			return;
		}

		const data = {
			pageIndex: 0,
			pageSize: 5,
			keyword: "",
		};
		// 如果不是"全部"，则添加 club_type 过滤
		if (clubType !== 'all') {
			data.club_type = clubType;
		}
		request.get(`/running-group/api/v1/groups/list`, data).then(res => {
			GroupList.value = res.data;
			if (onComplete) onComplete();
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
			max-width: 640PX!important;
			color: #999;
			background: rgba(250,250,250, .7);
			z-index: 11;
			border-radius: 36rpx 36rpx 36rpx 36rpx;
			border: 2rpx solid #f58700;
		}
	}
	
	.index-page {
		background: #f5f5f5;
		height: 100vh;
		overflow: hidden;

		.content {
			background: #f5f5f5;
			height: 100vh;
		}

		.event-swiper {
			padding: 0 34rpx;
			height: 444rpx;
			background: #f5f5f5;

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
					font-weight: 400;
				}
			}
		}
	}

	.section-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		min-height: 900rpx;
		padding: 0 34rpx;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 900rpx;
		color: #999;
		font-size: 28rpx;
	}

	// 列表切换动画
	.list-transition {
		will-change: transform, opacity;
	}

	.slide-out-left {
		animation: slideOutLeft 0.25s ease-in forwards;
	}

	.slide-out-right {
		animation: slideOutRight 0.25s ease-in forwards;
	}

	.slide-in-left {
		animation: slideInLeft 0.3s ease-out forwards;
	}

	.slide-in-right {
		animation: slideInRight 0.3s ease-out forwards;
	}

	@keyframes slideOutLeft {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(-60rpx);
			opacity: 0;
		}
	}

	@keyframes slideOutRight {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(60rpx);
			opacity: 0;
		}
	}

	@keyframes slideInLeft {
		from {
			transform: translateX(-60rpx);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideInRight {
		from {
			transform: translateX(60rpx);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.category-tags {
		padding: 0 34rpx;
		margin-bottom: 20rpx;

		.tags-inner {
			display: inline-flex;
			position: relative;
			gap: 20rpx;
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

			// 滑块循环动画
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
			padding: 12rpx 28rpx;
			font-size: 28rpx;
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

</style>
