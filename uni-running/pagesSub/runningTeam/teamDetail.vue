<template>
  <view class="page">
    <u-navbar :title="null" bgColor="#fff" autoBack placeholder>
      <template #right>
        <u-icon v-if="detail.user_role === 'creator'" name="setting" size="22" color="#1A1A1A"
          @click="$u.route(`pagesSub/runningTeam/teamSetting?group_id=${detail.group_id}`)"></u-icon>
      </template>
    </u-navbar>

    <!-- 空状态 -->
    <view v-if="isEmpty" class="empty-container">
      <mescroll-empty mode="data" :option="{ tip: '您还没有加入或创建俱乐部' }" />
      <view class="section-bottom">
        <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 84rpx; width: 100%;"
          @click="$u.route(`pagesSub/runningTeam/teamForm?from=mine`)">创建俱乐部</u-button>
      </view>
    </view>

    <block v-if="!isEmpty">
      <!-- 固定头部 -->
      <view class="club-header">
        <!-- 头像 -->
        <image class="club-avatar"
          :src="(detail.avatar_url || 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png') + '?x-oss-process=image/resize,w_300,limit_0'"
          mode="aspectFit" />
        <!-- 名称 -->
        <text class="club-name">{{ detail.name }}</text>
        <!-- 标签行 -->
        <view class="club-tags">
          <view class="club-tag">
            <text class="club-tag-text">{{ clubTypeName }}</text>
          </view>
          <text class="club-id">团号 {{ detail.group_id || '--' }}</text>
        </view>

        <!-- 跑团地址 -->
        <view class="club-location" v-if="detail.establish_location">
          <u-icon name="map" size="14" color="#9CA3AF"></u-icon>
          <text class="club-location-text">{{ detail.establish_location }}</text>
        </view>

        <!-- 跑团宣言 -->
        <view class="club-slogan" v-if="detail.introduction">
          <text class="club-slogan-text">{{ detail.introduction }}</text>
        </view>

        <!-- 分隔线 -->
        <view class="header-divider"></view>

        <!-- 统计行 -->
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-number">{{ detail.total_members || 0 }}</text>
            <text class="stat-label">成员总数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ detail.gender_ratio || '--' }}</text>
            <text class="stat-label">男女比例</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">--</text>
            <text class="stat-label">人均/Km</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">--</text>
            <text class="stat-label">今日跑/人</text>
          </view>
        </view>

        <view class="header-divider"></view>

        <!-- Tab 栏 -->
        <view class="tab-bar-wrap">
          <view class="tab-bar">
            <view class="tab-item" :class="{ active: activeTab === 'rank' }" @click="activeTab = 'rank'">
              <text class="tab-text">排行榜</text>
              <view class="tab-line" v-if="activeTab === 'rank'"></view>
            </view>
            <view class="tab-item" :class="{ active: activeTab === 'events' }" @click="activeTab = 'events'">
              <text class="tab-text">跑团活动 ({{ eventList.length }})</text>
              <view class="tab-line" v-if="activeTab === 'events'"></view>
            </view>
            <view class="tab-item" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">
              <text class="tab-text">成员</text>
              <view class="tab-line" v-if="activeTab === 'members'"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- Tab 内容区 -->
      <view class="tab-content">
        <!-- 排行榜 -->
        <view v-if="activeTab === 'rank'" class="rank-section">
          <view class="rank-header">
            <u-icon name="order" size="18" color="#FF8C00"></u-icon>
            <text class="rank-title">个人月跑量榜</text>
            <u-icon name="arrow-right" size="14" color="#D1D5DB"></u-icon>
          </view>
          <!-- 表头 -->
          <view class="rank-table-header">
            <text class="rank-col-no">排名</text>
            <text class="rank-col-user">用户</text>
            <text class="rank-col-km">累计跑量</text>
          </view>
          <!-- 排名行 -->
          <view class="rank-row" :class="{ 'rank-row-self': item.openid === userOpenid }"
            v-for="(item, idx) in rankedMembers" :key="idx" @click="openMemberDetail(item)">
            <view class="rank-no" :class="'rank-no-' + (idx + 1)">
              <text>{{ idx + 1 }}</text>
            </view>
            <image class="rank-avatar"
              :src="item.avatar_url ? item.avatar_url + '?x-oss-process=image/resize,w_80,h_80,m_fill' : '/static/images/user.png'"
              mode="aspectFill" />
            <view class="rank-info">
              <text class="rank-name">{{ item.nickname || '成员' }}</text>
              <text class="rank-sub">{{ item.role === 'creator' ? '团长' : '成员' }}</text>
            </view>
            <text class="rank-km">{{ formatKm(item.total_distance || item.total_km || 0) }}</text>
          </view>
          <view v-if="!rankedMembers.length" class="empty-hint">
            <text>暂无排行数据</text>
          </view>
        </view>

        <!-- 跑团活动 -->
        <view v-if="activeTab === 'events'" class="events-section">
          <view class="event-card" v-for="(item, idx) in eventList" :key="idx"
            @click="$u.route(`pagesSub/runningTeam/teamEventDetail?id=${item.id || item.event_id}`)">
            <view class="event-card-top">
              <!-- 左侧日期书签 -->
              <view class="event-bookmark">
                <view class="bookmark-month">
                  <text class="bookmark-month-text">{{ getMonth(item.event_time) }}月</text>
                </view>
                <text class="bookmark-day">{{ getDay(item.event_time) }}</text>
              </view>
              <!-- 中间信息 + 右侧封面 -->
              <view class="event-main">
                <view class="event-top-row">
                  <view class="event-info">
                    <text class="event-name">{{ item.name || item.description }}</text>
                    <text class="event-time">{{ formatEventTime(item.event_time) }}</text>
                  </view>
                  <image class="event-cover"
                    :src="getCoverUrl(item) + '?x-oss-process=image/resize,w_240,h_160,m_fill'"
                    mode="aspectFill" v-if="getCoverUrl(item)" />
                </view>
                <!-- 底部行 -->
                <view class="event-bottom-row">
                  <text class="event-club">{{ detail.name || clubTypeName }}</text>
                  <text class="event-status-text" v-if="item.status === 'ACT'">{{ item._regCount || 0 }}人已报名/进行中</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="!eventList.length" class="empty-hint">
            <text>暂无{{ clubTypeName }}活动</text>
          </view>
        </view>

        <!-- 成员 -->
        <view v-if="activeTab === 'members'" class="members-section">
          <!-- 团长 -->
          <view class="member-row" v-if="memberLeader.id" @click="openMemberDetail(memberLeader)">
            <image class="member-avatar"
              :src="memberLeader.avatar_url ? memberLeader.avatar_url + '?x-oss-process=image/resize,w_80,h_80,m_fill' : '/static/images/user.png'"
              mode="aspectFill" />
            <view class="member-info">
              <text class="member-name">{{ memberLeader.nickname || '团长' }}</text>
              <view class="member-role-tag">团长</view>
            </view>
            <u-icon name="arrow-right" size="14" color="#D1D5DB"></u-icon>
          </view>
          <!-- 成员列表 -->
          <view class="member-row" v-for="(item, idx) in memberList" :key="idx" @click="openMemberDetail(item)">
            <image class="member-avatar"
              :src="item.avatar_url ? item.avatar_url + '?x-oss-process=image/resize,w_80,h_80,m_fill' : '/static/images/user.png'"
              mode="aspectFill" />
            <view class="member-info">
              <text class="member-name">{{ item.nickname || '成员' }}</text>
              <text class="member-sub">成员</text>
            </view>
            <u-icon name="arrow-right" size="14" color="#D1D5DB"></u-icon>
          </view>
          <view v-if="!memberList.length && !memberLeader.id" class="empty-hint">
            <text>暂无成员</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="section-bottom">
        <view class="share-btn" @click="showShareBtn">
          <text>分享{{ clubTypeName }}</text>
        </view>
        <block v-if="!userInfo.running_group && detail.user_role === 'guest'">
          <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;" @click="joinGroup()">加入{{ clubTypeName }}</u-button>
        </block>
        <block v-if="detail.user_role === 'creator'">
          <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;" @click="$u.route(`pagesSub/runningTeam/teamSetting?group_id=${detail.group_id}`)">管理工具</u-button>
        </block>
        <block v-if="detail.user_role === 'member'">
          <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;" @click="leaveGroup()">退出{{ clubTypeName }}</u-button>
        </block>
      </view>
    </block>

    <MemberDetail ref="refMemberDetail" />
    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />
    <ShareSheet ref="refShare" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onUnload, onShow } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import UserLogin from "@/components/UserLogin.vue";
import MemberDetail from "./memberDetail.vue";
import ShareSheet from "@/components/common/ShareSheet.vue";
import request from "@/utils/request.js";
import { useShare, buildPath } from "@/composables/useShare.js";
import dayjs from "dayjs";

const store = useStore();
const activeTab = ref('rank');

useShare(() => ({
  title: "全速运动 - " + (detail.value.name || ""),
  path: buildPath("/pagesSub/runningTeam/teamDetail", { group_id: routeParams.value.group_id }),
  imageUrl: detail.value.avatar_url || "",
}));

const refUserLogin = ref(null);
const pendingAction = ref(null);

const onLoginSuccess = () => {
  getMemberList();
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
};

const isEmpty = ref(false);
const detail = ref({});
const routeParams = ref({});
const eventList = ref([]);
const memberList = ref([]);
const memberLeader = ref({});
const allMembers = ref([]);

const clubTypeName = computed(() => {
  return detail.value.club_type === "cycling" ? "车队" : "跑团";
});

const userInfo = computed(() => store.state.userInfo);
const userOpenid = computed(() => store.state.userInfo?.openid || '');

// 排行榜：所有成员按跑量排序
const rankedMembers = computed(() => {
  return [...allMembers.value].sort((a, b) => (b.total_distance || b.total_km || 0) - (a.total_distance || a.total_km || 0));
});

const refMemberDetail = ref(null);
function openMemberDetail(item) {
  refMemberDetail.value.open(item);
}

const formatKm = (val) => {
  if (!val) return '0.00';
  return parseFloat(val).toFixed(2);
};

const getMonth = (time) => {
  if (!time) return '';
  const t = isNaN(time) ? dayjs(time) : dayjs(Number(time));
  return t.format('M');
};

const getDay = (time) => {
  if (!time) return '';
  const t = isNaN(time) ? dayjs(time) : dayjs(Number(time));
  return t.format('DD');
};

const formatEventTime = (time) => {
  if (!time) return '';
  const t = isNaN(time) ? dayjs(time) : dayjs(Number(time));
  return t.format('MM/DD HH:mm');
};

const getCoverUrl = (item) => {
  const url = item.background_image_url || item.image_url;
  if (!url) return '';
  if (url.startsWith('[')) {
    try { return JSON.parse(url)[0] || ''; } catch (e) { return url; }
  }
  return url;
};

onLoad((options) => {
  routeParams.value = options;
  if (!options.group_id || options.group_id === "null") {
    isEmpty.value = true;
    return;
  }
  getDetail();
  getEvents();

  // #ifdef MP-WEIXIN
  wx.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
  // #endif
});

onUnload(() => {
  uni.removeStorageSync("groupDetail");
});

onShow(() => {
  uni.$off("updateList");
  uni.$once("updateList", (data) => {
    if (data.from === "mine" && data.group_id) {
      routeParams.value.group_id = data.group_id;
      getDetail();
    }
  });
  getEvents();
});

const getDetail = () => {
  const groupDetail = uni.getStorageSync("groupDetail");
  if (groupDetail) detail.value = groupDetail;

  uni.showLoading({ mask: true });
  request.get(`/running-group/api/v1/groups/info?group_id=${routeParams.value.group_id}`)
    .then((res) => {
      res.establish_time = res.establish_time ? res.establish_time.slice(0, 10) : '';
      detail.value = res;
      isEmpty.value = false;
      getMemberList();
    });
};

const getMemberList = () => {
  const data = { pageIndex: 0, pageSize: 50, groupId: Number(detail.value.group_id) };
  request.post(`/running-group/api/v1/groups/members`, data).then((res) => {
    res = res.memberships || [];
    allMembers.value = res;
    memberLeader.value = res.find((i) => i.role === "creator") || {};
    memberList.value = res.filter((i) => i.role !== "creator");
  });
};

const getEvents = () => {
  if (!routeParams.value.group_id) return;
  request.get(`/event-api/fsc_events?fsc_id=${routeParams.value.group_id}&status=ACT`)
    .then(async (res) => {
      const list = (res.fsc_events || []).filter(i => i.status !== 'DELETED');
      eventList.value = list;
      // 批量查询每个活动的报名人数
      list.forEach((item) => {
        request.get(`/booking-api/fsc_events/registration/list?event_id=${item.id}`)
          .then((regRes) => {
            item._regCount = regRes?.total || 0;
            eventList.value = [...eventList.value]; // 触发响应式更新
          }).catch(() => {});
      });
    }).catch(() => {});
};

const joinGroup = () => {
  if (!store.state.userInfo.id) {
    pendingAction.value = () => joinGroup();
    return refUserLogin.value.open();
  }
  uni.showModal({
    title: "提示",
    content: `是否确认加入该${clubTypeName.value}？`,
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ mask: true });
        request.post(`/user-api/user/joinRunningGroup`, { running_group: Number(detail.value.group_id) })
          .then(() => { uni.hideLoading(); getDetail(); uni.$u.toast("加入成功！"); });
      }
    },
  });
};

const leaveGroup = () => {
  uni.showModal({
    title: "提示",
    content: `是否确认退出该${clubTypeName.value}？`,
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ mask: true });
        request.post(`/user-api/user/quitRunningGroup`).then(() => {
          uni.$u.toast("操作成功！");
          store.dispatch("getUserInfo");
          getDetail();
        });
      }
    },
  });
};

const refShare = ref(null);
const showShareBtn = () => {
  refShare.value.open(
    { avatar_url: detail.value.avatar_url, name: detail.value.name, establish_time: detail.value.establish_time },
    `pagesSub/runningTeam/teamDetail?group_id=${routeParams.value.group_id}`
  );
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FAFAFA;
  padding-bottom: 200rpx;
}

.empty-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.club-header {
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16rpx;
}

.club-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #F6F7F8;
  border: 4rpx solid #FF8C00;
}

.club-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-top: 16rpx;
}

.club-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.club-tag {
  background: #FF8C00;
  border-radius: 8rpx;
  padding: 4rpx 16rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
}

.club-tag-text {
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1;
}

.club-id {
  font-size: 24rpx;
  color: #9CA3AF;
  line-height: 36rpx;
}

.club-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 48rpx 0;
}

.club-location-text {
  font-size: 24rpx;
  color: #9CA3AF;
}

.club-slogan {
  padding: 12rpx 48rpx 0;
}

.club-slogan-text {
  font-size: 24rpx;
  color: #9CA3AF;
  text-align: center;
  line-height: 1.5;
}

.header-divider {
  width: 100%;
  height: 1rpx;
  background: #F3F4F6;
  margin-top: 20rpx;
}

.stats-row {
  display: flex;
  width: 100%;
  padding: 32rpx 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.stat-number {
  font-size: 44rpx;
  font-weight: 700;
  color: #FF8C00;
}

.stat-label {
  font-size: 24rpx;
  color: #9CA3AF;
}

.tab-bar-wrap {
  width: 100%;
  padding: 16rpx 32rpx 0;
}

.tab-bar {
  display: flex;
  gap: 48rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 16rpx;
}

.tab-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #9CA3AF;
  white-space: nowrap;
}

.tab-item.active .tab-text {
  color: #FF8C00;
  font-weight: 700;
}

.tab-line {
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #FF8C00;
  margin-top: 8rpx;
}

.tab-content {
  padding: 24rpx 24rpx 0;
}

// 排行榜
.rank-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.rank-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rank-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.rank-table-header {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: 22rpx;
  color: #9CA3AF;
}

.rank-col-no { width: 80rpx; }
.rank-col-user { flex: 1; }
.rank-col-km { width: 160rpx; text-align: right; }

.rank-row {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #F6F7F8;
  border-radius: 20rpx;
  gap: 16rpx;
}

.rank-row-self {
  background: #F0FDF4;
}

.rank-no {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #6B7280;
  flex-shrink: 0;
}

.rank-no-1 { background: #FFD700; color: #FFF; }
.rank-no-2 { background: #C0C0C0; color: #FFF; }
.rank-no-3 { background: #CD7F32; color: #FFF; }

.rank-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.rank-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-sub {
  font-size: 20rpx;
  color: #9CA3AF;
}

.rank-km {
  font-size: 30rpx;
  font-weight: 700;
  color: #1A1A1A;
  flex-shrink: 0;
}

// 活动
.events-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.event-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
}

.event-card-top {
  display: flex;
}

// 日期书签
.event-bookmark {
  width: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 0;
}

.bookmark-month {
  background: #FF8C00;
  border-radius: 0 0 12rpx 12rpx;
  padding: 6rpx 14rpx;
  width: 100%;
  display: flex;
  justify-content: center;
}

.bookmark-month-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.bookmark-day {
  font-size: 44rpx;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1;
  margin-top: 8rpx;
}

// 主区域
.event-main {
  flex: 1;
  padding: 20rpx 20rpx 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  min-width: 0;
}

.event-top-row {
  display: flex;
  gap: 16rpx;
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.event-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 24rpx;
  color: #9CA3AF;
}

.event-cover {
  width: 180rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.event-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-club {
  font-size: 22rpx;
  color: #9CA3AF;
}

.event-status-text {
  font-size: 22rpx;
  color: #22C55E;
  font-weight: 600;
}

// 成员
.members-section {
  display: flex;
  flex-direction: column;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.member-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.member-role-tag {
  background: rgba(255, 140, 0, 0.1);
  color: #FF8C00;
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
  font-weight: 500;
}

.member-sub {
  font-size: 22rpx;
  color: #9CA3AF;
}

.empty-hint {
  padding: 80rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #9CA3AF;
}

// 底部
.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  gap: 25px;

  ::v-deep {
    .u-button {
      margin: 0;
    }
  }
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  width: 312rpx;
  border-radius: 200rpx;
  background: #18b566;
  border: 1rpx solid #18b566;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
