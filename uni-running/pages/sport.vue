<template>
  <view class="pt20">
    <Navbar title="运动" :bgHeight="370" :back="false" />

    <view class="content">
      <view class="col">
        <view class="row">
          <view class="section user">
            <image
              class="bg"
              src="/static/images/shoes@2x.png"
              mode="aspectFill"
            ></image>
            <image
              class="avatar"
              :src="userInfo.avatar_url || '../static/run.png'"
              mode="aspectFill"
            ></image>
            <view class="money"
              ><image
                class="img"
                style="width: 88rpx; height: 78rpx"
                src="/static/images/icon-coin@2x.png"
                mode="aspectFill"
              ></image>
              <view class="money-text"> 0 </view>
            </view>
          </view>
          <view class="col">
            <view class="section">
              <view class="section-content">
                <view class="section-content-left">
                  <view class="section-content-title">运动记录</view>
                  <view class="section-content-description"
                    >查看你的运动记录</view
                  >
                </view>
                <image
                  class="section-content-icon"
                  style="width: 53rpx; height: 68rpx"
                  src="/static/images/icon-record@2x.png"
                  mode="aspectFill"
                ></image>
              </view>
            </view>
            <view class="section">
              <view class="section-content">
                <view class="section-content-left">
                  <view class="section-content-title">跑量排行榜</view>
                  <view class="section-content-description"
                    >戳这里看谁是第一~</view
                  >
                </view>
                <image
                  class="section-content-icon"
                  style="width: 53rpx; height: 68rpx"
                  src="/static/images/icon-record@2x.png"
                  mode="aspectFill"
                ></image>
              </view>
            </view>
          </view>
        </view>
        <view class="section">
          <view class="section-header">
            <view class="section-header-title">运动记录</view>
            <view class="section-header-more"
              >全部 <u-icon name="arrow-right" size="12" color="#999"></u-icon
            ></view>
          </view>
          <view class="section-content">
            <view class="section-content-title"
              ><image
                class="section-content-title-icon"
                style="width: 68rpx; height: 68rpx"
                src="/static/images/icon-run@2x.png"
                mode="aspectFill"
              ></image
              >累计量程：7589.92公里</view
            >
          </view>
        </view>
      </view>
    </view>
    <!-- 运动记录入口按钮 -->
    <view class="floating-button" @click="goToRunMap">打卡</view>

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

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 跳转到跑步轨迹页面
const goToRunMap = () => {
  uni.navigateTo({
    url: "/pagesSub/runMap",
  });
};
</script>

<style lang="less" scoped>
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
    font-weight: bold;
    font-size: 34rpx;
    color: #000000;
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
  width: 200rpx;
  height: 200rpx;
  background: #ff8c00;
  font-weight: 800;
  font-size: 60rpx;
  color: #ffffff;
  border-radius: 50%;
}

.floating-button:active {
  opacity: 0.8;
}
</style>
