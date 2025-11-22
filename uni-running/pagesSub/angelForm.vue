<template>
	<view>
		<u-navbar autoBack placeholder title="全速天使招募" />
		<up-form :model="form" ref="refForm" :rules="rules" labelPosition="top" labelWidth="auto">
			<up-form-item label="选择活动" prop="activity" required>
				<PickerCell v-model="form.activity" placeholder="--选择活动--" :title="null" :border="false" :columns="options_events" />
			</up-form-item>
			<up-form-item label="姓名" prop="fullName" required>
				<u-input v-model="form.fullName" placeholder="请输入名称" />
			</up-form-item>
			<u-form-item label="性别" prop="gender" :title="null" required>
				<PickerCell v-model="form.gender" placeholder="--选择性别--"  :border="false" :columns="options_gender" />
			</u-form-item>
			<u-form-item label="身份证号码" prop="id_card" required>
				<u-input v-model="form.id_card" placeholder="请输入身份证号码" />
			</u-form-item>
			<up-form-item label="手机号码" prop="phone" required>
				<u-input v-model="form.phone" placeholder="请输入手机号码" />
			</up-form-item>
		</up-form>
		
		<u-button type="primary" @click="submitForm()" customStyle="width:690rpx; margin: 60rpx auto 30rpx" color="#FF8C00" shape="circle" >
			提交申请
		</u-button>
	</view>
</template>
<script setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import PickerCell from "@/components/common/PickerCell.vue";
	import request from "../utils/request";

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
		gender: [{ required: true,  message: '必填项', trigger: ['change','blur']},],
		activity: [{ required: true,  message: '必填项', trigger: ['change','blur']},],
		fullName: [{ required: true,  message: '必填项', trigger: ['change','blur']},],
		id_card: [
			{ required: true,  message: '必填项', trigger: ['change','blur']},
			{
				validator: (rule, value, callback) => {
					return uni.$u.test.idCard(value);
				},
				message: '手机号码不正确',
				trigger: ['change','blur'],
			}
		],
		phone: [
			{ required: true,  message: '必填项', trigger: ['change','blur']},
			{
				validator: (rule, value, callback) => {
					// uni.$u.test.mobile()就是返回true或者false的
					return uni.$u.test.mobile(value);
				},
				message: '手机号码不正确',
				trigger: ['change','blur'],
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
		.u-form{
			padding: 10rpx 30rpx;
		}
		.picker-cell{
			.u-cell__body__content{
				display: none;
			}
			.u-cell__value{
				flex:1;
				text-align: left;
			}
			.u-cell__body{
				border: 0;
				height: 3.75rem;
				background: rgba(255, 255, 255);
				border-radius: 0.5rem;
				background: #ffffff;
				box-shadow: 0 0.125rem 0.3125rem 0.0625rem rgba(0, 0, 0, 0.16);
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
			border-radius: 16rpx;
			min-height: 100rpx;
			background: #ffffff;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
		}

		.u-input {
			border: 0;
			height: 120rpx;
			background: rgba(255, 255, 255);
			border-radius: 16rpx;
			background: #ffffff;
			box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0, 0, 0, 0.16);
		}

		.u-input__content__field-wrapper__field {
			color: #000000 !important;
			font-size: 28rpx !important;
		}

		.u-form-item__body {
			padding: 10px 0 5px !important;
		}

		.input-placeholder {
			font-weight: bold !important;
			font-size: 26rpx !important;
			color: #707070 !important;
		}
	}
</style>