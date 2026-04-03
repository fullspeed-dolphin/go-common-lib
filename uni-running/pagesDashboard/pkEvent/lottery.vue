<script setup>
import { computed, ref } from 'vue';
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import dayjs from "dayjs";
import request from "@/utils/request.js";
import { baseLink } from "@/utils/config.js";

const store = useStore();
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeColor = computed(() => pkEventTheme.value?.solid || '#ff5c5c')
const themeGradient = computed(() => pkEventTheme.value?.gradient || ['#ff5c5c', '#ff5c5c'])
const themeStyle = computed(() => ({
  '--theme-color': themeColor.value,
  '--theme-gradient': `linear-gradient(90deg, ${themeGradient.value[0]}, ${themeGradient.value[1]})`,
}));

const prizeRet = ref(null)
// 用户的抽奖记录（已抽奖时获取）
const myDrawRecord = ref(null)

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 奖品列表
const prizes = ref([])
// 转盘旋转角度
const wheelRotation = ref(0)
// 是否正在旋转
const isSpinning = ref(false)

// 扇形交替颜色：纯白 / 米白
const segmentColors = computed(() => ['#FFFFFF', '#FFF8F0'])

// 生成转盘扇形背景
const wheelBackground = computed(() => {
  if (prizes.value.length === 0) return ''
  const count = prizes.value.length
  const [c1, c2] = segmentColors.value
  const segments = prizes.value.map((p, i) => {
    const color = i % 2 === 0 ? c1 : c2
    const start = (i / count * 100).toFixed(4)
    const end = ((i + 1) / count * 100).toFixed(4)
    return `${color} ${start}% ${end}%`
  })
  return `conic-gradient(${segments.join(', ')})`
})

// 奖品列表（不含感谢参与，用于下方列表展示）
const displayPrizes = computed(() => prizes.value.filter(p => p.prize_type !== 'NONE'))

// 分界线角度列表
const dividerAngles = computed(() => {
  const count = prizes.value.length
  if (count === 0) return []
  return Array.from({ length: count }, (_, i) => (i * 360) / count)
})

const winners = ref([])

// 抽奖专用请求工具
const uatRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${baseLink}/event-api/lottery${url}`,
        method: 'GET',
        data: params,
        header: {
          Authorization: uni.getStorageSync('token'),
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
        url: `${baseLink}/event-api/lottery${url}`,
        method: 'POST',
        data: data,
        header: {
          Authorization: uni.getStorageSync('token'),
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

const eventId = ref('') 
const openid = ref(store?.state?.userInfo?.openid)
const eventInfo = ref({
  event_status: 'ACT',
  has_drawn: false,
  all_prizes_sent: false
})
const userCheckinInfo = ref({ total_qualified_sessions: 0, required_checkins: 0 })
const notRegistered = ref(false)

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
const getLotteryEventInfo = async () => {
  loading.value.eventInfo = true
  errors.value.eventInfo = null

  try {
    const res = await uatRequest.get('/info', {
      event_id: eventId.value,
    })
    if (res.code === 200) {
      eventInfo.value = res.data
      // 已抽奖则获取用户的抽奖记录
      if (res.data.has_drawn) {
        getMyDrawRecord()
      }
    }
  } catch (error) {
    handleError(error, '获取活动信息')
    errors.value.eventInfo = error.message || '获取活动信息失败'
  } finally {
    loading.value.eventInfo = false
  }
}

// 获取用户自己的抽奖记录
const getMyDrawRecord = async () => {
  try {
    const res = await uatRequest.get('/my_records', {
      event_id: eventId.value,
    })
    if (res.code === 200 && res.data && res.data.length > 0) {
      myDrawRecord.value = res.data[0]
    }
  } catch (error) {
    console.error('获取个人抽奖记录失败:', error)
  }
}

// 获取奖品列表
const getPrizes = async () => {
  loading.value.prizes = true
  errors.value.prizes = null

  try {
    const res = await uatRequest.get('/gift_list', {
      event_id: eventId.value
    })
    if (res.code === 200 && res.data.length > 0) {
      // 分离实物奖品和"感谢参与"
      const physicals = res.data.filter(p => p.prize_type !== 'NONE')
      const noneItem = res.data.find(p => p.prize_type === 'NONE')
      const noneEntry = {
        prize_id: noneItem ? noneItem.id : 'none',
        prize_name: noneItem ? noneItem.prize_name : '感谢参与',
        prize_type: 'NONE',
        prize_image_url: ''
      }

      // 实物奖品和"感谢参与"交替排列，保证双数扇形
      const list = []
      physicals.forEach(prize => {
        list.push({
          prize_id: prize.id,
          prize_name: prize.prize_name,
          prize_type: prize.prize_type,
          prize_image_url: prize.prize_image_url
        })
        list.push({ ...noneEntry })
      })
      prizes.value = list
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

// 获取全部抽奖记录（滚动展示用）
const allRecords = ref([])
const lastRecordTime = ref('')

// 首次全量拉取
const getAllRecords = async () => {
  try {
    const res = await uatRequest.get('/records', {
      event_id: eventId.value,
      page: 1,
      page_size: 1000
    })
    if (res.code === 200) {
      allRecords.value = res.data.list || []
      if (allRecords.value.length > 0) {
        lastRecordTime.value = allRecords.value[0].draw_time
      }
    }
  } catch (error) {
    console.error('获取抽奖记录失败:', error)
  }
}

// 增量拉取新记录
const getNewRecords = async () => {
  if (!lastRecordTime.value) return getAllRecords()
  try {
    const res = await uatRequest.get('/records', {
      event_id: eventId.value,
      after_time: lastRecordTime.value
    })
    if (res.code === 200 && res.data.list && res.data.list.length > 0) {
      allRecords.value = [...res.data.list, ...allRecords.value]
      lastRecordTime.value = res.data.list[0].draw_time
    }
  } catch (error) {
    console.error('获取新抽奖记录失败:', error)
  }
}

// 获取用户打卡信息
const getUserCheckinInfo = async () => {
  try {
    const res = await request.get('/user-api/user/getEventCheckins', { event_id: eventId.value }, { showError: false })
    userCheckinInfo.value = res
    notRegistered.value = false
  } catch (error) {
    if (error?.code === 404) {
      notRegistered.value = true
    }
    console.error('获取打卡信息失败:', error)
  }
}

// 执行抽奖
const drawLottery = async () => {
  // 前置条件检查
  if (loading.value.drawing) return // 防止重复点击

  // 未报名检查
  if (notRegistered.value) {
    uni.showModal({
      title: '提示',
      content: `您未参加${userCheckinInfo.value.event_name || '此'}线上活动`,
      showCancel: false,
      confirmText: '知道了'
    })
    return
  }

  // 抽奖活动状态检查
  if (eventInfo.value.event_status !== 'ACT') {
    const statusMap = {
      'PND': '抽奖活动尚未开始',
      'EXP': '抽奖活动已结束'
    }
    uni.showToast({
      title: statusMap[eventInfo.value.event_status] || '活动状态异常',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 用户资格检查（基于 getEventCheckins 接口）
  if (userCheckinInfo.value.total_qualified_sessions < userCheckinInfo.value.required_checkins) {
    uni.showModal({
      title: '提示',
      content: `您需要完成${userCheckinInfo.value.required_checkins}次打卡才能参与抽奖，当前已完成${userCheckinInfo.value.total_qualified_sessions}次`,
      showCancel: false,
      confirmText: '知道了'
    })
    return
  }

  // 已抽奖检查
  if (eventInfo.value.has_drawn) {
    if (myDrawRecord.value?.is_winning) {
      uni.showModal({
        title: '恭喜你中奖了！',
        content: '请前往抽奖记录页面填写收货地址，我们将很快为你发放奖品。',
        showCancel: false,
        confirmText: '去填写',
        confirmColor: themeColor.value,
        success: (res) => {
          if (res.confirm) {
            nav2History()
          }
        }
      })
    } else {
      uni.showModal({
        title: '感谢参与',
        content: '感谢你对全速体育的关注，期待您参加下次活动。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: themeColor.value,
      })
    }
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
      const prizeIndex = prizes.value.findIndex(p => p.prize_id === result.prize_id)
      const idx = prizeIndex >= 0 ? prizeIndex : 0

      // 计算目标角度：转足够多圈 + 停到目标扇形中心
      const count = prizes.value.length
      const segmentAngle = 360 / count
      const targetAngle = 360 - (idx * segmentAngle + segmentAngle / 2)
      const totalRotation = 360 * 8 + targetAngle // 转8圈 + 目标角度

      isSpinning.value = true
      wheelRotation.value = totalRotation

      // 动画结束后处理
      setTimeout(() => {
        isSpinning.value = false
        getLotteryEventInfo()
        getWinners()
        getAllRecords()
        endCallBack(prizes.value[idx])
      }, 4000)

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
  getLotteryEventInfo()
  getPrizes()
  getWinners()
  getUserCheckinInfo()
  getAllRecords()

  // 轮询抽奖记录，每 8 秒增量刷新
  recordsPollingTimer = setInterval(() => {
    getNewRecords()
    getWinners()
  }, 8000)
})

// 页面卸载时清除定时器
let recordsPollingTimer = null
onUnload(() => {
  if (recordsPollingTimer) {
    clearInterval(recordsPollingTimer)
    recordsPollingTimer = null
  }
})

// 2. 定义回调方法
const startCallBack = () => {
  // 抽奖逻辑已移至 drawLottery 函数中
  drawLottery()
}

const endCallBack = (prize) => {
  prizeRet.value = prize
  loading.value.drawing = false

  if (prize.prize_type === 'NONE') {
    uni.showModal({
      title: prize.prize_name || '感谢参与',
      content: '感谢你对全速体育的关注，期待您参加下次活动。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: themeColor.value,
    });
  } else {
    uni.showModal({
      content: `恭喜您获得 ${prize.prize_name || '奖品'}！`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: themeColor.value,
      success: (res) => {
        nav2History()
      }
    });
  }
}

// 获取按钮文本
const getButtonText = () => {
  if (loading.drawing) return '抽奖中...'
  if (loading.prizes || loading.eventInfo) return '加载中...'
  if (notRegistered.value) return '您未报名此活动'
  if (eventInfo.value.event_status !== 'ACT') {
    const statusMap = {
      'PND': '抽奖未开始',
      'EXP': '抽奖已结束'
    }
    return statusMap[eventInfo.value.event_status] || '活动状态异常'
  }
  if (userCheckinInfo.value.total_qualified_sessions < userCheckinInfo.value.required_checkins) return '暂无资格'
  if (eventInfo.value.has_drawn) {
    if (myDrawRecord.value?.is_winning) return '恭喜中奖 🎉'
    return '感谢参与'
  }
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
    <u-navbar autoBack placeholder :title="eventInfo.event_name || '幸运大转盘'" />

    <view class="page">
      <view class="wheel-container">
        <view v-if="loading.prizes" class="loading-overlay">
          <view class="loading-content">
            <text class="loading-text">奖品加载中...</text>
          </view>
        </view>

        <!-- 外圈装饰 -->
        <view class="wheel-outer-ring" :style="{ background: themeColor }">
          <!-- 转盘主体（旋转） -->
          <view
            class="wheel"
            :style="{
              background: wheelBackground,
              transform: 'rotate(' + wheelRotation + 'deg)',
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }"
          >
            <!-- 分界线 -->
            <view
              v-for="(angle, i) in dividerAngles"
              :key="'d' + i"
              class="wheel-divider"
              :style="{ transform: 'rotate(' + angle + 'deg)' }"
            ></view>

            <!-- 奖品文字 -->
            <view
              v-for="(item, index) in prizes"
              :key="'p' + index"
              class="wheel-segment"
              :style="{
                transform: 'rotate(' + (index * 360 / prizes.length + 360 / prizes.length / 2) + 'deg)'
              }"
            >
              <text class="wheel-segment-text">{{ item.prize_name }}</text>
            </view>
          </view>
        </view>

        <!-- 中心指针 -->
        <view class="wheel-center-pointer" @click="startCallBack">
          <view class="wheel-center-arrow" :style="{ borderBottomColor: themeColor }"></view>
          <view class="wheel-center-dot" :style="{ background: themeColor }"></view>
        </view>
      </view>

      <!-- 已抽奖：显示结果文字 -->
      <view class="drawn-result" v-if="eventInfo.has_drawn && myDrawRecord">
        <view v-if="myDrawRecord.is_winning" class="drawn-result-content winning">
          <text class="drawn-result-icon">🎉</text>
          <text class="drawn-result-text">恭喜中奖「{{ myDrawRecord.prize_name }}」</text>
          <text class="drawn-result-sub">请前往抽奖记录页面填写收货地址，我们将很快为你发放奖品</text>
        </view>
        <view v-else class="drawn-result-content not-win">
          <text class="drawn-result-text">感谢参与</text>
          <text class="drawn-result-sub">感谢你对全速体育的关注，期待您参加下次活动</text>
        </view>
      </view>

      <!-- 未抽奖：显示抽奖按钮 -->
      <view class="capsule-wrapper" v-else>
        <view
          class="capsule-btn"
          @click="startCallBack"
          :class="{
            disabled: loading.drawing || loading.prizes || loading.eventInfo,
            'event-not-ended': eventInfo.event_status !== 'ACT',
            'not-eligible': userCheckinInfo.total_qualified_sessions < userCheckinInfo.required_checkins,
          }"
        >
          <text class="btn-text">{{ getButtonText() }}</text>
        </view>
        <view class="checkin-tip" v-if="!notRegistered && userCheckinInfo.total_qualified_sessions < userCheckinInfo.required_checkins">
          <text class="checkin-tip-text">您未满足{{ userCheckinInfo.event_name || '此活动' }}设置的{{ userCheckinInfo.required_checkins }}次打卡要求，请再接再厉</text>
        </view>
      </view>

      <view class="lottery-desc" v-if="eventInfo.description">
        <view class="lottery-desc-title">抽奖说明</view>
        <rich-text class="lottery-desc-content" :nodes="eventInfo.description"></rich-text>
      </view>

      <!-- 奖品列表（横向紧凑展示） -->
      <view class="prizes-bar" v-if="displayPrizes.length > 0">
        <text class="prizes-bar-label">奖品</text>
        <view class="prizes-bar-items">
          <view v-for="(item, index) in displayPrizes" :key="index" class="prizes-bar-tag">
            <text class="prizes-bar-tag-text">{{ item.prize_name }}</text>
          </view>
        </view>
      </view>

      <!-- 抽奖记录滚动区域 -->
      <view class="records-ticker">
        <view class="records-ticker-header">
          <text class="records-ticker-title">抽奖动态</text>
          <text class="records-ticker-count" v-if="allRecords.length > 0">共{{ allRecords.length }}条</text>
        </view>
        <scroll-view class="records-ticker-body" scroll-y v-if="allRecords.length > 0">
          <view v-for="(item, index) in allRecords" :key="index" class="records-ticker-item">
            <image v-if="item.avatar_url" :src="item.avatar_url" class="records-ticker-avatar" mode="aspectFill" />
            <view v-else class="records-ticker-avatar-placeholder"></view>
            <text class="records-ticker-name">{{ item.nickname || '用户' }}</text>
            <text :class="['records-ticker-result', item.is_winning ? 'winning' : 'not-winning']">
              {{ item.is_winning ? '获得了 ' + item.prize_name : '感谢参与' }}
            </text>
          </view>
        </scroll-view>
        <view v-else class="records-ticker-empty">
          <text class="records-ticker-empty-text">暂无抽奖记录，等你来开启！</text>
        </view>
      </view>

      <!-- 中奖名单 -->
      <view class="winners-section">
        <view class="records-ticker-header">
          <view class="winners-section-title">🎉 中奖名单</view>
          <text class="records-ticker-count" v-if="winners.length > 0">共{{ winners.length }}条</text>
        </view>
        <view v-if="winners.length === 0" class="winners-section-empty">
          <text class="winners-section-empty-text">暂无中奖记录，等你来开启！</text>
        </view>
        <view v-else class="winners-section-list">
          <view v-for="(item, index) in winners" :key="index" class="winners-section-item">
            <image v-if="item.avatar" :src="item.avatar" class="winners-section-avatar" mode="aspectFill" />
            <view v-else class="winners-section-avatar-placeholder"></view>
            <view class="winners-section-info">
              <text class="winners-section-name">{{ item.username }}</text>
              <text class="winners-section-prize">获得了 {{ item.prize }}</text>
            </view>
            <text class="winners-section-time">{{ dayjs(item.time).format("MM-DD") }}</text>
          </view>
        </view>
      </view>
      <view class="bottom-spacer" v-if="eventInfo.has_drawn"></view>
    </view>

    <!-- 底部固定按钮：已抽奖时显示 -->
    <view class="bottom-btn-wrapper" v-if="eventInfo.has_drawn">
      <view
        class="bottom-btn"
        :style="{ background: `linear-gradient(90deg, ${themeGradient[0]}, ${themeGradient[1]})` }"
        @click="nav2History"
      >
        <text class="bottom-btn-text">{{ myDrawRecord?.is_winning ? '填写收货地址' : '查看我的抽奖记录' }}</text>
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
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #ff7979 0%,
    #ffd4a3 50%,
    #ffffff 100%
  );
}

.page {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.checkin-tip {
  margin: 44rpx 0 0;
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12rpx;
  text-align: center;
}

.checkin-tip-text {
  font-size: 24rpx;
  color: var(--theme-color, #ff5c5c);
  line-height: 1.6;
}

/* 已抽奖结果展示 */
.drawn-result {
  padding: 40rpx;
  display: flex;
  justify-content: center;
}

.drawn-result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.drawn-result-icon {
  font-size: 56rpx;
}

.drawn-result-content.winning .drawn-result-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #E63E2E;
}

.drawn-result-content.not-win .drawn-result-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #999;
}

.drawn-result-sub {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  line-height: 1.6;
}

/* 底部固定按钮 */
.bottom-btn-wrapper {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  width: 100%;
  padding: 20rpx 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.bottom-btn {
  width: 686rpx;
  height: 96rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-btn-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.bottom-spacer {
  height: 160rpx;
}

.lottery-desc {
  margin: 20rpx 40rpx 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20rpx;
  border-left: 6rpx solid var(--theme-color, #ff5c5c);
}

.lottery-desc-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--theme-color, #ff5c5c);
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.lottery-desc-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.8;
}

.wheel-container {
  position: relative;
  width: 600rpx;
  height: 600rpx;
  margin: 60rpx auto 20rpx;
}

/* 外圈装饰环 */
.wheel-outer-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 16rpx;
  box-sizing: border-box;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.wheel-divider {
  position: absolute;
  width: 2rpx;
  height: 50%;
  top: 0;
  left: 50%;
  margin-left: -1rpx;
  transform-origin: bottom center;
  background-color: #E8D5C0;
}

.wheel-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.wheel-segment-text {
  position: absolute;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24rpx;
  font-weight: 600;
  color: #D2691E;
  writing-mode: vertical-rl;
  letter-spacing: 2rpx;
  white-space: nowrap;
}

/* 中心指针 */
.wheel-center-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}

.wheel-center-arrow {
  width: 0;
  height: 0;
  border-left: 18rpx solid transparent;
  border-right: 18rpx solid transparent;
  border-bottom: 36rpx solid;
  margin-bottom: -6rpx;
}

.wheel-center-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.3);
}

/* 奖品横向条 */
.prizes-bar {
  display: flex;
  align-items: center;
  margin: 0 40rpx 20rpx;
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12rpx;
}

.prizes-bar-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #953F1A;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.prizes-bar-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.prizes-bar-tag {
  padding: 8rpx 20rpx;
  background: #FFF8F0;
  border-radius: 8rpx;
  border: 1rpx solid #F0E0D0;
}

.prizes-bar-tag-text {
  font-size: 22rpx;
  color: #953F1A;
}

/* 抽奖记录滚动区 */
.records-ticker {
  margin: 0 40rpx 40rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.records-ticker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.records-ticker-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.records-ticker-count {
  font-size: 22rpx;
  color: #999;
}

.records-ticker-body {
  max-height: 500rpx;
}

.records-ticker-item {
  display: flex;
  align-items: center;
  padding: 18rpx 24rpx;
  border-bottom: 1rpx solid #fafafa;
}

.records-ticker-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.records-ticker-avatar-placeholder {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 14rpx;
  flex-shrink: 0;
  background: #eee;
}

.records-ticker-name {
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.records-ticker-result {
  font-size: 24rpx;
  flex: 1;
}

.records-ticker-result.winning {
  color: #E63E2E;
  font-weight: 500;
}

.records-ticker-result.not-winning {
  color: #999;
}

.records-ticker-empty {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}

.records-ticker-empty-text {
  font-size: 24rpx;
  color: #ccc;
}

/* 中奖名单 */
.winners-section {
  margin: 0 40rpx 40rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.winners-section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #E63E2E;
}

.winners-section-empty {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}

.winners-section-empty-text {
  font-size: 24rpx;
  color: #ccc;
}

.winners-section-list {
  padding: 0 24rpx;
}

.winners-section-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #fafafa;
}

.winners-section-item:last-child {
  border-bottom: none;
}

.winners-section-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.winners-section-avatar-placeholder {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: #eee;
}

.winners-section-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.winners-section-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.winners-section-prize {
  font-size: 24rpx;
  color: #E63E2E;
}

.winners-section-time {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
}

.prizeImg {
  height: 80rpx;
  width: 80rpx;
}

.capsule-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  margin-bottom: 30rpx;
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