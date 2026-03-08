<template>
  <view>
    <u-navbar title="智能设备" placeholder />
    <view class="">
      <view class="brand-item flex-start" v-for="(item, index) in deviceList" :key="index" @click="routeToDetail(item)">
        <image class="img" :src="item.imgUrl" mode="aspectFill"></image>
        <div>
          <view class="label b">{{ item.label }}</view>
          <view class="label u-mt-20" style="font-size: 22rpx; color: #666">{{ item.created_at }}</view>
        </div>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";

const deviceList = ref([]);
function getDevicesList() {
  uni.showLoading({
    mask: true,
  });

  request.get("/sport-api/api/platform/bindings").then((res) => {
    console.log("设备列表====>", res);
    deviceList.value = (res.bindings || []).map((item) => {
      const imgMapping = {
        huawei:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/华为运动健康@2x.png",
        garmin:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/佳明@2x.png",
        gaochi:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/高驰@2x.png",
      };

      let created_at = item.created_at?.replace("T", " ")?.slice(0, 16);

      return {
        ...item,
        imgUrl: imgMapping[item.platform] || "",
        label: item.display_name || item.platform,
        value: item.platform,
        created_at: created_at ? created_at + '绑定' : "",
      };
    }).filter((item) => item.platform !== 'honor');
  });
}

function routeToDetail(item) {
  uni.$u.route(`/pagesSub/device/deviceDetail?platform=${item.platform}`);
}

// 页面加载
onShow(() => {
  getDevicesList();
});
</script>

<style lang="less" scoped>
.brand-item {
  width: 682rpx;
  height: 120rpx;
  border-radius: 24rpx 24rpx 24rpx 24rpx;
  background: #ffffff;
  border: 2rpx solid #f0f0f0;
  padding: 20rpx 30rpx;
  margin: 30rpx auto;
  .img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 10rpx;
    margin-right: 20rpx;
  }
}
</style>
