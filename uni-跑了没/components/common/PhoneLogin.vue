<template>
  <u-popup :show="isShowPop" mode="center" :safeAreaInsetBottom="false" closeable round="15" @close="isShowPop = false">
		<view class="p20 section-dialog">
			<view class="section-box">
				<view class="title flex-center">欢迎登录 跑了没</view>
			</view>
			<view class="flex-col-center">
				<view class="" style="font-size: 24rpx;">
					登录后为你提供更好的服务
				</view>
				<view  style="margin-top:60rpx;width:440rpx;">
					<u-button v-if="!isAgree" @click="$toast('请点击同意协议!')"  :customStyle="{width: '440rpx'}" type="primary" color="#19be6b" shape="circle">
						授权手机号登录
					</u-button>
					<u-button v-if="isAgree" :disabled="isDisabled" :customStyle="{width: '440rpx'}" type="primary" color="#19be6b" shape="circle" block open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
						授权手机号登录
					</u-button>
					<view style="margin-top:30rpx;" @click="isShowPop = false">
						<u-button :customStyle="{width: '440rpx'}" type="primary" color="#F2F2F2" textColor="#000" shape="circle">
							取消
						</u-button>
					</view>
				</view>
			</view>
			<view class="txt" style="margin: 60rpx 40rpx 40rpx 40rpx;line-height: 1.4;color:#999;">
				<text @click="isAgree = !isAgree">
					<u-icon 
						size="15"
						:color="isAgree ? '#FF8C00' : '#999'"
						:name="isAgree ? 'checkmark-circle-fill' : 'checkmark-circle'" ></u-icon>
					<text class="ml5">我已阅读并同意该</text>
				</text>
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>以及
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=privy')">《用户隐私协议》</text>。
			</view>
		</view>
  </u-popup>
</template>
<script>
export default {
  options: { styleIsolation: "shared" },
  data() {
    return {
			isShowPop: false,
			isDisabled: false,
			isAgree: false,
		};
  },
  methods: {
		open() {
			this.isShowPop = true;
		},
		close() {
			this.isShowPop = false;
		},
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
			
			// if (!this.isAgree) return this.$toast('请点击同意协议！');
			
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
				
				if (res.avatarUrl) {
					this.$toast("登录成功");
					uni.setStorageSync("token", res.sessionToken);
					await this.$store.dispatch('getUserInfo')
				} else {
					this.$store.commit('set', {
						type: 'globalToken',
						data: res.sessionToken
					})
				}
				
				this.close()
				
				this.isDisabled = false;
				this.$emit("success", !!res.avatarUrl);
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
	.section-dialog{
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
