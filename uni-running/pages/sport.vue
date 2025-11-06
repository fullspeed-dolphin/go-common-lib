<template>
  <view class="page">
    <Navbar title="运动" :bgHeight="370" :back="false" />

    <view class="content">
      <view class="col">
        <view class="row">
          <view class="section" @click="goToRanking">
            <view class="section-content">
              <view class="section-content-left">
                <view class="section-content-title">跑量排行榜</view>
                <view class="section-content-description"
                  >戳这里看谁是第一~</view
                >
              </view>
              <image
                class="section-content-icon"
                style="width: 71rpx; height: 69rpx"
                src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-sport-top@2x.png"
                mode="aspectFill"
              ></image>
            </view>
          </view>
          <view class="section" @click="goToRunCheckIn">
            <view class="section-content">
              <view class="section-content-left">
                <view class="section-content-title">打卡记录</view>
                <view class="section-content-description">记录美好生活~</view>
              </view>
              <image
                class="section-content-icon"
                style="width: 53rpx; height: 68rpx"
                src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-record@2x.png"
                mode="aspectFill"
              ></image>
            </view>
          </view>
        </view>
        <view class="section" @click="goToRunRecord">
          <view class="section-header">
            <view class="section-header-title">
              <image
                class="section-header-title-icon"
                style="width: 32rpx; height: 46rpx"
                src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-device-black%402x.png"
                mode="aspectFill"
              ></image>
              运动记录
            </view>
            <view class="section-header-more"
              >全部 <u-icon name="arrow-right" size="12" color="#999"></u-icon
            ></view>
          </view>
          <view class="section-content">
            <view
              class="section-content-title"
              :class="{ empty: !totalDistance }"
              ><image
                class="section-content-title-icon"
                style="width: 68rpx; height: 68rpx"
                src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-run@2x.png"
                mode="aspectFill"
              ></image
              >{{
                totalDistance
                  ? `累计里程：${totalDistance}公里`
                  : "暂无运动记录"
              }}</view
            >
          </view>
        </view>
      </view>
      <map
        class="map"
        :latitude="latitude"
        :longitude="longitude"
        :scale="16"
        :show-location="false"
        :markers="markers"
        :enable-zoom="true"
        :enable-scroll="true"
      ></map>
    </view>
    <!-- 运动记录入口按钮 -->
    <view class="floating-button" @click="goToRunMap">
      <image
        class="floating-button-icon"
        style="width: 40rpx; height: 40rpx"
        src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/run-white@2x.png"
        mode="aspectFill"
      ></image>
    </view>

    <tabbar type="sport" />
  </view>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import { useStore } from "vuex";
import tabbar from "@/components/tabBar.vue";
import Navbar from "@/components/navbar.vue";

// 使用store
const store = useStore();

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 地图中心点坐标
const latitude = ref(39.908823); // 默认北京坐标
const longitude = ref(116.39747);

// 地图标记
const markers = ref([]);

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

// 计算属性
const userInfo = computed(() => store.state.userInfo);
const totalDistance = computed(() => userInfo.value.total_distance || 0);

// 获取定位并设置地图中心点
const getLocation = async () => {
  try {
    // 检查定位权限
    const authSetting = await uni.getSetting();

    // 如果权限被拒绝，使用默认坐标
    if (authSetting.authSetting["scope.userLocation"] === false) {
      console.log("位置权限被拒绝，使用默认坐标");
      return;
    }

    // 获取当前位置
    const res = await uni.getLocation({
      type: "gcj02",
      altitude: true,
    });

    // 验证坐标是否有效
    if (isValidCoordinate(res.latitude, res.longitude)) {
      latitude.value = res.latitude;
      longitude.value = res.longitude;

      // 添加当前位置标记（固定朝北）
      // 图标初始朝向正西（270度），要让它朝北（0度），需要旋转90度
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
          rotate: 90, // 旋转90度，使图标朝北
        },
      ];

      console.log("定位成功:", res.latitude, res.longitude);
    }
  } catch (error) {
    console.error("获取定位失败:", error);
    // 定位失败时使用默认坐标（北京）
    markers.value = [];
  }
};
// 跳转到跑步轨迹页面
const goToRunMap = () => {
  uni.navigateTo({
    url: "/pagesSub/runMap",
  });
};

// 跳转到排行榜页面
const goToRanking = () => {
  uni.navigateTo({
    url: "/pagesSub/sport/top",
  });
};

// 跳转到运动记录页面
const goToRunRecord = () => {
  uni.navigateTo({
    url: "/pagesSub/sport/list",
  });
};

// 跳转到运动打卡页面
const goToRunCheckIn = () => {
  uni.navigateTo({
    url: "/pagesSub/sport/checkIn",
  });
};

// 页面加载时获取定位
onMounted(() => {
  getLocation();
});
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
}
.content {
  padding: 34rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20rpx;
  flex-shrink: 1;
  flex-grow: 1;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  flex-grow: 1;
  flex-shrink: 1;
  height: auto;
}
.section {
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 26rpx 16rpx;
  width: 100%;
  height: 100%;
  flex-shrink: 1;
  flex-grow: 1;
  &:active {
    opacity: 0.8;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 26rpx;
    margin-bottom: 16rpx;
    border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
  }
  .section-header-more {
    color: #999;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
  .section-header-title {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 34rpx;
    color: #000000;
    .section-header-title-icon {
      margin-right: 10rpx;
    }
  }
  .section-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-content-left {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }
  .section-content-title {
    display: flex;
    align-items: center;
    gap: 20rpx;
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
    &.empty {
      color: #999999;
    }
  }
  .section-content-title-icon {
    width: 68rpx;
    height: 68rpx;
    background: #ff8c00;
    border-radius: 16rpx;
    padding: 10rpx;
    box-sizing: border-box;
  }
  .section-content-description {
    font-weight: 500;
    font-size: 24rpx;
    color: #999999;
  }
  .section-content-icon {
    width: 53rpx;
    height: 68rpx;
  }
}
.user {
  position: relative;
  width: 332rpx;
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 20rpx;
  .bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }
  .avatar {
    width: 144rpx;
    height: 144rpx;
    border-radius: 50%;
  }
  .money {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-left: 28rpx;
    font-weight: bold;
    font-size: 44rpx;
    .img {
      width: 88rpx;
      height: 78rpx;
    }
  }
}

// 悬浮按钮样式
.floating-button {
  position: fixed;
  bottom: 180rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 184rpx;
  height: 184rpx;
  background: #ff8c00;
  font-weight: 800;
  font-size: 60rpx;
  color: #ffffff;
  border-radius: 50%;
}

.floating-button:active {
  opacity: 0.8;
}
.map {
  margin-top: 30rpx;
  width: 100%;
  height: 590rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
</style>
