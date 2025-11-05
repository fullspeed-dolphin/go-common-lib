<template>
  <view class="page">
    <Navbar title="活动报名" :bgHeight="370" />

    <section class="section-assign">
      <view class="cell flex-between-center" @click="selectSigner()">
        <view class="flex-start">
          报名卡 <u-icon name="star-fill" color="#E53935" size="8"></u-icon>
        </view>
        <view class="flex-start">
          <view class="txt flex-row" :class="{ c70: !SignerInfo.id_card }">
            {{ SignerInfo.id_card ? SignerInfo.full_name : "请选择报名卡" }}
          </view>
          <u-icon
            name="arrow-right"
            size="34rpx"
            color="rgba(0,0,0,.9)"
          ></u-icon>
        </view>
      </view>
      <view class="cell flex-between-center">
        <view class="">跑团</view>
        <view class="flex-start" @click="openGroupPop()">
          <view class="txt" :class="{ c70: !myGroup.name }">
            {{ myGroup.name || "加入跑团" }}
          </view>
          <u-icon
            v-if="!myGroup.group_id"
            name="arrow-right"
            size="34rpx"
            color="rgba(0,0,0,.9)"
          ></u-icon>
        </view>
      </view>

      <view class="cell flex-between-center" style="margin-bottom: 30rpx">
        <view class="">全速码</view>
        <u-input
          placeholder="全速码"
          maxlength="5"
          border="none"
          v-model="verifyCode"
          inputAlign="right"
        >
        </u-input>
        <u-tag
          v-if="!!verifyCode.length"
          :text="computedCode.text"
          plain
          size="mini"
          :type="computedCode.isOk ? 'success' : 'error'"
        ></u-tag>
      </view>
    </section>

    <view class="section">
      <view class="section-title">选择距离</view>
      <view class="section-content">
        <view class="price-list">
          <view
            @click="changeTab(item)"
            v-for="(item, index) in priceList"
            :key="index"
          >
            <view
              class="price-item flex-center"
              :class="{ active: activeType.label === item.label }"
            >
              {{ item.label }}
              <u-checkbox
                shape="circle"
                activeColor="##8CC63E"
                inactiveColor="#ffffff"
                :checked="activeType.label === item.label"
              />
            </view>
          </view>
        </view>
      </view>
    </view>

    <section class="section">
      <section v-if="priceList.length" class="section-content payment-content">
        <view class="money flex-row" style="align-items: baseline">
          ￥{{ activeType.price }}
          <view class="txt"> ({{ activeType.label }}) </view>
        </view>
        <view
          class=""
          style="line-height: 34rpx; margin-bottom: 34rpx; font-size: 24rpx"
        >
          选择支付方式
        </view>
        <view class="flex-between-center method-cell">
          <image
            class="icon"
            src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/微信支付@2x.png"
            mode="aspectFill"
          ></image>
          <image
            class="dot-icon"
            src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-dot@2x.png"
            mode="aspectFill"
          ></image>
        </view>
      </section>
    </section>

    <section class="section-bottom">
      <view class="txt flex-start">
        <up-checkbox
          shape="circle"
          activeColor="#8CC63E"
          v-model:checked="isAgree"
          :usedAlone="true"
          :customStyle="{ marginRight: '-10rpx' }"
          size="32rpx"
        />
        <text @click="isAgree = !isAgree">
          <text class="ml5">我已阅读并同意该</text>
        </text>
        <text
          style="color: #ff8c00"
          @click="$u.route('pagesSub/settings/agreement?type=signUp')"
          >《用户协议》</text
        >以及
        <text
          style="color: #ff8c00"
          @click="$u.route('pagesSub/settings/agreement?type=baoxian')"
          >《保险须知》</text
        >
      </view>
      <view class="" style="padding: 56rpx 20rpx 80rpx">
        <u-button
          type="primary"
          color="#ff8c00"
          customStyle="border-radius: 16rpx;"
          @click="submitOrder()"
          >￥{{ activeType.price }} 支付</u-button
        >
      </view>
    </section>

    <GroupList ref="refGroupList" @success="getUserGroup()" />
    <UserLogin ref="refUserLogin" />
  </view>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";
import GroupList from "./components/groupList.vue";
import UserLogin from "@/components/UserLogin.vue";
import Navbar from "@/components/navbar.vue";
import { image } from "../uni_modules/uview-plus/libs/function/test";

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 使用store
const store = useStore();

// 模板引用
const refGroupList = ref(null);
const refUserLogin = ref(null);

// 响应式数据
const verifyCode = ref("");
const myGroup = ref({});
const activeType = ref({});
const isAgree = ref(false);
const SignerInfo = ref({});
const eventInfo = ref({});
const priceList = ref([]);
const computedCode = ref({});
const event_id = ref("");
const isSubmitting = ref(false);

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 监听verifyCode变化
watch(
  () => verifyCode.value,
  (newVal) => {
    let codeState = {
      isOk: false,
      text: "全速码无效",
    };

    computedCode.value = codeState;

    if (!verifyCode.value) return;

    const reg = /^[0-9a-zA-Z]*$/g;
    if (!reg.test(verifyCode.value) || verifyCode.value.length !== 5) {
      return;
    }

    getEventPrice();
  }
);

// 页面加载
onLoad((options) => {
  event_id.value = options.event_id;
});

// 页面显示
onShow(() => {
  getSignerInfo();
  getEventPrice();
  getUserGroup();
});

// 方法定义
const openGroupPop = () => {
  if (myGroup.value.group_id) return;

  refGroupList.value.open();
};

const getUserGroup = async () => {
  uni.showLoading({ mask: true });

  if (!userInfo.value.running_group) {
    myGroup.value = {};

    return;
  }

  try {
    let res = await proxy.$axios.get(
      `/running-group/api/v1/groups/info?group_id=${userInfo.value.running_group}`
    );
    if (res) {
      myGroup.value = res;
    }
  } catch (error) {
    console.error(error);
    //TODO handle the exception
  }

  uni.hideLoading();
};

const getSignerInfo = () => {
  const data = {
    phone_number: userInfo.value.phone,
  };
  proxy.$axios
    .post("/booking-api/registration/getSignerInfo", data)
    .then((res) => {
      SignerInfo.value = {
        ...res,
        ...(uni.getStorageSync("SignerInfo") || {}),
      };

      console.log(uni.getStorageSync("SignerInfo"), SignerInfo.value);
    });
};

const getEventPrice = (spxcode = null) => {
  uni.showLoading({
    mask: true,
  });
  const data = {
    event_id: event_id.value,
    spxcode: verifyCode.value,
  };
  proxy.$axios.post("/booking-api/user/price", data).then((res) => {
    // proxy.$axios.post('/booking-api/user/price?test_for_fullspeed', data).then(res => {
    eventInfo.value = res;

    if (res.spxcode_status === "ACT") {
      computedCode.value = {
        isOk: true,
        text: "全速码有效",
      };
    } else {
      computedCode.value = {
        isOk: false,
        text: "全速码无效",
      };
    }

    let priceListData = [];
    Object.keys(res).forEach((i) => {
      if (String(i).includes("km")) {
        priceListData.push({
          price: res[i],
          label: i?.toUpperCase(),
          km: parseFloat(i),
        });
      }
    });

    // 小距离在前
    priceListData.sort((a, b) => a.km - b.km);

    activeType.value = priceListData[0];
    priceList.value = priceListData;
  });
};

const selectSigner = () => {
  uni.$u.route("/pagesSub/registrationCard/list");
};

const changeTab = (item) => {
  activeType.value = item;
};

const submitOrder = () => {
  if (!store.state.userInfo.id) {
    return refUserLogin.value.open();
  }

  if (!SignerInfo.value.id_card) return proxy.$toast("请完善参赛者信息");

  const reg = /^[0-9a-zA-Z]*$/g;
  if (verifyCode.value) {
    if (!reg.test(verifyCode.value) || verifyCode.value.length !== 5) {
      return proxy.$toast("全速码 格式有误");
    }
  }

  if (!isAgree.value) return proxy.$toast("请勾选同意协议");

  const data = {
    ...SignerInfo.value,
    running_km: parseFloat(activeType.value.label),
    payment_method: "wechat",
    event_id: event_id.value,
    payment_amount: activeType.value.price,
    spxcode: computedCode.value.isOk ? verifyCode.value : null,
    running_group: String(userInfo.value.running_group || ""),
  };

  delete data.updated_at;
  delete data.status;
  delete data.created_at;

  if (isSubmitting.value) return;
  isSubmitting.value = true;
  uni.showLoading({
    mask: true,
  });
  proxy.$axios
    .post(`/booking-api/registration/SignInEvent`, data)
    .then((res) => {
      creatOrder(res.reg_no);
    })
    .catch((err) => {
      console.error(err);
      uni.hideLoading();
      uni.showModal({
        title: "提示",
        content: err.msg,
        showCancel: false,
      });
      isSubmitting.value = false;
    });
};

const getCode = async () => {
  return (
    await new Promise((resolve) => uni.login({ success: (e) => resolve(e) }))
  ).code;
};

const creatOrder = async (reg_no) => {
  const data = {
    reg_no,
    event_id: event_id.value,
    openid: userInfo.value.openid,
  };

  uni.showLoading({
    mask: true,
  });

  proxy.$axios.post(`/pay/wechat/payment`, data).then((res) => {
    console.log("res", res);
    uni.hideLoading();
    isSubmitting.value = false;
    wxPay(res);
  });
};

const wxPay = (respay) => {
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
        uni.$u.route("pagesSub/signUpStatus?order_no=" + respay.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      proxy.$toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + respay.order_no);
      }, 300);
    },
  });
};
</script>

<style lang="less">
.page {
  background: #fafafa;
}
.section-bottom {
  margin: 50rpx 34rpx;
}
.section-assign {
  .cell {
    width: 682rpx;
    height: 120rpx;
    padding: 0 20rpx;
    margin: 40rpx auto;
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
  }
  .txt {
    font-weight: 500;
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
    &.c70 {
      font-size: 26rpx;
      color: #999999;
    }
  }
}

.scroll-view {
  padding: 10rpx 34rpx;
}

::v-deep {
  .input-cell {
    padding: 0 !important;
  }
}
.section {
  margin-top: 48rpx;
  padding: 0 34rpx;
  width: 100%;
  .section-title {
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
    margin-bottom: 24rpx;
  }
  .section-content {
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    width: 100%;
    padding: 30rpx 20rpx;
  }
}
.price-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  .price-item {
    display: flex;
    padding: 0 32rpx;
    align-items: center;
    justify-content: space-between;
    height: 90rpx;
    background: #f6fafb;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
    &.active {
      background: #ff8c00;
      color: #ffffff;
    }
  }
}
.payment-content {
  padding: 64rpx 20rpx !important;
  .money {
    color: #e53935;
    font-size: 44rpx;
    line-height: 60rpx;
    margin-bottom: 30rpx;
    .txt {
      font-size: 34rpx;
      color: #000;
      margin-left: 20rpx;
    }
  }
  .method-cell {
    .icon {
      width: 58rpx;
      height: 56rpx;
    }
    .dot-icon {
      width: 32rpx;
      height: 32rpx;
    }
  }
}
</style>
