<template>
  <view class="page">
    <u-navbar autoBack placeholder title="第四届十全十美欢乐跑"></u-navbar>
    <view class="header">
      <view class="title">
        <view>报名成功！</view>
        <view class="btn">赛事详情</view>
      </view>
      <view>距离报名开始还有1天8小时49分59秒</view>
      <view>
        报名后开始运动才能算有效成绩。先报名后开跑，该赛
        事为线下赛，暂不支持历史完赛成绩
      </view>
    </view>
    <view class="section info">
      <view class="section-content">
        <view class="section-header">我的报名信息</view>
        <view class="section-items">
          <view class="section-item">
            <text class="label">姓名：</text>
            <text class="value">张三</text>
          </view>
          <view class="section-item">
            <text class="label">报名时间：</text>
            <text class="value">2025-01-01 12:00:00</text>
          </view>
          <view class="section-item">
            <text class="label">报名套餐</text>
            <text class="value">基本套餐</text>
          </view>
          <view class="section-item">
            <text class="label">参赛项目</text>
            <text class="value">10.10km欢乐跑</text>
          </view>
        </view>
        <view class="section-actions">
          <u-button
            type="primary"
            plain
            shape="circle"
            color="#FF8C00"
            @click="payOrder(detail)"
            size="small"
            >查看号码布</u-button
          >
          <u-button
            type="primary"
            plain
            shape="circle"
            color="#FF8C00"
            @click="payOrder(detail)"
            size="small"
            >查看完赛证书</u-button
          >
        </view>
      </view>
    </view>
    <view class="refund">
      <view class="refund-title">本赛事已开启退赛服务</view>
      <view class="refund-content">
        <view>
          <text>退赛服务截止时间：</text>
          <text>2025-10-13 15:03:16</text>
        </view>
        <view> 规定： </view>
        <view>
          1、支付成功起<text class="red">24小时</text>内退赛，全额退报名费
        </view>
        <view>
          2、报名后<text class="red">24小时</text>超出比赛结束时间的，无法退赛
        </view>
        <view>
          3、支付成功后<text class="red">24小时</text>内如已发货，不支持退款
        </view>
        <view>
          4、报名后<text class="red">24小时</text>内完赛，不支持退赛退款
        </view>
        <view> 5、退赛服务截止后，不再受理任何退赛申请 </view>
      </view>
      <view class="refund-button">
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
    <CommonDialog
      ref="refundDialogRef"
      confirmButtonTxt="确认"
      cancelButtonTxt="取消"
      @confirm="confirmRefund"
      @close="closeRefund"
    >
      <view class="refund-dialog-content">
        <view class="refund-dialog-title">确认退赛？</view>
        <view class="refund-dialog-desc">
          退赛后将不再保留号码，相关费用(如有)将原路返回
        </view>
      </view>
    </CommonDialog>
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
  uni.$u.route("pagesSub/orderRefund");
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
.section {
  &.info {
    margin-top: -100rpx;
  }
  padding: 0 34rpx;
  .section-content {
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    width: 100%;
    padding: 26rpx 20rpx;
    .section-header {
      font-weight: bold;
      font-size: 32rpx;
      color: #000000;
      padding-bottom: 26rpx;
      margin-bottom: 26rpx;
      border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
    }
    .section-items {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28rpx;
      font-weight: bold;
      font-size: 32rpx;
      color: #000000;
      .section-item {
        display: flex;
        align-items: center;
        gap: 24rpx;
        .label {
          width: 200rpx;
          flex-shrink: 0;
          letter-spacing: 2rpx;
        }
      }
    }
  }
  .section-actions {
    margin-top: 28rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18rpx;
  }
}
.refund {
  margin-top: 48rpx;
  padding: 0 54rpx;
  .refund-title {
    font-weight: 800;
    font-size: 32rpx;
    color: #000000;
    padding-bottom: 18rpx;
  }
  .refund-content {
    font-weight: bold;
    font-size: 28rpx;
    color: #000000;
    line-height: 48rpx;
    margin-bottom: 26rpx;
    .red {
      color: #e53935;
    }
  }
  .refund-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 26rpx 0 44rpx 0;
  }
}
.refund-dialog-content {
  padding: 48rpx 48rpx 24rpx 48rpx;
  text-align: center;
  .refund-dialog-title {
    font-weight: bold;
    font-size: 34rpx;
    color: #353535;
    padding-bottom: 24rpx;
  }
  .refund-dialog-desc {
    font-weight: bold;
    font-size: 28rpx;
    color: #999999;
    line-height: 40rpx;
  }
}
</style>
