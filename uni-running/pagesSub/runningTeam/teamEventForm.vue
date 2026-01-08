<template>
	<view class="page" style="background: #f3f3f3;padding-top: 30rpx;">
		<u-navbar autoBack placeholder title="提交活动申请"></u-navbar>
		<view style="padding: 20rpx 34rpx">
			<up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<!-- 两个上传框并排 -->
				<view class="upload-row">
					<view class="upload-item">
						<view class="upload-label">活动背景图(正方形)<text class="required-star">*</text></view>
						<FileUpload v-model="form.poster" :width="164" :height="120" @change="validateField('poster')">
							<template #trigger>
								<view class="section-upload-box">
									<u-icon name="photo" size="48" color="#cccccc"></u-icon>
								</view>
							</template>
						</FileUpload>
					</view>
					<view class="upload-item">
						<view class="upload-label">活动详情(H5长图)</view>
						<FileUpload v-model="form.longImage" :width="164" :height="120" @change="validateField('longImage')">
							<template #trigger>
								<view class="section-upload-box">
									<u-icon name="photo" size="48" color="#cccccc"></u-icon>
								</view>
							</template>
						</FileUpload>
					</view>
				</view>

				<up-form-item label="活动名称" prop="name" required>
					<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder="请输入活动名称" />
				</up-form-item>

				<up-form-item label="活动人数" prop="peopleCount" required>
					<input v-model="form.peopleCount" class="u-input" type="number" @input="validateField('peopleCount')" maxlength="50" placeholder="请输入活动人数" />
				</up-form-item>

				<u-form-item label="活动时间" prop="eventTime" required>
					<PickerTime v-model="form.eventTime" mode="datetime"
						:minDate="new Date().getTime()"
						:maxDate="maxDate"
						placeholder="请选择时间" :title="null" @change="validateField('eventTime')" />
				</u-form-item>

				<u-form-item label="是否付费" prop="isPaid" required>
					<PickerCell v-model="form.isPaid" :title="null" @change="validateField('isPaid')" placeholder="请选择" :border="false" :columns="options_isPaid" />
				</u-form-item>
			</up-form>

			<view class="" style="padding: 60rpx 8rpx 30rpx">
				<u-button type="primary" color="#FF8C00" shape="circle" @click="submitForm()">提交活动申请</u-button>
			</view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		watch,
		nextTick
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		useStore
	} from "vuex";
	
	import PickerCell from "@/components/common/PickerCell.vue";
	import PickerTime from "@/components/common/PickerTime.vue";
	import FileUpload from "@/components/common/FileUpload.vue";
	import dayjs from "dayjs";
	import request from "@/utils/request.js"

	// 使用store
	const store = useStore();

	// 模板引用
	const uForm = ref(null);

	// 响应式数据
	const group_id = ref("");
	const from = ref("");
	const form = ref({
		poster: "",
		longImage: "",
		name: "",
		peopleCount: "",
		eventTime: "",
		isPaid: "",
	});

	const options_isPaid = ref([
		{
			label: "是",
			value: "1"
		},
		{
			label: "否",
			value: "0"
		},
	]);

	const maxDate = dayjs().add(3, 'M').valueOf();

	const isAgree = ref(false);
	
	function validateField(propName) {
		uForm.value.validateField(propName, () => {}, "change");
	}

	const rules = ref({
		poster: [{
			required: true,
			message: "请上传活动背景图",
			trigger: ["blur", "change"],
		}],
		name: [{
			required: true,
			message: "请输入活动名称",
			trigger: ["blur", "change"],
		}],
		peopleCount: [{
			required: true,
			message: "请输入活动人数",
			trigger: ["blur", "change"],
		}],
		eventTime: [{
			required: true,
			message: "请选择活动时间",
			trigger: ["blur", "change"],
		}],
		isPaid: [{
			required: true,
			message: "请选择是否付费",
			trigger: ["blur", "change"],
		}],
	});

	// 页面加载
	onLoad((options) => {
		console.log("option", options);
		group_id.value = options.group_id;

		from.value = options.from;
		// getDetail();
	});

	// 方法定义
	const getDetail = (page) => {
		form.value.phone = store.state.userInfo.phone;
		if (!group_id.value) return;
		request.get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
			.then((res) => {
				form.value = {
					poster: res.avatar_url,
					name: res.name,
					location: res.establish_location,
					description: res.introduction,
					fullName: res.creator_real_name,
					phone: res.creator_phone,
					// amount: String(res.total_members),
					establish_time: dayjs(res.establish_time).valueOf(),
				};

				isAgree.value = true;
			});
	};

	const submitForm = () => {
		uForm.value.validate().then((res) => {
			const token = uni.getStorageSync("token");
			if (!token) {
				uni.$u.toast("请先登录~");
				setTimeout(() => {
					uni.$u.route("/pagesSub/login");
				}, 1000);
				return;
			}

			if (!isAgree.value) return uni.$u.toast("请勾选同意协议");

			const data = {
				avatar_url: form.value.poster,
				name: form.value.name,
				establish_location: form.value.location,
				creator_real_name: form.value.fullName,
				// "total_members": form.value.amount,
				introduction: form.value.description,
				creator_phone: form.value.phone,
				establish_time: form.value.establish_time,
			};
			uni.showLoading({
				mask: true,
			});

			let url = "/running-group/api/v1/groups";

			// 更新跑团
			if (group_id.value) {
				url = "/running-group/api/v1/groups/update";
			}
			request.post(url, data).then(async (res) => {
				console.log(res);

				uni.$u.toast(group_id.value ? "更新成功" : "创建成功");

				const res1 = await store.dispatch("getUserInfo");

				// 跳转回上一级页面，返回上一页并传递参数
				uni.$emit("updateList", {
					isChange: true,
					from: from.value,
					group_id: res1.running_group,
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 500);
			}).catch(e => {
				uni.hideLoading()
				uni.showModal({
				  title: '提示',
				  content: e.msg,
				  showCancel: false, // 如果不需要“取消”按钮
				  confirmText: '我知道了'
				});
			})
		});
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
		color: #ff8c00;
		background: rgba(255, 255, 255, 0.2);
	}

	.upload-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.upload-item {
		width: 328rpx;
	}

	.upload-label {
		font-weight: bold;
		font-size: 30rpx;
		color: #000;
		margin-bottom: 20rpx;
	}

	.required-star {
		color: red;
		margin-left: 4rpx;
	}

	.section-upload-box {
		width: 328rpx;
		height: 240rpx;
		background: #fff;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.form-item-uploader {
		display: flex;
		justify-content: center;
	}
	

	::v-deep {
		.picker-cell {
			&.placeholder{
				.u-cell__value {
					color: #dadada;
					font-size: 26rpx;
					font-weight: bold;
				}
			}
			
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

		.pickerTime {
			width: 100% !important;
			max-width: 100% !important;
			display: block !important;
			box-sizing: border-box !important;

			.u-cell {
				display: block !important;
				width: 100% !important;
				background: #ffffff;
				border: 2rpx solid rgba(0, 0, 0, 0.06);
			}

			.u-cell__body__content {
				flex: none;
			}

			.u-cell__value {
				flex: 1;
				text-align: left !important;
				margin-left: 0 !important;
				font-weight: bold;
				font-size: 26rpx;
				color: #dadada;
			}
		}

		.pickermap {
			width: 100% !important;
			max-width: 100% !important;
			display: block !important;
			box-sizing: border-box !important;
			overflow: hidden;

			.u-cell {
				display: block !important;
				width: 100% !important;
				max-width: 100% !important;
				box-sizing: border-box !important;
				border: 0;
				min-height: 88rpx;
				background: #ffffff;
				border-radius: 16rpx;
				border: 2rpx solid rgba(0, 0, 0, 0.06);
			}

			.u-cell__body {
				padding-right: 20rpx;
				width: 100% !important;
				max-width: 100% !important;
				box-sizing: border-box !important;
			}

			.u-cell__body__content {
				flex: none;
			}

			.u-cell__value {
				flex: 1 !important;
				max-width: 100% !important;
				text-align: left !important;
				margin-left: 0 !important;
				font-weight: bold;
				font-size: 26rpx;
				color: #707070;
			}
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

		.u-form-item__body__left__content {
			display: flex !important;
			flex-direction: row !important;
		}

		.u-form-item__body__left__content__required {
			position: relative !important;
			top: 0 !important;
			left: 0 !important;
			order: 1 !important;
			margin-left: 4rpx !important;
		}

		.u-form-item__body__right__message {
			margin-left: 0 !important;
			margin-top: 6rpx;
		}

		.pickermap,
		.u-input {
			width: 682rpx;
			font-size: 26rpx;
			padding: 20rpx;
			border-radius: 16rpx;
			min-height: 100rpx;
			background: #ffffff;
			font-weight: bold !important;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
			box-sizing: border-box;
		}

		// .u-form-item__body{
		// 	border:0;
		// 	padding:10rpx 16rpx!important;
		// 	background: rgba(255,255,255);
		// 	border-radius: 16rpx;
		// 	background: #FFFFFF;
		// 	box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
		// }
		.u-textarea__field {
			color: #000000 !important;
			font-size: 28rpx !important;
		}

		.u-input__content__field-wrapper__field {
			color: #000000 !important;
			font-size: 28rpx !important;
		}

		.u-form-item__body {
			padding: 10px 0 5px !important;
		}

		.u-FileUploader {
			.u-form-item__body {
				box-shadow: none;
			}

			.u-upload__wrap {
				display: flex;
				justify-content: center;

				.u-upload__button {
					width: 202rpx !important;
					height: 202rpx !important;
					border-radius: 16rpx;
					margin: 0;
				}
			}
		}

		.input-placeholder {
			font-weight: bold !important;
			font-size: 26rpx !important;
			color: #dadada !important;
		}

		.textarea-placeholder {
			font-weight: bold !important;
			font-size: 26rpx !important;
			color: #dadada !important;
		}
	}

	.select {
		position: relative;
		display: flex;
		align-items: center;

		.arrow-right {
			position: absolute;
			right: 8rpx;
			top: 50%;
			transform: translateY(-50%);
		}
	}
	
	::v-deep {
		.u-navbar__content__title {
			font-weight: 500;
			font-family: PingFang SC, PingFang SC;
		}

		.u-popup__content {
			border-radius: 20rpx 20rpx 0 0;
		}

		.upload-item {
			.flex1 {
				width: 100%;
			}

			.u-upload {
				width: 100%;
			}

			.u-upload__wrap {
				width: 100%;
			}

			.u-upload__wrap__preview {
				margin: 0 !important;
			}

			.u-upload__wrap__preview__image {
				border-radius: 16rpx !important;
			}
		}
	}
</style>