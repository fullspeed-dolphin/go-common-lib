<template>
  <view class="page">
    <u-navbar title="" autoBack bgColor="transparent" />
    <section class="section-map">
      <view class="map-container">
        <map v-if="isValidCoordinate(mapCenter.latitude, mapCenter.longitude)" id="runMap" :latitude="mapCenter.latitude" :longitude="mapCenter.longitude" :scale="16" :markers="markers" :polyline="polylines"
          :show-location="false" :enable-3D="false" :enable-overlooking="false" :enable-zoom="true" :enable-scroll="true" :enable-rotate="false" class="map"></map>
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
                // formatDistance(activityData.totalDistance)
				dataInfo.distance_in_meters
              }}</text>
              <text class="unit">公里</text>
            </view>
          </view>
          <view class="user-info">
			  
			  <image class="avatar" :src="
			      userInfo.avatar_url ||
			      'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
			    " mode="aspectFill"></image>
            <!-- <image class="avatar" :src="
                activityData.userAvatar ||
                'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
              " mode="aspectFill"></image> -->
            <view class="user-text">
              <view class="user-name">{{
                userInfo.nickname || "用户"
              }}</view>
              <view class="activity-time">{{
                dataInfo.start_time || "--"
              }}</view>
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
            <view class="stats-value">{{
			  dataInfo.totalTime || "--"
            }}</view>
            <view class="stats-label">用时</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // formatPace(activityData.avgPace)
			  dataInfo.averagePace || "--"
            }}</view>
            <view class="stats-label">平均配速</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // activityData.avgHeartRate || "--"
			  dataInfo.averageRate || "--"
            }}</view>
            <view class="stats-label">平均心率(bpm)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // activityData.avgCadence || "--"
			  dataInfo.averageCadence || "--"
            }}</view>
            <view class="stats-label">平均步频</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // activityData.avgStrideLength || "--"
			  dataInfo.averageStride || "--"
            }}</view>
            <view class="stats-label">平均步幅(cm)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // activityData.elevationGain || "--"
			  dataInfo.totalClimb || "--"
            }}</view>
            <view class="stats-label">累计爬升(m)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // formatPace(activityData.fastestKm)
			  dataInfo.fastOne || "--"
            }}</view>
            <view class="stats-label">最快1公里</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{
              // activityData.totalSteps || "--"
			  dataInfo.totalStepNumber || "--"
            }}</view>
            <view class="stats-label">总步数</view>
          </view>
          <view class="stats-item">
            <view class="stats-value">{{ dataInfo.active_kilocalories || "--" }}</view>
            <view class="stats-label">大卡</view>
          </view>
        </view>
      </section>

      <!-- 3. 配速数据 -->
      <!-- <section class="section-pace">
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
          <template v-for="(item, index) in paceDataWithSubtotals" :key="item.key">
            <view v-if="item.type === 'data'" class="pace-row">
              <view class="pace-col km-col">{{ item.km }}</view>
              <view class="pace-col pace-col-wide">
                <view class="pace-bar-wrapper" :class="{ fastest: item.isFastest }">
                  <view class="pace-bar" :style="{ width: getPaceBarWidth(item.pace) + '%' }"></view>
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
      </section> -->
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted,reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
// import store from "@/utils/store.js";
import { useStore } from "vuex";
import { createMarker } from "./assets/utils.js";
// import { formatPace } from "./assets/utils.js";
import { useShare, buildPath } from "@/composables/useShare.js";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);
const dataInfo = reactive({
	totalTime:"", // 总用时
	averagePace:"", // 平均配速
	averageRate:"", // 平均心率
	averageCadence:"", // 平均步频
	averageStride:"", // 平均步幅
	totalClimb:"", // 累计爬升
	fastOne:"", // 最快1公里
	totalStepNumber:"", // 总步数
	distance_in_meters:"", // 距离
	active_kilocalories:"", // 大卡
	start_time:"" // 跑步开始时间
});
console.log('=====userInfo====',userInfo)
// 路由参数
const routeId = ref("");

// 分享配置
useShare(() => ({
  title: `${activityData.value.userName || "用户"}的运动详情`,
  path: buildPath("/pagesSport/runDetail", { id: routeId.value }),
}));

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

// 初始化地图
const initMap = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return;
  }

  console.log("轨迹点数据:=====>", tracks);

  // 转换轨迹点格式
  const trackPoints = tracks;

  if (trackPoints.length > 0) {
    // 设置地图中心为第一个点
    mapCenter.value = {
      latitude: trackPoints[0].latitude,
      longitude: trackPoints[0].longitude,
    };
	// 创建标记
	let tempArr = []
	let tempIndex = 0	 
	let tempAPoints = trackPoints.filter((item,index) =>{
		if(!tempArr.includes(parseInt(item.total_distance / 500))) {
			tempArr.push(parseInt(item.total_distance / 500))
			tempIndex+=1
			return item
		}
		// 终点的时候加一个标记
		if(index === trackPoints.length - 1) {
			return item
		}
		
	})
		console.log('=====tempAPoints====',tempAPoints)
	markers.value = tempAPoints.map((item,index)=>{
			
		if(index === tempAPoints.length - 1) {
			return createMarker(
			  index+1,
			  tempAPoints[index].latitude,
			  tempAPoints[index].longitude,
			  "start",
			  (item.total_distance / 1000).toFixed(1)
			)
		} else {
			return createMarker(
			  index+1,
			  tempAPoints[index].latitude,
			  tempAPoints[index].longitude,
			  "start",
			  index * 0.5
			)
		}
		 
	})
	// 创建起点和终点标记
	console.log('==markers.value==',markers.value)
 //    markers.value = [
 //      createMarker(
 //        1,
 //        trackPoints[0].latitude,
 //        trackPoints[0].longitude,
 //        "start"
 //      ),
 //      createMarker(
 //        2,
 //        trackPoints[trackPoints.length - 1].latitude,
 //        trackPoints[trackPoints.length - 1].longitude,
 //        "end"
 //      ),
 //    ];

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

// 加载运动数据
const loadSportData = async (id) => {
  loading.value = true;
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
	  
  request.get("/sport-api/api/healthdata/detail", params).then(res=>{
	  console.log("res=============",res)
	  	dataInfo.totalTime = getTime(res.duration_in_seconds) // 总用时
	  	dataInfo.averagePace = res.average_pace.toFixed(2).replace(".","'")+"''" // 平均配速
	  	dataInfo.averageRate = res.average_heart_rate // 平均心率
	  	dataInfo.averageCadence = res.average_run_cadence.toFixed(2) // 平均步频
	  	dataInfo.averageStride = res.average_speed // 平均步幅
	  	dataInfo.totalClimb = res.total_elevation_gain // 累计爬升
	  	// dataInfo.fastOne = res.max_speed // 最快1公里
	  	dataInfo.totalStepNumber = res.steps // 总步数
		dataInfo.distance_in_meters = (res.distance_in_meters / 1000).toFixed(2) // 距离
		dataInfo.active_kilocalories = res.active_kilocalories // 大卡
		dataInfo.start_time = formatDateTime(res.start_time)
  })

  // 轨迹数据接口
  request.get(`/sport-api/api/healthdata/track?id=${routerParams.value.id}`).then((res) => {
    initMap(res.points);
	dataInfo.averageRate = parseInt((res.points.map(item=>item.heart_rate).reduce((acc, curr) => acc + curr, 0)) / res.points.length) ;
  })
};
const getTime = (t) =>{
    let h = parseInt ( t / 60 / 60 % 24 )
    let m = parseInt ( t / 60 % 60 )
    let s = parseInt ( t % 60 )
    h < 10 ? ' 0 ' + h : h
    m < 10 ? ' 0 ' + m : m
    s < 10 ? ' 0 ' + s : s
		
	if(h) {
		return `${h}:${m}:${s}`
		
	} else {
		return `00:${m}:${s}`
	}
}	

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

const routerParams = ref({});
onLoad((options) => {
  routerParams.value = options;
  // 从路由参数获取活动ID
  const id = options.id;
  routeId.value = id || "";
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
