<template>
	<view class="page">
		<u-navbar title="搜索结果" placeholder></u-navbar>

		<view class="result-header">
			<text>找到 {{ imageList.length }} 张匹配照片</text>
		</view>

		<view class="result-grid">
			<image
				v-for="(url, index) in imageList"
				:key="index"
				class="result-img"
				:src="url"
				mode="aspectFill"
				@click="previewImage(index)"
			/>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const imageList = ref([]);

onLoad(() => {
	const results = uni.getStorageSync('faceSearchResults');
	console.log('faceSearchResults:', results);
	if (results && results.length > 0) {
		// 将 http:// 替换为 https://，微信小程序不支持 http
		imageList.value = results.map(item => item.image_url.replace('http://', 'https://'));
		console.log('imageList:', imageList.value);
	}
});

const previewImage = (index) => {
	uni.previewImage({
		urls: imageList.value,
		current: index
	});
};
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: #f5f5f5;
}

.result-header {
	padding: 30rpx 34rpx;
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	background: #fff;
}

.result-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 10rpx;
}

.result-img {
	width: 25%;
	height: 180rpx;
	padding: 5rpx;
	box-sizing: border-box;
}
</style>
