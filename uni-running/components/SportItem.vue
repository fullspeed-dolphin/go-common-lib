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
          <view class="amount">0.00</view>
          <view class="">公里</view>
        </view>
        <view class="statics">
          <text class="u-mr-10">用时 01:30:31</text>
          <text>配速7’29”</text>
        </view>
      </view>
    </view>
    <view class="text flex-start flex-row-center">
      <view class="time"> 9月3日 </view>
      <u-icon name="arrow-right" size="20rpx" color="#979797"></u-icon>
    </view>
  </view>
</template>
<script setup>
// Props
const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
  from: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["join"]);

// 方法定义
const viewDetail = (item) => {
  // 搜索组件中不跳转详情，加入按钮控制交互
  if (props.from === "search") return;

  uni.setStorageSync("sportDetail", item);
  uni.$u.route(`pagesSub/sportDetail?group_id=${item.group_id}`);
};

const joinGroup = (item) => {
  emit("join", item);
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
