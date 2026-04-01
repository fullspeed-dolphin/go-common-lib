<script setup>
import { computed, ref } from 'vue';
import { useStore } from "vuex";
import LuckyWheel from '@lucky-canvas/uni/lucky-wheel'
import dayjs from "dayjs";

const store = useStore();
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

// 组件引用
const myLucky = ref(null)
// const showPop = ref(false)
const prizeRet = ref(null)

const blocks = ref([
  { 
    padding: '12px', 
    background: '#F5E6D3',
    borderRadius: '50%' 
  }
])

const prizes = ref([
  { 
    fonts: [{ text: '五周年提现红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFFFFF',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '高级五周年红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFF8F0',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '五周年提现红包*3', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFFFFF',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '高级五周年红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFF8F0',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '五周年提现红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFFFFF',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '高级五周年红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFF8F0',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '五周年提现红包', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFFFFF',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
  { 
    fonts: [{ text: '未中奖', top: '15%', fontSize: '12px', fontColor: '#D2691E' }], 
    background: '#FFF8F0',
    imgs: [{ src: '/static/icons/lottery-icon.png', width: '30%', top: '35%' }]
  },
])

const buttons = ref([
  // 第一层：外圈
  { 
    radius: '48px', 
    background: '#FDC291',
    shadow: '0 0 15px rgba(255, 180, 70, 0.6)'
  },
  // 第二层：中间金色装饰环
  { 
    radius: '42px', 
    background: '#FFA500',
    border: '2px solid #FFD700'
  },
  // 第三层：核心抽奖按钮
  {
    radius: '36px',
    background: '#E63E2E',
    border: '3px solid #FFD700',
    shadow: '0 4px 8px rgba(0,0,0,0.3)',
    pointer: true,
    fonts: [{
      text: '抽奖',
      top: '-6px',
      fontSize: '18px',
      fontColor: '#FFE484',
      fontWeight: 'bold'
    }]
  }
])

const defaultStyle = ref({
  fontColor: '#8B4513',
  fontSize: '13px',
  fontWeight: '500'
})

const winners = ref([
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
  { username: "foo", time: "2026-03-31T23:59:59+08:00", prize: "电视", prizeImg: "/static/icons/lottery-icon.png", avatar: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/03/23/01KMCC17SGMNBCECKQSD3WW77D.png?x-oss-process=image/resize,w_700,h_350,m_fill" },
])

// 2. 定义回调方法
const startCallBack = () => {
  // 先开始旋转
  myLucky.value?.play()
  
  // 模拟请求接口获取中奖结果
  // 实际项目中替换为真实的 API 请求
  setTimeout(() => {
    // 假设后端返回的中奖索引是 0（根据实际情况修改）
    // 注意：索引对应 prizes 数组的位置，从 0 开始
    const index = 1
    // 调用 stop 停止旋转并传递中奖索引
    myLucky.value?.stop(index)
  }, 3000)
}

const endCallBack = (prize) => {
  // 抽奖结束回调，prize 是中奖的奖品对象
  prizeRet.value = prize
  console.log('中奖结果:', prize)
  
  // 在这里处理中奖逻辑，例如：
  // 1. 弹出中奖弹窗
  // 2. 上报中奖数据
  // 3. 更新用户奖品列表等
  if (prize.fonts?.[0]?.text === "未中奖") {
    uni.showModal({
      // title: '提示',
      content: "谢谢参与",
      showCancel: false,
      confirmText: '知道了',
    });
  } else {
    uni.showModal({
      // title: '提示',
      content: `恭喜您获得 ${prize.fonts?.[0]?.text || '奖品'}！`,
      showCancel: false,
      confirmText: '知道了',
      success: (res) => {
        nav2History()
      }
    });
    // showPop.value = true
  }
}

// 跳转到抽奖历史页面
const nav2History = () => {
  uni.navigateTo({
    url: "/pagesDashboard/pkEvent/lottery-history",
  });
}
</script>

<template>
  <view class="page-outter" :style="themeStyle">
    <u-navbar autoBack placeholder :title="detailInfo?.event_name || '幸运大转盘'" />

    <view class="page">
      <view class="history-wrapper">
        <view class="history" @click="nav2History">查看记录</view>
      </view>

      <view class="wheel-container">
        <LuckyWheel
          ref="myLucky"
          width="600rpx"
          height="600rpx"
          :blocks="blocks"
          :prizes="prizes"
          :buttons="buttons"
          :defaultStyle="defaultStyle"
          @start="startCallBack"
          @end="endCallBack"
        />      
      </view>

      <view class="capsule-wrapper">
        <view class="capsule-btn" @click="startCallBack">
          <text class="btn-text">开始抽奖</text>
        </view>
      </view>

      <view class="winners-container">
        <view class="winners-container-title">- 中奖名单 -</view>

        <view class="winners-item-wrapper">
          <view v-for="(item, index) in winners" :key="index">
            <view class="winners-item">
              <view class="winners-item-left">
                <image :src="item.avatar" class="winner-avatar" mode="scaleToFill" />
              
                <view class="winner-user-info-wrapper">
                  <view class="winner-user-info">
                    <text class="winner-username">{{ item.username }}</text>
                    <view class="time-container">{{ dayjs(item.time).format("YYYY-MM-DD") }}</view>
                  </view>

                  <text class="prize">获得了{{ item.prize }} ！</text>
                </view>

              </view>

              <view class="winners-item-right">
                <image :src="item.prizeImg" class="prizeImg" mode="scaleToFill"/>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- <u-popup
    :show="showPop"
    mode="center"
    @close="() => showPop = !showPop"
    :closeOnClickOverlay="false"
    closeable
  >
    <view class="popup-container">
      <view>
        <text>{{ `恭喜您获得 ${prizeRet?.fonts?.[0]?.text}！` }}</text>
        <image :src="prizeRet?.imgs?.[0]?.src" mode="scaleToFill" class="popImg" />
      </view>
    </view>
  </u-popup> -->
</template>

<style scoped>
.page-outter {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-wrapper {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.history {
  padding: 10rpx 20rpx;
  background-color: #ff4757;
  border-radius: 100rpx 0 0 100rpx;
  color: #fff;
}

.page {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(
    to bottom,
    #ff7979 0%,    /* 浅红色 */
    #ffd4a3 50%,   /* 中间过渡色 */
    #ffcc99 100%   /* 浅橙色 */
  );
}

.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0 50rpx 0;
}

.winners-container {
  background-color: white;
  width: 100%;
  border-radius: 26rpx 26rpx 0 0;
}

.winners-container-title {
  font-size: 40rpx;
  color: #953F1A;
  display: flex;
  justify-content: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #ededed;
}

.winners-item-wrapper {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.winners-item {
  height: fit-content;
  background-color: #FFF8F0;
  border: 1px solid #F8F2EA;
  padding: 40rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.winners-item-left {
  display: flex;
  gap: 20rpx;
}

.winners-item-right {
  height: 80rpx;
  width: 80rpx;
  overflow: hidden;
}

.winner-avatar {
  height: 80rpx;
  width: 80rpx;
  border-radius: 50%;
}

.winner-user-info-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.winner-user-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.winner-username {
  color: #953F1A;
  font-size: 30rpx;
}

.time-container {
  color: #953F1A;
  font-size: 20rpx;
  background-color: #ffe1c3;
  border-radius: 9999px;
  padding: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.prize {
  color: #C19E86;
}

.prizeImg {
  height: 80rpx;
  width: 80rpx;
}

.capsule-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  margin-bottom: 50rpx;
}

.capsule-btn {
  display: inline-block;
  padding: 24rpx 100rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-radius: 100rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 10rpx 20rpx rgba(255, 71, 87, 0.4);
  animation: scaleAnimation 1.2s ease-in-out infinite;
}

.capsule-btn .btn-text {
  display: block;
  letter-spacing: 4rpx;
}

@keyframes scaleAnimation {
  0% {
    transform: scale(1);
    box-shadow: 0 10rpx 20rpx rgba(255, 71, 87, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 20rpx 40rpx rgba(255, 71, 87, 0.7);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 10rpx 20rpx rgba(255, 71, 87, 0.4);
  }
}

/* .popup-container {
  display: flex;
  justify-content: center;
  width: 100%;
  color: #953F1A;
  font-size: 40rpx;
}

.popImg {
  height: 300rpx;
  width: 300rpx;
} */
</style>