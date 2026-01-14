<template>
  <view class="u-pb-30">
    <u-navbar autoBack placeholder title="订单详情"></u-navbar>
    <view class="group-item" style="border-radius: 16rpx; overflow: hidden">
      <view class="h4"> 活动信息 </view>
      <view
        class="flex-row"
        @click="$u.route(`pagesSub/eventDetail?id=${detail.event_id}`)"
      >
        <image
          class="poster"
          :src="
            detail.event_info.background_image_url ||
            'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
          "
          mode="aspectFill"
        ></image>
        <view class="text">
          <view class="flex-between-center" style="width: 420rpx">
            <view class="">
              <view class="name ellipsis2">{{
                detail.event_info.name || "活动"
              }}</view>
              <view class="city ellipsis"
                >创建时间: {{ detail.created_at }}</view
              >
            </view>
          </view>
          <view class="flex-between-center">
            <view class="flex-row">
              报名费用：
              <view class="ellipsis" style="color: red"
                >￥{{ detail.amount_yuan }}</view
              >
            </view>
            <u-button
              v-if="detail.status === 'PND'"
              type="primary"
              color="#19be6b"
              shape="circle"
              size="mini"
              @click="payOrder(item)"
            >
              微信支付
            </u-button>
          </view>
        </view>
      </view>
    </view>

    <section class="panel" style="padding: 0; overflow: hidden">
      <u-collapse :value="['order']">
        <u-collapse-item title="订单信息" name="order">
          <u-cell title="订单编号" :isLink="false">{{
            detail.order_no
          }}</u-cell>
          <u-cell title="订单状态" :isLink="false">
            <u-text
              v-if="detail.status == 'PND'"
              type="warning"
              text="待支付"
            ></u-text>
            <u-text
              v-if="detail.status == 'SUCC'"
              type="success"
              text="已付款"
            ></u-text>
            <u-text
              v-if="detail.status == 'FAIL'"
              type="error"
              text="失败"
            ></u-text>
            <u-text
              v-if="detail.status == 'RFND'"
              type="info"
              text="已退款"
            ></u-text>
            <u-text
              v-if="detail.status == 'CXL'"
              type="info"
              text="已取消"
            ></u-text>
            <u-text
              v-if="detail.status == 'EXP'"
              type="info"
              text="已过期"
            ></u-text>
          </u-cell>
          <u-cell title="创建时间" :isLink="false">{{
            detail.created_at
          }}</u-cell>
          <u-cell
            title="交易号"
            v-if="detail.transaction_id"
            :border="false"
            :isLink="false"
            >{{ detail.transaction_id }}</u-cell
          >
        </u-collapse-item>
      </u-collapse>
    </section>

    <section
      v-if="detail.sign_info"
      class="panel"
      style="padding: 0; overflow: hidden"
    >
      <u-collapse>
        <u-collapse-item title="报名信息" name="Docs guide">
          <u-cell title="姓名" :isLink="false">{{
            detail.sign_info.full_name
          }}</u-cell>
          <u-cell title="性别" :isLink="false">{{
            ["女", "男", "未知"][Number(detail.sign_info.gender)]
          }}</u-cell>
          <u-cell title="手机号码" :isLink="false">{{
            detail.sign_info.phone_number
          }}</u-cell>
          <u-cell title="T恤尺码" :isLink="false">{{
            detail.sign_info.tshirt_size
          }}</u-cell>
          <u-cell title="身份证号码" :isLink="false">{{
            detail.sign_info.id_card
          }}</u-cell>
          <u-cell
            title="血型"
            v-if="detail.sign_info.blood_type"
            :border="false"
            :isLink="false"
            >{{ detail.sign_info.blood_type }}</u-cell
          >
          <u-cell title="所在跑团" :border="false" :isLink="false">{{
            detail.sign_info.running_group
          }}</u-cell>
          <u-cell title="参赛号码" :border="false" :isLink="false">{{
            detail.sign_info.bib_number || "--"
          }}</u-cell>
        </u-collapse-item>
      </u-collapse>
    </section>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const detail = ref({
  event_info: {},
  sign_info: {},
});

onLoad(() => {
  detail.value = uni.getStorageSync("orderDetail");
});

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
      uni.$u.toast("支付成功");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      uni.$u.toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
  });
};
</script>

<style lang="scss" scoped>
.h4 {
  position: relative;
  font-weight: 800;
  font-size: 28rpx;
  color: #000000;
  line-height: 38rpx;
  padding-left: 20rpx;
  margin-bottom: 28rpx;
  &:before {
    position: absolute;
    content: "";
    width: 8rpx;
    left: 0;
    height: 38rpx;
    background: #ff8c00;
    border-radius: 4rpx 4rpx 4rpx 4rpx;
  }
}
.group-item {
  padding: 20rpx;
  box-shadow: 1px 1px 10rpx rgba(0, 0, 0, 0.1);
  margin: 30rpx;
  .poster {
    width: 124rpx;
    height: 124rpx;
    background: #f5f5f5;
    margin-right: 30rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }
  .name {
    line-height: 40rpx;
    margin-bottom: 12rpx;
    width: 480rpx;
  }
  .city {
    line-height: 28rpx;
    font-size: 20rpx;
    margin-bottom: 18rpx;
  }
  .desc {
    width: 422rpx;
    line-height: 26rpx;
    font-size: 18rpx;
  }
}

::v-deep {
  .u-collapse-item__content__text {
    padding: 20rpx !important;
  }
  .u-cell__body {
    font-size: 28rpx !important;
    padding: 16rpx 20rpx;
  }
  .u-collapse-item {
    & > .u-cell {
      .u-cell__title {
        position: relative;
        font-weight: 800;
        font-size: 28rpx;
        color: #000000;
        line-height: 38rpx;
        padding-left: 20rpx;
        // margin-bottom: 28rpx;
        &:before {
          position: absolute;
          content: "";
          width: 8rpx;
          left: 0;
          top: 4rpx;
          height: 38rpx;
          background: #ff8c00;
          border-radius: 4rpx 4rpx 4rpx 4rpx;
        }
      }
    }
  }
}
</style>
