<template>
  <view class="SwiperSection" :style="{
    transform: `translateY(${pullDownY}px)`,
    opacity: pullDownOpacity,
    transition: isPullingDown ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
  }">

    <!-- 三图滑动模式：实现跟手滑动效果 -->
    <view
      class="slides-container"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
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
          <!-- 视频模式：不包 zoom-container，小程序原生 video 不支持父级 CSS transform -->
          <view v-if="currentImage.isVideo" class="slide-img-wrap">
            <video class="slide-video"
              id="preview-video"
              :src="currentImage.url"
              :poster="currentImage.url750"
              :controls="true"
              :show-center-play-btn="true"
              object-fit="contain"
              @play="isVideoPlaying = true"
              @pause="isVideoPlaying = false"
              @ended="isVideoPlaying = false"
              @fullscreenchange="e => isVideoFullscreen = e.detail.fullScreen"
            />
          </view>
          <!-- 图片模式：用 zoom-container 支持缩放 -->
          <view v-else class="zoom-container" :style="{
            transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})`,
            transition: isZoomAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
          }">
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
          </view>
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

    <section class="bottom-info" v-show="!isVideoFullscreen">
      <div class="flex-center">
        <up-button @click="loadHDimage()" shape="circle" type="primary"
         v-if="!lookIdStatus && mediaType === 'photo'"
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
              transition: isThumbDragging ? 'none' : isThumbCoasting ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.3s ease'
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
                :src="mediaType === 'video'
                  ? item + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'
                  : item + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'"
                mode="aspectFill"
                lazy-load
              />
            </view>
          </view>
        </view>
        <view class="title">
          {{ originIndex + 1 }}
          <text class="c9"> / {{ album_total || originList.length }}</text>
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
  onMounted
} from 'vue';
import { useStore } from "vuex";
const store = useStore();

const album_total = computed(() => store.state.album_total);
const album_data = computed(() => store.state.album_data);
const album_info = computed(() => store.state.album_info);
const album_all_urls = computed(() => store.state.album_all_urls);

// 打开时快照：全量 URL 已就绪则锁定为全量模式，之后不再跟分页数据变动
const allUrlsSnapshot = album_all_urls.value?.photo || album_all_urls.value || []
const useAllUrls = ref(Array.isArray(allUrlsSnapshot) && allUrlsSnapshot.length > 0)

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
  },
  mediaType: {
    type: String,
    default: 'photo' // 'photo' | 'video'
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
// ==========视频播放状态 ========
const isVideoPlaying = ref(false)
const isVideoFullscreen = ref(false)
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
// ==================== 屏幕尺寸 ====================
const screenWidth = ref(375)
const screenHeight = ref(667)
function updateScreenSize() {
  try {
    const sysInfo = uni.getSystemInfoSync()
    screenWidth.value = sysInfo.screenWidth || sysInfo.windowWidth || 375
    screenHeight.value = sysInfo.screenHeight || sysInfo.windowHeight || 667
  } catch (e) {
    screenWidth.value = 375
    screenHeight.value = 667
  }
}
updateScreenSize()

// ==================== 缩放状态（CSS transform 驱动） ====================
const zoomScale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isZoomAnimating = ref(false)
const isZoomed = computed(() => zoomScale.value > 1.05)

// ==================== 手势状态机 ====================
// 'none' | 'swipe' | 'pinch' | 'pan' | 'pulldown'
const gestureMode = ref('none')
const pinchStartDist = ref(0)
const pinchStartScale = ref(1)
const pinchStartPanX = ref(0)
const pinchStartPanY = ref(0)
const pinchStartMid = ref({ x: 0, y: 0 })
let lastPanDeltaX = 0
let lastPanDeltaY = 0

// ==================== 滑动状态 ====================
const translateX = ref(-screenWidth.value) // 初始位置：显示中间那张
const isAnimating = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const touchCurrentX = ref(0)
const lastTapTime = ref(0)
const touchCount = ref(0)
// ==========下滑关闭 ========
const isPullingDown = ref(false)
const pullDownY = ref(0)
const pullDownOpacity = ref(1)

// ==================== 图片数据 ====================
function getImageData(index) {
  const url = originList.value[index] || ''
  if (!url) return { url: '', url750: '', urlTiny: '', isVideo: false, height: '500rpx' }

  if (props.mediaType === 'video') {
    // 视频：复用详情页网格的截图 URL 命中缓存
    const snapshot = url + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'
    return {
      url: url,
      url750: snapshot,
      urlTiny: snapshot,
      isVideo: true,
      height: '500rpx'
    }
  }

  // 图片：url250 和详情页网格用同一个 URL，直接命中缓存
  const url250 = url + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'
  return {
    url: url,
    url750: url + '?x-oss-process=image/resize,w_750/quality,q_80/format,webp',
    urlTiny: url250,
    isVideo: false,
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
    if (useAllUrls.value) return // 全量模式不跟分页数据变动
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

// 全量模式：mount 时用全量 URL 初始化 originList，一次性滑完整个相册
onMounted(() => {
  if (!useAllUrls.value) return
  const urls = album_all_urls.value?.photo || album_all_urls.value || []
  if (!Array.isArray(urls) || urls.length === 0) {
    useAllUrls.value = false
    return
  }
  originList.value = urls
  originIndex.value = Number(props.originIndex) || 0
  isloading.value = false
  originIndexArr.value[0] = originIndex.value
  translateX.value = -screenWidth.value
  updateThumbScroll()
});

// ==================== originIndex watch ====================
watch(
  () => originIndex.value,
  () => {
    updateThumbScroll()
  }
);

// ==================== 缩放重置 ====================
function resetMovable() {
  zoomScale.value = 1
  panX.value = 0
  panY.value = 0
  isZoomAnimating.value = false
  gestureMode.value = 'none'
}

// ==================== 缩放辅助函数 ====================
function getTouchDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function getTouchMidpoint(t1, t2) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2
  }
}

function clampVal(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function getDisplayHeight() {
  const url = currentImage.value.url || currentImage.value.url750 || ''
  const filename = url.substring(url.lastIndexOf('/') + 1)
  const wMatch = filename.match(/_w(\d+)/)
  const hMatch = filename.match(/_h(\d+)/)
  if (!wMatch || !hMatch) return screenWidth.value
  const ratio = parseInt(hMatch[1]) / parseInt(wMatch[1])
  return screenWidth.value * ratio
}

function maxPanX() {
  return Math.max(0, (zoomScale.value * screenWidth.value - screenWidth.value) / 2)
}

function maxPanY() {
  const imgH = getDisplayHeight()
  return Math.max(0, (zoomScale.value * imgH - screenHeight.value) / 2)
}

// ==================== 手势处理 ====================
function onTouchStart(e) {
  const touches = e.touches
  touchCount.value = touches.length

  if (isAnimating.value) return

  // 双指 → 捏合缩放
  if (touches.length === 2) {
    gestureMode.value = 'pinch'
    isZoomAnimating.value = false
    pinchStartDist.value = getTouchDistance(touches[0], touches[1])
    pinchStartScale.value = zoomScale.value
    pinchStartPanX.value = panX.value
    pinchStartPanY.value = panY.value
    pinchStartMid.value = getTouchMidpoint(touches[0], touches[1])
    return
  }

  // 单指
  touchStartX.value = touches[0].clientX
  touchStartY.value = touches[0].clientY
  touchCurrentX.value = touches[0].clientX
  touchStartTime.value = Date.now()
  lastPanDeltaX = 0
  lastPanDeltaY = 0
  if (gestureMode.value !== 'pinch') {
    gestureMode.value = 'none'
  }
}

function onTouchMove(e) {
  const touches = e.touches

  // ---- 捏合缩放 ----
  if (gestureMode.value === 'pinch') {
    if (touches.length === 2) {
      const dist = getTouchDistance(touches[0], touches[1])
      const ratio = dist / pinchStartDist.value
      const newScale = clampVal(pinchStartScale.value * ratio, 0.5, 5)
      zoomScale.value = newScale
      // 补偿平移使中点稳定
      const mid = getTouchMidpoint(touches[0], touches[1])
      panX.value = pinchStartPanX.value + (mid.x - pinchStartMid.value.x)
      panY.value = pinchStartPanY.value + (mid.y - pinchStartMid.value.y)
    }
    return
  }

  const currentX = touches[0].clientX
  const currentY = touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value

  // ---- 已锁定的手势 ----
  if (gestureMode.value === 'pulldown') {
    pullDownY.value = Math.max(0, deltaY)
    pullDownOpacity.value = Math.max(0.3, 1 - Math.max(0, deltaY) / 400)
    return
  }

  if (gestureMode.value === 'pan') {
    const dx = deltaX - lastPanDeltaX
    const dy = deltaY - lastPanDeltaY
    lastPanDeltaX = deltaX
    lastPanDeltaY = deltaY
    panX.value = clampVal(panX.value + dx, -maxPanX(), maxPanX())
    panY.value = clampVal(panY.value + dy, -maxPanY(), maxPanY())
    return
  }

  if (gestureMode.value === 'swipe') {
    touchCurrentX.value = currentX
    let newTranslateX = -screenWidth.value + deltaX
    const isFirst = originIndex.value <= 0
    const isLast = originIndex.value >= originList.value.length - 1
    if (isFirst && deltaX > 0) newTranslateX = -screenWidth.value + deltaX * 0.3
    else if (isLast && deltaX < 0) newTranslateX = -screenWidth.value + deltaX * 0.3
    translateX.value = newTranslateX
    return
  }

  // ---- 首次判断方向（前 10px） ----
  const absDX = Math.abs(deltaX)
  const absDY = Math.abs(deltaY)
  if (absDX < 10 && absDY < 10) return

  if (isZoomed.value) {
    // 缩放状态下的手势判断
    if (absDX > absDY) {
      // 水平：检查是否到边界
      const atLeft = panX.value >= maxPanX() - 1
      const atRight = panX.value <= -maxPanX() + 1
      if ((deltaX > 0 && atLeft) || (deltaX < 0 && atRight)) {
        gestureMode.value = 'swipe'
        touchCurrentX.value = currentX
      } else {
        gestureMode.value = 'pan'
        lastPanDeltaX = deltaX
        lastPanDeltaY = deltaY
      }
    } else {
      gestureMode.value = 'pan'
      lastPanDeltaX = deltaX
      lastPanDeltaY = deltaY
    }
  } else {
    // 未缩放
    if (absDX > absDY) {
      gestureMode.value = 'swipe'
      touchCurrentX.value = currentX
    } else if (deltaY > 0) {
      gestureMode.value = 'pulldown'
      isPullingDown.value = true
      pullDownY.value = deltaY
      pullDownOpacity.value = Math.max(0.3, 1 - deltaY / 400)
    }
  }
}

function onTouchEnd(e) {
  const now = Date.now()

  // ---- 捏合结束 ----
  if (gestureMode.value === 'pinch') {
    if (zoomScale.value < 1) {
      isZoomAnimating.value = true
      zoomScale.value = 1
      panX.value = 0
      panY.value = 0
      setTimeout(() => { isZoomAnimating.value = false }, 300)
    } else if (zoomScale.value > 4) {
      isZoomAnimating.value = true
      zoomScale.value = 4
      setTimeout(() => { isZoomAnimating.value = false }, 300)
    } else {
      // 限制平移不超出边界
      const mx = maxPanX(), my = maxPanY()
      if (Math.abs(panX.value) > mx || Math.abs(panY.value) > my) {
        isZoomAnimating.value = true
        panX.value = clampVal(panX.value, -mx, mx)
        panY.value = clampVal(panY.value, -my, my)
        setTimeout(() => { isZoomAnimating.value = false }, 300)
      }
    }
    gestureMode.value = 'none'
    return
  }

  // ---- 下拉关闭 ----
  if (gestureMode.value === 'pulldown') {
    isPullingDown.value = false
    if (pullDownY.value > 120) {
      emits('close')
    } else {
      pullDownY.value = 0
      pullDownOpacity.value = 1
    }
    gestureMode.value = 'none'
    return
  }

  // ---- 双击检测 ----
  const deltaX = touchCurrentX.value - touchStartX.value
  if (gestureMode.value === 'none' && Math.abs(deltaX) < 10 && now - lastTapTime.value < 300 && touchCount.value === 1) {
    onDoubleTap()
    lastTapTime.value = 0
    gestureMode.value = 'none'
    return
  }
  lastTapTime.value = now

  // ---- 平移结束 ----
  if (gestureMode.value === 'pan') {
    const mx = maxPanX(), my = maxPanY()
    if (Math.abs(panX.value) > mx || Math.abs(panY.value) > my) {
      isZoomAnimating.value = true
      panX.value = clampVal(panX.value, -mx, mx)
      panY.value = clampVal(panY.value, -my, my)
      setTimeout(() => { isZoomAnimating.value = false }, 300)
    }
    gestureMode.value = 'none'
    return
  }

  // ---- 滑动切换 ----
  if (gestureMode.value === 'swipe') {
    const duration = now - touchStartTime.value
    const velocity = deltaX / duration
    const threshold = screenWidth.value * 0.2
    const velocityThreshold = 0.3

    const shouldGoNext = (deltaX < -threshold || velocity < -velocityThreshold) && originIndex.value < originList.value.length - 1
    const shouldGoPrev = (deltaX > threshold || velocity > velocityThreshold) && originIndex.value > 0

    if (shouldGoNext) {
      lookIdStatus.value = false
      goToNext()
    } else if (shouldGoPrev) {
      lookIdStatus.value = false
      goToPrev()
    } else {
      snapBack()
    }
    gestureMode.value = 'none'
    return
  }

  gestureMode.value = 'none'
}

// ==================== 双击缩放 ====================
function onDoubleTap() {
  isZoomAnimating.value = true
  if (zoomScale.value > 1.05) {
    zoomScale.value = 1
    panX.value = 0
    panY.value = 0
  } else {
    // 以点击位置为中心放大到 2x
    const tapX = touchStartX.value
    const tapY = touchStartY.value
    const centerX = screenWidth.value / 2
    const centerY = screenHeight.value / 2
    zoomScale.value = 2
    panX.value = (centerX - tapX)
    panY.value = (centerY - tapY)
  }
  setTimeout(() => { isZoomAnimating.value = false }, 300)
}

// ==================== 图片切换 ====================
function pauseVideoIfPlaying() {
  if (isVideoPlaying.value) {
    try { uni.createVideoContext('preview-video').pause() } catch(e) {}
    isVideoPlaying.value = false
  }
}

function goToPrev() {
  if (originIndex.value <= 0) {
    snapBack()
    return
  }
  pauseVideoIfPlaying()

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
  pauseVideoIfPlaying()
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
  isVideoPlaying.value = false
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
  const coast = v * 600 // 惯性距离
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
  }, 600)
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
  const allUrls = album_all_urls.value?.photo || album_all_urls.value || []
  const currentUrl = originList.value[originIndex.value]

  // 优先用全量 URL：根据当前图在全量中定位下标
  if (Array.isArray(allUrls) && allUrls.length > 0 && currentUrl) {
    const fullIndex = allUrls.indexOf(currentUrl)
    if (fullIndex !== -1) {
      uni.previewImage({
        urls: allUrls,
        current: allUrls[fullIndex],
      })
      return
    }
  }

  // 降级：全量未就绪或找不到时，用当前已加载的 originList
  uni.previewImage({
    urls: originList.value,
    current: currentUrl,
  })
}

function downloadPicture() {
  const mediaUrl = currentImage.value.url;

  if (!mediaUrl) {
    uni.showToast({ title: '获取失败', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '下载中...' });

  uni.downloadFile({
    url: mediaUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        const saveMethod = currentImage.value.isVideo
          ? uni.saveVideoToPhotosAlbum
          : uni.saveImageToPhotosAlbum;
        saveMethod({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading();
            uni.showToast({ title: '保存成功', icon: 'success' });
          },
          fail: (err) => {
            uni.hideLoading();
            if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
              uni.showModal({
                title: '提示',
                content: '需要您授权"保存到相册"权限，请在设置中开启',
                confirmText: '去设置',
                success: (r) => { if (r.confirm) uni.openSetting() }
              });
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
  background: #000;
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

.slide-video {
  width: 100%;
  max-height: 100vh;
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

.zoom-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  will-change: transform;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  margin-top: 20rpx;
  font-size: 26rpx;
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
