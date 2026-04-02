<script setup>
import { computed, ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
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

// 计算属性
const userInfo = computed(() => store.state.userInfo);

const blocks = ref([
  {
    padding: '24rpx',
    background: '#F5E6D3',
    borderRadius: '50%'
  }
])


const buttons = ref([
  // 第一层：外圈
  {
    radius: '96rpx',
    background: '#FDC291',
    shadow: '0 0 30rpx rgba(255, 180, 70, 0.6)'
  },
  // 第二层：中间金色装饰环
  {
    radius: '84rpx',
    background: '#FFA500',
    border: '4rpx solid #FFD700'
  },
  // 第三层：核心抽奖按钮
  {
    radius: '72rpx',
    background: '#E63E2E',
    border: '6rpx solid #FFD700',
    shadow: '0 8rpx 16rpx rgba(0,0,0,0.3)',
    pointer: true,
    fonts: [{
      text: '抽奖',
      top: '-12rpx',
      fontSize: '36rpx',
      fontColor: '#FFE484',
      fontWeight: 'bold'
    }]
  }
])

const defaultStyle = ref({
  fontColor: '#8B4513',
  fontSize: '26rpx',
  fontWeight: '500'
})

// 移除假数据，使用接口数据
const prizes = ref([])

const winners = ref([])

// UAT环境配置
// 简单的UAT请求工具，直接使用全局的token获取方式
const uatRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `https://uat.speexpay.com/event-api/api/gift${url}`,
        method: 'GET',
        data: params,
        header: {
          Authorization: uni.getStorageSync('token'),
          // Authorization: '5a4ecef41628100c272b764ea75f0d0d8fdf0b51d79b960edfec27a278eccf75',
          'content-type': 'application/json',
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data && res.data.code !== undefined) {
              // 业务状态码处理
              if (res.data.code === 200) {
                resolve(res.data)
              } else {
                console.warn(`API业务错误: ${url}`, res.data)
                reject({
                  type: 'business',
                  code: res.data.code,
                  message: res.data.message || '业务处理失败',
                  data: res.data
                })
              }
            } else {
              resolve(res.data)
            }
          } else {
            console.error(`API HTTP错误: ${url}`, res)
            reject({
              type: 'http',
              statusCode: res.statusCode,
              message: `服务器错误 (${res.statusCode})`
            })
          }
        },
        fail: (err) => {
          console.error(`API网络错误: ${url}`, err)
          reject({
            type: 'network',
            message: '网络连接失败，请检查网络'
          })
        }
      })
    })
  },
  post: (url, data, headers = {}) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `https://uat.speexpay.com/event-api/api/gift${url}`,
        method: 'POST',
        data: data,
        header: {
          Authorization: uni.getStorageSync('token'),
          // Authorization: '5a4ecef41628100c272b764ea75f0d0d8fdf0b51d79b960edfec27a278eccf75',
          'content-type': 'application/json',
          ...headers
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data && res.data.code !== undefined) {
              // 业务状态码处理
              if (res.data.code === 200) {
                resolve(res.data)
              } else {
                console.warn(`API业务错误: ${url}`, res.data)
                reject({
                  type: 'business',
                  code: res.data.code,
                  message: res.data.message || '业务处理失败',
                  data: res.data
                })
              }
            } else {
              resolve(res.data)
            }
          } else {
            console.error(`API HTTP错误: ${url}`, res)
            reject({
              type: 'http',
              statusCode: res.statusCode,
              message: `服务器错误 (${res.statusCode})`
            })
          }
        },
        fail: (err) => {
          console.error(`API网络错误: ${url}`, err)
          reject({
            type: 'network',
            message: '网络连接失败，请检查网络'
          })
        }
      })
    })
  }
}

// 活动数据 TODO:
// const eventId = ref('01KH0WQX4H2C7Q4GJ217P8T922') // 测试活动ID
// const openid = ref('oEuZJvoN4oia8LJ-2k5A15S9CVSM')
const eventId = ref('') 
const openid = ref(store?.state?.userInfo?.openid)
const eventInfo = ref({
  event_status: 'ACTIVE',
  is_eligible: true,
  has_drawn: false,
  qualified_checkins: 0,
  all_prizes_sent: false
})

// 加载状态管理
const loading = ref({
  eventInfo: false,
  prizes: false,
  winners: false,
  drawing: false
})

// 错误状态管理
const errors = ref({
  eventInfo: null,
  prizes: null,
  winners: null,
  drawing: null
})

// 获取活动信息
const getEventInfo = async () => {
  loading.value.eventInfo = true
  errors.value.eventInfo = null

  try {
    const res = await uatRequest.get('/event_info', {
      event_id: eventId.value,
    })
    if (res.code === 200) {
      eventInfo.value = res.data
    }
  } catch (error) {
    handleError(error, '获取活动信息')
    errors.value.eventInfo = error.message || '获取活动信息失败'
  } finally {
    loading.value.eventInfo = false
  }
}

// 获取奖品列表
const getPrizes = async () => {
  loading.value.prizes = true
  errors.value.prizes = null

  try {
    const res = await uatRequest.get('/prizes', {
      event_id: eventId.value
    })
    if (res.code === 200 && res.data.length > 0) {
      // 动态生成奖品数据，保持前端样式不变
      prizes.value = res.data.map((prize, index) => {
        const isEven = index % 2 === 0
        const ret = {
          fonts: [{ text: prize.prize_name, top: '15%', fontSize: '24rpx', fontColor: '#D2691E' }],
          background: isEven ? '#FFFFFF' : '#FFF8F0',
          prize_id: prize.id,
          prize_type: prize.prize_type
        }
        if (prize.prize_image_url) {
          ret.imgs = [{ src: prize.prize_image_url, width: '30%', top: '45%' }]
        }
        return ret
      })
      console.log('奖品列表加载成功:', prizes.value)
    } else if (res.code === 200 && res.data.length === 0) {
      // 奖品列表为空
      errors.value.prizes = '暂无奖品信息'
    }
  } catch (error) {
    handleError(error, '获取奖品列表')
    errors.value.prizes = error.message || '获取奖品列表失败'
  } finally {
    loading.value.prizes = false
  }
}

// 获取中奖名单
const getWinners = async () => {
  loading.value.winners = true
  errors.value.winners = null

  try {
    const res = await uatRequest.get('/winners', {
      event_id: eventId.value,
      page: 1,
      page_size: 20
    })
    if (res.code === 200) {
      winners.value = res.data.list.map(item => ({
        username: item.nickname,
        phone: item.phone,
        avatar: item.avatar_url,
        prize: item.prize_name,
        prizeImg: '/static/icons/lottery-icon.png',
        time: item.draw_time
      }))
    }
  } catch (error) {
    console.error('获取中奖名单失败:', error)
    errors.value.winners = error.message || '获取中奖名单失败'
    // 中奖名单加载失败不影响主要功能，静默处理
  } finally {
    loading.value.winners = false
  }
}

// 执行抽奖
const drawLottery = async () => {
  // 前置条件检查
  if (loading.value.drawing) return // 防止重复点击

  // 活动状态检查
  if (eventInfo.value.event_status !== 'ACTIVE') {
    const statusMap = {
      'NOT_STARTED': '活动尚未开始',
      'ENDED': '活动已结束'
    }
    uni.showToast({
      title: statusMap[eventInfo.value.event_status] || '活动状态异常',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 用户资格检查
  if (!eventInfo.value.is_eligible) {
    uni.showModal({
      title: '提示',
      content: `您需要完成10次打卡才能参与抽奖，当前已完成${eventInfo.value.qualified_checkins}次`,
      showCancel: false,
      confirmText: '知道了'
    })
    return
  }

  // 已抽奖检查
  if (eventInfo.value.has_drawn) {
    uni.showModal({
      title: '提示',
      content: '您已参与过抽奖，每人仅可参与一次',
      showCancel: false,
      confirmText: '查看记录',
      success: (res) => {
        if (res.confirm) {
          nav2History()
        }
      }
    })
    return
  }

  // 奖品库存检查
  if (eventInfo.value.all_prizes_sent) {
    uni.showToast({
      title: '很遗憾，奖品已全部送出',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 开始抽奖流程
  loading.value.drawing = true
  errors.value.drawing = null



  try {
    const res = await uatRequest.post('/draw', {
      event_id: eventId.value,
      openid: openid.value
    })

    if (res.code === 200) {
      const result = res.data

      // 抽奖成功，找到对应奖品索引
      const prizeIndex = prizes.value.findIndex(p => p.prize_id === result.prize_id)
      
      // 先开始旋转
      myLucky.value?.play()

      // 延迟停止，增加悬念
      setTimeout(() => {
        myLucky.value?.stop(prizeIndex >= 0 ? prizeIndex : 0)
        // 更新用户状态
        getEventInfo()
      }, 1500)

    } else {
      // 业务错误处理
      const errorMsgs = {
        1001: '活动未结束',
        1002: '打卡次数不足',
        1003: '您已参与过抽奖',
        1004: '奖品已全部送出'
      }

      // 停止转盘
      // myLucky.value?.stop(0)

      // 显示具体错误原因
      uni.showToast({
        title: errorMsgs[res.code] || '抽奖失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    console.error('抽奖失败:', error)
    errors.value.drawing = error.message || '抽奖失败'

    // 停止转盘
    // myLucky.value?.stop(0)

    // 网络错误处理
    if (error.type === 'network') {
      uni.showModal({
        title: '网络错误',
        content: '网络连接失败，是否重试？',
        showCancel: true,
        cancelText: '取消',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            drawLottery()
          }
        }
      })
    } else {
      uni.showToast({
        title: '抽奖失败，请稍后重试',
        icon: 'none'
      })
    }
  } finally {
    loading.value.drawing = false
  }
}

// 统一的错误处理函数
const handleError = (error, context) => {
  console.error(`${context}错误:`, error)

  // 错误分类处理
  if (error.type === 'auth') {
    // 认证错误
    uni.showModal({
      title: '登录过期',
      content: error.message || '请重新登录',
      showCancel: false,
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          // 跳转到登录页面
          uni.navigateTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  } else if (error.type === 'network') {
    uni.showToast({
      title: '网络连接失败',
      icon: 'none',
      duration: 2000
    })
  } else if (error.type === 'business') {
    // 业务错误根据 code 处理
    const errorMessages = {
      1001: '活动未开始',
      1002: '暂无抽奖资格',
      1003: '已参与抽奖',
      1004: '奖品已送完'
    }

    if (!errorMessages[error.code]) {
      uni.showToast({
        title: error.message || '服务异常',
        icon: 'none',
        duration: 2000
      })
    }
  } else if (error.type === 'http') {
    uni.showToast({
      title: `服务器错误 (${error.statusCode})`,
      icon: 'none',
      duration: 2000
    })
  }
}

// 使用 onLoad 生命周期获取页面参数
onLoad((options) => {
  if (options.eventId) {
    eventId.value = options.eventId
  }
  // 获取数据
  getEventInfo()
  getPrizes()
  getWinners()
})

// 2. 定义回调方法
const startCallBack = () => {
  // 抽奖逻辑已移至 drawLottery 函数中
  drawLottery()
}

// // 2. 定义回调方法
// const startCallBack = () => {
//   // 先开始旋转
//   myLucky.value?.play()
  
//   // 模拟请求接口获取中奖结果
//   // 实际项目中替换为真实的 API 请求
//   setTimeout(() => {
//     // 假设后端返回的中奖索引是 0（根据实际情况修改）
//     // 注意：索引对应 prizes 数组的位置，从 0 开始
//     const index = 1
//     // 调用 stop 停止旋转并传递中奖索引
//     myLucky.value?.stop(index)
//   }, 3000)
// }

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

// 获取按钮文本
const getButtonText = () => {
  if (loading.drawing) return '抽奖中...'
  if (loading.prizes || loading.eventInfo) return '加载中...'
  if (eventInfo.value.event_status !== 'ACTIVE') {
    const statusMap = {
      'NOT_STARTED': '活动未开始',
      'ENDED': '活动已结束'
    }
    return statusMap[eventInfo.value.event_status] || '活动状态异常'
  }
  if (!eventInfo.value.is_eligible) return '暂无资格'
  if (eventInfo.value.has_drawn) return '已抽奖'
  if (eventInfo.value.all_prizes_sent) return '奖品已送完'
  return '开始抽奖'
}

// 跳转到抽奖历史页面
const nav2History = () => {
  uni.navigateTo({
    url: `/pagesDashboard/pkEvent/lottery-history?eventId=${eventId.value}`,
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
        <!-- 奖品加载状态 -->
        <view v-if="loading.prizes" class="loading-overlay">
          <view class="loading-content">
            <text class="loading-text">奖品加载中...</text>
          </view>
        </view>

        <!-- 转盘主体 -->
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
        <view
          class="capsule-btn"
          @click="startCallBack"
          :class="{
            disabled: loading.drawing || loading.prizes || loading.eventInfo,
            'event-not-ended': eventInfo.event_status !== 'ACTIVE',
            'not-eligible': !eventInfo.is_eligible,
            'already-drawn': eventInfo.has_drawn
          }"
        >
          <text class="btn-text">{{ getButtonText() }}</text>
        </view>
      </view>

      <view class="prizes-list" v-if="prizes.length > 0">
        <view class="prizes-list-title">奖品列表</view>
        <view class="prizes-list-items">
          <view
            v-for="(item, index) in prizes"
            :key="index"
            class="prize-item"
          >
            <view class="prize-index">{{ index + 1 }}</view>
            <view class="prize-info">
              <view class="prize-name-text">{{ item.fonts[0].text }}</view>
              <view class="prize-type" :class="item.prize_type">
                {{ item.prize_type === 'PHYSICAL' ? '实物奖品' : item.prize_type === 'NONE' ? '虚拟奖品' : '其他奖品' }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="spacer"></view>

      <view class="winners-container">
        <view class="winners-container-title">- 中奖名单 -</view>

        <view class="winners-item-wrapper">
          <view v-if="winners.length === 0" class="empty-winners">
            <text class="empty-text">暂无中奖者，祝君好运</text>
          </view>
          <view v-else>
            <view v-for="(item, index) in winners" :key="index">
              <view class="winners-item">
                <view class="winners-item-left">
                  <image :src="item.avatar" class="winner-avatar" mode="scaleToFill" />

                  <view class="winner-user-info-wrapper">
                    <view class="winner-user-info">
                      <text class="winner-username">{{ item.username }}</text>
                      <view class="time-container">{{ dayjs(item.time).format("YYYY-MM-DD") }}</view>
                    </view>

                    <text class="prize">获得了 {{ item.prize }} ！</text>
                  </view>

                </view>

                <view class="winners-item-right">
                  <!-- <image :src="item.prizeImg" class="prizeImg" mode="scaleToFill"/> -->
                </view>
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
  overflow-y: auto;
  background: linear-gradient(
    to bottom,
    #ff7979 0%,    /* 浅红色 */
    #ffd4a3 50%,   /* 中间过渡色 */
    #ffffff 100% 
  );
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0 50rpx 0;
}

.prizes-list {
  background-color: white;
  padding: 30rpx 40rpx;
  margin: 0 40rpx 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: block !important;
  min-height: 100rpx;
}

.prizes-list-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.prizes-list-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.prize-item:last-child {
  border-bottom: none;
}

.prize-index {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.prize-info {
  flex: 1;
}

.prize-name-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.prize-type {
  font-size: 24rpx;
  color: #999;
}

.prize-type.PHYSICAL {
  color: #4caf50;
}

.prize-type.NONE {
  color: #999;
}

.winners-container {
  background-color: white;
  width: 100%;
  border-radius: 26rpx 26rpx 0 0;
  margin-top: 40rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.spacer {
  min-height: 40rpx;
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
  min-height: 200rpx;
}

.empty-winners {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.winners-item {
  height: fit-content;
  background-color: #FFF8F0;
  border: 2rpx solid #F8F2EA;
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

.capsule-btn.already-drawn {
  animation: none;
  box-shadow: 0 10rpx 20rpx rgba(255, 71, 87, 0.4);
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