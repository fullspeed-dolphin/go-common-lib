<template>
  <view class="">
		<u-navbar title="运动详情"></u-navbar>
		<view class="flex-col-center" style="height: calc(100vh-44px);">
			<section class="section-map flex-1 flex-center" style="width: 100%;min-height: 600rpx;">
				地图
			</section>
			
			<section class="section-sport">
				<image class="avatar" :src="userInfo.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				<view class="flex-between-center">
					<view class="">
						<view class="" style="font-size: 30rpx;">总里程:</view>
						<view class="amount mt10 flex-row" style="align-items: flex-end;">
							<view class="total">12.42</view>
							公里
						</view>
					</view>
					<view class="tar" style="margin: 10rpx 10rpx 0 0;">
						<view class="user">广州凤凰悦跑团 - 阿雄</view>
						<view class="time c9">2025-09-03 18:14</view>
					</view>
				</view>
				
				<view class="bar">
					 <view class="left">慢</view>
					 <view class="right">快</view>
				</view>
				
				<view class="flex-row flex-wrap">
					<view class="statics-item flex-col-center">
						<view class="amount">01:30:31</view>
						用时
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">7'71"</view>
						平均配速
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">117</view>
						平均心率(bpm)
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">117</view>
						用时
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">75</view>
						平均不幅(cm)
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">36</view>
						累计爬升(m)
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">117</view>
						最快1公里
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">75</view>
						总步数
					</view>
					<view class="statics-item flex-col-center">
						<view class="amount">36</view>
						大卡
					</view>
				</view>
			</section>
		</view>
  </view>
</template>
<script>
export default {
  data () {
    return {
		};
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onLoad(options) {
		this.options = this.options;
		
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			// withShareTicket: true,
			success: function () {},
			fail: function () {}
		})
		// #endif
	},
  methods: {
		successLogin() {
		  if (this.options?.direct) {
		    uni.navigateBack()
		
		    return false;
		  }
		
		  uni.switchTab({
		    url: "/pages/index",
		    success() {
		      uni.hideLoading();
		    },
		  });
		},
  }
};
</script>

<style lang="less" scoped>
	.section-sport{
		position: relative;
		color: #999;
		width: 712rpx;
		height: 638rpx;
		background: #FFFFFF;
		border-radius: 26rpx 26rpx 26rpx 26rpx;
		border: 2rpx solid rgba(0,0,0,0.06);
		padding: 14rpx 26rpx;
	}
	.avatar{
		position: absolute;
		width: 112rpx;
		height: 112rpx;
		border: 2rpx solid rgba(0,0,0,0.06);
		right: 36rpx;
		top: -56rpx;
		z-index: 10;
		border-radius: 999rpx;
	}
	.total{
		font-weight: bold;
		font-size: 100rpx;
		color: #000000;
		margin-right: 10rpx;
	}
	.user{
		font-weight: 500;
		font-size: 30rpx;
		color: #000000;
		line-height: 42rpx;
		margin: 18rpx 0 8rpx;
	}
	
	.bar{
		position: relative;
		width: 642rpx;
		height: 4rpx;
		background: linear-gradient( 90deg, #94D243 0%, #FF8C00 100%);
		border-radius: 2rpx 2rpx 2rpx 2rpx;
		margin: 34rpx 0;
		.left{
			position: absolute;
			top:50%;
			left: 56rpx;
			transform: translateY(-50%);
			font-weight: 500;
			font-size: 24rpx;
			color: #94D243;
			padding: 0 4rpx;
			background: #fff;
		}
		.right{
			position: absolute;
			top:50%;
			right: 56rpx;
			padding: 0 4rpx;
			transform: translateY(-50%);
			font-weight: 500;
			font-size: 24rpx;
			color: #94D243;
			background: #fff;
		}
	}
	
	.statics-item{
		min-width: 33.3%;
		margin-bottom: 40rpx;
		.amount{
			font-weight: bold;
			font-size: 50rpx;
			color: #000000;
			margin-bottom: 20rpx;
		}
	}
</style>
