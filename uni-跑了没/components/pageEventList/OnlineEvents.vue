<template>
  <view class="offlineEvents" >
		<view class="h2 van-hairline--bottom">
			<view class="ellipsis2">
				奔跑吧！广州·喜迎十五运 奔跑环两山·增城站奔跑吧！广州·喜迎十五运 奔跑环两山·增城站
			</view>
		</view>
		<view class="section-text">
			<view class="cell flex-row">
				<view class="label">报名时间：</view>
				<view class="value">2025.09.20 9:00 - 2025.09.30 9:00</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动时间：</view>
				<view class="value">2025.10.26 8:00 </view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动地点：</view>
				<view class="value flex">广州增城区xxxxxxxxx广州增城区xxxxxxxxx广州增城区xxxxxxxxx广州增城区xxxxxxxxx</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动项目：</view>
				<view class="value">5KM / 10KM / 半程马拉松</view>
			</view>
			<view class="cell flex-row">
				活动规模：1000人
			</view>
			<view class="cell flex-start">
				客服微信：
				<view class="mr20">
					15864205324
				</view>  
				<u-button @click="copyText(15864205324)" type="primary" shape="circle" color="#3A8443" size="mini" text="复制"></u-button>
			</view>
			<view class="cell">
				<view class="label">活动说明：</view>
				<view class="value">5KM / 10KM / 半程马拉松5KM / 10KM / 半程马拉松5KM / 10KM / 半程马拉松5KM / 10KM / 半程马拉松</view>
			</view>
		</view>
		
		<view class="" style="height:200rpx;"></view>
		<view class="section-bottom">
			<view class="txt">
				报名截止：2025.09.30 9:00
			</view>
			<view class="van-hairline--top" style="padding: 26rpx 8rpx 0">
				<u-button type="primary" text="活动报名"></u-button>
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
