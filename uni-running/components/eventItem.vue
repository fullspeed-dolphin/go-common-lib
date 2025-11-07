<template>
  <view
    class="event-item"
    :style="{ flexDirection: direction, height: height, width: width }"
    @click="joinEvent"
  >
    <image
      class="event-item-image"
      :src="item.image_url"
      mode="aspectFill"
      :style="
        direction === 'row'
          ? {
              height: '184rpx',
              width: '286rpx',
            }
          : {}
      "
    ></image>
    <view class="event-item-content">
      <view class="event-item-title">{{ item.description }}</view>
      <view class="event-item-meta">
        <view>{{ dayjs(item.created_at).format("YYYY-MM-DD HH:mm") }}</view>
        <view v-if="direction === 'column'">333人报名</view>
      </view>
      <view
        class="event-item-meta event-item-button-container"
        v-if="showButton"
      >
        <view class="event-item-location">{{
          item.is_online ? "线上跑" : item.event_location
        }}</view>
        <view class="event-item-button">
          <block v-if="item.status === 'ACT'">立即报名</block>
          <block v-if="item.status === 'PND'">暂未开始</block>
          <block v-if="item.status === 'EXP'">查看详情</block>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import dayjs from "dayjs";
const props = defineProps({
  width: {
    type: String,
    default: "auto",
  },
  item: {
    type: Object,
    default: () => {},
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  direction: {
    type: String,
    default: "column",
  },
  height: {
    type: String,
    default: "auto",
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
  flex-shrink: 0;
  flex-grow: 0;
}
.event-item-content {
  display: flex;
  flex-direction: column;
  padding: 24rpx 20rpx;
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
.event-item-button-container {
  margin-top: 34rpx;
}
.event-item-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 164rpx;
  height: 60rpx;
  color: #fff;
  background: #ff8c00;
  border-radius: 40rpx;
}
.event-item-button:active {
  background: #e67e00;
}
</style>
