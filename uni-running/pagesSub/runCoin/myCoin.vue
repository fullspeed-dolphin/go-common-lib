<template>
  <view class="bg">
    <u-navbar autoBack placeholder :title="null" bgColor="transparent"></u-navbar>
    <view style="position: relative;z-index:2;">
			<view class="panel1">
				<image src="./assets/Frame 1000005626@2x.min.png" style="width:100%;height: 134rpx; " mode="aspectFill"></image>
				<view style="position: absolute;top:0;left:0;right:0;">
					<view class="flex-between-center" style="padding: 44rpx 30rpx 0 56rpx;margin-bottom:50rpx;">
						<view class="u-flex-y-center">
							<image style="width:48rpx;height:48rpx;" src="/static/images/coin.png" mode="aspectFill"></image>
							<view style="font-weight: bold;
	font-size: 34rpx;
	color: #B66D40;">：{{detail.fscoin}}个</view>
						</view>
						<view class="flex-center rule-btn">100个跑币=1元</view>
					</view>
					
					<view class="flex-between-center" style="padding: 38rpx 12rpx 0;">
						<view class="flex-between-center nav-item">
							我的权益
							<image style="width:48rpx;height:48rpx;" src="./assets/Diamonds.png" mode="aspectFill"></image>
						</view>
						<view class="flex-between-center nav-item" @click="$u.route('/pagesSub/runCoin/coinRanks')">
							跑币排行榜
							<image style="width:48rpx;height:48rpx;" src="./assets/Frame.png" mode="aspectFill"></image>
						</view>
					</view>
					
					<view class="flex-center" @click="$u.route('pagesSport/captureRule?type=rule')" style="color:rgba(255, 140, 0, .75);margin-top: 40rpx;">
						跑币规则 
						<u-icon name="arrow-right" color="rgba(255, 140, 0, .75)"></u-icon>
					</view>
				</view>
			</view>
		</view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js"

const detail = ref({})

function getInfo () {
	request.get(`/wallet-api/wallet/balance`).then(res => {
		detail.value = res
	})
}

onLoad(() => {
	getInfo()
})

</script>

<style lang="less" scoped>
.panel1{
	width: 690rpx;
	height: 392rpx;
	position: relative;
	padding-bottom: 40rpx;
	margin: 0 auto;
	background: #FFFFFF;
	border-radius: 16rpx 16rpx 16rpx 16rpx;
}
.bg{
	position: relative;
	&:before{
		position: absolute;
		content: "";
		width: 100vw;
		height: 461rpx;
		background: #F9EEE4;
		border-radius: 0px 0px 0px 0px;
		filter: blur(100rpx);
	}
}
.rule-btn{
	width: 162rpx;
	height: 38rpx;
	background: #B66D40;
	border-radius: 40rpx;
	font-size: 20rpx;
	color: #FFFFFF;
}
.panel-bg{
	width: 690rpx;
	height: 138rpx;
	background: linear-gradient( 76deg, #FFBE5C 0%, #FFDBAB 19.52%, #FFF0E5 28.27%, #FDE1C9 39.07%, #FBC594 59.5%, #FCD5B1 75.5%, #F69D4B 100%);
	border-radius: 16rpx 16rpx 0rpx 0rpx;
	border: 4rpx solid;
	border-image: linear-gradient(359deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)) 4 4;
}
.nav-item{
	width: 324rpx;
	height: 100rpx;
	padding-left: 28rpx;
	padding-right: 28rpx;
	font-size: 32rpx;
	color: #8E8E8E;
	background: #FFFCFA;
	border-radius: 24rpx 24rpx 24rpx 24rpx;
	border: 1rpx solid #FAF8F4;
}
</style>
