<template>
  <view class="page">
    <u-navbar autoBack placeholder title="用户登录"></u-navbar>
    <view class="section-box flex-col-center">
      <image
        class="logo"
        src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png"
        mode="aspectFill"
      ></image>
      <view class="title flex-center">欢迎使用全速运动</view>
    </view>
    <view style="padding: 100rpx 104rpx 0">
      <PhoneLogin @success="successLogin" />
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PhoneLogin from "@/components/common/PhoneLogin.vue";

// 响应式数据
const options = ref({});

// 页面加载
onLoad((pageOptions) => {
  options.value = pageOptions;
});

// 方法定义
const successLogin = () => {
  if (options.value?.direct) {
    uni.navigateBack();
    return false;
  }

  uni.switchTab({
    url: "/pages/index",
    success() {
      uni.hideLoading();
    },
  });
};
</script>

<style lang="scss" scoped>
.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  background: #f5f5f5;
  outline: 1px solid #f5f5f5;
}
.title {
  margin-top: 50rpx;
  font-size: 40rpx;
  font-weight: 500;
}
.section-box {
  padding-top: 140rpx;
  margin-bottom: 105rpx;
}
</style>
