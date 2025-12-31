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
		
		<!-- <qPreviewImage ref="refPreviewImage" :urls="image750List"></qPreviewImage> -->
	</view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
// import qPreviewImage from "./q-previewImage/components/q-previewImage.vue"

const ossPar250  = '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'
const refPreviewImage = ref(null);
const imageList = ref([]);
const image750List = ref([]);

onLoad(() => {
	const results = uni.getStorageSync('faceSearchResults');
	if (results && results.length > 0) {
		const list = results.map(item => {
			const link = item.image_url ? item.image_url.replace('http://', 'https://') : item
			return link.split('?Expires')[0]
		});
		imageList.value = list
		image750List.value = list.map(i => i + '?x-oss-process=image/resize,w_750')
	}
});

const previewImage = (index) => {
	const ossPar750  = '?x-oss-process=image/resize,w_750/quality,q_80/format,webp'
	uni.previewImage({
		urls: imageList.value.map(i => i + ossPar750),
		current: index
	});
};

const preview = url => {
    // #ifdef MP-WEIXIN
    nextTick(()=>{
         refPreviewImage.value.open(url); // 传入当前选中的图片地址(小程序必须添加$nextTick，解决组件首次加载无图)
    })
    // #endif

    // #ifndef MP-WEIXIN
    refPreviewImage.value.open(url); // 传入当前选中的图片地址
    // #endif
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
::v-deep{
	.PreviewMedia{
		.u-popup__content__close {
			padding: 20rpx;
			background: rgba(0,0,0, .5);
			border-radius: 999px;
			top: 300rpx!important;
			.u-icon__icon{
				color: #fff!important;
			}
		}
	}
}
</style>
