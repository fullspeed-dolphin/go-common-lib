<template>
	<view class="page">
		<u-navbar autoBack placeholder :title="group_id ? '更新跑团' : '创建跑团'"></u-navbar>
		<view style="padding: 20rpx 34rpx">
			<up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<view class="form-item-uploader">
					<up-form-item :label="null" prop="poster">
						<FileUpload v-model="form.poster" @change="validateField('poster')">
							<template #trigger>
								<view class="section-upload flex-col-center">
									<view class="icon">
										<up-icon name="plus" color="#E3E3E3" size="86rpx"></up-icon>
									</view>
								</view>
							</template>
						</FileUpload>
					</up-form-item>
				</view>

				<up-form-item label="跑团名称" prop="name" required>
					<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder="请输入名称" />
				</up-form-item>
				<up-form-item label="跑团宣言" prop="description" labelPosition="top" required>
					<view class="" style="position: relative;">
						<textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="110" maxlength="150" placeholder="请填写跑团宣言" count></textarea>
						<view class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
							{{form.description.length}}/150
						</view>
					</view>
				</up-form-item>
				<up-form-item label="跑团总部地址" prop="location" required>
					<view class="select" @click="handleChooseLocation">
						<input v-model="form.location" class="u-input" readonly placeholder="请选择地址" />
						<view class="arrow-right">
							<u-icon name="arrow-right" size="20" color="#707070" />
						</view>
					</view>
				</up-form-item>
				<up-form-item label="成立时间" prop="establish_time">
					<up-datetime-picker hasInput sharp="circle" v-model="establishTimeTimestamp"
						:minDate="nimDate"
						:maxDate="new Date().getTime()"
					 mode="date" cancelText="取消" confirmText="确认"
						confirmColor="#FF8C00" @confirm="onEstablishTimeConfirm">
						<template #trigger="{ value }">
							<view class="select">
								<view placeholder="请选择成立时间" class="u-input flex-start" readonly >{{value || '请选择成立时间'}}</view>
								<view class="arrow-right">
									<u-icon name="arrow-right" size="20" color="#707070" />
								</view>
							</view>
						</template>
					</up-datetime-picker>
				</up-form-item>
				<up-form-item :label="group_id ? '团长真实姓名' : '真实姓名'" prop="fullName" required>
					<input v-model="form.fullName" class="u-input" @input="validateField('fullName')" maxlength="50" placeholder="请输入您的真实姓名" />
				</up-form-item>
				<up-form-item label="联系电话" prop="phone" required>
					<input v-model="form.phone" class="u-input" @input="validateField('phone')" maxlength="11" placeholder="请输入您的联系电话" />
				</up-form-item>
			</up-form>

			<view class="txt flex-start u-mt-30 u-pt-20" @click="isAgree = !isAgree">
				<u-icon size="15" :color="isAgree ? '#FF8C00' : '#999'"
					:name="isAgree ? 'checkmark-circle-fill' : 'checkmark-circle'"></u-icon>
				<text>
					<text class="u-ml-5">我已阅读并同意该</text>
				</text>
				<text style="color: #ff8c00" @tap.stop="$u.route('pagesSub/settings/agreement?type=privy')">《用户隐私协议》</text>
			</view>
			<view class="" style="padding: 60rpx 8rpx 30rpx">
				<u-button type="primary" color="#FF8C00" shape="circle" @click="submitForm()">{{ group_id ? "更新跑团" : "创建跑团" }}
				</u-button>
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
		name: "",
		location: "",
		description: "",
		fullName: "",
		phone: "",
		// amount: '',
		establish_time: dayjs().valueOf(),
	});

	const nimDate = dayjs('1995-01-01').valueOf();

	const isAgree = ref(false);
	
	function validateField(propName) {
		uForm.value.validateField(propName, () => {}, "change");
	}

	const rules = ref({
		poster: [{
			required: true,
			message: "请点击上传跑团 logo",
			trigger: ["blur", "change"],
		}, ],
		name: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
		location: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
		fullName: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
		description: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
		phone: [{
			required: true,
			message: "请输入有效手机号",
			pattern: /^1[3-9]\d{9}$/,
			trigger: ["blur", "change"],
		}, ],
	});

	// 页面加载
	onLoad((options) => {
		console.log("option", options);
		group_id.value = options.group_id;

		from.value = options.from;
		getDetail();
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

	const handleChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log(res, "返回地址");
				form.value.location = res.address;
				
				validateField('location')
			},
			fail: (e) => {
				console.log(e, "选择地址失败");
			},
		});
	};

	// 成立时间时间戳（用于日期选择器）
	const establishTimeTimestamp = computed({
		get: () => {
			return form.value.establish_time ?
				form.value.establish_time :
				dayjs().valueOf();
		},
		set: (val) => {
			form.value.establish_time = val;
		},
	});

	// 处理成立时间确认事件
	const onEstablishTimeConfirm = (e) => {
		// up-datetime-picker 的 confirm 事件返回的是时间戳（number）
		form.value.establish_time = e.value || dayjs().valueOf();
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

	.form-item-uploader {
		display: flex;
		justify-content: center;
	}

	::v-deep {
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
				max-width: 100% !important;
				box-sizing: border-box !important;
				border: 0;
				min-height: 88rpx;
				background: rgba(255, 255, 255);
				border-radius: 16rpx;
				background: #ffffff;
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
				text-align: left !important;
				margin-left: 0 !important;
				font-weight: bold;
				font-size: 26rpx;
				color: #707070;
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
			color: #707070 !important;
		}

		.textarea-placeholder {
			font-weight: bold !important;
			font-size: 26rpx !important;
			color: #707070 !important;
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
		.u-popup__content{
			border-radius: 20rpx 20rpx 0 0;
		}
		.section-upload {
			width: 200rpx;
			height: 200rpx;
			background: #FFFFFF;
			border-radius: 16rpx;
			border: 2rpx dashed #ccc;
			line-height: 40rpx;
			color: #999;
			.u-icon__icon {
				color: #ccc;
			}
		}
		
		.u-upload__wrap__preview__image{
			width: 200rpx!important;
			height: 200rpx!important;
			border-radius: 16rpx;
		}
	}
</style>