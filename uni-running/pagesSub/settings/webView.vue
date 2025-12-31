<template>
  <view>
		<web-view :src="link"></web-view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from "@/utils/request.js"
const link = ref("")

// 页面加载
onLoad((options) => {
	console.log('options==>', options.link)
	link.value = options.link
})

// 方法定义
const getDetail = (ID) => {
	const data = {
		CallIndex: "RentalServices"
	}
	request.post(`/client/article/detail/callindex`, data).then(res => {
		// detail.value = res
		
		uni.setNavigationBarTitle({
			title: res.Title
		});
	})
}
</script>

<style lang="scss" scoped>
.h1{
	padding: 24rpx;
	font-size: 40rpx;
	font-weight: 600;
	line-height: 120%;
}

.richText{
	line-height: 1.3;
	padding: 20px 24rpx 50rpx;
}
</style>
