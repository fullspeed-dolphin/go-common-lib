<template>
  <view class="page">
    <u-navbar title="" autoBack bgColor="transparent" />
    <section class="section-map">
      <view class="map-container">
        <map v-if="isValidCoordinate(mapCenter.latitude, mapCenter.longitude)" id="runMap" :latitude="latitude" :longitude="longitude" :scale="mapScale" :markers="markers" :polyline="polylines" :show-location="false"
          :enable-3D="false" :enable-overlooking="false" :enable-zoom="true" :enable-scroll="true" :enable-rotate="false" class="map"></map>
        <view v-else class="map-placeholder">
          <text>地图加载中...</text>
        </view>
      </view>
    </section>

    <view class="container" :class="activeHuawei ? 'active-huawei' : ''">
      <section class="section-detail">
        <view class="detail-header">
          <view class="total-distance">
            <view class="distance-label">总里程</view>
            <view class="distance-value">
              <text class="amount">{{ detail.distance_in_meters}}</text>
              <text class="unit">公里</text>
            </view>
          </view>
          <view class="user-info">
            <image class="avatar" :src="
			      routerParams?.avatar_url ||
			      'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
			    " mode="aspectFill"></image>
            <view class="user-text">
              <view class="user-name">{{ routerParams?.nickname || "用户" }}</view>
              <view class="activity-time">{{ detail.start_time || "--" }}</view>
            </view>
          </view>
        </view>

        <view class="pace-indicator">
          <view class="indicator-label slow">慢</view>
          <view class="indicator-bar">
            <view class="indicator-marker" :style="{ left: paceIndicatorPosition + '%' }"></view>
          </view>
          <view class="indicator-label fast">快</view>
        </view>

        <view class="stats-grid">
          <view class="stats-item">
            <view class="stats-value">{{ detail.duration_in_seconds || "--" }}</view>
            <view class="stats-label">用时</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.average_pace || "--" }}</view>
            <view class="stats-label">平均配速</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.average_heart_rate || "--" }}</view>
            <view class="stats-label">平均心率(bpm)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.average_run_cadence || "--"}}</view>
            <view class="stats-label">平均步频(步/分钟)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.average_speed || "--" }}</view>
            <view class="stats-label">平均速度(m/s)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.total_elevation_gain || "--" }}</view>
            <view class="stats-label">累计爬升(m)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{  detail.max_speed || "--" }}</view>
            <view class="stats-label">最大速度(m/s)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{  detail.steps || "--" }}</view>
            <view class="stats-label">总步数</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ detail.active_kilocalories || "--" }}</view>
            <view class="stats-label">大卡</view>
          </view>
        </view>
      </section>

      <!-- 3. 配速数据 -->
      <section class="section-pace" v-if="activeHuawei">
        <view class="pace-header">
          <view class="pace-title">配速</view>
          <view class="pace-summary">
            平均: {{ formatPace(paceData.avg_pace) }} 公里最快:
            {{ formatPace(paceData.best_pace) }}
          </view>
        </view>
        <view class="pace-table">
          <view class="pace-row pace-header-row">
            <view class="pace-col km-col">公里</view>
            <view class="pace-col pace-col-wide">配速/公里</view>
            <view class="pace-col time-col">累计用时</view>
          </view>
          <view class="pace-row" v-for="(item, index) in paceData.splits" :key="index">
            <view class="pace-col km-col">{{ item.kilometer }}</view>
            <view class="pace-col pace-col-wide">
              <view class="pace-bar-wrapper" :class="{ fastest: item.isFastest }">
                <view class="pace-bar" :style="{ width: getPaceBarWidth(item.pace) + '%' }"></view>
                <text class="pace-text">{{ formatPace(myTime(item.pace,'.')) }}</text>
              </view>
            </view>
            <view class="pace-col time-col">{{
                myTime(item.cumulative_time)
              }}</view>
          </view>
          <!-- <view v-else-if="item.type === 'subtotal'" class="pace-subtotal">
              <text class="subtotal-text">{{ item.text }}</text>
            </view> -->
        </view>
      </section>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import * as turf from "@turf/turf";
import {
  createMarker,
  formatPace,
  calculatePaceFromMeters,
  getTime,
  generateSpeedPolylines,
  getCenterScale,
} from "./assets/utils.js";

import { useShare, buildPath } from "@/composables/useShare.js";

useShare(() => ({
  title: `${routerParams.value?.nickname || "用户"}的运动详情`,
  path: buildPath("/pagesSport/runDetail", {
    nickname: routerParams.value.nickname,
    avatar_url: routerParams.value.avatar_url,
    id: routerParams.value.id,
  }),
}));

const mapCenter = ref({});
const markers = ref([]);
const polylines = ref([]);
const mapScale = ref(15);
const latitude = ref(0);
const longitude = ref(0);

const activityData = ref({
  totalDistance: 0, // 米
  duration: 0, // 秒
  avgPace: 0, // 秒/公里
  fastestKm: 0, // 秒/公里
  userName: "",
  dateTime: "",
  userAvatar: "",
});

const paceData = ref([]);

const paceSubtotals = computed(() => {
  const subtotals = [];
  const km5Time = paceData.value[4]?.cumulativeTime || 0;
  const km10Time = paceData.value[9]?.cumulativeTime || 0;
  const km15Time = paceData.value[14]?.cumulativeTime || 0;

  if (km5Time > 0) {
    subtotals.push({
      text: `5公里累计用时 ${formatTime(km5Time)}`,
    });
  }
  if (km10Time > 0) {
    subtotals.push({
      text: `10公里累计用时 ${formatTime(km10Time)}`,
    });
  }
  if (km15Time > 0) {
    subtotals.push({
      text: `15公里累计用时 ${formatTime(km15Time)}`,
    });
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

// 初始化地图
const initMap = (tracks) => {
  if (!tracks || !tracks.length) return;

  // 统一数值类型并过滤无效点
  const trackPoints = tracks
    .map((p) => ({
      ...p,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
    }))
    .filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude));

  if (!trackPoints.length) return;

  // 计算边界盒（bbox）并设置中心为 bbox 中心
  const coords = trackPoints.map((item) => [item.longitude, item.latitude]);
  const features = turf.points(coords);
  const bbox = turf.bbox(features); // [minLng, minLat, maxLng, maxLat]
  const centerLng = (bbox[0] + bbox[2]) / 2;
  const centerLat = (bbox[1] + bbox[3]) / 2;

  mapCenter.value = { latitude: centerLat, longitude: centerLng };
  longitude.value = centerLng;
  latitude.value = centerLat;

  // 先创建标记（保留原有逻辑）
  let tempArr = [];
  let flag = false; // 标记是否超过5公里
  let flagFieldTotalDistance = true; // 标记是否有total_distance字段
  let tempAPoints = trackPoints.filter((item, index) => {
    if (!item.total_distance) {
      flagFieldTotalDistance = false;
      if (index === 0) return item;
    } else {
      if (trackPoints[trackPoints.length - 1].total_distance > 5000) {
        flag = true;
        if (!tempArr.includes(parseInt(item.total_distance / 1000))) {
          tempArr.push(parseInt(item.total_distance / 1000));
          return item;
        }
      } else {
        if (!tempArr.includes(parseInt(item.total_distance / 500))) {
          tempArr.push(parseInt(item.total_distance / 500));
          return item;
        }
      }
    }
    if (index === trackPoints.length - 1) return item;
  });

  markers.value = tempAPoints.map((item, index) => {
    if (!flagFieldTotalDistance) {
      return createMarker(
        index + 1,
        tempAPoints[index].latitude,
        tempAPoints[index].longitude,
        "start",
        index ? (+detail.value.distance_in_meters).toFixed(1) : 0
      );
    } else {
      if (index === tempAPoints.length - 1) {
        return createMarker(
          index + 1,
          tempAPoints[index].latitude,
          tempAPoints[index].longitude,
          "start",
          (item.total_distance / 1000).toFixed(1)
        );
      } else {
        if (flag) {
          return createMarker(
            index + 1,
            tempAPoints[index].latitude,
            tempAPoints[index].longitude,
            "start",
            index * 1
          );
        } else {
          return createMarker(
            index + 1,
            tempAPoints[index].latitude,
            tempAPoints[index].longitude,
            "start",
            index * 0.5
          );
        }
      }
    }
  });

  // 创建彩色轨迹线
  polylines.value = generateSpeedPolylines(trackPoints);

  // 如果只有一个点，直接设置一个合适的缩放
  if (trackPoints.length === 1) {
    mapScale.value = 17;
    // 确保地图中心指向该点
    longitude.value = trackPoints[0].longitude;
    latitude.value = trackPoints[0].latitude;
    return;
  }

  // 根据 bbox 调整地图视野，使用 mapContext.includePoints 以保证所有点都可见
  setTimeout(() => {
    try {
      const mapCtx = uni.createMapContext("runMap");
      mapCtx.includePoints({
        padding: [100, 60, 200, 60], // 100 用于避免顶部header覆盖轨迹，200 用于避免底部container覆盖轨迹
        points: trackPoints.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
        })),
      });
    } catch (e) {
      console.warn("includePoints failed", e);
      // 兜底：依然根据起终点与中心计算一个缩放
      mapScale.value = getCenterScale(
        trackPoints[0],
        trackPoints[trackPoints.length - 1],
        mapCenter.value
      );
    }
  }, 200);
};

const detail = ref({});
const activeHuawei = ref(false);
const loadSportData = async () => {
  uni.showLoading({
    title: "加载中...",
    mask: true,
  });

  // 用户运动数据，配速数据，
  const params = {
    id: routerParams.value.id,
    page: 1,
    page_size: 10,
  };
  Promise.all([
    request.get("/sport-api/api/healthdata/detail", params),
    request.get(`/sport-api/api/healthdata/track?id=${routerParams.value.id}`),
  ]).then((res) => {
    // console.log("res===promise",res)
    res[0].average_pace = calculatePaceFromMeters(
      res[0].distance_in_meters,
      res[0].duration_in_seconds
    );
    res[0].duration_in_seconds = getTime(res[0].duration_in_seconds);
    res[0].average_run_cadence = parseInt(res[0].average_run_cadence || 0);
    res[0].average_speed = res[0].average_speed?.toFixed(2);
    res[0].distance_in_meters = (res[0].distance_in_meters / 1000)?.toFixed(2);
    res[0].start_time = dayjs(res[0].start_time).format("YYYY-MM-DD HH:mm:ss");

    detail.value = res[0];
    detail.value.max_speed = res[0].max_speed?.toFixed(2);

    initMap(res[1].points || []);
    // detail.value.averageRate = parseInt(
    //   res[1].points
    //     .map((item) => item.heart_rate)
    //     .reduce((acc, curr) => acc + curr, 0) / res[1].points.length
    // );
  });
  
  // 查询活动每公里配速分段数据
  if (routerParams.value.device === "1") {
    request
      .get(`/sport-api/api/healthdata/pace-splits?id=${routerParams.value.id}`)
      .then((res) => {
        activeHuawei.value = true;
        paceData.value = res;
        paceData.value.avg_pace = myTime(res.avg_pace, "."); //(res.avg_pace / 60).toFixed(2)
        paceData.value.best_pace = myTime(res.best_pace, "."); //(res.best_pace / 60).toFixed(2)
      });
  }
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

function myTime(seconds, type = ":") {
  // 转为对应的 时, 分, 秒
  let h = parseInt((seconds / 60 / 60) % 24);
  let m = parseInt((seconds / 60) % 60);
  let s = parseInt(seconds % 60);
  // 自动补零
  h = h > 9 ? h : "0" + h;
  m = m > 9 ? m : "0" + m;
  s = s > 9 ? s : "0" + s;
  // 拼接字符串
  let timestr = `${h}${type}${m}${type}${s}`;
  if (type === ".") {
    return m + type + s;
  }
  return timestr;
}
// 获取配速条宽度 (用于可视化)
const getPaceBarWidth = (pace) => {
  const minPace = 300; // 最快配速
  const maxPace = 650; // 最慢配速
  if (!pace || pace < minPace) return 100;
  if (pace > maxPace) return 10;
  
  return (pace / 650) * 100;
};

const routerParams = ref({});
onLoad((options) => {
  routerParams.value = {
    id: options.id,
    nickname: decodeURIComponent(options.nickname || ""),
    avatar_url: decodeURIComponent(options.avatar_url || ""),
    device: options.device,
  };

  loadSportData();
});
</script>

<style lang="scss" scoped>
.page {
  background: #fafafa;
  min-height: 100vh;
}

.container {
  position: absolute;
  z-index: 10;
  padding-bottom: 40rpx;
  bottom: 0;
  &.active-huawei {
    top: 53%;
    height: 100vh;
  }
}

.section-map {
  width: 100%;
  height: 100vh;
  position: relative;
  z-index: 0;

  .map-container {
    width: 100%;
    height: 70%;
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