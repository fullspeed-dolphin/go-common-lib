<script setup>
import { computed, ref } from 'vue';
import { useStore } from "vuex";
import dayjs from "dayjs";
import { onPageScroll, onReachBottom, onLoad } from '@dcloudio/uni-app';
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import { baseLink } from "@/utils/config.js";

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
  ],
  contact_number: [
    { required: true, message: '请输入联系电话', trigger: ['blur', 'change'] },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: ['blur', 'change'] },
    { min: 5, max: 200, message: '地址长度应在5-200个字符之间', trigger: ['blur', 'change'] }
  ]
}

const eventId = ref('') 
const openid = ref(store?.state?.userInfo?.openid)
// const eventId = ref("01KH0WQX4H2C7Q4GJ217P8T922") 
// const openid = ref("oEuZJvoN4oia8LJ-2k5A15S9CVSM")

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
        url: `${baseLink}/event-api/lottery${url}`,
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

// 获取抽奖记录列表
const getList = async (mescroll) => {
  // 第一页清空列表
  if (mescroll.num == 1) records.value = []

  try {
    // 调用个人中奖记录接口
    const res = await uatRequest.get('/my_records', {
      event_id: eventId.value,
      openid: openid.value
    })

    if (res.code === 200 && res.data) {
      // 直接使用接口返回的数据
      records.value = mescroll.num == 1 ? res.data : records.value.concat(res.data)

      // 结束加载状态
      mescroll.endSuccess(res.data.length, res.data.length >= mescroll.size)
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

// 处理状态点击
const handleStatusClick = (item) => {
  // 根据后端状态值判断
  if (item.status === 'PENDING_ADDRESS') {
    openAddressModal(item)
  } else if (item.status === 'ADDRESS_FILLED') {
    uni.showToast({
      title: '地址已锁定，请联系客服处理',
      icon: 'none',
      duration: 2000
    })
  }
}

// 获取状态光标样式
const getStatusCursor = (item) => {
  // 只有待填写和可编辑状态才能点击
  if (item.status === 'PENDING_ADDRESS' || item.status === 'ADDRESS_EDITABLE') {
    return 'pointer'
  }
  return 'default'
}

// 弹窗标题
const modalTitle = ref('填写收货地址')

// 当前操作模式
const operationMode = ref('create') // create or update

// 打开地址弹窗
const openAddressModal = async (record) => {
  // 设置record_id
  addressForm.value.record_id = record.id

  // 根据状态设置标题和模式
  if (record.status === 'ADDRESS_EDITABLE') {
    modalTitle.value = '修改收货地址'
    operationMode.value = 'update'
  } else {
    modalTitle.value = '填写收货地址'
    operationMode.value = 'create'
  }

  // 如果已经填写过地址，加载已有数据
  if (record.status === 'ADDRESS_EDITABLE') {
    // 加载地址详情
    await loadAddressDetail(record.id)
  }
  showAddressModal.value = true
}

// 加载地址详情
const loadAddressDetail = async (recordId) => {
  try {
    // 调用获取我的地址接口
    const res = await uatRequest.get('/gift/my_addresses')

    if (res.code === 200 && res.data) {
      // 查找对应记录的地址信息
      const addressInfo = res.data.find(item => item.record_id === recordId)

      if (addressInfo) {
        // 填充表单数据
        addressForm.value = {
          record_id: recordId,
          id: addressInfo.id, // 保存地址ID，用于修改操作
          recipient_name: addressInfo.recipient_name,
          contact_number: addressInfo.contact_number,
          address: addressInfo.address
        }
      }
    }
  } catch (error) {
    console.error('加载地址详情失败:', error)
    // 静默处理错误，用户可以继续填写新地址
  }
}

// 关闭地址弹窗
const closeAddressModal = () => {
  showAddressModal.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  addressForm.value = {
    record_id: '',
    recipient_name: '',
    contact_number: '',
    address: ''
  }
  // 重置操作模式
  operationMode.value = 'create'
}

// 提交地址信息
const submitAddress = async () => {
  // 使用u-form进行校验
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证通过后提交
    uni.showLoading({ title: '提交中...', mask: true })

    try {
      // 构建请求数据
      const requestData = {
        record_id: addressForm.value.record_id,
        recipient_name: addressForm.value.recipient_name,
        contact_number: addressForm.value.contact_number,
        address: addressForm.value.address
      }

      // 如果是修改操作，添加id字段
      if (operationMode.value === 'update' && addressForm.value.id) {
        requestData.id = addressForm.value.id
      }

      // 调用保存地址接口
      const res = await uatRequest.post('/address', requestData)

      uni.hideLoading()

      if (res.code === 200) {
        // 显示成功提示
        uni.showToast({
          title: operationMode.value === 'update' ? '地址修改成功' : '地址保存成功',
          icon: 'success'
        })

        // 关闭弹窗
        closeAddressModal()

        // 更新本地记录状态
        const recordIndex = records.value.findIndex(r => r.id === addressForm.value.record_id)
        if (recordIndex !== -1) {
          // 根据操作模式更新状态
          if (operationMode.value === 'create') {
            // 新增地址后状态变为可编辑
            records.value[recordIndex].status = 'ADDRESS_EDITABLE'
          } else if (operationMode.value === 'update') {
            // 修改地址后状态变为不可编辑（锁定）
            records.value[recordIndex].status = 'ADDRESS_UNEDITABLE'
          }
        }

        // 刷新列表
        downCallback()
      } else {
        // 处理业务错误
        let errorMsg = '操作失败'
        switch (res.code) {
          case 1005:
            errorMsg = '地址已填写过，请勿重复提交'
            break
          case 1006:
            errorMsg = '记录不存在或无权限'
            break
          case 1007:
            errorMsg = '非实物奖品无需填写地址'
            break
          case 1008:
            errorMsg = '当前状态不允许填写地址'
            break
          default:
            errorMsg = res.message || '操作失败，请稍后重试'
        }
        uni.showToast({ title: errorMsg, icon: 'none' })
      }
    } catch (error) {
      uni.hideLoading()
      console.error('保存地址失败:', error)
      uni.showToast({ title: '网络错误，请检查网络连接', icon: 'none' })
    }

  } catch (error) {
    uni.hideLoading()

    if (Array.isArray(error)) {
      // 表单校验失败
      uni.showToast({ title: error[0].message, icon: 'none' })
    }
  }
}

// 联系客服
const openWeComChat = () => {
  uni.showLoading({
    mask: true,
  });

  setTimeout(() => {
    uni.hideLoading();
  }, 300);
  // #ifdef MP-WEIXIN
  wx.openCustomerServiceChat({
    extInfo: {
      url: "https://work.weixin.qq.com/kfid/kfcb41efa532f58830b"
    },
    corpId: 'wwaac238486eb8781e',
    onOpen: (res) => {
      console.log('success', res);
    },
    onError: (err) => {
      console.error('fail', err);
      uni.showModal({
        content: '客服系统繁忙，请稍后重试或拨打热线电话',
        showCancel: false
      });
    }
  });
  // #endif
};

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
        <!-- 状态说明 -->
        <view class="status-legend">
          <text class="legend-item"><text class="legend-color pending">■</text>待填地址</text>
          <text class="legend-item"><text class="legend-color filled">■</text>已填地址</text>
          <text class="legend-item"><text class="legend-color locked">■</text>已锁定</text>
        </view>

        <view class="records-container">
          <!-- 暂无记录占位 -->
          <view v-if="records.length === 0" class="empty-placeholder">
            <view class="empty-icon">🎁</view>
            <view class="empty-text">暂无抽奖记录</view>
            <view class="empty-desc">您还没有参与过抽奖活动</view>
          </view>

          <!-- 记录列表 -->
          <view
            v-for="(item, index) in records"
            :key="item.id || index"
            class="item-container"
            :class="{ 'item-winning': item.is_winning, 'item-not-winning': !item.is_winning }"
          >
            <view class="item-badge" v-if="item.is_winning">🎉 中奖</view>
            <view class="item-badge not-win" v-else>未中奖</view>
            <view class="item-body">
              <view class="left-info">
                <view class="prize-name" :class="{ 'win': item.is_winning }">{{ item.prize_name }}</view>
                <view class="event-label">为爱奔跑520·第一期抽奖</view>
                <view class="draw-time">{{ formatTime(item.draw_time) }}</view>
              </view>
              <view
                v-if="item.is_winning"
                class="right-status"
                :class="[item.status]"
                @click="handleStatusClick(item)"
                :style="{ cursor: getStatusCursor(item) }"
              >
                <text v-if="item.status === 'PENDING_ADDRESS'">待填地址</text>
                <text v-else-if="item.status === 'ADDRESS_FILLED'">已填地址</text>
                <text v-else-if="item.status === 'ADDRESS_UNEDITABLE'">已锁定</text>
                <text v-else>已中奖</text>
              </view>
            </view>
          </view>
        </view>
      </mescroll-body>
    </view>

    <!-- 悬浮联系客服按钮 -->
    <button class="kefu-float-btn" open-type="contact">
      <text class="kefu-float-icon">💬</text>
      <text class="kefu-float-label">客服</text>
    </button>

    <!-- 地址填写弹窗 -->
    <u-popup
      :show="showAddressModal"
      @close="closeAddressModal"
      mode="center"
      :closeOnClickOverlay="true"
      :safeAreaInsetBottom="true"
    >
      <view class="address-modal">
        <view class="modal-header">
          <text class="modal-title">{{ modalTitle }}</text>
          <text class="modal-close" @click="closeAddressModal">✕</text>
        </view>

        <view class="modal-body">
          <!-- 提示信息 -->
          <view v-if="modalTitle === '修改收货地址'" class="modify-tip">
            <text class="tip-text">⚠️ 地址只能修改一次，请仔细核对信息</text>
          </view>
          <u-form ref="formRef" :model="addressForm" :rules="formRules">
            <view class="form-group">
              <view class="form-label">收件人姓名 <text class="required">*</text></view>
              <u-form-item prop="recipient_name" :customStyle="{ marginBottom: '30rpx' }">
                <u-input
                  v-model="addressForm.recipient_name"
                  placeholder="请输入收件人姓名"
                  border="surround"
                  maxlength="12"
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
          <view class="btn-cancel" @click="closeAddressModal">取消</view>
          <view class="btn-submit" @click="submitAddress">{{ operationMode === 'update' ? '修改' : '提交' }}</view>
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
    #ffffff 100% 
  );
}

.records-container {
  padding: 20rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  min-height: 500rpx;
}

/* 空数据占位样式 */
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  color: #999;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  color: #666;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.item-container {
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.item-container.item-winning {
  background: linear-gradient(135deg, #FFF8F0, #FFFFFF);
  border: none;
}

.item-container.item-not-winning {
  background: #f9f9f9;
  border: none;
}

.item-badge {
  padding: 16rpx 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #ff6b6b, #E8453C);
  letter-spacing: 2rpx;
}

.item-badge.not-win {
  background: #bbb;
  font-size: 26rpx;
}

.item-body {
  padding: 30rpx 30rpx 36rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-info {
  flex: 1;
}

.prize-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.prize-name.win {
  color: #E8453C;
}

.event-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.draw-time {
  font-size: 24rpx;
  color: #bbb;
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

.right-status.ADDRESS_EDITABLE {
  color: #fff;
  background-color: #4caf50;
  cursor: pointer;
}

.right-status.ADDRESS_UNEDITABLE {
  color: #fff;
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.right-status.NONE {
  color: #999;
  background-color: #f5f5f5;
}

.right-status.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 状态图例样式 */
.status-legend {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  padding: 16rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.95);
  margin: 20rpx 20rpx 0;
  border-radius: 12rpx;
  font-size: 22rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #666;
}

.legend-color {
  font-size: 20rpx;
}

.legend-color.pending {
  color: #ff9800;
}

.legend-color.filled {
  color: #4caf50;
}

.legend-color.locked {
  color: #9e9e9e;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #666;
}

.legend-color {
  font-size: 20rpx;
}

.legend-color.pending {
  color: #ff9800;
}

.legend-color.filled {
  color: #4caf50;
}

.legend-color.locked {
  color: #9e9e9e;
}
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

/* 修改提示样式 */
.modify-tip {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.tip-text {
  color: #856404;
  font-size: 26rpx;
  line-height: 1.5;
}

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

/* 悬浮客服按钮 */
.kefu-float-btn {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: #18b566;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 6rpx 18rpx rgba(24, 181, 102, 0.25);
  padding: 0;
  border: none;
  line-height: 1;
}

.kefu-float-btn::after {
  border: none;
}

.kefu-float-icon {
  font-size: 36rpx;
}

.kefu-float-label {
  font-size: 18rpx;
  color: #fff;
  margin-top: 4rpx;
}
</style>