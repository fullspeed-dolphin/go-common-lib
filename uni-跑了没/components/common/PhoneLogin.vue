<template>
		<view>
			<u-button v-if="!checked" type="primary" block @click="$toast('请同意并勾选用户协议')">授权登录</u-button>
			<block v-else>
				<u-button v-if="!Jscode2Session.IsRegister" type="primary" block open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
					授权登录
				</u-button>
				<u-button v-else @click="loginSilent()" type="primary" block >
					授权登录
				</u-button>
			</block>
			
			<AccessUser ref="refAccessUser"/>
		</view>
</template>
<script>
	import AccessUser from "@/components/common/AccessUser.vue"
export default {
	props: ['checked'],
	options: { styleIsolation: 'shared' },
	components: { AccessUser },
  data () {
    return {
			Jscode2Session: {}
    };
  },
  methods: {
		async getCode() {
			return (await new Promise(resolve => uni.login({success: e => resolve(e) }))).code
		},
    async loginByID () {
      const data = {
        Code: await this.getCode(),
      };
	
      const res = await this.$axios.post('/api/auth/oauth/wechat/mini', data)
			
			this.Jscode2Session = res;
			console.log("res", res)
			
			// if (res.IsRegister) {
			// 	this.loginSilent()
			// }
    },
		async loginSilent() {
			uni.showLoading({
			  title: '登录中...',
			  mask: true
			})
			
			const data = {
				"OpenID": this.Jscode2Session.OpenID,
				"UnionID": this.Jscode2Session.UnionID,
				"Name": "",
				"Head": "",
				"SessionKey": this.Jscode2Session.SessionKey,
				"EncryptedData": "",
				"IV": "",
				PromoterID: uni.getStorageSync('PromoterID') || ""
			}
			
			try{
				console.log("从普通授权登录=====>")
				const res_login = await this.$axios.post("/api/auth/login/wechat", data);
				uni.setStorageSync('token', res_login.AccessToken);
				
				console.log(res_login.AccessToken)
				
				const userInfo = await this.$store.dispatch('getUserInfo');
				
				console.log("userInfo=====>", userInfo)
				this.$toast("登录成功");
				
				if (userInfo.IsNeedToImproveData) {
					return this.$goUrl("/pagesSub/formPoints");
				}
				
				
				this.$emit("success")
			}catch(e){
				uni.hideLoading()
				//TODO handle the exception
			}
		},
		async getPhoneNumber ({detail}) {
			if (!this.checked) {
				return this.$toast('请同意并勾选用户协议');
			}
			console.log(detail)			
			if (detail.errMsg == 'getPhoneNumber:fail user deny') {
				this.$toast('用户已拒绝');
				return false;
			};
			
			uni.showLoading({
			  title: '登录中...',
			  mask: true
			})
			
			const data = {
				"OpenID": this.Jscode2Session.OpenID,
				"UnionID": this.Jscode2Session.UnionID,
				"Name": "",
				"Head": "",
				"SessionKey": this.Jscode2Session.SessionKey,
				"EncryptedData": detail.encryptedData,
				"IV": detail.iv,
			}
			
			uni.showLoading({ mask: true });
			console.log("从手机授权登录=====>")
			const res_login = await this.$axios.post("/api/auth/login/wechat", data);
			uni.setStorageSync('token', res_login.AccessToken);
			
			const userInfo = await this.$store.dispatch('getUserInfo', {
				test: true
			});
			
			if (!userInfo.Avatar && !userInfo.Nickname) {
				this.$refs.refAccessUser.open(userInfo);
				
				uni.hideLoading()
				return;
			}
			
			console.log("userInfo====>", userInfo)
			
			this.$toast("登录成功");
			
			if (userInfo.IsNeedToImproveData) {
				return this.$goUrl("/pagesSub/formPoints");
			}
			
			this.$emit("success")
		},
		bindUserPhone(telPhone) {
			const data = {
				telPhone,
			}
			return 
		}
  }
};
</script>

<style lang="less" scoped>
	.page{
		height: 100vh;
		padding-top:44rpx;
		background: #fff;
	}
	.banner{
		position: absolute;
		bottom:0;
		display: block;
		width: 100%;
		height: 220rpx;
	}
	.section-link{
		padding: 0 60rpx;
	}
	.section-box{
		padding-left:60rpx;
		padding-top:120rpx;
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
	::v-deep {
		.van-cell__title{
			font-size: 28rpx;
			color: rgba(51, 51, 51, 1);
		}
		.van-cell {
		  background: transparent;
			&:after{
				left:16px;
			}
		}
	}
	.login-view{
		// padding-top:100rpx;
		padding-right:62rpx;
		padding-left:30rpx;
	}
</style>
