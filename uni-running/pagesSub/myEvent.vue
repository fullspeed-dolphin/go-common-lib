<template>
  <view class="" >
		<u-navbar autoBack placeholder title="我的赛事"></u-navbar>
		<section class="panel" @click="$u.route('pagesSub/offlineEvents')">
			<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
			<view class="p20">
				<view class="h2">
					<view class="ellipsis2">
						奔跑吧！广州·喜迎十五运 奔跑环两山·增城站奔跑吧！广州·喜迎十五运 奔跑环两山·增城站
					</view>
				</view>
				<view class="cell flex-row">
					<view class="label">活动时间：2025.10.26 8:00</view>
					<view class="value"> </view>
				</view>
			</view>
		</section>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import request from "@/utils/request.js"

// 响应式数据
const isSignUp = ref(false)

// 方法定义
const routeTo = () => {
	if (isSignUp.value) {
		cancelSignUp()
		return false;
	}
	uni.$u.route('pagesSub/orderIn')
}

const cancelSignUp = () => {
	uni.showModal({
		title: '提示',
		content: '确定取消报名吗？',
		success: (res) => {
			if (res.confirm) {
				request.post({url: "api/index/logout"}).then(res => {
					uni.$u.toast('已取消报名')
				})
			} else if (res.cancel) {
				console.log('用户点击取消');
			}
		}
	});
}

const copyText = (txt) => {
	uni.setClipboardData({
		data: String(txt)
	})
}
</script>

<style lang="less">
	.panel{
		width: 682rpx;
		margin: 30rpx 34rpx 30rpx;
		padding: 0rpx;
		border-radius: 16rpx;
		box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
		.poster{
			width: 682rpx;
			height: 304rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			// border: 2rpx solid #707070;
		}
	}
	.h2{
		font-weight: 500;
		font-size: 30rpx;
		line-height: 42rpx;
	}
	.cell{
		margin-top: 20rpx;
		font-size: 24rpx;
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
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}
	
	::v-deep{
		.isSignUp{
			.u-button{
				color: #FF8C00;
				background: #F2F2F2;
				border-color: #f2f2f2;
			}
		}
	}
</style>
