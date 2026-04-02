<script setup>
const props = defineProps({
  modelValue: Boolean,
  adImg: String
})

const emit = defineEmits(['update:modelValue', 'click', 'close'])  // 新增 close 事件

// 关闭弹窗时触发
const closePop = () => {
  emit('update:modelValue', false)
  emit('close')  // 通知父组件关闭事件
}

// 点击容器时触发
const onContainerClick = () => {
  emit('click')
}
</script>

<template>
  <view>
    <u-popup
      :show="modelValue"
			mode="center"
			@close="closePop"
      :closeOnClickOverlay="false"
      closeable
      bgColor="transparent"
    >
      <view class="popup-container" @click="onContainerClick">
        <image
          :src="props.adImg"
          mode="widthFix"
          class="img"
        />
      </view>
    </u-popup>
  </view>
</template>

<style scoped>
.popup-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.img {
  width: 100vw;
  height: auto;
}
</style>