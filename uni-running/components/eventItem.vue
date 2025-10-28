<template>
  <view class="event-item">
    <image
      class="event-item-image"
      :src="item.image_url"
      mode="aspectFill"
    ></image>
    <view class="event-item-content">
      <view class="event-item-title">{{ item.description }}</view>
      <view class="event-item-meta">
        <view>{{ item.created_at }}</view>
        <view></view>
      </view>
      <view class="event-item-meta">
        <view class="event-item-location">{{
          item.event_location || "线上跑"
        }}</view>
        <view class="event-item-button" @click="joinEvent">立即报名 </view>
      </view>
    </view>
  </view>
</template>
<script setup>
const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
});

const joinEvent = () => {
  console.log("joinEvent");
  uni.$u.route(`pagesSub/offlineEvents?id=${props.item.event_id}`);
};
</script>

<style lang="scss" scoped>
.event-item {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16rpx;
}
.event-item-image {
  width: 100%;
  height: 244rpx;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
}
.event-item-content {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
}
.event-item-title {
  font-weight: 800;
  line-height: 44rpx;
  font-size: 32rpx;
  color: #000000;
  height: 88rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-item-meta {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 24rpx;
  color: #707070;
}
.event-item-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 164rpx;
  height: 60rpx;
  color: #fff;
  background: #ff8c00;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
}
.event-item-button:active {
  background: #e67e00;
}
</style>
