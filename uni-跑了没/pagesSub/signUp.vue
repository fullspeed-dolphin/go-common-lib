<template>
	<view class="page">
		<u-navbar title="完善信息"></u-navbar>
		<view style="padding:20rpx 34rpx;">
			<u--form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="姓名" prop="fullName" required>
							<u-input v-model="form.fullName" placeholder="请填写参赛者姓名" />
						</u-form-item>
					</view>
					<view class="" style="margin-left:28rpx;">
						<u-form-item label="性别" prop="gender" required>
							<view class="u-input flex-center" style="width:200rpx;" @click="openActionSheet('gender')">
								<view v-if="form.gender" class="mr10">
									{{form.gender}}
								</view>
								<view v-if="!form.gender" class="input-placeholder">
									请选择性别
								</view>
								<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
							</view>
						</u-form-item>
					</view>
				</view>
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="电话号码" prop="phone" required>
							<u-input v-model="form.phone" placeholder="请填写手机号码" />
						</u-form-item>
					</view>
					<view class="" style="width:200rpx;margin-left:28rpx;">
						<u-form-item label="T恤尺码" prop="colthSize" required>
							<view class="u-input flex-center" style="width:200rpx;" @click="openActionSheet('colthSize')">
								<view v-if="form.colthSize" class="mr10">
									{{form.colthSize}}
								</view>
								<view v-if="!form.colthSize" class="input-placeholder">
									请选择尺码
								</view>
								<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
							</view>
						</u-form-item>
					</view>
				</view>
				<u-form-item label="身份证号码" prop="idNumber" required>
					<u-input v-model="form.idNumber" placeholder="请填写您的身份证号码" />
				</u-form-item>
				<u-form-item label="邮箱" prop="email">
					<u-input v-model="form.email" placeholder="请填写您的电子邮箱" />
				</u-form-item>
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="血型" prop="bloodType">
							<view class="u-input flex-center" style="width:200rpx;" @click="openActionSheet('bloodType')">
								<view v-if="form.bloodType" class="mr10">
									{{form.bloodType}}
								</view>
								<view v-if="!form.bloodType" class="input-placeholder">
									请选择血型
								</view>
								<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
							</view>
						</u-form-item>
					</view>
					<view class="flex" style="margin-left:28rpx;">
						<u-form-item label="职业" prop="job">
							<u-input v-model="form.job" placeholder="请填写您的职业(如:律师)" />
						</u-form-item>
					</view>
				</view>
				<u-form-item label="跑步目的" prop="sportPurpose">
					<u-input v-model="form.sportPurpose" placeholder="请填写您跑步的目的(如减肥,爱好等)" />
				</u-form-item>
				<u-form-item label="擅长的运动项目" prop="strengths">
					<u-input v-model="form.strengths" placeholder="请填写您擅长的运动项目(如:徒步等)" />
				</u-form-item>
			</u--form>
			
			<view class="" style="padding: 26rpx 120rpx 0">
				<u-button type="primary" shape="circle" @click="submit()">保存参赛者信息</u-button>
			</view>
			
			<u-action-sheet :actions="options_sheet" @close="closeActionSheet" round="16" 
				cancelText="取消"
				@select="selectActionSheet"
				:closeOnClickOverlay="true" title="请选择" :show="isShowSheet"></u-action-sheet>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				form: {
					fullName: '',
					gender: '',
					phone: '',
					colthSize: '',
					idNumber: '',
					email: '',
					bloodType: '',
					job: '',
					sportPurpose: '',
					strengths: '',
				},
				rules: {
					fullName: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					gender: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					colthSize: [{
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
					idNumber: [{
						required: true,
						pattern: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
						message: '请输入有效身份证号码',
						trigger: ['blur', 'change']
					}],
				},
				isShowSheet: false,
				options_sheet: [],
				options_gender: [
					{name: "男", value: '0'},
					{name: "女", value: '1'},
				],
				options_bloodType: [
					{name: "A型", value: '0'},
					{name: "B型", value: '1'},
					{name: "AB型", value: '2'},
					{name: "O型", value: '3'},
				],
				options_colthSize: [
					{name: "XS", value: '0'},
					{name: "S", value: '1'},
					{name: "M", value: '2'},
					{name: "L", value: '3'},
					{name: "XL", value: '4'},
					{name: "2XL", value: '5'},
					{name: "3XL", value: '6'},
					{name: "4XL", value: '7'},
				],
			};
		},
		methods: {
			openActionSheet(type) {
				this.sheetType = type;
				this.options_sheet = this['options_' + type];
				this.isShowSheet = true;
			},
			selectActionSheet(e) {
				console.log(e)
				this.form[this.sheetType] = e.name
				this.isShowSheet = false;
			},
			closeActionSheet() {
				this.isShowSheet = false;
			},
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
		.u-form-item__body__left__content__label {
			flex:none;
		}
		.u-form-item__body__left__content__required{
			position: static;
		}
		.u-input{
			border:0;
			height: 72rpx;
			background: rgba(255,255,255);
			border-radius: 16rpx;
			background: #FFFFFF;
			box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
		}
		.cell-line .u-form-item__body__left{
			flex-shrink: 1!important;
		}
		.input-placeholder{
			font-size: 24rpx;
			color:rgb(192, 196, 204);
		}
	}
	.flex-between-center{
		align-items: baseline;
	}
</style>