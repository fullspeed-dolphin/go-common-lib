<template>
  <view class="">
		<section class="flex-center" style="height: 512rpx;filter: blur(10px);">
      <image class="img" style="width:750rpx;height:512rpx;" :src="
          (detailInfo?.team_avatar_url)  + '?x-oss-process=image/resize,w_750,h_500,m_fill'
        " mode="aspectFill"></image>
    </section>
    <section class="team-header" style="height: 580rpx;margin-top: -512rpx;position:relative;z-index:10;">
      <section class=" flex-between-center">
        <view class="flex-row">
          <image :src="detailInfo.team_avatar_url" class="team-avatar" mode="aspectFill" />
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
          <text class="stat-value">{{ detailInfo.total_distance_km }}</text>
          <text class="stat-label">总跑量(km)</text>
        </view>
        <view class="stat-item flex-col-center">
          <text class="stat-value">{{ detailInfo.current_members }}</text>
          <text class="stat-label">战队人数</text>
        </view>
        <view class="stat-item flex-col-center">
          <text class="stat-value">{{ teamRank || '-' }}</text>
          <text class="stat-label">战队排名</text>
        </view>
      </view>
    </section>

    <!-- 分类标签 -->
    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view v-for="(item, index) in tabList" :key="item.value" class="tag-item" :class="{ active: currentIndex === index }" @click="handleTabChange(item, index)">
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

    <view v-if="isLoadedPage" class="share-btn-wrapper">
			<!-- 加入任何一个战队后，不可加入其他战队 -->
      <button v-if="userStatusInfo.in_team && isSignUpEvent" class="share-btn" @click="goToSignEvent">立即报名</button>
      <button v-if="userStatusInfo.in_team" class="share-btn" style="background:#07C160" open-type="share">邀请好友加入</button>
      <button v-if="!userStatusInfo.in_team" class="share-btn" @click="joinTeam(detailInfo)">加入战队</button>
    </view>

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { useShare, buildPath } from "@/composables/useShare.js";

import UserLogin from "@/components/UserLogin.vue";
import { useStore } from "vuex";

const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const refUserLogin = ref(null);

const loginCallBack = ref(null)
function onLoginSuccess () {
	loginCallBack?.value?.()
}

const teamID = ref("");
const detailInfo = ref({});
function getDetailInfo() {
  request.get(`/event-api/online_events_team/${teamID.value}`).then((res) => {
    console.log("userStatus", res);
    detailInfo.value = res;
  });
}

const eventID = ref("");
const rankList = ref([]);
function getRankData(sortBy) {
  let url = `/event-api/online_events_team/members?team_id=${teamID.value}&event_id=${eventID.value}`;
  if (sortBy) url += `&sort_by=${sortBy}`;
  request.get(url).then((res) => {
    rankList.value = res;
  });
}

const teamRank = ref(0);
function getTeamRank() {
  request.get("/event-api/ranking/team?event_id=" + eventID.value).then((res) => {
    const list = res || [];
    const idx = list.findIndex(item => item.id === teamID.value);
    teamRank.value = idx >= 0 ? idx + 1 : 0;
  });
}

const userStatusInfo = ref({});
const isLoadedPage = ref(false)
function getUserStatus() {
  request.get("/event-api/online_events_team/user_status?event_id=" + eventID.value).then((res) => {
    console.log('userStatus', res)
    userStatusInfo.value = res;
		isLoadedPage.value = true
  });
}

const myEvents = ref([]);
function getMyEvents() {
  request.get("/event-api/online_events/my_events").then((res) => {
    myEvents.value = res;
  });
}
const isSignUpEvent = computed(() => {
  if (!myEvents.value) return true;
  return !myEvents.value.some((i) => i.event_id === eventID.value);
});

onLoad((options) => {
  teamID.value = options.teamId || options.id;
  eventID.value = options.eventId;

	if (!userInfo.value.id) {
		nextTick(() => {
			refUserLogin.value.open();
		})
  }
});

onShow(() => {
  if (!teamID.value) return;
  getDetailInfo();
  getRankData(currentIndex.value === 0 ? "checkins" : undefined);
  getUserStatus();
  getTeamRank();
  getMyEvents();
});

function joinTeamAPi() {
	const item = detailInfo.value
	console.log("joinTeamAPi", item);
	uni.showLoading({ mask: true });
  request
    .post("/event-api/online_events_team/join", {
			event_id: eventID.value,
			team_id: item.id,
    })
    .then(() => {
				getUserStatus();
				uni.$u.toast("成功加入战队, 准备跳转到活动报名页...", 2000, function success() {
					goToSignEvent();
				});
    })
    .catch((e) => {
      uni.$u.toast(e.msg || "加入战队失败");
    });
}

function goToSignEvent() {
	uni.$u.route("pagesDashboard/pkEvent/pkEventForm", { id: eventID.value });
}

function joinTeam() {
	
	if (!userInfo.value.id) {
		loginCallBack.value = joinTeam;

		nextTick(() => {
			refUserLogin.value.open();
		})

		return false;
  }

  if (!userStatusInfo.value.in_team) {
    uni.showModal({
      title: "提示",
      content: "确定加入该战队吗？",
      success: (res) => {
        if (res.confirm) {
					joinTeamAPi()
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
    return;
  }
}

useShare(() => ({
  title: detailInfo.value.team_name
    ? `加入${detailInfo.value.team_name}，一起为爱奔跑！`
    : "邀请你加入战队",
  path: buildPath("/pagesDashboard/pkEvent/teamDetail", {
    teamId: teamID.value,
    eventId: eventID.value,
  }),
}));

const currentIndex = ref(0);
const tabList = ref([
  { label: "个人完赛", value: "" },
  { label: "总距离", value: "SUCC" },
]);
const handleTabChange = (item, index) => {
  currentIndex.value = index;
  if (index === 0) {
    getRankData("checkins");
  } else {
    getRankData();
  }
};

// 编辑按钮点击
const handleEdit = () => {
  uni.$u.route("pagesDashboard/pkEvent/teamForm");
};
</script>

<style lang="scss" scoped>
.team-header {
  width: 750rpx;
  height: 450rpx;
  padding: 86rpx 50rpx 0;
  background: rgba(255,255,255,.7);
  .team-avatar {
    width: 120rpx;
    height: 120rpx;
    flex-shrink: 0;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 4rpx solid #ffb3b3;
    margin-right: 30rpx;
  }
  .team-meta {
    font-size: 26rpx;
    color: #222;
    margin-bottom: 8rpx;
  }
  .welcome-text {
    font-size: 24rpx;
    color: #666;
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
    color: #6a7282;
  }
}

.stats-container {
  margin-top: 50rpx;
  .stat-item {
    width: 206rpx;
    height: 144rpx;
    background: #f9fafb;
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
    color: #6a7282;
    line-height: 36rpx;
  }
}

/* 标签切换 */
.tab-container {
  display: flex;
  justify-content: center;
  margin: -100rpx 30rpx 20rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
	position: relative;
	z-index: 10;
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.1);
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
  background: #ffffff;
  box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.01);
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  &:nth-child(1) {
    .rank-number {
      color: #fdc700;
    }
  }
  &:nth-child(2) {
    .rank-number {
      color: #90a1b9;
    }
  }
  &:nth-child(3) {
    .rank-number {
      color: #ff8904;
    }
  }
  .rank-number {
    width: 96rpx;
    font-family: Inter, Inter;
    font-size: 24rpx;
    font-weight: bold;
    color: #acacac;
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
    color: #1e2939;
  }
  .leader-tag {
    font-size: 18rpx;
    font-weight: 500;
    color: #ff5c5c;
    background: #fff0f0;
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
    background: #f3f4f6;
  }

  .user-detail {
    font-size: 24rpx;
    color: #5c626f;
    margin-bottom: 8rpx;
  }

  .user-time {
    font-size: 20rpx;
    color: #5c626f;
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
    background: #f3f4f6;
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
  padding: 48rpx 30rpx;
	gap: 30rpx;
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