<template>
  <view class="SwiperSection" style="width:750rpx;" @touchstart="touchStart" @touchend="touchEnd">
    
		<swiper class="swiper" circular @change="swiperChange" swiperDuration="30" :current="currentIndex" :disable-touch="disableTouch">
	  <swiper-item class="flex-center" v-for="(item, index) in displaySwiperList" :key="item.url750 || index">
				<movable-area class="movable-area" scale-area>
					<movable-view :key="item.url750 || index" class="movable-view flex-center" direction="all" :inertia="true" damping="100" scale="true" scale-min="1" scale-max="4" :scale-value="scaleValue">
						<!-- <view class="scroll-view"><image :key="index" class="image" :src="item" mode="widthFix" @longpress="onLongpress(item)" /></view> -->
						<image class="poster" :style="'height:' + item.height"
							 :src="item.url750" mode="widthFix" @load="e => isLoadedHDimage = true"/>
					</movable-view>
				</movable-area>
      </swiper-item>
    </swiper>
		
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
import scrollimageview from "./scrollimageview.vue"
import SharePoster from "./SharePoster.vue"
import {
  onMounted,
  ref,
  watch,
  nextTick,
  toRef,
	computed
} from 'vue';
import { useStore } from "vuex";
const store = useStore();

const album_total = computed(() => store.state.album_total);
const album_data = computed(() => store.state.album_data);

// 如果存在原图，按钮变更为已加载
const isSomeHDimage = computed(() => displaySwiperList.value.some(i => !i.url750.includes('?x-oss-process')))

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

const refSharePoster = ref(null)
function openShare() {
	const imageUrl = displaySwiperList.value?.[currentIndex.value].url
	refSharePoster.value.open(imageUrl)
}

// 加载高清图
const isLoadedHDimage = ref(false)
function loadHDimage() {
	displaySwiperList.value[currentIndex.value].url750 = displaySwiperList.value?.[currentIndex.value].url
}

const emits = defineEmits(['loadingMore'])

const originList = ref([]) // 源数据
const displaySwiperList = ref([]) // swiper需要的数据
const displayIndex = ref(0) // 用于显示swiper的真正的下标数值只有：0，1，2。
const originIndex = ref(0) // 记录源数据的下标
const originIndexArr = ref([1])
const currentIndex = ref(0) // 显示swiper的当前值只有：0，1，2。
const disableTouch = ref(false) // 是否阻止触摸
const isShowAmount = ref(false) // 是否阻止触摸
const isloading = ref(false) // 加载动画内容
const isShow = ref(false) // 图片数量的显示隐藏
const isAlbumComplete = ref(false) // 是否已浏览完全部图片

const isZooming = ref(false)

watch(
  () => album_data.value,
  (val) => {
    console.log("album_data变化===", val.length);
    originList.value = val;
    originIndex.value = props.originIndex;
    displayIndex.value = 0;
    currentIndex.value = 0;
    isloading.value = false;
    initSwiperData(originIndex.value);
  },
  {
    immediate: true
  }
);

function initSwiperData(originIndex) {
	if (originIndex == 0 && endDir?.value == "right") {
		disableTouch.value = true;
		return;
	} else {
		disableTouch.value = false;
	}
	const originListLength = originList.value.length; // 源数据长度
	const totalCount = Number(album_total.value) || 0
	const isAllLoaded = totalCount === 0 || originListLength >= totalCount

	let displayList = [];
	// 当前图片
	displayList[displayIndex.value] = originList.value[originIndex];
	// 前一张图片（仍然允许循环）
	displayList[displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1] =
		originList.value[
			originIndex - 1 == -1 ? originListLength - 1 : originIndex - 1
		];
	// 后一张图片（如果已是最后一张且全部加载完，用当前图片填充）
	let nextImageIndex;
	if (originIndex + 1 >= originListLength) {
		// 超出范围，用当前图片填充（防止 undefined）
		nextImageIndex = isAllLoaded ? originIndex : (originIndex + 1 < originListLength ? originIndex + 1 : originIndex);
	} else {
		nextImageIndex = originIndex + 1;
	}
	displayList[displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1] =
		originList.value[nextImageIndex];

	displaySwiperList.value = displayList.map(item => ({
		url: item,
		url750: item + '?x-oss-process=image/resize,w_750/quality,q_80/format,webp',
		height: getPhotoHeight(item)
	}));

	// 防止干扰，拖动的时候不修改originIndexArr
	if (!isShowAmount.value) {
		originIndexArr.value[0] = originIndex;
	}
};

/**
 * swiper滑动时候
 */
const scaleValue = ref(1)
const swiperChange = (event) => {
	scaleValue.value = 1
  const {
    current
  } = event.detail;
  currentIndex.value = current
  // console.log(current, 'current=====',event.detail)
  const originListLength = originList.value.length; // 源数据长度

  // =============向后==========
  if (displayIndex.value - current == 2 || displayIndex.value - current == -1) {
    // console.log('向后滑动', displayIndex.value, current)

    // 如果已经标记完成，阻止继续滑动
    if (isAlbumComplete.value) {
      nextTick(() => {
        currentIndex.value = displayIndex.value
      })
      return
    }

    // 检查下一张是否超出范围
    const nextIndex = originIndex.value + 1
    const totalCount = Number(album_total.value) || 0
    // 判断是否全部加载完成：
    // 1. totalCount > 0 且 originListLength >= totalCount：有明确的总数，且已全部加载
    // 2. totalCount == 0：没有总数信息，认为当前已加载的就是全部
    const isAllLoaded = totalCount === 0 || originListLength >= totalCount

    console.log('向后滑动检查:', {
      originIndex: originIndex.value,
      nextIndex,
      originListLength,
      album_total: album_total.value,
      totalCount,
      isAllLoaded
    })

    if (nextIndex >= originListLength) {
      // 下一张超出已加载范围
      if (isAllLoaded) {
        // 数据已全部加载，禁止继续滑动，弹出提示
        isAlbumComplete.value = true
        nextTick(() => {
          currentIndex.value = displayIndex.value
        })
        uni.showModal({
          title: '提示',
          content: '当前相册已经全部浏览完成',
          showCancel: false,
          confirmText: '知道了'
        })
        return
      } else {
        // 还有更多数据，显示 loading 等待加载
        if (!isloading.value) {
          emits('loadingMore', originIndex.value + 1)
          isloading.value = true
        }
        nextTick(() => {
          currentIndex.value = displayIndex.value
        })
        return
      }
    }

    // 预加载：当接近末尾时提前加载更多
    if (originIndex.value + 6 > originListLength && !isAllLoaded && !isloading.value) {
      emits('loadingMore', originIndex.value + 1)
      isloading.value = true
    }

    // 正常切换到下一张（不循环回第一张）
    originIndex.value = nextIndex;
    displayIndex.value = displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1;
    initSwiperData(originIndex.value);
  }
  // ======如果两者的差为-2或者1则是向前滑动============(1,0和0,2 和2,1)
  else if (displayIndex.value - current == -2 || displayIndex.value - current == 1) {
    // console.log('向前面==滑动', displayIndex.value, current)
    originIndex.value = originIndex.value - 1 == -1 ? originListLength - 1 : originIndex.value - 1;
    displayIndex.value = displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1;
    initSwiperData(originIndex.value);
  }
  originIndexArr.value[0] = originIndex.value
}
const moveTimer = ref('')
const sliderChange = (e) => {
  // console.log("sliderChange===", e);

  if (originIndex.value == e[0]) return;
  originIndex.value = e[0];

  const totalCount = Number(album_total.value) || 0
  const isAllLoaded = totalCount === 0 || originList.value.length >= totalCount

  // 检查是否到达最后一张
  if (originIndex.value >= originList.value.length - 1 && isAllLoaded) {
    isAlbumComplete.value = true
    uni.showModal({
      title: '提示',
      content: '当前相册已经全部浏览完成',
      showCancel: false,
      confirmText: '知道了'
    })
    initSwiperData(originIndex.value);
    return;
  }

  // 预加载：只在还有更多数据时触发
  if (originIndex.value + 6 > originList.value.length && !isAllLoaded && !isloading.value) {
    emits("loadingMore", originIndex.value);
    isloading.value = true;
    return;
  }

  initSwiperData(originIndex.value);
};


function getPhotoHeight(url, targetWidth = 750) {
  // 1. 提取文件名（不含查询参数）
  const filename = url.substring(url.lastIndexOf('/') + 1);

  // 2. 使用正则匹配 w数字 和 h数字
  const widthMatch = filename.match(/_w(\d+)/);
  const heightMatch = filename.match(/_h(\d+)/);

  if (!widthMatch || !heightMatch) {
    console.warn('无法从 URL 中提取宽高信息');
    return null;
  }

  const originalWidth = parseInt(widthMatch[1], 10);
  const originalHeight = parseInt(heightMatch[1], 10);

  // 3. 计算等比缩放后的高度
  const ratio = originalHeight / originalWidth;
  const newHeight = Math.round(targetWidth * ratio);

  return newHeight + 'rpx';
}

const startTime = ref(0)
const startPosition = ref(0)
const endPosition = ref(0)
const endDir = ref('')
// 起点
const touchStart = (event) => {
  startTime.value = Date.now()
  startPosition.value = event.changedTouches[0].clientX
	
	isZooming.value = true
}
// 终点,计算移动距离
const touchEnd = (event) => {
	isZooming.value = false
	
  const endTime = Date.now()
  if (endTime - startTime.value > 2000) {
    return;
  }
  endPosition.value = event.changedTouches[0].clientX
	

  //当移动距离超过10时判断左滑右滑。
  if (Math.abs(endPosition.value - startPosition.value) > 10) {
    endPosition.value = event.changedTouches[0].clientX
    endDir.value = endPosition.value - startPosition.value > 0 ? "right" : "left"

    if (endDir.value == 'left') {
      // console.log("wos==")
      disableTouch.value = false
      if (originIndex.value == 0) {
        // currentIndex.value = 1
        originIndex.value = 1
        initSwiperData(originIndex.value);
      }
    }
  } else {
    return;
  }

  // console.log(endDir.value)
}

function downloadPicture() {
	const imageUrl = displaySwiperList.value?.[currentIndex.value].url;
	
	console.log("imageUrl====>", imageUrl)

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
	.poster{
		position: relative;
		display: block;
		width:750rpx;
		background: center center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAKlBMVEVHcEzDw8Ovr6+pqamUlJTCwsKenp61tbWxsbGysrLNzc2bm5u5ubmjo6MpovhuAAAACnRSTlMA/P79/sHDhiZS0DxZowAABBBJREFUWMPtl89rE0EUx7ctTXatB3MI1SWnDbUKPUgXqh4ED8Uf7KUVSm3ooVSpSii0Fn/gD4j4o+APiEoVmos9FO2celiqZVgwgaKHPQiCCkv+F99kM7Ozm5kxq1dfD91k9pPve9/3ZjbRNHHok/mKli4eIPNgSuRObuN9SqSEzM20iGnm0yIbqCuV7NSSSIV7uyPM6JMBYdeTOanh/QihJYZsUCSby+VkMj2AvOt0rAeQAwqE3lfKMZVlQCZk1QOCKkkVPadITCfIRNKxfoJI5+0OIFtJx14CMSg1mRSDko7VAfksRQzEbGYqxOJcVTWMCH2I1/IACNW0PWU2M8cmAVHtnH5mM1VRWtwKZjOd5JbF6s1IbaYqaotjNlPHgDAnlAizubTR6ovMYn052g/U5qcmOpi0WL8xTS/3IfSet5m8MEr5ajjF5le6dq/OJpobrdY0t3i9QgefWrxW9/1BLhk0E9m8FeUMhhXal499iD0eQRfDF+ts/tttORRerfp+oV7f4xJj82iUYm1Yzod+ZQEAlS/8mMBwKebVmCVp1f0JLS6zKd17+iwRKTARVg2SHtz3iEbBH+Q+U28zW2Jiza8Tjb1YFoYZMsJyjDqp3M9XBQdSdPLFdxEpvOB37JrHcmR/y9+LgoTlCFGZEa2sc6d4PGlweEa2JSVPoVm+IfGG3ZL037iV9oH+P+Jxc4HGVflNq1M0pivao/EopO4b/ojVCP9GjmiXOeS0DOn1o/iiccT4ORnyvBGF3yUywkQajW4Ti0SGuiy/wVSg/L8w+X/8Q+hvUx8Xd90z4oV5a1i88MbFWHz0WZZ1UrTwBGPX3Rat9AFiXRMRjoMdIdJLEOt2h7jrYOzgOamKZSWSNspOS0X8SAqRYmxRL7sg4eLzYmNehcxh3uoyud/BH2Udux4ywxFTc1xC7Mgf4vMhc5S+kSH3Y7yj+qpwIWSoPTVCOOPVthGx9FbGqrwFw6wSFxJr+17zeKcztt3u+2roAEVgUjDd+AHGuxHy2rZHaa8JMkTHEeyi85ANPO9j9BVuBRD2FY5LDMo/Sz/2hReqGIs/KiFin+CsPsYO/yvM3jL2vE8EbX7/Bf8ejtr2GLN65bioAdgLd8Bis/mD5GmP2qeqyo2ZwQEOtAjRIDH7mBKpUcMoApbZJ5UIxkEwxyMZyMxW/uKFvHCFR3SSmerHyDNQ2dF4JG6zIMpBgLfjSF9x1D6smFcYnGApjmSLICO3ecCDWrQ48geba9DI3STy2i7ax6WIB62fSyIZIiO3GFQqSURp8wCo7GhJBGwuSovJBNjb7kT6FPVnIa9qJ2Ko+l9mefGIdinaMp0yC1URYiwsdfNE45EuA5Cx9EhalfvN5s+UyItm81vaB3p4joniN+SCP7Qc1hblAAAAAElFTkSuQmCC);
		background-size: 50rpx 50rpx;
		&:before{
			position: absolute;
			content: "";
			top:0;
			right:0;
			bottom:0;
			left:0;
			// background: red;
		}
	}
.title {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.swiper {
  height: calc(100vh - 120rpx);
}
.swiper {
	width: 100%;
	height: 100vh;
		.movable-area {
			height: 100%;
			width: 100%;
			.movable-view {
				width: 100%;
				min-height: 100%;
				.uni-scroll-view{
					height: 100vh;
				}
				.scroll-view {
					display: flex;
					align-items: center;
					justify-content: center;
					min-height: 100vh;
					.image {
						width: 100%;
						height: auto;
					}
				}
			}
		}
}
.bottom-info {
  position: fixed;
  width: 100%;
  bottom: 10rpx;
  left: 0;
}
</style>