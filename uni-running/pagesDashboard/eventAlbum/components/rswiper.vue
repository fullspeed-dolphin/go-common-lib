<template>
  <view class="SwiperSection" :style="{
    transform: `translateY(${pullDownY}px)`,
    opacity: pullDownOpacity,
    transition: isPullingDown ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
  }">

    <!-- 三图滑动模式：实现跟手滑动效果 -->
    <view
      class="slides-container"
      @touchstart.stop="onTouchStart"
      @touchmove.stop="onTouchMove"
      @touchend.stop="onTouchEnd"
    >
      <view
        class="slides-track"
        :style="{
          width: (screenWidth * 3) + 'px',
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }"
      >
        <!-- 上一张 -->
        <view class="slide" :style="{ width: screenWidth + 'px' }">
          <view v-if="prevImage.url750" class="slide-img-wrap">
            <image class="slide-image slide-image--blur" :src="prevImage.urlTiny" mode="widthFix" />
            <image class="slide-image slide-image--main" :class="{ 'is-loaded': prevLoaded }"
              :src="prevImage.url750" mode="widthFix" @load="prevLoaded = true" />
          </view>
        </view>

        <!-- 当前（支持缩放） -->
        <view class="slide" :style="{ width: screenWidth + 'px' }">
          <movable-area class="movable-area" scale-area>
            <movable-view
              class="movable-view"
              direction="all"
              :inertia="true"
              :damping="20"
              :friction="1"
              :scale="true"
              :scale-min="1"
              :scale-max="4"
              :scale-value="scaleValue"
              :x="moveX"
              :y="moveY"
              @scale="onScale"
              @change="onMoveChange"
            >
              <view class="slide-img-wrap">
                <image class="slide-image slide-image--blur" :src="currentImage.urlTiny" mode="widthFix" />
                <image v-if="lookIdStatus"
                  class="slide-image slide-image--main" :class="{ 'is-loaded': currentLoaded }"
                  :src="currentImage.url" mode="widthFix" @load="currentLoaded = true" />
                <image v-else
                  class="slide-image slide-image--main" :class="{ 'is-loaded': currentLoaded }"
                  :src="currentImage.url750" mode="widthFix" @load="currentLoaded = true" />
                <view v-if="!currentLoaded" class="hd-loading">
                  <up-loading-icon size="20" color="#fff" />
                </view>
              </view>
            </movable-view>
          </movable-area>
        </view>

        <!-- 下一张 -->
        <view class="slide" :style="{ width: screenWidth + 'px' }">
          <view v-if="nextImage.url750" class="slide-img-wrap">
            <image class="slide-image slide-image--blur" :src="nextImage.urlTiny" mode="widthFix" />
            <image class="slide-image slide-image--main" :class="{ 'is-loaded': nextLoaded }"
              :src="nextImage.url750" mode="widthFix" @load="nextLoaded = true" />
          </view>
        </view>
      </view>
    </view>

    <section class="bottom-info">
      <div class="flex-center">
        <up-button @click="loadHDimage()" shape="circle" type="primary"
         v-if="!lookIdStatus"
          customStyle="width:188rpx;height:64rpx;margin:0;font-size:24rpx;color: #babab6;border-color:rgba(255, 255, 255, 0.27);background:rgba(34, 34, 34, 0.8);">
          查看高清图
        </up-button>
      </div>

      <!-- 缩略图导航条 -->
      <view class="thumb-strip">
        <view
          class="thumb-viewport"
          @touchstart.stop="onThumbTouchStart"
          @touchmove.stop="onThumbTouchMove"
          @touchend.stop="onThumbTouchEnd"
        >
          <!-- 固定在中央的选中指示框，用 JS 定位确保和缩略图对齐 -->
          <view class="thumb-gate" :style="{ left: (screenWidth / 2 - 22) + 'px' }"></view>
          <view
            class="thumb-list"
            :style="{
              transform: `translate3d(${thumbOffset}px, 0, 0)`,
              transition: isThumbDragging ? 'none' : isThumbCoasting ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.3s ease'
            }"
          >
            <view
              v-for="(item, idx) in originList"
              :key="idx"
              class="thumb-item"
              :class="{ 'thumb-item--active': idx === originIndex }"
              @tap="onThumbTap(idx)"
            >
              <image
                class="thumb-img"
                :src="item + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'"
                mode="aspectFill"
                lazy-load
              />
            </view>
          </view>
        </view>
        <view class="title">
          {{ originIndex + 1 }}
          <text class="c9">/{{ originList.length }}(总{{ album_total }})</text>
        </view>
      </view>

      <section class="section-btns flex-between-center u-pr-30">
        <view class=""></view>
        <view class="flex-row">
          <up-button @click="openShare()" type="primary" icon="share"
            customStyle="width:70rpx;height:120rpx;margin:0;background-color:transparent;">
            分享
          </up-button>
          <up-button @click="downloadPicture()" type="primary" icon="download"
            customStyle="width:70rpx;height:120rpx;margin:0;background-color:transparent;">
            下载
          </up-button>
        </view>
      </section>
    </section>

    <!-- loading -->
    <view v-if="isloading" class="loading">
      <up-loading-page bg-color="#e8e8e8" :loading="isloading" loading-text="加载中..." style="background-color:rgba(0,0,0,.3)" />
    </view>

    <SharePoster ref="refSharePoster" />
  </view>
</template>

<script setup>
import SharePoster from "./SharePoster.vue"
import request from "@/utils/request.js"
import {
  ref,
  watch,
  computed,
  nextTick
} from 'vue';
import { useStore } from "vuex";
const store = useStore();

const album_total = computed(() => store.state.album_total);
const album_data = computed(() => store.state.album_data);
const album_info = computed(() => store.state.album_info);

function addViewCount() {
  const eventId = album_info.value?.event_id
  if (eventId) {
    request.post(`/image-service/albums/view/increment?event_id=${eventId}`)
  }
}

const props = defineProps({
  originList: {
    type: Array,
    default: []
  },
  originIndex: {
    type: [Number, String],
    default: 0
  }
})

const emits = defineEmits(['loadingMore', 'close'])

// ==================== 基础状态 ====================
const originList = ref([])
const originIndex = ref(0)
const originIndexArr = ref([0])
const isloading = ref(false)
const isAlbumComplete = ref(false)
// ==========查看高清图状态 ========
const lookIdStatus = ref(false)
// ==========blur-up 加载状态 ========
const prevLoaded = ref(false)
const currentLoaded = ref(false)
const nextLoaded = ref(false)
// ==========缩略图导航条 ========
const THUMB_W = 40     // 缩略图宽度(px)
const THUMB_GAP = 4    // 缩略图间距(px)
const THUMB_STEP = THUMB_W + THUMB_GAP // 44, 每张缩略图占位
const thumbOffset = ref(0) // 缩略图列表的 translateX
const isThumbDragging = ref(false)
const isThumbCoasting = ref(false) // 惯性滑动中
const thumbTouchStartX = ref(0)
const thumbStartOffset = ref(0)
const thumbLastX = ref(0)
const thumbLastTime = ref(0)
const thumbVelocity = ref(0)
// ==================== 屏幕宽度 ====================
const screenWidth = ref(375)
function updateScreenWidth() {
  try {
    const sysInfo = uni.getSystemInfoSync()
    screenWidth.value = sysInfo.screenWidth || sysInfo.windowWidth || 375
  } catch (e) {
    screenWidth.value = 375
  }
}
updateScreenWidth()

// ==================== 缩放状态 ====================
const scaleValue = ref(1)
const currentScaleValue = ref(1)
const moveX = ref(0)
const moveY = ref(0)
const isZoomed = computed(() => currentScaleValue.value > 1.05)

// ==================== 滑动状态 ====================
const translateX = ref(-screenWidth.value) // 初始位置：显示中间那张
const isAnimating = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const touchCurrentX = ref(0)
const lastTapTime = ref(0)
const isSwiping = ref(false)
const touchCount = ref(0)
// ==========下滑关闭 ========
const isPullingDown = ref(false)
const pullDownY = ref(0)
const pullDownOpacity = ref(1)

// ==================== 图片数据 ====================
function getImageData(index) {
  const url = originList.value[index] || ''
  if (!url) return { url: '', url750: '', urlTiny: '', urlThumb: '', height: '500rpx' }

  // url250 和详情页网格用同一个 URL，直接命中缓存
  const url250 = url + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'
  return {
    url: url,
    url750: url + '?x-oss-process=image/resize,w_750/quality,q_80/format,webp',
    urlTiny: url250,
    height: getPhotoHeight(url)
  }
}

const prevImage = computed(() => {
  if (originIndex.value <= 0) return { url: '', url750: '', height: '500rpx' }
  return getImageData(originIndex.value - 1)
})

const currentImage = computed(() => getImageData(originIndex.value))

const nextImage = computed(() => {
  if (originIndex.value >= originList.value.length - 1) return { url: '', url750: '', height: '500rpx' }
  return getImageData(originIndex.value + 1)
})


// ==================== 数据初始化 ====================
watch(
  () => album_data.value,
  (val) => {
    console.log("album_data变化===", val.length);
    originList.value = val;
    originIndex.value = props.originIndex;
    isloading.value = false;
    originIndexArr.value[0] = originIndex.value;
    // 重置位置
    translateX.value = -screenWidth.value
    // 首次进入时定位缩略图条到当前图片
    updateThumbScroll()
  },
  { immediate: true }
);

// ==================== 缩放状态自动重置 ====================
// 当 originIndex 变化时，自动重置缩放状态
// 问题：原生组件状态与 Vue 响应式系统不同步
// 解决：1. 强制触发位置更新（先设非零值再设回0）
//       2. 使用独立 key 强制重建 movable-area
watch(
  () => originIndex.value,
  () => {
    // 缩略图条自动居中
    updateThumbScroll()
  }
);

function resetMovable() {
  scaleValue.value = 1
  currentScaleValue.value = 1
  // 先设非零值强制 Vue 检测到变化，再归零
  moveX.value = 0.01
  moveY.value = 0.01
  nextTick(() => {
    moveX.value = 0
    moveY.value = 0
  })
}

// ==================== 手势处理 ====================
function onTouchStart(e) {
  touchCount.value = e.touches.length

  // 多指触摸或缩放状态，不处理滑动
  if (touchCount.value > 1 || isZoomed.value) {
    isSwiping.value = false
    return
  }

  // 如果正在动画中，不响应
  if (isAnimating.value) return

  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchCurrentX.value = e.touches[0].clientX
  touchStartTime.value = Date.now()
  isSwiping.value = true
}

function onTouchMove(e) {
  // 多指触摸或缩放状态，不处理
  if (e.touches.length > 1 || isZoomed.value) {
    return
  }

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value

  // 已经进入下拉模式，跟手
  if (isPullingDown.value) {
    const dy = Math.max(0, deltaY)
    pullDownY.value = dy
    pullDownOpacity.value = Math.max(0.3, 1 - dy / 400)
    return
  }

  // 尚未确定方向
  if (!isSwiping.value && !isPullingDown.value) return

  // 首次判断方向
  if (isSwiping.value && Math.abs(deltaX) < Math.abs(deltaY) && Math.abs(deltaY) > 10) {
    if (deltaY > 0) {
      // 下滑 → 进入下拉关闭模式
      isSwiping.value = false
      isPullingDown.value = true
      pullDownY.value = deltaY
      pullDownOpacity.value = Math.max(0.3, 1 - deltaY / 400)
    } else {
      // 上滑，忽略
      isSwiping.value = false
    }
    return
  }

  touchCurrentX.value = currentX

  // 水平滑动：切换图片
  let newTranslateX = -screenWidth.value + deltaX

  const isFirstImage = originIndex.value <= 0
  const isLastImage = originIndex.value >= originList.value.length - 1

  if (isFirstImage && deltaX > 0) {
    newTranslateX = -screenWidth.value + deltaX * 0.3
  } else if (isLastImage && deltaX < 0) {
    newTranslateX = -screenWidth.value + deltaX * 0.3
  }

  translateX.value = newTranslateX
}

function onTouchEnd(e) {
  const now = Date.now()

  // 下拉关闭判断
  if (isPullingDown.value) {
    isPullingDown.value = false
    if (pullDownY.value > 120) {
      emits('close')
    } else {
      pullDownY.value = 0
      pullDownOpacity.value = 1
    }
    return
  }

  // 检测双击（仅在非滑动时）
  const deltaX = touchCurrentX.value - touchStartX.value
  if (Math.abs(deltaX) < 10 && now - lastTapTime.value < 300 && touchCount.value === 1) {
    onDoubleTap()
    lastTapTime.value = 0
    isSwiping.value = false
    return
  }
  lastTapTime.value = now

  // 缩放状态或非滑动状态，不处理
  if (isZoomed.value || !isSwiping.value) {
    isSwiping.value = false
    return
  }

  isSwiping.value = false

  const duration = now - touchStartTime.value
  const velocity = deltaX / duration // px/ms

  // 判断是否切换
  const threshold = screenWidth.value * 0.2 // 滑动超过20%
  const velocityThreshold = 0.3 // 速度阈值

  const shouldGoNext = (deltaX < -threshold || velocity < -velocityThreshold) && originIndex.value < originList.value.length - 1
  const shouldGoPrev = (deltaX > threshold || velocity > velocityThreshold) && originIndex.value > 0

  if (shouldGoNext) {
    lookIdStatus.value = false
    goToNext()
  } else if (shouldGoPrev) {
    lookIdStatus.value = false
    goToPrev()
  } else {
    // 回弹到原位
    snapBack()
  }
}

// ==================== 双击缩放 ====================
function onDoubleTap() {
  if (currentScaleValue.value > 1.05) {
    scaleValue.value = 1
    moveX.value = 0
    moveY.value = 0
  } else {
    scaleValue.value = 2
  }
}

function onScale(e) {
  currentScaleValue.value = e.detail.scale
  // 缩放回正常大小时，自动归位
  if (e.detail.scale <= 1.05 && (moveX.value !== 0 || moveY.value !== 0)) {
    moveX.value = 0
    moveY.value = 0
  }
}

function onMoveChange(e) {
  moveX.value = e.detail.x
  moveY.value = e.detail.y
}

// ==================== 图片切换 ====================
function goToPrev() {
  if (originIndex.value <= 0) {
    snapBack()
    return
  }

  isAnimating.value = true
  translateX.value = 0

  setTimeout(() => {
    isAnimating.value = false
    resetMovable()
    // 向前切：旧 prev 已加载 → 新 current，旧 current → 新 next
    nextLoaded.value = currentLoaded.value
    currentLoaded.value = prevLoaded.value
    prevLoaded.value = false
    originIndex.value--
    originIndexArr.value[0] = originIndex.value
    translateX.value = -screenWidth.value
    addViewCount()
  }, 300)
}

function goToNext() {
  const totalCount = Number(album_total.value) || 0
  const isAllLoaded = totalCount === 0 || originList.value.length >= totalCount

  if (originIndex.value >= originList.value.length - 1) {
    if (isAllLoaded) {
      if (!isAlbumComplete.value) {
        isAlbumComplete.value = true
        uni.showModal({
          title: '提示',
          content: '当前相册已经全部浏览完成',
          showCancel: false,
          confirmText: '知道了'
        })
      }
      snapBack()
      return
    } else {
      if (!isloading.value) {
        emits('loadingMore', originIndex.value + 1)
        isloading.value = true
      }
      snapBack()
      return
    }
  }

  // 预加载
  if (originIndex.value + 6 > originList.value.length && !isAllLoaded && !isloading.value) {
    emits('loadingMore', originIndex.value + 1)
    isloading.value = true
  }

  isAnimating.value = true
  translateX.value = -screenWidth.value * 2

  setTimeout(() => {
    isAnimating.value = false
    resetMovable()
    // 向后切：旧 next 已加载 → 新 current，旧 current → 新 prev
    prevLoaded.value = currentLoaded.value
    currentLoaded.value = nextLoaded.value
    nextLoaded.value = false
    originIndex.value++
    originIndexArr.value[0] = originIndex.value
    translateX.value = -screenWidth.value
    addViewCount()
  }, 300)
}

function snapBack() {
  isAnimating.value = true
  translateX.value = -screenWidth.value
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

// ==================== 缩略图导航 ====================
// item N 的中心 = thumbOffset + N * THUMB_STEP + THUMB_W / 2

function offsetForIndex(idx) {
  return screenWidth.value / 2 - idx * THUMB_STEP - THUMB_W / 2
}

function indexAtCenter() {
  const raw = (screenWidth.value / 2 - thumbOffset.value - THUMB_W / 2) / THUMB_STEP
  return Math.max(0, Math.min(originList.value.length - 1, Math.round(raw)))
}

function clampOffset(val) {
  const maxOff = offsetForIndex(0)
  const minOff = offsetForIndex(originList.value.length - 1)
  return Math.max(minOff, Math.min(maxOff, val))
}

function updateThumbScroll() {
  thumbOffset.value = clampOffset(offsetForIndex(originIndex.value))
}

function switchToIndex(idx) {
  if (idx < 0 || idx >= originList.value.length || idx === originIndex.value) return
  resetMovable()
  prevLoaded.value = false
  currentLoaded.value = false
  nextLoaded.value = false
  originIndex.value = idx
  originIndexArr.value[0] = idx
  translateX.value = -screenWidth.value
  lookIdStatus.value = false
}

function triggerLoadIfNeeded() {
  const totalCount = Number(album_total.value) || 0
  const isAllLoaded = totalCount === 0 || originList.value.length >= totalCount
  if (originIndex.value + 6 > originList.value.length && !isAllLoaded && !isloading.value) {
    emits('loadingMore', originIndex.value)
    isloading.value = true
  }
}

function onThumbTap(idx) {
  switchToIndex(idx)
  addViewCount()
  triggerLoadIfNeeded()
}

function onThumbTouchStart(e) {
  isThumbDragging.value = true
  isThumbCoasting.value = false
  const x = e.touches[0].clientX
  thumbTouchStartX.value = x
  thumbStartOffset.value = thumbOffset.value
  thumbLastX.value = x
  thumbLastTime.value = Date.now()
  thumbVelocity.value = 0
}

function onThumbTouchMove(e) {
  if (!isThumbDragging.value) return
  const x = e.touches[0].clientX
  const now = Date.now()
  const dt = now - thumbLastTime.value
  if (dt > 0) {
    thumbVelocity.value = (x - thumbLastX.value) / dt // px/ms
  }
  thumbLastX.value = x
  thumbLastTime.value = now

  const deltaX = x - thumbTouchStartX.value
  thumbOffset.value = clampOffset(thumbStartOffset.value + deltaX)

  const idx = indexAtCenter()
  switchToIndex(idx)
}

function onThumbTouchEnd(e) {
  if (!isThumbDragging.value) return
  isThumbDragging.value = false

  const endX = e.changedTouches[0].clientX
  const moved = Math.abs(endX - thumbTouchStartX.value)

  if (moved < 5) {
    const idx = Math.floor((endX - thumbOffset.value) / THUMB_STEP)
    const clampedIdx = Math.max(0, Math.min(originList.value.length - 1, idx))
    switchToIndex(clampedIdx)
    thumbOffset.value = clampOffset(offsetForIndex(originIndex.value))
    addViewCount()
    triggerLoadIfNeeded()
    return
  }

  // 惯性滑动：根据松手速度继续滑动
  const v = thumbVelocity.value
  const coast = v * 300 // 惯性距离
  const targetOffset = clampOffset(thumbOffset.value + coast)
  // 算出惯性终点处的 index，吸附到它
  const tempOffset = targetOffset
  const rawIdx = (screenWidth.value / 2 - tempOffset - THUMB_W / 2) / THUMB_STEP
  const targetIdx = Math.max(0, Math.min(originList.value.length - 1, Math.round(rawIdx)))
  const finalOffset = clampOffset(offsetForIndex(targetIdx))

  isThumbCoasting.value = true
  thumbOffset.value = finalOffset
  switchToIndex(targetIdx)

  setTimeout(() => {
    isThumbCoasting.value = false
    addViewCount()
    triggerLoadIfNeeded()
  }, 400)
}

// ==================== 工具函数 ====================
function getPhotoHeight(url, targetWidth = 750) {
  const filename = url.substring(url.lastIndexOf('/') + 1);
  const widthMatch = filename.match(/_w(\d+)/);
  const heightMatch = filename.match(/_h(\d+)/);

  if (!widthMatch || !heightMatch) {
    return '500rpx';
  }

  const originalWidth = parseInt(widthMatch[1], 10);
  const originalHeight = parseInt(heightMatch[1], 10);
  const ratio = originalHeight / originalWidth;
  const newHeight = Math.round(targetWidth * ratio);

  return newHeight + 'rpx';
}

// ==================== 功能按钮 ====================
const refSharePoster = ref(null)

function openShare() {
  refSharePoster.value.open(currentImage.value.url)
}

// 加载高清图
function loadHDimage() {
  lookIdStatus.value = true
  // uni.previewImage({
  //   urls: originList.value,
  //   current: originList.value[originIndex.value],
  // })
}

function downloadPicture() {
  const imageUrl = currentImage.value.url;

  if (!imageUrl) {
    uni.showToast({ title: '获取图片失败', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '下载中...' });

  uni.downloadFile({
    url: imageUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading();
            uni.showToast({ title: '保存成功', icon: 'success' });
          },
          fail: (err) => {
            uni.hideLoading();
            if (err.errMsg?.includes('auth deny')) {
              uni.showToast({ title: '请授权相册权限', icon: 'none' });
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({ title: '下载失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '下载失败', icon: 'none' });
    }
  });
}

defineExpose({
  originIndex,
  originList,
});
</script>

<style lang="scss" scoped>
.SwiperSection {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

.slides-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slides-track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.slide {
  flex: none;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slide-img-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

.slide-image--blur {
  // 使用详情页缓存的 w_250 图，无需模糊
}

.slide-image--main {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.slide-image--main.is-loaded {
  opacity: 1;
}

.hd-loading {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 12rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.movable-area {
  width: 100%;
  height: 100%;
}

.movable-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.bottom-info {
  position: fixed;
  width: 100%;
  bottom: 10rpx;
  left: 0;
  z-index: 100;
}

.thumb-strip {
  padding: 0 0 8rpx;
  margin-top: 24rpx;
}

.thumb-viewport {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;
}

.thumb-gate {
  position: absolute;
  top: 2px;
  width: 44px;
  height: 44px;
  border: 2px solid #fff;
  border-radius: 4px;
  box-sizing: border-box;
  z-index: 2;
  pointer-events: none;
}

.thumb-list {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 48px;
  will-change: transform;
}

.thumb-item {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  opacity: 0.8;
  transition: opacity 0.15s ease;
}

.thumb-item--active {
  opacity: 1;
}

.thumb-img {
  width: 100%;
  height: 100%;
}
</style>
