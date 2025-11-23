<template>
  <view class="p20">
		<rich-text class="richText" :nodes="ruleText"></rich-text>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { pouchInRule } from "./assets/rules.js"
import { failUpload } from "./assets/rules.js"

// 响应式数据
const ruleText = ref('')

// 页面加载
onLoad((options) => {
	if (options.type === 'rule') {
		ruleText.value = pouchInRule
	}
	if (options.type === 'failUpload') {
		ruleText.value = failUpload
	}
})
</script>

<style lang="scss" scoped>

</style>
