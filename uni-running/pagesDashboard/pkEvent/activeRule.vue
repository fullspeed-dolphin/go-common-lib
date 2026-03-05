<template>
  <view class="u-p-20">
		<rich-text class="richText" :nodes="ruleText"></rich-text>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { activeRule } from "../assets/rules.js"
import { declareTerms } from "./utils.js"

const ruleText = ref('')

onLoad((options) => {
	if (options.type === 'disclaimer') {
		ruleText.value = declareTerms
		uni.setNavigationBarTitle({
			title: '免责声明'
		})
		return
	}

	ruleText.value = activeRule
})
</script>

<style lang="scss" scoped>
.u-p-20 {
  padding: 20rpx;
  background: #fff;
  min-height: 100vh;
}
</style>
