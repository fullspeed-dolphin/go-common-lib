<template>
  <view class="page">
    <Navbar title="运动记录详情" :bgHeight="370" />

    <view class="container">
      <!-- 1. 地图部分 - 跑步路线 -->
      <section class="section-map">
        <view class="map-container">
          <map
            v-if="isValidCoordinate(mapCenter.latitude, mapCenter.longitude)"
            id="runMap"
            :latitude="mapCenter.latitude"
            :longitude="mapCenter.longitude"
            :scale="16"
            :markers="markers"
            :polyline="polylines"
            :show-location="false"
            :enable-3D="false"
            :enable-overlooking="false"
            :enable-zoom="true"
            :enable-scroll="true"
            :enable-rotate="false"
            class="map"
          ></map>
          <view v-else class="map-placeholder">
            <text>地图加载中...</text>
          </view>
        </view>
      </section>

      <!-- 2. 运动详情数据 -->
      <section class="section-detail">
        <view class="detail-header">
          <view class="total-distance">
            <view class="distance-label">总里程</view>
            <view class="distance-value">
              <text class="amount">{{
                formatDistance(activityData.totalDistance)
              }}</text>
              <text class="unit">公里</text>
            </view>
          </view>
          <view class="user-info">
            <image
              class="avatar"
              :src="activityData.userAvatar || '/static/run.png'"
              mode="aspectFill"
            ></image>
            <view class="user-text">
              <view class="user-name">{{
                activityData.userName || "用户"
              }}</view>
              <view class="activity-time">{{
                activityData.dateTime || "--"
              }}</view>
            </view>
          </view>
        </view>

        <view class="pace-indicator">
          <view class="indicator-label">慢</view>
          <view class="indicator-bar">
            <view
              class="indicator-marker"
              :style="{ left: paceIndicatorPosition + '%' }"
            ></view>
          </view>
          <view class="indicator-label">快</view>
        </view>

        <view class="stats-grid">
          <view class="stats-item">
            <view class="stats-value">{{
              formatTime(activityData.duration)
            }}</view>
            <view class="stats-label">用时</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              formatPace(activityData.avgPace)
            }}</view>
            <view class="stats-label">平均配速</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgHeartRate || "--"
            }}</view>
            <view class="stats-label">平均心率(bpm)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgCadence || "--"
            }}</view>
            <view class="stats-label">平均步频</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgStrideLength || "--"
            }}</view>
            <view class="stats-label">平均步幅(cm)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              activityData.elevationGain || "--"
            }}</view>
            <view class="stats-label">累计爬升(m)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              formatPace(activityData.fastestKm)
            }}</view>
            <view class="stats-label">最快1公里</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              activityData.totalSteps || "--"
            }}</view>
            <view class="stats-label">总步数</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ activityData.calories || "--" }}</view>
            <view class="stats-label">大卡</view>
          </view>
        </view>
      </section>

      <!-- 3. 配速数据 -->
      <section class="section-pace">
        <view class="pace-header">
          <view class="pace-title">配速</view>
          <view class="pace-summary">
            平均: {{ formatPace(activityData.avgPace) }} 公里最快:
            {{ formatPace(activityData.fastestKm) }}
          </view>
        </view>
        <view class="pace-table">
          <view class="pace-row pace-header-row">
            <view class="pace-col km-col">公里</view>
            <view class="pace-col pace-col-wide">配速/公里</view>
            <view class="pace-col time-col">累计用时</view>
          </view>
          <view class="pace-row" v-for="(item, index) in paceData" :key="index">
            <view class="pace-col km-col">{{ item.km }}</view>
            <view class="pace-col pace-col-wide">
              <view
                class="pace-bar-wrapper"
                :class="{ fastest: item.isFastest }"
              >
                <view
                  class="pace-bar"
                  :style="{ width: getPaceBarWidth(item.pace) + '%' }"
                ></view>
                <text class="pace-text">{{ formatPace(item.pace) }}</text>
              </view>
            </view>
            <view class="pace-col time-col">{{
              formatTime(item.cumulativeTime)
            }}</view>
          </view>
          <view
            class="pace-subtotal"
            v-for="(subtotal, index) in paceSubtotals"
            :key="'subtotal-' + index"
          >
            <text class="subtotal-text">{{ subtotal.text }}</text>
          </view>
        </view>
      </section>
    </view>
  </view>
</template>

<script setup>
import Navbar from "@/components/navbar.vue";
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 地图相关
const mapCenter = ref({
  latitude: 39.908823,
  longitude: 116.39747,
});
const markers = ref([]);
const polylines = ref([]);

// 活动数据
const activityData = ref({
  totalDistance: 12420, // 米
  duration: 5431, // 秒 (01:30:31)
  avgPace: 437.2, // 秒/公里 (约7'17")
  avgHeartRate: 117,
  avgCadence: 184,
  avgStrideLength: 75,
  elevationGain: 36,
  fastestKm: 401, // 秒/公里 (约6'41")
  totalSteps: 7500,
  calories: 200,
  userName: "广州凤凰悦跑团 - 阿雄",
  dateTime: "2025-09-03 18:14",
  userAvatar: "",
});

// 配速数据 (示例数据，应该从后端获取)
const paceData = ref([
  { km: 1, pace: 504, cumulativeTime: 504, isFastest: false }, // 8'24"
  { km: 2, pace: 479, cumulativeTime: 983, isFastest: false }, // 7'59"
  { km: 3, pace: 453, cumulativeTime: 1436, isFastest: false }, // 7'33"
  { km: 4, pace: 432, cumulativeTime: 1868, isFastest: false }, // 7'12"
  { km: 5, pace: 605, cumulativeTime: 2473, isFastest: false }, // 10'05"
  { km: 6, pace: 449, cumulativeTime: 2922, isFastest: false }, // 7'29"
  { km: 7, pace: 414, cumulativeTime: 3336, isFastest: false }, // 6'54"
  { km: 8, pace: 424, cumulativeTime: 3760, isFastest: false }, // 7'04"
  { km: 9, pace: 480, cumulativeTime: 4240, isFastest: false }, // 8'00"
  { km: 10, pace: 423, cumulativeTime: 4663, isFastest: false }, // 7'03"
  { km: 11, pace: 418, cumulativeTime: 5081, isFastest: false }, // 6'58"
  { km: 12, pace: 442, cumulativeTime: 5523, isFastest: false }, // 7'22"
  { km: 13, pace: 467, cumulativeTime: 5990, isFastest: false }, // 7'47"
  { km: 14, pace: 489, cumulativeTime: 6479, isFastest: false }, // 8'09"
  { km: 15, pace: 401, cumulativeTime: 6880, isFastest: true }, // 6'41" 最快
]);

const paceSubtotals = computed(() => {
  const subtotals = [];
  const km5Time = paceData.value[4]?.cumulativeTime || 0;
  const km10Time = paceData.value[9]?.cumulativeTime || 0;
  const km15Time = paceData.value[14]?.cumulativeTime || 0;

  if (km5Time > 0) {
    subtotals.push({ text: `5公里累计用时 ${formatTime(km5Time)}` });
  }
  if (km10Time > 0) {
    subtotals.push({ text: `10公里累计用时 ${formatTime(km10Time)}` });
  }
  if (km15Time > 0) {
    subtotals.push({ text: `15公里累计用时 ${formatTime(km15Time)}` });
  }
  return subtotals;
});

// 配速指示器位置 (0-100%)
const paceIndicatorPosition = computed(() => {
  const minPace = 300; // 最快配速 (秒/公里)
  const maxPace = 600; // 最慢配速 (秒/公里)
  const currentPace = activityData.value.avgPace;
  if (!currentPace || currentPace < minPace) return 0;
  if (currentPace > maxPace) return 100;
  return ((currentPace - minPace) / (maxPace - minPace)) * 100;
});

// 验证坐标是否有效
const isValidCoordinate = (latitude, longitude) => {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// 创建标记
const createMarker = (id, latitude, longitude, type) => {
  const isStart = type === "start";
  return {
    id,
    latitude,
    longitude,
    width: 40,
    height: 40,
    anchor: { x: 0.5, y: 0.5 },
    iconPath: isStart
      ? "/static/images/go@2x.png"
      : "/static/images/end@2x.png",
    title: isStart ? "起" : "终",
  };
};

// 初始化地图
const initMap = () => {
  // 生成示例轨迹点（实际应该从后端获取）
  const centerLat = mapCenter.value.latitude;
  const centerLng = mapCenter.value.longitude;
  const radius = 0.001; // 约100米的半径
  const pointCount = 30;

  const trackPoints = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * 2 * Math.PI;
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);
    trackPoints.push({ latitude: lat, longitude: lng });
  }

  if (trackPoints.length > 0) {
    // 设置地图中心为第一个点
    mapCenter.value = {
      latitude: trackPoints[0].latitude,
      longitude: trackPoints[0].longitude,
    };

    // 创建起点和终点标记
    markers.value = [
      createMarker(
        1,
        trackPoints[0].latitude,
        trackPoints[0].longitude,
        "start"
      ),
      createMarker(
        2,
        trackPoints[trackPoints.length - 1].latitude,
        trackPoints[trackPoints.length - 1].longitude,
        "end"
      ),
    ];

    // 创建轨迹线
    polylines.value = [
      {
        points: trackPoints,
        color: "#00FF00", // 绿色
        width: 8,
        arrowLine: false,
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ];
  }
};

// 格式化距离
const formatDistance = (distance) => {
  if (!distance) return "0.00";
  const km = distance / 1000;
  return km.toFixed(2);
};

// 格式化时间 (秒 -> HH:MM:SS 或 MM:SS)
const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return "--";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
};

// 格式化配速 (秒/公里 -> M'SS")
const formatPace = (pace) => {
  if (!pace || pace <= 0) return "--";
  const minutes = Math.floor(pace / 60);
  const seconds = Math.floor(pace % 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
};

// 获取配速条宽度 (用于可视化)
const getPaceBarWidth = (pace) => {
  const minPace = 300; // 最快配速
  const maxPace = 650; // 最慢配速
  if (!pace || pace < minPace) return 100;
  if (pace > maxPace) return 10;
  // 配速越快，条越短；配速越慢，条越长
  return 100 - ((pace - minPace) / (maxPace - minPace)) * 90;
};

onLoad((options) => {
  // 从路由参数或全局状态获取活动ID，然后加载数据
  // 这里使用示例数据
  console.log("页面参数:", options);
});

onMounted(() => {
  initMap();
});
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  min-height: 100vh;
}

.container {
  padding-bottom: 40rpx;
}

// 1. 地图部分
.section-map {
  width: 100%;
  height: 370rpx;
  margin-top: -370rpx;
  position: relative;
  z-index: 0;

  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .map-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #999;
    font-size: 28rpx;
  }
}

// 2. 运动详情数据部分
.section-detail {
  margin: 0 32rpx;
  margin-top: 20rpx;
  padding: 40rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;

    .total-distance {
      flex: 1;

      .distance-label {
        font-size: 30rpx;
        color: #000000;
        margin-bottom: 10rpx;
      }

      .distance-value {
        display: flex;
        align-items: flex-end;

        .amount {
          font-weight: bold;
          font-size: 64rpx;
          color: #000000;
          line-height: 1;
        }

        .unit {
          font-size: 32rpx;
          color: #000000;
          margin-left: 8rpx;
          margin-bottom: 4rpx;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      flex-shrink: 0;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        border: 2rpx solid rgba(0, 0, 0, 0.06);
      }

      .user-text {
        display: flex;
        flex-direction: column;

        .user-name {
          font-weight: 500;
          font-size: 28rpx;
          color: #000000;
          line-height: 40rpx;
        }

        .activity-time {
          font-size: 24rpx;
          color: #999999;
          margin-top: 4rpx;
        }
      }
    }
  }

  .pace-indicator {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin: 30rpx 0 40rpx;
    position: relative;

    .indicator-label {
      font-size: 24rpx;
      color: #616161;
      flex-shrink: 0;
    }

    .indicator-bar {
      flex: 1;
      height: 4rpx;
      background: linear-gradient(90deg, #94d243 0%, #ff8c00 100%);
      border-radius: 2rpx;
      position: relative;

      .indicator-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 12rpx;
        height: 12rpx;
        background: #000000;
        border-radius: 50%;
        border: 2rpx solid #ffffff;
        z-index: 1;
      }
    }
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 30rpx 0;

    .stats-item {
      width: 33.33%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 10rpx;

      .stats-value {
        font-weight: bold;
        font-size: 50rpx;
        color: #000000;
        line-height: 1.2;
        margin-bottom: 16rpx;
        text-align: center;
      }

      .stats-label {
        font-size: 24rpx;
        color: #666666;
        text-align: center;
      }
    }
  }
}

// 3. 配速数据部分
.section-pace {
  margin: 30rpx 32rpx 0;
  padding: 30rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);

  .pace-header {
    margin-bottom: 30rpx;

    .pace-title {
      font-weight: 500;
      font-size: 32rpx;
      color: #000000;
      margin-bottom: 10rpx;
    }

    .pace-summary {
      font-size: 24rpx;
      color: #666666;
      line-height: 34rpx;
    }
  }

  .pace-table {
    .pace-row {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &.pace-header-row {
        border-bottom: 2rpx solid #e7e7e7;
        padding-bottom: 20rpx;
        margin-bottom: 10rpx;

        .pace-col {
          font-weight: 500;
          font-size: 24rpx;
          color: #666666;
        }
      }

      .pace-col {
        font-size: 28rpx;
        color: #000000;

        &.km-col {
          width: 100rpx;
          flex-shrink: 0;
          text-align: left;
        }

        &.pace-col-wide {
          flex: 1;
          padding: 0 20rpx;
        }

        &.time-col {
          width: 140rpx;
          flex-shrink: 0;
          text-align: right;
        }
      }

      .pace-bar-wrapper {
        position: relative;
        height: 40rpx;
        display: flex;
        align-items: center;

        .pace-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 28rpx;
          background: #ff8c00;
          border-radius: 4rpx;
          min-width: 40rpx;
        }

        .pace-text {
          position: relative;
          z-index: 1;
          margin-left: 10rpx;
          font-size: 24rpx;
          color: #000000;
          white-space: nowrap;
        }

        &.fastest {
          .pace-bar {
            background: #ff4444;
          }

          .pace-text {
            color: #ff4444;
            font-weight: bold;
          }
        }
      }
    }

    .pace-subtotal {
      padding: 20rpx 0 10rpx;
      text-align: center;

      .subtotal-text {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }
}
</style>
