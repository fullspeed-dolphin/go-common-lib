<template>
  <view class="page">
    <u-navbar title="" autoBack bgColor="transparent" />
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
    <view class="container">
      <!-- 1. 地图部分 - 跑步路线 -->

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
              :src="
                activityData.userAvatar ||
                'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
              "
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
          <view class="indicator-label slow">慢</view>
          <view class="indicator-bar">
            <view
              class="indicator-marker"
              :style="{ left: paceIndicatorPosition + '%' }"
            ></view>
          </view>
          <view class="indicator-label fast">快</view>
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
          <!-- <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgHeartRate || "--"
            }}</view>
            <view class="stats-label">平均心率(bpm)</view>
          </view> -->
          <!-- <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgCadence || "--"
            }}</view>
            <view class="stats-label">平均步频</view>
          </view> -->
          <!-- <view class="stats-item">
            <view class="stats-value">{{
              activityData.avgStrideLength || "--"
            }}</view>
            <view class="stats-label">平均步幅(cm)</view>
          </view> -->
          <!-- <view class="stats-item">
            <view class="stats-value">{{
              activityData.elevationGain || "--"
            }}</view>
            <view class="stats-label">累计爬升(m)</view>
          </view> -->
          <view class="stats-item">
            <view class="stats-value">{{
              formatPace(activityData.fastestKm)
            }}</view>
            <view class="stats-label">最快1公里</view>
          </view>
          <!-- <view class="stats-item">
            <view class="stats-value">{{
              activityData.totalSteps || "--"
            }}</view>
            <view class="stats-label">总步数</view>
          </view> -->
          <!-- <view class="stats-item">
            <view class="stats-value">{{ activityData.calories || "--" }}</view>
            <view class="stats-label">大卡</view>
          </view> -->
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
          <template
            v-for="(item, index) in paceDataWithSubtotals"
            :key="item.key"
          >
            <view v-if="item.type === 'data'" class="pace-row">
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
            <view v-else-if="item.type === 'subtotal'" class="pace-subtotal">
              <text class="subtotal-text">{{ item.text }}</text>
            </view>
          </template>
        </view>
      </section>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import store from "@/store/index.js";

const mapCenter = ref({
  latitude: 39.908823,
  longitude: 116.39747,
});
const markers = ref([]);
const polylines = ref([]);

// 加载状态
const loading = ref(false);

// 活动数据
const activityData = ref({
  totalDistance: 0, // 米
  duration: 0, // 秒
  avgPace: 0, // 秒/公里
  fastestKm: 0, // 秒/公里
  userName: "",
  dateTime: "",
  userAvatar: "",
});

// 配速数据
const paceData = ref([]);

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

// 将配速数据和累计用时小计混合在一起，每5条记录后插入一个subtotal
const paceDataWithSubtotals = computed(() => {
  const result = [];
  const data = paceData.value;

  for (let i = 0; i < data.length; i++) {
    // 添加数据项
    result.push({
      type: "data",
      key: `data-${i}`,
      ...data[i],
    });

    // 每5条记录后插入subtotal
    if ((i + 1) % 5 === 0 && i < data.length) {
      const km = (i + 1) * 1; // 公里数：5, 10, 15...
      const cumulativeTime = data[i].cumulativeTime;

      result.push({
        type: "subtotal",
        key: `subtotal-${km}`,
        text: `${km}公里累计用时 ${formatTime(cumulativeTime)}`,
      });
    }
  }

  return result;
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
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/go@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/end@2x.png",
    title: isStart ? "起" : "终",
  };
};

// 初始化地图
const initMap = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return;
  }

  // 转换轨迹点格式
  const trackPoints = tracks.map((track) => ({
    latitude: track.lat,
    longitude: track.lon,
  }));

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

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return "--";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return dateString;
  }
};

// 计算两个时间之间的秒数差
const getSecondsBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.floor((end - start) / 1000);
  } catch (e) {
    return 0;
  }
};

// 加载运动数据
const loadSportData = async (id) => {
  if (!id) {
    uni.$u.toast("缺少运动记录ID");
    return;
  }

  loading.value = true;
  uni.showLoading({
    title: "加载中...",
    mask: true,
  });

  try {
    const res = await request.get(`/sport-api/api/manual`, { id });

    // 处理活动数据
    activityData.value = {
      totalDistance: res.meters || 0,
      duration: res.seconds || 0,
      avgPace: res.seconds_per_km || 0,
      fastestKm: 0, // 稍后从 km_splits 计算
      userName: store.state.userInfo?.nickname || "用户",
      dateTime: formatDateTime(res.sport_started_at),
      userAvatar: store.state.userInfo?.avatar_url || "",
    };

    // 处理配速数据
    if (res.geojson.km_splits && res.geojson.km_splits.length > 0) {
      let cumulativeTime = 0;
      let fastestPace = Infinity;
      let fastestIndex = -1;

      paceData.value = res.geojson.km_splits.map((split, index) => {
        cumulativeTime += split.seconds || 0;
        const pace = split.seconds_per_km || 0;

        // 找到最快配速（只考虑有效的配速值）
        if (pace > 0 && pace < fastestPace) {
          fastestPace = pace;
          fastestIndex = index;
        }

        return {
          km: index + 1,
          pace: pace,
          cumulativeTime: cumulativeTime,
          isFastest: false, // 稍后设置
        };
      });

      // 标记最快配速
      if (fastestIndex >= 0 && fastestPace !== Infinity) {
        paceData.value[fastestIndex].isFastest = true;
        activityData.value.fastestKm = fastestPace;
      } else if (res.seconds_per_km > 0) {
        // 如果没有分段数据，使用平均配速作为最快配速
        activityData.value.fastestKm = res.seconds_per_km;
      }
    } else {
      paceData.value = [];
      // 如果没有分段数据，使用平均配速作为最快配速
      if (res.seconds_per_km > 0) {
        activityData.value.fastestKm = res.seconds_per_km;
      }
    }

    // 处理地图轨迹
    if (res.geojson && res.geojson.tracks && res.geojson.tracks.length > 0) {
      initMap(res.geojson.tracks);
    }
  } catch (error) {
    console.error("加载运动数据失败:", error);
    uni.$u.toast("加载数据失败");
  } finally {
    loading.value = false;
    uni.hideLoading();
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
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

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
  const totalSeconds = Math.round(pace);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
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
  // 从路由参数获取活动ID
  const id = options.id;
  if (id) {
    loadSportData(id);
  } else {
    uni.$u.toast("缺少运动记录ID");
  }
});
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  min-height: 100vh;
}

.container {
  position: relative;
  z-index: 10;
  margin-top: -319rpx;
  padding-bottom: 40rpx;
}

// 1. 地图部分
.section-map {
  width: 100%;
  height: 100vh;
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
  position: relative;
  margin-top: 20rpx;
  padding: 20rpx 16rpx;
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
        font-weight: 500;
        font-size: 30rpx;
        color: #999999;
        margin-bottom: 10rpx;
      }

      .distance-value {
        display: flex;
        align-items: flex-end;

        .amount {
          font-weight: bold;
          font-size: 100rpx;
          color: #000000;
          line-height: 1;
        }

        .unit {
          font-weight: 500;
          font-size: 30rpx;
          color: #999999;
          margin-left: 8rpx;
          margin-bottom: 10rpx;
        }
      }
    }

    .user-info {
      position: static;
      display: flex;
      align-items: center;
      gap: 16rpx;
      flex-shrink: 0;
      margin-top: 50rpx;

      .avatar {
        position: absolute;
        top: -56rpx;
        right: 20rpx;
        width: 112rpx;
        height: 112rpx;
        border: 2rpx solid rgba(0, 0, 0, 0.06);
        border-radius: 50%;
      }

      .user-text {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .user-name {
          font-weight: 500;
          font-size: 30rpx;
          color: #000000;
        }

        .activity-time {
          font-weight: 500;
          font-size: 24rpx;
          color: #999999;
          margin-top: 10rpx;
        }
      }
    }
  }

  .pace-indicator {
    position: relative;
    display: flex;
    align-items: center;
    margin: 30rpx 0 40rpx;
    position: relative;

    .indicator-label {
      position: absolute;
      z-index: 1;
      font-size: 24rpx;
      font-weight: 500;
      flex-shrink: 0;
      background: #fff;
      padding: 0 4rpx;
      &.slow {
        color: #94d243;
        left: 56rpx;
      }
      &.fast {
        color: #ff8c00;
        position: absolute;
        right: 56rpx;
      }
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
        font-size: 44rpx;
        font-weight: bold;
        color: #000000;
        line-height: 1.2;
        margin-bottom: 16rpx;
        text-align: center;
      }

      .stats-label {
        font-size: 30rpx;
        color: #999999;
        text-align: center;
      }
    }
  }
}

// 3. 配速数据部分
.section-pace {
  margin: 30rpx 0;
  padding: 20rpx 16rpx;
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);

  .pace-header {
    margin-bottom: 30rpx;

    .pace-title {
      font-weight: 800;
      font-size: 34rpx;
      color: #000000;
      margin-bottom: 28rpx;
    }

    .pace-summary {
      font-weight: bold;
      font-size: 26rpx;
      color: #000000;
    }
  }

  .pace-table {
    .pace-row {
      display: flex;
      align-items: center;
      padding: 6rpx 0;

      &.pace-header-row {
        padding-bottom: 20rpx;
        margin-bottom: 10rpx;

        .pace-col {
          font-weight: bold;
          font-size: 26rpx;
          color: #43a047;
        }
      }

      .pace-col {
        font-weight: 800;
        font-size: 26rpx;
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
        background: #f1f2f6;
        border-radius: 20rpx;

        .pace-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 40rpx;
          background: #ff8c00;
          border-radius: 20rpx;
          min-width: 40rpx;
        }

        .pace-text {
          position: relative;
          z-index: 1;
          margin-left: 10rpx;
          font-size: 24rpx;
          color: #fff;
          white-space: nowrap;
        }

        &.fastest {
          .pace-bar {
            background: #ff4444;
          }

          .pace-text {
            color: #fff;
            font-weight: bold;
          }
        }
      }
    }

    .pace-subtotal {
      padding: 24rpx 0;
      text-align: left;

      .subtotal-text {
        font-weight: 800;
        font-size: 24rpx;
        color: #000000;
      }
    }
  }
}
</style>
