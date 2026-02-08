<template>
  <!-- 只在正式版和开发版中显示，体验版中隐藏（用于规避审核） -->
  <view class="menu" v-if="isReleaseVersion()">
    <view class="menu-item" v-for="(item, index) in navList" :key="index" @click="routeTo(item)">
      <view class="menu-item-bg">
        <image class="menu-item-icon" :src="item.icon_url + '?x-oss-process=image/resize,w_90,h_90,m_fill'" mode="aspectFill"></image>
      </view>
      <view class="menu-item-title">{{ item.name }}</view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { isReleaseVersion } from "@/utils/util.js";

const navList = ref([]);
// 页面显示
onShow(() => {
  getNavList();
});

function getNavList() {
  request.get(`/event-api/grid-menu/icons`).then((res) => {
    // res.push({
    // 	"icon_url": "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2025/11/26/02ba556b-7558-40f6-bf18-4d101c07dfa1.png",
    // 	"name": "PK520",
    // 	"path": "pagesDashboard/pkEvent/pkEvent",
    // })
    navList.value = res;
  });
}

function routeTo(item) {
  if (!item.path) return uni.$u.toast("功能筹备中，敬请期待...");
  uni.$u.route(item.path);
}
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 22rpx;
  margin: 0 34rpx;
  margin-top: 40rpx;
  background: #ffffff;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);

  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;

    .menu-item-icon {
      display: block;
      width: 100rpx;
      height: 100rpx;
    }

    .menu-item-title {
      margin-top: -16rpx;
      font-weight: 800;
      font-size: 22rpx;
      color: #000000;
    }
  }
}
</style>
