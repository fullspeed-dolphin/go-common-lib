<template>
  <view class="page">
    <u-navbar :title="detail.event_info?.name || ''" placeholder />
    <view class="header" :style="{ background: headerBg }">
      <view class="title">
        <view>报名成功！</view>
        <view class="btn" @click="viewEventDetail()">赛事详情</view>
      </view>
      <template v-if="isOfflineEvent && eventStarted">
        <view>活动已经结束，感谢您的参与</view>
      </template>
      <template v-else>
        <view v-if="countdownText && !eventStarted">距离活动开始还有{{ countdownText }}</view>
        <view v-else-if="eventStarted">活动已开始</view>
        <view v-else>距离活动开始还有--</view>
        <view>
          报名后开始运动才能算有效成绩。先报名后开跑，该赛事为线下赛，暂不支持历史完赛成绩
        </view>
      </template>
    </view>
    <view class="section info" v-for="(signInfo, index) in detail.sign_info_list" :key="index">
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
          <u-button v-if="signInfo?.bib_url" type="primary" shape="circle" :color="themeColor" @click="viewBib(signInfo)">查看号码布</u-button>
          <u-button v-if="!signInfo?.bib_url" type="primary" plain shape="circle" :color="themeColor" @click="viewBib(signInfo)">查看号码布</u-button>
          <u-button v-if="signInfo?.certificate_url" type="primary" shape="circle" :color="themeColor" @click="viewCertificate(signInfo)">查看完赛证书</u-button>
          <u-button v-if="!signInfo?.certificate_url" type="primary" plain shape="circle" :color="themeColor" @click="viewCertificate(signInfo)">查看完赛证书</u-button>
        </view>
      </view>
    </view>
    <view class="refund">
      <view v-if="detail.amount === 0" class="refund-free-tip">0元赛事无法退赛</view>
      <template v-else>
        <view class="refund-title">本赛事已开启退赛服务</view>
        <view class="refund-content">
          <view>
            <text>退赛服务截止时间：</text>
            <text>{{ refundDeadline }}</text>
          </view>
          <view> 规定： </view>
          <view>
            1、支付成功起<text class="red">{{ refundValidHour }}小时</text>内退赛，全额退报名费
          </view>
          <view>
            2、报名后<text class="red">{{ refundValidHour }}小时</text>超出比赛结束时间的，无法退赛
          </view>
          <view>
            3、支付成功后<text class="red">{{ refundValidHour }}小时</text>内如已发货，不支持退款
          </view>
          <view>
            4、报名后<text class="red">{{ refundValidHour }}小时</text>内完赛，不支持退赛退款
          </view>
          <view> 5、退赛服务截止后，不再受理任何退赛申请 </view>
        </view>
      </template>
    </view>
    <!-- 底部悬浮按钮 -->
    <view class="bottom-bar" v-if="detail.amount > 0">
      <u-button type="primary" :color="themeColor" shape="circle" @click="refundOrder(detail)">
        {{ canRefund ? '申请退赛' : '已超过退赛时间' }}
      </u-button>
    </view>
    <CommonDialog ref="refundDialogRef" confirmButtonTxt="确认" cancelButtonTxt="取消" @confirm="confirmRefund" @close="closeRefund">
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
import { onLoad, onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import CommonDialog from "@/components/common/CommonDialog.vue";
import dayjs from "dayjs";

const refundDialogRef = ref(null);

// 路由参数
const routeOrderNo = ref('');

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

// 是否为线下活动
const isOfflineEvent = computed(() => detail.value.order_type !== 'online_events');
// 活动是否已开始
const eventStarted = computed(() => countdownText.value === '活动已开始');

// 动态主题色（基于 color_config）
const themeColor = computed(() => detail.value.event_info?.color_config?.solid || '#FF8C00');
const themeGradient = computed(() => {
  const g = detail.value.event_info?.color_config?.gradient;
  if (g?.length === 2) return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
  return null;
});
const headerBg = computed(() => themeGradient.value || themeColor.value);

// 获取退款有效时间（小时），默认24小时
const refundValidHour = computed(() => {
  return detail.value.refund_valid_hour || 24;
});

// 判断订单是否在退款有效期内
const isWithinRefundPeriod = (createdAt, validHours) => {
  if (!createdAt) return false;
  const now = dayjs();
  const orderTime = dayjs(createdAt);
  const hoursDiff = now.diff(orderTime, "hour", true); // true 返回浮点数，更精确
  return hoursDiff < validHours;
};

// 计算是否可以退赛
const canRefund = computed(() => {
  return isWithinRefundPeriod(detail.value.created_at, refundValidHour.value);
});

// 计算退款截止时间
const refundDeadline = computed(() => {
  if (!detail.value.created_at) return "";
  return dayjs(detail.value.created_at)
    .add(refundValidHour.value, "hour")
    .format("YYYY-MM-DD HH:mm:ss");
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
  routeOrderNo.value = options.order_no || "";
  if (order_no.value) {
    getOrderDetail();
  } else {
    // 兼容旧逻辑：没有 order_no 时从存储中获取
    const storedDetail = uni.getStorageSync("orderDetail");
    if (storedDetail) {
      detail.value = storedDetail;

      // 兼容新旧数据结构
      let infoList = [];
      if (
        storedDetail.sign_info_list &&
        Array.isArray(storedDetail.sign_info_list)
      ) {
        infoList = storedDetail.sign_info_list;
      } else if (storedDetail.sign_info) {
        infoList = [storedDetail.sign_info];
      }
      // 剔除证书 / 号码布 URL，避免显示过期快照（会在 onShow 重新拉接口时覆盖）
      detail.value.sign_info_list = infoList.map((info) => ({
        ...info,
        certificate_url: "",
        bib_url: "",
      }));

      // 如果存储的数据中有事件时间，启动倒计时
      if (storedDetail.event_info?.event_time) {
        startCountdown();
      }
    }
  }
});

// 每次页面显示（包括从证书预览/号码布返回）都刷新一次，保证 certificate_url 最新
onShow(() => {
  if (order_no.value) {
    getOrderDetail();
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

  request
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

      const eventApiPath = res.order_type === 'online_events'
        ? `/event-api/online_events/${res.event_id}`
        : `/event-api/api/v1/events/${res.event_id}`;
      request
        .get(eventApiPath)
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
      uni.$u.toast(err.msg || "获取订单详情失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

const refundOrder = () => {
  if (!canRefund.value) {
    uni.$u.toast("已超过退赛时间");
    return;
  }
  refundDialogRef.value.open();
};

const confirmRefund = () => {
  console.log("confirmRefund");

  if (!detail.value.order_no) {
    uni.$u.toast("订单号不存在");
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

  request
    .post(`/pay/wechat/refund`, params)
    .then((res) => {
      refundDialogRef.value.close();
      uni.$u.toast("申请成功，请注意退款信息");
    })
    .catch((err) => {
      refundDialogRef.value.close();
    });
};

const closeRefund = () => {
  console.log("closeRefund");
};

const viewBib = (signInfo) => {
  if (!signInfo?.bib_url) {
    return uni.$u.toast("暂无号码布");
  }
  uni.$u.route(`pagesSub/settings/webView?link=${signInfo.bib_url}`);
};

const viewCertificate = (signInfo) => {
  if (!signInfo?.certificate_url) {
    return uni.$u.toast("暂无完赛证书");
  }
  // 拼时间戳禁用图片缓存：证书内容可能更新但 URL 不变，强制每次拉新
  const sep = signInfo.certificate_url.includes('?') ? '&' : '?';
  const url = `${signInfo.certificate_url}${sep}v=${Date.now()}`;
  uni.previewImage({
    urls: [url],
    current: url,
  });
};

const viewEventDetail = () => {
  if (detail.value.order_type === 'online_events') {
    uni.$u.route(`pagesDashboard/pkEvent/pkEvent?id=${detail.value.event_id}`);
  } else {
    uni.$u.route(`pagesSub/eventDetail?id=${detail.value.event_id}`);
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});
</script>

<style lang="scss" scoped>
.page {
  background: #fafafa;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
.header {
  // background 由内联样式动态设置（themeColor / themeGradient），此处仅做 fallback
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
      font-weight: bold;
      font-size: 28rpx;
      color: #000000;
      
      .section-item {
        display: flex;
        gap: 24rpx;
        padding: 12rpx;
        
        // 单数行
        &:nth-child(odd) {
          background-color: #ffffff;
        }
        
        // 双数行
        &:nth-child(even) {
          background-color: #f7f7f7;
        }
        
        .label {
          width: 280rpx;
          flex-shrink: 0;
          letter-spacing: 2rpx;
          line-height: 44rpx;
        }
        
        .value {
          line-height: 44rpx;
          word-wrap: break-word;      // 允许长单词或URL换行
          word-break: break-all;      // 允许在任意字符间换行
          white-space: normal;        // 正常换行（默认值）
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
  .refund-free-tip {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    padding: 26rpx 0;
  }
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
    .red {
      color: #e53935;
    }
  }
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 54rpx;
  z-index: 10;
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
