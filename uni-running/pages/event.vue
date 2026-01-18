<template>
	<view class="page-wrapper">
		<view class="event-page">
			<!-- 顶部导航 -->
			<view class="header">
				<view class="placeholder" :style="{ height: statusBarHeight + 'px' }"></view>
				<view class="nav-bar">
					<text class="nav-title">全速俱乐部活动</text>
				</view>
			</view>

			<!-- 分类标签 -->
			<view class="tab-bar-wrapper" :style="{ top: (statusBarHeight + 44) + 'px' }">
				<view class="tab-bar">
					<view class="tags-inner">
						<!-- 滑块 -->
						<view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
						<!-- Tab 项 -->
						<view class="tag-item" id="tab-0" :class="{ active: sliderPosition === 0 }" @click="onTabChange('running', 0)">跑步</view>
						<view class="tag-item" id="tab-1" :class="{ active: sliderPosition === 1 }" @click="onTabChange('cycling', 1)">骑行</view>
					</view>
				</view>
			</view>

			<!-- 内容区域 -->
			<view class="content" :style="{ paddingTop: (statusBarHeight + 44 + 52) + 'px' }"
				@touchstart="onTouchStart"
				@touchend="onTouchEnd">
				<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="loadData" :up="upOption" :top="0" :bottom="200" :safearea="true">
					<!-- 活动列表 -->
					<view class="activity-list list-transition" :class="listAnimationClass" v-if="filteredList.length > 0">
						<view class="activity-card" v-for="item in filteredList" :key="item.id" @click="goDetail(item)">
							<!-- 左侧图片 -->
							<view class="card-image">
								<image :src="item.background_image_url + '?x-oss-process=image/resize,w_400'" mode="aspectFill" />
								<view class="card-tag">报名中</view>
							</view>
							<!-- 右侧内容 -->
							<view class="card-info">
								<text class="card-title">{{ item.name }}</text>
								<view class="info-row">
									<u-icon name="tags-fill" size="24rpx" color="#FF8C00" />
									<text>{{ item.fsc_name }}</text>
								</view>
								<view class="info-row">
									<u-icon name="map-fill" size="24rpx" color="#FF8C00" />
									<text>{{ item.event_location }}</text>
								</view>
								<view class="info-row">
									<u-icon name="calendar-fill" size="24rpx" color="#FF8C00" />
									<text>{{ formatTime(item.event_time) }}</text>
								</view>
								<!-- 底部人数 -->
								<view class="card-footer">
									<u-icon name="account-fill" size="24rpx" color="#FF8C00" />
									<text class="capacity-text">{{ item.capacity }}人</text>
								</view>
							</view>
						</view>
					</view>
				</mescroll-body>
			</view>
		</view>
		<tabbar type="event" />
	</view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { onLoad, onShow, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import tabbar from "@/components/tabBar.vue";

const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

// mescroll 上拉加载配置
const upOption = {
	empty: {
		use: true,
		icon: 'https://www.mescroll.com/img/mescroll-empty.png'
	}
};

// 状态栏高度
const statusBarHeight = ref(0);

// 分类筛选，默认跑步
const selectedType = ref('running');

// Tab 切换动画相关
const slideDirection = ref('');
const listAnimationClass = ref('');

// 滑块动画状态
const sliderAnimClass = ref('');
const sliderPosition = ref(0); // 0 = running, 1 = cycling
const sliderOffset = ref(0);
const isTabSwitching = ref(false);

// 存储 tab 位置信息
const tabRects = ref([]);
const tabContainerLeft = ref(0);

// 滑块位置计算（动态）
const sliderStyle = computed(() => {
	const index = sliderPosition.value;
	if (!tabRects.value.length || index >= tabRects.value.length) return {};

	const rect = tabRects.value[index];
	const left = rect.left - tabContainerLeft.value + sliderOffset.value;

	return {
		width: rect.width + 'px',
		transform: `translateX(${left}px)`
	};
});

// 获取 tab 宽度和位置
const getTabWidths = () => {
	nextTick(() => {
		// 获取容器基准位置
		const containerQuery = uni.createSelectorQuery();
		containerQuery.select('#tab-0').boundingClientRect();
		containerQuery.exec((res) => {
			if (res[0]) {
				tabContainerLeft.value = res[0].left;
			}
		});

		// 获取所有 tab 位置
		const query = uni.createSelectorQuery();
		query.selectAll('#tab-0, #tab-1').boundingClientRect();
		query.exec((res) => {
			if (res[0]) {
				tabRects.value = res[0].map(item => ({ width: item.width, left: item.left }));
			}
		});
	});
};

// Tab 切换处理（带动画）
// index: tab 的索引，direction: 'left' 或 'right'，isLoop: 是否为循环切换
const onTabChange = (type, index, direction = null, isLoop = false) => {
	if (type === selectedType.value || isTabSwitching.value) return;
	isTabSwitching.value = true;

	// 如果没有指定方向，根据 tab 位置自动判断
	if (direction === null) {
		direction = index > sliderPosition.value ? 'right' : 'left';
	}
	slideDirection.value = direction;

	// 列表滑出动画
	listAnimationClass.value = slideDirection.value === 'right' ? 'slide-out-left' : 'slide-out-right';

	// 滑块动画
	if (isLoop) {
		// 循环切换时，使用 offset 实现从边缘滑入效果
		const slideOffsetValue = direction === 'left' ? -60 : 60;
		sliderAnimClass.value = 'no-transition slider-hidden';
		sliderOffset.value = slideOffsetValue;
		sliderPosition.value = index;

		setTimeout(() => {
			sliderAnimClass.value = '';
			sliderOffset.value = 0;
		}, 30);
	} else {
		// 普通切换，正常过渡
		sliderAnimClass.value = '';
		sliderOffset.value = 0;
		sliderPosition.value = index;
	}

	// 切换数据
	setTimeout(() => {
		selectedType.value = type;
		// 滑入动画
		listAnimationClass.value = slideDirection.value === 'right' ? 'slide-in-right' : 'slide-in-left';

		setTimeout(() => {
			isTabSwitching.value = false;
			listAnimationClass.value = '';
		}, 350);
	}, 250);
};

// 滑动切换相关
const touchStartX = ref(0);
const touchStartY = ref(0);
const tabTypes = ['running', 'cycling'];

const onTouchStart = (e) => {
	touchStartX.value = e.touches[0].clientX;
	touchStartY.value = e.touches[0].clientY;
};

const onTouchEnd = (e) => {
	const touchEndX = e.changedTouches[0].clientX;
	const touchEndY = e.changedTouches[0].clientY;
	const deltaX = touchEndX - touchStartX.value;
	const deltaY = touchEndY - touchStartY.value;

	// 确保是水平滑动（水平距离大于垂直距离）且滑动距离超过阈值
	if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
		const currentIndex = sliderPosition.value;
		const maxIndex = tabTypes.length - 1;
		// 左滑（手指从右往左）=> direction='left', 内容向左移出
		// 右滑（手指从左往右）=> direction='right', 内容向右移出
		const swipeDirection = deltaX < 0 ? 'left' : 'right';

		if (deltaX < 0) {
			// 左滑，切换到下一个 tab（循环到第一个）
			const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
			const isLoop = currentIndex >= maxIndex;
			onTabChange(tabTypes[nextIndex], nextIndex, swipeDirection, isLoop);
		} else if (deltaX > 0) {
			// 右滑，切换到上一个 tab（循环到最后一个）
			const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
			const isLoop = currentIndex <= 0;
			onTabChange(tabTypes[prevIndex], prevIndex, swipeDirection, isLoop);
		}
	}
};

// 数据
const eventList = ref([]);
const loading = ref(false);

// 缓存跑团信息，避免重复请求
const fscInfoCache = ref({});

// 根据 club_type 过滤（无值或 running = 跑步，cycling = 骑行）
const filteredList = computed(() => {
	return eventList.value.filter(item => {
		const type = item.club_type || 'running';
		return type === selectedType.value;
	});
});

// 获取跑团信息
const getFscInfo = async (fscId) => {
	if (fscInfoCache.value[fscId]) {
		return fscInfoCache.value[fscId];
	}
	try {
		const res = await request.get(`/running-group/api/v1/groups/info?group_id=${fscId}`);
		fscInfoCache.value[fscId] = res;
		return res;
	} catch (e) {
		console.error('获取跑团信息失败', e);
		return null;
	}
};

// 获取状态栏高度
const getStatusBarHeight = () => {
	const systemInfo = uni.getSystemInfoSync();
	statusBarHeight.value = systemInfo.statusBarHeight || 20;
};

// 加载数据
const loadData = async (mescroll) => {
	loading.value = true;

	const params = {
		pageIndex: mescroll.num - 1,
		pageSize: 10,
		visibility: 'private',
		is_free: 1
	};

	try {
		const res = await request.get('/event-api/fsc_events', params);
		loading.value = false;

		let list = (res.fsc_events || [])
			.filter(item => item.status === 'ACT') // 只显示进行中的活动
			.map(item => ({
				...item,
				event_time: item.event_time
			}));

		// 获取所有唯一的 fsc_id
		const uniqueFscIds = [...new Set(list.map(item => item.fsc_id).filter(Boolean))];

		// 批量获取跑团信息
		await Promise.all(uniqueFscIds.map(id => getFscInfo(id)));

		// 合并跑团信息到活动数据
		list = list.map(item => {
			const fscInfo = fscInfoCache.value[item.fsc_id];
			return {
				...item,
				fsc_name: fscInfo?.name || '跑团活动',
				fsc_avatar: fscInfo?.avatar_url || ''
			};
		});

		mescroll.endSuccess(list.length);

		if (mescroll.num === 1) {
			eventList.value = [];
		}

		eventList.value = eventList.value.concat(list);
	} catch (e) {
		loading.value = false;
		mescroll.endErr();
		console.error('加载活动列表失败', e);
	}
};

// 格式化时间
const formatTime = (time) => {
	if (!time) return '';
	const t = isNaN(time) ? dayjs(time) : dayjs(Number(time));
	return t.format('MM/DD HH:mm');
};

// 跳转详情
const goDetail = (item) => {
	uni.$u.route(`pagesSub/runningTeam/teamEventDetail?id=${item.id}`);
};

onLoad(() => {
	getStatusBarHeight();
	getTabWidths();
});

onShow(() => {
	// 监听刷新事件
	uni.$off("refreshEventList");
	uni.$once("refreshEventList", () => {
		getMescroll()?.resetUpScroll();
	});
});
</script>

<style lang="scss" scoped>
.page-wrapper {
	min-height: 100vh;
	position: relative;
}

.event-page {
	min-height: 100vh;
	background: #f5f5f5;
}

// 顶部导航
.header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: #fff;
}

.nav-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 34rpx;
	font-weight: 500;
	color: #000;
}

// 分类标签
.tab-bar-wrapper {
	position: fixed;
	left: 0;
	right: 0;
	z-index: 99;
	background: #fff;
	border-bottom: 1rpx solid #eee;
}

.tab-bar {
	display: flex;
	align-items: center;
	padding: 20rpx 32rpx;
}

.tags-inner {
	display: inline-flex;
	position: relative;
	gap: 20rpx;
	padding: 6rpx;
	background: #f5f5f5;
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
		opacity: 0 !important;
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

// 内容区域
.content {
	// padding-top 由 JS 动态计算
}

// 活动列表
.activity-list {
	padding: 16rpx 24rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
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

// 横向卡片
.activity-card {
	display: flex;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	height: 240rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

	&:active {
		transform: scale(0.98);
	}
}

// 左侧图片
.card-image {
	width: 220rpx;
	height: 240rpx;
	flex-shrink: 0;
	position: relative;

	image {
		width: 100%;
		height: 100%;
	}
}

.card-tag {
	position: absolute;
	top: 12rpx;
	left: 12rpx;
	padding: 8rpx 20rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 500;
	background: #FF8C00;
	color: #fff;
}

// 右侧内容
.card-info {
	flex: 1;
	padding: 16rpx 20rpx;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.card-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	line-height: 40rpx;
	margin-bottom: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.info-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	line-height: 36rpx;
	margin-bottom: 6rpx;

	text {
		font-size: 24rpx;
		color: #666;
		line-height: 36rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

// 底部人数
.card-footer {
	margin-top: auto;
	padding-top: 8rpx;
	border-top: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	gap: 6rpx;
	line-height: 36rpx;
}

.capacity-text {
	font-size: 24rpx;
	font-weight: 500;
	color: #FF8C00;
	line-height: 36rpx;
}

</style>
