<template>
  <view class="card-item flex-row" @click="goLink()">
		<view class="play-btn flex-center">
			<u-icon name="play-right-fill" color="#e5e6ff" size="20rpx"></u-icon>
		</view>
		<view class="">
			<view class="flex-start">
				<view class="title ellipsis">夜色下的古筝夜色下的古筝夜色下的古筝</view>
				<view class="tag iconfont flex-center icon-dunpai1">
					<view class="txt">
						版
					</view>
				</view>
			</view>
			<view class="time">
				125bpm/2:00
			</view>
		</view>
		<view class="tags flex-wrap flex-end" style="width:198rpx;">
			<view class="tag-item flex-center" v-for="(item,index) in tags" :key="index">
				春天
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
				pageType: "audio"
			})
		}
	}
};
</script>

<style lang="less">
	.card-item{
		color: #fff;
		width: 650rpx;
		height: 100rpx;
		border-radius: 8rpx;
		overflow: hidden;
		color: #0f1d34;
		background: #f8f8f8;
		padding: 14rpx 10rpx 0rpx 20rpx;
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
			color: #aa753d;
			width: 50rpx;
			height: 50rpx;
			border-radius: 999rpx;
			font-size: 14rpx;
			background: #334dff;
			margin-right: 15rpx;
			margin-top:10rpx;
		}
		.title{
			font-size: 24rpx;
			font-weight: 500;
			width: 320rpx;
			margin-top:7rpx;
		}
	}
	.time{
		margin-top: 4rpx;
		font-size: 20rpx;
		color: #979dab;
	}
	.tag-item{
		min-width: 56rpx;
		height: 32rpx;
		font-size: 17rpx;
		padding: 0 10rpx;
		background: #fff;
		margin: 0 10rpx 10rpx 0;
	}
</style>
