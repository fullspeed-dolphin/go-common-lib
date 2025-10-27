<template>
  <view class="pt30">
		<u-navbar autoBack placeholder title="添加设备"></u-navbar>
		<view class="">
		  <view class="brand-item flex-start" 
				@click="$u.route('pagesSub/device/deviceBind?value=' + item.label)"
				v-for="(item,index) in brandList" :key="index">
		  	<image class="img" :src="item.img" mode="aspectFill"></image>
				<view class="label">{{item.label}}</view>
		  </view>
		</view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 响应式数据
const brandList = ref([
	{
		img: '/static/images/华为运动健康@2x.png',
		label: '华为运动健康',
		value: ''
	},
	{
		img: '/static/images/佳明@2x.png',
		label: '佳明',
		value: ''
	},
	{
		img: '/static/images/高驰@2x.png',
		label: '高驰',
		value: ''
	},
])
const options = ref({})

// 页面加载
onLoad((optionsParam) => {
	options.value = optionsParam;
})

// 方法定义
const successLogin = () => {
	if (options.value?.direct) {
		uni.navigateBack()
	
		return false;
	}
	
	uni.switchTab({
		url: "/pages/index",
		success() {
			uni.hideLoading();
		},
	});
}
</script>

<style lang="less" scoped>
.brand-item{
	width: 682rpx;
	height: 120rpx;
	border-radius: 24rpx 24rpx 24rpx 24rpx;
	border: 2rpx solid #F0F0F0;
	padding: 20rpx 30rpx;
	margin: 30rpx auto;
	.img{
		width:80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}
}
</style>
