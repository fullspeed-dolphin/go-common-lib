<template>
  <view class="page">
		<view class="section-box flex-col-center">
    </view>
		<view style="padding:100rpx 104rpx 0;">
			<u--form :model="form" ref="uForm" :rules="rules">
				<u-form-item label="" prop="name">
					<u-input v-model="form.name"  prefixIcon="account" placeholder="输入账号"/>
				</u-form-item>
				<u-form-item label="" prop="password">
					<u-input v-model="form.password" type="password" prefixIcon="lock" placeholder="输入密码"/>
				</u-form-item>
			</u--form>
			
			<view class="submit-btn flex-center" @click="submit">登录</view>
			
		</view>
  </view>
</template>
<script>
export default {
  data () {
    return {
			form: {
				// name: '13670443751',
				// password: '123456',
				name: '',
				password: '',
			},
			rules: {
				name: [
					{
						required: true,
						message: '请输入账号',
						trigger: ['blur', 'change']
					}
				],
				password: [
					{
						required: true,
						message: '请输入密码',
						trigger: ['blur', 'change']
					}
				],
			}
		};
  },
	onLoad() {
		if (location.href.includes('localhost')) {
			this.form.name = '13670443751'
			this.form.password = '123456'
		}
	},
  methods: {
		submit() {
			this.$refs.uForm.validate().then(res => {
				const data = {
					"Account": this.form.name,
					"Password": this.form.password,
				}
				uni.showLoading({
					mask: true
				})
				this.$axios.post(`/api/store/login`, data).then(res => {
					console.log(res)
					uni.hideLoading()
					
					localStorage.token = res.Token
					
					this.$store.dispatch('getUserInfo')
					
					uni.$u.toast('登录成功')
					
					this.$goUrl("/pages/index")
				})
			}).catch(errors => {
				// uni.$u.toast('校验失败')
			})
		}
  }
};
</script>

<style lang="less" scoped>
	.logo{
		width: 300rpx;
		height: 60rpx;
	}
	.page{
		height: 100vh;
		padding-top:180rpx;
		background: #fff;
	}
	.title{
		margin-top: 30rpx;
		font-size: 48rpx;
		font-weight: 500;
	}
	
	.submit-btn{
		width: 542rpx;
		height: 96rpx;
		margin: 48rpx auto;
		border-radius: 16rpx;
		background: #2E2F30;
		font-size: 32rpx;
		font-weight: 500;
		color: #F1FD53;
	}
	
	::v-deep{
		.u-form-item{
			justify-content: center;
			align-items: center;
		}
		.u-form-item__body{
			width: 542rpx;
		}
		.u-form-item__body__right__message{
			margin:0!important;
		}
		.u-input{
			height: 96rpx;
			border-radius: 16rpx;
			background: #F5F5F5;
		}
	}
</style>
