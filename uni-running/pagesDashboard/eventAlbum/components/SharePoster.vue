<template>
	<up-popup :show="show" @close="close" closeable custom-style="background:transparent;">
		<!-- 海报预览区域 -->
		<view class="poster-preview" v-if="posterImageUrl">
			<image :src="posterImageUrl" class="poster-image" mode="aspectFill"></image>
		</view>

		<l-painter class="painter" isRenderImage ref="painter" :board="posterConfig" @success="sharePaintSuccess"
			@done="sharePaintSuccess" />

		<!-- 海报组件 -->
		<!-- <up-poster ref="poster" :json="posterConfig"></up-poster> -->
	</up-popup>
</template>
<script setup>
	import lPainter from './lime-painter/components/l-painter/l-painter'
	import {
		ref,
		nextTick
	} from 'vue';

	const poster = ref(null);
	const posterImageUrl = ref('');
	const posterConfig = ref({});

	function createPoster(posterUrl) {
		posterConfig.value = {
			css: {
				width: '750rpx',
				height: '1000rpx',
				background: 'green'
			},
			views: [{
					type: 'text',
					text: "this.userInfo.truename",
					css: {
						left: '30rpx',
						top: '24rpx',
						width: '608rpx',
						height: '32rpx',
						textAlign: 'left',
						fontSize: '24rpx',
						color: "#222",
						maxLines: 1,
						padding: "0 30rpx 0 0"
					}
				},
				{
					type: 'text',
					text: "为你挑选了一个好物",
					css: {
						left: '30rpx',
						top: '60rpx',
						width: '608rpx',
						height: '32rpx',
						textAlign: 'left',
						fontSize: '24rpx',
						color: "#333",
						maxLines: 1,
						padding: "0 30rpx 0 0"
					}
				},
				{
					type: 'view',
					css: {
						left: '30rpx',
						top: '110rpx',
						width: '560rpx',
						height: '710rpx',
						background: '#fff',
						borderRadius: "20rpx"
					}
				},
				{
					type: 'image',
					src: posterUrl,
					css: {
						left: '56rpx',
						top: '100rpx',
						width: '510rpx',
						height: '470rpx',
						mode: 'aspectFill',
					}
				},
				{
					type: 'text',
					text: "喜迎十五运·你跑了没--增城1978电影小镇欢乐跑",
					css: {
						left: '56rpx',
						top: '632rpx',
						width: '170rpx',
						fontSize: '28rpx',
						color: "#222",
						textAlign: 'left',
					}
				},
				{
					type: 'text',
					text: "2025-11-09",
					css: {
						left: '56rpx',
						top: '690rpx',
						width: '390rpx',
						height: '150rpx',
						textAlign: 'left',
						fontSize: '28rpx',
						lineHeight: '50rpx',
						maxLines: 2,
						color: "#545253"
					}
				},
				{
					type: 'image',
					src: `.../../assets/qrcode.min.jpeg`,
					css: {
						left: '453rpx',
						top: '680rpx',
						background: '#fff',
						width: '110rpx',
						height: '110rpx'
					}
				},
			]
		}
	}

	function sharePaintSuccess(res) {
		uni.hideLoading()
		posterImageUrl.value = res
	}

	const generatePoster = async () => {
		try {
			uni.showLoading({
				title: '海报生成中...'
			});
			await nextTick()

			const result = await poster.value.exportImage();
			posterImageUrl.value = result.path;

			uni.hideLoading();
			uni.showToast({
				title: '海报生成成功',
				icon: 'success'
			});
		} catch (error) {
			uni.hideLoading();
			uni.showToast({
				title: '海报生成失败',
				icon: 'none'
			});
		}
	};

	const show = ref(false);

	function open(imageUrl) {
		createPoster(imageUrl)
		// generatePoster()
		show.value = true;
	}

	function close() {
		show.value = false;
	}

	defineExpose({
		open
	})
</script>

<style lang="less">
	.poster-image {
		width: 750rpx;
		height: 1000rpx;
	}
</style>