<template>
  <view>
    <u-button type="primary" shape="circle" block open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权手机号登录</u-button>
  </view>
</template>
<script>
export default {
  options: { styleIsolation: "shared" },
  data() {
    return {};
  },
  methods: {
    async getCode() {
      return (
        await new Promise((resolve) =>
          uni.login({ success: (e) => resolve(e) })
        )
      ).code;
    },
    async loginByID() {
      uni.showLoading({
        title: "登录中...",
        mask: true,
      });

      const data = {
        jsCode: await this.getCode(),
      };

      const res = await this.$axios.get("/auth/token/wechat/mina/login", data);

      console.log(res.access_token);
      uni.setStorageSync("token", res.access_token);
    },
    async getPhoneNumber({ detail }) {
      console.log(detail);
      if (detail.errMsg == "getPhoneNumber:fail user deny") {
        this.$toast("用户已拒绝");
        return false;
      }

      const data = {
        jsCode: await this.getCode(),
        encryptedData: detail.encryptedData,
        ivStr: detail.iv,
        phoneCode: detail.code,
      };
      uni.showLoading({ mask: true });

      await this.loginByID();

      const userInfo = await this.$store.dispatch("getUserInfo");
      if (!userInfo.telPhone) {
        const { telPhone } = await this.$axios.post(
          "/merchant/mina/member/getWxUserInfo",
          data
        );
        uni.hideLoading();
        await this.bindUserPhone(telPhone);
      }

      this.$toast("登录成功");

      this.$emit("success");
    },
    bindUserPhone(telPhone) {
      const data = {
        telPhone,
      };
      return this.$axios.post("/merchant/mina/member/updateUserInfo", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  padding-top: 44rpx;
  background: #fff;
}
.banner {
  position: absolute;
  bottom: 0;
  display: block;
  width: 100%;
  height: 220rpx;
}
.section-link {
  padding: 0 60rpx;
}
.section-box {
  padding-left: 60rpx;
  padding-top: 120rpx;
  margin-bottom: 105rpx;
}
.title {
  font-size: 50rpx;
  font-weight: 500;
  margin-bottom: 42rpx;
}
.sub-tit {
  font-size: 36rpx;
  letter-spacing: 1.8px;
  color: rgba(68, 68, 68, 1);
}

.login-view {
  // padding-top:100rpx;
  padding-right: 62rpx;
  padding-left: 30rpx;
}
</style>
