<template>
  <view>
    <u-button :disabled="isDisabled" type="primary" shape="circle" block open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权手机号登录</u-button>
  </view>
</template>
<script>
export default {
  options: { styleIsolation: "shared" },
  data() {
    return {
			isDisabled: false
		};
  },
  methods: {
    async getCode() {
      return (
        await new Promise((resolve) =>
          uni.login({ success: (e) => resolve(e) })
        )
      ).code;
    },
    async getPhoneNumber({ detail }) {
      // console.log(detail);
      if (detail.errMsg == "getPhoneNumber:fail user deny") {
        this.$toast("用户已拒绝");
				
				this.isDisabled = false;
        return false;
      }
			
			uni.showLoading({
			  title: "登录中...",
			  mask: true,
			});
			
			this.isDisabled = true;
			
      const data = {
        jsCode: await this.getCode(),
        encryptedData: detail.encryptedData,
        ivStr: detail.iv,
        phoneCode: detail.code,
      };

			try {
				const res = await this.$axios.post("/wechat-login/login", data);
				
				console.log(res);
				uni.setStorageSync("token", res.access_token);
				
				this.$toast("登录成功");
				
				// 延迟跳转，toast 可见
				setTimeout(() => {
					this.isDisabled = false;
					this.$emit("success");
				}, 800)
			} catch (error) {
				console.error(error)
				this.isDisabled = false;
				//TODO handle the exception
			}
    }
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
