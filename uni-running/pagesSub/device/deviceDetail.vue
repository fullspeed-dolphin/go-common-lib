<template>
  <view>
    <u-navbar autoBack placeholder :title="computedTitle"></u-navbar>
    <view class="" style="padding-top: 50rpx">
      <view v-if="deviceInfo.platform" class="flex-center" style="margin-bottom: 50rpx">
        <image class="poster" :src="deviceInfo.imgUrl" mode="aspectFill"></image>
      </view>
      <view class="text" style="padding: 0 64rpx">
        <rich-text :nodes="deviceInfo.termText"></rich-text>
      </view>
    </view>

    <section class="section-bottom">
      <view style="padding: 56rpx 54rpx 40rpx">
        <template v-if="deviceInfo.bound">
          <u-button type="primary" shape="circle" @click="confirmAsync()">手动同步</u-button>
          <view class="u-mt-30">
            <u-button type="primary" shape="circle" color="#ccc" @click="unDevice()">解除绑定</u-button>
          </view>
        </template>
        <template v-else>
          <u-button v-if="deviceInfo.platform === 'garmin'" type="primary" color="#FF8C00" shape="circle" @click="refCommonDialog.open()">立即绑定</u-button>
          <u-button v-else type="primary" color="#FF8C00" shape="circle" @click="authHuaWeiLogin">立即绑定</u-button>
        </template>

      </view>
    </section>

    <CommonDialog ref="refCommonDialog">
      <view class="" style="width: 642rpx">
        <view class="flex-center" style="font-weight: bold; height: 100rpx; font-size: 34rpx">绑定说明</view>
        <view class="" style="color: #707070; line-height: 45rpx; padding: 20rpx 30rpx">
          由于小程序限制，<text class="txt">需要在手机浏览器中完成绑定</text>。请按下面步骤继续操作：
          <view class="">1、点击下方 <text class="txt">“复制绑定链接”</text></view>
          <view class="">2、打开手机浏览器</view>
          <view class="">3、<text class="txt">点击浏览器地址栏，长按、粘贴，打开链接</text></view>
          <view class="">4、在打开的授权页面填写账号密码完成绑定</view>
        </view>
        <view class="flex-between-center btns" style="padding: 40rpx">
          <u-button type="primary" shape="circle" customStyle="border-radius: 16rpx;height: 72rpx; color: #707070;" color="#F2F2F2" @click="$refs.refCommonDialog.close()">取消</u-button>
          <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 72rpx;" @click="copyAuthLink()">复制绑定链接</u-button>
        </view>
      </view>
    </CommonDialog>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import CommonDialog from "@/components/common/CommonDialog.vue";
import { gaoChi, huaWei, jiaMing } from "./deviceUtils.js";
import request from "@/utils/request.js";
import { useShare, buildPath } from "@/composables/useShare.js";

// 分享配置
useShare(() => ({
  title: routerParams.value.value
    ? `${routerParams.value.value} - 设备详情`
    : "设备详情",
  path: buildPath("/pagesSub/device/deviceDetail", {
    value: routerParams.value.value,
  }),
}));

const routerParams = ref({});
const refCommonDialog = ref(null);

const computedTitle = computed(() => {
  if (!deviceInfo.value.platform) {
    return "设备详情";
  }

  return !deviceInfo.value.bound
    ? "设备详情"
    : "添加" + (deviceInfo.value.display_name || "设备");
});

// 页面加载
onLoad((optons) => {
  routerParams.value = optons;
});


onShow(() => {
  getDeviceData();
  // 华为回调命中时即将跳走，不必再刷新列表
  const handled = handleHuaweiCallback();
  if (!handled) {
    getDeviceData();
  }
});

const deviceInfo = ref({});
function getDeviceData() {
  uni.showLoading({
    mask: true,
  });
  request.get("/sport-api/api/platform/bindings").then((res) => {
    console.log("设备列表====>", res);

    const imgMapping = {
      huawei:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/华为运动健康@2x.png",
      garmin:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/佳明@2x.png",
      gaochi:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/高驰@2x.png",
    };

    const termMapping = {
      huawei: huaWei,
      garmin: jiaMing,
      gaochi: gaoChi,
    };

    deviceInfo.value = (res.bindings || [])
      .map((item) => {
        let created_at = item.created_at?.replace("T", " ")?.slice(0, 16);

        return {
          ...item,
          imgUrl: imgMapping[item.platform] || "",
          termText: termMapping[item.platform] || "",
          label: item.display_name || item.platform,
          value: item.platform,
          created_at: created_at ? created_at + "绑定" : "",
        };
      })
      .find((item) => item.platform === routerParams.value.platform);
  });
}

const authParams = ref({})
let handledCode = null;
function handleHuaweiCallback() {
  try {
    const enterOptions = wx.getEnterOptionsSync();
    const extraData = enterOptions?.referrerInfo?.extraData;
    if (!extraData?.code) return false;

    // 同一个 code 只处理一次（getEnterOptionsSync 的结果在小程序生命周期内不会清除）
    if (extraData.code === handledCode) return false;
    handledCode = extraData.code;

    const tempCode = extraData.code.replaceAll("+", "%2B");
    request
      .get("/sport-api/huawei/oauth/callback?code=" + tempCode + "&state=" + authParams.value.state + "&source=miniprogram")
      .then(() => {
        getDeviceData();
      })
      .catch((error) => {
        console.log("华为回调失败", error);
      });
    return true;
  } catch (e) {
    // 非华为小程序返回场景，无 extraData，忽略即可
    return false;
  }
}

function authHuaWeiLogin() {
  request
    .get("/sport-api/huawei/oauth/miniprogram/authorize")
    .then((res) => {
      authParams.value = res;
      wx.navigateToMiniProgram({
        appId: "wxa6c04f899577d944",
        path: "pages/authLogin/authLogin",
        extraData: {
          lang: "zh-CN",
          client_id: res.client_id,
          scope: res.scope.split(" "),
          state: res.state,
        },
      });
      console.log("res====222==", res);
    })
    .catch((error) => {
      console.log("error==222", error);
    });
}

function copyAuthLink() {
  uni.showLoading({
    mask: true,
  });

  const linkMapping = {
    huawei: "/sport-api/huawei/oauth/authorize",
    garmin: "/sport-api/garmin/oauth/request-token",
    gaochi: "/sport-api/gaochi/oauth/request-token",
  };

  request.get(linkMapping[routerParams.value.platform]).then((res) => {
    console.log("res====>", res);

    uni.setClipboardData({
      data: res.authorize_url,
    });

    refCommonDialog.value.close();
  });
}

// 方法定义
const confirmAsync = () => {
  uni.showLoading({
    mask: true,
    title: "同步中...",
  });

  setTimeout(() => {
    uni.$u.toast("同步成功");
  }, 1300);
};

const unDevice = () => {
  uni.showModal({
    title: "提示",
    content: "确定解除绑定吗？",
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({
          mask: true,
        });

        const linkMapping = {
          huawei: "/sport-api/huawei/deregister",
          garmin: "/sport-api/garmin/deregister",
          gaochi: "/sport-api/gaochi/deregister",
        };
        request.post(linkMapping[routerParams.value.platform]).then((res) => {
          console.log("解除绑定====>", res);

          uni.$u.toast("解除绑定成功");

          getDeviceData();
        });
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.poster {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  border: 1px solid #f5f5f5;
}
.text {
  font-size: 32rpx;
  color: #000000;
  line-height: 51rpx;
}
.section-bottom {
  // position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
}
.txt {
  color: #ff8c00;
}

::v-deep {
  .btns {
    .u-button {
      width: 260rpx;
    }
  }
}
</style>
