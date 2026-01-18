<template>
  <view class="tabbar-box">
    <u-tabbar
      :value="active"
      @change="onChange"
      activeColor="#FF8C00"
      inactiveColor="#000"
      fixed
      placeholder
      zIndex="100"
      safeAreaInsetBottom
      :border="false"
    >
      <u-tabbar-item
        :text="item.text"
        v-for="(item, index) in tabList"
        :key="index"
        :name="item.name"
      >
        <template #active-icon>
          <view class="iconfont active" :class="item.icon"></view>
        </template>
        <template #inactive-icon>
          <view class="iconfont" :class="item.icon"></view>
        </template>
        <template #text>
          <text
            class="tabbar-text"
            :class="{ 'tabbar-text--active': active === item.name }"
            >{{ item.text }}</text
          >
        </template>
      </u-tabbar-item>
    </u-tabbar>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { isRelease } from "@/utils/config.js";

// Props
const props = defineProps(["type"]);

// 响应式数据
const active = ref(props.type);
const tabList = ref([
  {
    text: "首页",
    name: "index",
    pagePath: "/pages/index",
    icon: "icon-shouye",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "活动",
    name: "event",
    pagePath: "/pages/event",
    icon: "icon-rili",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "运动",
    name: "sport",
    pagePath: "/pages/sport",
    icon: "icon-huabi-",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "我的",
    name: "mine",
    icon: "icon-wenzi",
    pagePath: "/pages/mine",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_20.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_21.png",
  },
]);

// 方法定义
const onChange = (detail) => {
  if (detail === props.type) return;

  uni.switchTab({
    url: "/pages/" + detail,
  });
};
</script>

<style lang="scss" scoped>
.tabbar-box {
  height: 224rpx;
  box-sizing: content-box;
  margin-bottom: env(safe-area-inset-bottom);
}

.tabbar-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #000;
}

.tabbar-text--active {
  color: #ff8c00;
}

.iconfont {
  font-size: 36rpx;
  color: rgb(125, 126, 128);
}

.active {
  color: #ff8c00;
}
</style>
