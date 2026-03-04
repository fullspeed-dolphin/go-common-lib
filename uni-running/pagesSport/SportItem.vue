<template>
  <view class="sport-item flex-between-center" @click="viewDetail(item)">
    <view class="flex-row flex-row-center">
      <view class="poster u-mr-10 flex-center">
        <image
          class="icon"
          src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/checkicon@2x.png"
          mode="aspectFill"
        ></image>
      </view>
      <view class="sport-item-content">
        <view class="flex-start amount-number">
          <view class="amount">{{ item.distance_km }}</view>
          <!-- <view class="">公里</view> -->
        </view>
        <view class="statics">
          <text class="u-mr-10">用时 {{ item.duration_in_time }}</text>
          <text>配速 {{ formatPace(item.average_pace) }}</text>
        </view>
      </view>
    </view>
    <view class="text flex-start flex-row-center">
      <view class="time"> {{item.start_time?.slice(5, 10)}} </view>
      <u-icon name="arrow-right" size="20rpx" color="#979797"></u-icon>
    </view>
  </view>
</template>
<script setup>
import { formatPace } from "./assets/utils.js";
import request from "@/utils/request.js";
const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
});


const viewDetail = (item) => {
  const params = {
    id: item.id,
    page: 1,
    page_size: 10,
  };
  request.get("/sport-api/api/healthdata/detail", params)
  // uni.$u.route(`pagesSub/sportDetail?id=${item.id}`);

};
</script>

<style lang="scss" scoped>
.sport-item {
  height: 100rpx;
  background: #ffffff;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
  padding: 20rpx;
  .poster {
    .icon {
      width: 37rpx;
      height: 40rpx;
    }
    width: 61rpx;
    height: 61rpx;
    background: #ff8c00;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }
}
.amount-number {
  display: flex;
  align-items: baseline;
  color: #979797;
  font-size: 16rpx;
  line-height: 34rpx;

  .amount {
    font-weight: bold;
    font-size: 24rpx;
    margin-right: 4rpx;
    color: #000;
  }
}
.statics {
  font-size: 16rpx;
  color: #979797;
  line-height: 16rpx;
}
.time {
  font-size: 20rpx;
  color: #979797;
  line-height: 12rpx;
}
.sport-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
