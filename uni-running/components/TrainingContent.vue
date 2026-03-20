<template>
  <view class="training-content">
    <!-- 训练营 Banner -->
    <view class="train-banner">
      <view class="train-banner__overlay">
        <text class="train-banner__p-pre">第</text>
        <text class="train-banner__p-num">1</text>
        <text class="train-banner__p-suf">期</text>
        <text class="train-banner__p-recruit">训练营热招中</text>
        <view class="train-banner__p-club">
          <text class="train-banner__p-club-text">全速体育训练中心</text>
        </view>
      </view>
      <view class="train-banner__top">
        <text class="train-banner__title1">15节课2个月考核</text>
        <text class="train-banner__title2">3个月科学备赛</text>
        <view class="train-banner__tag">
          <text class="train-banner__tag-text">线上课程/小班制/定上跑课</text>
        </view>
      </view>
      <view class="train-banner__bottom">
        <view class="train-banner__bullet">
          <text class="train-banner__bullet-dot">▶</text>
          <text class="train-banner__bullet-txt">科学·系统·专业·创新</text>
        </view>
        <view class="train-banner__bullet">
          <text class="train-banner__bullet-dot">▶</text>
          <text class="train-banner__bullet-txt">不止于赛道·更超越自我</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="func-row">
      <view class="func-item" v-for="(f, i) in funcList" :key="i">
        <view class="func-item__icon" :style="{ background: f.bg }">
          <view class="iconfont func-item__iconfont" :class="f.iconfont"></view>
        </view>
        <text class="func-item__text">{{ f.label }}</text>
      </view>
    </view>

    <!-- 私信 -->
    <view class="msg-row">
      <view class="msg-row__left">
        <u-icon name="bell" size="20" color="#6B7280"></u-icon>
        <text class="msg-row__text">私信</text>
      </view>
      <u-icon name="arrow-right" size="20" color="#9CA3AF"></u-icon>
    </view>

    <!-- 教练招募 -->
    <view class="coach-banner">
      <view class="coach-banner__avatar">
        <view class="iconfont icon-renyuan- coach-banner__avatar-icon"></view>
      </view>
      <view class="coach-banner__info">
        <text class="coach-banner__title">我想成为教练</text>
        <text class="coach-banner__sub">带动身边的人科学、无伤跑起来！</text>
      </view>
      <view class="coach-banner__btn">
        <text class="coach-banner__btn-text">立即申请</text>
      </view>
    </view>

    <!-- 文章知识 -->
    <view class="article-section">
      <view class="article-section__header">
        <text class="article-section__title">文章知识</text>
        <view class="article-section__more">
          <text class="article-section__more-text">查看更多</text>
        </view>
      </view>
      <!-- 暂无数据占位 -->
      <view class="article-empty">
        <text class="article-empty__text">暂无文章，敬请期待</text>
      </view>
    </view>

    <view style="height: 200rpx;"></view>
  </view>
</template>

<script setup>
const funcList = [
  { label: '学习跑步', iconfont: 'icon-pulse-fill', bg: '#4CAF50' },
  { label: '万名教练', iconfont: 'icon-renyuan-', bg: '#FF8C00' },
  { label: '活动', iconfont: 'icon-huodongguize', bg: '#FFC107' },
];

</script>

<style lang="scss" scoped>
$primary: #FF8C00;
$c1: #1A1A1A;
$c2: #6B7280;
$c3: #9CA3AF;
$border-subtle: #F3F4F6;
$border-default: #E5E7EB;

.training-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 0 32rpx;
}

.train-banner {
  position: relative;
  background: #F5F0E0;
  border-radius: 32rpx;
  padding: 40rpx;
  height: 460rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;

  &__overlay { position: absolute; top: 0; right: 0; width: 50%; height: 100%; }
  &__p-pre { position: absolute; top: 40rpx; right: 130rpx; font-size: 36rpx; font-weight: 700; color: #6B7B3A; font-family: PingFang SC; }
  &__p-num { position: absolute; top: 50rpx; right: 60rpx; font-size: 128rpx; font-weight: 800; color: #6B7B3A; font-family: PingFang SC; line-height: 1; }
  &__p-suf { position: absolute; top: 100rpx; right: 20rpx; font-size: 36rpx; font-weight: 700; color: #6B7B3A; font-family: PingFang SC; }
  &__p-recruit { position: absolute; top: 210rpx; right: 30rpx; font-size: 32rpx; font-weight: 700; color: #6B7B3A; font-family: PingFang SC; }
  &__p-club { position: absolute; top: 330rpx; right: 30rpx; }
  &__p-club-text { font-size: 22rpx; font-weight: 600; color: #6B7B3A; font-family: PingFang SC; }

  &__top { display: flex; flex-direction: column; gap: 8rpx; position: relative; z-index: 1; }
  &__slogan { font-size: 26rpx; font-weight: 600; color: #8B7B3A; font-family: PingFang SC; }
  &__title1 { font-size: 44rpx; font-weight: 800; color: $c1; font-family: PingFang SC; }
  &__title2 { font-size: 44rpx; font-weight: 800; color: #8B7B3A; font-family: PingFang SC; }
  &__tag { display: inline-flex; background: #8B7B3A; border-radius: 8rpx; padding: 6rpx 20rpx; align-self: flex-start; }
  &__tag-text { font-size: 22rpx; font-weight: 600; color: #fff; font-family: PingFang SC; }

  &__bottom { display: flex; flex-direction: column; gap: 8rpx; position: relative; z-index: 1; }
  &__bullet { display: flex; align-items: center; gap: 12rpx; }
  &__bullet-dot { font-size: 16rpx; color: #8B7B3A; }
  &__bullet-txt { font-size: 24rpx; font-weight: 600; color: $c1; font-family: PingFang SC; }
}

.func-row {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0;
  background: #fff;
  border-radius: 24rpx;
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;

  &__icon {
    width: 112rpx;
    height: 112rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__iconfont {
    font-size: 56rpx;
    color: #fff;
  }

  &__text { font-size: 26rpx; font-weight: 600; color: $c1; font-family: PingFang SC; }
}

.msg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;

  &__left { display: flex; align-items: center; gap: 16rpx; }
  &__text { font-size: 32rpx; font-weight: 600; color: $c1; font-family: PingFang SC; }
}

.coach-banner {
  position: relative;
  background: #D4C9A0;
  border-radius: 32rpx;
  height: 200rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  overflow: hidden;

  &__avatar {
    width: 112rpx; height: 112rpx; border-radius: 32rpx;
    background: #B8A87A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  &__avatar-icon {
    font-size: 64rpx;
    color: #fff;
  }
  &__info { flex: 1; display: flex; flex-direction: column; gap: 8rpx; margin-left: 24rpx; min-width: 0; }
  &__title { font-size: 40rpx; font-weight: 800; color: #fff; font-family: PingFang SC; }
  &__sub { font-size: 22rpx; font-weight: 500; color: rgba(255,255,255,0.8); font-family: PingFang SC; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__btn { background: $primary; border-radius: 16rpx; padding: 16rpx 32rpx; flex-shrink: 0; margin-left: 16rpx; }
  &__btn-text { font-size: 26rpx; font-weight: 600; color: #fff; font-family: PingFang SC; white-space: nowrap; }
}

.article-section {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;

  &__header { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 32rpx 16rpx; }
  &__title { font-size: 36rpx; font-weight: 700; color: $c1; font-family: PingFang SC; }
  &__more { border: 2rpx solid $border-default; border-radius: 32rpx; padding: 10rpx 28rpx; }
  &__more-text { font-size: 24rpx; font-weight: 500; color: $c2; font-family: PingFang SC; }
}

.article-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-top: 2rpx solid $border-subtle;

  &__left { flex: 1; display: flex; align-items: center; gap: 20rpx; min-width: 0; }
  &__icon { width: 64rpx; height: 64rpx; border-radius: 12rpx; background: #E8F5E9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  &__text { font-size: 28rpx; font-weight: 600; color: $c1; font-family: PingFang SC; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

.article-empty {
  padding: 48rpx 0;
  display: flex;
  justify-content: center;

  &__text {
    font-size: 28rpx;
    color: $c3;
    font-family: PingFang SC;
  }
}
</style>
