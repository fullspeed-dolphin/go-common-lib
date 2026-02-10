<template>
  <view class="">
    <section class="team-header">
			<section class=" flex-between-center">
			  <view class="flex-row">
					<image :src="detailInfo.team_avatar_url" class="team-avatar" />
					<view class="team-info">
					  <view class="team-name">{{ detailInfo.team_name }}</view>
					  <view class="team-meta">{{ detailInfo.team_goal_km }}KM | {{ detailInfo.current_members }}人 | 队长：{{ detailInfo.leader_name }}</view>
					  <view class="welcome-text">欢迎大家加入{{ detailInfo.team_name }}~</view>
					</view>
				</view>
				<view class="iconfont icon-bianji edit-icon" @click="handleEdit"></view>
			</section>
			
			<!-- 统计卡片 -->
			<view class="stats-container flex-between-center">
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">{{ detailInfo.total_run_km }}</text>
			    <text class="stat-label">总跑量(km)</text>
			  </view>
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">23%</text>
			    <text class="stat-label">今日完赛率</text>
			  </view>
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">99</text>
			    <text class="stat-label">跑名</text>
			  </view>
			</view>
		</section>

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

    <view class="rank-list" @touchstart="onTouchStart"
			@touchend="handleTouchEnd">
      <view v-for="(item, index) in rankList" :key="item.id" class="rank-item">
        <view class="rank-number flex-center">
					{{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
				</view>
				<div class="user-avatar">
					<up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
						(item.team_avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
					" mode="aspectFill" />
				</div>
        <view class="user-info">
          <view class="user-name">{{ item.name }}</view>
          <view class="user-detail">{{ item.completed }}次 | {{ item.total }}次</view>
          <view class="user-time">{{ item.time }}</view>
        </view>
        <view class="progress">
          <text class="progress-percent">{{ item.progress }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
	onLoad,
} from "@dcloudio/uni-app";
import { useTabAnimation } from "@/composables/useTabAnimation.js";

// Tab 配置
const tabList = ref([
	{ label: "3.14KM", value: "" },
	{ label: "5.20KM", value: "SUCC" },
]);

const teamID = ref('')
const detailInfo = ref({});
function getDetailInfo() {
  request.get(`/event-api/online_events_team/${teamID.value}`).then((res) => {
    console.log('userStatus', res)
    detailInfo.value = res;
  });
}

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

onLoad((options) => {
	teamID.value = options.id
	getDetailInfo()
	initTabRects();
});

// 当前选中的 tab
const curTab = computed(() => tabList.value[currentIndex.value]);

// Tab 切换处理
const handleTabChange = (item, index) => {
	if (currentIndex.value === index) return;
	changeTab(index);
};

// 数据
const dataList = ref([]);

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

// 排行榜数据
const rankList = ref([
  { id: 1, name: '吴金根', avatar: '/static/avatar1.png', completed: 10, total: 10, time: '2026-2-3-03:59:58', progress: '100' },
  { id: 2, name: '赵德霞', avatar: '/static/avatar2.png', completed: 10, total: 10, time: '2026-2-3-04:26:45', progress: '100' },
  { id: 3, name: '王誉玲', avatar: '/static/avatar3.png', completed: 8, total: 10, time: '2026-2-3-03:59:58', progress: '80' },
  { id: 4, name: '孙木', avatar: '/static/avatar4.png', completed: 8, total: 10, time: '2026-2-3-03:59:58', progress: '80' },
  { id: 5, name: '李菁', avatar: '/static/avatar5.png', completed: 8, total: 10, time: '2026-2-3-03:59:58', progress: '80' }
])

// 编辑按钮点击
const handleEdit = () => {
   uni.$u.route('pagesDashboard/pkEvent/teamForm')
}
</script>

<style lang="scss" scoped>
.team-header {
	width: 750rpx;
	height: 450rpx;
	padding: 86rpx 50rpx 0;
	background: #FFFFFF;
	.team-avatar {
	  width: 120rpx;
	  height: 120rpx;
	  border-radius: 16rpx 16rpx 16rpx 16rpx;
	  border: 4rpx solid #F9D2DA;
		margin-right: 30rpx;
	}
	.team-meta {
	  font-size: 26rpx;
	  color: #6A7282;
	  margin-bottom: 8rpx;
	}
	.welcome-text {
	  font-size: 24rpx;
	  color: #999;
	}
	.team-name {
		line-height: 60rpx;
	  font-weight: 800;
	  font-size: 40rpx;
	  color: #101828;
	}
	.edit-icon {
	  width: 40rpx;
	  height: 40rpx;
	  margin-left: 10rpx;
		font-size: 40rpx;
		color:#6A7282;
	}
}

.stats-container {
	margin-top:50rpx;
	.stat-item {
	  width: 206rpx;
	  height: 144rpx;
	  background: #F9FAFB;
	  border-radius: 32rpx 32rpx 32rpx 32rpx;
	}
	
	.stat-value {
	  font-weight: 800;
	  font-size: 40rpx;
	  color: #101828;
		line-height: 60rpx;
	}
	
	.stat-label {
	  font-size: 24rpx;
	  color: #6A7282;
		line-height: 36rpx;
	}
}



/* 标签切换 */
.tab-container {
  display: flex;
  justify-content: center;
  margin: 40rpx 30rpx 20rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  border-bottom: 2rpx solid transparent;
}

.tab-item.active {
  color: #e12a48;
  border-bottom: 2rpx solid #e12a48;
}

/* 排行榜列表 */
.rank-list {
  margin: 0 30rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  margin: 10rpx 0;
	width: 686rpx;
	height: 144rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0,0,0,0.01);
	border-radius: 32rpx 32rpx 32rpx 32rpx;
	&:nth-child(1){
		.rank-number{
			color: #FDC700
		}
	}
	&:nth-child(2){
		.rank-number{
			color: #90A1B9
		}
	}
	&:nth-child(3){
		.rank-number{
			color: #FF8904
		}
	}
	.rank-number {
		width: 96rpx;
		font-family: Inter, Inter;
	  font-size: 24rpx;
		font-weight: bold;
	  color: #ACACAC;
	  text-align: center;
	}
	
	.user-avatar {
	  margin-right: 26rpx;
		width: 96rpx;
		height: 96rpx;
		border-radius: 14rpx 14rpx 14rpx 14rpx;
		background: #f5f5f5;
	}
	
	.user-info {
	  flex: 1;
	}
	
	.user-name {
		line-height: 42rpx;
		font-weight: bold;
		font-size: 28rpx;
		color: #1E2939;
	}
	
	.user-detail {
	  font-size: 24rpx;
	  color: #5C626F;
	  margin-bottom: 8rpx;
	}
	
	.user-time {
	  font-size: 20rpx;
	  color: #5C626F;
	}
	
	.progress {
	  font-size: 28rpx;
	  color: #e12a48;
	  font-weight: bold;
	  margin-left: 20rpx;
		padding-right: 20rpx;
	}
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
		background: #F3F4F6;
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
		font-size: 28rpx;
		color: #E11D48;
		line-height: 40rpx;
		width: 336rpx;
		white-space: nowrap;
		transition: color 0.3s ease;
		font-weight: bold;
		text-align: center;
		&.active {
			color: #E11D48;
		}
	}
}
</style>