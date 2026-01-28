<template>
  <view>
		<web-view :src="link"></web-view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useShare, buildPath } from "@/composables/useShare.js"
import request from "@/utils/request.js"

const link = ref("")
const title = ref("跑了没")

// 分享配置
useShare(() => ({
	title: title.value,
	path: buildPath('/pagesSub/settings/webView', {
		link: link.value,
		title: title.value
	})
}));

// 页面加载
onLoad((options) => {
	console.log('options==>', options.link)
	link.value = decodeURIComponent(options.link)
	if (options.title) {
		title.value = decodeURIComponent(options.title)
	}
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
