<template>
  <!-- 详细样式（groupList使用） -->
  <view
    v-if="variant === 'detail'"
    class="group-item group-item-detail"
    @click="viewDetail(item)"
  >
    <image
      class="poster"
      :src="
        item.avatar_url ||
        item.image ||
        item.group_image ||
        'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
      "
      mode="aspectFill"
    ></image>
    <view class="group-item-content">
      <view class="group-name">{{ item.name || item.group_name }}</view>
      <view class="group-info-row">
        <text class="label">团长</text>
        <text class="value">{{
          item.creator_real_name || item.leader_name || item.captain || "--"
        }}</text>
      </view>
      <view class="group-info-row">
        <text class="label">成员数量</text>
        <text class="value highlight"
          >{{
            item.total_members || item.member_count || item.members || 0
          }}人</text
        >
      </view>
      <view class="group-info-row">
        <text class="label">上月总跑量</text>
        <text class="value highlight"
          >{{
            formatDistance(
              item.last_month_distance || item.total_distance || 0
            )
          }}km</text
        >
      </view>
      <view class="group-info-row">
        <text class="label">周人均跑</text>
        <text class="value highlight"
          >{{
            formatDistance(item.weekly_avg_distance || item.avg_distance || 0)
          }}km</text
        >
      </view>
      <view class="group-info-row">{{
        item.establish_location || item.address || item.location || "--"
      }}</view>
    </view>
    <!-- 排名图标 -->
    <view v-if="rankIcon" class="rank-icon">
      <image :src="rankIcon" mode="aspectFit" class="rank-icon-img"></image>
    </view>
  </view>

  <!-- 简单样式（首页使用，默认） -->
  <view
    v-else
    class="group-item group-item-simple flex-start"
    @click="viewDetail(item)"
  >
    <image
      class="poster"
      :src="
        item.avatar_url ||
        'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
      "
      mode="aspectFill"
    ></image>
    <view class="group-item-content col">
      <view class="row">
        <view class="name ellipsis">{{ item.name }}</view>
        <view class="gray">{{ item.total_members }}人</view>
      </view>
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
  from: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "simple", // 'simple' 简单样式（首页使用） | 'detail' 详细样式（groupList使用）
  },
  rankIcon: {
    type: String,
    default: "", // 排名图标路径，用于显示名次（如前三名的奖牌图标）
  },
});

// Emits
const emit = defineEmits(["join"]);

// 方法定义
const viewDetail = (item) => {
  // 搜索组件中不跳转详情，加入按钮控制交互
  if (props.from === "search") return;

  uni.setStorageSync("groupDetail", item);
  uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`);
};

const joinGroup = (item) => {
  emit("join", item);
};

// 格式化距离（米转公里，保留2位小数）
const formatDistance = (distance) => {
  if (!distance) return "0.00";
  // 如果已经是公里，直接返回；如果是米，转换为公里
  const km = distance > 10000 ? distance / 1000 : distance;
  return parseFloat(km).toFixed(2);
};
</script>

<style lang="scss" scoped>
// 详细样式（groupList使用）
.group-item-detail {
  position: relative;
  display: flex;
  align-items: flex-start;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;

  .poster {
    width: 104rpx;
    height: 104rpx;
    background: #c1c5c6;
    margin-right: 24rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .group-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .group-name {
    font-weight: 800;
    font-size: 28rpx;
    color: #000000;
    line-height: 44rpx;
  }

  .group-info-row {
    display: flex;
    align-items: center;
    line-height: 34rpx;
    font-weight: bold;
    font-size: 24rpx;
    color: #707070;
    margin-top: 10rpx;

    .label {
      width: 120rpx;
      flex-shrink: 0;
      text-align: justify;
      text-align-last: justify;
      display: inline-block;
    }

    .value {
      margin-left: 20rpx;

      &.highlight {
        color: #ff8c00;
      }
    }
  }

  .group-address {
    font-size: 24rpx;
    color: #979797;
    line-height: 34rpx;
    margin-top: 8rpx;
    word-break: break-all;
  }

  .rank-icon {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    .rank-icon-img {
      width: 60rpx;
      height: 60rpx;
    }
  }
}

// 简单样式（首页使用，默认）
.group-item-simple {
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
