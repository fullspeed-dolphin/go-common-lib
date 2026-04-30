<template>
  <view class="page-container">
    <u-navbar :title="clubTypeName + '活动管理'" autoBack placeholder></u-navbar>

    <!-- Filter Bar -->
    <view class="filter-bar">
      <view class="tab-item" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">
        <text>全部</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'ACT' }" @click="switchTab('ACT')">
        <text>进行中</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'PND' }" @click="switchTab('PND')">
        <text>审核中</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'EXP' }" @click="switchTab('EXP')">
        <text>已结束</text>
      </view>
    </view>

    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" :top="0">
      <view class="event-list">
        <view class="event-card" :class="{ 'status-expired': item.status === 'EXP' }" v-for="(item, index) in eventList" :key="index" @tap.stop="viewEvent(item)">
          <!-- Cover Image -->
          <view class="cover-wrap">
            <image class="cover-img" v-if="getCoverUrl(item)" :src="getCoverUrl(item) + '?x-oss-process=image/resize,w_200,h_200,m_fill'" mode="aspectFill" />
            <view class="cover-placeholder" v-else>
              <u-icon name="photo" size="24" color="#D1D5DB"></u-icon>
            </view>
            <view class="status-tag" :class="getStatusClass(item)">
              <text>{{ getStatusText(item) }}</text>
            </view>
          </view>
          <!-- Content -->
          <view class="card-content">
            <view class="card-title-row">
              <text class="card-name">{{ item.name }}</text>
            </view>
            <view class="card-meta">
              <view class="meta-item">
                <u-icon name="calendar" size="13" color="#9CA3AF"></u-icon>
                <text class="meta-text">{{ item.event_time }}</text>
              </view>
              <view class="meta-item" v-if="item.event_location">
                <u-icon name="map" size="13" color="#9CA3AF"></u-icon>
                <text class="meta-text">{{ item.event_location }}</text>
              </view>
              <view class="meta-item" v-if="item.max_participants">
                <u-icon name="account" size="13" color="#9CA3AF"></u-icon>
                <text class="meta-text">{{ item.max_participants }}人</text>
              </view>
            </view>
            <!-- REJ rejection note -->
            <view v-if="item.status === 'REJ'" class="reject-note">
              审核批注：{{ item.status_message || '--' }}
            </view>
            <!-- Action Buttons -->
            <view class="card-actions">
              <!-- <u-button v-if="!['EXP', 'ACT'].includes(item.status)" type="primary" size="mini" shape="circle" color="#2979ff"
                customStyle="margin:0;width:120rpx;height:52rpx;font-size:22rpx;"
                @click.stop="editEvent(item)">更新</u-button> -->
              <u-button v-if="item.is_free == 1" type="primary" shape="circle" color="#2979ff" customStyle="margin:0;width:100rpx;height:52rpx;font-size:22rpx;" @tap.stop="editEvent(item)">
                更新
              </u-button>
              <u-button type="error" shape="circle" color="#f56c6c" customStyle="margin:0;width:100rpx;height:52rpx;font-size:22rpx;" @tap.stop="removeItem(item)">删除</u-button>
              <u-button v-if="detail.user_role === 'creator'" type="primary" plain shape="circle" color="#10B981" customStyle="margin:0;width:160rpx;height:52rpx;font-size:22rpx;"
                @tap.stop="viewRegistrations(item)">报名信息</u-button>
              <!-- <u-button type="primary"  plain shape="circle" color="#FF8C00"
                customStyle="margin:0;width:100rpx;height:52rpx;font-size:22rpx;"
                @click.stop="viewEvent(item)">详情</u-button> -->
            </view>
          </view>
          <!-- Chevron -->
          <view class="card-chevron">
            <u-icon name="arrow-right" size="16" color="#D1D5DB"></u-icon>
          </view>
        </view>
      </view>
    </mescroll-body>

    <!-- Bottom Button -->
    <view class="section-bottom">
      <u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 84rpx; width: 100%;" @click="createEvent()">
        <view style="display:flex;align-items:center;gap:8rpx;">
          <u-icon name="plus" size="16" color="#FFFFFF"></u-icon>
          <text>创建活动</text>
        </view>
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  onLoad,
  onShow,
  onShareAppMessage,
  onShareTimeline,
} from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback, getMescroll } = useMescroll(
  onPageScroll,
  onReachBottom
);
import { useShare, buildPath } from "@/composables/useShare.js";

const group_id = ref("");
const eventList = ref([]);
const loading = ref(false);
const detail = ref({});
const activeTab = ref("all");

// 分享配置
useShare(() => ({
  title: "跑团活动列表",
  path: buildPath("/pagesSub/runningTeam/teamEventList", {
    group_id: group_id.value,
  }),
}));

const clubTypeName = computed(() => {
  return detail.value.club_type === "cycling" ? "车队" : "跑团";
});

// 获取俱乐部详情
const getDetail = () => {
  request
    .get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
    .then((res) => {
      detail.value = res;
    });
};

// 获取活动列表
const getList = async (mescroll) => {
  if (!group_id.value) return;
  loading.value = true;

  const data = {
    pageIndex: mescroll.num - 1,
    pageSize: 10,
  };
  // 非"全部"和"审核中"tab时，向后端传status过滤
  // "审核中"tab包含PND和REJ两种状态，不传status拉全部后前端过滤
  if (activeTab.value !== "all" && activeTab.value !== "PND") {
    data.status = activeTab.value;
  }

  request
    .get(`/event-api/fsc_events?fsc_id=${group_id.value}`, data)
    .then((res) => {
      loading.value = false;
      let list = (res.fsc_events || []).filter((i) => i.status !== "DELETED");
      // "审核中"tab前端过滤PND+REJ
      if (activeTab.value === "PND") {
        list = list.filter((i) => i.status === "PND" || i.status === "REJ");
      }
      res = list.map((item) => ({
        ...item,
        event_time: isNaN(item.event_time)
          ? dayjs(item.event_time).format("YYYY-MM-DD")
          : dayjs(Number(item.event_time)).format("YYYY-MM-DD"),
      }));

      mescroll.endSuccess(res.length);

      if (mescroll.num == 1) {
        eventList.value = [];
      }

      eventList.value = eventList.value.concat(res);
    });
};

const refreshList = () => {
  getMescroll().resetUpScroll();
  getMescroll().scrollTo(0, 0);
};

const switchTab = (tab) => {
  activeTab.value = tab;
  refreshList();
};

// 获取封面图URL（兼容单URL和JSON数组）
const getCoverUrl = (item) => {
  const url = item.background_image_url;
  if (!url) return "";
  if (url.startsWith("[")) {
    try {
      const arr = JSON.parse(url);
      return arr[0] || "";
    } catch (e) {
      return url;
    }
  }
  return url;
};

// 判断活动是否已过期（当前时间晚于 event_time）
const isExpired = (item) => {
  if (!item || !item.event_time) return false;
  const t = dayjs(item.event_time);
  return dayjs().isAfter(t);
};

// 状态样式类
const getStatusClass = (item) => {
  if (isExpired(item)) return "status-expired-custom";
  const status = item.status;
  const map = {
    PND: "status-pending",
    ACT: "status-active",
    EXP: "status-exp",
    REJ: "status-rejected",
  };
  return map[status] || "";
};

// 状态文本
const getStatusText = (item) => {
  if (isExpired(item)) return "已过期";
  const status = item.status;
  const map = {
    PND: "审核中",
    ACT: "进行中",
    EXP: "已过期",
    REJ: "审核未通过",
  };
  return map[status] || "";
};

const removeItem = (item) => {
  uni.showModal({
    title: "提示",
    content: "确定删除该活动吗？",
    success: (res) => {
      if (res.confirm) {
        const data = { event_id: item.id, status: "DELETED" };
        request.post(`/event-api/fsc_events/update`, data).then(() => {
          uni.$u.toast("操作成功");
          refreshList();
        });
      }
    },
  });
};

const createEvent = () => {
  uni.$u.route(
    `pagesSub/runningTeam/teamEventTypeSelect?group_id=${group_id.value}`
  );
};

const editEvent = (item) => {
  // uni.$u.route(`pagesSub/runningTeam/teamEventForm?id=${item.id}&group_id=${group_id.value}`);
  uni.$u.route(
    `pagesSub/runningTeam/teamEventFreeForm?id=${item.id}&group_id=${group_id.value}`
  );
};

const viewRegistrations = (item) => {
  uni.$u.route(
    `pagesSub/runningTeam/teamEventRegistrations?event_id=${
      item.id
    }&event_name=${encodeURIComponent(item.name)}`
  );
};

const viewEvent = (item) => {
  console.log("viewEvent", item);
  uni.$u.route(
    `pagesSub/runningTeam/teamEventDetail?id=${item.id}&status=${
      item.status
    }&status_message=${encodeURIComponent(item.status_message || "")}`
  );
};

onLoad((options) => {
  group_id.value = options.group_id;
  getDetail();
});

onShow(() => {
  uni.$off("updateList");
  uni.$once("updateList", (data) => {
    if (data.isChange) {
      refreshList();
    }
  });
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 160rpx;
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  background: #fafafa;
}

.tab-item {
  padding: 14rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  white-space: nowrap;
  background: #ffffff;
  color: #6b7280;
  border: 1rpx solid #e5e7eb;
  font-weight: 500;

  &.active {
    background: #ff8c00;
    color: #ffffff;
    border-color: #ff8c00;
    font-weight: 600;
  }
}

.event-list {
  padding: 16rpx 32rpx;
}

.event-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  gap: 28rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #f3f4f6;
  position: relative;

  &.status-expired {
    opacity: 0.6;
  }
}

.cover-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.cover-wrap {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.cover-wrap .status-tag {
  position: absolute;
  top: 0rpx;
  left: 0rpx;
  z-index: 2;
  margin-right: 0;
}

.cover-placeholder {
  width: 200rpx;
  height: 200rpx;
  border-radius: 24rpx;
  background: #f6f7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  flex-shrink: 0;
  padding: 4rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;

  &.status-pending {
    background: rgba(217, 119, 6, 0.1);
    color: #d97706;
  }
  &.status-active {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  &.status-exp {
    background: rgba(156, 163, 175, 0.15);
    color: #9ca3af;
  }
  &.status-rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.status-expired-custom {
    background: #999;
    color: #eee;
  }
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.reject-note {
  background: #fef2f2;
  color: #ef4444;
  font-size: 22rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  margin-top: 4rpx;
}

.card-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.card-chevron {
  position: absolute;
  right: 20rpx;
  top: 28rpx;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}
</style>
