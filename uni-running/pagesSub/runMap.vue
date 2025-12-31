<template>
  <view class="page">
    <u-navbar title="跑步轨迹" />

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
        :show-location="false"
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
      <!-- 开始/暂停/继续/停止按钮 -->
      <view class="button-container">
        <!-- 未开始状态：显示开始按钮 -->
        <button
          v-if="!isRunning && !isPaused"
          class="button start-button"
          @click="startRunning"
          :disabled="isLoading"
        >
          <image
            src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run-start@2x.png"
            mode="widthFix"
            style="width: 40rpx; height: 40rpx"
          ></image>
        </button>

        <!-- 运行中状态：显示暂停和停止按钮 -->
        <template v-else-if="isRunning && !isPaused">
          <button
            class="button stop-button"
            @click="stopRunning"
            :disabled="isLoading"
          >
            <image
              src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run-stop@2x.png"
              mode="widthFix"
              style="width: 40rpx; height: 40rpx"
            ></image>
          </button>
          <button
            class="button pause-button"
            @click="pauseRunning"
            :disabled="isLoading"
          >
            <image
              src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run-pause@2x.png"
              mode="widthFix"
              style="width: 40rpx; height: 40rpx"
            ></image>
          </button>
        </template>

        <!-- 暂停状态：显示继续和停止按钮 -->
        <template v-else-if="isPaused">
          <button
            class="button stop-button"
            @click="stopRunning"
            :disabled="isLoading"
          >
            <image
              src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run-stop@2x.png"
              mode="widthFix"
              style="width: 40rpx; height: 40rpx"
            ></image>
          </button>
          <button
            class="button resume-button"
            @click="resumeRunning"
            :disabled="isLoading"
          >
            <image
              src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run-start@2x.png"
              mode="widthFix"
              style="width: 40rpx; height: 40rpx"
            ></image>
          </button>
        </template>
      </view>
      <!-- 跑步数据展示 -->
      <view class="data-display">
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

      <!-- 测试按钮 -->
      <view class="test-buttons" v-if="!isRunning && !isPaused && debug">
        <button class="test-button" @click="drawTestTrack">绘制测试轨迹</button>
        <button class="test-button" @click="clearTestTrack" v-if="hasTrack">
          清除轨迹
        </button>
      </view>

      <!-- 进度提示 -->
      <view class="progress-tip">
        <text>目标: 10km | 当前: {{ formatDistance(totalDistance) }}</text>
        <!-- <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view> -->
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
import request from "@/utils/request.js";

// 地图相关
const mapCenter = ref({
  latitude: 39.908823,
  longitude: 116.39747,
});
const markers = ref([]);
const polylines = ref([]);

// 跑步状态
const isRunning = ref(false);
const isPaused = ref(false);
const isLoading = ref(false);
const hasTrack = ref(false);

// 跑步数据
const totalDistance = ref(0); // 总距离(米)
const runningTime = ref(0); // 跑步时间(秒)
const avgPace = ref(0); // 平均配速(秒/公里)

// 轨迹数据
const trackPoints = ref([]); // 轨迹点数组
const lastLocation = ref(null); // 上一个位置点（经过平滑处理后）
const lastRawLocation = ref(null); // 上一个原始位置点
const startTime = ref(null); // 跑步开始时间

// 每千米分段数据
const kmSplits = ref([]); // 每千米分段数据数组
const currentKmStartDistance = ref(0); // 当前千米段的开始距离（米）
const currentKmStartTime = ref(null); // 当前千米段的开始时间

// 定时器
const timer = ref(null);
const locationTimer = ref(null);

// 地图上下文
const mapContext = ref(null);

// 地图移动节流（避免过于频繁的移动）
const lastMoveTime = ref(0);
const MOVE_INTERVAL = 500; // 最小移动间隔（毫秒）

// 设备方向（罗盘）
const deviceHeading = ref(0); // 设备朝向角度（0-360度，0度为正北）
const compassAvailable = ref(false); // 罗盘是否可用
const lastRotation = ref(null); // 上一次的旋转角度
const rotationUpdateTimer = ref(null); // 旋转更新定时器
const pendingRotation = ref(null); // 待更新的旋转角度值（用于节流）

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

// 漂移点检测阈值
const MAX_REASONABLE_SPEED = 7; // m/s，约等于25km/h，超过此速度视为异常
const MIN_DRIFT_DISTANCE = 15; // m，过短距离不做漂移判断，避免噪声
const MIN_MOVEMENT_DISTANCE = 5; // m，距离过近视为噪声

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
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/go@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/end@2x.png",
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
  startCompass();
});

onUnmounted(() => {
  stopRunning();
  stopCompass();
  // 清理旋转更新定时器
  if (rotationUpdateTimer.value) {
    clearTimeout(rotationUpdateTimer.value);
    rotationUpdateTimer.value = null;
  }
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

// 判断是否为疑似漂移点
const isDriftPoint = (distance, timeDiff) => {
  if (!timeDiff || timeDiff <= 0) {
    return true;
  }

  if (distance < MIN_DRIFT_DISTANCE) {
    return false;
  }

  const speed = distance / timeDiff; // m/s

  if (speed > MAX_REASONABLE_SPEED) {
    console.warn(
      `检测到疑似漂移点，速度: ${speed.toFixed(2)}m/s，距离: ${distance.toFixed(
        2
      )}m`
    );
    return true;
  }

  return false;
};

// 开始监听罗盘
const startCompass = () => {
  try {
    // 先启动罗盘
    uni.startCompass({
      success: () => {
        console.log("罗盘启动成功");
        compassAvailable.value = true;
        // 启动成功后，监听罗盘变化
        uni.onCompassChange((res) => {
          // res.direction 是设备朝向角度（0-360度，0度为正北）
          if (res.direction !== undefined && res.direction !== null) {
            deviceHeading.value = res.direction;
            // 更新当前位置标记的旋转角度
            updateCurrentLocationMarkerRotation();
          }
        });
        console.log("罗盘监听已启动");
      },
      fail: (error) => {
        console.warn("罗盘启动失败:", error);
        compassAvailable.value = false;
        // 罗盘失败不影响其他功能，只记录日志，不显示错误提示
        // 尝试从位置信息中获取方向（如果可用）
        console.log("罗盘不可用，将尝试使用位置信息中的方向");
      },
    });
  } catch (error) {
    console.warn("罗盘功能不支持或启动失败:", error);
    compassAvailable.value = false;
  }
};

// 停止监听罗盘
const stopCompass = () => {
  try {
    // 先停止监听
    uni.offCompassChange();
    // 再停止罗盘
    uni.stopCompass({
      success: () => {
        console.log("罗盘已停止");
      },
      fail: (error) => {
        console.warn("停止罗盘失败:", error);
      },
    });
  } catch (error) {
    console.warn("停止罗盘监听失败:", error);
  }
};

// 更新当前位置标记的旋转角度（带节流和变化检测）
const updateCurrentLocationMarkerRotation = () => {
  // 图标初始朝向正西（270度），要让图标指向设备朝向（deviceHeading）
  // 旋转角度 = 设备朝向 - 图标初始朝向 = deviceHeading - 270
  // 为了保持正值范围，加上 360 度取模：rotate = (deviceHeading - 270 + 360) % 360
  // 简化后：rotate = (deviceHeading + 90) % 360
  const rotation = (deviceHeading.value + 90) % 360;

  // 保存最新的旋转角度值（用于定时器回调）
  pendingRotation.value = rotation;

  // 如果旋转角度没有变化（或变化很小），跳过更新
  if (lastRotation.value !== null) {
    const diff = Math.abs(rotation - lastRotation.value);
    // 处理角度跨越0度/360度的情况
    const minDiff = Math.min(diff, 360 - diff);
    if (debug.value) {
      uni.showToast({
        title: `minDiff======>${minDiff}, rotation======>${rotation}, lastRotation.value======>${lastRotation.value}`,
        icon: "none",
      });
    }
    // 如果角度变化小于3度，跳过更新（避免微小变化导致的闪烁）
    if (minDiff < 3) {
      return;
    }
  }

  // 如果已经有定时器在运行，不创建新的（节流：限制执行频率）
  if (rotationUpdateTimer.value) {
    return;
  }

  // 使用节流，延迟更新
  rotationUpdateTimer.value = setTimeout(() => {
    // 使用最新的待更新角度值
    const rotationToUpdate = pendingRotation.value;

    if (rotationToUpdate !== null) {
      const index = markers.value.findIndex((m) => m.id === 0);
      if (index !== -1) {
        // 检查角度是否真的变化了（与当前显示的值比较）
        if (markers.value[index].rotate !== rotationToUpdate) {
          // 在 uni-app 中，需要重新创建数组才能触发地图组件更新
          // 但我们可以只更新需要更新的 marker，其他保持不变
          const newMarkers = markers.value.map((marker, i) => {
            if (i === index) {
              // 只更新当前位置标记的旋转角度
              return { ...marker, rotate: rotationToUpdate };
            }
            return marker; // 其他标记保持不变
          });
          markers.value = newMarkers;
          lastRotation.value = rotationToUpdate;
        }
      }
    }

    // 清除定时器标识，允许下次更新
    rotationUpdateTimer.value = null;
    pendingRotation.value = null;
  }, 500);
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
      // 图标初始朝向正西（270度），要让图标指向设备朝向
      // 旋转角度 = (deviceHeading + 90) % 360
      markers.value = [
        {
          id: 0,
          latitude: res.latitude,
          longitude: res.longitude,
          title: "当前位置",
          iconPath:
            "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-map-location@2x.png",
          width: 30,
          height: 30,
          anchor: { x: 0.5, y: 0.5 },
          rotate: (deviceHeading.value + 90) % 360, // 初始旋转角度
        },
      ];
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

// 切换跑步状态（保留以兼容旧代码，但推荐使用新的方法）
const toggleRunning = async () => {
  if (isRunning.value && !isPaused.value) {
    pauseRunning();
  } else if (isPaused.value) {
    resumeRunning();
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
    isPaused.value = false;
    hasTrack.value = true;
    totalDistance.value = 0;
    runningTime.value = 0;
    trackPoints.value = [];
    polylines.value = [];
    startTime.value = new Date(); // 记录开始时间
    kmSplits.value = []; // 重置千米分段数据
    currentKmStartDistance.value = 0; // 重置当前千米段开始距离
    currentKmStartTime.value = startTime.value; // 设置当前千米段开始时间

    // 获取起始位置
    const startLocation = await uni.getLocation({
      isHighAccuracy: true,
      type: "gcj02",
      altitude: true,
    });

    // 验证起始位置坐标
    if (isValidCoordinate(startLocation.latitude, startLocation.longitude)) {
      // 确保起始位置点有时间戳
      const startPoint = {
        ...startLocation,
        timestamp: startLocation.timestamp || startTime.value.getTime(),
      };
      lastLocation.value = startPoint;
      lastRawLocation.value = startPoint;
      trackPoints.value.push(startPoint);

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

// 暂停跑步
const pauseRunning = () => {
  isPaused.value = true;
  isRunning.value = false;

  // 停止后台定位
  uni.stopLocationUpdate();
  uni.offLocationChange();

  // 停止计时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }

  uni.showToast({
    title: "已暂停",
    icon: "success",
  });
};

// 继续跑步
const resumeRunning = async () => {
  isLoading.value = true;

  try {
    // 重新启动后台定位
    await uni.startLocationUpdateBackground({
      success: () => {
        console.log("后台定位重新启动成功");
      },
      fail: (error) => {
        console.error("后台定位重新启动失败:", error);
        uni.showToast({
          title: "定位服务启动失败",
          icon: "none",
        });
        isLoading.value = false;
        return;
      },
    });

    // 重新监听位置变化
    uni.onLocationChange((res) => {
      handleLocationUpdate(res);
    });

    // 恢复状态
    isPaused.value = false;
    isRunning.value = true;

    // 重新开始计时
    startTimer();

    uni.showToast({
      title: "继续跑步",
      icon: "success",
    });
  } catch (error) {
    console.error("继续跑步失败:", error);
    uni.showToast({
      title: "继续跑步失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

// 停止跑步
const stopRunning = () => {
  isRunning.value = false;
  isPaused.value = false;

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
  }
  submitRunningData();
};

// 处理位置更新
const handleLocationUpdate = (location) => {
  if (!isRunning.value || isPaused.value || !lastLocation.value) return;

  // 验证新位置坐标是否有效
  if (!isValidCoordinate(location.latitude, location.longitude)) {
    console.warn("接收到无效坐标，跳过此次更新");
    return;
  }

  // 如果罗盘不可用，尝试从位置信息中获取方向（heading）
  if (
    !compassAvailable.value &&
    location.heading !== undefined &&
    location.heading !== null
  ) {
    // heading 是移动方向（0-360度，0度为正北），可以作为设备朝向的参考
    deviceHeading.value = location.heading;
    updateCurrentLocationMarkerRotation();
  }

  // 计算与上一原始点之间的距离
  const previousRawPoint = lastRawLocation.value || lastLocation.value;
  if (!previousRawPoint) {
    return;
  }

  const distance = calculateDistance(
    previousRawPoint.latitude,
    previousRawPoint.longitude,
    location.latitude,
    location.longitude
  );

  // 过滤距离过近的点
  if (distance < MIN_MOVEMENT_DISTANCE) {
    return;
  }

  const currentTimestamp = location.timestamp || Date.now();
  const lastTimestamp = previousRawPoint.timestamp || currentTimestamp;
  const timeDiff = (currentTimestamp - lastTimestamp) / 1000; // 时间差（秒）

  // 如果时间差为0或负数，跳过（数据异常）
  if (timeDiff <= 0) {
    console.warn("时间戳异常，跳过此次更新");
    return;
  }

  // 漂移点过滤
  if (isDriftPoint(distance, timeDiff)) {
    return;
  }

  // 记录当前原始轨迹点，供下一次计算使用
  const rawTrackPoint = {
    ...location,
    timestamp: currentTimestamp,
  };
  lastRawLocation.value = rawTrackPoint;

  // 累加原始距离
  totalDistance.value += distance;

  // 更新轨迹点，确保有时间戳
  const trackPoint = rawTrackPoint;
  trackPoints.value.push(trackPoint);
  lastLocation.value = trackPoint;

  // 检查是否跨过了新的千米点（每1000米）
  const currentKm = Math.floor(totalDistance.value / 1000);
  const previousKm = Math.floor((totalDistance.value - distance) / 1000);

  if (currentKm > previousKm && currentKmStartTime.value) {
    // 完成了一千米，保存这一千米的数据
    const kmEndTime = new Date(trackPoint.timestamp);
    const kmDistance = 1000; // 正好1000米
    const kmSeconds =
      (kmEndTime.getTime() - currentKmStartTime.value.getTime()) / 1000;
    const kmPace = kmSeconds; // 秒/公里

    kmSplits.value.push({
      meters: kmDistance,
      seconds: kmSeconds,
      seconds_per_km: kmPace,
      start_time: currentKmStartTime.value.toISOString(),
      end_time: kmEndTime.toISOString(),
    });

    // 开始新的千米段
    currentKmStartDistance.value = currentKm * 1000;
    currentKmStartTime.value = kmEndTime;
  }

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
    // 图标初始朝向正西（270度），要让图标指向设备朝向
    // 旋转角度 = (deviceHeading + 90) % 360
    newMarkers.push({
      id: 0,
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
      title: "当前位置",
      iconPath:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-map-location@2x.png",
      width: 30,
      height: 30,
      anchor: { x: 0.5, y: 0.5 },
      rotate: (deviceHeading.value + 90) % 360, // 根据设备方向旋转
    });

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

// 计算两点间的方位角（方向角，0-360度，0度为正北）
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);
  // 转换为度数（0-360度，0度为正北）
  return (toDegrees(bearing) + 360) % 360;
};

// 角度转弧度
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// 弧度转角度
const toDegrees = (radians) => {
  return radians * (180 / Math.PI);
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
    // 如果没有轨迹数据，不提交
    if (!trackPoints.value || trackPoints.value.length === 0) {
      console.log("没有轨迹数据，跳过提交");
      return;
    }

    // 计算结束时间（使用最后一个轨迹点的时间，如果没有则使用当前时间）
    const lastPoint = trackPoints.value[trackPoints.value.length - 1];
    const endTime =
      lastPoint && lastPoint.timestamp
        ? new Date(lastPoint.timestamp)
        : new Date();
    const startTimeISO = startTime.value
      ? startTime.value.toISOString()
      : new Date(Date.now() - runningTime.value * 1000).toISOString();
    const endTimeISO = endTime.toISOString();

    // 转换轨迹点格式：从 {latitude, longitude, timestamp} 转换为 {lat, lon, time}
    const tracks = trackPoints.value
      .filter((point) => isValidCoordinate(point.latitude, point.longitude))
      .map((point) => {
        // 使用轨迹点的时间戳（已经确保每个点都有时间戳）
        const timeStr = new Date(point.timestamp || Date.now()).toISOString();

        return {
          lat: point.latitude,
          lon: point.longitude,
          time: timeStr,
        };
      });

    // 处理最后一千米（如果还有未完成的千米段）
    const finalKmSplits = [...kmSplits.value];
    if (currentKmStartTime.value && trackPoints.value.length > 0) {
      // 计算最后一千米的距离
      const lastKmDistance = totalDistance.value - currentKmStartDistance.value;
      if (lastKmDistance > 0) {
        // 获取最后一个轨迹点的时间
        const lastPoint = trackPoints.value[trackPoints.value.length - 1];
        const lastKmEndTime = new Date(
          lastPoint.timestamp || endTime.getTime()
        );
        const lastKmSeconds =
          (lastKmEndTime.getTime() - currentKmStartTime.value.getTime()) / 1000;
        const lastKmPace =
          lastKmDistance > 0 ? lastKmSeconds / (lastKmDistance / 1000) : null;

        finalKmSplits.push({
          meters: Math.round(lastKmDistance),
          seconds: lastKmSeconds,
          seconds_per_km: lastKmPace,
          start_time: currentKmStartTime.value.toISOString(),
          end_time: lastKmEndTime.toISOString(),
        });
      }
    }

    // 构建请求数据
    const requestData = {
      meters: Math.round(totalDistance.value), // 距离（米）
      seconds: runningTime.value, // 时间（秒）
      seconds_per_km: avgPace.value > 0 ? avgPace.value : null, // 配速（秒/公里）
      geojson: {
        tracks: tracks,
        km_splits: finalKmSplits,
      },
      sport_started_at: startTimeISO,
      sport_ended_at: endTimeISO,
      // km_splits: finalKmSplits, // 每千米分段数据
    };

    console.log("提交跑步数据:", requestData);

    // 调用后端接口
    uni.showLoading({
      title: "保存中...",
      mask: true,
    });

    const response = await request.post("/sport-api/api/manual", requestData);

    uni.hideLoading();
    console.log("跑步数据提交成功:", response);

    uni.showToast({
      title: "打卡成功！",
      icon: "success",
    });

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 如果接口返回了id，使用返回的id；否则使用默认值
      const sportId = response?.id;
      uni.navigateTo({
        url: `/pagesSub/sport/show?id=${sportId}`,
      });
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    console.error("提交跑步数据失败:", error);

    // 错误信息已经在 request.js 中处理了，这里只记录日志
    // 如果需要，可以显示更详细的错误信息
    if (error.msg) {
      uni.showToast({
        title: error.msg || "数据提交失败",
        icon: "none",
        duration: 2000,
      });
    }
  }
};

// 处理成功确认
const handleSuccessConfirm = () => {
  showSuccessModal.value = false;
  // 可以跳转到其他页面或重置数据
  uni.navigateBack();
};

// 绘制测试轨迹
const drawTestTrack = async () => {
  // 测试轨迹点（以当前位置为中心的复杂路径）
  const centerLat = mapCenter.value.latitude;
  const centerLng = mapCenter.value.longitude;

  // 生成复杂轨迹点（8字形路径，20公里）
  const testPoints = [];
  const radius = 0.0008; // 大约80米的半径
  const pointCount = 1000; // 增加到1000个点，生成更密集的轨迹
  const targetDistance = 20000; // 20公里 = 20000米
  const targetTime = 6000; // 100分钟 = 6000秒（假设配速5分钟/公里）

  // 设置开始时间（用于计算时间戳）
  const testStartTime = new Date();
  if (!startTime.value) {
    startTime.value = testStartTime;
  }

  // 生成更长的轨迹路径（多个8字形循环）
  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * 20 * Math.PI; // 10个完整的圆，形成更长的路径
    const lat = centerLat + radius * Math.sin(t);
    const lng = centerLng + radius * Math.sin(2 * t) * 0.5; // 8字形

    testPoints.push({
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      altitude: 0,
      speed: 2.5 + Math.random() * 1, // 随机速度
      timestamp:
        testStartTime.getTime() + i * ((targetTime * 1000) / pointCount), // 平均分配时间
    });
  }

  // 设置测试数据
  trackPoints.value = testPoints;
  totalDistance.value = targetDistance; // 20km测试轨迹
  runningTime.value = targetTime; // 100分钟
  hasTrack.value = true;

  // 设置千米分段数据（生成20个千米分段）
  const testEndTime = new Date(testPoints[testPoints.length - 1].timestamp);
  const kmSplitsData = [];
  const secondsPerKm = targetTime / 20; // 每公里时间（秒）
  const timePerKm = (targetTime * 1000) / 20; // 每公里时间（毫秒）

  for (let km = 1; km <= 20; km++) {
    const kmStartTime = new Date(
      testStartTime.getTime() + (km - 1) * timePerKm
    );
    const kmEndTime = new Date(testStartTime.getTime() + km * timePerKm);

    kmSplitsData.push({
      meters: 1000,
      seconds: secondsPerKm,
      seconds_per_km: secondsPerKm,
      start_time: kmStartTime.toISOString(),
      end_time: kmEndTime.toISOString(),
    });
  }

  kmSplits.value = kmSplitsData;
  currentKmStartDistance.value = targetDistance;
  currentKmStartTime.value = testEndTime;

  // 更新地图显示
  updateMapTrack();

  // 计算平均配速
  calculateAvgPace();

  uni.showToast({
    title: "测试轨迹已绘制（20km）",
    icon: "success",
  });

  // 自动调用保存打卡记录接口
  await submitRunningData();
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
  kmSplits.value = [];
  currentKmStartDistance.value = 0;
  currentKmStartTime.value = null;
  startTime.value = null;
  lastLocation.value = null;
  lastRawLocation.value = null;

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
  box-sizing: border-box;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  padding-top: 20rpx;
}

.data-display {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  margin-top: 64rpx;
  padding: 20rpx 0;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-value {
  font-weight: 800;
  font-size: 30rpx;
  color: #000000;
  margin-bottom: 8rpx;
}

.data-label {
  font-weight: bold;
  font-size: 24rpx;
  color: #999999;
}

.button-container {
  position: absolute;
  top: -66rpx;
  left: 0;
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 60rpx;
  align-items: center;
  .button {
    width: 132rpx;
    height: 132rpx;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    margin: 0;
    &:active {
      transform: scale(0.95);
    }
  }
}

.start-button {
  background: #43a047;
}

.pause-button {
  background: #ffb300;
}

.resume-button {
  background: #43a047;
}

.stop-button {
  background: #e53935;
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
  margin-top: 24rpx;
  text-align: center;
}

.progress-tip text {
  font-weight: bold;
  font-size: 20rpx;
  color: #d1d5db;
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
