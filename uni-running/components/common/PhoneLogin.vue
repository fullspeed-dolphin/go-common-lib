<template>
  <u-popup
    :show="isShowPop"
    mode="center"
    :safeAreaInsetBottom="false"
    closeable
    round="15"
    @close="isShowPop = false"
  >
    <view class="u-p-20 section-dialog">
      <view class="section-box">
        <view class="title flex-center">欢迎登录 全速运动</view>
      </view>
      <view class="flex-col-center">
        <!-- <view class="" style="font-size: 24rpx">
          登录后为你提供更好的服务
        </view> -->
        <view class="" style="font-size: 24rpx;line-height: 48rpx;">
          当前功能需要登录授权以继续操作，
        </view>
        <view class="" style="font-size: 24rpx;line-height: 48rpx;">
          您也可以选择"暂不登录"体验其他精彩内容。
        </view>
        <view style="margin-top: 60rpx; width: 440rpx">
          <u-button
            v-if="!isAgree"
            @click="$u.toast('请点击同意协议!')"
            :customStyle="{ width: '440rpx' }"
            type="primary"
            color="#19be6b"
            shape="circle"
          >
            授权手机号登录
          </u-button>
          <u-button
            v-if="isAgree"
            :disabled="isDisabled"
            :customStyle="{ width: '440rpx' }"
            type="primary"
            color="#19be6b"
            shape="circle"
            block
            open-type="getPhoneNumber"
            @getphonenumber="getPhoneNumber"
          >
            授权手机号登录
          </u-button>
          <view style="margin-top: 30rpx" @click="isShowPop = false">
            <u-button
              :customStyle="{ width: '440rpx' }"
              type="primary"
              color="#F2F2F2"
              shape="circle"
              customStyle="color: #000000;"
            >
              暂不登录
            </u-button>
          </view>
        </view>
      </view>
      <view
        class="txt"
        style="margin: 60rpx 40rpx 40rpx 40rpx; line-height: 1.4; color: #999"
      >
        <u-icon
          @click="isAgree = !isAgree"
          size="15"
          :color="isAgree ? '#FF8C00' : '#999'"
          :name="isAgree ? 'checkmark-circle-fill' : 'checkmark-circle'"
        ></u-icon>
        <text @click="isAgree = !isAgree">
          <text class="u-ml-5">我已阅读并同意该</text>
        </text>
        <text
          style="color: #ff8c00"
          @click="$u.route('pagesSub/settings/agreement?type=signUp')"
          >《用户协议》</text
        >以及
        <text
          style="color: #ff8c00"
          @click="$u.route('pagesSub/settings/agreement?type=privy')"
          >《用户隐私协议》</text
        >。
      </view>
    </view>
  </u-popup>
</template>
<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import request from "@/utils/request.js"

// 使用store
const store = useStore();

// Emits
const emit = defineEmits(["success"]);

// 响应式数据
const isShowPop = ref(false);
const isDisabled = ref(false);
const isAgree = ref(false);

// 方法定义
const open = () => {
  isShowPop.value = true;
};

const close = () => {
  isShowPop.value = false;
};

const getCode = async () => {
  return (
    await new Promise((resolve) => uni.login({ success: (e) => resolve(e) }))
  ).code;
};

const getPhoneNumber = async ({ detail }) => {
  // console.log(detail);
  if (detail.errMsg == "getPhoneNumber:fail user deny") {
    uni.$u.toast("用户已拒绝");

    isDisabled.value = false;
    return false;
  }

  // if (!isAgree.value) return uni.$u.toast('请点击同意协议！');

  uni.showLoading({
    title: "登录中...",
    mask: true,
  });

  isDisabled.value = true;

  const data = {
    jsCode: await getCode(),
    encryptedData: detail.encryptedData,
    ivStr: detail.iv,
    phoneCode: detail.code,
  };

  try {
    const res = await request.post("/wechat-login/login", data);

    uni.$u.toast("登录成功");
    uni.setStorageSync("token", res.sessionToken);
    await store.dispatch("getUserInfo");

    // if (res.avatarUrl) {
    //   uni.$u.toast("登录成功");
    //   uni.setStorageSync("token", res.sessionToken);
    //   await store.dispatch("getUserInfo");
    // } else {
    //   store.commit("set", {
    //     type: "globalToken",
    //     data: res.sessionToken,
    //   });
    // }

    close();

    isDisabled.value = false;
    emit("success", !!res.avatarUrl);
  } catch (error) {
    console.error(error);
    isDisabled.value = false;
    //TODO handle the exception
  }
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.section-dialog {
  width: 650rpx;
}
.section-link {
  padding: 0 60rpx;
}
.section-box {
  padding-top: 30rpx;
  margin-bottom: 55rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 30rpx;
}
.sub-tit {
  font-size: 36rpx;
  letter-spacing: 1.8px;
  color: rgba(68, 68, 68, 1);
}
</style>
