<template>
	<view>
		<u-navbar title="搜索结果" placeholder></u-navbar>

		<view class="result-header">
			<text>找到 {{ imageList.length }} 张匹配照片</text>
		</view>

		<view class="u-flex-row u-flex-wrap u-p-10">
			<image
				v-for="(url, index) in imageList"
				:key="index"
				class="result-img"
				:src="url + ossPar250"
				mode="aspectFill"
				@click="previewImage(index)"
			/>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const ossPar250  = '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'
const imageList = ref([]);

onLoad(() => {
	const results = uni.getStorageSync('faceSearchResults');
	if (results && results.length > 0) {
		imageList.value = results.map(item => {
			const link = item.image_url ? item.image_url.replace('http://', 'https://') : item
			return link.split('?Expires')[0]
		});
	}
});

const previewImage = (index) => {
	const ossPar750  = '?x-oss-process=image/resize,w_750/quality,q_80/format,webp'
	uni.previewImage({
		urls: imageList.value.map(i => i + ossPar750),
		current: index
	});
};
</script>

<style lang="scss" scoped>
.result-header {
	padding: 30rpx 34rpx;
	font-weight: bold;
	background: #fff;
}

.result-img {
	width: 25%;
	height: 180rpx;
	padding: 5rpx;
	box-sizing: border-box;
}
</style>
