<template>
	<view class="page">
		<u-navbar title="完善信息"></u-navbar>
		<view style="padding:20rpx 34rpx;">
			<u--form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="姓名" prop="full_name" required>
							<u-input v-model="form.full_name" placeholder="请填写参赛者姓名" />
						</u-form-item>
					</view>
					<view class="" style="margin-left:28rpx;">
						<u-form-item label="性别" prop="gender" required>
							<view class="u-input flex-start pr20" style="width:200rpx;justify-content: flex-end;" @click="openActionSheet('gender')">
								<view v-if="form.gender" class="mr10">
									{{calcuValue('gender')}}
								</view>
								<view v-if="!form.gender" class="input-placeholder">
									请选择性别
								</view>
								<view class="">
									<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
								</view>
							</view>
						</u-form-item>
					</view>
				</view>
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="手机号码" prop="phone_number" required>
							<u-input v-model="form.phone_number" placeholder="请填写手机号码" />
						</u-form-item>
					</view>
					<view class="" style="width:200rpx;margin-left:28rpx;">
						<u-form-item label="血型" prop="blood_type">
							<view class="u-input flex-start pr20" style="width:200rpx;justify-content: flex-end;" @click="openActionSheet('blood_type')">
								<view v-if="form.blood_type" class="mr10">
									{{calcuValue('blood_type')}}
								</view>
								<view v-if="!form.blood_type" class="input-placeholder">
									请选择血型
								</view>
								<view class="">
								<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
								</view>
							</view>
						</u-form-item>
					</view>
				</view>
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="身份证号码" prop="id_card" required>
							<u-input v-model="form.id_card" :disabled="disabled" placeholder="请填写您的身份证号码" />
						</u-form-item>
					</view>
					<view class="" style="width:200rpx;margin-left:28rpx;">
						<u-form-item label="T恤尺码" prop="tshirt_size" required>
							<view class="u-input flex-start pr20" style="width:200rpx;justify-content: flex-end;" @click="openActionSheet('tshirt_size')">
								<view v-if="form.tshirt_size" class="mr10">
									{{calcuValue('tshirt_size')}}
								</view>
								<view v-if="!form.tshirt_size" class="input-placeholder">
									请选择尺码
								</view>
								<view class="">
								<u-icon name="arrow-down-fill" color="#FF8C00"></u-icon>
								</view>
							</view>
						</u-form-item>
					</view>
				</view>
				
				<!-- <u-form-item label="邮箱" prop="email">
					<u-input v-model="form.email" placeholder="请填写您的电子邮箱" />
				</u-form-item>
				<view class="flex-between-center cell-line">
					<view class="flex">
						<u-form-item label="血型" prop="blood_type">
							<view class="u-input flex-center" style="width:200rpx;" @click="openActionSheet('blood_type')">
								<view v-if="form.blood_type" class="mr10">
									{{calcuValue('blood_type')}}
								</view>
								<view v-if="!form.blood_type" class="input-placeholder">
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
				</u-form-item> -->
			</u--form>
			
			<u-action-sheet :actions="options_sheet" @close="closeActionSheet" round="16" 
				cancelText="取消"
				@select="selectActionSheet"
				:closeOnClickOverlay="true" title="请选择" :show="isShowSheet"/>
		</view>
		
		<view class="fixed-bottom" style="padding: 56rpx 54rpx 80rpx">
			<u-button type="primary" shape="circle" @click="submit()">保存参赛者信息</u-button>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				disabled: false,
				form: {
					full_name: '',
					gender: '',
					phone_number: '',
					tshirt_size: '',
					id_card: '',
					email: '',
					blood_type: '',
					job: '',
					sportPurpose: '',
					strengths: '',
				},
				rules: {
					full_name: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					gender: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					tshirt_size: [{
						required: true,
						message: '必填项',
						trigger: ['blur', 'change']
					}],
					// blood_type: [{
					// 	required: true,
					// 	message: '必填项',
					// 	trigger: ['blur', 'change']
					// }],
					phone_number: [{
						required: true,
						message: '请输入有效手机号',
						pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
						trigger: ['blur', 'change']
					}],
					id_card: [{
						required: true,
						pattern: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
						message: '请输入有效身份证号码',
						trigger: ['blur', 'change']
					}],
				},
				isShowSheet: false,
				options_sheet: [],
				options_gender: [
					{name: "男", value: '1'},
					{name: "女", value: '0'},
					{name: "未知", value: '2'},
				],
				options_blood_type: [
					{name: "A型", value: 'A'},
					{name: "B型", value: 'B'},
					{name: "AB型", value: 'AB'},
					{name: "O型", value: 'O'},
				],
				options_tshirt_size: [
					{name: "120", value: '120'},
					{name: "130", value: '130'},
					{name: "140", value: '140'},
					{name: "XS", value: 'XS'},
					{name: "S", value: 'S'},
					{name: "M", value: 'M'},
					{name: "L", value: 'L'},
					{name: "XL", value: 'XL'},
					{name: "2XL", value: '2XL'},
					{name: "3XL", value: '3XL'},
					{name: "4XL", value: '4XL'},
				],
			};
		},
		computed: {
			userInfo() {
				return this.$store.state.userInfo
			}
		},
		onLoad() {
			this.getInfo()
			
			console.log('this.form=====>', this.form)
		},
		methods: {
			calcuValue(type) {
				const value = this.form[type];
				
				const option = this['options_' + type].find(i => i.value === value)
				
				return option?.name || ''
			},
			getInfo() {
				uni.showLoading({
					mask: true
				})
				const data = {
					phone_number: this.userInfo.phone
				}
				this.$axios.post('/booking-api/registration/getSignerInfo', data).then(res => {
					console.log(res)
					this.signerId = res.id
					
					if (res.id_card) {
						this.disabled = true;
					}
					const cache = uni.getStorageSync('SignerInfo') || {}
					
					console.log(cache)
					this.form =	{
						full_name: res.full_name || '',
						gender: res.gender || '1',
						phone_number: res.phone_number || '',
						tshirt_size: res.tshirt_size || '',
						id_card: res.id_card || '',
						email: res.email || '',
						blood_type: res.blood_type || '',
						job: res.occupation || '',
						sportPurpose: res.running_goal || '',
						strengths: res.good_at_sports || '',
						...cache,
						gender: cache.gender ? String(cache.gender) : '1',
					}
				})
			},
			openActionSheet(type) {
				this.sheetType = type;
				this.options_sheet = this['options_' + type];
				this.isShowSheet = true;
			},
			selectActionSheet(e) {
				console.log(e)
				this.form[this.sheetType] = e.value
				this.isShowSheet = false;
			},
			closeActionSheet() {
				this.isShowSheet = false;
			},
			submit() {
				this.$refs.uForm.validate().then(() => {
					const res = this.form
					const data = {
						full_name: res.full_name || '',
						gender: Number(res.gender),
						phone_number: res.phone_number || '',
						tshirt_size: res.tshirt_size || '',
						id_card: res.id_card || '',
						email: res.email || '',
						blood_type: res.blood_type || '',
						occupation: res.job || '',
						running_goal: res.sportPurpose || '',
						good_at_sports: res.strengths || '',
					}
					
					if (this.signerId) {
						data.id = this.signerId
					}
					
					uni.showLoading({
						mask: true
					})
					
					uni.setStorageSync('SignerInfo', data)
					
					this.$toast('保存成功')
					
					setTimeout(() => {
						uni.navigateBack()
					}, 300)
					
					return;
					
					this.$axios.post(`/booking-api/registration/${this.signerId ? 'updateSignerInfo' : 'saveSignerInfo'}`, data).then(res => {
						console.log(res)
						// uni.hideLoading()
						
						this.$toast('保存成功')

						setTimeout(() => {
							uni.navigateBack()
						}, 300)
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
			height: 120rpx;
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
	.fixed-bottom{
		position: fixed;
		bottom:0;
		width: 100%;
	}
</style>