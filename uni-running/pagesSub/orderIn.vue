<template>
  <view class="page">
    <Navbar title="活动报名" :bgHeight="370" />

    <section class="section-assign">
      <view class="cell flex-between-center" @click="selectSigner()">
        <view class="flex-start">
          报名卡 <u-icon name="star-fill" color="#E53935" size="8"></u-icon>
        </view>
        <view class="flex-start">
          <view class="txt flex-row" :class="{ c70: !SignerInfo.id }">
            {{ SignerInfo.id ? SignerInfo.full_name : "请选择报名卡" }}
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
        <view class="verify-code-input-wrapper">
          <u-input
            placeholder="请输入全速码"
            maxlength="5"
            border="none"
            v-model="verifyCode"
            inputAlign="right"
            color="#000000"
            fontSize="30rpx"
            :placeholderStyle="'font-size: 26rpx; color: #999999;font-weight: 700;'"
          >
          </u-input>
        </view>
        <u-tag
          v-if="!!verifyCode.length"
          :text="computedCode.text"
          plain
          size="mini"
          :type="computedCode.isOk ? 'success' : 'error'"
        ></u-tag>
      </view>
      <view class="cell flex-between-center">
        <view class="cell-label"
          >参赛包领取地址<u-icon
            name="star-fill"
            color="#E53935"
            size="8"
          ></u-icon
        ></view>
        <view class="flex-start" @click="openAddressPicker()">
          <view class="txt" :class="{ c70: !selectedAddress }">
            {{ selectedAddress || "请选择地址" }}
          </view>
          <u-icon
            v-if="addressList.length > 0"
            name="arrow-right"
            size="34rpx"
            color="rgba(0,0,0,.9)"
          ></u-icon>
        </view>
      </view>
    </section>

    <view class="section">
      <view class="section-title">选择套餐</view>
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
          shape="circle"
          @click="submitOrder()"
          >￥{{ activeType.price }} 支付</u-button
        >
      </view>
    </section>

    <GroupList ref="refGroupList" @success="getUserGroup()" />
    <UserLogin ref="refUserLogin" />

    <!-- 参赛包领取地址选择器 -->
    <u-picker
      :show="showAddressPicker"
      :columns="[addressPickerColumns]"
      keyName="label"
      @confirm="confirmAddress"
      @cancel="showAddressPicker = false"
      title="请选择参赛包领取地址"
      confirmText="确定"
      cancelText="取消"
    ></u-picker>
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
const selectedAddress = ref("");
const addressList = ref([]);
const showAddressPicker = ref(false);
const addressPickerColumns = ref([]);

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 监听verifyCode变化
watch(
  () => verifyCode.value,
  (newVal) => {
    // let codeState = {
    //   isOk: false,
    //   text: "全速码无效",
    // };

    // computedCode.value = codeState;

    if (!verifyCode.value) return;

    console.log("verifyCode.value", verifyCode.value);

    // const reg = /^[0-9a-zA-Z]*$/g;
    if (verifyCode.value.length !== 5) {
      return;
    }

    getEventPrice();
  }
);

// 页面加载
onLoad((options) => {
  event_id.value = options.event_id;
  getEventPrice();
  getUserGroup();
  getEventAddresses();
});

// 页面显示
onShow(() => {
  getSignerInfo();
});

// 方法定义
const openGroupPop = () => {
  if (myGroup.value.group_id) return;

  refGroupList.value.open();
};

// 打开地址选择器
const openAddressPicker = () => {
  if (addressList.value.length === 0) {
    proxy.$toast("暂无可用地址");
    return;
  }
  showAddressPicker.value = true;
};

// 确认选择地址
const confirmAddress = (detail) => {
  if (detail && detail.value && detail.value[0]) {
    const selected = detail.value[0];
    selectedAddress.value = selected.label || selected;
  }
  showAddressPicker.value = false;
};

// 获取活动地址列表
const getEventAddresses = async () => {
  if (!event_id.value) return;

  try {
    const res = await proxy.$axios.get(
      `/event-api/api/v1/events/${event_id.value}`
    );

    // request.js 已经提取了 response.data，所以 res 直接是事件对象
    if (res && res.racekit_pickup_address) {
      try {
        // racekit_pickup_address 是 JSON 字符串，需要解析
        const addressData =
          typeof res.racekit_pickup_address === "string"
            ? JSON.parse(res.racekit_pickup_address)
            : res.racekit_pickup_address;

        if (
          addressData &&
          addressData.addresses &&
          Array.isArray(addressData.addresses)
        ) {
          addressList.value = addressData.addresses;
          // 转换为 picker 需要的格式
          addressPickerColumns.value = addressData.addresses.map(
            (addr, index) => ({
              label: addr,
              value: index,
            })
          );
        }
      } catch (parseError) {
        console.error("解析地址数据失败:", parseError);
      }
    }
  } catch (error) {
    console.error("获取活动地址失败:", error);
  }
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
  // 如果有选中的报名卡 id，使用它；否则使用默认逻辑
  const selectedSignerId = uni.getStorageSync("selectedSignerId");
  if (!selectedSignerId) {
    // 如果没有选中，保持原有逻辑或清空
    SignerInfo.value = {};
    return;
  }

  const data = {
    id: selectedSignerId,
  };
  console.log("data", data);
  proxy.$axios
    .post("/booking-api/registration/getSignerInfo", data)
    .then((res) => {
      SignerInfo.value = res;
    })
    .catch((error) => {
      console.error("获取报名卡信息失败:", error);
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

    console.log("res", res);

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
    res?.tickets?.map((ticket) => {
      Object.keys(ticket?.price || {}).forEach((i) => {
        const data = {
          price: ticket?.price[i],
          label: i,
        };
        console.log("data", data, ticket?.price);
        if (!activeType?.value?.label) {
          activeType.value = data;
        }
        priceListData.push(data);
      });
    });
		
		console.log("priceListData======>", priceListData)

    // 小距离在前
    // priceListData.sort((a, b) => a.km - b.km);

    // activeType.value = priceListData[0];
    priceList.value = priceListData;
		
		// 如果有选中数据，更新选中的数据
		if (activeType.value.label) {
			activeType.value = priceListData.find(i => i.label === activeType.value.label) || {}
		}
  });
};

const selectSigner = () => {
  // 传递 selectMode 参数，表示这是选择模式
  uni.$u.route("/pagesSub/registrationCard/list?selectMode=1");
};

const changeTab = (item) => {
  activeType.value = item;
};

const submitOrder = () => {
  if (!store.state.userInfo.id) {
    return refUserLogin.value.open();
  }

  if (!SignerInfo.value.id) return proxy.$toast("请完善参赛者信息");

  if (!selectedAddress.value) return proxy.$toast("请选择参赛包领取地址");

  // const reg = /^[0-9a-zA-Z]*$/g;
  // if (verifyCode.value) {
  //   if (!reg.test(verifyCode.value) || verifyCode.value.length !== 5) {
  //     return proxy.$toast("全速码 格式有误");
  //   }
  // }

  if (!isAgree.value) return proxy.$toast("请勾选同意协议");

  const data = {
    full_name: SignerInfo.value.full_name || null,
    id_card: SignerInfo.value.cert_number || null,
    gender: SignerInfo.value.gender || null,
    phone_number: SignerInfo.value.phone_number || null,
    tshirt_size: SignerInfo.value.tshirt_size || null,
    email: SignerInfo.value.email || null,
    blood_type: SignerInfo.value.blood_type || null,
    package: activeType.value.label,
    payment_method: "wechat",
    event_id: event_id.value,
    payment_amount: activeType.value.price,
    spxcode: computedCode.value.isOk ? verifyCode.value : null,
    running_group: String(userInfo.value.running_group || ""),
    racekit_pickup_address: selectedAddress.value || null,
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
        uni.$u.route("pagesSub/orderSuccess?order_no=" + respay.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      proxy.$toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/orderFail?order_no=" + respay.order_no);
      }, 300);
    },
  });
};
defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
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
  .verify-code-input-wrapper {
    .u-input__content__field-wrapper__field {
      font-weight: bold !important;
    }
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
.cell-label {
  white-space: nowrap;
  margin-right: 20rpx;
}
</style>
