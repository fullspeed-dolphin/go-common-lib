<template>
	<view style="padding-bottom: 100rpx;">
		<u-navbar autoBack placeholder title="全速天使招募" />
		<up-form :model="form" ref="refForm" :rules="rules" labelPosition="top" labelWidth="auto">
			<up-form-item label="选择活动" prop="activity" required>
				<PickerCell v-model="form.activity" placeholder="--选择活动--" :title="null" :border="false"
					:columns="options_events" />
			</up-form-item>

			<div class="userinfo-form">
				<up-form-item label="姓名" prop="fullName" required>
					<u-input v-model="form.fullName" placeholder="请输入名称" />
				</up-form-item>
				<u-form-item label="性别" prop="gender" :title="null" required>
					<PickerCell v-model="form.gender" placeholder="--选择性别--" :border="false" :columns="options_gender" />
				</u-form-item>
				<u-form-item label="身份证号码" prop="id_card" required>
					<u-input v-model="form.id_card" placeholder="请输入身份证号码" />
				</u-form-item>
				<up-form-item label="手机号码" prop="phone" required>
					<u-input v-model="form.phone" placeholder="请输入手机号码" />
				</up-form-item>
			</div>
		</up-form>
		
		<section class="payment-card">
			<view class="amount-row">
				<text class="amount">¥1</text>
				<text class="desc">(该费用用于购买保险)</text>
			</view>
	
			<view class="title">选择支付方式</view>
	
			<view class="payment-methods">
				<view class="method-item">
					<image src="/static/images/微信支付@2x.png" class="icon" />
					<u-radio v-model="selected" :value="'wechat'" activeColor="#FF8C00" />
				</view>
			</view>
		</section>

		<section class="section-bottom" style="width: 682rpx;margin: 48rpx auto;">
			<view class="txt flex-start">
				<up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
					:customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
				<text @click="isAgree = !isAgree">
					<text class="ml5">我已阅读并同意该</text>
				</text>
				<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>以及
				<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=baoxian')">《保险须知》</text>
			</view>
		</section>

		<u-button type="primary" @click="submitForm()" customStyle="width:642rpx; margin: 0rpx auto" color="#FF8C00"
			shape="circle">
			立即支付
		</u-button>
	</view>
</template>
<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import PickerCell from "@/components/common/PickerCell.vue";
	import request from "../utils/request";
	
	const selected = ref('wechat') // 默认微信支付
	const isAgree = ref(false)

	// 模板引用
	const refForm = ref(null);

	const options_gender = ref([{
			label: "男",
			value: "1"
		},
		{
			label: "女",
			value: "0"
		},
		{
			label: "未知",
			value: "2"
		},
	]);

	const options_events = ref([]);

	const form = ref({
		gender: "",
		activity: "",
		fullName: "",
		id_card: "",
		phone: "",
	});

	const rules = ref({
		gender: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		activity: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		fullName: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		id_card: [{
				required: true,
				message: '必填项',
				trigger: ['change', 'blur']
			},
			{
				validator: (rule, value, callback) => {
					return uni.$u.test.idCard(value);
				},
				message: '手机号码不正确',
				trigger: ['change', 'blur'],
			}
		],
		phone: [{
				required: true,
				message: '必填项',
				trigger: ['change', 'blur']
			},
			{
				validator: (rule, value, callback) => {
					// uni.$u.test.mobile()就是返回true或者false的
					return uni.$u.test.mobile(value);
				},
				message: '手机号码不正确',
				trigger: ['change', 'blur'],
			}
		],
	});

	const submitForm = () => {
		refForm.value.validate().then((res) => {
			const token = uni.getStorageSync("token");
			if (!token) {
				uni.$u.toast("请先登录~");
				setTimeout(() => {
					uni.$u.route("/pagesSub/login");
				}, 1000);
				return;
			}

			const data = {
				activity: form.value.activity,
			};
			uni.showLoading({
				mask: true,
			});

			request.post(`/running-group/api/v1/groups/update`, data).then(async (res) => {
				uni.$u.toast(group_id.value ? "更新成功" : "创建成功");

				setTimeout(() => {
					uni.navigateBack();
				}, 500);
			});
		});
	};
</script>

<style lang="less" scoped>
	::v-deep {
		.u-form {
			padding: 0rpx 34rpx;
		}

		.picker-cell {
			.u-cell__body__content {
				display: none;
			}

			.u-cell__value {
				flex: 1;
				text-align: left;
			}

			.u-cell__body {
				border: 0;
				height: 100rpx;
				background: rgba(255, 255, 255);
				border-radius: 16rpx;
				background: #ffffff;
				border: 2rpx solid rgba(0, 0, 0, 0.06);
			}

			.uicon-arrow-right {
				transform: rotate(90deg);
			}
		}

		.u-form-item__body__right__content__slot {
			width: 100% !important;
			display: block !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__right {
			width: 100% !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__right__content {
			width: 100% !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__left__content__label {
			flex: unset !important;
		}

		.u-textarea__count {
			right: 20rpx !important;
			bottom: 14rpx !important;
		}

		.u-cell__right-icon-wrap {
			margin-left: 0 !important;
		}

		.u-form-item__body__left__content__required {
			position: static !important;
			top: 0 !important;
		}

		.u-form-item__body__right__message {
			margin-left: 0 !important;
			margin-top: 6rpx;
		}

		.u-border,
		.u-input {
			border: 0;
		}

		.u-input {
			border: 0;
			height: 100rpx;
			padding: 13px 15px !important;
			background: rgba(255, 255, 255);
			border-radius: 16rpx;
			background: #ffffff;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
		}

		.u-input__content__field-wrapper__field {
			color: #000000 !important;
			font-size: 28rpx !important;
		}

		.u-form-item__body {
			padding: 10px 0 0px !important;
		}

		.input-placeholder {
			font-size: 26rpx !important;
			color: #BFBFBF !important;
		}
	}

	.userinfo-form {
		margin: 46rpx 0;
		padding: 0 20rpx 20rpx;
		background: #FFFFFF;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
	}
	
	.payment-card {
	  width: 682rpx;
		margin: 0 auto;
		padding: 54rpx 24rpx;
	  background: #FFFFFF;
	  border-radius: 16rpx 16rpx 16rpx 16rpx;
	  border: 2rpx solid rgba(0,0,0,0.06);
		.amount-row {
		  display: flex;
		  align-items: center;
		  margin-bottom: 40rpx;
		}
		
		.amount {
		  font-size: 44rpx;
		  color: #E53935;
		  font-weight: bold;
		  margin-right: 10rpx;
		}
		
		.desc {
		  font-size: 20rpx;
		  color: #BFBFBF;
		}
		
		.title {
		  font-size: 24rpx;
		  margin-bottom: 24rpx;
		}
		
		.payment-methods {
		  display: flex;
		  flex-direction: column;
		  gap: 20rpx;
		}
		
		.method-item {
		  display: flex;
		  align-items: center;
		  justify-content: space-between;
			.icon {
			  width: 56rpx;
			  height: 56rpx;
			  border-radius: 8rpx;
			}
		}
		
		
		
		.label {
		  font-size: 28rpx;
		  color: #333;
		  margin-left: 10rpx;
		}
	}
	
	
</style>