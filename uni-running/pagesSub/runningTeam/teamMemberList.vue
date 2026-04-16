<template>
  <view class="page-container">
    <u-navbar :title="clubTypeName + '成员管理'" autoBack placeholder />

    <!-- Search Bar -->
    <view class="search-section">
      <view class="search-inner">
        <u-icon name="search" size="18" color="#9CA3AF"></u-icon>
        <input class="search-input" type="text" placeholder="搜索成员..." v-model="searchKeyword"
          placeholder-style="color:#9CA3AF" />
      </view>
    </view>

    <!-- Stats Row -->
    <view class="stats-row">
      <view class="stat-card stat-total">
        <text class="stat-number" style="color:#FF8C00;">{{ detail.total_members || dataList.length }}</text>
        <text class="stat-label">总成员</text>
      </view>
      <view class="stat-card stat-male">
        <text class="stat-number" style="color:#6366F1;">{{ genderStats.male }}</text>
        <text class="stat-label">男</text>
      </view>
      <view class="stat-card stat-female">
        <text class="stat-number" style="color:#22C55E;">{{ genderStats.female }}</text>
        <text class="stat-label">女</text>
      </view>
    </view>

    <!-- Member List -->
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" :top="0">
      <view class="member-list">
        <view class="member-row" v-for="(item, index) in filteredList" :key="index"
          @click="openMemberDetail(item)">
          <!-- Avatar -->
          <image class="member-avatar-img"
            :src="item.avatar_url ? item.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill' : '/static/images/user.png'"
            mode="aspectFill" />

          <!-- Info -->
          <view class="member-info">
            <text class="member-name">{{ item.nickname || '成员' }}</text>
            <view class="member-sub">
              <view class="role-tag" v-if="item.role === 'creator'">
                <text>团长</text>
              </view>
              <text class="member-role" v-else>成员</text>
              <text class="member-km" v-if="item.total_distance">累计 {{ item.total_distance }}km</text>
              <text class="member-km" v-else-if="item.total_km">累计 {{ item.total_km }}km</text>
            </view>
          </view>

          <!-- Chevron -->
          <u-icon name="arrow-right" size="14" color="#D1D5DB"></u-icon>
        </view>
      </view>
    </mescroll-body>

    <!-- Bottom Button -->
    <view class="section-bottom">
      <view class="btn-invite" @click="inviteMember()">
        <text class="btn-invite-text">邀请成员</text>
      </view>
    </view>

    <MemberDetail ref="refMemberDetail" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);
import MemberDetail from "./memberDetail.vue";

const dataList = ref([]);
const group_id = ref("");
const detail = ref({});
const searchKeyword = ref('');

const clubTypeName = computed(() => {
  return detail.value.club_type === 'cycling' ? '车队' : '跑团';
});

// 头像颜色池
const avatarColors = [
  { bg: '#FFE4CC', text: '#FF8C00' },
  { bg: '#D1FAE5', text: '#22C55E' },
  { bg: '#E0E7FF', text: '#6366F1' },
  { bg: '#FEF3C7', text: '#D97706' },
  { bg: '#FCE7F3', text: '#EC4899' },
];

// 性别统计
const genderStats = computed(() => {
  let male = 0, female = 0;
  dataList.value.forEach(item => {
    if (item.gender === 1) male++;
    else if (item.gender === 0) female++;
  });
  return { male, female };
});

// 搜索过滤
const filteredList = computed(() => {
  if (!searchKeyword.value) return dataList.value;
  const kw = searchKeyword.value.toLowerCase();
  return dataList.value.filter(item =>
    (item.nickname || '').toLowerCase().includes(kw)
  );
});

const getAvatarChar = (item) => {
  return (item.nickname || '?').charAt(0);
};

const getAvatarStyle = (item) => {
  const name = item.nickname || '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getDetail = () => {
  request.get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
    .then((res) => {
      detail.value = res;
    });
};

onLoad((options) => {
  group_id.value = options.group_id;
  getDetail();
});

const refMemberDetail = ref(null);
function openMemberDetail(item) {
  refMemberDetail.value.open(item);
}

const getList = (mescroll) => {
  uni.showLoading({ mask: true });
  const data = {
    pageIndex: mescroll.num - 1,
    pageSize: 15,
    groupId: Number(group_id.value),
  };

  request.post(`/running-group/api/v1/groups/members`, data)
    .then(async (res) => {
      uni.hideLoading();
      res = res?.memberships || [];
      mescroll.endSuccess(res.length);

      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(res);
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};

const inviteMember = () => {
  uni.$u.toast('请点击右上角"..."分享给好友');
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
  padding-bottom: 160rpx;
}

.search-section {
  padding: 16rpx 32rpx;
}

.search-inner {
  background: #F6F7F8;
  border-radius: 42rpx;
  padding: 0 28rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
  height: 84rpx;
}

.stats-row {
  display: flex;
  gap: 20rpx;
  padding: 8rpx 32rpx 16rpx;
}

.stat-card {
  flex: 1;
  border-radius: 20rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-total {
  background: #FFF5EB;
}

.stat-male {
  background: #F0F5FF;
}

.stat-female {
  background: #F0FDF4;
}

.stat-number {
  font-size: 36rpx;
  font-weight: 800;
}

.stat-label {
  font-size: 22rpx;
  color: #6B7280;
  font-weight: 500;
}

.member-list {
  padding: 8rpx 32rpx;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.member-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-char {
  font-size: 32rpx;
  font-weight: 700;
}

.member-avatar-img {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.member-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-sub {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.role-tag {
  background: rgba(255, 140, 0, 0.1);
  color: #FF8C00;
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.member-role {
  font-size: 22rpx;
  color: #9CA3AF;
}

.member-km {
  font-size: 22rpx;
  color: #9CA3AF;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}

.btn-invite {
  width: 100%;
  height: 96rpx;
  background: #FF8C00;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.btn-invite-text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
