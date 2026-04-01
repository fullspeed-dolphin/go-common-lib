<script setup>
import { computed, ref } from 'vue';
import { useStore } from "vuex";
import dayjs from "dayjs";
import { onPageScroll, onReachBottom, onLoad } from '@dcloudio/uni-app';
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

// 活动数据 TODO:
// const eventId = ref('01KH0WQX4H2C7Q4GJ217P8T922') // 测试活动ID
// const openid = ref('oEuZJvnRRBWDqYw4hXqLkg-C9Ka8')
const eventId = ref('') 
const openid = ref(store?.state?.userInfo?.openid)

// 临时 UAT 请求工具（仅用于此页面）- 生产环境标准
const uatRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `https://uat.speexpay.com${url}`,
        method: 'GET',
        data: params,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data && res.data.code !== undefined) {
              // 业务状态码处理
              if (res.data.code === 0) {
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
        url: `https://uat.speexpay.com${url}`,
        method: 'POST',
        data: data,
        header: {
          'Content-Type': 'application/json',
          ...headers
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data && res.data.code !== undefined) {
              // 业务状态码处理
              if (res.data.code === 0) {
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

// 获取抽奖记录列表
const getList = async (mescroll) => {
  // 第一页清空列表
  if (mescroll.num == 1) records.value = []

  try {
    // 调用个人中奖记录接口
    const res = await uatRequest.get('/event-api/api/v1/gift/my_records', {
      event_id: eventId.value,
      openid: openid.value
    })

    if (res.code === 0 && res.data) {
      // 转换状态字段以适配前端展示
      const transformedData = res.data.map(item => ({
        ...item,
        status: item.status === 'NOT_WIN' ? 'NOT_WIN' : 'WIN'
      }))

      records.value = mescroll.num == 1 ? transformedData : records.value.concat(transformedData)

      // 结束加载状态
      mescroll.endSuccess(transformedData.length, transformedData.length >= mescroll.size)
    } else {
      mescroll.endErr()
    }
  } catch (error) {
    console.error('获取抽奖记录失败:', error)

    // 错误处理
    if (error.type === 'network') {
      uni.showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 2000
      })
    } else if (error.type === 'business') {
      uni.showToast({
        title: error.message || '获取记录失败',
        icon: 'none',
        duration: 2000
      })
    }

    mescroll.endErr()
  }
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('MM-DD HH:mm')
}

// 点击记录项 - 处理待填地址状态
const handleRecordClick = (record) => {
  // 如果状态是待填地址，打开地址填写弹窗
  if (record.status === 'PENDING_ADDRESS') {
    addressForm.value.record_id = record.id
    showAddressModal.value = true
  }
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

    // 调用保存收货地址接口
    const res = await uatRequest.post('/event-api/api/v1/gift/address', {
      record_id: addressForm.value.record_id,
      recipient_name: addressForm.value.recipient_name,
      contact_number: addressForm.value.contact_number,
      address: addressForm.value.address
    }, {
      'Authorization': `Bearer ${token}`
    })

    uni.hideLoading()

    if (res.code === 0) {
      uni.showToast({ title: '地址保存成功', icon: 'success' })
      showAddressModal.value = false
      // 重置表单
      formRef.value.resetFields()
      // 刷新列表
      downCallback()
    } else {
      // 错误处理
      const errorMessages = {
        1006: '记录不存在或无权限',
        1007: '非实物奖品无需填写地址',
        1005: '地址已填写过，拒绝重复提交'
      }
      uni.showToast({
        title: errorMessages[res.code] || res.message || '提交失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()

    // 错误处理
    if (error.type === 'network') {
      uni.showToast({ title: '网络连接失败', icon: 'none' })
    } else if (error.type === 'business') {
      const errorMessages = {
        1006: '记录不存在或无权限',
        1007: '非实物奖品无需填写地址',
        1005: '地址已填写过，拒绝重复提交'
      }
      uni.showToast({
        title: errorMessages[error.code] || error.message || '提交失败',
        icon: 'none'
      })
    } else if (Array.isArray(error)) {
      // 表单校验失败
      uni.showToast({ title: error[0].message, icon: 'none' })
    }
  }
}

// 使用 onLoad 生命周期获取页面参数
onLoad((options) => {
  if (options.eventId) {
    eventId.value = options.eventId
  }
})
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
              <text class="notice-desc">点击"待填地址"记录可直接填写收货信息</text>
            </view>
            <text class="notice-arrow">›</text>
          </view>
        </view>

        <view class="records-container">
          <view
            v-for="(item, index) in records"
            :key="index"
            class="item-container"
          >
            <view class="left-info">
              <view class="prize-name" :class="{ 'win': item.status !== 'NOT_WIN' }">{{ item.prize_name }}</view>
              <view class="draw-time">{{ formatTime(item.draw_time) }}</view>
            </view>
            <view class="right-status" :class="item.status">
              <text v-if="item.status === 'NOT_WIN'">未中奖</text>
              <text v-else-if="item.status === 'PENDING_ADDRESS'">待填地址</text>
              <text v-else-if="item.status === 'ADDRESS_FILLED'">已填地址</text>
              <text v-else>中奖</text>
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
          <text class="modal-title">填写收货地址</text>
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
  transition: all 0.3s ease;
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

.right-status.PENDING_ADDRESS {
  color: #fff;
  background-color: #ff9800;
  cursor: pointer;
}

.right-status.ADDRESS_FILLED {
  color: #fff;
  background-color: #4caf50;
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