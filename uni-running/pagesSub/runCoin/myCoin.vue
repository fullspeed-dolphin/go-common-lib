<template>
  <view class="bg">
    <u-navbar autoBack placeholder title="我的跑币" bgColor="transparent"></u-navbar>
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
			<view style="position: relative;z-index:2;">
				<view class="panel1">
					<view class="bg-radius flex-center">
						<image class="icon" src="./assets/Frame 1000005626@2x.min.png" style="width:690rpx;height: 134rpx; " mode="aspectFill"></image>
					</view>
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
						
						<view class="flex-center" @click="$u.route('pagesSport/captureRule?type=coinRule')" style="color:rgba(255, 140, 0, .75);margin-top: 40rpx;">
							跑币规则 
							<u-icon name="arrow-right" color="rgba(255, 140, 0, .75)"></u-icon>
						</view>
					</view>
				</view>
			</view>
			
			<view>
				<view style="width:690rpx;margin:0 auto;height: 80rpx;margin-bottom: -10rpx;" class="b bgf u-m-t-20 u-p-l-10 u-flex-y-center van-hairline--bottom">明细列表</view>
				<view class="panel rel" v-for="(item, index) in dataList" :key="index">
					<view class="" style="position: absolute;right:20rpx;margin-top:10rpx;">
						<text :style="`color:${item.type === 1 ? 'rgba(255, 140, 0, 1)' : ''}`">{{item.amount}}</text>
					</view>
					<view class="u-mt-10">类型：{{item.remark}}</view>
					<view class="c9 u-mt-20">{{item.time}}</view>
				</view>
			</view>
		</mescroll-body>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';

// 分享给朋友
onShareAppMessage(() => {
	return {
		title: '我的跑币',
		path: '/pagesSub/runCoin/myCoin'
	};
});

// 分享到朋友圈
onShareTimeline(() => {
	return {
		title: '我的跑币'
	};
});
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom)
import request from "@/utils/request.js"

const detail = ref({})

function getInfo () {
	request.get(`/wallet-api/wallet/balance`).then(res => {
		detail.value = res
	})
}

const dataList = ref([])
	const getList = (mescroll) => {
		uni.showLoading({
			mask: true
		});

		const params = {
			page: mescroll.num - 1,
			page_size: 10,
		};

		request.get(`/wallet-api/wallet/my-transactions`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (mescroll.num == 1) dataList.value = []

				res = res.list.map(item => ({
					...item,
					time: item.created_at?.slice(0, 19)?.replace('T', ' ')
				}))
				
				console.log("res=----->", res)

				dataList.value = dataList.value.concat(res)

				//隐藏下拉刷新和上拉加载的状态;
				mescroll.endSuccess(res.length);
			})
			.catch((error) => {
				console.log(error)
				uni.hideLoading();
				mescroll.endErr();
			});
	};

onLoad(() => {
	getInfo()
})

</script>

<style lang="less" scoped>
.panel1{
	width: 690rpx;
	overflow: hidden;
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
.bg-radius{
	position: absolute;
	left: 50%;
	transform: translate(-50%);
	width: 7000rpx;
	height: 7000rpx;
	bottom: 250rpx;
	overflow: hidden;
	border-radius: 0 0 7000rpx 7000rpx;
	.icon{
		position: absolute;
		left: 50%;
		margin-left: -2rpx;
		transform: translate(-50%);
		bottom:10rpx;
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
	color: #B66D40;
	background: #FFFCFA;
	border-radius: 24rpx 24rpx 24rpx 24rpx;
	border: 1rpx solid #FAF8F4;
}
</style>
