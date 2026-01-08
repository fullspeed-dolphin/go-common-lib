<template>
  <view class="page-container">
    <!-- 活动列表 -->
    <view class="event-list">
      <view class="event-card" v-for="(item, index) in eventList" :key="index">
        <image class="event-poster" :src="item.poster || '/static/default-event.png'" mode="aspectFill"></image>
        <view class="event-info">
          <view class="event-header">
            <text class="event-name">{{ item.name }}</text>
            <view class="event-status" :class="getStatusClass(item.status)">
              <text>{{ getStatusText(item.status) }}</text>
            </view>
          </view>
          <view class="event-meta">
            <view class="meta-item">
              <u-icon name="clock" size="24rpx" color="#999"></u-icon>
              <text class="meta-text">{{ item.event_time }}</text>
            </view>
            <view class="meta-item">
              <u-icon name="map" size="24rpx" color="#999"></u-icon>
              <text class="meta-text">{{ item.location }}</text>
            </view>
          </view>
          <view class="event-actions">
            <u-button type="primary" plain size="mini" shape="circle" color="#FF8C00"
              customStyle="height: 50rpx; padding: 0 24rpx;"
              @click.stop="editEvent(item)">更新</u-button>
            <u-button type="primary" size="mini" shape="circle" color="#FF8C00"
              customStyle="height: 50rpx; padding: 0 24rpx;"
              @click.stop="viewEvent(item)">详情</u-button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && eventList.length === 0">
        <u-empty mode="data" text="暂无活动"></u-empty>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="section-bottom">
      <u-button type="primary" color="#FF8C00" shape="circle"
        customStyle="height: 84rpx; width: 100%;"
        @click="createEvent()">创建活动</u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";

const group_id = ref("");
const eventList = ref([]);
const loading = ref(false);

// 获取活动列表
const getEventList = async () => {
  if (!group_id.value) return;
  loading.value = true;
  try {
    const res = await request.get(`/running-group/api/v1/events?group_id=${group_id.value}`);
    eventList.value = (res.list || res || []).map(item => ({
      ...item,
      event_time: item.event_time ? dayjs(item.event_time).format('YYYY-MM-DD') : ''
    }));
  } catch (e) {
    console.error('获取活动列表失败:', e);
    eventList.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    'ongoing': 'status-ongoing',
    'ended': 'status-ended',
    'upcoming': 'status-upcoming'
  };
  return statusMap[status] || 'status-ongoing';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'ongoing': '报名中',
    'ended': '已结束',
    'upcoming': '即将开始'
  };
  return statusMap[status] || '报名中';
};

// 创建活动
const createEvent = () => {
  uni.$u.route(`pagesSub/runningTeam/teamEventForm?group_id=${group_id.value}`);
};

// 编辑活动
const editEvent = (item) => {
  uni.$u.route(`pagesSub/runningTeam/teamEventForm?group_id=${group_id.value}&event_id=${item.event_id}`);
};

// 查看活动详情
const viewEvent = (item) => {
  uni.$u.route(`pagesSub/orderIn?event_id=${item.event_id}`);
};

onLoad((options) => {
  group_id.value = options.group_id;
});

onShow(() => {
  getEventList();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 24rpx 34rpx;
  padding-bottom: 140rpx;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.event-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;

  .event-poster {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  .event-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  .event-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
  }

  .event-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event-status {
    flex-shrink: 0;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-size: 22rpx;

    &.status-ongoing {
      background: rgba(255, 140, 0, 0.1);
      color: #FF8C00;
    }

    &.status-ended {
      background: rgba(153, 153, 153, 0.1);
      color: #999;
    }

    &.status-upcoming {
      background: rgba(0, 200, 83, 0.1);
      color: #00C853;
    }
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin: 12rpx 0;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .meta-text {
    font-size: 24rpx;
    color: #999;
  }

  .event-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }
}

.empty-state {
  padding: 100rpx 0;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}
</style>
