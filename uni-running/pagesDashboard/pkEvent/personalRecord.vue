<template>
  <div v-if="userCheckedInfo.required_checkins">
    <div class='section-panel' style="padding-bottom:40rpx;">
      <u-cell title="我的战绩" customClass="section-title" :border="false" isLink value="查看全部" @click="popupVisible = true" />

      <div class="flex-row u-mt-20">
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{userCheckedInfo.total_distance_km}}
            <text class="c6 fs24">km</text>
          </view>
          <text class="c6 fs24">跑步总量</text>
        </view>
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{ userCheckedInfo.total_qualified_sessions }}/{{ userCheckedInfo.required_checkins }}</view>
          <text class="c6 fs24">打卡次数</text>
        </view>
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{ userCheckedInfo.checkedPercent }}%</view>
          <text class="c6 fs24">打卡进度</text>
        </view>
      </div>
    </div>

    <!-- 弹窗显示记录列表 -->
    <u-popup :show="popupVisible" mode="bottom" z-index="20" :closeable="true" @close="popupVisible = false">
      <view class="checkin-popup-content">
        <view class="checkin-popup-header">
          <text class="checkin-popup-title">我的打卡记录</text>
          <text class="checkin-popup-subtitle">共 {{ userCheckedInfo.checkins?.length || 0 }} 条记录</text>
        </view>
        <scroll-view scroll-y class="checkin-record-list">
          <view v-for="(record, idx) in userCheckedInfo.checkins" :key="record.id" class="checkin-record-card">
            <view class="checkin-card-top">
              <text class="checkin-card-index">{{ new Date(record.check_date).toLocaleDateString() }} 第 {{ getDailyIndex(idx) }} 次打卡</text>
            </view>
            <view class="checkin-card-body">
              <view class="checkin-stat">
                <text class="checkin-stat-value">{{ record.km }}</text>
                <text class="checkin-stat-label">公里</text>
              </view>
              <view class="checkin-stat">
                <text class="checkin-stat-value">{{ record.time }}</text>
                <text class="checkin-stat-label">时长</text>
              </view>
              <view class="checkin-stat">
                <text class="checkin-stat-value">{{ record.speed }}</text>
                <text class="checkin-stat-label">配速</text>
              </view>
            </view>
            <view v-if="record.image_url" class="checkin-card-image" @click="previewImage(record.image_url)">
              <up-lazy-load height="180" borderRadius="12" :is-effect="false" :image="
                record.image_url + '?x-oss-process=image/resize,w_600,h_180,m_fill'
              " mode="aspectFill"/>
              <text class="checkin-image-tip">点击查看大图</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";

const props = defineProps({
  activetyId: {
    type: [String, Number],
    required: true,
  },
});

const popupVisible = ref(false);

const userCheckedInfo = ref({});
function getuserCheckedInfo() {
  request.get("/user-api/user/getEventCheckins?event_id=" + props.activetyId, {}, { showError: false }).then((res) => {
    res.checkedPercent = res.required_checkins ? Math.round(res.total_qualified_sessions / res.required_checkins * 100) : 0
    userCheckedInfo.value = res;
  }).catch(() => {});
}

function getDailyIndex(idx) {
  const records = userCheckedInfo.value.checkins || [];
  const currentDate = new Date(records[idx].check_date).toLocaleDateString();
  let count = 1;
  for (let i = 0; i < idx; i++) {
    if (new Date(records[i].check_date).toLocaleDateString() === currentDate) {
      count++;
    }
  }
  return count;
}

function previewImage(url) {
  const urls = (userCheckedInfo.value.checkins || [])
    .filter(r => r.image_url)
    .map(r => r.image_url);
  uni.previewImage({ urls, current: url });
}

watch(() => props.activetyId, (newVal) => {
  if (newVal) {
    getuserCheckedInfo();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
  ::v-deep {
		.section-title {
			.u-cell__body {
				padding: 20rpx 20rpx 20rpx;
			}
      .u-cell__title-text {
        font-weight: 500;
        font-size: 32rpx;
        color: #222;
      }
      .uicon-arrow-right,
      .u-cell__value {
        color: #999;
      }
    }
  }

.section-panel {
  padding: 0rpx 0rpx 20rpx;
  background-color: white;
  border-radius: 24rpx;
  margin: 0 30rpx 30rpx;
  font-weight: 500;
  color: #364153;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
</style>

<!-- 弹窗样式不能 scoped，因为 u-popup 内容渲染在组件 DOM 树之外 -->
<style lang="scss">
.checkin-popup-content {
  height: 80vh;
  background-color: #f5f5f5;
  border-radius: 24rpx 24rpx 0 0;
  padding: 0 30rpx;

  .checkin-popup-header {
    text-align: center;
    padding: 36rpx 0 24rpx;

    .checkin-popup-title {
      display: block;
      font-size: 34rpx;
      font-weight: 600;
      color: #1e2939;
    }

    .checkin-popup-subtitle {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .checkin-record-list {
    height: calc(80vh - 120rpx);

    .checkin-record-card {
      background: #fff;
      border-radius: 20rpx;
      padding: 28rpx 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    }

    .checkin-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .checkin-card-index {
        font-size: 26rpx;
        font-weight: 600;
        color: var(--theme-color, #ff5c5c);
      }
    }

    .checkin-card-body {
      display: flex;
      justify-content: space-around;
      padding: 16rpx 0 24rpx;
      border-top: 1rpx solid #f0f0f0;
      border-bottom: 1rpx solid #f0f0f0;
    }

    .checkin-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .checkin-stat-value {
        font-size: 32rpx;
        font-weight: 600;
        color: #1e2939;
      }

      .checkin-stat-label {
        font-size: 22rpx;
        color: #999;
      }
    }

    .checkin-card-image {
      margin-top: 24rpx;
      border-radius: 12rpx;
      overflow: hidden;
      position: relative;

      .checkin-image-tip {
        position: absolute;
        right: 12rpx;
        bottom: 12rpx;
        font-size: 20rpx;
        color: #fff;
        background: rgba(0, 0, 0, 0.45);
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
      }
    }
  }
}
</style>