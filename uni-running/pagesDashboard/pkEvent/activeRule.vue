<template>
  <view class="u-p-20">
	<u-navbar autoBack placeholder  title="活动规则" />
		<rich-text v-if="ruleText" class="richText" :nodes="ruleText"></rich-text>
		<view v-else class="fallback">
			<text class="fallback-text" :style="fallbackStyle">详询广州全速体育客服</text>
		</view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import { declareTerms } from "./utils.js"

const store = useStore()
const pkEventTheme = computed(() => store.state.pkEventTheme)
const pkEventRule = computed(() => store.state.pkEventRule)

const ruleText = ref('')
const isDisclaimer = ref(false)

const fallbackStyle = computed(() => {
	const g = pkEventTheme.value?.gradient
	if (g?.length === 2) {
		return `background: linear-gradient(90deg, ${g[0]}, ${g[1]}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
	}
	return 'color: #ff8c00;'
})

onLoad((options) => {
	if (options.type === 'disclaimer') {
		ruleText.value = declareTerms
		isDisclaimer.value = true
		uni.setNavigationBarTitle({
			title: '免责声明'
		})
		return
	}

	ruleText.value = pkEventRule.value || ''
})
</script>

<style lang="scss" scoped>
.u-p-20 {
  padding: 20rpx;
  background: #fff;
  min-height: 100vh;
}

.fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.fallback-text {
  font-size: 36rpx;
  font-weight: bold;
}
</style>
