<template>
  <view>
    <Navbar title="运动记录" :bgHeight="370" />

    <view class="container">
      <section class="section-dashboard">
        <view class="h1"> 累计里程 </view>
        <view class="bar flex-start">
          <view class="amount"> 0.00 </view>
          <view class="">公里</view>
        </view>
        <view class="statics flex-row">
          <view class="flex-1">
            <view class="label">运动次数</view>
            <view class="value">0</view>
          </view>
          <view class="flex-1">
            <view class="label">平均配速</view>
            <view class="value">--</view>
          </view>
          <view class="flex-1">
            <view class="label">时长</view>
            <view class="value">--</view>
          </view>
          <view class="flex-1">
            <view class="label">消耗大卡</view>
            <view class="value">0</view>
          </view>
        </view>
      </section>

      <section class="date-list">
        <view
          class="date-item"
          v-for="(item, index) in sports"
          :key="'row-' + index"
          :class="{ 'last-item': index === sports.length - 1 }"
        >
          <view class="date-header" @click="toggleExpand(index)">
            <view class="date-title">{{ item.title }}</view>
            <view class="flex-start amount-number">
              <view class="amount">0.00</view>
              <view class="">公里</view>
            </view>
            <view
              class="date-icon"
              :class="{ expanded: expandedIndex === index }"
            >
              <u-icon name="arrow-up" size="14" color="#616161"></u-icon>
            </view>
          </view>
          <view
            class="date-content"
            :class="{ expanded: expandedIndex === index }"
            v-if="expandedIndex === index"
          >
            <SportItem
              :item="{}"
              v-for="(item, sindex) in 3"
              :key="'index' + sindex"
            />
          </view>
        </view>
      </section>

      <view class="section-empty">
        <view>暂无数据请</view>
        <view class="link">添加设备</view>
      </view>
    </view>
  </view>
</template>
<script setup>
import Navbar from "@/components/navbar.vue";
import SportItem from "@/components/SportItem.vue";
import { ref, onMounted } from "vue";

const sports = ref([]);
const expandedIndex = ref(0);

onMounted(() => {
  sports.value = [
    {
      title: "2025年9月",
    },
    {
      title: "2025年10月",
    },
    {
      title: "2025年11月",
    },
  ];
});

const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index;
};
</script>

<style lang="less" scoped>
.section-dashboard {
  height: 376rpx;
  margin: 44rpx auto 0 auto;
  padding: 50rpx 16rpx 0;
  background: linear-gradient(180deg, #ff8c00 0%, #fafafa 100%);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #e7e7e7;
  .h1 {
    font-weight: 500;
    font-size: 34rpx;
    color: #000000;
  }
  .bar {
    width: 650rpx;
    height: 90rpx;
    margin: 20rpx 0 40rpx;
    background: rgba(255, 255, 255, 0.3);
    padding-left: 30rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    font-size: 24rpx;
    .amount {
      font-weight: bold;
      font-size: 44rpx;
      margin-right: 10rpx;
    }
  }
}
.statics {
  font-size: 24rpx;
  line-height: 48rpx;
  padding-left: 12rpx;
}
.amount-number {
  color: #979797;
  font-size: 24rpx;
  .amount {
    font-weight: bold;
    font-size: 34rpx;
    margin-right: 4rpx;
    color: #000;
  }
}

.section-empty {
  height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 34rpx;
  color: #707070;
  line-height: 48rpx;
  .link {
    color: #ff8c00;
  }
}
.date-list {
  width: 100%;
  margin-top: 40rpx;
  // padding: -2rpx 0 -2rpx 0;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: #fff;
}
.date-item {
  border-bottom: 2rpx solid #e7e7e7;
  overflow: hidden;

  &.last-item {
    border-bottom: none;
  }

  .date-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 30rpx 26rpx;
    cursor: pointer;

    .date-title {
      font-weight: 400;
      font-size: 30rpx;
      color: #000000;
      line-height: 42rpx;
      flex: 1;
    }

    .amount-number {
      flex-shrink: 0;
    }

    .date-icon {
      flex-shrink: 0;
      transition: transform 0.3s;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .date-content {
    margin: 0 42rpx;
    padding: 30rpx 0;
    border-top: 2rpx solid #e7e7e7;
  }
}
</style>
