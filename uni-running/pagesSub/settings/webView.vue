<template>
  <view>
		<web-view :src="link"></web-view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import request from "@/utils/request.js"

const link = ref("")
const title = ref("跑了没")

// 页面加载
onLoad((options) => {
	console.log('options==>', options.link)
	link.value = decodeURIComponent(options.link)
	if (options.title) {
		title.value = decodeURIComponent(options.title)
	}

	// #ifdef MP-WEIXIN
	// 开启分享菜单，包含分享给朋友和分享到朋友圈
	wx.showShareMenu({
		withShareTicket: true,
		menus: ['shareAppMessage', 'shareTimeline']
	});
	// #endif
})

// 分享给朋友
onShareAppMessage(() => {
	return {
		title: title.value,
		path: `/pagesSub/settings/webView?link=${encodeURIComponent(link.value)}&title=${encodeURIComponent(title.value)}`,
	};
});

// 分享到朋友圈
onShareTimeline(() => {
	return {
		title: title.value,
		query: `link=${encodeURIComponent(link.value)}&title=${encodeURIComponent(title.value)}`,
	};
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
