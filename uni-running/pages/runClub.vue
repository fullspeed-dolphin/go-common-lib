<template>
  <view class="run-club-page">
    <!-- 导航栏白色背景（fixed 遮挡滚动内容） -->
    <view class="nav-bg" :style="{ height: navSpacerHeight + 'px' }"></view>

    <!-- 左上角 Tab 切换，与胶囊按钮对齐 -->
    <view class="nav-tabs" :style="{ top: navTop + 'px', height: navHeight + 'px' }">
      <view class="tab tab--active">
        <text class="tab__text tab__text--active">跑团</text>
        <view class="tab__line"></view>
      </view>
      <!-- TODO: 训练 tab 暂时隐藏，等接口对接后打开
      <view :class="['tab', tabIndex === 1 ? 'tab--active' : 'tab--inactive']" @click="tabIndex = 1">
        <text :class="['tab__text', tabIndex === 1 ? 'tab__text--active' : 'tab__text--inactive']">训练</text>
        <view v-if="tabIndex === 1" class="tab__line"></view>
      </view>
      -->
    </view>

    <!-- 占位高度 -->
    <view :style="{ height: navSpacerHeight + 'px' }"></view>

    <!-- 主内容区 -->
    <view class="content">
      <!-- ====== Banner 区 ====== -->
      <view class="banner-row">
        <!-- 左侧大 Banner -->
        <view class="banner-left">
          <image
            class="banner-left__bg"
            src="https://images.unsplash.com/photo-1760879946075-ddb8432a322d?w=600&h=800&fit=crop"
            mode="aspectFill"
          />
          <view class="banner-left__overlay">
            <view class="banner-left__top">
              <view class="upgrade-badge">
                <text class="upgrade-badge__text">隆重上线</text>
              </view>
            </view>
            <view class="banner-left__bottom">
              <text class="banner-left__title">全速体育</text>
              <text class="banner-left__highlight">跑团功能</text>
              <text class="banner-left__desc">{{ bannerDesc }}</text>
            </view>
          </view>
        </view>

        <!-- 右侧卡片区 -->
        <view class="banner-right">
          <!-- 上排：跑团活动 + 发布活动 并列（仅团长可见发布活动） -->
          <view class="banner-right__top" v-if="isCreator">
            <view class="mini-card mini-card--activity" @click="onClickActivity">
              <text class="mini-card__title">跑团活动</text>
              <view class="mini-card__icon">
                <u-icon name="bell-fill" size="28" color="#FF8C42"></u-icon>
              </view>
            </view>
            <view class="mini-card mini-card--publish" @click="onClickPublish">
              <text class="mini-card__title">发布活动</text>
              <view class="mini-card__icon">
                <image class="mini-card__icon-img" src="/static/icons/send-orange.png" mode="aspectFit" />
              </view>
            </view>
          </view>
          <!-- 非团长：跑团活动全宽 -->
          <view v-else class="mini-card mini-card--activity" @click="onClickActivity">
            <text class="mini-card__title">跑团活动</text>
            <view class="mini-card__icon">
              <u-icon name="bell-fill" size="28" color="#FF8C42"></u-icon>
            </view>
          </view>
          <!-- 下排：关于我们 全宽 -->
          <view class="mini-card mini-card--about" @click="onClickAbout">
            <view>
              <text class="mini-card__title">关于我们</text>
              <text class="mini-card__sub">全速运动</text>
            </view>
            <view class="mini-card__icon">
              <u-icon name="info-circle-fill" size="28" color="#FF8C00"></u-icon>
            </view>
          </view>
        </view>
      </view>

      <!-- ====== 我的跑团 ====== -->
      <view class="section-club">
        <view class="section-club__header">
          <view class="section-club__header-left">
            <text class="section-club__title">我的跑团</text>
            <template v-if="myClubDetail">
              <view class="section-club__divider"></view>
              <text class="section-club__joined">已加入1个跑团</text>
            </template>
          </view>
          <view v-if="!myClubDetail" class="section-club__create-btn" @click="onClickCreate">
            <text class="section-club__create-text">创建跑团</text>
          </view>
        </view>

        <!-- 已加入跑团 -->
        <view v-if="myClubDetail" class="club-card" @click="onClickMyClub">
          <!-- 排名标签（右上角悬挂） -->
          <view class="club-card__rank-tag">
            <text class="club-card__rank-val">- -</text>
            <text class="club-card__rank-label">排名</text>
          </view>
          <view class="club-card__top">
            <view class="club-card__info">
              <image
                v-if="myClubDetail.avatar_url"
                class="club-card__avatar-img"
                :src="myClubDetail.avatar_url + '?x-oss-process=image/resize,w_200,limit_0'"
                mode="aspectFit"
              />
              <view v-else class="club-card__avatar">
                <u-icon name="account-fill" size="28" color="#6B7280"></u-icon>
              </view>
              <view class="club-card__meta">
                <text class="club-card__name">{{ myClubDetail.name }}</text>
                <text class="club-card__members">{{ myClubDetail.total_members }}名成员</text>
              </view>
            </view>
          </view>

          <view class="club-card__stats">
            <view class="stat-item" v-for="(s, i) in clubStats" :key="i">
              <text class="stat-item__val">{{ s.value }}</text>
              <text class="stat-item__label">{{ s.label }}</text>
            </view>
          </view>
        </view>

        <!-- 未加入跑团 -->
        <view v-else-if="myClubLoaded" class="club-card club-card--empty">
          <text class="club-card__empty-text">你还没有加入任何跑团</text>
          <view class="club-card__join-btn" @click="onClickJoinClub">
            <text class="club-card__join-text">去加入</text>
          </view>
        </view>
      </view>

      <!-- ====== 跑团排行 ====== -->
      <view class="section-nearby">
        <view class="section-nearby__tabs">
          <view
            v-for="(t, i) in rankTabs" :key="i"
            :class="['pill', rankTabIdx === i ? 'pill--active' : 'pill--inactive']"
            @click="rankTabIdx = i"
          >
            <text :class="['pill__text', rankTabIdx === i ? 'pill__text--active' : 'pill__text--inactive']">{{ t }}</text>
          </view>
        </view>

        <view
          v-for="(club, i) in sortedClubList" :key="club.group_id"
          class="nearby-item"
          @click="onClickClubItem(club)"
        >
          <image
            class="nearby-item__avatar-img"
            :src="(club.avatar_url || 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png') + '?x-oss-process=image/resize,w_200,limit_0'"
            mode="aspectFit"
          />
          <view class="nearby-item__info">
            <text class="nearby-item__name">{{ club.name }}</text>
            <text class="nearby-item__detail">团长 {{ club.creator_real_name || '--' }}</text>
            <text class="nearby-item__detail">{{ club.total_members || 0 }}名成员</text>
            <text v-if="club.establish_location" class="nearby-item__location">{{ club.establish_location }}</text>
          </view>
          <text class="nearby-item__stat">{{ rankTabIdx === 0 ? (club.total_members || 0) + '人' : formatKm(club.total_km) + 'km' }}</text>
        </view>

        <!-- 加载状态 -->
        <view class="load-more">
          <text v-if="clubLoading" class="load-more__text">加载中...</text>
          <text v-else-if="clubNoMore && clubList.length" class="load-more__text">已经到底了~</text>
        </view>
      </view>

      <!-- tabbar 底部留白 -->
      <view style="height: 200rpx;"></view>
    </view>

    <tabbar type="runClub" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onReachBottom,onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useStore } from 'vuex';
import { useShare } from '@/composables/useShare.js';
import request from '@/utils/request.js';
import tabbar from '@/components/tabBar.vue';
// TODO: 训练模块暂时隐藏，等接口对接后打开
// import TrainingContent from '@/components/TrainingContent.vue';

useShare({ title: '全速运动 - 跑团', path: '/pages/runClub' });

const store = useStore();
const userInfo = computed(() => store.state.userInfo);

// ===== 导航栏定位（与胶囊按钮对齐）=====
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
const menuBtn = uni?.getMenuButtonBoundingClientRect?.() || {};
const navTop = menuBtn.top || (statusBarHeight + 6);
const navHeight = menuBtn.height || 32;
const navSpacerHeight = navTop + navHeight + 8;

// TODO: Swiper 切换（训练模块暂时隐藏）
// const tabIndex = ref(0);
// const windowHeight = uni.getSystemInfoSync().windowHeight;
// const swiperHeight = windowHeight - navSpacerHeight;
// const onSwiperChange = (e) => { tabIndex.value = e.detail.current; };

// ===== Banner 描述文本 =====
const bannerDesc = '跑团活动 / 联动共享\n运动保险 / 成员管理';

// ===== 我的跑团 =====
const myClubDetail = ref(null);
const myClubLoaded = ref(false);
const myClubStats = ref({});
const clubStats = computed(() => [
  { value: myClubStats.value.month_total_km ? parseFloat(myClubStats.value.month_total_km).toFixed(1) : '- -', label: '月跑量 (km)' },
  { value: myClubStats.value.avg_km_per_member ? parseFloat(myClubStats.value.avg_km_per_member).toFixed(1) : '- -', label: '人均 (km)' },
  { value: myClubStats.value.month_active_members != null ? myClubStats.value.month_active_members : '- -', label: '本月跑 (人)' },
  { value: myClubStats.value.today_runners != null ? myClubStats.value.today_runners : '- -', label: '今日跑 (人)' },
]);

const getMyClubInfo = () => {
  const groupId = userInfo.value.running_group;
  if (!groupId) {
    myClubDetail.value = null;
    myClubLoaded.value = true;
    return;
  }
  request.get(`/running-group/api/v1/groups/info?group_id=${groupId}`)
    .then((res) => {
      myClubDetail.value = res;
      getMyClubStats(groupId);
    })
    .catch(() => {
      myClubDetail.value = null;
    })
    .finally(() => {
      myClubLoaded.value = true;
    });
};

const getMyClubStats = (groupId) => {
  request.get(`/sport-api/api/manual/group-sports-stats?group_id=${groupId}`)
    .then((res) => { myClubStats.value = res || {}; })
    .catch(() => {});
};

// ===== 跑团排行列表 =====
const rankTabs = ['人数', '跑量'];
const rankTabIdx = ref(0);
const clubList = ref([]);
const clubPageIndex = ref(0);
const clubPageSize = 10;
const clubLoading = ref(false);
const clubNoMore = ref(false);

const sortedClubList = computed(() => {
  const list = [...clubList.value];
  if (rankTabIdx.value === 0) {
    list.sort((a, b) => (b.total_members || 0) - (a.total_members || 0));
  } else {
    list.sort((a, b) => (b.total_km || 0) - (a.total_km || 0));
  }
  return list;
});

const formatKm = (val) => {
  if (!val) return '0.00';
  const km = val > 10000 ? val / 1000 : val;
  return parseFloat(km).toFixed(2);
};

const getClubList = (isRefresh = true) => {
  if (clubLoading.value) return;
  if (!isRefresh && clubNoMore.value) return;

  if (isRefresh) {
    clubPageIndex.value = 0;
    clubNoMore.value = false;
  }

  clubLoading.value = true;
  const idx = clubPageIndex.value;

  Promise.all([
    request.get(`/running-group/api/v1/groups/list?pageIndex=${idx}&pageSize=${clubPageSize}&club_type=running`),
    request.get(`/running-group/api/v1/groups/list?pageIndex=${idx}&pageSize=${clubPageSize}&club_type=cycling`),
  ]).then((res) => {
    const newData = res.map((i) => i.data || []).flat();
    if (isRefresh) {
      clubList.value = newData;
    } else {
      clubList.value = [...clubList.value, ...newData];
    }
    if (newData.length < clubPageSize) {
      clubNoMore.value = true;
    }
    clubPageIndex.value = idx + 1;
  }).finally(() => {
    clubLoading.value = false;
  });
};

// ===== 生命周期 =====
onShow(async () => {
  await store.dispatch('getUserInfo');
  getMyClubInfo();
  getClubList(true);
});

onReachBottom(() => {
  getClubList(false);
});

// ===== 团长判断 =====
const isCreator = computed(() => {
  return !!(userInfo.value.running_group && myClubDetail.value && myClubDetail.value.user_role === 'creator');
});

// ===== 路由 =====
const onClickPublish = () => {
  if (!myClubDetail.value) return;
  uni.$u.route(`pagesSub/runningTeam/teamEventTypeSelect?group_id=${myClubDetail.value.group_id}`);
};
const onClickActivity = () => {
  uni.$u.route('/pages/event');
};
const onClickAbout = () => {
  uni.$u.route('pagesSub/settings/aboutUs');
};
const onClickCreate = () => {
  uni.$u.route('pagesSub/runningTeam/teamForm?from=mine');
};
const onClickMyClub = () => {
  if (!myClubDetail.value) return;
  uni.$u.route(`pagesSub/runningTeam/teamDetail?group_id=${myClubDetail.value.group_id}`);
};
const onClickJoinClub = () => {
  uni.$u.route('pagesSub/runningTeam/teamList');
};
const onClickClubItem = (club) => {
  uni.setStorageSync('teamDetail', club);
  uni.$u.route(`pagesSub/runningTeam/teamDetail?group_id=${club.group_id}`);
};
</script>

<style lang="scss" scoped>
$primary: #FF8C00;
$primary-light: #FFF3E0;
$c1: #1A1A1A;
$c2: #6B7280;
$c3: #9CA3AF;
$bg-gray: #F6F7F8;
$border-default: #E5E7EB;
$border-subtle: #F3F4F6;

.run-club-page {
  min-height: 100vh;
  background: $bg-gray;
}

// ========== 导航栏 ==========
.nav-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: $bg-gray;
  z-index: 90;
}

.nav-tabs {
  position: fixed;
  left: 0;
  padding-left: 32rpx;
  z-index: 91;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;

  &--active { gap: 6rpx; }
  &--inactive { justify-content: center; }

  &__text--active {
    font-size: 40rpx;
    font-weight: 700;
    color: $c1;
  }

  &__text--inactive {
    font-size: 32rpx;
    font-weight: 500;
    color: $c3;
  }

  &__line {
    width: 48rpx;
    height: 6rpx;
    background: $c1;
    border-radius: 4rpx;
  }
}

// ========== 内容区 ==========
.content {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  padding: 0 32rpx;
}

// ========== Banner ==========
.banner-row {
  display: flex;
  gap: 20rpx;
  height: 400rpx;
}

.banner-left {
  flex: 1;
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;

  &__bg {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
  }

  &__overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24rpx 28rpx;
    box-sizing: border-box;
  }

  &__top { display: flex; }

  &__bottom {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  &__title {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
  }

  &__highlight {
    font-size: 44rpx;
    font-weight: 800;
    color: $primary;
  }

  &__desc {
    font-size: 22rpx;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    white-space: pre-line;
  }
}

.upgrade-badge {
  display: inline-flex;
  align-items: center;
  background: $primary;
  border-radius: 8rpx;
  padding: 6rpx 16rpx;

  &__text {
    font-size: 22rpx;
    font-weight: 600;
    color: #fff;
  }
}

.banner-right {
  width: 340rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.banner-right__top {
  display: flex;
  gap: 16rpx;
  height: 0;
  flex: 1;
}

.mini-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 20rpx;
  padding: 16rpx;
  overflow: hidden;

  &--activity { background: #FFE8D6; }
  &--publish { background: #FFF3E0; }
  &--about { background: #D4F5F5; }

  &__title {
    font-size: 30rpx;
    font-weight: 700;
    color: $c1;
    white-space: nowrap;
    display: block;
  }

  &__sub {
    font-size: 26rpx;
    color: $c2;
    display: block;
    margin-top: 12rpx;
  }

  &__icon {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }

  &__icon-img {
    width: 48rpx;
    height: 48rpx;
  }
}

// ========== 我的跑团 ==========
.section-club {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  &__title {
    font-size: 36rpx;
    font-weight: 700;
    color: $c1;
  }

  &__divider {
    width: 2rpx;
    height: 32rpx;
    background: $border-default;
  }

  &__joined {
    font-size: 26rpx;
    font-weight: 500;
    color: $primary;
  }

  &__create-btn {
    display: flex;
    align-items: center;
    padding: 12rpx 28rpx;
    border: 2rpx solid $primary;
    border-radius: 32rpx;
  }

  &__create-text {
    font-size: 26rpx;
    font-weight: 600;
    color: $primary;
  }
}

.club-card {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  overflow: hidden;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  &__avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 24rpx;
    background: #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__avatar-img {
    width: 100rpx;
    height: 100rpx;
  }

  &--empty {
    align-items: center;
    justify-content: center;
    gap: 24rpx;
    padding: 48rpx 32rpx;
  }

  &__empty-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $c3;
  }

  &__join-btn {
    display: flex;
    align-items: center;
    padding: 12rpx 40rpx;
    background: $primary;
    border-radius: 32rpx;
  }

  &__join-text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__name {
    font-size: 34rpx;
    font-weight: 700;
    color: $c1;
  }

  &__members {
    font-size: 24rpx;
    font-weight: 500;
    color: $c2;
  }

  &__rank-tag {
    position: absolute;
    top: 0;
    right: 24rpx;
    background: #FF9F33;
    border-radius: 0 0 16rpx 16rpx;
    padding: 20rpx 20rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
  }

  &__rank-val {
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
  }

  &__rank-label {
    font-size: 20rpx;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  &__stats {
    display: flex;
  }
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  &__val {
    font-size: 36rpx;
    font-weight: 800;
    color: $c1;
  }

  &__label {
    font-size: 22rpx;
    font-weight: 500;
    color: $c2;
  }
}

// ========== 附近跑团 ==========
.section-nearby {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  &__tabs {
    display: flex;
    gap: 24rpx;
  }
}

.pill {
  border-radius: 36rpx;
  padding: 12rpx 36rpx;

  &--active {
    border: 2rpx solid $primary;
    background: #fff;
  }

  &--inactive {
    background: #fff;
    border: 2rpx solid transparent;
  }

  &__text {
    font-size: 28rpx;
    font-weight: 600;
  }

  &__text--active { color: $primary; }
  &__text--inactive { color: $c2; }
}

.nearby-item {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;

  &__avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 24rpx;
    background: #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__avatar-img {
    width: 120rpx;
    height: 120rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    min-width: 0;
  }

  &__name {
    font-size: 34rpx;
    font-weight: 600;
    color: $c1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__detail {
    font-size: 28rpx;
    font-weight: 500;
    color: $c2;
  }

  &__location {
    font-size: 26rpx;
    font-weight: 500;
    color: $c3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__stat {
    font-size: 28rpx;
    font-weight: 600;
    color: $primary;
    flex-shrink: 0;
  }
}

.load-more {
  padding: 24rpx 0;
  display: flex;
  justify-content: center;

  &__text {
    font-size: 24rpx;
    color: $c3;
  }
}
</style>
