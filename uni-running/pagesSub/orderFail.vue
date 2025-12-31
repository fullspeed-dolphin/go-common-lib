<template>
  <view class="page">
    <u-navbar :title="detail.event_info?.name || ''" placeholder />

    <view class="header">
      <view class="title">
        <view>报名失败！</view>
        <view class="btn" @click="goHome">返回首页</view>
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
          shape="circle"
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
import request from "@/utils/request.js"

// 响应式数据
const detail = ref({
  event_info: {},
  sign_info: {},
  order_no: "",
  amount: 0,
  amount_yuan: 0,
  status: "",
  created_at: "",
  payment_params: {},
});
const order_no = ref("");
const loading = ref(false);

// 页面加载
onLoad((options) => {
  order_no.value = options.order_no || "";
  if (order_no.value) {
    getOrderDetail();
  } else {
    // 兼容旧逻辑：从存储中获取
    const storedDetail = uni.getStorageSync("orderDetail");
    if (storedDetail) {
      detail.value = storedDetail;
    }
  }
});

// 获取订单详情
const getOrderDetail = () => {
  if (!order_no.value) {
    uni.$u.toast("订单号不能为空");
    return;
  }

  loading.value = true;
  uni.showLoading({
    mask: true,
    title: "加载中...",
  });

  const data = {
    order_no: order_no.value,
  };

  request.post(`/pay/order/status`, data)
    .then((res) => {
      console.log("订单详情 res", res);
      detail.value = res;
      // 确保 sign_info 存在
      if (!detail.value.sign_info) {
        detail.value.sign_info = {};
      }
      request.get(`/event-api/api/v1/events/${res.event_id}`)
        .then((eventRes) => {
          detail.value.event_info = eventRes;
        });
      uni.hideLoading();
    })
    .catch((err) => {
      console.error("获取订单详情失败", err);
      uni.hideLoading();
      uni.$u.toast(err.msg || "获取订单详情失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

const payOrder = () => {
  // 触发微信支付
  wx.requestPayment({
    timeStamp: detail.value.payment_params.timeStamp,
    nonceStr: detail.value.payment_params.nonceStr,
    package: detail.value.payment_params.package,
    signType: detail.value.payment_params.signType,
    paySign: detail.value.payment_params.paySign,
    success: (res) => {
      uni.hideLoading();
      uni.$u.toast("支付成功");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/orderSuccess?order_no=" + detail.value.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      uni.$u.toast("支付未完成");
    },
  });
};

const goHome = () => {
  uni.reLaunch({
    url: "/pages/index",
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
