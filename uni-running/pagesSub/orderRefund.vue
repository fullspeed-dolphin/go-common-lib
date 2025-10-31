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
    <view class="button">
      <u-button
        type="primary"
        color="#FF8C00"
        customStyle="border-radius: 16rpx;"
        @click="refundOrder(detail)"
      >
        申请退赛
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import CommonDialog from "@/components/common/CommonDialog.vue";

const refundDialogRef = ref(null);
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

const refundOrder = () => {
  refundDialogRef.value.open();
};

const confirmRefund = () => {
  console.log("confirmRefund");
};

const closeRefund = () => {
  console.log("closeRefund");
};

// 方法定义
const payOrder = (item) => {
  const respay = item.payment_params;
  // 触发微信支付
  wx.requestPayment({
    timeStamp: respay.timeStamp,
    nonceStr: respay.nonceStr,
    package: respay.package,
    signType: respay.signType,
    paySign: respay.paySign,
    success: (res) => {
      uni.hideLoading();
      proxy.$toast("支付成功");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      proxy.$toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
  });
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
  padding: 42rpx 34rpx 142rpx 34rpx;
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

.refund-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 26rpx 0 44rpx 0;
}
</style>
