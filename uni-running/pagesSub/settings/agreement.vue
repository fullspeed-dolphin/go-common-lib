<template>
  <view>
		<rich-text class="richText" :nodes="detail.Content"></rich-text>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from "@/utils/request.js"
import agree_signUp from "../utils/agree_signUp.js"
import agree_privy from "../utils/agree_privy.js"
import faceScanPolicy from "../utils/faceScanPolicy.js"
import baoxian from "../utils/baoxian.js"
import notices_ShuiLianHu from "../utils/notices_ShuiLianHu.js"
import rule_ShuiLianHu from "../utils/rule_ShuiLianHu.js"
import disclaimer_ShuiLianHu from "../utils/disclaimer_ShuiLianHu.js"
import { useShare, buildPath } from "@/composables/useShare.js"

// 路由参数
const routeType = ref('');

const detail = ref({
	Content: ""
})

// 分享配置
useShare(() => ({
	title: '用户协议',
	path: buildPath('/pagesSub/settings/agreement', { type: routeType.value })
}));

// 页面加载
onLoad((options) => {
	routeType.value = options.type || '';
	if (options.type === 'signUp') {
		detail.value.Content = agree_signUp
	}
	if (options.type === 'privy') {
		detail.value.Content = agree_privy
	}
	if (options.type === 'baoxian') {
		detail.value.Content = baoxian
	}
	if (options.type === 'faceScanPolicy') {
		detail.value.Content = faceScanPolicy

		uni.setNavigationBarTitle({
			title: "人脸识别条款"
		})
	}
	if (options.type === 'notices_ShuiLianHu') {
		detail.value.Content = notices_ShuiLianHu
		uni.setNavigationBarTitle({
			title: "水濂湖报名须知"
		})
	}
	if (options.type === 'rule_ShuiLianHu') {
		detail.value.Content = rule_ShuiLianHu
		uni.setNavigationBarTitle({
			title: "水濂湖活动章程"
		})
	}
	if (options.type === 'disclaimer_ShuiLianHu') {
		detail.value.Content = disclaimer_ShuiLianHu
		uni.setNavigationBarTitle({
			title: "水濂湖免责声明"
		})
	}
})

// 方法定义
const getDetail = (ID) => {
	const data = {
		CallIndex: "RentalServices"
	}
	request.post(`/client/article/detail/callindex`, data).then(res => {
		detail.value = res
		
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
