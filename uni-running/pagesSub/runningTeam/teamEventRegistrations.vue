<template>
  <view class="page-container">
    <u-navbar :title="eventName || '报名信息'" autoBack placeholder>
      <!-- <template #right>
        <u-icon name="download" size="20" color="#1A1A1A" @click="exportToExcel"></u-icon>
      </template> -->
    </u-navbar>

    <view v-if="loading" class="loading-wrap">
      <u-loading-icon size="28"></u-loading-icon>
    </view>

    <view v-else-if="list.length === 0" class="empty-wrap">
      <u-empty text="暂无报名记录" mode="data"></u-empty>
    </view>

    <view v-else class="reg-list">
      <view class="summary-bar">
        <text class="summary-text">共 {{ list.length }} 人报名</text>
        <view @click="exportToExcel" style="color:#2979ff;font-size:26rpx;display: flex;align-items: center;">
          <text>预览报名表</text>
          <u-icon name="download" size="26" color="#2979ff" @click="exportToExcel"></u-icon>
        </view>
      </view>

      <view class="reg-card" v-for="item in list" :key="item.id">
        <image class="avatar" :src="item.avatar_url || '/static/images/user.png'" mode="aspectFill" />
        <view class="reg-info">
          <view class="info-row name-row">
            <text class="nickname">{{ item.nickname || '未设置昵称' }}</text>
            <view class="status-tag" :class="item.status === 'SUCC' ? 'tag-succ' : 'tag-cxl'">
              <text>{{ item.status === 'SUCC' ? '已报名' : '已取消' }}</text>
            </view>
          </view>
          <view class="info-row" v-if="item.real_name">
            <text class="label">姓名</text>
            <text class="value">{{ item.real_name }}</text>
          </view>
          <view class="info-row" v-if="item.contact_number">
            <text class="label">手机</text>
            <text class="value">{{ item.contact_number }}</text>
          </view>
          <view class="info-row">
            <text class="label">报名时间</text>
            <text class="value">{{ formatTime(item.created_at) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

const eventId = ref("");
const eventName = ref("");
const list = ref([]);
const loading = ref(true);

const exportToExcel = () => {
  if (list.value.length === 0) {
    uni.showToast({ title: '无数据可导出', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '正在生成文件...' });
  const data = list.value.map(item => ({
    昵称: item.nickname || '未设置昵称',
    姓名: item.real_name || '',
    手机: item.contact_number || '',
    报名时间: formatTime(item.created_at),
    状态: item.status === 'SUCC' ? '已报名' : '已取消'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '报名列表');
  const fileName = `${eventName.value || '报名信息'}_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`;

// 设置自定义列宽（可选）
// ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }];

const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
const filePath = `${wx.env.USER_DATA_PATH}/${eventName.value || '报名信息'}_${dayjs().format('YYYYMMDD')}.xlsx`;

const fs = wx.getFileSystemManager();
fs.writeFile({
  filePath,
  data: wbout,
  encoding: 'binary',
  success: () => {
    wx.openDocument({
      filePath,
      showMenu: true, // 显示右上角菜单（支持转发）
      success: () => console.log('预览成功'),
      // fail: () => wx.showToast({ title: '预览失败', icon: 'error' })
       fail: err => console.error('预览失败', err)
    });
  },
  fail: err => console.error('写入失败', err),
  complete: () => uni.hideLoading()
});
};

const getRegistrations = () => {
  loading.value = true;
  request.get(`/event-api/fsc_events/${eventId.value}/registrations`).then(res => {
    list.value = res.registrations || [];
  }).finally(() => {
    loading.value = false;
  });
};

const formatTime = (t) => {
  return dayjs(t).format('YYYY-MM-DD HH:mm');
};

onLoad((options) => {
  eventId.value = options.event_id;
  eventName.value = options.event_name ? decodeURIComponent(options.event_name) : '';
  getRegistrations();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-wrap {
  padding-top: 200rpx;
}

.summary-bar {
  padding: 20rpx 32rpx 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-text {
  font-size: 26rpx;
  color: #6B7280;
  font-weight: 500;
}

.reg-list {
  padding-bottom: 40rpx;
}

.reg-card {
  background: #FFFFFF;
  margin: 16rpx 32rpx;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  gap: 24rpx;
  border: 1rpx solid #F3F4F6;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.reg-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nickname {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.status-tag {
  flex-shrink: 0;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.tag-succ {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.tag-cxl {
  background: rgba(156, 163, 175, 0.15);
  color: #9CA3AF;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.label {
  font-size: 24rpx;
  color: #9CA3AF;
  width: 120rpx;
  flex-shrink: 0;
}

.value {
  font-size: 24rpx;
  color: #4B5563;
}
</style>
