<template>
  <view class="page">
    <Navbar :title="detail.event_info?.name || ''" placeholder />

    <view class="header">
      <view class="header-icon">
        <u-icon name="checkbox-mark" size="24" color="#8cc63e"></u-icon>
      </view>
      <view class="title">
        <view>已申请退赛</view>
      </view>
      <view>
        退款将于24小时内原路返回，如超24小时未到账，请联
        系客服。退赛成功后详情查看请前往订单列表
      </view>
    </view>
    <view class="section info">
      <view class="section-content">
        <view class="section-items">
          <view class="section-item">
            <text class="label">套餐费用</text>
            <text class="value">￥100</text>
          </view>
          <view class="section-item">
            <text class="label">退赛总额</text>
            <text class="value">￥100</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import Navbar from "@/components/navbar.vue";
// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 响应式数据
const detail = ref({
  event_info: {},
  sign_info: {},
});

// 页面加载
onLoad(() => {
  detail.value = uni.getStorageSync("orderDetail");
});
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  padding-bottom: env(safe-area-inset-bottom);
}
.header {
  background: #8cc63e;
  width: 100%;
  padding: 42rpx 34rpx 82rpx 34rpx;
  font-weight: bold;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  .header-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 104rpx;
    height: 104rpx;
    background: #ffffff;
    border-radius: 100%;
    margin-bottom: 20rpx;
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    font-size: 44rpx;
    color: #ffffff;
    margin-bottom: 22rpx;
  }
}
.section {
  &.info {
    margin-top: -40rpx;
  }
  padding: 0 34rpx;
  .section-content {
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    width: 100%;
    padding: 26rpx 20rpx;
    .section-items {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28rpx;
      font-weight: bold;
      font-size: 28rpx;
      color: #000000;
      .section-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24rpx;
        .label {
          width: 200rpx;
          flex-shrink: 0;
          color: #999999;
        }
      }
    }
  }
}
</style>
