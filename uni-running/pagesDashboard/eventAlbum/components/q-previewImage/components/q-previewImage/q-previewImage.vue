<template>
	<view class="previewImage" v-if="show">
		<view class="summary">
			<text class="text">{{ current + 1 }} / {{ urls.length }}</text>
		</view>
		<swiper @tap="close" class="swiper" :current="current" circular @change="swiperChange"  @touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<swiper-item v-for="(item, index) in urls" :key="index">
				<movable-area class="movable-area" scale-area>
					<movable-view class="movable-view" direction="all" :inertia="true" damping="100" scale="true" scale-min="1" scale-max="4" :scale-value="scale">
						<scroll-view scroll-y="true" class="uni-scroll-view">
							<view class="scroll-view"><image :key="index" class="image" :src="item" mode="widthFix" @longpress="onLongpress(item)" /></view>
						</scroll-view>
					</movable-view>
				</movable-area>
			</swiper-item>
		</swiper>
		
		<view class="flex-center" style="position: fixed;left:0;bottom: 90rpx;width: 100%;">
			<up-button @click="downloadPicture" type="primary" shape="circle" icon="download"
				customStyle="width:186rpx;height:60rpx;">
				下载原图
			</up-button>
		</view>
	</view>
</template>

<script>
// 保存在线图片到相册
async function saveOnlineImageToAlbum(imageUrl) {
  // 1. 显示 loading（可选）
  uni.showLoading({ title: '下载中...' });

  try {
    // 2. 下载图片到临时路径
    const downloadRes = await new Promise((resolve, reject) => {
      uni.downloadFile({
        url: imageUrl, // 必须是 HTTPS（小程序要求）
        success: resolve,
        fail: reject
      });
    });

    if (downloadRes.statusCode !== 200) {
      throw new Error('图片下载失败');
    }

    const tempFilePath = downloadRes.tempFilePath;

    // 3. 保存到相册
    await new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: resolve,
        fail: reject
      });
    });

    uni.hideLoading();
    uni.showToast({ title: '保存成功', icon: 'success' });

  } catch (err) {
    uni.hideLoading();
    console.error('保存失败:', err);

    // 常见错误处理
    if (err.errMsg?.includes('auth deny')) {
      uni.showToast({ title: '请允许访问相册', icon: 'none' });
      // 引导用户去设置（可选）
      uni.openSetting({
        success: (res) => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            // 用户已授权，可重试
          }
        }
      });
    } else {
      uni.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  }
}

export default {
	props: {
		urls: {
			type: Array,
			required: true,
			default: () => {
				return [];
			}
		}
	},
	data() {
		return {
			show: false,
			current: 0, //当前页
			scale: 1,
			isZooming: false // 是否处于缩放状态
		};
	},
	methods: {
		//打开
		open(current) {
			this.current = this.urls.findIndex(item => item.includes(current));
			this.show = true;
			this.$emit('open');
		},
		//关闭
		close() {
			if (!this.isZooming) {
				this.show = false;
				this.current = 0;
				this.$emit('close');
			}
		},
		//图片改变
		swiperChange(e) {
			this.current = e.detail.current;
		},
		//监听长按
		onLongpress(e) {
			this.$emit('onLongpress', e);
		},
		handleTouchStart() {
			this.isZooming = true;
		},
		handleTouchEnd() {
			this.isZooming = false;
		},
		downloadPicture() {
			saveOnlineImageToAlbum(this.urls[this.current])
			console.log('this.urls[this.current]=====>', this.urls[this.current])
			// uni.saveImageToPhotosAlbum({
			// 	filePath: this.urls[this.current],
			// })
		}
	}
};
</script>

<style lang="scss" scoped>
.previewImage {
	z-index: 99;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #000000;
	.swiper {
		width: 100%;
		height: 100vh;
			.movable-area {
				height: 100%;
				width: 100%;
				.movable-view {
					width: 100%;
					min-height: 100%;
					.uni-scroll-view{
						height: 100vh;
					}
					.scroll-view {
						display: flex;
						align-items: center;
						justify-content: center;
						min-height: 100vh;
						.image {
							width: 100%;
							height: auto;
						}
					}
				}
			}
	}
	
}

.summary {
	position: fixed;
	z-index: 9999;
	width: 100%;
	top: 62px;
	text-align: center;
	.text {
		color: #fff;
		font-size: 32rpx;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 3rpx 16rpx;
		border-radius: 20rpx;
		user-select: none;
	}
}
</style>
