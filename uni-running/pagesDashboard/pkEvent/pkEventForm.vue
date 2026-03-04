<template>
  <view class="">
    <up-form :model="form" ref="uForm" :rules="formRules" labelPosition="top" labelWidth="auto">
      <view class="card-section">
        <up-form-item label="真实姓名" prop="real_name" required>
          <view class="flex-start input-wrap">
            <input v-model="form.real_name" class="u-input" @input="validateField('real_name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的真实姓名" />
          </view>
        </up-form-item>
        <up-form-item label="联系电话" prop="contact_number" required>
          <view class="flex-start input-wrap">
            <input v-model="form.contact_number" class="u-input" @input="validateField('contact_number')" maxlength="11" placeholder-style="color: #64748B;" placeholder="请输入您的联系电话" />
          </view>
        </up-form-item>
        <template v-if="packageList.find((i) => i.id === form.package_id)?.require_cert === 1">
          <up-form-item label="证件类型" prop="cert_type">
            <view class="flex-start input-wrap cert_type-line">
              <PickerCell v-model="form.cert_type" :border="false" @change="validateField('cert_type')" :columns="cert_typeOptions" />
            </view>
          </up-form-item>

          <up-form-item label="证件号码" prop="cert_number" required>
            <view class="flex-start input-wrap">
              <input v-model="form.cert_number" class="u-input" @input="validateField('cert_number')" maxlength="18" placeholder-style="color: #64748B;" placeholder="请输入您的证件号码" />
            </view>
          </up-form-item>
        </template>
        <up-form-item v-if="!isFreePackage" label="收货地址" prop="shipping_address" required>
          <view class="flex-start input-wrap">
            <up-input v-model="form.shipping_address" border="none" @change="validateField('shipping_address')" maxlength="100" placeholder="请输入您的收货地址">
              <template #suffix>
                <view class="map-btn" @click="chooseAddress">
                  <up-icon name="map-fill" size="36rpx" color="#ff5c5c" />
                </view>
              </template>
            </up-input>
          </view>
        </up-form-item>

        <up-form-item label="选择套餐" prop="package_id" required>
          <view class="u-pt-5">
            <view class="package-item u-flex-row" v-for="item in packageList" :key="item.id" :class="{active: form.package_id === item.id}" @click="changePackage(item.id)">
              <view v-if="!item.package_image_url" class="package-image iconfont flex-center icon-shoppingbaggouwudai"></view>
              <image v-if="item.package_image_url" :src="item.package_image_url" class="package-image" mode="aspectFill" />
              <view>
                <view class="real_name">{{ item.package_name }}</view>
                <view class="target">{{ item.package_subtitle }}</view>
                <view class="txt">{{ item.package_description }}</view>
              </view>

              <div v-if="item.is_recommended" class="recommended-tag">推荐</div>
            </view>
          </view>
        </up-form-item>
      </view>
    </up-form>


    <section class="section-bottom" style="width: 682rpx;margin: 48rpx auto;">
				<view class="txt flex-start">
					<up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
						:customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
					<text @click="isAgree = !isAgree">
						<text class="u-ml-5">我已阅读并同意该</text>
					</text>
					<text style="color: #ff8c00" @click="$u.route('pagesDashboard/pkEvent/activeRule?type=disclaimer')">《免责声明》</text>
				</view>
			</section>

    <view class="submit-wrapper flex-between-center bgf" style="padding: 34rpx 32rpx;">
      <view class="" style="font-size: 24rpx;color: #6A7282;">
        应付金额
        <view class="u-mt-10" style="font-weight: bold;font-size: 40rpx;color: #ff5c5c;">
          ￥{{ packageList.find((item) => item.id === form.package_id)?.price || "0.00" }}
        </view>
      </view>
      <u-button type="primary" color="#ff5c5c" shape="circle" customStyle="width: 256rpx;height: 72rpx;margin:0;border-radius: 999rpx;" @click="submitForm()">
        加入战队并报名
      </u-button>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import FileUpload from "@/components/common/FileUpload.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import request from "@/utils/request.js";

import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const uForm = ref(null);
const activetyId = ref("");

const isAgree = ref(false);
const props = defineProps({
  currentID: {
    type: String,
    default: ""
  }
});
const form = ref({
  real_name: "",
  contact_number: "",
  shipping_address: "",
  package_id: "",
  cert_type: "",
  cert_number: ""
});

function validateField(propName) {
  uForm.value.validateField(propName, () => {}, "change");
}

const cert_typeOptions = [
  {
    label: "身份证",
    value: "CN_ID"
  },
  {
    label: "香港居民身份证",
    value: "HK_ID"
  },
  {
    label: "澳门居民身份证",
    value: "MA_ID"
  },
  {
    label: "港澳居民往来大陆通行证(回乡证)",
    value: "HK_MA_PASS"
  },
];

const formRules = ref({
  real_name: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
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
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  cert_number: [
    {
      required: true,
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

watch(
  () => form.value.cert_type,
  () => {
    formRules.value.cert_number = [
      {
        required: true,
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
const getPackageList = () => {
  const data = {
    event_id: activetyId.value,
  };
  request.get(`/event-api/online_events_packages`, data).then((res) => {
    packageList.value = res;
    const package_id = res.find((i) => i.is_recommended)?.id || "";
    changePackage(package_id);
  });
};
// 页面加载
onLoad((options) => {
  console.log("option", options);
  // activetyId.value = options.id;
  activetyId.value = options.eventId;
  // 套餐列表
  getPackageList();
});

const submitForm = () => {
  uForm.value.validate().then((res) => {
    if (!isAgree.value) return uni.$u.toast('请查阅并勾选免责声明~');

    /* const data = {
      ...form.value,
      event_id: activetyId.value,
    };

    uni.showLoading({
      mask: true,
    });

    request.post("/booking-api/online_events/registration", data).then(async (res) => {
      // 检测到某个package的price为0的情况下，调用此接口，不要走支付接口
      const isFree = packageList.value.find((i) => i.id === form.value.package_id)?.price === 0;
      if (isFree) {
        freeToPay(res.reg_no);
      } else {
        payOrder(res.reg_no);
      }
    }); */
    // 加入战队
    joinTeamAPi()
  });
};

//加入战队
function joinTeamAPi(item) {
	console.log("joinTeamAPi", item);
	uni.showLoading({ mask: true });
  request
    .post("/event-api/online_events_team/join", {
			event_id: activetyId.value,
			// team_id: item.id,
			team_id: props.currentID,
    })
    .then(() => {
				getUserStatus();
				// uni.$u.toast("成功加入战队, 准备跳转到活动报名页...", 2000, function success() {
				// 	goToSignEvent();
				// });
        const data = {
          ...form.value,
          event_id: activetyId.value,
        };

        uni.showLoading({
          mask: true,
        });

        request.post("/booking-api/online_events/registration", data).then(async (res) => {
          // 检测到某个package的price为0的情况下，调用此接口，不要走支付接口
          const isFree = packageList.value.find((i) => i.id === form.value.package_id)?.price === 0;
          if (isFree) {
            freeToPay(res.reg_no);
          } else {
            payOrder(res.reg_no);
          }
        });
    })
    .catch((e) => {
      console.log("e", e);
    });
}
const userStatusInfo = ref({});
function getUserStatus() {
  request
    .get(
      "/event-api/online_events_team/user_status?event_id=" + activetyId.value
    )
    .then((res) => {
      console.log("userStatus", res);
      userStatusInfo.value = res;
    });
}

function changePackage(id) {
  form.value.package_id = id;
}

const isFreePackage = computed(() => {
  const pkg = packageList.value.find(i => i.id === form.value.package_id);
  return pkg?.price === 0;
});

function chooseAddress() {
  uni.chooseLocation({
    success: (res) => {
      const addr = res.address || '';
      const name = res.name || '';

      if (addr) {
        form.value.shipping_address = addr.includes(name) ? addr : addr + ' ' + name;
        validateField('shipping_address');
      } else if (res.latitude && res.longitude) {
        // address 为空，用高德逆地理编码 REST API 获取完整地址
        wx.request({
          url: 'https://restapi.amap.com/v3/geocode/regeo',
          data: {
            key: '86473c6f37b174b14803c2c118c4ab62',
            location: `${res.longitude},${res.latitude}`,
          },
          success: (apiRes) => {
            const regeoAddr = apiRes.data?.regeocode?.formatted_address || '';
            form.value.shipping_address = regeoAddr ? regeoAddr + ' ' + name : name;
            validateField('shipping_address');
          },
          fail: () => {
            form.value.shipping_address = name;
            validateField('shipping_address');
          }
        });
      } else {
        form.value.shipping_address = name;
        validateField('shipping_address');
      }
    },
  });
}

const payOrder = async (reg_no) => {
  const data = {
    reg_no,
    event_id: activetyId.value,
    openid: userInfo.value.openid,
    order_type: 'online_events'
  };

  uni.showLoading({
    mask: true,
  });

  request.post(`/pay/wechat/payment`, data).then((res) => {
    wxPay(res);
  });
};

function freeToPay(reg_no){
  const data = {
    reg_no,
    event_id: activetyId.value,
    status: "SUCC"
  };
  request.post(`/booking-api/online_events/registration/status`, data).then(() => {
    uni.hideLoading();
    uni.$u.toast("报名成功");
    setTimeout(() => {
      uni.navigateBack();
    }, 300);
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
        uni.navigateBack()
        // uni.$u.route("pagesSub/orderSuccess?order_no=" + respay.order_no);
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
    background: #ff5c5c;
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
    color: #ff5c5c;
    font-weight: 500;
    margin-bottom: 10rpx;
  }

  &.active {
    background: #fff1f2;
    border: 2rpx solid #ff5c5c;

    .iconfont {
      background: #fff;
      color: #ff5c5c;
    }
  }

  .txt {
    color: #929dae;
    font-size: 24rpx;
    line-height: 1.2;
  }
}

.cert_type-line{
  padding-right: 20rpx;
  ::v-deep{
    .u-cell{
      width: 630rpx;
    }
    .u-cell__body__content{
      display: none;
    }
    .u-cell__value {
      flex:1;
        text-align: left;
        margin-left: 0;
    }
  }
}

// 卡片通用样式
.card-section {
  padding: 0 32rpx;
  margin-bottom: 24rpx;
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
  padding: 60rpx 8rpx 30rpx;
}

::v-deep {
  .u-form-item__body__left__content__required {
    top: 0;
    font-size: 24px;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    order: 1 !important;
    margin-left: 4rpx !important;
  }

  .u-form-item__body__left__content__label {
    flex: none !important;
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