<template>
  <view class="SwiperSection" style="width:750rpx;" @touchstart="touchStart" @touchend="touchEnd">
    <swiper class="swiper" circular @change="swiperChange" swiperDuration="30" :current="currentIndex" :disable-touch="disableTouch">
      <swiper-item class="flex-center" v-for="(item, index) in displaySwiperList" :key="index">
        <image class="poster" :style="'height:' + item.height" 
				v-if="item.url" :src="item.url + '?x-oss-process=image/resize,w_750/quality,q_80/format,webp'" mode="widthFix" />
      </swiper-item>
    </swiper>
		
    <view class="section-slider">
      <!-- 预览图 -->
      <!-- <scrollimageview :dataList="originList" :originIndex="originIndex" @dirHandle="dirHandle" :isShow="isShowAmount"
        :min="0" :total="Number(totalNumber || 0)" style="margin-bottom:20rpx;">
      </scrollimageview> -->
      <!-- :style="{opacity: !isShow ? 0 : 1}" -->

      <!-- // <slider :value="originIndex" @change="sliderChange" :step="1" :max="originList.length -1" /> -->
      <!-- 拖动滑块 -->
      <xzsliderrange v-model="originIndexArr" solo :decoration="false" @move="sliderChange" :size="30" height="2px"
        activeBgc="rgb(0, 122, 255)" :max="Number(originList.length || 0)" :min="0" :total="Number(totalNumber || 0)"
        hintColor="#fff" @showNum="e => isShowAmount = e" />
      <view class="title" :style="{ opacity: !isShow ? 0 : 1 }">{{ originIndex + 1 }}/{{ originList.length }}(总
        {{ totalNumber }})
      </view>
    </view>
    <!-- loading -->
    <view class="loading">
      <up-loading-page bg-color="#e8e8e8" :loading="isloading" loading-text="加载中..." style="background-color:rgba(0,0,0,.3)" />
    </view>
		
		<section class="section-btns flex-center" style="position: fixed;right:34rpx;bottom: 90rpx;">
			<!-- <up-button @click="downloadPicture" type="primary" icon="share"
				customStyle="width:70rpx;height:130rpx;">
				分享
			</up-button> -->
			<up-button @click="downloadPicture" type="primary" icon="download"
				customStyle="width:70rpx;height:130rpx;">
				下载
			</up-button>
		</section>
  </view>
</template>

<script setup>
import xzsliderrange from "./xz-slider-range/xz-slider-range.vue"
import scrollimageview from "./scrollimageview.vue"
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

const props = defineProps({
  originList: {
    type: Array,
    default: []
  },
  originIndex: {
    type: [Number, String],
    default: 0
  },
  totalNumber: {
    type: [Number, String],
    default: 0
  }
})
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
	
	let displayList = [];
	displayList[displayIndex.value] = originList.value[originIndex];
	displayList[displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1] =
		originList.value[
			originIndex - 1 == -1 ? originListLength - 1 : originIndex - 1
		];
	displayList[displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1] =
		originList.value[
			originIndex + 1 == originListLength ? 0 : originIndex + 1
		];
		
	displaySwiperList.value = displayList.map(item => ({
		url: item,
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
const swiperChange = (event) => {
  const {
    current
  } = event.detail;
  currentIndex.value = current
  // console.log(current, 'current=====',event.detail)
  const originListLength = originList.value.length; // 源数据长度
  if (originIndex.value + 6 > originListLength) {
    emits('loadingMore', originIndex.value + 1)
    isloading.value = true
    return;
  }
  // =============向后==========
  if (displayIndex.value - current == 2 || displayIndex.value - current == -1) {
    // console.log('向后滑动', displayIndex.value, current)
    originIndex.value =
      originIndex.value + 1 == originListLength ? 0 : originIndex.value + 1;
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

  if (originIndex.value + 6 > originList.value.length && !isloading.value) {
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
}
// 终点,计算移动距离
const touchEnd = (event) => {
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

// 图片滚动回调设置slider
const dirHandle = (start, end) => {
  console.log('start===', start)
  originIndex.value = start
  if (originIndex.value + 6 > originList.value.length && !isloading.value) {
    emits('loadingMore', originIndex.value)
    isloading.value = true
    return;
  }
  initSwiperData(start);
};

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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  color: #fff
}

.swiper {
  height: calc(100vh - 120rpx);
}

.section-slider {
  position: fixed;
  width: 100%;
  bottom: 150rpx;
  left: 0;
}
</style>