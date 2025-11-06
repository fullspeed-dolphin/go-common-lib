<template>
  <view
    class="navbar-box"
    :style="{ height: placeholder ? navbarBoxHeight : 0 }"
  >
    <!-- <view class="navbar-bg" :style="{ height: `${bgHeight}rpx` }"></view> -->
    <view class="navbar-bg-overlay" :style="bgOverlayStyle"></view>
    <view
      v-if="back"
      class="navbar-button-container"
      :style="buttonContainerStyle"
    >
      <view class="navbar-back-btn" @tap="handleBack">
        <up-icon name="arrow-left" :size="iconSize" color="#000"></up-icon>
      </view>
      <view class="navbar-divider"></view>
      <view class="navbar-home-btn" @tap="handleHome">
        <up-icon name="home" :size="iconSize" color="#000"></up-icon>
      </view>
    </view>
    <view v-if="title" class="navbar-title" :style="titleStyle">
      {{ title }}
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "跑了没",
  },
  bgHeight: {
    type: Number,
    default: 144,
  },
  back: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: Boolean,
    default: true,
  },
});

const bgColor = ref("transparent");
const navbarBoxHeight = ref("0px");
const menuButtonInfo = ref(null);
const statusBarHeight = ref(0);
const iconSize = ref("18px");
const windowWidth = ref(0);

// 计算导航栏按钮容器样式
const buttonContainerStyle = computed(() => {
  if (!menuButtonInfo.value) {
    return {
      top: `${statusBarHeight.value + 6}px`,
      left: "20px",
      height: "32px",
    };
  }

  // 获取胶囊按钮信息
  const menuBtn = menuButtonInfo.value;
  // 按钮容器与胶囊按钮水平对齐（顶部对齐）
  // 宽度设置为适合两个图标的合理宽度，约等于胶囊按钮的高度 * 2.5
  const containerWidth = menuBtn.height * 2.5;

  // 计算左侧位置，使其与右侧胶囊按钮保持一致的间距
  // 胶囊按钮距离右边缘的距离 = windowWidth - menuBtn.right
  // 左侧按钮应该距离左边缘相同的距离
  const rightMargin = windowWidth.value - menuBtn.right;
  const leftPosition = rightMargin;

  return {
    top: `${menuBtn.top}px`,
    left: `${leftPosition}px`,
    height: `${menuBtn.height}px`,
    width: `${containerWidth}px`,
  };
});

// 计算背景覆盖层样式（包含状态栏和导航栏）
const bgOverlayStyle = computed(() => {
  if (!menuButtonInfo.value) {
    return {
      top: "0px",
      height: `${statusBarHeight.value + 44}px`, // 状态栏 + 导航栏
      backgroundColor: bgColor.value,
    };
  }

  const menuBtn = menuButtonInfo.value;
  // 导航栏高度 = 胶囊底部 + (胶囊顶部 - 状态栏高度)
  const navHeight = menuBtn.bottom + (menuBtn.top - statusBarHeight.value);
  return {
    top: "0px",
    height: `${navHeight}px`, // 导航栏总高度
    backgroundColor: bgColor.value,
  };
});

// 计算标题样式
const titleStyle = computed(() => {
  if (!menuButtonInfo.value) {
    return {
      top: `${statusBarHeight.value + 6}px`,
      height: "32px",
      lineHeight: "32px",
    };
  }

  const menuBtn = menuButtonInfo.value;
  // 标题与按钮容器水平对齐
  return {
    top: `${menuBtn.top}px`,
    height: `${menuBtn.height}px`,
    lineHeight: `${menuBtn.height}px`,
  };
});

const computeNavbarBoxHeight = () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  windowWidth.value = systemInfo.windowWidth || 375;

  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  if (menuBtn) {
    menuButtonInfo.value = menuBtn;
    // 导航栏高度 = 胶囊底部 + (胶囊顶部 - 状态栏高度)
    const navHeight = menuBtn.bottom + (menuBtn.top - statusBarHeight.value);
    navbarBoxHeight.value = `${navHeight}px`;
    // 图标大小与胶囊按钮高度匹配，通常为 16-18px
    // 图标大小根据胶囊按钮高度调整，通常为胶囊高度的70-80%
    iconSize.value = `${Math.max(16, Math.min(20, menuBtn.height * 0.7))}px`;
  } else {
    navbarBoxHeight.value = `${44 + statusBarHeight.value}px`;
    iconSize.value = "18px";
  }
  // #endif

  // #ifndef MP-WEIXIN
  navbarBoxHeight.value = `${44 + statusBarHeight.value}px`;
  iconSize.value = "18px";
  // #endif
};

// 监听页面滚动
const handleScroll = (e) => {
  const scrollTop = e.scrollTop || 0;
  if (scrollTop >= 5) {
    bgColor.value = "#ffffff";
  } else {
    bgColor.value = "transparent";
  }
};

// 返回上一页
const handleBack = () => {
  uni.navigateBack();
};

// 返回首页
const handleHome = () => {
  uni.switchTab({
    url: "/pages/index",
  });
};

onMounted(() => {
  uni.$on("pageScroll", handleScroll);
  computeNavbarBoxHeight();
});

onUnmounted(() => {
  uni.$off("pageScroll", handleScroll);
});
</script>

<style lang="less" scoped>
.navbar-box {
  overflow: visible;

  .navbar-bg {
    width: 100%;
    background: linear-gradient(180deg, #ffe8cc 0%, #fafafa 100%);
  }

  .navbar-bg-overlay {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 9;
    width: 100%;
    box-sizing: border-box;
  }

  .navbar-button-container {
    position: fixed;
    z-index: 11;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    border-radius: 999px;
    padding: 0 6px;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 999px;
      transform: scale(0.5);
      transform-origin: 0 0;
      width: 200%;
      height: 200%;
      box-sizing: border-box;
      pointer-events: none;
    }

    .navbar-back-btn,
    .navbar-home-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0;
      flex: 1;
      min-width: 0;

      &:active {
        opacity: 0.7;
      }
    }

    .navbar-back-btn {
      margin-right: 2px;
    }

    .navbar-divider {
      width: 1px;
      height: 60%;
      background-color: rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .navbar-home-btn {
      margin-left: 2px;
    }
  }

  .navbar-title {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    color: #000;
    text-align: center;
    // 左右padding确保标题不会被左侧按钮和右侧胶囊按钮遮挡
    padding: 0 120px;
    box-sizing: border-box;
    pointer-events: none; // 标题不阻挡点击事件
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
