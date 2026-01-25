<template>
  <view class="SwiperSection">

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
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }"
      >
        <!-- 上一张 -->
        <view class="slide">
          <image
            v-if="prevImage.url750"
            class="slide-image"
            :src="prevImage.url750"
            mode="widthFix"
          />
        </view>

        <!-- 当前（支持缩放） -->
        <view class="slide">
          <movable-area class="movable-area" scale-area>
            <movable-view
              class="movable-view"
              direction="all"
              :inertia="true"
              :damping="50"
              :friction="2"
              :scale="true"
              :scale-min="1"
              :scale-max="4"
              :scale-value="scaleValue"
              :x="moveX"
              :y="moveY"
              @scale="onScale"
            >
              <image
                class="slide-image"
                :src="currentImage.url750"
                mode="widthFix"
              />
            </movable-view>
          </movable-area>
        </view>

        <!-- 下一张 -->
        <view class="slide">
          <image
            v-if="nextImage.url750"
            class="slide-image"
            :src="nextImage.url750"
            mode="widthFix"
          />
        </view>
      </view>
    </view>

    <section class="bottom-info">
      <div class="flex-center">
        <up-button @click="loadHDimage()" shape="circle" type="primary"
          customStyle="width:188rpx;height:64rpx;margin:0;font-size:24rpx;color: #babab6;border-color:rgba(255, 255, 255, 0.27);background:rgba(34, 34, 34, 0.8);">
          {{isSomeHDimage ? '已加载高清图' : '加载高清图'}}
        </up-button>
      </div>

      <view class="section-slider">
        <xzsliderrange v-model="originIndexArr" solo :decoration="false" @move="sliderChange" :size="30" height="2px"
          activeBgc="rgb(0, 122, 255)" :max="Number(originList.length || 0)" :min="0" :total="Number(album_total || 0)"
          hintColor="#fff" @showNum="e => isShowAmount = e" />
        <view class="title" :style="{ opacity: !isShowAmount ? 0 : 1 }">
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
import xzsliderrange from "./xz-slider-range/xz-slider-range.vue"
import SharePoster from "./SharePoster.vue"
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

const emits = defineEmits(['loadingMore'])

// ==================== 基础状态 ====================
const originList = ref([])
const originIndex = ref(0)
const originIndexArr = ref([0])
const isloading = ref(false)
const isShowAmount = ref(false)
const isAlbumComplete = ref(false)
const hdImageIndexes = ref(new Set())

// ==================== 屏幕宽度 ====================
const screenWidth = ref(375)
try {
  const sysInfo = uni.getSystemInfoSync()
  screenWidth.value = sysInfo.windowWidth || 375
} catch (e) {
  screenWidth.value = 375
}

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

// ==================== 图片数据 ====================
function getImageData(index) {
  const url = originList.value[index] || ''
  if (!url) return { url: '', url750: '', height: '500rpx' }

  const isHD = hdImageIndexes.value.has(index)
  return {
    url: url,
    url750: isHD ? url : url + '?x-oss-process=image/resize,w_750/quality,q_80/format,webp',
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

const isSomeHDimage = computed(() => hdImageIndexes.value.has(originIndex.value))

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
  },
  { immediate: true }
);

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
  // 多指触摸或缩放状态，不处理滑动
  if (e.touches.length > 1 || isZoomed.value || !isSwiping.value) {
    return
  }

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value

  // 判断是否是水平滑动
  if (Math.abs(deltaX) < Math.abs(deltaY) && Math.abs(deltaY) > 10) {
    // 垂直滑动，不处理
    isSwiping.value = false
    return
  }

  touchCurrentX.value = currentX

  // 计算位移，添加边界阻尼效果
  let newTranslateX = -screenWidth.value + deltaX

  // 边界阻尼：第一张不能右滑，最后一张不能左滑
  const isFirstImage = originIndex.value <= 0
  const isLastImage = originIndex.value >= originList.value.length - 1

  if (isFirstImage && deltaX > 0) {
    // 第一张，右滑添加阻尼
    newTranslateX = -screenWidth.value + deltaX * 0.3
  } else if (isLastImage && deltaX < 0) {
    // 最后一张，左滑添加阻尼
    newTranslateX = -screenWidth.value + deltaX * 0.3
  }

  translateX.value = newTranslateX
}

function onTouchEnd(e) {
  const now = Date.now()

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
    goToNext()
  } else if (shouldGoPrev) {
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
}

// ==================== 图片切换 ====================
function goToPrev() {
  if (originIndex.value <= 0) {
    snapBack()
    return
  }

  resetZoom()

  // 动画滑动到上一张位置
  isAnimating.value = true
  translateX.value = 0

  setTimeout(() => {
    isAnimating.value = false
    originIndex.value--
    originIndexArr.value[0] = originIndex.value
    // 重置位置（瞬间）
    translateX.value = -screenWidth.value
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

  resetZoom()

  // 动画滑动到下一张位置
  isAnimating.value = true
  translateX.value = -screenWidth.value * 2

  setTimeout(() => {
    isAnimating.value = false
    originIndex.value++
    originIndexArr.value[0] = originIndex.value
    // 重置位置（瞬间）
    translateX.value = -screenWidth.value
  }, 300)
}

function snapBack() {
  isAnimating.value = true
  translateX.value = -screenWidth.value
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

function resetZoom() {
  scaleValue.value = 1
  currentScaleValue.value = 1
  moveX.value = 0
  moveY.value = 0
}

// ==================== 滑块控制 ====================
const sliderChange = (e) => {
  if (originIndex.value === e[0]) return;

  resetZoom()
  originIndex.value = e[0];
  translateX.value = -screenWidth.value

  const totalCount = Number(album_total.value) || 0
  const isAllLoaded = totalCount === 0 || originList.value.length >= totalCount

  if (originIndex.value >= originList.value.length - 1 && isAllLoaded) {
    if (!isAlbumComplete.value) {
      isAlbumComplete.value = true
      uni.showModal({
        title: '提示',
        content: '当前相册已经全部浏览完成',
        showCancel: false,
        confirmText: '知道了'
      })
    }
    return;
  }

  if (originIndex.value + 6 > originList.value.length && !isAllLoaded && !isloading.value) {
    emits("loadingMore", originIndex.value);
    isloading.value = true;
  }
};

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

function loadHDimage() {
  hdImageIndexes.value.add(originIndex.value)
  hdImageIndexes.value = new Set(hdImageIndexes.value)
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
  background: #000;
}

.slides-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slides-track {
  display: flex;
  width: 300%;
  height: 100%;
  will-change: transform;
}

.slide {
  flex: 0 0 33.333%;
  width: 33.333%;
  height: 100%;
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
</style>
