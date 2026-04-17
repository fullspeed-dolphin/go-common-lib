<template>
  <view class="page-container">
    <u-navbar title="创建活动" autoBack placeholder></u-navbar>

    <view class="content">
      <text class="page-title">选择活动类型</text>
      <text class="page-desc">请选择您要创建的活动类型</text>

      <!-- 免费活动 -->
      <view class="type-card" @click="goForm(0)">
        <view class="type-header">
          <view class="type-icon icon-free">
            <u-icon name="gift" size="24" color="#22C55E"></u-icon>
          </view>
          <view class="type-title-col">
            <text class="type-title">免费活动</text>
            <text class="type-subtitle">适合跑团内部训练、约跑</text>
          </view>
        </view>
        <view class="type-features">
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#22C55E"></u-icon>
            <text class="feature-text">无需设置套餐价格</text>
          </view>
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#22C55E"></u-icon>
            <text class="feature-text">快速发布，成员直接报名</text>
          </view>
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#22C55E"></u-icon>
            <text class="feature-text">适合日常约跑、团队训练</text>
          </view>
        </view>
        <view class="card-chevron">
          <u-icon name="arrow-right" size="18" color="#D1D5DB"></u-icon>
        </view>
      </view>

      <!-- 收费活动 -->
      <view class="type-card" @click="goForm(1)">
        <view class="type-header">
          <view class="type-icon icon-paid">
            <u-icon name="integral" size="24" color="#FF8C00"></u-icon>
          </view>
          <view class="type-title-col">
            <text class="type-title">收费活动</text>
            <text class="type-subtitle">适合赛事、训练营、团建</text>
          </view>
        </view>
        <view class="type-features">
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#FF8C00"></u-icon>
            <text class="feature-text">支持套餐价格配置</text>
          </view>
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#FF8C00"></u-icon>
            <text class="feature-text">在线收款，自动对账</text>
          </view>
          <view class="feature-item">
            <u-icon name="checkmark-circle" size="14" color="#FF8C00"></u-icon>
            <text class="feature-text">适合正式赛事、付费训练营</text>
          </view>
        </view>
        <view class="card-chevron">
          <u-icon name="arrow-right" size="18" color="#D1D5DB"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const group_id = ref("");

onLoad((options) => {
  group_id.value = options.group_id;
});

const goForm = (isFree) => {
  if (isFree === 0) {
    // 免费活动 → 简化表单
    uni.$u.route(`pagesSub/runningTeam/teamEventFreeForm?group_id=${group_id.value}`);
  } else {
    // 收费活动 → 原有表单
    return uni.$u.toast("功能筹备中，敬请期待...");
    uni.$u.route(`pagesSub/runningTeam/teamEventForm?group_id=${group_id.value}&is_free=1`);
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
}

.content {
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.page-desc {
  font-size: 28rpx;
  color: #9CA3AF;
  margin-top: -16rpx;
}

.type-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  border: 1rpx solid #F3F4F6;
  position: relative;
}

.type-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.type-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-free {
  background: #F0FDF4;
}

.icon-paid {
  background: #FFF5EB;
}

.type-title-col {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.type-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.type-subtitle {
  font-size: 24rpx;
  color: #9CA3AF;
}

.type-features {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #6B7280;
}

.card-chevron {
  position: absolute;
  right: 40rpx;
  top: 56rpx;
}
</style>
