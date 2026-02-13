<template>
  <view class="">
    <section class="team-header">
			<section class=" flex-between-center">
			  <view class="flex-row">
					<image :src="detailInfo.team_avatar_url" class="team-avatar" />
					<view class="team-info">
					  <view class="team-name">{{ detailInfo.team_name }}</view>
					  <view class="team-meta">{{ detailInfo.team_goal_km }}KM | {{ detailInfo.current_members }}人 | 队长：{{ detailInfo.leader_nickname }}</view>
					  <view class="welcome-text">{{ detailInfo.team_introduction }}</view>
					</view>
				</view>
				<!-- <view class="iconfont icon-bianji edit-icon" @click="handleEdit"></view> -->
			</section>
			
			<!-- 统计卡片 -->
			<view class="stats-container flex-between-center">
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">{{ detailInfo.team_goal_km }}</text>
			    <text class="stat-label">总跑量(km)</text>
			  </view>
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">{{ detailInfo.team_completion_rate }}%</text>
			    <text class="stat-label">今日完赛率</text>
			  </view>
			  <view class="stat-item flex-col-center">
			    <text class="stat-value">{{ detailInfo.rank }}</text>
			    <text class="stat-label">跑名</text>
			  </view>
			</view>
		</section>

		<!-- 分类标签 -->
		<view class="tab-container">
			<view class="category-tags">
				<view class="tags-inner">
					<view
						v-for="(item, index) in tabList"
						:key="item.value"
						class="tag-item"
						:class="{ active: currentIndex === index }"
						@click="handleTabChange(item, index)"
					>
						{{ item.label }}
					</view>
				</view>
			</view>
		</view>

    <view class="rank-list">
      <view v-for="(item, index) in rankList" :key="item.wechat_openid" class="rank-item">
        <view class="rank-number flex-center">
            {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
          </view>
          <div class="user-avatar">
            <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
              (item.avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
            " mode="aspectFill" />
          </div>
          <view class="user-info">
            <view class="user-name u-flex-y-center">
              {{ item.real_name }}
              <view v-if="item.is_team_leader" class="leader-tag">队长</view>
              <view v-if="item.status === 'PND'" class="status-tag pnd">未报名</view>
            </view>
            <view class="user-detail u-flex-y-center">
              {{ item.total_distance_km }} KM
            </view>
            <view class="user-time">{{ item.total_qualified_sessions }}/{{ item.required_checkins }}次打卡</view>
          </view>
          <view class="progress">
            <template v-if="currentIndex === 0">
              <text class="progress-percent" style="font-size:36rpx;">{{ item.required_checkins ? Math.round(item.total_qualified_sessions / item.required_checkins * 100) : 0 }}%</text>
              <text class="progress-sub">{{ item.total_qualified_sessions }}/{{ item.required_checkins }}次</text>
            </template>
            <template v-else>
              <text class="progress-percent"><text style="font-size:36rpx;">{{ item.total_distance_km }}</text>km</text>
            </template>
          </view>
      </view>
      <view v-if="!rankList.length"><u-empty mode="data" text="暂无数据"></u-empty></view>
    </view>

    <view class="share-btn-wrapper">
      <button class="share-btn" open-type="share">邀请好友加入</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
	onLoad,
} from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { useShare, buildPath } from "@/composables/useShare.js";



const teamID = ref('')
const detailInfo = ref({});
function getDetailInfo() {
  request.get(`/event-api/online_events_team/${teamID.value}`).then((res) => {
    console.log('userStatus', res)
    detailInfo.value = res;
  });
}

const eventID = ref('')
const rankList = ref([]);
function getRankData(sortBy) {
  let url = `/event-api/online_events_team/members?team_id=${teamID.value}&event_id=${eventID.value}`;
  if (sortBy) url += `&sort_by=${sortBy}`;
  request.get(url).then((res) => {
    rankList.value = res;
  });
}

onLoad((options) => {
	teamID.value = options.teamId || options.id
	eventID.value = options.eventId
	getDetailInfo()
	getRankData('checkins')
});

useShare(() => ({
	title: detailInfo.value.team_name ? `加入${detailInfo.value.team_name}，一起为爱奔跑！` : '邀请你加入战队',
	path: buildPath('/pagesDashboard/pkEvent/teamDetail', { teamId: teamID.value, eventId: eventID.value }),
}));

const currentIndex = ref(0)
const tabList = ref([
	{ label: "个人完赛", value: "" },
	{ label: "总距离", value: "SUCC" },
]);
const handleTabChange = (item, index) => {
	currentIndex.value = index;
	if (index === 0) {
		getRankData('checkins');
	} else {
		getRankData();
	}
};

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
	  border: 4rpx solid #ffb3b3;
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
  color: #ff5c5c;
  border-bottom: 2rpx solid #ff5c5c;
}

/* 排行榜列表 */
.rank-list {
  margin: 0 30rpx;
  padding-bottom: 200rpx;
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
	.leader-tag {
		font-size: 18rpx;
		font-weight: 500;
		color: #ff5c5c;
		background: #FFF0F0;
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		margin-left: 10rpx;
	}
	.status-tag {
		font-size: 18rpx;
		font-weight: 500;
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		margin-left: 10rpx;
	}
	.status-tag.pnd {
		color: #999;
		background: #F3F4F6;
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
	  color: #ff5c5c;
	  font-weight: bold;
	  margin-left: 20rpx;
		padding-right: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.progress-sub {
		font-size: 22rpx;
		color: #999;
		font-weight: normal;
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
		color: #ff5c5c;
		line-height: 40rpx;
		width: 336rpx;
		white-space: nowrap;
		transition: color 0.3s ease;
		font-weight: bold;
		text-align: center;
		&.active {
		  color: #ff5c5c;
		  border-radius: 999rpx;
		  background: #f3f4f6;
		}
	}
}

.share-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 0;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.share-btn {
  width: 686rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 1px;
  color: #fff;
  background: #ff5c5c;
  border: none;

  &::after {
    border: none;
  }
}
</style>