<template>
  <view class="card-item flex-start" @click="goLink()">
		<view class="play-btn iconfont icon-pdf-full">
		</view>
		<view class="" style="width:520rpx;">
			<view class="flex-start" >
				<view class="title ellipsis">夜色下的古筝夜色下的古筝夜色下的古筝夜色下的古筝夜色下的古筝夜色下的古筝</view>
				<view class="tag iconfont flex-center icon-dunpai1">
					<view class="txt">
						版
					</view>
				</view>
			</view>
			<view class="time ellipsis2">
				文章讨论了文章讨论了文章讨论了文章讨论了文章讨论了文章讨论了文章讨论了
			</view>
		</view>
  </view>
</template>
<script>
export default {
	props: {
		data: {
			type: Object,
			default: () => {}
		},
	},
  data () {
		return {
			tags: [1,1,1,1]
		}
  },
  methods: {
		goLink(item) {
			uni.$u.route('/pagesSub/productDetail', {
				...this.data,
				pageType: "text"
			})
		}
	}
};
</script>

<style lang="less">
	.card-item{
		color: #fff;
		width: 650rpx;
		height: 134rpx;
		border-radius: 8rpx;
		overflow: hidden;
		color: #0f1d34;
		background: #f8f8f8;
		padding: 14rpx 20rpx;
		.tag{
			position: relative;
			color: #f5dea9;
			height: 36rpx;
			font-size: 36rpx;
			.txt{
				position: absolute;
				color: #aa753d;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 17rpx;
			}
		}
		.play-btn{
			color: #ca2525;
			width: 58rpx;
			height: 58rpx;
			border-radius: 999rpx;
			font-size: 58rpx;
			margin-right: 20rpx;
			margin-top:10rpx;
		}
		.title{
			font-size: 24rpx;
			font-weight: 500;
			margin-top:7rpx;
		}
	}
	.time{
		margin-top: 10rpx;
		font-size: 20rpx;
		color: #979dab;
		line-height: 22rpx;
	}
</style>
