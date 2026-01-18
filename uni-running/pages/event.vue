<template>
	<view class="event-page">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="placeholder" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-bar">
				<text class="nav-title">跑团活动</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="loadData" :top="0">
				<!-- 瀑布流列表 -->
				<view class="waterfall-container" v-if="eventList.length > 0">
					<view class="waterfall-column">
						<view
							class="event-card"
							v-for="(item, index) in leftColumn"
							:key="'left-' + index"
							@click="goDetail(item)"
						>
							<view class="card-image-wrapper">
								<image
									class="card-image"
									:src="item.background_image_url + '?x-oss-process=image/resize,w_400'"
									mode="widthFix"
									@load="onImageLoad($event, index, 'left')"
								></image>
								<view class="card-tag" :class="getStatusClass(item.status)">
									{{ getStatusText(item.status) }}
								</view>
							</view>
							<view class="card-content">
								<text class="card-title">{{ item.name }}</text>
								<view class="card-meta">
									<view class="meta-row">
										<u-icon name="clock" size="24rpx" color="#999"></u-icon>
										<text class="meta-text">{{ formatTime(item.event_time) }}</text>
									</view>
									<view class="meta-row">
										<u-icon name="map" size="24rpx" color="#999"></u-icon>
										<text class="meta-text ellipsis">{{ item.event_location }}</text>
									</view>
								</view>
								<view class="card-footer">
									<view class="organizer">
										<image v-if="item.fsc_avatar" class="organizer-avatar" :src="item.fsc_avatar" mode="aspectFill"></image>
										<text class="organizer-name ellipsis">{{ item.fsc_name || '跑团活动' }}</text>
									</view>
									<view class="capacity">
										<text class="capacity-text">{{ item.capacity }}人</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="waterfall-column">
						<view
							class="event-card"
							v-for="(item, index) in rightColumn"
							:key="'right-' + index"
							@click="goDetail(item)"
						>
							<view class="card-image-wrapper">
								<image
									class="card-image"
									:src="item.background_image_url + '?x-oss-process=image/resize,w_400'"
									mode="widthFix"
									@load="onImageLoad($event, index, 'right')"
								></image>
								<view class="card-tag" :class="getStatusClass(item.status)">
									{{ getStatusText(item.status) }}
								</view>
							</view>
							<view class="card-content">
								<text class="card-title">{{ item.name }}</text>
								<view class="card-meta">
									<view class="meta-row">
										<u-icon name="clock" size="24rpx" color="#999"></u-icon>
										<text class="meta-text">{{ formatTime(item.event_time) }}</text>
									</view>
									<view class="meta-row">
										<u-icon name="map" size="24rpx" color="#999"></u-icon>
										<text class="meta-text ellipsis">{{ item.event_location }}</text>
									</view>
								</view>
								<view class="card-footer">
									<view class="organizer">
										<image v-if="item.fsc_avatar" class="organizer-avatar" :src="item.fsc_avatar" mode="aspectFill"></image>
										<text class="organizer-name ellipsis">{{ item.fsc_name || '跑团活动' }}</text>
									</view>
									<view class="capacity">
										<text class="capacity-text">{{ item.capacity }}人</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="!loading && eventList.length === 0">
					<u-empty mode="data" text="暂无跑团活动"></u-empty>
				</view>
			</mescroll-body>
		</view>

		<tabbar type="event" />
	</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";

const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

// 状态栏高度
const statusBarHeight = ref(0);

// 数据
const eventList = ref([]);
const loading = ref(false);

// 瀑布流左右列
const leftColumn = computed(() => {
	return eventList.value.filter((_, index) => index % 2 === 0);
});

const rightColumn = computed(() => {
	return eventList.value.filter((_, index) => index % 2 === 1);
});

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
		const res = await request.get('/event-api/fsc_events/list', params);
		loading.value = false;

		let list = (res.fsc_events || [])
			.filter(item => item.status === 'ACT') // 只显示进行中的活动
			.map(item => ({
				...item,
				event_time: item.event_time
			}));

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

// 图片加载完成
const onImageLoad = (e, index, column) => {
	// 可以在这里做高度计算优化
};

// 格式化时间
const formatTime = (time) => {
	if (!time) return '';
	const t = isNaN(time) ? dayjs(time) : dayjs(Number(time));
	return t.format('MM/DD HH:mm');
};

// 获取状态样式
const getStatusClass = (status) => {
	const map = {
		'PND': 'status-pending',
		'ACT': 'status-active',
		'EXP': 'status-expired'
	};
	return map[status] || '';
};

// 获取状态文本
const getStatusText = (status) => {
	const map = {
		'PND': '报名中',
		'ACT': '进行中',
		'EXP': '已结束'
	};
	return map[status] || '';
};

// 跳转详情
const goDetail = (item) => {
	uni.$u.route(`pagesSub/runningTeam/teamEventDetail?id=${item.id}`);
};

onLoad(() => {
	getStatusBarHeight();
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
	background: linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%);
}

.nav-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #fff;
}

// 内容区域
.content {
	padding-top: calc(88rpx + var(--status-bar-height, 20px));
}

// 瀑布流容器
.waterfall-container {
	display: flex;
	padding: 20rpx;
	gap: 20rpx;
}

.waterfall-column {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

// 卡片样式
.event-card {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.98);
	}
}

.card-image-wrapper {
	position: relative;
	width: 100%;
}

.card-image {
	width: 100%;
	display: block;
}

.card-tag {
	position: absolute;
	top: 16rpx;
	left: 16rpx;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;

	&.status-pending {
		background: rgba(255, 140, 0, 0.9);
		color: #fff;
	}

	&.status-active {
		background: rgba(0, 200, 83, 0.9);
		color: #fff;
	}

	&.status-expired {
		background: rgba(153, 153, 153, 0.9);
		color: #fff;
	}
}

.card-content {
	padding: 20rpx;
}

.card-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-bottom: 16rpx;
}

.card-meta {
	margin-bottom: 16rpx;
}

.meta-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 8rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.meta-text {
	font-size: 22rpx;
	color: #999;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 16rpx;
	border-top: 1rpx solid #f5f5f5;
}

.organizer {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex: 1;
	overflow: hidden;
}

.organizer-avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.organizer-name {
	font-size: 22rpx;
	color: #666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.capacity {
	flex-shrink: 0;
}

.capacity-text {
	font-size: 22rpx;
	color: #FF8C00;
	font-weight: 500;
}

// 空状态
.empty-state {
	padding: 200rpx 0;
}

// 辅助类
.ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
