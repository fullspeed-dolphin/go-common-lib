<template>
  <view class="page-container">
    <u-navbar :title="clubTypeName + '管理'" autoBack placeholder>
      <template #right >
        <u-icon name="setting" size="20" color="#1A1A1A" @click="showMoreMenu"></u-icon>
      </template>
    </u-navbar>

    <!-- Team Banner -->
    <view class="team-banner">
      <view class="avatar" v-if="!detail.avatar_url">
        <text class="avatar-text">{{ avatarChar }}</text>
      </view>
      <image v-else class="avatar-img" :src="detail.avatar_url + '?x-oss-process=image/resize,w_300,limit_0'" mode="aspectFit" />
      <text class="banner-name">{{ detail.name || '--' }}</text>
      <view class="banner-info-row">
        <view class="banner-tag">
          <text class="banner-tag-text">{{ clubTypeName }}</text>
        </view>
        <text class="banner-id">团号 {{ detail.group_id || '--' }}</text>
        <!-- <u-icon name="arrow-right" size="14" color="#D1D5DB"></u-icon> -->
      </view>
    </view>

    <!-- Content Area -->
    <view class="content-area">
      <!-- Grid Row: Activity + Member -->
      <view class="grid-row">
        <!-- Activity Card -->
        <view class="grid-card" @click="$u.route(`pagesSub/runningTeam/teamEventList?group_id=${group_id}`)">
          <view class="card-icon icon-activity">
            <u-icon name="calendar" size="20" color="#FF8C00"></u-icon>
          </view>
          <text class="card-title">活动管理</text>
          <view class="activity-count">
            <text class="activity-number">{{ eventStats.active }}</text>
            <text class="activity-unit">个进行中</text>
          </view>
          <text class="card-sub">查看全部活动</text>
          <view class="card-chevron"><u-icon name="arrow-right" size="18" color="#D1D5DB"></u-icon></view>
        </view>

        <!-- Member Card -->
        <view class="grid-card" @click="$u.route(`pagesSub/runningTeam/teamMemberList?group_id=${group_id}`)">
          <view class="card-icon icon-member">
            <u-icon name="account" size="20" color="#6366F1"></u-icon>
          </view>
          <text class="card-title">成员管理</text>
          <view class="activity-count">
            <text class="activity-number member-color">{{ detail.total_members || 0 }}</text>
            <text class="activity-unit member-color">人</text>
          </view>
          <text class="card-sub">查看全部成员</text>
          <view class="card-chevron"><u-icon name="arrow-right" size="18" color="#D1D5DB"></u-icon></view>
        </view>
      </view>

      <!-- Data Card -->
      <view class="data-card" @click="$u.route(`pagesSub/runningTeam/teamSummary?group_id=${group_id}`)">
        <view class="card-chevron"><u-icon name="arrow-right" size="18" color="#D1D5DB"></u-icon></view>
        <view class="data-header">
          <text class="data-title">{{ clubTypeName }}数据</text>
        </view>
        <view class="data-stats">
          <view class="data-stat-item">
            <text class="data-stat-number">{{ formatDistance(groupStats.total_km) }}</text>
            <text class="data-stat-label">总跑量(km)</text>
          </view>
          <view class="data-stat-item">
            <text class="data-stat-number">{{ formatDistance(groupStats.avg_km_per_member) }}</text>
            <text class="data-stat-label">平均跑量(km)</text>
          </view>
          <view class="data-stat-item">
            <text class="data-stat-number">{{ groupStats.today_runners || 0 }}</text>
            <text class="data-stat-label">今日活跃</text>
          </view>
        </view>
        <!-- Mini Chart: 本周每日跑量 -->
        <view class="mini-chart">
          <view class="mini-bar-col" v-for="(h, i) in chartBars" :key="i">
            <view class="mini-bar" :style="{ height: h + '%', background: chartBarColors[i] }"></view>
            <text class="mini-bar-label">{{ weekDayLabels[i] }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom Buttons -->
    <view class="section-bottom">
      <u-button type="primary" shape="circle" color="#f7f7f7"
        customStyle="color:#FF8C00;height: 84rpx;"
        @click="deleteGroup()">删除{{ clubTypeName }}</u-button>
      <u-button type="primary" color="#FF8C00" shape="circle"
        customStyle="height: 84rpx;"
        @click="$u.route(`pagesSub/runningTeam/teamForm?group_id=${group_id}`)">更新{{ clubTypeName }}</u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import request from "@/utils/request.js";

const store = useStore();
const group_id = ref("");
const detail = ref({});
const eventStats = ref({ active: 0, pending: 0 });
const groupStats = ref({});

const weekDayLabels = ['一', '二', '三', '四', '五', '六', '日'];

// 柱状图：根据本周每日跑量动态计算高度百分比
const chartBars = computed(() => {
  const daily = groupStats.value.week_daily_km || [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...daily, 1);
  return daily.map(v => Math.max((v / max) * 100, v > 0 ? 8 : 3));
});

const chartBarColors = computed(() => {
  const daily = groupStats.value.week_daily_km || [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...daily, 1);
  return daily.map(v => {
    const ratio = v / max;
    if (ratio >= 0.7) return '#FF8C00';
    if (ratio >= 0.4) return '#FFB347';
    return '#FFD2A0';
  });
});

const clubTypeName = computed(() => {
  return detail.value.club_type === 'cycling' ? '车队' : '跑团';
});

const avatarChar = computed(() => {
  return detail.value.name?.charAt(0) || '';
});

const establishYear = computed(() => {
  if (!detail.value.establish_time) return '--';
  const time = detail.value.establish_time;
  if (typeof time === 'string') return time.slice(0, 4) + '年';
  return new Date(Number(time)).getFullYear() + '年';
});

const formatDistance = (km) => {
  if (!km && km !== 0) return '--';
  return Number(km).toLocaleString();
};

const getDetail = () => {
  request.get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
    .then((res) => {
      detail.value = res;
    });
};

const getGroupStats = () => {
  request.get(`/sport-api/api/manual/group-sports-stats?group_id=${group_id.value}`)
    .then((res) => { groupStats.value = res || {}; })
    .catch(() => {});
};

const getEventStats = () => {
  request.get(`/event-api/fsc_events?fsc_id=${group_id.value}`, { pageIndex: 0, pageSize: 100 })
    .then((res) => {
      const events = (res.fsc_events || []).filter(i => i.status !== 'DELETED');
      eventStats.value = {
        active: events.filter(e => e.status === 'ACT').length,
        pending: events.filter(e => e.status === 'PND').length,
      };
    }).catch(() => {});
};

const deleteGroup = () => {
  uni.showModal({
    title: "提示",
    content: `是否确认删除该${clubTypeName.value}？`,
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ mask: true });
        request.delete(`/running-group/api/v1/groups?group_id=${group_id.value}`)
          .then(() => {
            uni.hideLoading();
            uni.$u.toast("删除成功！");
            store.dispatch("getUserInfo");
            setTimeout(() => {
              uni.navigateBack();
            }, 300);
          }).catch(e => {
            uni.hideLoading();
            uni.showModal({
              title: '提示',
              content: e.msg,
              showCancel: false,
              confirmText: '我知道了'
            });
          });
      }
    },
  });
};

const showMoreMenu = () => {
   uni.$u.route(`pagesSub/runningTeam/teamMaps?group_id=${group_id.value}`);
  // uni.showActionSheet({
  //   itemList: [clubTypeName.value + '地图库'],
  //   success: (res) => {
  //     if (res.tapIndex === 0) {
  //       uni.$u.route(`pagesSub/runningTeam/teamMaps?group_id=${group_id.value}`);
  //     }
  //   }
  // });
};

onLoad((options) => {
  group_id.value = options.group_id;
  getDetail();
  getEventStats();
  getGroupStats();
});

onShow(() => {
  if (group_id.value) {
    getDetail();
    getEventStats();
    getGroupStats();
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
  padding-bottom: 200rpx;
}

.team-banner {
  background: linear-gradient(180deg, #FFF5EB 0%, #FFFFFF 100%);
  padding: 40rpx 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #FF8C00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #FFFFFF;
  font-size: 52rpx;
  font-weight: 700;
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
}

.banner-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A1A;
  text-align: center;
}

.banner-info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.banner-tag {
  background: #FF8C00;
  border-radius: 8rpx;
  padding: 4rpx 16rpx;
  display: flex;
  align-items: center;
  height: 36rpx;
}

.banner-tag-text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1;
}

.banner-id {
  font-size: 28rpx;
  color: #9CA3AF;
  line-height: 36rpx;
  gap:0;
}

.content-area {
  padding: 24rpx 32rpx;
}

.grid-row {
  display: flex;
  gap: 24rpx;
}

.grid-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  position: relative;
  border: 1rpx solid #F3F4F6;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  min-height: 280rpx;
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-activity {
  background: #FFF5EB;
}

.icon-member {
  background: #F0F5FF;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.activity-count {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.activity-number {
  font-size: 56rpx;
  font-weight: 800;
  color: #FF8C00;
}

.activity-unit {
  font-size: 26rpx;
  font-weight: 500;
  color: #FF8C00;
}

.card-sub {
  font-size: 22rpx;
  color: #9CA3AF;
}

.card-chevron {
  position: absolute;
  right: 28rpx;
  top: 28rpx;
}

.member-color {
  color: #6366F1 !important;
}

.data-card {
  margin-top: 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  border: 1rpx solid #F3F4F6;
  position: relative;
}

.data-header {
  margin-bottom: 24rpx;
}

.data-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.data-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
}

.data-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.data-stat-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.data-stat-label {
  font-size: 22rpx;
  color: #9CA3AF;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  height: 160rpx;
  background: #F6F7F8;
  border-radius: 16rpx;
  padding: 16rpx 24rpx 8rpx;
}

.mini-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.mini-bar {
  width: 100%;
  border-radius: 8rpx 8rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s ease;
}

.mini-bar-label {
  font-size: 18rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  line-height: 1;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
  display: flex;
  gap: 25px;

  ::v-deep {
    .u-button {
      flex: 1;
      margin: 0;
    }
  }
}
::v-deep {
  .u-navbar__content__right{
    // right:150rpx !important;
    top:110rpx !important;
  }
}
</style>
