<template>
  <view class="card-item" @click="goLink()">
		
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
				pageType: "art"
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
		height: 314rpx;
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
		.title{
			position: absolute;
			color: #fff;
			bottom: 0;
			left:0;
			padding: 20rpx;
			font-size: 24rpx;
			font-weight: 500;
			z-index: 2;
			width: 100%;
		}
	}
</style>
