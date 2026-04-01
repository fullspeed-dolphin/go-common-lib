<script setup>
import { computed, ref, reactive } from 'vue';
import { useStore } from "vuex";
import dayjs from "dayjs";
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";

const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom)

const store = useStore();
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

const records = ref([])

// 弹窗相关状态
const showAddressModal = ref(false)
const addressForm = ref({
  record_id: '',
  recipient_name: '',
  contact_number: '',
  address: ''
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const formRules = {
  recipient_name: [
    { required: true, message: '请输入收件人姓名', trigger: ['blur', 'change'] },
    { min: 2, max: 20, message: '姓名长度应在2-20个字符之间', trigger: ['blur', 'change'] }
  ],
  contact_number: [
    { required: true, message: '请输入联系电话', trigger: ['blur', 'change'] },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: ['blur', 'change'] },
    { min: 10, max: 200, message: '地址长度应在10-200个字符之间', trigger: ['blur', 'change'] }
  ]
}

// 获取抽奖记录列表
const getList = (mescroll) => {
  // 模拟请求数据 - 这里替换成你的实际API请求
  uni.showLoading({ mask: true });

  // 模拟异步请求
  setTimeout(() => {
    // 第一页清空列表
    if (mescroll.num == 1) records.value = []

    // 模拟返回的数据
    const mockData = generateMockData(mescroll.num, mescroll.size)
    records.value = records.value.concat(mockData)

    uni.hideLoading();
    // 结束加载状态
    mescroll.endSuccess(mockData.length);
  }, 800)
}

// 生成模拟数据
const generateMockData = (page, pageSize) => {
  const data = []
  const startId = (page - 1) * pageSize + 1
  const prizeTypes = ['NONE', 'FIRST_PRIZE', 'SECOND_PRIZE', 'THIRD_PRIZE', 'FOURTH_PRIZE', 'FIFTH_PRIZE', 'SIXTH_PRIZE']
  const prizeNames = {
    'NONE': '谢谢参与',
    'FIRST_PRIZE': '一等奖 - iPhone 15 Pro',
    'SECOND_PRIZE': '二等奖 - AirPods Pro',
    'THIRD_PRIZE': '三等奖 - 小米手环',
    'FOURTH_PRIZE': '四等奖 - 运动水壶',
    'FIFTH_PRIZE': '五等奖 - 优惠券10元',
    'SIXTH_PRIZE': '六等奖 - 积分100'
  }

  for (let i = 0; i < pageSize; i++) {
    const id = startId + i
    const prizeType = prizeTypes[Math.floor(Math.random() * prizeTypes.length)]
    const status = prizeType === 'NONE' ? 'NOT_WIN' : 'WIN'

    // 生成随机时间（最近30天内）
    const randomDays = Math.floor(Math.random() * 30)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    const randomSeconds = Math.floor(Math.random() * 60)
    const randomTime = dayjs().subtract(randomDays, 'day').subtract(randomHours, 'hour').subtract(randomMinutes, 'minute').subtract(randomSeconds, 'second').format('YYYY-MM-DDTHH:mm:ss') + 'Z'

    data.push({
      id: `01HXK${String(id).padStart(15, '0')}`,
      prize_name: prizeNames[prizeType],
      prize_type: prizeType,
      status: status,
      draw_time: randomTime
    })
  }

  return data
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('MM-DD HH:mm')
}

// 打开地址弹窗
const openAddressModal = () => {
  showAddressModal.value = true
}

// 提交地址信息
const submitAddress = async () => {
  // 使用u-form进行校验
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证通过后提交
    uni.showLoading({ title: '提交中...', mask: true })

    // 获取用户token
    const token = uni.getStorageSync('token') || ''

    // 调用API提交地址信息（不传record_id，因为这是通用地址）
    const response = await uni.request({
      url: `${getBaseUrl()}/api/v1/gift/address`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        recipient_name: addressForm.value.recipient_name,
        contact_number: addressForm.value.contact_number,
        address: addressForm.value.address
      }
    })

    uni.hideLoading()

    if (response[1].statusCode === 200) {
      uni.showToast({ title: '提交成功', icon: 'success' })
      showAddressModal.value = false
      // 重置表单
      formRef.value.resetFields()
    } else {
      uni.showToast({ title: response[1].data.message || '提交失败', icon: 'none' })
    }
  } catch (errors) {
    // 表单校验失败
    if (Array.isArray(errors)) {
      uni.showToast({ title: errors[0].message, icon: 'none' })
    }
  }
}

// 获取基础URL
const getBaseUrl = () => {
  // 根据你的项目配置返回正确的baseURL
  return process.env.NODE_ENV === 'development' ? 'https://dev-api.example.com' : 'https://api.example.com'
}

</script>

<template>
  <view :style="themeStyle">
    <u-navbar autoBack placeholder :title="detailInfo?.event_name || '抽奖记录'" />

    <view class="page">
      <mescroll-body
        @init="mescrollInit"
        @down="downCallback"
        @up="getList"
        top="0"
        :up="{ auto: true, page: { size: 30 } }"
      >
        <!-- 收件信息提示栏 -->
        <view class="address-notice" @click="openAddressModal">
          <view class="notice-content">
            <text class="notice-icon">📮</text>
            <view class="notice-text">
              <text class="notice-title">设置收货地址</text>
              <text class="notice-desc">点击设置您的收货信息，用于领取奖品</text>
            </view>
            <text class="notice-arrow">›</text>
          </view>
        </view>

        <view class="records-container">
          <view v-for="(item, index) in records" :key="index" class="item-container">
            <view class="left-info">
              <view class="prize-name" :class="{ 'win': item.status === 'WIN' }">{{ item.prize_name }}</view>
              <view class="draw-time">{{ formatTime(item.draw_time) }}</view>
            </view>
            <view class="right-status" :class="item.status">
              {{ item.status === 'WIN' ? '中奖' : '未中奖' }}
            </view>
          </view>
        </view>
      </mescroll-body>
    </view>

    <!-- 地址填写弹窗 -->
    <u-popup
      :show="showAddressModal"
      @close="showAddressModal = false"
      mode="center"
      :closeOnClickOverlay="true"
      :safeAreaInsetBottom="true"
    >
      <view class="address-modal">
        <view class="modal-header">
          <text class="modal-title">填写收件信息</text>
          <text class="modal-close" @click="showAddressModal = false">✕</text>
        </view>

        <view class="modal-body">
          <u-form ref="formRef" :model="addressForm" :rules="formRules">
            <view class="form-group">
              <view class="form-label">收件人姓名 <text class="required">*</text></view>
              <u-form-item prop="recipient_name" :customStyle="{ marginBottom: '30rpx' }">
                <u-input
                  v-model="addressForm.recipient_name"
                  placeholder="请输入收件人姓名"
                  border="surround"
                  maxlength="20"
                />
              </u-form-item>
            </view>

            <view class="form-group">
              <view class="form-label">联系电话 <text class="required">*</text></view>
              <u-form-item prop="contact_number" :customStyle="{ marginBottom: '30rpx' }">
                <u-input
                  v-model="addressForm.contact_number"
                  placeholder="请输入手机号码"
                  border="surround"
                  type="number"
                  maxlength="11"
                />
              </u-form-item>
            </view>

            <view class="form-group">
              <view class="form-label">详细地址 <text class="required">*</text></view>
              <u-form-item prop="address" :customStyle="{ marginBottom: '30rpx' }">
                <u-textarea
                  v-model="addressForm.address"
                  placeholder="请输入详细地址（省市区街道门牌号）"
                  border="surround"
                  maxlength="200"
                  autoHeight
                />
              </u-form-item>
            </view>
          </u-form>
        </view>

        <view class="modal-footer">
          <view class="btn-cancel" @click="showAddressModal = false">取消</view>
          <view class="btn-submit" @click="submitAddress">提交</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<style scoped>
.page {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(
    to bottom,
    #ff7979 0%,    /* 浅红色 */
    #ffd4a3 50%,   /* 中间过渡色 */
    #ffcc99 100%   /* 浅橙色 */
  );
}

.records-container {
  padding: 20rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.item-container {
  background-color: #FFF8F0;
  border: 1px solid #F8F2EA;
  padding: 30rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.left-info {
  flex: 1;
}

.prize-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.prize-name.win {
  color: #ff5c5c;
}

.draw-time {
  font-size: 24rpx;
  color: #999;
}

.right-status {
  font-size: 28rpx;
  font-weight: bold;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
}

.right-status.WIN {
  color: #fff;
  background-color: #ff5c5c;
}

.right-status.NOT_WIN {
  color: #999;
  background-color: #f5f5f5;
}

/* 地址提示栏样式 */
.address-notice {
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

.address-notice:active {
  transform: scale(0.98);
}

.notice-content {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  gap: 20rpx;
}

.notice-icon {
  font-size: 40rpx;
  color: #ff6b6b;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.notice-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.notice-desc {
  font-size: 24rpx;
  color: #fff;
}

.notice-arrow {
  font-size: 40rpx;
  color: #ccc;
  font-weight: bold;
}

/* 地址弹窗样式 */

/* 自定义表单样式 */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
}

.required {
  color: #ff5c5c;
  margin-left: 6rpx;
}

.address-modal {
  width: 90vw;
  max-width: 700rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx 40rpx;
}

.modal-footer {
  display: flex;
  padding: 20rpx 40rpx 40rpx;
  gap: 20rpx;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-submit {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
}
</style>