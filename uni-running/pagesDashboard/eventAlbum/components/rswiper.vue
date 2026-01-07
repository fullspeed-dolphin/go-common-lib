<template>
  <view style="width:750rpx;" @touchstart="touchStart" @touchend="touchEnd">
    <swiper class="swiper" circular @change="swiperChange" swiperDuration="30" :current="currentIndex" :disable-touch="disableTouch">
      <swiper-item class="flex-center" v-for="(item, index) in displaySwiperList" :key="index">
        <image style="display: block;width:750rpx;" v-if="item" :src="item + '?x-oss-process=image/resize,w_750'" mode="widthFix" />
      </swiper-item>
    </swiper>
    <view class="section-slider">
      <!-- 预览图 -->
      <!-- <scrollimageview 
			:dataList="originList" 
			:originIndex="originIndex"
			@dirHandle = "dirHandle"
			:min="0"
			:total="Number(album_total)"
			style="margin-bottom:20rpx;"
			>
			</scrollimageview> -->

      <!-- 拖动滑块 -->
      <SliderRange v-model="originIndexArr" solo :decoration="false" @move="sliderChange" :max="Number(originList?.length || 0)" :total="Number(album_total)" @showNum="e => isShowAmount = e" />

      <view class="title" :style="{opacity: !isShowAmount ? 0 : 1}">
        {{originIndex+1 }}<span class="c9">/{{ originList.length }}(总 {{album_total}})</span>
      </view>
    </view>

    <view class="loading">
      <up-loading-page bg-color="#e8e8e8" :loading="isloading" loading-text="加载中..." style="background-color:rgba(0,0,0,.3)" />
    </view>
  </view>
</template>

<script setup>
import SliderRange from "./xz-slider-range/xz-slider-range.vue";
import scrollimageview from "./scrollimageview.vue";
import { onMounted, ref, watch, nextTick, toRef, computed } from "vue";

import { useStore } from "vuex";
const store = useStore();

const album_total = computed(() => store.state.album_total);
const album_data = computed(() => store.state.album_data);

const props = defineProps({
  originIndex: {
    type: [Number, String],
    default: 0,
  },
});

const emits = defineEmits(["loadingMore"]);

const originList = ref([]); // 源数据
const displaySwiperList = ref([]); // swiper需要的数据
const displayIndex = ref(0); // 用于显示swiper的真正的下标数值只有：0，1，2。
const originIndex = ref(0); // 记录源数据的下标
const originIndexArr = ref([1]);
const currentIndex = ref(0); // 显示swiper的当前值只有：0，1，2。
const disableTouch = ref(false); // 是否阻止触摸
const isloading = ref(false); // 加载动画内容
const isShowAmount = ref(false); // 图片数量的显示隐藏

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
  setTimeout(() => {
    if (originIndex == 0 && endDir.value == "right") {
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

    displaySwiperList.value = displayList;

    // 防止干扰，拖动的时候不修改originIndexArr
    if (!isShowAmount.value) {
      originIndexArr.value[0] = originIndex;
    }
  }, 200);
};

/**
 * swiper滑动时候
 */
const swiperChange = (event) => {
  const { current } = event.detail;
  currentIndex.value = current;

  // console.log(current, 'current=====',event.detail)
  const originListLength = originList.value.length; // 源数据长度
  if (originIndex.value + 6 > originListLength) {
    emits("loadingMore", originIndex.value + 1);
    isloading.value = true;
    return;
  }

  // ======向后滑动 ==========
  if (displayIndex.value - current == 2 || displayIndex.value - current == -1) {
    // console.log('向后滑动', displayIndex.value, current)
    originIndex.value =
      originIndex.value + 1 == originListLength ? 0 : originIndex.value + 1;
    displayIndex.value =
      displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1;
  } else {
    // console.log('向前面==滑动', displayIndex.value, current)
    originIndex.value =
      originIndex.value - 1 == -1
        ? originListLength - 1
        : originIndex.value - 1;
    displayIndex.value =
      displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1;
  }

  initSwiperData(originIndex.value);
};

// 拖动滑块回调
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

const startTime = ref(0);
const startPosition = ref(0);
const endPosition = ref(0);
const endDir = ref("");
// 起点
const touchStart = (event) => {
  startTime.value = Date.now();
  startPosition.value = event.changedTouches[0].clientX;
};
// 终点,计算移动距离
const touchEnd = (event) => {
  const endTime = Date.now();
  if (endTime - startTime.value > 2000) {
    return;
  }
  endPosition.value = event.changedTouches[0].clientX;

  //当移动距离超过10时判断左滑右滑。
  if (Math.abs(endPosition.value - startPosition.value) > 10) {
    endPosition.value = event.changedTouches[0].clientX;
    endDir.value =
      endPosition.value - startPosition.value > 0 ? "right" : "left";

    if (endDir.value == "left") {
      // console.log("wos==")
      disableTouch.value = false;
      if (originIndex.value == 0) {
        // currentIndex.value = 1
        originIndex.value = 1;
        // initSwiperData(originIndex.value);
      }
    }
  } else {
    return;
  }

  // console.log(endDir.value)
};

// 图片滚动回调设置slider
const dirHandle = (start, end) => {
  console.log("start===", start);
  originIndex.value = start;
  if (originIndex.value + 6 > originList.value?.length && !isloading.value) {
    emits("loadingMore", originIndex.value);
    isloading.value = true;
    return;
  }
  initSwiperData(start);
};

// onMounted(() => {
//   originIndex.value = props.originIndex;
//   initSwiperData(originIndex.value);
// });

defineExpose({
  originIndex,
  originList,
});
</script>

<style lang="scss" scoped>
.title {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  color: #fff;
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