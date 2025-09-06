<template>
  <view class="offlineEvents" >
		<view class="h2 van-hairline--bottom">
			<view class="ellipsis2">
				跑团推荐
			</view>
		</view>
		<view class="section-events">
			<view class="card-item flex-row" v-for="(item,index) in 10" :key="index">
				
			</view>
		</view>
		
		<view class="" style="height:200rpx;"></view>
		<view class="section-bottom">
			<view class="van-hairline--top flex-row" style="padding: 26rpx 8rpx 0;gap:24rpx;">
				<view class="flex">
					<u-button type="primary" text="创建跑团"></u-button>
				</view>
				<view class="flex">
					<u-button type="primary" text="发现跑团"></u-button>
				</view>
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
			
		}
  },
  methods: {
		goLink(item) {
			uni.$u.route('/pagesSub/productDetail', {
				...this.data,
				pageType: "art"
			})
		},
		copyText(txt) {
			uni.setClipboardData({
				data: String(txt)
			})
		}
	}
};
</script>

<style lang="less">
	.offlineEvents{
		padding: 34rpx;
	}
	.h2{
		font-weight: 500;
		font-size: 30rpx;
		color: #F4F4F4;
		line-height: 42rpx;
		padding: 22rpx 0;
	}
	.cell{
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #F4F4F4;
		line-height: 34rpx;
	}
	
	.section-bottom{
		position: fixed;
		bottom:0;
		width: 100%;
		left:0;
		padding: 0 34rpx 34rpx;
		.txt{
			font-size: 24rpx;
			color: #F4F4F4;
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}
</style>
