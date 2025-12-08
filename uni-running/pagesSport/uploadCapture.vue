<template>
	<view>
		<section class="section-form u-flex-row">
			<view class="upload-wrapper">
				<FileUpload v-model="ruleForm.picture" isCustom @change="onImageUploaded">
					<template #trigger>
						<view class="section-upload flex-col-center">
							<view class="icon">
								<up-icon name="plus" color="#FF8C00" size="86rpx"></up-icon>
							</view>
							<view>上传打卡</view>
							<view>(上传软件截图或照片)</view>
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
				<view @click="$u.route('pagesSport/captureRule?type=rule')" style="color: #FF8C00;line-height: 40rpx;">
					截图打卡规则
				</view>
			</view>
		</section>

		<u-button v-if="isCheckInSuccess" type="primary" @click="goBack()" customStyle="width:640rpx; margin: 60rpx auto 30rpx" color="#FF8C00"
			shape="circle">
			返回运动页
		</u-button>

		<view class="powered-by">Powered By Payeco AI</view>
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
				uni.showToast({
					title: '识别失败',
					icon: 'error',
					mask: true
				});
			}
		} catch (error) {
			uni.hideLoading();
			console.error('OCR识别失败:', error);
			uni.showToast({
				title: '识别失败',
				icon: 'error',
				mask: true
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
			background: #FFF8F0;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			border: 2rpx dashed #FF8C00;
			line-height: 40rpx;
			color: #FF8C00;

			.icon {
				margin-bottom: 42rpx;
			}

			.u-icon__icon {
				color: #FF8C00;
			}
		}
	}

	.powered-by {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		text-align: center;
		color: #FF8C00;
		font-size: 24rpx;
		padding: 30rpx 0;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
		background: transparent;
	}
</style>