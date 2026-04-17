<template>
  <view class="page">
    <u-navbar autoBack placeholder title="活动列表" />
    <!-- 分类标签 -->
    <view class="section-filter" :style="{ top: (statusBarHeight + 44) + 'px' }">
      <view class="category-tags">
        <view class="tags-inner">
          <view class="tag-slider" :style="getSliderStyle()" :class="sliderAnimClass"></view>
          <view v-for="(item, index) in tabList" :key="item.value" :id="'tab-' + index" class="tag-item" :class="{ active: sliderPosition === index }" @click="changeTab(item, index)">
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-wrapper" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="88">
        <view class="event-list" :class="['list-transition', listAnimationClass]">
          <view class="u-mb-20" v-for="(item, index) in filteredList" :key="index">
            <EventItem :item="item" :key="index" height="474rpx" />
          </view>
          <view v-if="filteredList.length === 0 && !listAnimationClass" class="empty-state">
            <text>暂无活动</text>
          </view>
        </view>
      </mescroll-body>
    </view>

    <UserLogin ref="refUserLogin" @success="getMemberList()" />
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { onLoad, onShow,onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback, getMescroll } = useMescroll(
  onPageScroll,
  onReachBottom
);

import { useStore } from "vuex";
import UserLogin from "@/components/UserLogin.vue";
import EventItem from "@/components/EventItem.vue";
import request from "@/utils/request.js";
import { useShare } from "@/composables/useShare.js";

// 使用store
const store = useStore();

// 状态栏高度
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0);

// 分享配置
useShare({
  title: "全速运动 - 活动列表",
  path: "/pagesSub/eventList",
});
const refUserLogin = ref(null);

// Tab 相关
const tabList = ref([
  { label: "全部", value: "all" },
  { label: "跑步", value: "running" },
  { label: "骑行", value: "cycling" },
]);
const tabActive = ref(0);
const curTab = ref({ label: "全部", value: "all" });

// 列表切换动画状态
const listAnimationClass = ref("");
const slideDirection = ref("right");

// 滑块动画状态
const sliderAnimClass = ref("");
const sliderPosition = ref(0);
const sliderOffset = ref(0);
const isTabSwitching = ref(false);

// Tab 位置信息
const tabRects = ref([]);
const tabContainerLeft = ref(0);

// 数据
const dataList = ref([]);

// 根据 club_type 过滤
const filteredList = computed(() => {
  if (curTab.value.value === "all") {
    return dataList.value;
  }
  return dataList.value.filter((item) => {
    const type = item.club_type || "running";
    return type === curTab.value.value;
  });
});

// 获取滑块样式
const getSliderStyle = () => {
  if (!tabRects.value.length || sliderPosition.value >= tabRects.value.length)
    return {};

  const rect = tabRects.value[sliderPosition.value];
  const left = rect.left - tabContainerLeft.value + sliderOffset.value;

  return {
    width: rect.width + "px",
    transform: `translateX(${left}px)`,
  };
};

// 获取 tab 宽度和位置
const getTabWidths = () => {
  nextTick(() => {
    const containerQuery = uni.createSelectorQuery();
    containerQuery.select("#tab-0").boundingClientRect();
    containerQuery.exec((res) => {
      if (res[0]) {
        tabContainerLeft.value = res[0].left;
      }
    });

    const query = uni.createSelectorQuery();
    query.selectAll("#tab-0, #tab-1, #tab-2").boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        tabRects.value = res[0].map((item) => ({
          width: item.width,
          left: item.left,
        }));
      }
    });
  });
};

// Tab 切换
const changeTab = (item, index, direction = null, isLoop = false) => {
  if (index === tabActive.value || isTabSwitching.value) return;
  isTabSwitching.value = true;

  if (direction === null) {
    direction = index > tabActive.value ? "right" : "left";
  }
  slideDirection.value = direction;

  // 列表滑出动画
  listAnimationClass.value =
    slideDirection.value === "right" ? "slide-out-left" : "slide-out-right";

  // 滑块动画
  if (isLoop) {
    const slideOffsetValue = direction === "left" ? -60 : 60;
    sliderAnimClass.value = "no-transition slider-hidden";
    sliderOffset.value = slideOffsetValue;
    sliderPosition.value = index;

    setTimeout(() => {
      sliderAnimClass.value = "";
      sliderOffset.value = 0;
    }, 30);
  } else {
    sliderAnimClass.value = "";
    sliderOffset.value = 0;
    sliderPosition.value = index;
  }

  // 切换数据
  setTimeout(() => {
    tabActive.value = index;
    curTab.value = item;
    listAnimationClass.value =
      slideDirection.value === "right" ? "slide-in-right" : "slide-in-left";

    setTimeout(() => {
      isTabSwitching.value = false;
      listAnimationClass.value = "";
    }, 350);
  }, 250);
};

// 滑动切换
const touchStartX = ref(0);
const touchStartY = ref(0);

const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
};

const onTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX.value;
  const deltaY = touchEndY - touchStartY.value;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    const maxIndex = tabList.value.length - 1;
    const swipeDirection = deltaX < 0 ? "left" : "right";

    if (deltaX < 0) {
      const nextIndex = tabActive.value >= maxIndex ? 0 : tabActive.value + 1;
      const isLoop = tabActive.value >= maxIndex;
      changeTab(tabList.value[nextIndex], nextIndex, swipeDirection, isLoop);
    } else if (deltaX > 0) {
      const prevIndex = tabActive.value <= 0 ? maxIndex : tabActive.value - 1;
      const isLoop = tabActive.value <= 0;
      changeTab(tabList.value[prevIndex], prevIndex, swipeDirection, isLoop);
    }
  }
};

// 获取列表数据
const getList = (mescroll) => {
  uni.showLoading({ mask: true });

  Promise.all([
    request.get(`/event-api/fsc_swipers?status=ACT&visibility=public`),
    request.get(routerParams.value.type === "online" ? `/event-api/getOnlineEventSwiper` : `/event-api/getOfflineEventSwiper`),
  ])
    .then((res) => {
      uni.hideLoading();
      res = res.flat();
      mescroll.endSuccess(res.length);

      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(res);
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};

// 页面加载
const routerParams = ref({});
onLoad((options) => {
	console.log("routerParams=====>", options);
  routerParams.value = options;
  getTabWidths();
});

onShow(() => {
  getTabWidths();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.section-filter {
  position: fixed;
  width: 100%;
  z-index: 10;
  background: #f5f5f5;
  padding: 16rpx 24rpx;
}

.category-tags {
  .tags-inner {
    display: inline-flex;
    position: relative;
    gap: 20rpx;
    padding: 6rpx;
    background: #fff;
    border-radius: 999rpx;
  }

  .tag-slider {
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    height: calc(100% - 12rpx);
    background: #ff8c00;
    border-radius: 999rpx;
    transition: transform 0.3s ease-out, width 0.3s ease-out;
    z-index: 0;

    &.no-transition {
      transition: none !important;
    }

    &.slider-hidden {
      opacity: 0;
    }
  }

  .tag-item {
    position: relative;
    z-index: 1;
    padding: 12rpx 48rpx;
    font-size: 28rpx;
    color: #666;
    line-height: 40rpx;
    white-space: nowrap;
    transition: color 0.3s ease;

    &.active {
      color: #fff;
      font-weight: bold;
    }
  }
}

.content-wrapper {
}

.event-list {
  padding: 34rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999;
  font-size: 28rpx;
}

// 列表切换动画
.list-transition {
  will-change: transform, opacity;
}

.slide-out-left {
  animation: slideOutLeft 0.25s ease-in forwards;
}

.slide-out-right {
  animation: slideOutRight 0.25s ease-in forwards;
}

.slide-in-left {
  animation: slideInLeft 0.3s ease-out forwards;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-60rpx);
    opacity: 0;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(60rpx);
    opacity: 0;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-60rpx);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(60rpx);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
