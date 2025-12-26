<template>
	<up-popup :show="isShowModal" @close="close" overlayOpacity="0.9" bgColor="transparent" mode="center" closeable>
		<view class="flex-center" style="height: 100vh;width:100vw">
			<rswiper :originList="originList" :totalNumber="totalNumber" :originIndex="originIndex" @loadingMore="loadingMore" v-if="isShowModal"></rswiper>
			<view class="flex-col-center">
				<view class="flex-center" style="position: fixed;left:0;bottom: 90rpx;width: 100%;">
					<up-button @click="downloadPicture" type="primary" shape="circle" icon="download"
						customStyle="width:186rpx;height:60rpx;">
						下载原图
					</up-button>
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
	import {
		ref, onMounted
	} from "vue";
	import rswiper from "./rswiper.vue"
	// Emits
	const emits = defineEmits(["open",'loadingMore']);

	const isShowModal = ref(false);
	const fileLink = ref('');
	const originList = ref([]) // 源数据
	const displaySwiperList = ref([]) // swiper需要的数据
	const displayIndex = ref(0) // 用于显示swiper的真正的下标数值只有：0，1，2。
	const originIndex = ref(0) // 记录源数据的下标
	const totalNumber = ref('')
	
	function openModal(link, index, list, total) {
		// console.log('link====>', link, index, list)
		if(link) {
			isShowModal.value = true;
		}
		
		console.log('totalNumber=====>', total)
		
		originIndex.value = index
		originList.value = list
		totalNumber.value = total
	}
	const loadingMore=(index)=> {
		emits('loadingMore', index)
	}
	function close() {
		isShowModal.value = false;
	}

	function downloadPicture() {
		uni.saveImageToPhotosAlbum({
			filePath: fileLink.value
		})
	}
	defineExpose({
		openModal,
		close,
	});
</script>

<style lang="scss" scoped>
	// @import '@zebra-ui/swiper/index.scss';

	.swiper {
		width: 100vw;
		height: 100vh;
	}

	// .swiper-item {
	// 	width: 100%;
	// 	height: 500rpx;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	user-select: none;
	// }

	.card-icon {
		position: relative;
		padding-top: 1px;
		width: 62rpx;
		height: 46rpx;
		background: #FEEFDC;
		border-radius: 0rpx 0rpx 0rpx 0rpx;
		margin-right: 18rpx;

		.txt {
			width: 60rpx;
			height: 28rpx;
			font-family: PingFang SC, PingFang SC;
			font-weight: 800;
			font-size: 20rpx;
			color: #FF8C00;
			line-height: 28rpx;
			text-align: center;
			font-style: normal;
			text-transform: none;
			width: 62rpx;
			height: 28rpx;
			background: #FFFFFF;
			border-radius: 0rpx 0rpx 0rpx 0rpx;
		}
	}

	.section-sample {
		width: 682rpx;
		height: 326rpx;
		background: #F2F2F2;
		padding: 32rpx 16rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		margin-top: 48rpx;
		font-weight: bold;
		font-size: 24rpx;
		color: #999999;
		box-sizing: border-box;
		line-height: 32rpx;
	}

	.section-tabs {
		font-weight: bold;
		font-size: 26rpx;
		color: #FF8C00;
		line-height: 48rpx;
		padding-bottom: 32rpx;

		.iconfont {
			height: 38rpx;
			margin-bottom: 10rpx;
		}

		.active {
			position: relative;
			color: #FF8C00;

			&:before {
				position: absolute;
				bottom: -10rpx;
				left: 50%;
				transform: translate(-50%);
				content: "";
				width: 50rpx;
				height: 6rpx;
				background: #FF8C00;
				border-radius: 4rpx 4rpx 4rpx 4rpx;
			}
		}
	}

	.section-camera {
		position: relative;
		margin-top: 40rpx;

		&:before {
			position: absolute;
			content: "";
			left: -10rpx;
			top: -10rpx;
			width: 32rpx;
			height: 32rpx;
			border-top: 6rpx solid #999;
			border-left: 6rpx solid #999;
		}

		&:after {
			position: absolute;
			content: "";
			right: -10rpx;
			top: -10rpx;
			width: 32rpx;
			height: 32rpx;
			border-top: 6rpx solid #999;
			border-right: 6rpx solid #999;
		}

		.upload-box {
			&:before {
				position: absolute;
				content: "";
				left: -10rpx;
				bottom: -10rpx;
				width: 32rpx;
				height: 32rpx;
				border-bottom: 6rpx solid #999;
				border-left: 6rpx solid #999;
			}

			&:after {
				position: absolute;
				content: "";
				right: -10rpx;
				bottom: -10rpx;
				width: 32rpx;
				height: 32rpx;
				border-bottom: 6rpx solid #999;
				border-right: 6rpx solid #999;
			}
		}
	}

	.icon-paizhao {
		color: #fff;
		font-size: 30rpx;
		width: 68rpx;
		height: 68rpx;
		border-radius: 999px;
		background: #267FF7;
		margin-bottom: 20rpx;
	}

	.u-input {
		width: 520rpx;
		height: 92rpx;
		background: #F2F2F2;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		font-weight: bold;
		font-size: 24rpx;
		color: #979797;
		padding: 0 26rpx;
	}

	::v-deep {
		.u-form-item__body__left__content__label {
			color: #979797;
			font-size: 24rpx;
		}
	}
</style>