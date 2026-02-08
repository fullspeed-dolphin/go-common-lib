<template>
	<view v-if="isShowModal" class="PreviewMedia">
		<up-popup :show="isShowModal" @close="close" overlayOpacity="0.9" bgColor="transparent" mode="center" closeable>
			<view class="video-container" style="height: 100vh;width:100vw">
				<video class="video" id="myVideo"
					:poster="fileLink + '?x-oss-process=video/snapshot,t_500,f_jpg,w_640,h_360,m_fast'"
					:src="fileLink" @play="onPlay" @pause="onPause" @ended="onPause"
					:controls="true">
					<!-- cover-view 才能浮在原生 video 组件之上 -->
					<cover-view v-if="!isPlaying" class="download-cover" @click="downloadVideo">
						<cover-view class="download-cover-btn">保存到相册</cover-view>
					</cover-view>
				</video>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import {
		ref, computed
	} from "vue";
	import { useStore } from "vuex";
	import request from "@/utils/request.js"

	const store = useStore();
	const album_info = computed(() => store.state.album_info);
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
		const eventId = album_info.value?.event_id
		if (eventId) {
			request.post(`/image-service/albums/view/increment?event_id=${eventId}`)
		}
	}

	function close() {
		isShowModal.value = false;
	}

	async function downloadVideo() {
		uni.showLoading({ title: '下载中...' })
		try {
			// 先请求相册写入权限
			// #ifdef MP-WEIXIN
			await new Promise((resolve, reject) => {
				uni.authorize({
					scope: 'scope.writePhotosAlbum',
					success: resolve,
					fail: reject
				})
			})
			// #endif

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

			// 权限被拒绝，引导用户去设置页开启
			if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize'))) {
				uni.showModal({
					title: '提示',
					content: '需要您授权"保存到相册"权限，请在设置中开启',
					confirmText: '去设置',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting()
						}
					}
				})
			} else {
				uni.showToast({ title: '保存失败，请重试', icon: 'none' })
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

	.download-cover {
		position: absolute;
		bottom: 120rpx;
		left: 0;
		width: 750rpx;
		display: flex;
		justify-content: center;
	}

	.download-cover-btn {
		width: 188rpx;
		height: 64rpx;
		line-height: 64rpx;
		background-color: rgba(34, 34, 34, 0.8);
		color: #babab6;
		font-size: 24rpx;
		border: 1px solid rgba(255, 255, 255, 0.27);
		border-radius: 999rpx;
		text-align: center;
	}
</style>