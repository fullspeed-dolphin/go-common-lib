<template>
  <view class="tabbar-box">
    <u-tabbar :value="active" @change="onChange" activeColor="#FF8C00" inactiveColor="#000" fixed placeholder zIndex="100" :safeAreaInsetBottom="false" :border="false">
      <block v-for="(item, index) in tabList" :key="index">
        <u-tabbar-item v-if="index === 2" :text="item.text" :name="item.name">
          <template #text>
            <image src="/static/images/Frame 18@2x.png" mode="aspectFill" style="width:82rpx;height:82rpx;"/>
          </template>
        </u-tabbar-item>
        <u-tabbar-item v-else :text="item.text" :name="item.name">
          <template #text>
						<view class="iconfont" :class="{ 'active': active === item.name, [item.icon]: true }"></view>
            <text class="tabbar-text" :class="{ 'tabbar-text--active': active === item.name }">{{ item.text }}</text>
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
    text: "活动",
    name: "event",
    pagePath: "/pages/event",
    icon: "icon-flag-fill",
    normal:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_00.png",
    active:
      "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/tab_01.png",
  },
  {
    text: "打卡",
    name: "punchInUpload",
    pagePath: "/pagesSport/punchInUpload",
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

  if (detail === 'punchInUpload') {
    uni.$u.route('/pagesSport/punchInUpload')
    return;
  }

  uni.switchTab({
    url: "/pages/" + detail,
  });
};
</script>

<style lang="scss" scoped>
.tabbar-box {
  box-sizing: content-box;
  margin-bottom: env(safe-area-inset-bottom);
}

.tabbar-text {
  font-size: 24rpx;
  // font-weight: 500;
  color:rgb(125, 126, 128);;
}

.tabbar-text--active {
  color: #ff8c00;
}

.iconfont {
	height: 42rpx;
	width: 42rpx;
  font-size: 46rpx;
  margin-bottom: 6rpx;
  color: rgb(125, 126, 128);
}

.active {
  color: #ff8c00;
}
</style>
