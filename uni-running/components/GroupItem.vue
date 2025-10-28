<template>
  <view class="group-item flex-start" @click="viewDetail(item)">
    <image
      class="poster"
      :src="item.avatar_url || '../static/run.png'"
      mode="aspectFill"
    ></image>
    <view class="group-item-content col">
      <div class="row">
        <view class="name ellipsis">{{ item.name }}</view>
        <view class="gray">{{ item.total_members }}人</view>
      </div>
      <view class="row justify-start">
        <u-icon name="map" size="24rpx" color="#FF8C00" class="gray"></u-icon>
        <view class="location ellipsis" style="width: 320rpx">
          {{ item.establish_location }}
        </view>
      </view>
      <view class="desc gray ellipsis">{{ item.introduction }}</view>
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
});

// Emits
const emit = defineEmits(["join"]);

// 方法定义
const viewDetail = (item) => {
  // 搜索组件中不跳转详情，加入按钮控制交互
  if (props.from === "search") return;

  uni.setStorageSync("sportDetail", item);
  uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`);
};

const joinGroup = (item) => {
  emit("join", item);
};
</script>

<style lang="scss" scoped>
.group-item {
  display: flex;
  align-items: stretch;
  background: #fff;
  padding: 10rpx 34rpx;
  .poster {
    width: 144rpx;
    height: 144rpx;
    background: #f5f5f5;
    margin-right: 22rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    flex-shrink: 0;
    flex-grow: 0;
  }
  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }
  .row {
    flex: 1;
    height: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 0;
  }
  .name {
    font-weight: bold;
    font-size: 32rpx;
    color: #000000;
    line-height: 44rpx;
  }
  .justify-start {
    justify-content: flex-start;
  }
  .location {
    font-size: 24rpx;
    color: #979797;
    line-height: 34rpx;
    height: 34rpx;
    margin-left: 10rpx;
  }
  .desc {
    font-size: 20rpx;
    line-height: 28rpx;
    height: 28rpx;
  }
  .gray {
    color: #979797;
  }
}
</style>
