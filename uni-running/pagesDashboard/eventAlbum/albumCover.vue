<template>
	<view class="album-cover-page" :style="{ background: bgColor }">
		<!-- 全屏封面图 -->
		<image
			v-if="coverUrl"
			class="cover-img"
			:src="coverUrl"
			mode="aspectFit"
		/>

		<!-- 底部按钮 -->
		<view class="bottom-bar" :style="{ paddingBottom: (safeBottom + 20) + 'px' }">
			<view class="enter-btn" @click="enterAlbum">
				进入相册 ({{countdown}}s)
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad,onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { useShare, buildPath } from "@/composables/useShare.js";
import request from "@/utils/request.js";

const eventId = ref("")
const albumInfo = ref({})
const coverUrl = ref("")
const safeBottom = ref(0)

const sysInfo = uni.getWindowInfo()
safeBottom.value = sysInfo.safeAreaInsets?.bottom || 0

const bgColor = computed(() => {
	const cc = albumInfo.value?.color_config
	if (!cc?.gradient?.length) return cc?.solid || '#000'
	return `linear-gradient(180deg, ${cc.gradient[0]}, ${cc.gradient[1]})`
})

function getAlbumDetail() {
	uni.showLoading({ mask: true });
	request.get(`/image-service/albums/detail`, { event_id: eventId.value }).then((res) => {
		albumInfo.value = res
		const url = res.cover_image_url || res.background_image_url || res.image_url || ''
		coverUrl.value = url ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : ''
		uni.hideLoading()
	}).catch(() => {
		uni.hideLoading()
	});
}

const countdown = ref(3)
let timer = null

function startCountdown() {
	timer = setInterval(() => {
		countdown.value--
		if (countdown.value <= 0) {
			clearInterval(timer)
			enterAlbum()
		}
	}, 1000)
}

function enterAlbum() {
	if (timer) clearInterval(timer)
	uni.redirectTo({
		url: `/pagesDashboard/eventAlbum/albumDetail?event_id=${eventId.value}`
	})
}

useShare(() => ({
	title: albumInfo.value?.name
		? `全速运动 - ${albumInfo.value.name} - 活动相册`
		: '全速运动 - 活动相册',
	path: buildPath('/pagesDashboard/eventAlbum/albumCover', {
		event_id: eventId.value
	}),
	imageUrl: albumInfo.value?.image_url || ''
}));

onLoad((options) => {
	eventId.value = options.event_id
	getAlbumDetail()
	startCountdown()
})
</script>

<style lang="scss" scoped>
.album-cover-page {
	position: relative;
	width: 100vw;
	height: 100vh;
	background: #000; /* fallback, overridden by inline style */
	overflow: hidden;
}

.cover-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	justify-content: center;
	padding: 0 200rpx;
}

.enter-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 30rpx;
	font-weight: 500;
	letter-spacing: 4rpx;
	color: #fff;
	background: rgba(255, 255, 255, 0.45);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1rpx solid rgba(255, 255, 255, 0.6);
	text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.3);
	border-radius: 44rpx;
}
</style>
