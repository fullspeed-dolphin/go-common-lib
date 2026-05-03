<template>
  <view class="info" :style="themeStyle">
    <u-navbar autoBack placeholder title="活动报名"></u-navbar>
    <up-form :model="form" ref="uForm" :rules="formRules" labelPosition="left" labelWidth="80">
      <view class="card-section">
        <view class="title">参赛者信息</view>
        <view class="content">
          <up-form-item label="真实姓名" prop="real_name" required>
            <view class="flex-start">
              <input v-model="form.real_name" style="width:100%" @input="validateField('real_name')" maxlength="50" placeholder-style="color: #C8C9CD;" placeholder="请输入您的真实姓名" />
            </view>
          </up-form-item>
          <up-form-item label="联系电话" prop="contact_number" required>
            <view class="flex-start">
              <input v-model="form.contact_number" @input="validateField('contact_number')" maxlength="11" placeholder-style="color: #C8C9CD;" placeholder="请输入您的联系电话" />
            </view>
          </up-form-item>
          <template v-if="requireCert">
            <up-form-item label="证件类型" prop="cert_type" required>
              <view class="flex-start">
                <PickerCell v-model="form.cert_type" :border="false" @change="validateField('cert_type')" :columns="cert_typeOptions" />
              </view>
            </up-form-item>

            <up-form-item label="证件号码" prop="cert_number" required>
              <view class="flex-start">
                <input v-model="form.cert_number" class="u-input" @input="validateField('cert_number')" maxlength="18" placeholder-style="color: #C8C9CD;" placeholder="请输入您的证件号码" />
              </view>
            </up-form-item>
          </template>
          <up-form-item label="收货地址" prop="shipping_address" required>
            <view class="flex-start">
              <up-input v-model="form.shipping_address" border="none" @change="validateField('shipping_address')" maxlength="100" placeholder="请输入您的收货地址">
                <template #suffix>
                  <view class="map-btn" @click="chooseAddress">
                    <up-icon name="map-fill" size="36rpx" :color="pkEventTheme?.solid || '#ff5c5c'" />
                  </view>
                </template>
              </up-input>
            </view>
          </up-form-item>
        </view>
      </view>
      <!-- <view class="card-section ">
        <view class="content">
          <view style="margin:0 32rpx">
            <view class="tips">参赛项目（提交后不能修改）</view>
            <u-radio-group v-model="radiovalue1" placement="column" @change="groupChange">
              <u-radio :customStyle="{ marginBottom: '8px' }" v-for="(item, index) in radiolist1" :key="index" :label="item.name" :name="item.name" @change="radioChange">
              </u-radio>
            </u-radio-group>
          </view>
        </view>
      </view> -->
    </up-form>

    <view class="card-section">
      <view class="title">
        选择套餐款式
      </view>
      <SkuForm v-model="currentSku" :packageData="routerParams" />
    </view>

    <section class="section-bottom" style="width: 682rpx;margin: 20rpx auto 40rpx;">
      <view class="txt flex-start">
        <up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true" :customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
        <text @click="isAgree = !isAgree">
          <text class="u-ml-5">我已阅读并同意该</text>
        </text>
        <text style="color: #ff8c00" @click="$u.route('pagesDashboard/pkEvent/activeRule?type=disclaimer')">《免责声明》</text>
      </view>
    </section>

    <div style="height: 120rpx;"></div>
    <view class="submit-wrapper flex-between-center">
      <!-- <view class="" style="font-size: 24rpx;color: #6A7282;">
        应付金额
        <view class="u-mt-10" style="font-weight: bold;font-size: 40rpx;color: #ff5c5c;">
          ￥{{packageList.find((item) => item.id === form.package_id)?.price || "0.00"}}
        </view>
      </view> -->
      <u-button type="primary" :color="`linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})`"
        :style="{ background: `linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})` }" shape="circle" customStyle="width: 686rpx;height: 72rpx;margin:0;border-radius: 999rpx;"
        :class="{ 'btn-disabled': !currentSku.id }" @click="submitForm()">
        <!-- {{props.teamID ? '加入战队并报名' : '立即报名'}} -->
        立即报名
      </u-button>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import FileUpload from "@/components/common/FileUpload.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import SkuForm from "./SkuForm.vue";

import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

const uForm = ref(null);
const activetyId = ref("");

function backToEventHome() {
  const pages = getCurrentPages();
  const idx = pages.findIndex(p => p.route?.endsWith('pkEvent/pkEvent'));
  if (idx >= 0) {
    uni.navigateBack({ delta: pages.length - 1 - idx });
  } else {
    uni.redirectTo({ url: `/pagesDashboard/pkEvent/pkEvent?id=${activetyId.value}` });
  }
}

const isAgree = ref(false);
const props = defineProps({
  teamID: {
    type: String,
    default: "",
  },
});

const currentSku = ref({});

const routerParams = ref({});
onLoad((options) => {
  console.log("option", options);
  if (options.packageUrl) {
    options.packageUrl = decodeURIComponent(options.packageUrl);
  }
  activetyId.value = options.eventId;
  routerParams.value = options;

  getUserStatus();
});

const form = ref({
  real_name: "",
  contact_number: "",
  shipping_address: "",
  package_id: "",
  cert_type: "",
  cert_number: "",
});

const requireCert = computed(() => routerParams.value.requireCert == 1);

function validateField(propName) {
  uForm.value.validateField(propName, () => {}, "change");
}

const cert_typeOptions = [
  {
    label: "身份证",
    value: "CN_ID",
  },
  {
    label: "香港居民身份证",
    value: "HK_ID",
  },
  {
    label: "澳门居民身份证",
    value: "MA_ID",
  },
  {
    label: "港澳居民往来大陆通行证(回乡证)",
    value: "HK_MA_PASS",
  },
	{
	  label: "护照",
	  value: "PASSPORT",
	},
];
const imageSrc = ref("https://uviewui.com/album/1.jpg");
const radiovalue1 = ref("3.14公里");
const radiolist1 = ref([
  {
    name: "3.14公里",
    disabled: false,
  },
  {
    name: "5.20公里",
    disabled: false,
  },
]);
// 姓名校验：2-12个中文，允许间隔号·（新疆等少数民族姓名）
	const validateChineseName = (rule, value, callback) => {
		const name = (value || '').trim();
		if (!name) return callback(new Error('请填写姓名'));
		if (!/^[\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF\u00b7]+$/.test(name)) return callback(new Error('姓名仅支持中文和间隔号·'));
		if (/^\u00b7|\u00b7$/.test(name)) return callback(new Error('间隔号不能在姓名首尾'));
		if (/\u00b7{2}/.test(name)) return callback(new Error('间隔号不能连续使用'));
		const chineseCount = name.replace(/\u00b7/g, '').length;
		if (chineseCount < 2) return callback(new Error('姓名至少2个中文字'));
		if (chineseCount > 12) return callback(new Error('姓名不能超过12个中文字'));
		callback();
	};
const formRules = ref({
  real_name: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
    {
			validator: validateChineseName,
			trigger: ["blur"]
		}
  ],
  contact_number: [
    {
      required: true,
      message: "请输入手机号码",
      trigger: ["blur", "change"],
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur", "change"],
    },
  ],
  shipping_address: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  cert_type: [
    {
      required: false,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  cert_number: [
    {
      required: false,
      message: "必填项",
      trigger: ["blur", "change"],
    },
    {
      pattern: /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/,
      message: "请输入正确的身份证号码",
      trigger: ["blur", "change"],
    },
  ],
  package_id: [
    {
      required: true,
      message: "请选择套餐",
      trigger: ["blur", "change"],
    },
  ],
});

watch(requireCert, (val) => {
  formRules.value.cert_type[0].required = val;
  formRules.value.cert_number[0].required = val;
}, { immediate: true });

watch(
  () => form.value.cert_type,
  () => {
    formRules.value.cert_number = [
      {
        required: requireCert.value,
        message: "必填项",
        trigger: ["blur", "change"],
      },
      {
        validator: (rule, value, callback) => {
          const type = form.value.cert_type;
          const typeMapping = {
            CN_ID: "idCard",
            HK_ID: "isValidHKId",
            MA_ID: "isValidMacauId",
            HK_MA_PASS: "isValidExitPermit",
            PASSPORT: "isValidPassport",
          };
          const validatorFuncName = typeMapping[type];
          if (!validatorFuncName) {
            callback(new Error("未知的证件类型"));
            return;
          }
          const validatorFunc = uni.$u.test[validatorFuncName];
          return validatorFunc(value);
        },
        message: "请输入正确的证件号码",
        trigger: ["blur", "change"],
      },
    ];
  }
);
// 获取套餐列表
const packageList = ref([]);


const userStatusInfo = ref({});
function getUserStatus() {
  request
    .get(
      "/event-api/online_events_team/user_status?event_id=" + activetyId.value, {}, { showError: false }
    )
    .then((res) => {
      userStatusInfo.value = res;
    }).catch(() => {});
}

const isSubmitting = ref(false);
const submitForm = () => {
  if (isSubmitting.value) return;
  uForm.value.validate().then((res) => {
    if (!isAgree.value) return uni.$u.toast("请查阅并勾选免责声明~");
    if (!currentSku.value?.id) return uni.$u.toast("请选择套餐款式~");

    isSubmitting.value = true;
    // 未加入战队需要先加入战队
    if (!userStatusInfo.value.in_team) {
      joinTeamAPi();
      return false;
    }

    signUpEvent();
  });
};

// 报名活动
function signUpEvent() {
  uni.showLoading({
    mask: true,
  });

  const data = {
    ...form.value,
    package_id: routerParams.value.packageId,
    event_id: routerParams.value.eventId,
    sku_id: currentSku.value?.id || "",
  };

  request
    .post("/booking-api/online_events/registration", data)
    .then(async (res) => {
      // 检测到package的price为0的情况下，调用此接口，不要走支付接口
      const isFree = currentSku.value.price === 0;
      if (isFree) {
        freeToPay(res.reg_no);
      } else {
        payOrder(res.reg_no);
      }
    })
    .catch(() => {
      isSubmitting.value = false;
      uni.hideLoading();
    });
}

//加入战队
function joinTeamAPi(item) {
  console.log("joinTeamAPi", item);
  uni.showLoading({
    mask: true,
  });

  request
    .post("/event-api/online_events_team/join", {
      event_id: activetyId.value,
      team_id: props.teamID || routerParams.value.teamId,
    })
    .then(() => {
      // 标记已加入，防止重试时重复调用 join 接口
      userStatusInfo.value.in_team = true;
      signUpEvent();
    })
    .catch((e) => {
      console.log("e", e);
      isSubmitting.value = false;
      uni.hideLoading();
    });
}

function changePackage(id) {
  form.value.package_id = id;
}

const isFreePackage = computed(() => {
  const pkg = packageList.value.find((i) => i.id === form.value.package_id);
  return pkg?.price === 0;
});

function chooseAddress() {
  uni.chooseLocation({
    success: (res) => {
      const addr = res.address || "";
      const name = res.name || "";

      if (addr) {
        form.value.shipping_address = addr.includes(name)
          ? addr
          : addr + " " + name;
        validateField("shipping_address");
      } else if (res.latitude && res.longitude) {
        // address 为空，用高德逆地理编码 REST API 获取完整地址
        wx.request({
          url: "https://restapi.amap.com/v3/geocode/regeo",
          data: {
            key: "86473c6f37b174b14803c2c118c4ab62",
            location: `${res.longitude},${res.latitude}`,
          },
          success: (apiRes) => {
            const regeoAddr = apiRes.data?.regeocode?.formatted_address || "";
            form.value.shipping_address = regeoAddr
              ? regeoAddr + " " + name
              : name;
            validateField("shipping_address");
          },
          fail: () => {
            form.value.shipping_address = name;
            validateField("shipping_address");
          },
        });
      } else {
        form.value.shipping_address = name;
        validateField("shipping_address");
      }
    },
  });
}

const payOrder = async (reg_no) => {
  const data = {
    reg_no,
    event_id: activetyId.value,
    openid: userInfo.value.openid,
    order_type: "online_events",
  };

  uni.showLoading({
    mask: true,
  });

  request.post(`/pay/wechat/payment`, data).then((res) => {
    wxPay(res);
  }).catch(() => {
    uni.hideLoading();
  });
};

function freeToPay(reg_no) {
  const data = {
    reg_no,
    event_id: activetyId.value,
    status: "SUCC",
  };
  request
    .post(`/booking-api/online_events/registration/status`, data)
    .then(() => {
      uni.hideLoading();
      uni.$u.toast("报名成功");
      setTimeout(() => {
        backToEventHome();
      }, 300);
    })
    .catch(() => {
      uni.hideLoading();
    });
}

function wxPay(respay) {
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
        backToEventHome();
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      uni.$u.toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        // uni.$u.route("pagesSub/orderFail?order_no=" + respay.order_no);
      }, 300);
    },
  });
}
</script>

<style lang="less" scoped>
.info {
  background: #f7f8f8;
  // padding:32rpx;
}

.input-wrap {
  height: 100rpx;
  padding-left: 30rpx;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #e2e8f0;
}

.map-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e2e8f0;
  background: #fafafa;
  margin-right: 10rpx;
}

.package-item {
  width: 686rpx;
  min-height: 222rpx;
  padding: 42rpx 20rpx 32rpx 34rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx solid #e2e8f0;
  margin-bottom: 20rpx;
  position: relative;

  .recommended-tag {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: var(--theme-gradient, #ff5c5c);
    color: #fff;
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }

  .package-image {
    flex-shrink: 0;
    width: 80rpx;
    height: 80rpx;
    background: #f3f4f6;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
    margin-right: 26rpx;
    font-size: 40rpx;
    font-weight: 500;
  }

  .name {
    font-weight: 500;
    line-height: 48rpx;
    font-size: 32rpx;
    color: #101828;
  }

  .target {
    line-height: 48rpx;
    font-size: 32rpx;
    color: var(--theme-color, #ff5c5c);
    font-weight: 500;
    margin-bottom: 10rpx;
  }

  &.active {
    background: #fff1f2;
    border: 2rpx solid var(--theme-color, #ff5c5c);

    .iconfont {
      background: #fff;
      color: var(--theme-color, #ff5c5c);
    }
  }

  .txt {
    color: #929dae;
    font-size: 24rpx;
    line-height: 1.2;
  }
}

.cert_type-line {
  padding-right: 20rpx;

  ::v-deep {
    .u-cell {
      width: 630rpx;
    }

    .u-cell__body__content {
      display: none;
    }

    .u-cell__value {
      flex: 1;
      text-align: left;
      margin-left: 0;
    }
  }
}

// 卡片通用样式
.card-section {
  padding: 0 32rpx;

  .title {
    margin-top: 40rpx;
    margin-bottom: 10rpx;
    font-size: 28rpx;
    color: #aaa;
    padding-left: 22rpx;
    line-height: 44rpx;
  }

  .content {
    width: 686rpx;
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 2rpx solid #e2e8f0;
    margin-bottom: 40rpx;

    .tips {
      border-bottom: 2rpx solid #f6f6f8;
      height: 78rpx;
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 28rpx;
      color: #323232;
      line-height: 78rpx;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    ::v-deep {
      .u-radio {
        border-bottom: 2rpx solid #f6f6f8;
        padding: 24rpx 0;
        flex-direction: row-reverse;
        justify-content: space-between;
      }
    }
  }
}

::v-deep {
  .u-tag {
    width: 76rpx;
    height: 52rpx;
    background: #ffffff;
    border-radius: 0rpx 0rpx 0rpx 0rpx;
    border: none;
    text-align: center;
    justify-content: center;
    font-family: PingFang SC, PingFang SC;
    margin-right: 14rpx !important;
    margin-bottom: 20rpx;
    font-weight: 500;
    font-size: 24rpx;
    // color: #000000 !important;
    line-height: 36rpx;
    text-align: center;
    font-style: normal;
    text-transform: none;
    background: var(--theme-gradient, #ff5c5c);

    &.u-tag--warning--plain {
      background: #fff;
    }

    &.u-tag--medium {
      padding: 0;
    }

    .u-tag__text--warning--plain {
      color: #000;
    }
  }
}

.combo {
  padding: 0 32rpx;

  .title {
    display: flex;
    height: 36rpx;
    font-family: PingFang SC, PingFang SC;
    font-weight: bold;
    font-size: 24rpx;
    color: #aaaaaa;
    line-height: 36rpx;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin: 44rpx 0;

    .txt {
      width: 210rpx;
      height: 44rpx;
      border-radius: 8rpx 8rpx 8rpx 8rpx;
      border: 1rpx solid var(--theme-color, #ff5c5c);
      font-family: PingFang SC, PingFang SC;
      font-weight: bold;
      font-size: 24rpx;
      color: var(--theme-color, #ff5c5c);
      line-height: 36rpx;
      text-align: center;
      font-style: normal;
      text-transform: none;
    }
  }

  .h3 {
    padding-left: 10rpx;
    height: 42rpx;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 28rpx;
    color: #0f172a;
    line-height: 42rpx;
    text-align: left;
    font-style: normal;
    text-transform: none;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 6rpx;
      height: 30rpx;
      background: var(--theme-color, #ff5c5c);
      border-radius: 3rpx;
      margin-top: -15rpx;
    }
  }

  .combo-content {
    flex-shrink: 0;
  }

  .combo-content_left {
    width: 206rpx;
    height: 330rpx;
    background: #ffffff;
    border-radius: 0rpx 0rpx 0rpx 0rpx;
    margin-right: 30rpx;
    text-align: center;

    .img {
      width: 206rpx;
      height: 206rpx;
      background: #b0b0b0;
      text-align: center;
    }

    .name {
      padding: 10rpx;
      height: 42rpx;
      font-family: PingFang SC, PingFang SC;
      font-weight: bold;
      font-size: 28rpx;
      color: #000000;
      line-height: 42rpx;
      font-style: normal;
      text-transform: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .send {
      margin-left: 18rpx;
      margin-top: 12rpx;
      width: 96rpx;
      height: 36rpx;
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 24rpx;
      color: var(--theme-color, #ff5c5c);
      line-height: 36rpx;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }

  .combo-content_right {
    .tag {
      display: flex;
      flex-wrap: wrap;
      margin-top: 20rpx;
    }
  }
}

::v-deep {
  .u-form-item {
    border-bottom: 2rpx solid #f6f6f8;
    margin: 0 32rpx;
  }
}

// Logo 卡片特殊样式
.logo-card {
  padding: 40rpx 20rpx 30rpx;
  text-align: center;
}

.logo-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

// 分组标题
.section-header {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

// 表单内容区
.section-content {
  padding: 0 32rpx;
}

// 提交按钮
.submit-wrapper {
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20rpx 32rpx 40rpx;
  // box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

::v-deep {
  .u-form-item__body__left__content__required {
    top: 0 !important;
    left: -10rpx !important;
    font-size: 24px;
    // position: relative !important;
    // top: 0 !important;
    // left: 0 !important;
    // order: 1 !important;
    // margin-left: 4rpx !important;
  }

  .uni-input-placeholder {
    color: #c8c9cd !important;
  }

  .u-cell__right-icon-wrap {
    display: none;
  }

  .u-cell__value {
    text-align: left;
    margin-left: 0;
  }

  .u-cell__body {
    flex-direction: column;
    align-items: start;
  }

  .u-form-item__body__left__content__label {
    flex: none !important;
    padding-left: 16rpx;
    font-size: 30rpx;
  }

  .u-FileUploader {
    .u-upload__wrap {
      display: flex;
      justify-content: center;

      .u-upload__button {
        background: #fafafa;
        border-radius: 16rpx;
      }
    }
  }
}
</style>