<template>
  <view class="page">
    <u-navbar autoBack placeholder title="跑步轨迹"></u-navbar>

    <!-- 地图容器 -->
    <view class="map-container">
      <map
        v-if="isValidCoordinate(mapCenter.latitude, mapCenter.longitude)"
        id="runMap"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :scale="16"
        :markers="markers"
        :polyline="polylines"
        :show-location="true"
        :enable-3D="false"
        :enable-overlooking="false"
        :enable-zoom="true"
        :enable-scroll="true"
        :enable-rotate="false"
        :enable-satellite="false"
        :enable-traffic="false"
        class="map"
      ></map>
      <view v-else class="map-placeholder">
        <text>地图加载中...</text>
      </view>
    </view>

    <!-- 控制面板 -->
    <view class="control-panel">
      <!-- 跑步数据展示 -->
      <view class="data-display" v-if="isRunning || hasTrack">
        <view class="data-item">
          <text class="data-value">{{ formatDistance(totalDistance) }}</text>
          <text class="data-label">距离</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ formatTime(runningTime) }}</text>
          <text class="data-label">时间</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ formatPace(avgPace) }}</text>
          <text class="data-label">配速</text>
        </view>
      </view>

      <!-- 开始/停止按钮 -->
      <view class="button-container">
        <button
          class="start-button"
          :class="{ 'stop-button': isRunning }"
          @click="toggleRunning"
          :disabled="isLoading"
        >
          <text v-if="!isRunning">开始跑步</text>
          <text v-else>停止跑步</text>
        </button>
      </view>

      <!-- 测试按钮 -->
      <view class="test-buttons" v-if="!isRunning && debug">
        <button class="test-button" @click="drawTestTrack">绘制测试轨迹</button>
        <button class="test-button" @click="clearTestTrack" v-if="hasTrack">
          清除轨迹
        </button>
      </view>

      <!-- 进度提示 -->
      <view class="progress-tip" v-if="isRunning && totalDistance > 0">
        <text>目标: 10km | 当前: {{ formatDistance(totalDistance) }}</text>
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 打卡成功弹窗 -->
    <u-modal
      v-model="showSuccessModal"
      title="打卡成功！"
      :show-cancel-button="false"
      :show-confirm-button="true"
      confirm-text="确定"
      @confirm="handleSuccessConfirm"
    >
      <view class="success-content">
        <view class="success-icon">🎉</view>
        <view class="success-text">恭喜您完成10km跑步打卡！</view>
        <view class="success-data">
          <text>跑步距离: {{ formatDistance(totalDistance) }}</text>
          <text>跑步时间: {{ formatTime(runningTime) }}</text>
          <text>平均配速: {{ formatPace(avgPace) }}</text>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
// import runningApi from '@/utils/runningApi.js'

// 地图相关
const mapCenter = ref({
  latitude: 39.908823,
  longitude: 116.39747,
});
const markers = ref([]);
const polylines = ref([]);

// 跑步状态
const isRunning = ref(false);
const isLoading = ref(false);
const hasTrack = ref(false);

// 跑步数据
const totalDistance = ref(0); // 总距离(米)
const runningTime = ref(0); // 跑步时间(秒)
const avgPace = ref(0); // 平均配速(秒/公里)

// 轨迹数据
const trackPoints = ref([]); // 轨迹点数组
const lastLocation = ref(null); // 上一个位置点

// 定时器
const timer = ref(null);
const locationTimer = ref(null);

// 地图上下文
const mapContext = ref(null);

// 地图移动节流（避免过于频繁的移动）
const lastMoveTime = ref(0);
const MOVE_INTERVAL = 500; // 最小移动间隔（毫秒）

// 弹窗
const showSuccessModal = ref(false);

// 目标距离
const targetDistance = ref(10000); // 10km = 10000米

// 调试模式
const debug = ref(false); // 设置为true显示测试功能

// 标记配置常量
const MARKER_CONFIG = {
  width: 40,
  height: 40,
  anchor: { x: 0.5, y: 0.5 },
};

// 创建标记的通用方法
const createMarker = (id, latitude, longitude, type) => {
  const isStart = type === "start";
  const config = {
    id,
    latitude,
    longitude,
    width: MARKER_CONFIG.width,
    height: MARKER_CONFIG.height,
    anchor: MARKER_CONFIG.anchor,
    iconPath: isStart
      ? "/static/images/go@2x.png"
      : "/static/images/end@2x.png",
  };

  // 设置title用于调试
  config.title = isStart ? "GO" : "END";

  return config;
};

// 计算属性
const progressPercent = computed(() => {
  return Math.min((totalDistance.value / targetDistance.value) * 100, 100);
});

onMounted(() => {
  // 创建地图上下文
  mapContext.value = uni.createMapContext("runMap");
  initLocation();
});

onUnmounted(() => {
  stopRunning();
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

// 检查位置权限
const checkLocationPermission = async () => {
  try {
    const authSetting = await uni.getSetting();
    return authSetting.authSetting["scope.userLocation"];
  } catch (error) {
    console.error("检查权限失败:", error);
    return false;
  }
};

// 请求位置权限
const requestLocationPermission = async () => {
  try {
    await uni.authorize({
      scope: "scope.userLocation",
    });
    return true;
  } catch (error) {
    console.log("权限请求被拒绝:", error);
    return false;
  }
};

// 显示权限引导弹窗
const showPermissionGuide = (title, content) => {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      showCancel: true,
      cancelText: "取消",
      confirmText: "去设置",
      success: (res) => {
        if (res.confirm) {
          uni.openSetting({
            success: (settingRes) => {
              resolve(settingRes.authSetting["scope.userLocation"] === true);
            },
            fail: () => {
              resolve(false);
            },
          });
        } else {
          resolve(false);
        }
      },
    });
  });
};

// 初始化位置
const initLocation = async () => {
  try {
    // 先检查权限状态
    const authSetting = await uni.getSetting();
    console.log("初始化时权限状态:", authSetting.authSetting);

    // 如果权限被拒绝，使用默认坐标
    if (authSetting.authSetting["scope.userLocation"] === false) {
      console.log("位置权限被拒绝，使用默认坐标");
      mapCenter.value = {
        latitude: 39.908823,
        longitude: 116.39747,
      };
      markers.value = [];
      return;
    }

    const res = await uni.getLocation({
      type: "gcj02",
      altitude: true,
    });

    console.log("getLocation返回数据:", res);
    console.log("数据类型:", typeof res, Array.isArray(res));

    // 验证坐标是否有效
    if (isValidCoordinate(res.latitude, res.longitude)) {
      mapCenter.value = {
        latitude: res.latitude,
        longitude: res.longitude,
      };

      // 添加当前位置标记
      // markers.value = [
      //   {
      //     id: 0,
      //     latitude: res.latitude,
      //     longitude: res.longitude,
      //     title: "当前位置",
      //     // iconPath: '/static/location.png',
      //     width: 30,
      //     height: 30,
      //     anchor: { x: 0.5, y: 0.5 },
      //   },
      // ];
    } else {
      console.warn("获取到的坐标无效，使用默认坐标", JSON.stringify(res));
      // 使用默认坐标（北京）
      mapCenter.value = {
        latitude: 39.908823,
        longitude: 116.39747,
      };
      markers.value = [];
    }
  } catch (error) {
    console.error("获取位置失败:", error);
    // 使用默认坐标
    mapCenter.value = {
      latitude: 39.908823,
      longitude: 116.39747,
    };
    markers.value = [];

    // 如果是权限错误，不显示错误提示
    if (error.errMsg && error.errMsg.includes("auth deny")) {
      console.log("位置权限被拒绝，使用默认坐标");
    } else {
      uni.showToast({
        title: "获取位置失败",
        icon: "none",
      });
    }
  }
};

// 切换跑步状态
const toggleRunning = async () => {
  if (isRunning.value) {
    stopRunning();
  } else {
    startRunning();
  }
};

// 开始跑步
const startRunning = async () => {
  isLoading.value = true;

  try {
    // 检查位置权限状态
    const permissionStatus = await checkLocationPermission();
    console.log("当前权限状态:", permissionStatus);

    // 如果权限被拒绝，引导用户开启
    if (permissionStatus === false) {
      const granted = await showPermissionGuide(
        "位置权限被拒绝",
        "需要位置权限才能记录跑步轨迹，请在设置中开启位置权限"
      );
      if (granted) {
        // 用户开启了权限，重新尝试
        startRunning();
      } else {
        uni.showToast({
          title: "需要位置权限才能使用此功能",
          icon: "none",
        });
      }
      isLoading.value = false;
      return;
    }

    // 如果权限未确定，先请求权限
    if (permissionStatus === undefined) {
      const granted = await requestLocationPermission();
      if (!granted) {
        const grantedFromSettings = await showPermissionGuide(
          "需要位置权限",
          "需要位置权限才能记录跑步轨迹，请在设置中开启位置权限"
        );
        if (!grantedFromSettings) {
          isLoading.value = false;
          return;
        }
      }
    }

    // 开始后台定位
    await uni.startLocationUpdateBackground({
      success: () => {
        console.log("后台定位启动成功");
      },
      fail: (error) => {
        console.error("后台定位启动失败:", error);
        if (error.errno === 103) {
          uni.showModal({
            title: "权限被拒绝",
            content:
              "位置权限被拒绝，无法使用后台定位功能。请在设置中开启位置权限。",
            showCancel: true,
            cancelText: "取消",
            confirmText: "去设置",
            success: (res) => {
              if (res.confirm) {
                uni.openSetting();
              }
            },
          });
        } else {
          uni.showToast({
            title: "定位服务启动失败",
            icon: "none",
          });
        }
      },
    });

    // 监听位置变化
    uni.onLocationChange((res) => {
      handleLocationUpdate(res);
    });

    // 重置数据
    isRunning.value = true;
    hasTrack.value = true;
    totalDistance.value = 0;
    runningTime.value = 0;
    trackPoints.value = [];
    polylines.value = [];

    // 获取起始位置
    const startLocation = await uni.getLocation({
      isHighAccuracy: true,
      type: "gcj02",
      altitude: true,
    });

    // 验证起始位置坐标
    if (isValidCoordinate(startLocation.latitude, startLocation.longitude)) {
      lastLocation.value = startLocation;
      trackPoints.value.push(startLocation);

      // 设置起始点marker
      markers.value = [
        createMarker(
          1,
          startLocation.latitude,
          startLocation.longitude,
          "start"
        ),
      ];
    } else {
      console.warn("起始位置坐标无效");
      uni.showToast({
        title: "位置获取失败",
        icon: "none",
      });
      isLoading.value = false;
      return;
    }

    // 开始计时
    startTimer();

    uni.showToast({
      title: "开始跑步",
      icon: "success",
    });
  } catch (error) {
    console.error("开始跑步失败:", error);
    uni.showToast({
      title: "开始跑步失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

// 停止跑步
const stopRunning = () => {
  isRunning.value = false;

  // 停止后台定位
  uni.stopLocationUpdate();
  uni.offLocationChange();

  // 停止计时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }

  // 更新最终marker显示
  if (trackPoints.value.length > 0) {
    const validPoints = trackPoints.value.filter((point) =>
      isValidCoordinate(point.latitude, point.longitude)
    );

    if (validPoints.length > 0) {
      const newMarkers = [];

      // 起始点
      newMarkers.push(
        createMarker(
          1,
          validPoints[0].latitude,
          validPoints[0].longitude,
          "start"
        )
      );

      // 终点
      if (validPoints.length > 1) {
        newMarkers.push(
          createMarker(
            2,
            validPoints[validPoints.length - 1].latitude,
            validPoints[validPoints.length - 1].longitude,
            "end"
          )
        );
      }

      markers.value = newMarkers;
    }
  }

  // 检查是否达到目标
  if (totalDistance.value >= targetDistance.value) {
    showSuccessModal.value = true;
    submitRunningData();
  }
};

// 处理位置更新
const handleLocationUpdate = (location) => {
  if (!isRunning.value || !lastLocation.value) return;

  // 验证新位置坐标是否有效
  if (!isValidCoordinate(location.latitude, location.longitude)) {
    console.warn("接收到无效坐标，跳过此次更新");
    return;
  }

  // 计算距离
  const distance = calculateDistance(
    lastLocation.value.latitude,
    lastLocation.value.longitude,
    location.latitude,
    location.longitude
  );

  // 过滤掉距离过近的点(小于5米)
  if (distance < 5) return;

  // 更新总距离
  totalDistance.value += distance;

  // 更新轨迹点
  trackPoints.value.push(location);
  lastLocation.value = location;

  // 更新地图轨迹
  updateMapTrack();

  // 检查是否达到目标
  if (totalDistance.value >= targetDistance.value) {
    stopRunning();
  }
};

// 更新地图轨迹
const updateMapTrack = () => {
  if (trackPoints.value.length < 2) return;

  // 过滤有效的轨迹点
  const validPoints = trackPoints.value.filter((point) =>
    isValidCoordinate(point.latitude, point.longitude)
  );

  if (validPoints.length < 2) return;

  // 创建轨迹线
  polylines.value = [
    {
      points: validPoints,
      color: "#ff8c00",
      width: 6,
      arrowLine: true,
      borderColor: "#FFFFFF",
      borderWidth: 2,
    },
  ];

  // 更新地图中心到当前位置（平滑移动）
  const lastPoint = validPoints[validPoints.length - 1];
  if (isValidCoordinate(lastPoint.latitude, lastPoint.longitude)) {
    const now = Date.now();
    const shouldMove = now - lastMoveTime.value >= MOVE_INTERVAL;

    // 更新markers：起始点 + 当前位置（始终更新）
    const newMarkers = [];

    // 添加起始点标记
    if (validPoints.length > 0) {
      newMarkers.push(
        createMarker(
          1,
          validPoints[0].latitude,
          validPoints[0].longitude,
          "start"
        )
      );
    }

    // 添加当前位置标记
    // newMarkers.push({
    //   id: 0,
    //   latitude: lastPoint.latitude,
    //   longitude: lastPoint.longitude,
    //   title: "当前位置",
    //   // iconPath: '/static/location.png',
    //   width: 30,
    //   height: 30,
    //   anchor: { x: 0.5, y: 0.5 },
    // });

    markers.value = newMarkers;

    // 节流控制：避免过于频繁的移动
    if (!shouldMove) {
      return;
    }

    lastMoveTime.value = now;

    // 使用地图上下文平滑移动中心点
    if (mapContext.value) {
      try {
        mapContext.value.moveToLocation({
          latitude: lastPoint.latitude,
          longitude: lastPoint.longitude,
          success: () => {
            // 移动成功后更新中心点坐标（用于同步状态）
            mapCenter.value = {
              latitude: lastPoint.latitude,
              longitude: lastPoint.longitude,
            };
          },
          fail: (err) => {
            console.warn("地图移动失败，使用直接更新:", err);
            // 如果移动失败，直接更新中心点
            mapCenter.value = {
              latitude: lastPoint.latitude,
              longitude: lastPoint.longitude,
            };
          },
        });
      } catch (error) {
        // 如果 moveToLocation 方法不存在或不支持，直接更新
        console.warn("地图移动方法不支持，使用直接更新:", error);
        mapCenter.value = {
          latitude: lastPoint.latitude,
          longitude: lastPoint.longitude,
        };
      }
    } else {
      // 如果地图上下文未创建，直接更新中心点
      mapCenter.value = {
        latitude: lastPoint.latitude,
        longitude: lastPoint.longitude,
      };
    }
  }
};

// 开始计时
const startTimer = () => {
  timer.value = setInterval(() => {
    runningTime.value++;
    calculateAvgPace();
  }, 1000);
};

// 计算平均配速
const calculateAvgPace = () => {
  if (totalDistance.value > 0 && runningTime.value > 0) {
    // 配速 = 时间(秒) / 距离(公里)
    avgPace.value = runningTime.value / (totalDistance.value / 1000);
  }
};

// 计算两点间距离(米)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 地球半径(米)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 角度转弧度
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// 格式化距离
const formatDistance = (distance) => {
  if (distance < 1000) {
    return distance.toFixed(0) + "m";
  } else {
    return (distance / 1000).toFixed(2) + "km";
  }
};

// 格式化时间
const formatTime = (seconds) => {
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
  if (!pace || pace <= 0 || isNaN(pace)) return "--";
  const minutes = Math.floor(pace / 60);
  const seconds = Math.floor(pace % 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
};

// 提交跑步数据到后端
const submitRunningData = async () => {
  try {
    const runningData = {
      distance: totalDistance.value,
      time: runningTime.value,
      pace: avgPace.value,
      trackPoints: trackPoints.value,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };

    // 调用后端接口
    // await runningApi.submitRunningData(runningData)

    console.log("跑步数据提交成功:", runningData);

    uni.showToast({
      title: "打卡成功！",
      icon: "success",
    });
  } catch (error) {
    console.error("提交跑步数据失败:", error);
    uni.showToast({
      title: "数据提交失败",
      icon: "none",
    });
  }
};

// 处理成功确认
const handleSuccessConfirm = () => {
  showSuccessModal.value = false;
  // 可以跳转到其他页面或重置数据
  uni.navigateBack();
};

// 绘制测试轨迹
const drawTestTrack = () => {
  // 测试轨迹点（以当前位置为中心的复杂路径）
  const centerLat = mapCenter.value.latitude;
  const centerLng = mapCenter.value.longitude;

  // 生成复杂轨迹点（8字形路径）
  const testPoints = [];
  const radius = 0.0008; // 大约80米的半径
  const pointCount = 40;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * 4 * Math.PI; // 两个完整的圆
    const lat = centerLat + radius * Math.sin(t);
    const lng = centerLng + radius * Math.sin(2 * t) * 0.5; // 8字形

    testPoints.push({
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      altitude: 0,
      speed: 2.5 + Math.random() * 1, // 随机速度
      timestamp: Date.now() + i * 1000,
    });
  }

  // 设置测试数据
  trackPoints.value = testPoints;
  totalDistance.value = 1000; // 1km测试轨迹
  runningTime.value = 300; // 5分钟
  hasTrack.value = true;

  // 更新地图显示
  updateMapTrack();

  // 计算平均配速
  calculateAvgPace();

  uni.showToast({
    title: "测试轨迹已绘制",
    icon: "success",
  });
};

// 清除测试轨迹
const clearTestTrack = () => {
  trackPoints.value = [];
  totalDistance.value = 0;
  runningTime.value = 0;
  avgPace.value = 0;
  hasTrack.value = false;
  polylines.value = [];
  markers.value = [];

  uni.showToast({
    title: "轨迹已清除",
    icon: "success",
  });
};
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.map-container {
  flex: 1;
  position: relative;
}

.map {
  width: 100vw;
  height: 100vh;
}

.map-placeholder {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 28rpx;
}

.control-panel {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: white;
  padding: 20rpx;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.data-display {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.data-label {
  font-size: 24rpx;
  color: #666;
}

.button-container {
  display: flex;
  justify-content: center;
}

.start-button {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #ff8c00, #ffa500);
  color: white;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 15rpx rgba(255, 140, 0, 0.3);
  transition: all 0.3s ease;
}

.stop-button {
  background: linear-gradient(135deg, #e67e00, #ff8c00);
}

.start-button:active {
  transform: scale(0.95);
}

.test-buttons {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
  text-wrap: nowrap;
}

.test-button {
  height: 60rpx;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.test-button:active {
  transform: scale(0.95);
}

.progress-tip {
  margin-top: 20rpx;
  text-align: center;
}

.progress-tip text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background-color: #eee;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ffa500);
  transition: width 0.3s ease;
}

.success-content {
  text-align: center;
  padding: 20rpx;
}

.success-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.success-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.success-data {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.success-data text {
  font-size: 28rpx;
  color: #666;
}
</style>
