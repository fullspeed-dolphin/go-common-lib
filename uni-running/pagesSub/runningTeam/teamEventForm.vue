<template>
	<view class="page" style="background: #f3f3f3;padding-top: 30rpx;">
		<u-navbar autoBack placeholder title="提交活动申请"></u-navbar>
		<view style="padding: 20rpx 34rpx">
			<up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<!-- 两个上传框并排 -->
				<view class="upload-row">
					<view class="upload-item">
						<view class="upload-label">活动背景图(正方形)<text class="required-star">*</text></view>
						<FileUpload v-model="form.background_image_url" :width="164" :height="120" @change="validateField('background_image_url')">
							<template #trigger>
								<view class="section-upload-box">
									<u-icon name="photo" size="48" color="#cccccc"></u-icon>
								</view>
							</template>
						</FileUpload>
					</view>
					<view class="upload-item">
						<view class="upload-label">活动详情(H5长图)</view>
						<FileUpload v-model="form.long_image_url" :width="164" :height="120" @change="validateField('long_image_url')">
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
				
				<up-form-item label="活动描述" prop="description" labelPosition="top" required>
					<view class="" style="position: relative;">
						<textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="90" maxlength="150" placeholder="请输入活动描述" count></textarea>
						<view v-if="form.description" class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
							{{form.description.length}}/150
						</view>
					</view>
				</up-form-item>
				
				<up-form-item label="活动地址" prop="event_location" required>
					<view class="pickermap" style="padding:0;">
						<u-cell
							:border="false"
							:value="form.event_location || '请选择地址'"
							@click="handleChooseLocation()"
							isLink
						/>
					</view>
					<!-- <view class="select" @click="handleChooseLocation">
						<input v-model="form.event_location" class="u-input" readonly placeholder="请选择地址" />
						<view class="arrow-right">
							<u-icon name="arrow-right" size="20" color="#707070" />
						</view>
					</view> -->
				</up-form-item>
				
				<TagForm 
					title="活动项目" v-model="form.event_project" 
					required prop="event_project" name="event_project" 
					@input="validateField('event_project')" maxlength="50" placeholder="请添加活动项目" />
				
				<u-form-item label="活动时间" prop="event_time" required>
					<PickerTime v-model="form.event_time" mode="datetime"
						:minDate="new Date().getTime()"
						:maxDate="maxDate"
						:filter="timeFilter"
						:border="false"
						placeholder="请选择时间" :title="null" @change="validateField('event_time')" />
				</u-form-item>

				<u-form-item label="报名时间" prop="registration_time" required>
					<DatetimePicker v-model="form.registration_time" 
						:start="new Date().getTime()"
						:clear-icon="false"
						:border="false"
					@change="validateField('registration_time')" rangeSeparator="至" type="datetimerange" />
				</u-form-item>
				
				<up-form-item label="联系方式" prop="contact" required>
					<input v-model="form.contact" class="u-input" @input="validateField('contact')" type="number" maxlength="11" placeholder="请输入联系方式" />
				</up-form-item>

				<up-form-item label="活动人数" prop="capacity" required>
					<input v-model="form.capacity" class="u-input" type="number" maxlength="3" placeholder="请输入活动人数" @input="validateField('capacity')" />
				</up-form-item>
				<up-form-item label="一个人最多报名几个套餐" prop="multi_package" required>
					<input v-model="form.multi_package" class="u-input" type="number" maxlength="2" placeholder="请输入数量" @input="validateField('multi_package')"  />
				</up-form-item>

				<TagForm
					title="参赛包地址" v-model="form.racekit_pickup_address" 
					required prop="racekit_pickup_address" name="racekit_pickup_address" 
					@input="validateField('racekit_pickup_address')" maxlength="500" placeholder="请添加参赛包地址" />

				<u-form-item label="是否付费" prop="is_free" required>
					<PickerCell v-model="form.is_free" :title="null" @change="validateField('is_free')" placeholder="请选择" :border="false" :columns="options_is_free" />
				</u-form-item>
				
				<u-form-item label="退款时间" v-if="form.is_free === '1'" prop="refund_valid_hour" required>
					<PickerCell v-model="form.refund_valid_hour" :title="null" @change="validateField('refund_valid_hour')" placeholder="请选择" :border="false" :columns="options_hour" />
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
	import TagForm from "@/components/common/TagForm.vue";
	import PickerTime from "@/components/common/PickerTime.vue";
	import FileUpload from "@/components/common/FileUpload.vue";
	// import DatetimePicker from "./uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
	import DatetimePicker from "@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
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
		background_image_url: "",
		long_image_url: "",
		contact: "",
		description: "",
		name: "",
		capacity: "",
		event_time: "",
		startTime: "",
		endTime: "",
		event_location: "",
		event_project: "欢乐跑",
		is_free: "1",
		multi_package: "",
		status: "PND",
		refund_valid_hour: "24",
		registration_time: [],
	});

	const options_is_free = ref([
		{ label: "是", value: 1 },
		{ label: "否", value: 0 }
	]);
	
	const options_hour = Array.from({ length: 24 }, (_, i) => ({
		label: `${i + 1} 小时`,
		value: i + 1
	}));

	const maxDate = dayjs().add(4, 'M').valueOf();

	const isAgree = ref(false);
	
	function validateField(propName) {
		uForm.value.validateField(propName, () => {}, "change");
	}

	const rules = ref({
		background_image_url: [{ required: true, message: "请上传活动背景图", trigger: ["blur", "change"]}],
		name: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		description: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		capacity: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		racekit_pickup_address: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		multi_package: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		event_project: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		registration_time: [{ required: true, type: "array", message: "必填项", trigger: ["blur", "change"]}],
		contact: [
			{ required: true, message: "必填项", trigger: ["blur", "change"]},
			{
				validator: (rule, value, callback) => {
					return uni.$u.test.mobile(value);
				},
				message: '手机号码不正确',
				trigger: ['change','blur'],
			}
		],
		event_time: [{
			required: true,
			message: "请选择活动时间",
			trigger: ["blur", "change"],
		}],
		is_free: [{
			required: true,
			message: "请选择是否付费",
			trigger: ["blur", "change"],
		}],
	});

	// 时间过滤器
  function timeFilter(type, options) {
		if (type === 'minute') {
			// 只保留 0 和 30 分钟
			return ["00", "30"];
		}
		// 其他类型（如 hour）不做过滤
		return options
	}
	
	const handleChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log(res, "返回地址");
				form.value.event_location = res.address;
				
				validateField('event_location')
			},
			fail: (e) => {
				console.log(e, "选择地址失败");
			},
		});
	};

	// 页面加载
	const routerParams = ref({})
	onLoad((options) => {
		console.log("option", options);
		group_id.value = options.group_id;
		
		routerParams.value = options
		form.value.phone = store.state.userInfo.phone;
		
		getDetail();
	});

	// 方法定义
	const getDetail = (page) => {
		if (!routerParams.value.id) return;
		request.get(`/event-api/fsc_events/${routerParams.value.id}`)
			.then((res) => {
				console.log('res=====>', res)
				// merge into existing form to preserve reactivity and default keys
				Object.assign(form.value, {
					...res,
					racekit_pickup_address: res.racekit_pickup_address?.addresses?.[0] || "",
					event_time: dayjs(res.event_time).valueOf(),
					// ensure these fields are strings so validator treats them as filled
					capacity: res.capacity != null ? String(res.capacity) : form.value.capacity,
					multi_package: res.multi_package != null ? String(res.multi_package) : form.value.multi_package,
					is_free: res.is_free != null ? String(res.is_free) : form.value.is_free,
				});
				
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

			const data = {
				...form.value,
				fsc_id: Number(group_id.value),
				capacity: Number(form.value.capacity),
				is_free: Number(form.value.is_free),
				multi_package: Number(form.value.multi_package),
				refund_valid_hour: Number(form.value.refund_valid_hour),
				event_time: dayjs(res.event_time).format("YYYY-MM-DDTHH:mm:00+08:00"),
				registration_time: JSON.stringify(form.value.registration_time),
				racekit_pickup_address: JSON.stringify({
					addresses: form.value.racekit_pickup_address.split(",")
				})
			};

			console.log(data, "提交数据");

			uni.showLoading({
				mask: true,
			});

			let url = "/event-api/fsc_events";

			// 更新跑团
			if (group_id.value) {
				url = "/event-api/fsc_events";
			}
			request.post(url, data).then(async (res) => {
				console.log(res);

				uni.$u.toast("创建成功");

				// 跳转回上一级页面，返回上一页并传递参数
				uni.$emit("updateList", {
					isChange: true,
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 500);
			})
		});
	};
</script>

<style lang="less" scoped>
	::v-deep{
		.u-form-item__body{
			flex-direction: column!important;
		}
		.uni-date-range{
			height: 100rpx;
		}
		.u-cell__body{
			border-radius: 8px;
		}
	}
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
				border-radius: 8px;
			}

			.u-cell__body__content {
				flex: none;
			}

			.u-cell__value {
				flex: 1;
				text-align: left !important;
				margin-left: 0 !important;
				// font-weight: bold;
				// font-size: 26rpx;
				// color: #dadada;
			}
		}
		
		.TagForm .placeholder {
			// font-weight: 400 !important;
			font-size: 26rpx !important;
			// color: #dadada !important;
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
				min-height: 80rpx;
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
				// font-weight: bold;
				// font-size: 26rpx;
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
		.u-input,
		.TagForm .tag-box
		{
			width: 682rpx;
			font-size: 30rpx;
			padding: 20rpx;
			border-radius: 16rpx;
			min-height: 100rpx;
			background: #ffffff;
			// font-weight: bold !important;
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