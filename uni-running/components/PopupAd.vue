<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  adImg: String,
  themeColor: { type: String, default: '#F05A4E' },
  themeGradient: { type: Array, default: () => ['#FF6B81', '#E8453C'] },
  eventName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'click', 'close'])

const countdown = ref(3)
let timer = null

const startCountdown = () => {
  countdown.value = 3
  clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const stopCountdown = () => {
  clearInterval(timer)
  timer = null
  countdown.value = 3
}

watch(() => props.modelValue, (val) => {
  if (val) {
    startCountdown()
  } else {
    stopCountdown()
  }
})

onUnmounted(() => {
  clearInterval(timer)
})

const closePop = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onBtnClick = () => {
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
      closeIconColor="#999"
    >
      <!-- 图片模式 -->
      <view v-if="adImg" class="popup-container" @click="onBtnClick">
        <image :src="adImg" mode="widthFix" class="img" />
      </view>

      <!-- 主题色弹窗模式 -->
      <view v-else class="card">
        <!-- 顶部装饰 -->
        <view class="card-header" :style="{ background: `linear-gradient(135deg, ${themeGradient[0]}, ${themeGradient[1]})` }">
          <view class="card-icon">🎉</view>
          <text class="card-title">恭喜您获得抽奖资格</text>
        </view>

        <!-- 内容区 -->
        <view class="card-body">
          <text class="card-event-name" :style="{ color: themeColor }">{{ eventName }}</text>
          <text class="card-desc">您已完成本期打卡任务，获得一次抽奖机会，赢取精美礼品！</text>
          <view class="card-tips">
            <text class="card-tips-text">🏃 跑鞋 · 短袖 · 空顶帽 · 运动袜</text>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="card-footer">
          <view
            class="card-btn"
            :style="{ background: `linear-gradient(135deg, ${themeGradient[0]}, ${themeGradient[1]})` }"
            @click="onBtnClick"
          >
            <text class="card-btn-text">立即抽奖</text>
          </view>
          <text class="card-countdown">{{ countdown }}秒后自动跳转...</text>
        </view>
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

/* 主题色弹窗 */
.card {
  width: 580rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 50rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2rpx;
}

.card-body {
  padding: 36rpx 40rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-event-name {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 24rpx;
}

.card-tips {
  background: #FFF8F0;
  border-radius: 12rpx;
  padding: 16rpx 28rpx;
}

.card-tips-text {
  font-size: 24rpx;
  color: #C19E86;
  letter-spacing: 2rpx;
}

.card-footer {
  padding: 30rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.card-btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 4rpx;
}

.card-countdown {
  font-size: 22rpx;
  color: #bbb;
  margin-top: 16rpx;
}
</style>
