<template>
  <view class="card-item" @click="goLink()">
		<image class="img" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
		<view class="title ellipsis">夜色下的古筝夜色下的古筝夜色下的古筝</view>
		
		<view class="tag iconfont flex-center icon-dunpai1">
			<view class="txt">
				版
			</view>
		</view>
		
		<view class="play-btn flex-center">
			<u-icon name="play-right-fill" color="#fff" size="20rpx"></u-icon>
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
		}
  },
  methods: {
		goLink(item) {
			uni.$u.route('/pagesSub/productDetail', {
				...this.data,
				pageType: "video"
			})
		}
	}
};
</script>

<style lang="less">
	.card-item{
		position: relative;
		color: #fff;
		width: 314rpx;
		height: 168rpx;
		border-radius: 8rpx;
		overflow: hidden;
		.img{
			width: 100%;
			height: 100%;
		}
		&:before{
			position: absolute;
			content: "";
			width:100%;
			height: 100%;
			background: rgba(0,0,0, .2);
			z-index: 1;
		}
		.tag{
			position: absolute;
			color: #f5dea9;
			z-index: 3;
			top: 20rpx;
			right: 20rpx;
			height: 36rpx;
			font-size: 36rpx;
			.txt{
				position: absolute;
				color: #aa753d;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 14rpx;
			}
		}
		.play-btn{
			position: absolute;
			color: #aa753d;
			top: 50%;
			left: 50%;
			width: 50rpx;
			height: 50rpx;
			border-radius: 999rpx;
			transform: translate(-50%, -50%);
			font-size: 14rpx;
			z-index: 2;
			background: rgba(0,0,0,.3);
		}
		.title{
			position: absolute;
			color: #fff;
			bottom: 0;
			left:0;
			padding: 20rpx;
			font-size: 20rpx;
			font-weight: 500;
			z-index: 2;
			width: 100%;
		}
	}
</style>
