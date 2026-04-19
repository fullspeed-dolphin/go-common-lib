<template>
  <view class="tabbar-box">
    <u-tabbar :value="active" @change="onChange" activeColor="#EF7B31" inactiveColor="#8E9BB0" fixed placeholder zIndex="100" :safeAreaInsetBottom="false" :border="false">
      <block v-for="(item, index) in tabList" :key="index">
        <u-tabbar-item v-if="index === 2" :text="item.text" :name="item.name">
          <template #text>
            <view class="tab-pill" :class="{ 'tab-pill--active': active === item.name }">
              <image src="/static/images/Frame 18@2x.png" :class="{ 'filter': active !== item.name }" mode="aspectFill" style="width:82rpx;height:82rpx;"/>
            </view>
          </template>
        </u-tabbar-item>
        <u-tabbar-item v-else :text="item.text" :name="item.name">
          <template #text>
            <view class="tab-pill" :class="{ 'tab-pill--active': active === item.name }">
              <view class="iconfont" :class="[item.icon]"></view>
              <text class="tabbar-text">{{ item.text }}</text>
            </view>
          </template>
        </u-tabbar-item>
      </block>
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
    icon: "icon-shouye1-xuanzhong",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "跑团",
    name: "runClub",
    pagePath: "/pages/runClub",
    icon: "icon-flag-fill",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "打卡",
    name: "punchInUpload",
    pagePath: "/pages/punchInUpload",
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
    icon: "icon-CRMEB-shoubiao2-mianxing",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "我的",
    name: "mine",
    icon: "icon-wode",
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
  padding-top: 30rpx;
  box-sizing: content-box;
  margin-bottom: env(safe-area-inset-bottom);
}

.tab-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 52rpx;
  gap: 8rpx;

  .iconfont {
    height: 42rpx;
    width: 42rpx;
    font-size: 46rpx;
    margin-bottom: 6rpx;
    color: #8E9BB0;
  }

  .tabbar-text {
    font-size: 22rpx;
    color: #8E9BB0;
  }

  &--active {
    .iconfont {
      color: #FF8C00;
    }

    .tabbar-text {
      color: #FF8C00;
    }
  }
}

.filter {
  filter: grayscale(100%);
}



</style>
