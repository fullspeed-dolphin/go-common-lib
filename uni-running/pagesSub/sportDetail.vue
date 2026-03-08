<template>
  <view class="">
    <u-navbar autoBack placeholder title="运动详情"></u-navbar>
    <view class="flex-col-center" :style="'height:' + pageHeight + 'px'">
      <section class="section-map flex-1 flex-col" style="width: 100%; min-height: 600rpx">
        <map :latitude="centerLatitude" :longitude="centerLongitude" :markers="covers" :polyline="polyline" style="width: 100%; min-height: 600rpx; flex: 1">
        </map>
      </section>

      <section class="section-sport">
        <image class="avatar" :src="
            userInfo.avatar_url ||
            'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
          " mode="aspectFill"></image>
        <view class="flex-between-center">
          <view class="">
            <view class="" style="font-size: 30rpx">总里程:</view>
            <view class="amount u-ml-10 flex-row" style="align-items: flex-end">
              <view class="total">12.42</view>
              公里
            </view>
          </view>
          <view class="tar" style="margin: 10rpx 10rpx 0 0">
            <view class="user">广州凤凰悦跑团 - 阿雄</view>
            <view class="time c9">2025-09-03 18:14</view>
          </view>
        </view>

        <view class="bar">
          <view class="left">慢</view>
          <view class="right">快</view>
        </view>

        <view class="flex-row flex-wrap">
          <view class="statics-item flex-col-center">
            <view class="amount">01:30:31</view>
            用时
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">7'71"</view>
            平均配速
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">117</view>
            平均心率(bpm)
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">117</view>
            用时
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">75</view>
            平均不幅(cm)
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">36</view>
            累计爬升(m)
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">117</view>
            最快1公里
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">75</view>
            总步数
          </view>
          <view class="statics-item flex-col-center">
            <view class="amount">36</view>
            大卡
          </view>
        </view>
      </section>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { useShare, buildPath } from "@/composables/useShare.js";
import request from "@/utils/request.js";
// 使用store
const store = useStore();
// const userInfo = computed(() => store.state.userInfo);

// 路由参数
const routeOptions = ref({});

// 分享配置
useShare(() => ({
  title: `${userInfo.value.nickname || "用户"}的运动详情`,
  path: buildPath("/pagesSub/sportDetail", { id: routeOptions.value.id }),
}));

// 生成轨迹数据的函数
function generateTrackData(
  startLongitude,
  startLatitude,
  pointsCount,
  maxDistance
) {
  let trackPoints = [{ longitude: startLongitude, latitude: startLatitude }];

  for (let i = 1; i < pointsCount; i++) {
    let lastPoint = trackPoints[i - 1];
    let newLongitude =
      lastPoint.longitude + (Math.random() * 2 - 1) * maxDistance;
    let newLatitude =
      lastPoint.latitude + (Math.random() * 2 - 1) * maxDistance;

    // 确保不会偏离太多
    if (Math.abs(newLongitude) > 180 || Math.abs(newLatitude) > 90) {
      i--; // 如果新生成的点不在有效范围内，则重新生成
      continue;
    }

    trackPoints.push({ longitude: newLongitude, latitude: newLatitude });
  }

  return trackPoints;
}

// 使用示例
let testTrackData = generateTrackData(116.39742, 39.909, 50, 0.001); // 起始于北京某地，生成50个点

// 响应式数据
const centerLatitude = ref(39.909); // 地图中心纬度
const centerLongitude = ref(116.39742); // 地图中心经度
const covers = ref([
  {
    latitude: 39.909,
    longitude: 116.39742,
    iconPath: "/static/location.png",
  },
]);
const polyline = ref([
  {
    points: [],
    color: "#FF0000DD",
    width: 2,
    dottedLine: true,
  },
]);
const statusBarHeight = ref(0);
const navBarHeight = ref(0);
const options = ref({});

// 计算属性
const userInfo = computed(() => store.state.userInfo);

const pageHeight = computed(() => {
  const WindowInfo = uni.getWindowInfo();

  // 状态栏高度（单位 px）
  statusBarHeight.value = WindowInfo.statusBarHeight || 0;

  // 导航栏高度计算（关键）
  let navBarHeightValue = 0;

  // 方法一：通过胶囊按钮位置计算（推荐）
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  if (menuButtonInfo) {
    // 导航栏高度 ≈ (胶囊顶部 - 状态栏底部) * 2 + 胶囊高度
    // 简化计算：直接使用胶囊底部到状态栏顶部的距离
    navBarHeightValue =
      menuButtonInfo.bottom + (menuButtonInfo.top - statusBarHeight.value);
  } else {
    // 兜底方案：使用默认高度（单位 px）
    navBarHeightValue = statusBarHeight.value + 44; // iOS 44px, Android 48px，取中间值或根据平台判断
  }

  navBarHeight.value = navBarHeightValue;

  // 计算内容区域可用高度
  return WindowInfo.windowHeight - navBarHeightValue - 20;
});

// 页面加载
onLoad((optionsParam) => {
  console.log("optionsParam===", optionsParam, testTrackData);
  options.value = optionsParam;
  routeOptions.value = optionsParam;

  // polyline.value[0].points = testTrackData; // 假设trackPoints已在其他地方定义
  // 获取路径
  getPolylinePoint();
});

const getPolylinePoint = (point) => {
  let params = {
    id: options.value.id,
    Authorization: userInfo.value.token,
  };
  request.get("/sport-api/api/healthdata/track", params).then((res) => {
    polyline.value[0].points = testTrackData;
    polyline.value[0].points = res.points.map((item) => {
      return {
        longitude: +item.longitude,
        latitude: +item.latitude,
      };
    });
    covers.value[0].latitude = +res.points[0].latitude[0];
    covers.value[0].longitude = +res.points[0].longitude[0];
    // covers.value = [
    //   {
    //     latitude: +res.points[0].latitude[0],
    //     longitude: +res.points[0].longitude[0],
    //     iconPath: "/static/location.png",
    //   },
    // ];
    centerLatitude.value = +res.points[0].latitude[0];
    centerLongitude.value = +res.points[0].longitude[0];
    // console.log('res====',JSON.parse(JSON.stringify(polyline.value[0].points)),'==',polyline.value[0].points)
  });
};

// 方法定义
const successLogin = () => {
  if (options.value?.direct) {
    uni.navigateBack();

    return false;
  }

  uni.switchTab({
    url: "/pages/index",
    success() {
      uni.hideLoading();
    },
  });
};
</script>

<style lang="less" scoped>
.section-sport {
  position: relative;
  color: #999;
  width: 712rpx;
  height: 638rpx;
  background: #ffffff;
  border-radius: 26rpx 26rpx 26rpx 26rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 14rpx 26rpx;
}
.avatar {
  position: absolute;
  width: 112rpx;
  height: 112rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  right: 36rpx;
  top: -56rpx;
  z-index: 10;
  border-radius: 999rpx;
}
.total {
  font-weight: bold;
  font-size: 100rpx;
  color: #000000;
  margin-right: 10rpx;
}
.user {
  font-weight: 500;
  font-size: 30rpx;
  color: #000000;
  line-height: 42rpx;
  margin: 18rpx 0 8rpx;
}

.bar {
  position: relative;
  width: 642rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #94d243 0%, #ff8c00 100%);
  border-radius: 2rpx 2rpx 2rpx 2rpx;
  margin: 34rpx 0;
  .left {
    position: absolute;
    top: 50%;
    left: 56rpx;
    transform: translateY(-50%);
    font-weight: 500;
    font-size: 24rpx;
    color: #94d243;
    padding: 0 4rpx;
    background: #fff;
  }
  .right {
    position: absolute;
    top: 50%;
    right: 56rpx;
    padding: 0 4rpx;
    transform: translateY(-50%);
    font-weight: 500;
    font-size: 24rpx;
    color: #94d243;
    background: #fff;
  }
}

.statics-item {
  min-width: 33.3%;
  margin-bottom: 40rpx;
  .amount {
    font-weight: bold;
    font-size: 50rpx;
    color: #000000;
    margin-bottom: 20rpx;
  }
}
</style>
