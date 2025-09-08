<template>
	<view class="page">
		<u-navbar title="创建跑团"></u-navbar>
		<view style="padding:20rpx 34rpx;">
			<u--form :model="form" ref="uForm" :rules="rules" labelWidth="auto">
				
				<view class="u--FileUploader">
					<u-form-item label="" prop="poster">
						<FileUploader v-model="form.poster"/>
					</u-form-item>
				</view>
				
				<u-form-item label="跑团名称" prop="name" required>
					<u-input v-model="form.name" placeholder="请输入名称" />
				</u-form-item>
				<view class="u--textarea">
					<u-form-item label="跑团详情" prop="description" labelPosition="top" required>
						<u--textarea v-model="form.description" maxlength="150" autoHeight placeholder="请填写跑团详情" count ></u--textarea>
					</u-form-item>
				</view>
				<u-form-item label="真实姓名" prop="fullName" required>
					<u-input v-model="form.fullName" placeholder="请输入您的真实姓名" />
				</u-form-item>
				<u-form-item label="联系电话" prop="phone" required>
					<u-input v-model="form.phone" placeholder="请输入您的联系电话" />
				</u-form-item>
				<u-form-item label="电子邮箱" prop="email">
					<u-input v-model="form.email" placeholder="请输入您的电子邮箱" />
				</u-form-item>
			</u--form>
			
			<view class="txt flex-start mt30 pt20">
				<u-checkbox-group v-model="isAgree">
					<u-checkbox inactiveColor="#000" name="agree" labelColor="#000" activeColor="#FF8C00" label="我已阅读并同意该"></u-checkbox>
				</u-checkbox-group>
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户隐私协议 》</text>
			</view>
			<view class="" style="padding: 26rpx 120rpx 0">
				<u-button type="primary" shape="circle" @click="submitForm()">创建跑团</u-button>
			</view>
		</view>
	</view>
</template>
<script>
	import FileUploader from "@/components/common/fileUploader.vue"
	export default {
		components: {
			FileUploader
		},
		data() {
			return {
				form: {
					poster: '',
					name: '',
					description: "",
					fullName: '',
					phone: '',
					email: '',
				},
				isAgree: [],
				rules: {
					poster: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					name: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					fullName: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					description: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					phone: [{
						required: true,
						message: '请输入有效手机号',
						pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
						trigger: ['blur', 'change']
					}],
				},
			};
		},
		methods: {
			submitForm() {
				this.$refs.uForm.validate().then(res => {
					const token = uni.getStorageSync("token");
					if (!token) {
						this.$toast("请先登录~");
						setTimeout(() => {
							this.$goUrl("/pagesSub/login");
						}, 1000)
						return 
					}
					
					if (!this.isAgree.length) return this.$toast("请勾选同意协议");
					
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

						this.$store.dispatch('getUserInfo')

						uni.$u.toast('登录成功')

						this.$goUrl("/pages/index")
					})
				})
			}
		}
	};
</script>

<style lang="less" scoped>
	.submit-btn {
		width: 682rpx;
		height: 72rpx;
		margin: 48rpx auto;
		border-radius: 16rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #FF8C00;
		background: rgba(255,255,255, .2);
	}

	::v-deep {
		.u--textarea{
			.u-form-item__body{
				padding: 20rpx 16rpx;
			}
		}
		.u-form-item__body__left__content__label{
			flex:none;
		}
		.u-form-item__body__left__content__required{
			position: static;
		}
		.u-form-item__body__right__message{
			margin-left: 0!important;
			margin-top:6rpx;
		}
		.u-border,
		.u-input{
			border:0;
		}
		.u-textarea{
			padding-bottom: 40rpx;
			padding-left:0;
			padding-right:0;
		}
		.u-form-item{
			margin: 40rpx 0;
		}
		.u-form-item__body{
			border:0;
			padding:0 16rpx;
			background: rgba(255,255,255);
			border-radius: 16rpx;
			background: #FFFFFF;
			box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
		}
		.u--FileUploader{
			.u-form-item__body{
				box-shadow: none;
			}
			.u-upload__wrap{
				display: flex;
				justify-content: center;
				.u-upload__button{
					width: 202rpx!important;
					height: 202rpx!important;
					border-radius: 16rpx;
					margin:0;
				}
			}
		}
		.input-placeholder{
			font-size: 24rpx;
			color:rgb(192, 196, 204);
		}
	}
</style>