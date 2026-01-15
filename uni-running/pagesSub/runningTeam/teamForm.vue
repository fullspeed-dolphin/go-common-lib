<template>
	<view class="page" style="padding: 24rpx">
		<u-navbar autoBack placeholder :title="group_id ? '更新跑团' : '创建跑团'"></u-navbar>
		<up-form :model="form" ref="uForm" :rules="rules" labelWidth="auto">
			<view class="flex-center">
				<up-form-item :label="null" prop="poster">
					<FileUpload v-model="form.poster" @change="validateField('poster')" />
				</up-form-item>
			</view>

			<div class="panel-section">
				<up-form-item label="跑团名称" prop="name" required>
					<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder="请输入名称" />
				</up-form-item>
				<view class="textarea-cell">
					<up-form-item label="跑团宣言" prop="description" labelPosition="top" required>
						<view class="" style="position: relative;">
							<textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="110" maxlength="150" placeholder="请填写跑团宣言" count></textarea>
							<view class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
								{{form.description.length}}/150
							</view>
						</view>
					</up-form-item>
				</view>
				<up-form-item label="跑团总部地址" prop="establish_location" required>
					<PickerMap v-model="form.establish_location" placeholder="请选择地址" />
				</up-form-item>
				<up-form-item label="成立时间" prop="establish_time">
					<PickerTime v-model="form.establish_time" mode="date"
						:minDate="nimDate"
						:maxDate="new Date().getTime()"
						:border="false"
						displayFormat="YYYY-MM-DD"
						placeholder="请选择时间" :title="null" @change="validateField('establish_time')" />
				</up-form-item>
				<up-form-item :label="group_id ? '团长真实姓名' : '真实姓名'" prop="fullName" required>
					<input v-model="form.fullName" class="u-input" @input="validateField('fullName')" maxlength="50" placeholder="请输入您的真实姓名" />
				</up-form-item>
				<up-form-item label="联系电话" prop="phone" required>
					<input v-model="form.phone" class="u-input" @input="validateField('phone')" maxlength="11" placeholder="请输入您的联系电话" />
				</up-form-item>
			</div>
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
	import PickerMap from "@/components/common/PickerMap.vue";
	import PickerTime from "@/components/common/PickerTime.vue";
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
		establish_location: "",
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
		establish_location: [{
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
					...res,
					poster: res.avatar_url,
					name: res.name,
					establish_location: res.establish_location,
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
			if (!isAgree.value) return uni.$u.toast("请勾选同意协议");

			const data = {
				avatar_url: form.value.poster,
				name: form.value.name,
				establish_location: form.value.establish_location,
				creator_real_name: form.value.fullName,
				// "total_members": form.value.amount,
				introduction: form.value.description,
				creator_phone: form.value.phone,
				establish_time: Number(form.value.establish_time),
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

	.panel-section{
			text-align: right;
			background: #fff;
			border-radius: 16rpx;
			padding: 10rpx 20rpx 0;
		}
	::v-deep {
		.u-form-item__body{
			position: relative;
				&:after {
					
				position: absolute;
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
		.textarea-cell{
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

		.u-FileUploader {
			.u-upload__wrap {
				display: flex;
				justify-content: center;

				.u-upload__button {
					background: #fff;
				}
			}
		}
	}
</style>