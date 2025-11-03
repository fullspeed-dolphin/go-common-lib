<template>
  <view class="navbar-box" :style="{ height: navbarBoxHeight }">
    <view class="navbar-bg" :style="{ height: `${bgHeight}rpx` }"></view>
    <u-navbar
      className="navbar"
      :autoBack="back"
      :title="title"
      :leftIcon="back ? 'arrow-left' : ''"
      :bgColor="bgColor"
      placeholder
    ></u-navbar>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

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
});

const bgColor = ref("transparent");
const navbarBoxHeight = ref("0px");

const computeNavbarBoxHeight = () => {
  const statusBarHeight =
    (uni.getWindowInfo && uni.getWindowInfo().statusBarHeight) || 0;
  navbarBoxHeight.value = `${44 + statusBarHeight}px`;
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

onMounted(() => {
  uni.$on("pageScroll", handleScroll);
  computeNavbarBoxHeight();
  console.log(props.bgHeight, "bgHeight");
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
}
</style>
