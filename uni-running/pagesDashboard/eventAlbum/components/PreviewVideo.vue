<template>
	<view v-if="isShowModal" class="PreviewMedia">
		<up-popup :show="isShowModal" @close="close" overlayOpacity="0.9" bgColor="transparent" mode="center" closeable>
			<view class="video-container" style="height: 100vh;width:100vw">
				<video class="video" id="myVideo" 
					:poster1="fileLink + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'"
					:src="fileLink" @play="onPlay" @pause="onPause" @ended="onPause"
					:controls="true"></video>
			</view>
			<view v-if="!isPlaying" class="flex-center" style="position: fixed;left:0;bottom: 90rpx;width: 100%;z-index:10;">
				<!-- <up-button @click="downloadVideo" type="primary" plain shape="circle" icon="download"
					customStyle="width:186rpx;height:60rpx;background: transparent;">
					下载视频
				</up-button> -->
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";

	const isShowModal = ref(false);
	const isPlaying = ref(false);
	const fileLink = ref('');
	const photoList = ref([])


	function onPlay() {
		isPlaying.value = true;
	}

	function onPause() {
		isPlaying.value = false;
	}

	function openModal(link, index) {
		fileLink.value = link

		isShowModal.value = true;
	}

	function close() {
		isShowModal.value = false;
	}

	function downloadPicture() {
		uni.saveImageToPhotosAlbum({
			filePath: photoList.value[currentIndex.value] + '?x-oss-process=image/resize,w_750',
			success() {
				uni.$u.toast('下载完成')
			}
		})
	}
	async function downloadVideo() {
	  uni.showLoading({ title: '下载中...' })
	
	  try {
	    // 下载视频文件
	    const downloadRes = await new Promise((resolve, reject) => {
	      uni.downloadFile({
	        url: fileLink.value,
	        success: resolve,
	        fail: reject
	      })
	    })
	
	    if (downloadRes.statusCode !== 200) {
	      throw new Error('下载失败')
	    }
	
	    // 保存到相册（注意：仅 App 支持 saveVideoToPhotosAlbum）
	    await new Promise((resolve, reject) => {
	      uni.saveVideoToPhotosAlbum({
	        filePath: downloadRes.tempFilePath,
	        success: resolve,
	        fail: reject
	      })
	    })
	
	    uni.showToast({ title: '保存成功', icon: 'success' })
	  } catch (err) {
	    console.error('保存失败:', err)
	
	    // 平台兼容处理：小程序/H5 不支持自动保存
	    const systemInfo = uni.getSystemInfoSync()
	    if (systemInfo.environment === 'miniProgram' || systemInfo.platform === 'devtools') {
	      uni.showModal({
	        title: '提示',
	        content: '请长按视频，选择“保存视频”',
	        showCancel: false
	      })
	    } else {
	      uni.showToast({ title: '保存失败', icon: 'none' })
	    }
	  } finally {
	    uni.hideLoading()
	  }
	}
	defineExpose({
		openModal,
		close,
	});
</script>

<style lang="scss" scoped>
	.video {
		width: 100vw;
		height: 100vh;
	}

	.video-container {
		position: relative;
		width: 100%;
	}

	.control-btn,
	.download-btn {
		position: absolute;
		bottom: 20rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 24rpx;
		color: white;
		border-radius: 8rpx;
	}

	.play-btn,
	.pause-btn {
		background: rgba(0, 0, 0, 0.6);
		z-index: 10;
	}

	.download-btn {
		background: #007aff;
		margin-top: 80rpx;
	}
</style>