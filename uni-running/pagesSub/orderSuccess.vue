<template>
  <view class="page">
    <Navbar :title="detail.event_info?.name || ''" placeholder />
    <view class="header">
      <view class="title">
        <view>报名成功！</view>
        <view class="btn" @click="viewEventDetail()">赛事详情</view>
      </view>
      <view v-if="countdownText">距离活动开始还有{{ countdownText }}</view>
      <view v-else>距离活动开始还有--</view>
      <view>
        报名后开始运动才能算有效成绩。先报名后开跑，该赛事为线下赛，暂不支持历史完赛成绩
      </view>
    </view>
    <view
      class="section info"
      v-for="(signInfo, index) in detail.sign_info_list"
      :key="index"
    >
      <view class="section-content">
        <view class="section-header">参赛人{{ index + 1 }}</view>
        <view class="section-items">
          <view class="section-item">
            <text class="label">姓名：</text>
            <text class="value">{{ signInfo?.full_name || "--" }}</text>
          </view>
          <!-- <view class="section-item">
            <text class="label">手机号码：</text>
            <text class="value">{{
              signInfo?.phone_number || "--"
            }}</text>
          </view> -->
          <view class="section-item">
            <text class="label">性别：</text>
            <text class="value">{{
              signInfo?.gender === "1" ? "男" : "女" || "--"
            }}</text>
          </view>
          <!-- <view class="section-item">
            <text class="label">身份证号码：</text>
            <text class="value">{{ signInfo?.id_card || "--" }}</text>
          </view> -->
          <view class="section-item">
            <text class="label">血型：</text>
            <text class="value">{{
              signInfo?.blood_type || "--"
            }}</text>
          </view>
          <!-- <view class="section-item">
            <text class="label">所在跑团：</text>
            <text class="value">{{
              signInfo?.running_group || "--"
            }}</text>
          </view> -->
          <view class="section-item">
            <text class="label">T恤尺码：</text>
            <text class="value">{{
              signInfo?.tshirt_size || "--"
            }}</text>
          </view>
          <view class="section-item address-item">
            <text class="label">参赛包领取地址：</text>
            <text class="value">{{
              signInfo?.racekit_pickup_address || "--"
            }}</text>
          </view>
          <view class="section-item" v-if="signInfo?.package">
            <text class="label">报名项目：</text>
            <text class="value">{{ signInfo.package }}</text>
          </view>
          <view class="section-item" v-if="detail.event_info?.name">
            <text class="label">参赛活动：</text>
            <text class="value">{{ detail.event_info.name }}</text>
          </view>
          <view class="section-item">
            <text class="label">报名时间：</text>
            <text class="value">{{
              dayjs(detail.created_at).format("YYYY-MM-DD HH:mm:ss") || "--"
            }}</text>
          </view>
          <view v-if="detail.order_no" class="section-item order-no-item">
            <text class="label">订单编号：</text>
            <text class="value">{{detail.order_no}}</text>
          </view>
        </view>
        <view class="section-actions">
          <u-button
            v-if="signInfo?.bib_url"
            type="primary"
            shape="circle"
            color="#FF8C00"
            @click="viewBib(signInfo)"
            >查看号码布</u-button
          >
          <u-button
            v-if="!signInfo?.bib_url"
            type="primary"
            plain
            shape="circle"
            color="#FF8C00"
            @click="viewBib(signInfo)"
            >查看号码布</u-button
          >
          <u-button
            v-if="signInfo?.certificate_url"
            type="primary"
            shape="circle"
            color="#FF8C00"
            @click="viewCertificate(signInfo)"
            >查看完赛证书</u-button
          >
          <u-button
            v-if="!signInfo?.certificate_url"
            type="primary"
            plain
            shape="circle"
            color="#FF8C00"
            @click="viewCertificate(signInfo)"
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
          <text>{{
            dayjs(detail.created_at)
              .add(24, "hour")
              .format("YYYY-MM-DD HH:mm:ss")
          }}</text>
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
          :color="canRefund ? '#FF8C00' : '#CCCCCC'"
          shape="circle"
          :disabled="!canRefund"
          @click="refundOrder(detail)"
        >
          {{ canRefund ? '申请退赛' : '已超过退赛时间' }}
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
import { ref, onUnmounted, watch, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import CommonDialog from "@/components/common/CommonDialog.vue";
import dayjs from "dayjs";
import Navbar from "@/components/navbar.vue";

const refundDialogRef = ref(null);
// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 响应式数据
const detail = ref({
  event_info: {},
  sign_info_list: [], // 改为数组，支持多个参赛人
  order_no: "",
  amount: 0,
  amount_yuan: 0,
  status: "",
  created_at: "",
  payment_params: {},
});
const order_no = ref("");
const loading = ref(false);
const countdownText = ref("");
let countdownTimer = null;

// 判断订单是否在24小时内
const isWithin24Hours = (createdAt) => {
  if (!createdAt) return false;
  const now = dayjs();
  const orderTime = dayjs(createdAt);
  const hoursDiff = now.diff(orderTime, "hour");
  return hoursDiff < 24;
};

// 计算是否可以退赛
const canRefund = computed(() => {
  return isWithin24Hours(detail.value.created_at);
});

// 格式化倒计时显示
const formatCountdown = (diff) => {
  if (diff <= 0) {
    return "活动已开始";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let parts = [];

  if (days > 0) {
    parts.push(`${days}天`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}小时`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes}分`);
  }
  parts.push(`${seconds}秒`);

  return parts.join("");
};

// 更新倒计时
const updateCountdown = () => {
  const eventTime = detail.value.event_info?.event_time;
  if (!eventTime) {
    countdownText.value = "";
    return;
  }

  const now = new Date();
  const diff = dayjs(eventTime).diff(dayjs(now));

  countdownText.value = formatCountdown(diff);

  // 如果倒计时结束，清除定时器
  if (diff <= 0) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }
};

// 启动倒计时
const startCountdown = () => {
  // 清除旧的定时器
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  // 立即更新一次
  updateCountdown();

  // 每秒更新一次
  countdownTimer = setInterval(() => {
    updateCountdown();
  }, 1000);
};

// 监听 detail.event_info.event_time 变化
watch(
  () => detail.value.event_info?.event_time,
  () => {
    if (detail.value.event_info?.event_time) {
      startCountdown();
    }
  },
  { immediate: true }
);

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

      // 兼容新旧数据结构
      if (storedDetail.sign_info_list && Array.isArray(storedDetail.sign_info_list)) {
        detail.value.sign_info_list = storedDetail.sign_info_list;
      } else if (storedDetail.sign_info) {
        detail.value.sign_info_list = [storedDetail.sign_info];
      } else {
        detail.value.sign_info_list = [];
      }

      // 如果存储的数据中有事件时间，启动倒计时
      if (storedDetail.event_info?.event_time) {
        startCountdown();
      }
    }
  }
});

// 获取订单详情
const getOrderDetail = () => {
  if (!order_no.value) {
    proxy.$toast("订单号不能为空");
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

  proxy.$axios
    .post(`/pay/order/status`, data)
    .then((res) => {
      console.log("订单详情 res", res);

      detail.value = res;

      // 兼容新旧数据结构
      if (res.sign_info_list && Array.isArray(res.sign_info_list)) {
        // 新结构：使用 sign_info_list
        detail.value.sign_info_list = res.sign_info_list;
      } else if (res.sign_info) {
        // 旧结构：将 sign_info 转换为数组
        detail.value.sign_info_list = [res.sign_info];
      } else {
        // 都没有，初始化为空数组
        detail.value.sign_info_list = [];
      }

      proxy.$axios
        .get(`/event-api/api/v1/events/${res.event_id}`)
        .then((eventRes) => {
          detail.value.event_info = eventRes;
          // 事件信息加载后启动倒计时
          if (eventRes?.event_time) {
            startCountdown();
          }
        });
      uni.hideLoading();
    })
    .catch((err) => {
      console.error("获取订单详情失败", err);
      uni.hideLoading();
      proxy.$toast(err.msg || "获取订单详情失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

const refundOrder = () => {
  if (!canRefund.value) {
    proxy.$toast("已超过退赛时间");
    return;
  }
  refundDialogRef.value.open();
};

const confirmRefund = () => {
  console.log("confirmRefund");

  if (!detail.value.order_no) {
    proxy.$toast("订单号不存在");
    refundDialogRef.value.close();
    return;
  }

  uni.showLoading({
    mask: true,
    title: "退款中...",
  });

  const params = {
    order_no: detail.value.order_no,
    reason: "用户申请退款",
    refund_amount: detail.value.amount,
  };

  proxy.$axios
    .post(`/pay/wechat/refund`, params)
    .then((res) => {
      uni.hideLoading();
      refundDialogRef.value.close();
      // 显示后端返回的消息
      const message = res.msg || res.message || res.data || JSON.stringify(res);
      proxy.$toast(message);
    })
    .catch((err) => {
      uni.hideLoading();
      refundDialogRef.value.close();
      // 显示后端返回的错误消息
      const errorMessage = err.msg || err.message || err.data || JSON.stringify(err);
      proxy.$toast(errorMessage);
    });
};

const closeRefund = () => {
  console.log("closeRefund");
};

const viewBib = (signInfo) => {
  if (!signInfo?.bib_url) {
    return proxy.$toast("暂无号码布");
  }
  uni.$u.route(`pagesSub/settings/webView?link=${signInfo.bib_url}`);
};

const viewCertificate = (signInfo) => {
  if (!signInfo?.certificate_url) {
    return proxy.$toast("暂无完赛证书");
  }
  uni.$u.route(
    `pagesSub/settings/webView?link=${signInfo.certificate_url}`
  );
};

const viewEventDetail = () => {
  uni.$u.route(`pagesSub/offlineEvents?id=${detail.value.event_id}`);
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});
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
      border-radius: 999rpx;
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

    // 多个参赛人卡片时，后续卡片添加间距
    &:not(:first-child) {
      margin-top: 24rpx;
    }
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
          width: 280rpx;
          flex-shrink: 0;
          letter-spacing: 2rpx;
          line-height: 44rpx;
        }
        .value {
          line-height: 44rpx;
        }
      }
      // 长文本自动换行（地址、订单编号）
      .address-item,
      .order-no-item {
        align-items: flex-start;
        .value {
          word-break: break-all;
          white-space: normal;
          flex: 1;
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
