<template>
	<view style="padding: 24rpx;padding-bottom: 160rpx;background:#f3f3f3;min-height: 100vh;box-sizing: border-box;">
		<u-navbar @leftClick="leftClick" :autoBack="false" placeholder title="提交活动申请"></u-navbar>
		<u-steps :current="pageIndex" style="">
			<u-steps-item title="设置基础信息" />
			<u-steps-item title="设置套餐信息" />
			<u-steps-item title="完成设置"/>
		</u-steps>
		
		<view v-if="pageIndex === 0 " class="u-mb-30 u-mt-30">
			设置基础信息
		</view>
		<view v-show="pageIndex === 0" class="panel-section">
			<up-form :model="form" ref="uForm" :rules="rules" labelWidth="auto">
				<!-- 两个上传框并排 -->
				<view class="flex-between-center">
					<view class="upload-item">
						<view class="upload-label tal b c0 u-mb-20">活动背景图(正方形)<text class="required-star u-ml-5">*</text></view>
						<FileUpload v-model="form.background_image_url" width="324rpx" :height="120" @change="validateField('background_image_url')" />
					</view>
					<view class="upload-item">
						<view class="upload-label tal b c0 u-mb-20">活动详情(H5长图)</view>
						<FileUpload v-model="form.long_image_url" width="324rpx" :height="120" @change="validateField('long_image_url')" />
					</view>
				</view>

				<up-form-item label="活动名称" prop="name" required>
					<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder="请输入活动名称" />
				</up-form-item>
				
				<view class="textarea-cell">
					<up-form-item label="活动描述" prop="description" labelPosition="top" required>
						<view  style="position: relative;">
							<textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="80" maxlength="150" placeholder="请输入活动描述" count></textarea>
							<view v-if="form.description" class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
								{{form.description.length}}/150
							</view>
						</view>
					</up-form-item>
				</view>
				
				<up-form-item label="活动地址" prop="event_location" required>
					<view class="pickermap" style="padding:0;">
						<u-cell
							:border="false"
							:value="form.event_location || '请选择地址'"
							@click="handleChooseLocation()"
							isLink
						/>
					</view>
				</up-form-item>
				
				<TagForm 
					title="活动项目" v-model="form.event_projects" 
					required prop="event_projects" name="event_projects" 
					@input="validateField('event_projects')" maxlength="50" placeholder="请添加活动项目" />
				
				<u-form-item label="活动时间" prop="event_time" required>
					<PickerTime v-model="form.event_time" mode="datetime"
						:minDate="new Date().getTime()"
						:maxDate="maxDate"
						:filter="timeFilter"
						:border="false"
						returnType="YYYY-MM-DD hh:mm"
						placeholder="请选择时间" :title="null" @change="validateField('event_time')" />
				</u-form-item>

				<u-form-item label="报名时间" prop="registration_time" required>
					<TimeRange v-model="form.registration_time" @change="validateField('registration_time')" />
				</u-form-item>
				
				<up-form-item label="联系方式" prop="contact" required>
					<input v-model="form.contact" class="u-input" @input="validateField('contact')" type="number" maxlength="11" placeholder="请输入联系方式" />
				</up-form-item>

				<up-form-item label="活动人数" prop="capacity" required>
					<input v-model="form.capacity" class="u-input" type="number" maxlength="3" placeholder="请输入活动人数" @input="validateField('capacity')" />
				</up-form-item>
				<up-form-item label="报名数量" prop="multi_package" required>
					<input v-model="form.multi_package" class="u-input" type="number" maxlength="2" placeholder="一个人最多报名几个套餐" @input="validateField('multi_package')"  />
				</up-form-item>

				<TagForm
					title="参赛包领取地址" v-model="form.racekit_pickup_address"
					required prop="racekit_pickup_address" name="racekit_pickup_address"
					@input="validateField('racekit_pickup_address')" maxlength="500" placeholder="请添加参赛包领取地址" />

				<u-form-item label="可见范围" prop="visibility">
					<PickerCell v-model="form.visibility" :title="null" @change="validateField('visibility')" placeholder="请选择活动可见范围" :border="false" :columns="options_visibility" />
				</u-form-item>

				<u-form-item label="是否付费" prop="is_free">
					<PickerCell v-model="form.is_free" :title="null" @change="validateField('is_free')" placeholder="请选择" :border="false" :columns="options_is_free" />
				</u-form-item>
				
				<u-form-item label="退款时间" v-if="form.is_free === '1'" prop="refund_valid_hour">
					<PickerCell v-model="form.refund_valid_hour" :title="null" @change="validateField('refund_valid_hour')" placeholder="请选择" :border="false" :columns="options_hour" />
				</u-form-item>
			</up-form>
		</view>

		<TeamEventFormPackage ref="refTeamEventFormPackage" v-if="pageIndex === 1" :event-id="routerParams.id || ''" />

		<!-- 底部固定按钮 -->
		<view class="section-bottom">
			<u-button type="primary" color="#FF8C00" shape="circle" :disabled="isSubmitting"
				customStyle="height: 84rpx; width: 100%;"
				@click="submitForm()">
				{{computedSubmitBtn}}
			</u-button>
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
	import PickerMap from "@/components/common/PickerMap.vue";
	import FileUpload from "@/components/common/FileUpload.vue";
	import TimeRange from "./TimeRange.vue";
	import TeamEventFormPackage from "./TeamEventFormPackage.vue";
	import dayjs from "dayjs";
	import request from "@/utils/request.js"

	const pageIndex = ref(0)

	// 使用store
	const store = useStore();

	// 模板引用
	const refTeamEventFormPackage = ref(null);
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
		event_projects: "欢乐跑",
		is_free: "1",
		multi_package: "",
		status: "PND",
		refund_valid_hour: "24",
		registration_time: "",
		visibility: "private",
	});

	const isSubmitting = ref(false)

	const options_is_free = ref([
		{ label: "是", value: 1 },
		{ label: "否", value: 0 }
	]);

	const options_visibility = ref([
		{ label: "其他跑团可见", value: "private" },
		{ label: "跑团内部可见", value: "rg_member_only" },
		{ label: "全平台可见", value: "public" }
	]);

	const computedSubmitBtn = computed(() => {
		if (isSubmitting.value) {
			return '提交中...'
		}

		if (form.value.is_free === '1' && pageIndex.value === 0) {
			return '下一步配置套餐价格'
		}

		// 被拒绝的活动显示"重新提交"
		if (routerParams.value.status === 'REJ') {
			return '重新提交'
		}

		return '提交'
	})
	
	const options_hour = Array.from({ length: 24 }, (_, i) => ({
		label: `${i + 1} 小时`,
		value: i + 1
	}));

	const maxDate = dayjs().add(4, 'M').valueOf();

	function validateField(propName) {
		uForm.value.validateField(propName, () => {}, "change");
	}
	
	function leftClick () {
		console.log(';leftClick====>', pageIndex.value)
		if (pageIndex.value === 1) {
			pageIndex.value = 0
			return;
		}
		
		uni.navigateBack()
	}

	const rules = ref({
		background_image_url: [{ required: true, message: "请上传活动背景图", trigger: ["blur", "change"]}],
		name: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		description: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		capacity: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		racekit_pickup_address: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		multi_package: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		event_projects: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
		registration_time: [{ required: true, message: "必填项", trigger: ["blur", "change"]}],
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
		console.log("status from router:", options.status);
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
					event_time: res.event_time != null ? String(dayjs(res.event_time).valueOf()) : form.value.event_time,
					// ensure these fields are strings so validator treats them as filled
					capacity: res.capacity != null ? String(res.capacity) : form.value.capacity,
					multi_package: res.multi_package != null ? String(res.multi_package) : form.value.multi_package,
					is_free: res.is_free != null ? String(res.is_free) : form.value.is_free,
					// registration_time: [
					// 	dayjs(JSON.parse(res.registration_time)[0]).valueOf(),
					// 	dayjs(JSON.parse(res.registration_time)[1]).valueOf()
					// ]
				});
			});
	};

	// 监听 pageIndex 变化，编辑模式下切换到套餐页时加载数据
	// watch(pageIndex, async (newVal) => {
	// 	if (newVal === 1 && routerParams.value.id) {
	// 		await nextTick();
	// 		refTeamEventFormPackage.value?.loadTicketData(routerParams.value.id);
	// 	}
	// });

	const packageResult = ref({});
	const submitForm = async () => {
		// 第二步：提交套餐
		if (pageIndex.value === 1) {
			packageResult.value = await refTeamEventFormPackage.value.submitForm();
			if (!packageResult.value?.success) return;

			isSubmitting.value = true;

			const isEdit = !!routerParams.value.id;
			if (isEdit) {
				try{
					await createPackage(routerParams.value.id);
					await createEvent(true);
				} catch(e) {
					console.error('编辑活动失败', e);
				}

				isSubmitting.value = false;

				uni.$u.toast(isEdit ? "更新成功" : "创建成功");
				uni.$emit("updateList", { isChange: true });
				setTimeout(() => uni.navigateBack(), 500);

				return;
			}

			// 先创建/更新活动基础信息，获取 event_id
			const eventId = await createEvent(true); // skipNavigation = true
			if (!eventId) {
				isSubmitting.value = false;
				return;
			}
			await createPackage(eventId);
			
			uni.$u.toast(isEdit ? "更新成功" : "创建成功");
			uni.$emit("updateList", { isChange: true });
			setTimeout(() => uni.navigateBack(), 500);
			return;
		}

		// 第一步：验证基础信息
		uForm.value.validate().then((res) => {
			const token = uni.getStorageSync("token");
			if (!token) {
				uni.$u.toast("请先登录~");
				setTimeout(() => {
					uni.$u.route("/pagesSub/login");
				}, 1000);
				return;
			}

			console.log("验证通过", form.value.event_time);

			if (form.value.is_free === '1') {
				if (pageIndex.value === 0) {
					pageIndex.value = 1;
				}
			} else {
				createEvent(); // 免费活动直接创建
			}
		});
	};

	async function createPackage(eventId) {
		// 调用 ticket_type API 创建/更新套餐价格
			const isEdit = !!routerParams.value.id;
			const ticketUrl = isEdit
				? '/event-api/ticket_type/update'
				: '/event-api/ticket_type';

			try {
				await request.post(ticketUrl, {
					event_id: eventId,
					ticket_type: 'ga',
					price: JSON.stringify(packageResult.value.data),
					currency: 'CNY'
				});

				uni.hideLoading();
				
			} catch (e) {
				uni.hideLoading();
				console.error('保存套餐价格失败', e);
				uni.$u.toast('保存套餐价格失败');
			} finally {
				isSubmitting.value = false;
			}
	}

	// 创建/更新活动基础信息，返回 event_id
	async function createEvent (skipNavigation = false) {
		const data = {
			...form.value,
			fsc_id: Number(group_id.value),
			capacity: Number(form.value.capacity),
			is_free: Number(form.value.is_free),
			multi_package: Number(form.value.multi_package),
			refund_valid_hour: Number(form.value.refund_valid_hour),
			event_time: dayjs(Number(form.value.event_time)).toISOString(),
			racekit_pickup_address: JSON.stringify({
				addresses: form.value.racekit_pickup_address.split(",")
			})
		};

		console.log(data, "提交数据");

		uni.showLoading({
			mask: true,
		});

		let url = "/event-api/fsc_events";
		const isEdit = !!data.id;

		// 更新活动
		if (isEdit) {
			data.status = "PND";
			data.event_id = data.id;
			delete data.id;
			url = "/event-api/fsc_events/update";
		}

		try {
			const res = await request.post(url, data);
			console.log(res);

			// 返回 event_id：新创建返回 res.id，编辑时返回 data.event_id
			const eventId = isEdit ? data.event_id : res.id;

			// 如果不跳过导航（免费活动直接完成）
			if (!skipNavigation) {
				uni.hideLoading();
				uni.$u.toast(isEdit ? "更新成功" : "创建成功");
				uni.$emit("updateList", { isChange: true });
				setTimeout(() => uni.navigateBack(), 500);
			}

			return eventId;
		} catch (e) {
			uni.hideLoading();
			console.error('创建活动失败', e);
			return null;
		}
	}
</script>

<style lang="scss" scoped>
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

	.required-star {
		color: red;
	}

	.section-upload-box {
		width: 320rpx;
		height: 240rpx;
		background: #f7f8fa;
		border-radius: 16rpx;
	}

	::v-deep{
		.u-steps{
			background: #fff;
			border-radius: 16rpx;
			padding: 60rpx 40rpx;
			margin-bottom: 40rpx;
		}
		.panel-section{
			text-align: right;
			background: #fff;
			border-radius: 16rpx;
			padding: 60rpx 30rpx;
		}

		.u-form-item__body{
			position: relative;
			padding: 20px 0;
				&:after {

				position: absolute;
				box-sizing: border-box;
				-webkit-transform-origin: center;
				transform-origin: center;
				content: " ";
				pointer-events: none;
				top: -50%;
				right: -50%;
				bottom: -50%;
				left: -50%;
				border: 0 solid #ebedf0;
				transform: scale(.5);
				border-bottom-width: 1px;
			}
		}
		.TimeRange{
			.u-cell__body__content{
				display: none;
			}
			.u-cell__value{
				flex:1;
				text-align: center;
			}
		}

		.textarea-cell{
			.u-form-item__body__left__content__label{
				flex:none;
			}
			.u-input{
				width: 100%;
				height: 200rpx;
				border: 1px solid #ebedf0;
				border-radius: 16rpx;
				padding: 10rpx;
				box-sizing: border-box;
				text-align: left;
			}
		}
		.u-form-item__body__left__content__required{
			top:0;
			font-size: 14px;
			position: relative !important;
			top: 0 !important;
			left: 0 !important;
			order: 1 !important;
			margin-left: 4rpx !important;
		}
	}

	.section-bottom {
		position: fixed;
		bottom: 30rpx;
		left: 0;
		right: 0;
		z-index: 10;
		padding: 0 30rpx 20rpx;
	}
	</style>