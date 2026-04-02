<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useShare } from '@/composables/useShare'

const imageUrl = ref('')
const eventName = ref('完赛证书')
const loading = ref(true)

onLoad((options) => {
  if (options.url) {
    imageUrl.value = decodeURIComponent(options.url)
  }
  if (options.eventName) {
    eventName.value = decodeURIComponent(options.eventName)
  }
})

const onImageLoad = () => {
  loading.value = false
}

const onImageError = () => {
  loading.value = false
  uni.showToast({ title: '证书加载失败', icon: 'none' })
}

// 保存到相册
const saveToAlbum = () => {
  uni.showLoading({ title: '保存中...' })
  uni.downloadFile({
    url: imageUrl.value,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading()
            uni.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: (err) => {
            uni.hideLoading()
            if (err.errMsg.includes('auth deny')) {
              uni.showModal({
                title: '提示',
                content: '需要授权保存图片到相册',
                confirmText: '去设置',
                success: (res) => {
                  if (res.confirm) {
                    uni.openSetting()
                  }
                }
              })
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          }
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}

// 分享给朋友
useShare(() => ({
  title: `${eventName.value} - 完赛证书`,
  imageUrl: imageUrl.value,
  path: `/pagesDashboard/pkEvent/certViewer?url=${encodeURIComponent(imageUrl.value)}&eventName=${encodeURIComponent(eventName.value)}`,
}))

// 预览图片（支持转发朋友圈）
const previewImage = () => {
  uni.previewImage({
    current: imageUrl.value,
    urls: [imageUrl.value],
  })
}
</script>

<template>
  <view class="cert-page">
    <u-navbar autoBack placeholder :title="eventName" />

    <view class="cert-body">
      <view v-if="loading" class="cert-loading">
        <u-loading-icon size="40" />
        <text class="cert-loading-text">证书加载中...</text>
      </view>

      <image
        v-if="imageUrl"
        class="cert-image"
        :src="imageUrl"
        mode="widthFix"
        @load="onImageLoad"
        @error="onImageError"
        @click="previewImage"
      />
    </view>

    <view class="cert-actions">
      <view class="cert-btn save-btn" @click="saveToAlbum">
        <text class="cert-btn-text">保存到相册</text>
      </view>
      <button class="cert-btn share-btn" open-type="share">
        <text class="cert-btn-text">分享给朋友</text>
      </button>
      <view class="cert-btn preview-btn" @click="previewImage">
        <text class="cert-btn-text">分享到朋友圈</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.cert-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.cert-body {
  flex: 1;
  padding: 30rpx;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.cert-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  gap: 20rpx;
}

.cert-loading-text {
  font-size: 26rpx;
  color: #999;
}

.cert-image {
  width: 100%;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);
}

.cert-actions {
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
}

.cert-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 88rpx;
}

.cert-btn::after {
  border: none;
}

.save-btn {
  background: #FF8C00;
}

.share-btn {
  background: #07C160;
}

.preview-btn {
  background: #576B95;
}

.cert-btn-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}
</style>
