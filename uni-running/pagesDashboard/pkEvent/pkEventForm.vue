<template>
  <view class="form-page">
    <up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">

      <view class="card-section">
        <up-form-item label="真实姓名" prop="name" required>
          <view class="flex-start input-wrap">
            <input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的真实姓名" />
          </view>
        </up-form-item>
        <up-form-item label="联系电话" prop="phone" required class="last-item">
          <view class="flex-start input-wrap">
            <input v-model="form.phone" class="u-input" @input="validateField('phone')" maxlength="11" placeholder-style="color: #64748B;" placeholder="请输入您的联系电话" />
          </view>
        </up-form-item>
        <up-form-item label="收货地址" prop="name" required>
          <view class="flex-start input-wrap">
            <input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的收货地址" />
          </view>
        </up-form-item>
        <up-form-item label="选择套餐" prop="packageID" required>
          <view class="u-pt-5">
            <view class="package-item u-flex-row" v-for="item in packageList" :key="item.id" :class="{active: form.packageID === item.id}" @click="changePackage(item.id)">
              <view v-if="!item.package_image_url" class="package-image iconfont flex-center icon-shoppingbaggouwudai"></view>
              <image v-if="item.package_image_url" :src="item.package_image_url" class="package-image" mode="aspectFill" />
              <view>
                <view class="name">{{ item.package_name }}</view>
                <view class="target">{{ item.package_subtitle }}</view>
                <view class="txt">{{ item.package_description }}</view>
              </view>

              <div v-if="item.is_recommended" class="recommended-tag">推荐</div>
            </view>
          </view>
        </up-form-item>
      </view>
    </up-form>

    <view class="submit-wrapper flex-between-center bgf" style="padding: 34rpx 32rpx;">
      <view class="" style="font-size: 24rpx;color: #6A7282;">
        应付金额
        <view class="u-mt-10" style="font-weight: bold;font-size: 40rpx;color: #E11D48;">
          ￥{{ packageList.find((item) => item.id === form.packageID)?.price || "0.00" }}
        </view>
      </view>
      <u-button type="primary" color="#E11D48" shape="circle" customStyle="width: 196rpx;height: 72rpx;margin:0;border-radius: 32rpx;" @click="submitForm()">
        立即支付
      </u-button>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import FileUpload from "@/components/common/FileUpload.vue";
import PickerMap from "@/components/common/PickerMap.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import request from "@/utils/request.js";
import { func } from "../../uni_modules/uview-plus/libs/function/test";

const uForm = ref(null);
const activetyId = ref("");

const form = ref({
  name: "",
  phone: '',
  address: "",
  packageID: "",
});

function validateField(propName) {
  uForm.value.validateField(propName, () => {}, "change");
}

const rules = ref({
  name: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    {
      required: true,
      message: "请输入手机号码",
      trigger: "blur",
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  address: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  packageID: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
});

// 页面加载
onLoad((options) => {
  console.log("option", options);
  activetyId.value = options.id;
  // 套餐列表
  getPackageList();
});

const submitForm = () => {
  uForm.value.validate().then((res) => {
    const data = {
      name: form.value.name,
      club_type: form.value.club_type,
      creator_phone: form.value.phone,
    };

    uni.showLoading({
      mask: true,
    });

    let url = "/running-group/api/v1/groups";

    request.post(url, data).then(async (res) => {
      console.log(res);
      payOrder(res.order_no);
    });
  });
};
// 获取套餐列表
const packageList = ref([]);
const getPackageList = () => {
  const data = {
    event_id: activetyId.value,
  };
  request.get(`/event-api/online_events_package`, data).then((res) => {
    packageList.value = res;
    form.value.packageID = res.find((i) => i.recommend)?.id || "";
  });
};

function changePackage(id) {
  form.value.packageID = id;
}

const payOrder = async (reg_no) => {
  const data = {
    reg_no,
    event_id: event_id.value,
    openid: userInfo.value.openid,
  };

  uni.showLoading({
    mask: true,
  });

  request.post(`/pay/wechat/payment`, data).then((res) => {
    wxPay(res);
  });
};

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
        // uni.navigateBack()
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
.package-item {
  width: 686rpx;
  height: 222rpx;
  padding: 42rpx 20rpx 0 34rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx solid #e2e8f0;
  margin-bottom: 20rpx;
  position: relative;
  .recommended-tag{
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: #e11d48;
    color: #fff;
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }
  .package-image {
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
    color: #e11d48;
    font-weight: 500;
    margin-bottom: 10rpx;
  }

  &.active {
    background: #fff1f2;
    border: 2rpx solid #e11d48;

    .iconfont {
      background: #fff;
      color: #e11d48;
    }
  }

  .txt {
    color: #929dae;
    font-size: 24rpx;
    line-height: 1.2;
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
    font-size: 14px;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    order: 1 !important;
    margin-left: 4rpx !important;
  }

  .u-form-item__body__left__content__label {
    flex: none;
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