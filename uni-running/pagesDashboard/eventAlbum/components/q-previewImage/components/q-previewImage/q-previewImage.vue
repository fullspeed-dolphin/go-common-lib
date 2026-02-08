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
		
		<view class="flex-center" style="position: fixed;left:0;bottom: 90rpx;width: 100%;" v-if="originalUrls.length">
			<up-button @click="previewHD" shape="circle" type="primary"
				customStyle="width:188rpx;height:64rpx;margin:0;font-size:24rpx;color: #babab6;border-color:rgba(255, 255, 255, 0.27);background:rgba(34, 34, 34, 0.8);">
				查看高清图
			</up-button>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		urls: {
			type: Array,
			required: true,
			default: () => {
				return [];
			}
		},
		originalUrls: {
			type: Array,
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
		previewHD() {
			uni.previewImage({
				urls: this.originalUrls,
				current: this.current,
			})
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
