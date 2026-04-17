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
          <u-button v-if="deviceInfo.platform === 'huawei'" type="primary" shape="circle" @click="confirmAsync()">手动同步</u-button>
          <view class="u-mt-30">
            <u-button type="primary" shape="circle" color="#ccc" @click="unDevice()">解除绑定</u-button>
          </view>
        </template>
        <template v-else>
          <u-button v-if="deviceInfo.platform === 'gaochi'" type="primary" color="#FF8C00" shape="circle" @click="refCommonDialog.open()">立即绑定</u-button>
          <u-button v-else-if="deviceInfo.platform === 'garmin'" type="primary" color="#FF8C00" shape="circle" @click="authGarminLogin">立即绑定</u-button>
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
import { onLoad, onShow,onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
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
  checkAuthCallback();
});

const deviceInfo = ref({});
function getDeviceData() {
  uni.showLoading({
    mask: true,
  });
  request.get("/sport-api/api/platform/bindings").then((res) => {
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

/**
 * 统一处理小程序回跳授权回调（华为 / Garmin）
 * 用 localStorage 标记 pending 状态，避免每次 onShow 重复调用
 */
function checkAuthCallback() {
  try {
    const pendingAuth = uni.getStorageSync("pending_device_auth");
    if (!pendingAuth) return;

    const extraData = wx.getEnterOptionsSync()?.referrerInfo?.extraData;
    if (!extraData) return;

    if (pendingAuth.platform === "huawei" && extraData.code) {
      // 华为回调：extraData 包含 code
      const tempCode = extraData.code.replaceAll("+", "%2B");
      const state = pendingAuth.state || "";
      uni.removeStorageSync("pending_device_auth");

      request
        .get("/sport-api/huawei/oauth/callback?code=" + tempCode + "&state=" + state + "&source=miniprogram")
        .then(() => {
          uni.$u.toast("华为绑定成功");
          // 跳转到智能设备列表
          setTimeout(() => {
            // uni.$u.route({ type: "redirect", url: "/pagesSub/device/deviceList" });
            getDeviceData();
          }, 800);
        })
        .catch((error) => {
          console.log("华为回调失败", error);
          uni.$u.toast("绑定失败，请重试");
        });
    } else if (pendingAuth.platform === "garmin" && extraData.verifier) {
      // Garmin 回调：extraData 包含 { token, verifier }
      const token = extraData.token || pendingAuth.oauth_token || "";
      const verifier = extraData.verifier;
      uni.removeStorageSync("pending_device_auth");

      let accessTokenUrl = "/sport-api/garmin/oauth/access-token?oauth_token=" + encodeURIComponent(token) + "&oauth_verifier=" + encodeURIComponent(verifier);
      // #ifdef MP-WEIXIN
      accessTokenUrl += "&source=miniprogram";
      // #endif

      request
        .get(accessTokenUrl)
        .then(() => {
          uni.$u.toast("佳明绑定成功");
          // 跳转到智能设备列表
          setTimeout(() => {
            // uni.$u.route({ type: "redirect", url: "/pagesSub/device/deviceList" });
            getDeviceData();
          }, 800);
        })
        .catch((error) => {
          console.log("Garmin回调失败", error);
          uni.$u.toast("绑定失败，请重试");
        });
    } else {
      // extraData 不匹配当前 pending platform，忽略
      console.log("回调数据不匹配", pendingAuth.platform, extraData);
    }
  } catch (error) {
    console.log("checkAuthCallback error", error);
  }
}

/**
 * 华为小程序授权绑定
 */
function authHuaWeiLogin() {
  request
    .get("/sport-api/huawei/oauth/miniprogram/authorize")
    .then((res) => {
      // 标记 pending 状态，存储 state 供回调使用
      uni.setStorageSync("pending_device_auth", {
        platform: "huawei",
        state: res.state,
        timestamp: Date.now(),
      });

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
      console.log("华为授权跳转", res);
    })
    .catch((error) => {
      console.log("华为授权请求失败", error);
      uni.$u.toast("获取授权信息失败");
    });
}

/**
 * Garmin 小程序授权绑定（爱运动）
 *
 * 后端接口：GET /sport-api/garmin/oauth/miniprogram/authorize
 * 返回：{ oauth_token: "794f1e55-6d93-496a-989a-708b6025a82d" }
 *
 * 跳转到 Garmin 爱运动小程序：
 *   appId: wx50e8581d710d2480
 *   path:  pages/authorization/index?token={oauth_token}
 *
 * 爱运动小程序授权完成后通过 navigateBackMiniProgram 返回：
 *   extraData: { token: "原始oauth_token", verifier: "oauth_verifier" }
 */
function authGarminLogin() {
  uni.showLoading({ mask: true });

  request
    .get("/sport-api/garmin/oauth/miniprogram/authorize")
    .then((res) => {
      uni.hideLoading();
      console.log("Garmin miniprogram authorize 响应", res);

      const requestToken = res.oauth_token;
      if (!requestToken) {
        uni.$u.toast("获取授权信息失败");
        return;
      }

      // 标记 pending 状态，供回跳时 checkAuthCallback 使用
      uni.setStorageSync("pending_device_auth", {
        platform: "garmin",
        oauth_token: requestToken,
        timestamp: Date.now(),
      });

      wx.navigateToMiniProgram({
        appId: "wx50e8581d710d2480",
        path: "pages/authorization/index?token=" + requestToken,
      });
      console.log("Garmin 授权跳转, token:", requestToken);
    })
    .catch((error) => {
      uni.hideLoading();
      console.log("Garmin miniprogram request-token 请求失败", error);
      uni.$u.toast("获取授权信息失败");
    });
}

function copyAuthLink() {
  uni.showLoading({
    mask: true,
  });

  const linkMapping = {
    gaochi: "/sport-api/gaochi/oauth/request-token",
  };

  const apiPath = linkMapping[routerParams.value.platform];
  if (!apiPath) {
    uni.hideLoading();
    return;
  }

  request.get(apiPath).then((res) => {
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

  if (deviceInfo.value.platform === 'huawei') {
    request.get("/sport-api/huawei/sync/recent7days").then((res) => {
      console.log("华为 同步====>", res);

    uni.$u.toast("同步成功");
    });
  }

  // setTimeout(() => {
  //   uni.$u.toast("同步成功");
  // }, 1300);
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
