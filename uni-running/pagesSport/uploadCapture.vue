<template>
	<view class="">
		<u-navbar autoBack bgColor="transparent" placeholder title="运动截图打卡"></u-navbar>
		
		<block v-if="pageIndex === 0 || !ruleForm.picture">
			<section class="u-pl-30 u-pt-40" style="margin-bottom: 140rpx;">
				<view class="u-flex-y-center" style="font-weight: 800;font-size: 48rpx;">
					<view class="iconfont icon-pulse-fill" style="color:#FF8C00;font-size: 48rpx;margin-right: 18rpx;"></view>
					全速运动
				</view>
				<view class="u-mt-20" style="color: #6A7282;">记录每一次汗水，赢取跑币奖励</view>
			</section>
		</block>
		
		<section class="flex-center" style="margin-top: 80rpx;">
			<view class="upload-wrapper">
				<FileUpload v-model="ruleForm.picture" isCustom :width="448" :height="600" @change="onImageUploaded">
					<template #trigger>
						<view class="section-upload flex-col-center" style="color: #99A1AF;line-height: 1.3;">
							<view class="iconfont flex-center icon-shangchuan"></view>
							<view style="font-size: 34rpx;font-weight: 500; color:#000;margin-bottom:20rpx;">上传运动截图</view>
							<view>支持主流运动</view>
							<view>APP截图自动</view>
							<view>识别数据</view>
						</view>
					</template>
				</FileUpload>
			</view>
		</section>
		
		<section v-if="pageIndex === 1 && ruleForm.picture && exerciseInfo.distance" class="form-fields">
			<view style="font-weight: 800;font-size: 32rpx;">
				<up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
				识别结果
			</view>
			<view class="u-flex-row">
				<view class="cell-item flex-col-center">
					<view class="label flex-center" style="background: #EFF6FF;">
						<up-icon name="map" size="40rpx" color="#2B7FFF" />
					</view>
					<view class="value">{{exerciseInfo.distance || 0}}</view>
					<text class="label-text">距离(KM)</text>
				</view>
				<view class="cell-item flex-col-center">
					<view class="label flex-center" style="background: #FFF7ED;">
						<!-- <up-icon name="clock" size="40rpx" color="#FF8C00" /> -->
						<view class="iconfont icon-jishiqi" style="color:#FF8C00"></view>
					</view>
					<view class="value">{{exerciseInfo.duration || 0}}</view>
					<text class="label-text">时长</text>
				</view>
				<view class="cell-item flex-col-center">
					<view class="label flex-center" style="background: #FAF5FF;;">
						<!-- <up-icon name="calendar-fill" size="40rpx" color="#AF4BFF" /> -->
						<view class="iconfont icon-shandianshandianfahuotuikuan" style="color:#AF4BFF"></view>
					</view>
					<view class="value">{{exerciseInfo.pace || 0}}</view>
					<text class="label-text">配速</text>
				</view>
			</view>
		</section>
		
		<!-- 底部信息区 -->
		<view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="bottom-info-content">
			<view @click="$u.route('pagesSport/captureRule?type=rule')" class="rule-link flex-center">
				截图打卡规则
				<u-icon name="arrow-right" color="rgba(255, 140, 0, .75)"></u-icon>
			</view>
			<view class="powered-by">由易联支付AI平台强势驱动</view>
		</view>
		
		<section v-if="isSubmiting" class="section-loading flex-center">
			<view class="panel1 bgf flex-col-center">
				<view style="margin-bottom: 40rpx; ">
					<up-loading-icon mode="circle" color="#FF8C00" textSize="40"></up-loading-icon>
				</view>
				<view style="font-weight: 600;font-size: 34rpx;margin-bottom: 30rpx;">系统正在识别</view>
				<view style="color: #6C7484;">智能提取数据中，请不要离开页面...</view>
			</view>
		</section>
		
		<view v-if="pageIndex === 1 && ruleForm.picture && submitText" class="" style="padding: 56rpx 20rpx 80rpx">
			<u-button type="primary" color="#ff8c00" shape="circle" @click="routeTo()">{{submitText}}</u-button>
		</view>
		
	</view>
</template>
<script setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import FileUpload from "@/components/common/FileUpload.vue";
	import request from "../utils/request";
	import { useShare } from "@/composables/useShare.js";

	// 分享配置
	useShare({
		title: '运动截图打卡',
		path: '/pagesSport/uploadCapture'
	});
	
	const pageIndex = ref(0)

	const exerciseInfo = ref({
		distance: '',
		duration: '',
		pace: ''
	})
	
	const isSubmiting = ref(false)
	const isSuccess = ref(false)
	const submitText = ref('')

	// 图片上传成功后调用OCR识别
	const onImageUploaded = async (imageUrl) => {
		if (!imageUrl) return;

		try {
			isSubmiting.value = true

			const res = await request.post('/ocr-api/recognize', {
				image_url: imageUrl
			}, { showError: false, includeResponse: true });

			// 校验返回数据是否有效（不为空、不为0）
			const isValidData = res?.data &&
				res.data.km && res.data.km !== '0' && res.data.km !== '0.00' &&
				res.data.time && res.data.time !== '00:00' && res.data.time !== '00:00:00' &&
				res.data.speed;

			if (isValidData) {
				// 将识别结果填入
				exerciseInfo.value.distance = res.data.km;
				exerciseInfo.value.duration = res.data.time;
				exerciseInfo.value.pace = res.data.speed;
				
				submitText.value = res?.msg || '打卡成功';
				isSuccess.value = true
				// uni.showModal({
				// 	title: '打卡成功',
				// 	content: res?.msg || '打卡成功',
				// 	showCancel: false,
				// 	success: () => {
				// 		uni.redirectTo({
				// 			url: '/pagesSub/runCoin/myCoin'
				// 		});
				// 	}
				// });
			} else {
				isSuccess.value = false
				submitText.value = ''
				uni.showModal({
					title: '识别失败',
					content: res?.msg || '无法识别截图中的运动数据，请确保上传的是有效的运动截图',
					showCancel: false
				});
			}
		} catch (error) {
			isSuccess.value = false
			submitText.value = ''
			uni.hideLoading();
			console.error('OCR识别失败:', error);
			uni.showModal({
				title: '识别失败',
				content: error?.msg || error?.message || '识别服务异常，请稍后重试',
				showCancel: false
			});
		}
		
		isSubmiting.value = false
		pageIndex.value = 1
	};
	

	const ruleForm = ref({
		picture: "",
	});
	
	function routeTo() {
		uni.redirectTo({
			url: '/pagesSub/runCoin/myCoin'
		});
	}
</script>

<style lang="less" scoped>
	.section-loading{
		position: fixed;
		width: 100%;
		height: 100%;
		top:0;
		left:0;
		background: rgba(0,0,0,.7);
		z-index: 1000;
		.panel1{
			width: 606rpx;
			height: 404rpx;
			background: #FFFFFF;
			border-radius: 32rpx 32rpx 32rpx 32rpx;
		}
	}

	.form-fields {
		width: 686rpx;
		height: 412rpx;
		padding: 50rpx;
		margin-top: 48rpx;
		margin: 48rpx auto 0;
		border-radius: 32rpx 32rpx 32rpx 32rpx;
		border: 2rpx solid #F3F4F6;
	}

	.cell-item {
		font-weight: bold;
		margin-top: 40rpx;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
		border-right: 2rpx solid #F3F4F6;
		&:last-child{
			border:0;
		}
		.label {
			width: 80rpx;
			height: 80rpx;
			font-size: 40rpx;
			border-radius: 32rpx 32rpx 32rpx 32rpx;
		}
		.label-text {
			font-size: 24rpx;
			color: #6A7282;
		}

		.value {
			width: 206rpx;
			height: 44rpx;
			margin-top: 30rpx;
			margin-bottom: 20rpx;
			font-weight: 800;
			font-size: 44rpx;
			text-align: center;
		}
	}

	::v-deep {
		.upload-wrapper {
			.uicon-checkmark-circle {
				font-weight: 800;
			}
			.iconfont{
				width: 160rpx;
				height: 160rpx;
				color: #FF8C00;
				font-size: 52rpx;
				background: #F8EEE0;
				margin-bottom: 40rpx;
				border-radius: 64rpx 64rpx 64rpx 64rpx;
			}
			.u-upload {
				width: 448rpx !important;
				height: 600rpx !important;
			}

			.u-upload__wrap {
				width: 448rpx !important;
				height: 600rpx !important;
			}

			.custom-preview {
				width: 690rpx !important;
				height: 500rpx !important;
			}

			.u-upload__wrap__preview__image {
				width: 448rpx !important;
				height: 600rpx !important;
				border-radius: 16rpx;
				border: 2rpx solid #FF8C00;
			}
		}

		.section-upload {
			width: 448rpx;
			height: 600rpx;
			background: #FFF;
			border-radius: 36rpx;
			border: 10rpx dashed #D1D5DC;
			line-height: 40rpx;

			.icon {
				margin-bottom: 42rpx;
			}

			.u-icon__icon {
				color: #FF8C00;
			}
		}
	}

	.bottom-info-content {
		position: fixed;
		bottom: 0;
		width: 100%;
		text-align: center;
		padding: 130rpx 0 30rpx;

		.rule-link {
			color: rgba(255, 140, 0, .75);
			font-size: 28rpx;
			line-height: 40rpx;
			padding: 10rpx 0;
		}

		.powered-by {
			color: rgba(255, 140, 0, .75);
			font-size: 24rpx;
			margin-top: 50rpx;
		}
	}

</style>
