<template>
  <view class="">
		<u-navbar autoBack bgColor="#ff9501" placeholder title="打卡成功"></u-navbar>
		<view style="position: relative;width:100%;height: 700rpx;overflow: hidden;">
			<view class="bg"></view>
		</view>
		
		<section class="section-notification flex-col-center">
			<image style="width:212rpx;height:212rpx;" src="/static/images/coin.png" mode="aspectFill"></image>
			<view class="u-mt-20" style="font-weight: 800;font-size: 40rpx;">
				<!-- 没有数字，只有提示 -->
				<block v-if="!hasDigit(routerParems)">{{routerParems}}</block>
				<block v-if="hasDigit(routerParems)">
					恭喜您获得跑币 <text class="color" style="font-size: 64rpx;">{{extractNumbers(routerParems)}}</text> 个
				</block>
			</view>
			<view class="" style="width: 511rpx;height:2rpx;background:#F3F4F6;margin-top:64rpx;margin-bottom: 50rpx;">
				
			</view>
			<view class="welcome-txt flex-center">
				<view class="u-flex-y-center">
					<view class="color iconfont icon-liwu" style="font-size: 46rpx;"></view>
					<view class="tal" style="max-width:414rpx;margin-left:15rpx;line-height: 1.5;">
						<div v-for="(line, index) in motivationText" :key="index">{{line}}</div>
					</view>
				</view>
			</view>
		</section>
		
		<block v-if="eventList.length">
			<view class="u-flex-y-center u-mt-30 bgf b" style="height: 80rpx;padding-left: 34rpx;font-size: 32rpx;">打卡活动</view>
			<section v-for="item in eventList" :key="item.event_id" class="section-result panel u-flex-row" @click="$u.route('pagesDashboard/pkEvent/pkEvent', { id: item.event_id })">
				<image :src="item.background_image_url" style="width:160rpx;height:160rpx;border-radius:20rpx;" mode="aspectFill"></image>
				<view class="u-ml-20">
					<view class="name u-mb-20 u-mt-10" style="font-size:32rpx;">{{item.event_name}}</view>
					<view class="name" style="color:#666;">{{item.event_subtitle}}</view>
					<view class="name u-mt-20" style="color:#666;">活动日期：{{item?.start_time?.slice(0, 10)}}</view>
					<view v-if="item.checkin_status === 'out_of_time'" class="out-of-time-tag u-mt-16">该活动打卡时间尚未开始</view>
				</view>
			</section>
		</block>
		
		<view class="flex-center" style="position: fixed;bottom: 30rpx;width:100%;">
			<u-button type="primary" custom-style="width:642rpx;" color="#ff8c00" shape="circle" @click="routeTo()">查看我的跑币</u-button>
		</view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRandomMotivation } from "@/components/SharePoster/rules.js"

const routerParems = ref('')
const motivationText = ref(getRandomMotivation())

function extractNumbers(str) {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number)?.[0] : [];
}

function hasDigit(str) {
  return /\d/.test(str);
}

const eventList = ref([])
onLoad((options) => {
	console.log('options', options)
	routerParems.value = options.msg

	eventList.value = uni.getStorageSync('punchInUploadResult')?.data?.events || []
})

function routeTo() {
	uni.redirectTo({
		url: '/pagesSub/runCoin/myCoin'
	});
}
</script>

<style lang="scss" scoped>
.bg{
	background: linear-gradient( 360deg, #FF8C00 0%, #FFA500 100%);
	position: absolute;
	left: 50%;
	transform: translate(-50%);
	width: 2000rpx;
	height: 2000rpx;
	bottom: 0rpx;
	border-radius: 0 0 2000rpx 2000rpx;
}
.section-notification{
	width: 646rpx;
	height: 714rpx;
	padding-top: 58rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0,0,0,0.03);
	border-radius: 54rpx 54rpx 54rpx 54rpx;
	margin: -600rpx auto 0;
	position: relative;
	z-index: 3;
}
.welcome-txt{
	width: 512rpx;
	height: 158rpx;
	color: #4A5565;
	background: #F9FAFB;
	border-radius: 28rpx 28rpx 28rpx 28rpx;
}

.out-of-time-tag{
	display: inline-block;
	font-size: 24rpx;
	color: #e65100;
	background: #fff3e0;
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
}

::v-deep{
	.u-navbar__content__title{
		color: #fff!important;
	}
}
</style>
