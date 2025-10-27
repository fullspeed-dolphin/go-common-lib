<template>
  <u-popup :show="isShowPop" :round="15" :mode="position || 'center'" closeable @close="close">
    <view class="con" style="min-height: 300rpx;max-width: 710rpx;overflow: hidden;border-radius: 20rpx;">
      <slot />
    </view>
    <view v-if="confirmButtonTxt" style="padding:30rpx;">
      <u-button type="primary" shape="circle" block @click="confirm">{{confirmButtonTxt}}</u-button>
    </view>
  </u-popup>
</template>
<script setup>
import { ref } from 'vue'

// Props定义
const props = defineProps(["title", "confirmButtonTxt", "isShowConfirm", "position"])

// Emits
const emit = defineEmits(['close', 'confirm'])

// 响应式数据
const isShowPop = ref(false)
const text = ref("")

// 方法定义
const open = (data) => {
	text.value = data || "";
	isShowPop.value = true;
}

const close = (data) => {
	isShowPop.value = false;
	emit("close")
}

const confirm = () => {
	isShowPop.value = false;
	emit("confirm");
}

// 暴露方法给父组件
defineExpose({
	open,
	close,
	confirm
})
</script>

<style lang="scss">

</style>
