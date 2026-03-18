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
      <view class="tab tab--inactive" @click="onClickTrain">
        <text class="tab__text tab__text--inactive">训练</text>
      </view>
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
                <text class="upgrade-badge__text">功能升级</text>
              </view>
            </view>
            <view class="banner-left__bottom">
              <text class="banner-left__title">跑团功能新玩法</text>
              <text class="banner-left__highlight">先睹为快</text>
              <text class="banner-left__desc">{{ bannerDesc }}</text>
            </view>
          </view>
        </view>

        <!-- 右侧双卡片 -->
        <view class="banner-right">
          <view class="mini-card mini-card--activity" @click="onClickActivity">
            <view class="mini-card__text">
              <text class="mini-card__title">跑团活动</text>
              <text class="mini-card__sub">等你参加</text>
            </view>
            <view class="mini-card__icon">
              <u-icon name="bell-fill" size="28" color="#3B82F6"></u-icon>
            </view>
          </view>
          <view class="mini-card mini-card--about" @click="onClickAbout">
            <view class="mini-card__text">
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
          <view class="club-card__top">
            <view class="club-card__info">
              <image
                v-if="myClubDetail.avatar_url"
                class="club-card__avatar-img"
                :src="myClubDetail.avatar_url + '?x-oss-process=image/resize,w_120,h_120,m_fill'"
                mode="aspectFill"
              />
              <view v-else class="club-card__avatar">
                <u-icon name="account-fill" size="28" color="#6B7280"></u-icon>
              </view>
              <view class="club-card__meta">
                <text class="club-card__name">{{ myClubDetail.name }}</text>
                <text class="club-card__members">{{ myClubDetail.total_members }}名成员</text>
              </view>
            </view>
            <view class="club-card__rank">
              <text class="club-card__rank-val">- -</text>
              <text class="club-card__rank-label">排名</text>
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
          :class="{ 'nearby-item--border': i < sortedClubList.length - 1 }"
          @click="onClickClubItem(club)"
        >
          <image
            class="nearby-item__avatar-img"
            :src="(club.avatar_url || 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png') + '?x-oss-process=image/resize,w_120,h_120,m_fill'"
            mode="aspectFill"
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
import { onShow, onReachBottom } from '@dcloudio/uni-app';
import { useStore } from 'vuex';
import { useShare } from '@/composables/useShare.js';
import request from '@/utils/request.js';
import tabbar from '@/components/tabBar.vue';

useShare({ title: '全速运动 - 跑团', path: '/pages/runClub' });

const store = useStore();
const userInfo = computed(() => store.state.userInfo);

// ===== 导航栏定位（与胶囊按钮对齐）=====
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
const menuBtn = uni?.getMenuButtonBoundingClientRect?.() || {};
const navTop = menuBtn.top || (statusBarHeight + 6);
const navHeight = menuBtn.height || 32;
const navSpacerHeight = navTop + navHeight + 8;

// ===== Banner 描述文本 =====
const bannerDesc = '跑团活动 / 联动共享\n跑团贡献 / Siri捷径';

// ===== 我的跑团 =====
const myClubDetail = ref(null);
const myClubLoaded = ref(false);
const clubStats = [
  { value: '- -', label: '月跑量 (km)' },
  { value: '- -', label: '人均 (km)' },
  { value: '- -', label: '本月跑 (人)' },
  { value: '- -', label: '今日跑 (人)' },
];

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
    })
    .catch(() => {
      myClubDetail.value = null;
    })
    .finally(() => {
      myClubLoaded.value = true;
    });
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
onShow(() => {
  getMyClubInfo();
  getClubList(true);
});

onReachBottom(() => {
  getClubList(false);
});

// ===== 路由 =====
const onClickTrain = () => uni.showToast({ title: '敬请期待', icon: 'none' });
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
  background: #fff;
}

// ========== 导航栏 ==========
.nav-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
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
  width: 310rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.mini-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 24rpx;
  padding: 24rpx;
  overflow: hidden;

  &--activity { background: #DBEAFE; }
  &--about { background: #FFF3E0; }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 700;
    color: $c1;
  }

  &__sub {
    font-size: 24rpx;
    font-weight: 500;
    color: $c2;
  }

  &__icon {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
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
  background: $bg-gray;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;

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
    border-radius: 24rpx;
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
    gap: 4rpx;
  }

  &__name {
    font-size: 32rpx;
    font-weight: 700;
    color: $c1;
  }

  &__members {
    font-size: 24rpx;
    font-weight: 500;
    color: $c2;
  }

  &__rank {
    width: 104rpx;
    height: 104rpx;
    border-radius: 20rpx;
    background: $primary-light;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
  }

  &__rank-val {
    font-size: 32rpx;
    font-weight: 700;
    color: $primary;
  }

  &__rank-label {
    font-size: 20rpx;
    font-weight: 600;
    color: $primary;
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
  gap: 24rpx;

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
    background: transparent;
  }

  &--inactive {
    background: $bg-gray;
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
  gap: 24rpx;
  padding: 28rpx 0;

  &--border {
    border-bottom: 2rpx solid $border-subtle;
  }

  &__avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 24rpx;
    background: #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__avatar-img {
    width: 112rpx;
    height: 112rpx;
    border-radius: 24rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $c1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__detail {
    font-size: 24rpx;
    font-weight: 500;
    color: $c2;
  }

  &__location {
    font-size: 22rpx;
    font-weight: 500;
    color: $c3;
  }

  &__stat {
    font-size: 24rpx;
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
