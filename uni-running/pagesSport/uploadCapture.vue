<template>
	<view class="page">
		<section class="section-form u-flex-row">
			<view class="upload-wrapper">
				<FileUpload v-model="ruleForm.picture" isCustom :width="448" :height="600" @change="onImageUploaded">
					<template #trigger>
						<view class="section-upload flex-col-center">
							<view class="icon">
								<up-icon name="plus" color="#FF8C00" size="86rpx"></up-icon>
							</view>
							<view>上传打卡</view>
							<view>(上传软件截图照片)</view>
						</view>
					</template>
				</FileUpload>
			</view>
			<view class="form-fields">
				<view class="cell-item">
					<view class="label">
						<up-icon name="map" size="28rpx" color="#FF8C00"></up-icon>
						<text class="label-text">距离(KM)</text>
					</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.distance || 0}}</view>
				</view>
				<view class="cell-item">
					<view class="label">
						<up-icon name="clock" size="28rpx" color="#FF8C00"></up-icon>
						<text class="label-text">时长</text>
					</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.duration || 0}}</view>
				</view>
				<view class="cell-item">
					<view class="label">
						<up-icon name="calendar-fill" size="28rpx" color="#FF8C00"></up-icon>
						<text class="label-text">配速</text>
					</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.pace || 0}}</view>
				</view>
			</view>
		</section>

		<u-button v-if="isCheckInSuccess" type="primary" @click="goBack()" customStyle="width:640rpx; margin: 60rpx auto 30rpx" color="#FF8C00"
			shape="circle">
			返回运动页
		</u-button>

		<view class="panel bgf">
			<view style="font-size: 30rpx;margin-bottom: 10rpx;color:rgb(255, 140, 0);">全速运动打卡规则</view>
			<view style="color:#777;font-size:24rpx;line-height: 1.4;">
				<div class="u-mb-5">一、核心要求：</div>
				<div class="u-flex-row"><div style="width:30rpx;">1. </div>每日1次有效打卡，多传仅记最新上传记录。</div>
				<div class="u-flex-row"><div style="width:30rpx;">2. </div>支持Keep/咕咚等主流运动APP，截图需清晰显时间+类型+数据（跑步/健走≥1km）。</div>
				<div class="u-flex-row"><div style="width:30rpx;">3. </div>当日运动当日23:59前通过小程序上传，逾期无效。</div>
			</view>
			<view class="u-mt-5" style="color:#777;font-size:24rpx;line-height: 1.4;">
				<div class="u-mb-5">二、安全提示：</div>
				<div class="u-flex-row"><div style="width:30rpx;">1. </div>身体健康者参与，不适即停，风险自担。</div>
				<div class="u-flex-row"><div style="width:30rpx;">2. </div>选安全场地，避恶劣天气。</div>
			</view>
			<view class="u-mt-5" style="color:#777;font-size:24rpx;line-height: 1.4;">
				<div class="u-mb-5">三、违规处理：</div>
				<div>盗用/篡改截图将取消权益并记录违规。</div>
			</view>
			<view class="u-mt-5" style="color:#777;font-size:24rpx;line-height: 1.4;">
				<div class="u-mb-5">四、联系客服：</div>
				<div>客服在线时间:工作日 9:00-18:00。</div>
			</view>
			<!-- 客服按钮 -->
			<button class="contact-btn" open-type="contact">
				<u-icon name="chat-fill" size="80rpx" color="#FF8C00"></u-icon>
				<text class="contact-text">联系客服</text>
			</button>
		</view>

		<div style="height: 380rpx;"></div>

		<view class="bottom-info">
			<view @click="$u.route('pagesSport/captureRule?type=rule')" class="rule-link">
				点此查看完整截图打卡规则
			</view>
			<view class="powered-by">由易联支付AI平台强势驱动</view>
		</view>
	</view>
</template>
<script setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import FileUpload from "@/components/common/FileUpload.vue";
	import request from "../utils/request";
	
	const exerciseInfo = ref({
		distance: '',
		duration: '',
		pace: ''
	})

	// 打卡是否成功
	const isCheckInSuccess = ref(false);

	// 图片上传成功后调用OCR识别
	const onImageUploaded = async (imageUrl) => {
		if (!imageUrl) return;

		try {
			uni.showLoading({
				title: '识别中...',
				mask: true
			});

			const res = await request.post('/ocr-api/recognize', {
				image_url: imageUrl
			}, { showError: false });

			uni.hideLoading();

			// 校验返回数据是否有效（不为空、不为0）
			const isValidData = res &&
				res.km && res.km !== '0' && res.km !== '0.00' &&
				res.time && res.time !== '00:00' && res.time !== '00:00:00' &&
				res.speed;

			if (isValidData) {
				// 将识别结果填入
				exerciseInfo.value.distance = res.km;
				exerciseInfo.value.duration = res.time;
				exerciseInfo.value.pace = res.speed;

				isCheckInSuccess.value = true;
				uni.showModal({
					title: '打卡成功',
					content: res?.msg || '打卡成功',
					showCancel: false
				});
			} else {
				uni.showModal({
					title: '识别失败',
					content: res?.msg || '无法识别截图中的运动数据，请确保上传的是有效的运动截图',
					showCancel: false
				});
			}
		} catch (error) {
			uni.hideLoading();
			console.error('OCR识别失败:', error);
			uni.showModal({
				title: '识别失败',
				content: error?.msg || error?.message || '识别服务异常，请稍后重试',
				showCancel: false
			});
		}
	};

	const ruleForm = ref({
		picture: "",
		activity: "",
		fullName: "",
		id_card: "",
		phone: "",
	});

	// 返回运动页
	const goBack = () => {
		uni.navigateBack();
	};
</script>

<style lang="less" scoped>
	.page {
		background: #f5f5f5;
		min-height: 100vh;
	}

	.panel {
		position: relative;
	}

	.contact-btn {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: -100rpx;
		display: flex;
		align-items: center;
		padding: 0;
		background: transparent;
		border: none;
		margin: 0;

		&::after {
			border: none;
		}

		.contact-text {
			margin-left: 10rpx;
			font-size: 28rpx;
			color: #FF8C00;
		}
	}

	.section-form {
		padding: 30rpx 34rpx 30rpx;
	}

	.upload-wrapper {
		width: 448rpx;
		height: 600rpx;
		flex-shrink: 0;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 600rpx;
		margin-left: 30rpx;
	}

	.cell-item {
		font-weight: bold;
		color: #000000;
		line-height: 40rpx;

		.label {
			display: flex;
			align-items: center;

			.label-text {
				margin-left: 8rpx;
			}
		}

		.value {
			width: 206rpx;
			height: 88rpx;
			margin-top: 20rpx;
			color: #FF8C00;
			background: #FFF;
			border: 2rpx solid #FF8C00;
			border-radius: 8rpx;
		}
	}

	::v-deep {
		.upload-wrapper {
			.u-upload {
				width: 448rpx !important;
				height: 600rpx !important;
			}

			.u-upload__wrap {
				width: 448rpx !important;
				height: 600rpx !important;
			}

			.u-upload__wrap__preview {
				width: 448rpx !important;
				height: 600rpx !important;
			}

			.u-upload__wrap__preview__image {
				width: 448rpx !important;
				height: 600rpx !important;
				border-radius: 16rpx;
				border: 2rpx solid #FF8C00;
				box-shadow: 0 4rpx 20rpx rgba(255, 140, 0, 0.15);
			}
		}

		.section-upload {
			width: 448rpx;
			height: 600rpx;
			background: #FFF;
			border-radius: 16rpx;
			border: 2rpx dashed #FF8C00;
			line-height: 40rpx;
			color: #FF8C00;
			box-shadow: 0 4rpx 20rpx rgba(255, 140, 0, 0.15);

			.icon {
				margin-bottom: 42rpx;
			}

			.u-icon__icon {
				color: #FF8C00;
			}
		}
	}

	.bottom-info {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		text-align: center;
		padding-bottom: env(safe-area-inset-bottom);
		background: #f5f5f5;

		.rule-link {
			color: #FF8C00;
			font-size: 28rpx;
			line-height: 40rpx;
			text-decoration: underline;
			padding: 10rpx 0;
		}

		.powered-by {
			color: #FF8C00;
			font-size: 24rpx;
			padding: 10rpx 0;
		}
	}
</style>
