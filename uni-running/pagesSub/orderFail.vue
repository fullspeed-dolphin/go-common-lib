<template>
  <view class="page">
    <u-navbar autoBack placeholder title="第四届十全十美欢乐跑"></u-navbar>
    <view class="header">
      <view class="title">
        <view>报名失败！</view>
        <view class="btn">返回首页</view>
      </view>
      <view>抱歉，您的报名未成功！</view>
      <view>
        我们遇到了一点小麻烦，没能完成扣款。别担心，您的账户是安全的。
        请核实订单或重新支付！
      </view>
    </view>
    <view class="button-container">
      <view class="button">
        <u-button
          type="primary"
          color="#FF8C00"
          customStyle="border-radius: 16rpx;"
          @click="payOrder(detail)"
        >
          重新支付
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";

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

const payOrder = () => {
  uni.$u.route("pagesSub/orderDetail?order_no=" + detail.value.order_no);
};
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  padding-bottom: env(safe-area-inset-bottom);
}
.header {
  background: #ff8c00;
  width: 100%;
  padding: 42rpx 34rpx 112rpx 34rpx;
  font-weight: bold;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 40rpx;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    font-size: 44rpx;
    color: #ffffff;
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12rpx 28rpx;
      border-radius: 30rpx 30rpx 30rpx 30rpx;
      border: 2rpx solid #ffffff;
      font-weight: bold;
      font-size: 24rpx;
      color: #ffffff;
    }
  }
}

.button-container {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 44rpx);
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .button {
    width: 100%;
    padding: 0 54rpx;
  }
}
</style>
