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
				<FileUpload v-model="ruleForm.picture" additional="ocr-checkin" isCustom :width="448" :height="600" @change="onImageUploaded">
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
		
		<!-- 底部信息区 -->
		<view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="bottom-info-content">
			<view @click="$u.route('pagesSport/captureRule?type=rule')" style="color:rgba(255, 140, 0, .75)" class="rule-link flex-center">
				截图打卡规则
				<u-icon name="arrow-right" color="rgba(255, 140, 0, .75)"></u-icon>
			</view>
			<view class="" style="font-size: 24rpx;color: #C9CCD1;margin-top: 90rpx;padding-left:34rpx; line-height: 34rpx;text-align: left;">
				<view>1. 每日打卡即可获跑币，每日上限 100 个跑币(1km=10 跑币)。</view> 
				<view>2. 截图需清晰显示时间+类型+数据(跑步/健走≥1km)。 </view>
				<view>3. 当日运动当日23:59前通过小程序上传，逾期无效。 </view>
				<view>4. 盗用/篡改截图将取消权益并记录违规。</view>
			</view>
			<view class="tac" style="font-size: 16rpx;color: #99A1AF;margin-top: 40rpx;">
				<text style="color: #E53935;">安全提示：</text> 身体健康者参与，不适即停，风险自担； 选安全场地，避恶劣天气。
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
		
		<block v-if="pageIndex === 1 && ruleForm.picture && exerciseInfo.distance">
			<section  class="form-fields">
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
			<view class="flex-center" style="color:#99A1AF;margin-top:50rpx;font-size: 24rpx;">
				请核对上方数据是否与截图一致
			</view>
			<view class="flex-center" style="margin-top: 142rpx;">
				<u-button type="primary" custom-style="width:642rpx;" color="#ff8c00" shape="circle" @click="confirmToCheck()">确认数据无误</u-button>
			</view>
		</block>
		
		<view v-if="isSuccessCheck" class="check flex-center b" style="width: 344rpx;
			height: 96rpx; position: fixed; left: 50%;top: 50%; transform: translate(-50%, -50%);
			background: #404040; color: #fff;font-size: 32rpx;
			border-radius: 46rpx 46rpx 46rpx 46rpx;">
			<up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
			<view class="u-ml-10">后台核验成功</view>
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
	const isSuccessCheck = ref(false)

	// 图片上传成功后调用OCR识别
	let verifyToken = ''
	const onImageUploaded = async (imageUrl) => {
		if (!imageUrl) return;

		try {
			isSubmiting.value = true

			let res = await request.post('/ocr-api/recognize', {
				image_url: imageUrl
			}, { showError: false, includeResponse: true });
			
			// let res = {"code":200,"msg":"success","data":{"km":"16.03","time":"1:32:50","speed":"5'47\"","created_at":"2026-01-29T06:38:00","token":"eyJrbSI6IjE2LjAzIiwidGltZSI6IjE6MzI6NTAiLCJzcGVlZCI6IjUnNDdcIiIsIm9wZW5pZCI6ImNsaS10ZXN0IiwiZXhwaXJlX2F0IjoxNzY5Njc5MjE3fQ.24c7a1bafd1a003101ab2ec252383007376b85a11db6741e39439744c90df927"}}
			
			const dataInfo = res?.data
			// 校验返回数据是否有效（不为空、不为0）
			const isValidData = dataInfo &&
				dataInfo.km && dataInfo.km !== '0' && dataInfo.km !== '0.00' &&
				dataInfo.time && dataInfo.time !== '00:00' && dataInfo.time !== '00:00:00' &&
				dataInfo.speed;

			if (isValidData) {
				verifyToken = dataInfo.token;
				
				// 将识别结果填入
				exerciseInfo.value.distance = dataInfo.km;
				exerciseInfo.value.duration = dataInfo.time;
				exerciseInfo.value.pace = dataInfo.speed;
				
				isSuccess.value = true
				isSuccessCheck.value = true
				
				setTimeout(() => {
					isSuccessCheck.value = false
				}, 2000)
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
				ruleForm.value.picture = ""
				isSuccess.value = false
				uni.showModal({
					title: '识别失败',
					content: res?.msg || '无法识别截图中的运动数据，请确保上传的是有效的运动截图',
					showCancel: false
				});
			}
		} catch (error) {
			isSuccess.value = false
			ruleForm.value.picture = ""
			
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
		uni.$u.route('pagesSport/recognizeSuccess')
	}
	
	function confirmToCheck() {
		request.post('/ocr-api/checkin', {
			token: verifyToken
		}, { showError: false, includeResponse: true }).then(res => {
			uni.$u.route('pagesSport/recognizeSuccess', res)
		})
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
		text-align: center;
		padding: 40rpx 0 30rpx;

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
