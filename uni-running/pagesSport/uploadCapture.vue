<template>
	<view class="page">
		<section class="section-form u-flex-row">
			<view class="upload-wrapper">
				<FileUpload v-model="ruleForm.picture" isCustom :width="448" :height="790" @change="onImageUploaded">
					<template #trigger>
						<view class="section-upload flex-col-center">
							<view class="icon">
								<up-icon name="plus" color="#CCCCCC" size="86rpx"></up-icon>
							</view>
							<view>上传打卡</view>
							<view>(上传软件截图照片)</view>
						</view>
					</template>
				</FileUpload>
			</view>
			<view class="u-ml-30">
				<view class="cell-item">
					<view class="label">距离(KM)</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.distance || '--'}}</view>
				</view>
				<view class="cell-item">
					<view class="label">时长</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.duration || '--'}}</view>
				</view>
				<view class="cell-item">
					<view class="label">配速</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.pace || '--'}}</view>
				</view>
				</view>
		</section>

		<u-button v-if="isCheckInSuccess" type="primary" @click="goBack()" customStyle="width:640rpx; margin: 60rpx auto 30rpx" color="#FF8C00"
			shape="circle">
			返回运动页
		</u-button>

		<view class="bottom-info">
			<view @click="$u.route('pagesSport/captureRule?type=rule')" class="rule-link">
				截图打卡规则
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
			});

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
				uni.showToast({
					title: '打卡成功',
					icon: 'success',
					mask: true
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

	.section-form {
		padding: 30rpx 34rpx 30rpx;
	}

	.upload-wrapper {
		width: 448rpx;
		height: 790rpx;
		flex-shrink: 0;
	}

	.cell-item {
		font-weight: bold;
		color: #000000;
		line-height: 40rpx;
		margin-bottom: 40rpx;

		.value {
			width: 206rpx;
			height: 88rpx;
			margin-top: 20rpx;
			color: #6C6C6C;
			background: #F2F2F2;
		}
	}

	::v-deep {
		.upload-wrapper {
			.u-upload {
				width: 448rpx !important;
				height: 790rpx !important;
			}

			.u-upload__wrap {
				width: 448rpx !important;
				height: 790rpx !important;
			}

			.u-upload__wrap__preview {
				width: 448rpx !important;
				height: 790rpx !important;
			}

			.u-upload__wrap__preview__image {
				width: 448rpx !important;
				height: 790rpx !important;
				border-radius: 16rpx;
			}
		}

		.section-upload {
			width: 448rpx;
			height: 790rpx;
			background: #FAFAFA;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			border: 2rpx dashed #CCCCCC;
			line-height: 40rpx;
			color: #999999;

			.icon {
				margin-bottom: 42rpx;
			}

			.u-icon__icon {
				color: #CCCCCC;
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
			padding: 20rpx 0;
		}

		.powered-by {
			color: #FF8C00;
			font-size: 24rpx;
			padding: 20rpx 0;
		}
	}
</style>
