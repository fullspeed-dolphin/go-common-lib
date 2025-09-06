<template>
  <view class="page">
		<view style="">
			<u--form :model="form" ref="uForm" :rules="rules" labelWidth="100" labelPosition="top">
				<u-form-item v-if="pageStep == 1" label="" prop="OriginalPassword">
					<u-input v-model="form.OriginalPassword" type="password" placeholder="请输入原密码" >
					</u-input>
				</u-form-item>
				<block v-if="pageStep == 2">
					<u-form-item label="" prop="Password">
						<u-input v-model="form.Password" type="password" placeholder="请输入新密码" >
						</u-input>
					</u-form-item>
					<u-form-item label="" prop="Password2">
						<u-input v-model="form.Password2" type="password" placeholder="请再输入新密码" >
						</u-input>
					</u-form-item>
				</block>
			</u--form>
			
			<view class="submit-btn flex-center" @click="submitForm()">
				{{pageStep == 1 ? '下一步' : '确定'}}
			</view>
		</view>
  </view>
</template>
<script>
export default {
  data () {
    return {
			form: {
				OriginalPassword: '',
				Password: '',
				Password2: '',
			},
			pageStep:1,
			rules: {
				OriginalPassword: [
					{
						required: true,
						message: '请输入原密码',
						trigger: ['blur', 'change']
					}
				],
				Password: [
					{
						required: true,
						message: '请输入新密码',
						trigger: ['blur', 'change']
					}
				],
				Password2: [
					{
						required: true,
						message: '请再输入新密码',
						trigger: ['blur', 'change']
					}
				],
			}
		};
  },
  methods: {
		submitForm() {
			this.$refs.uForm.validate().then(res => {
				if (this.pageStep === 1) {
					this.pageStep ++;
					setTimeout(() => {
						this.$refs.uForm.clearValidate()
					}, 10)
					return
				}
				
				if (this.form.Password !== this.form.Password2) {
					uni.showToast({
						icon: "error",
						title: "两次密码不同"
					})
					
					this.form.Password = ""
					this.form.Password2 = ""
					
					this.$refs.uForm.clearValidate()
					return
				}
				
				const data = {
					"OriginalPassword": this.form.OriginalPassword,
					"Password": this.form.Password,
				}
				uni.showLoading({
					mask: true
				})
				this.$axios.post(`/api/store/account/password/update`, data).then(res => {
					console.log(res)
					uni.hideLoading()
					uni.showToast({
						icon: "success",
						title: "修改密码成功"
					})
					
					setTimeout(() => {
						this.$goUrl("/pagesSub/login")
					}, 1000)
				}).catch(error => {
					this.pageStep = 1;
					this.form.OriginalPassword = ""
					this.form.Password = ""
					this.form.Password2 = ""
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
		background: #fff;
	}
	.title{
		margin-top: 30rpx;
		font-size: 48rpx;
		font-weight: 500;
	}
	
	.submit-btn{
		width: 702rpx;
		height: 88rpx;
		margin: 18rpx auto;
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
			width: 702rpx;
		}
		.u-form-item__body__right__message{
			margin:0!important;
			display:block;
			width:100%;
			padding-left: 24rpx;
		}
		.u-input{
			height: 88rpx;
			border-radius: 16rpx;
			background: #F5F5F5;
		}
	}
</style>
