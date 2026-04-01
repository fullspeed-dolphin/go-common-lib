<script setup>
import { computed, ref, onMounted, nextTick } from 'vue';
import { useStore } from "vuex";
import dayjs from "dayjs";

const store = useStore();
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

// 是否有未领取的实物奖品（添加调试信息）
const hasUnclaimedPhysicalPrize = computed(() => {
  const result = mockLotteryHistory.value.some(record =>
    record.status === 'unclaimed' && record.prize.needAddress
  );
  console.log('检查未领取实物奖品:', result);
  console.log('当前中奖记录:', mockLotteryHistory.value);
  return result;
});

// 假数据生成
const mockLotteryHistory = ref([]);
const loading = ref(false);
const showClaimForm = ref(false);
const hasSubmittedClaimInfo = ref(false); // 是否已提交领奖信息

// 生成假数据
const generateMockData = () => {
  const prizes = [
    { id: 1, name: '一等奖', type: '实物奖品', value: 'iPhone 15 Pro', icon: '📱', needAddress: true },
    { id: 2, name: '二等奖', type: '实物奖品', value: 'AirPods Pro', icon: '🎧', needAddress: true },
    { id: 3, name: '三等奖', type: '实物奖品', value: '小米手环', icon: '⌚', needAddress: true },
    { id: 4, name: '四等奖', type: '优惠券', value: '50元优惠券', icon: '🎫', needAddress: false },
    { id: 5, name: '五等奖', type: '积分', value: '100积分', icon: '💎', needAddress: false },
    { id: 6, name: '六等奖', type: '优惠券', value: '20元优惠券', icon: '🎟️', needAddress: false }
  ];

  const mockData = [];
  for (let i = 0; i < 20; i++) {
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    const daysOffset = Math.floor(Math.random() * 30) - 15; // 前后15天
    const status = Math.random() > 0.7 ? 'claimed' : 'unclaimed';

    mockData.push({
      id: i + 1,
      prize: prize,
      lotteryTime: dayjs().add(daysOffset, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: status
    });
  }

  // 按时间倒序排列
  mockData.sort((a, b) => new Date(b.lotteryTime) - new Date(a.lotteryTime));
  return mockData;
};

// 模拟接口请求
const fetchLotteryHistory = async () => {
  loading.value = true;
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    mockLotteryHistory.value = generateMockData();
  } catch (error) {
    console.error('获取抽奖记录失败:', error);
    uni.showToast({
      title: '获取记录失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 领奖表单数据
const claimForm = ref({
  name: '',
  phone: '',
  address: '',
  detailAddress: ''
});

// 输入框聚焦状态
const focusedField = ref('');

// 输入框聚焦/失焦处理
const onFocus = (field) => {
  focusedField.value = field;
};

const onBlur = () => {
  focusedField.value = '';
};

// 打开领奖表单
const openClaimForm = () => {
  console.log('点击了填写领奖信息按钮');
  console.log('当前showClaimForm值:', showClaimForm.value);
  console.log('是否有未领取实物奖品:', hasUnclaimedPhysicalPrize.value);
  console.log('是否已提交领奖信息:', hasSubmittedClaimInfo.value);

  // 强制显示弹窗
  showClaimForm.value = true;

  // 使用 nextTick 确保 DOM 更新
  nextTick(() => {
    console.log('nextTick 后 showClaimForm值:', showClaimForm.value);
  });

  // 如果已经填写过，可以清空重新填写
  if (hasSubmittedClaimInfo.value) {
    // 可以选择是否清空表单，这里保留之前填写的信息
    // 用户可以在表单内手动修改
  }
};

// 提交领奖信息
const submitClaimInfo = async () => {
  // 验证姓名
  if (!claimForm.value.name || claimForm.value.name.trim().length < 2) {
    uni.showToast({
      title: '请输入正确的姓名',
      icon: 'none'
    });
    return;
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!claimForm.value.phone || !phoneRegex.test(claimForm.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }

  // 验证地址
  if (!claimForm.value.address || claimForm.value.address.trim().length < 5) {
    uni.showToast({
      title: '请输入详细的收货地址',
      icon: 'none'
    });
    return;
  }

  // 模拟提交
  uni.showLoading({ title: '提交中...' });
  await new Promise(resolve => setTimeout(resolve, 1500));


  uni.hideLoading();
  showClaimForm.value = false;

  // 标记已提交领奖信息
  hasSubmittedClaimInfo.value = true;

  uni.showToast({
    title: '提交成功',
    icon: 'success',
    duration: 2000
  });

  // 保存到本地存储（可选）
  uni.setStorageSync('claimInfo', claimForm.value);

  // 重置表单
  claimForm.value = {
    name: '',
    phone: '',
    address: '',
    detailAddress: ''
  };
};

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('MM-DD HH:mm');
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'unclaimed': '待领取',
    'claimed': '已领取'
  };
  return statusMap[status] || '未知';
};

// 获取状态样式
const getStatusStyle = (status) => {
  const styleMap = {
    'unclaimed': 'color: #ff5c5c; background: rgba(255, 92, 92, 0.1);',
    'claimed': 'color: #52c41a; background: rgba(82, 196, 26, 0.1);'
  };
  return styleMap[status] || '';
};

onMounted(() => {
  fetchLotteryHistory();

  // 加载已保存的领奖信息
  const savedClaimInfo = uni.getStorageSync('claimInfo');
  if (savedClaimInfo) {
    claimForm.value = { ...savedClaimInfo };
    hasSubmittedClaimInfo.value = true;
  }
});
</script>

<template>
  <view class="page-outter" :style="themeStyle">
    <u-navbar autoBack placeholder title="抽奖记录" />

    <view class="page">
      <!-- 加载状态 -->
      <u-loading-icon v-if="loading" mode="spinner" color="#ff5c5c" size="28" />

      <!-- 抽奖记录列表 -->
      <view v-else-if="mockLotteryHistory.length > 0" class="history-content">
        <!-- 统一的领奖信息表单入口 -->
        <view class="claim-info-card" v-if="true" ><!-- 临时移除条件，强制显示 -->
          <view class="claim-info-header">
            <text class="claim-info-title">📦 实物奖品领奖信息</text>
            <button
              v-if="!hasSubmittedClaimInfo"
              class="claim-info-btn"
              :style="{ backgroundColor: pkEventTheme.value?.solid || '#ff5c5c' }"
              @click="openClaimForm"
            >
              填写领奖信息
            </button>
            <button
              v-else
              class="claim-info-btn modify-btn"
              @click="openClaimForm"
            >
              修改信息
            </button>
            <!-- 临时调试按钮 -->
            <button
              style="margin-left: 20rpx; padding: 10rpx; background: #007aff; color: white; border: none; border-radius: 8rpx; font-size: 20rpx;"
              @click="showClaimForm = true"
            >
              强制打开弹窗
            </button>
          </view>
          <view class="claim-info-desc">请填写您的收货地址，用于接收实物奖品</view>
        </view>

        <!-- 中奖记录列表 -->
        <view class="history-list">
          <view
            v-for="record in mockLotteryHistory"
            :key="record.id"
            class="history-item"
          >
            <view class="prize-info">
              <view class="prize-icon">{{ record.prize.icon }}</view>
              <view class="prize-content">
                <view class="prize-name">{{ record.prize.name }}：{{ record.prize.value }}</view>
                <view class="prize-time">{{ formatTime(record.lotteryTime) }}</view>
              </view>
              <view
                class="prize-status"
                :style="getStatusStyle(record.status)"
              >
                {{ getStatusText(record.status) }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/icons/lottery-icon.png" mode="aspectFit" />
        <view class="empty-text">暂无抽奖记录</view>
        <view class="empty-tip">参与抽奖活动，好运等你来！</view>
      </view>
    </view>

    <!-- 领奖信息填写弹窗 -->
    <u-popup
      v-model="showClaimForm"
      mode="bottom"
      :round="16"
      :closeable="true"
      :safe-area-inset-bottom="true"
      :z-index="1000"
      @close="showClaimForm = false"
    >
      <view class="claim-form-popup">
        <view class="popup-header">填写领奖信息</view>

        <view class="form-description">
          <text class="desc-text">请准确填写您的收货信息，我们将根据此信息为您邮寄实物奖品</text>
        </view>

        <view class="form-content">
          <view class="form-item">
            <view class="form-label">收件人姓名</view>
            <input
              v-model="claimForm.name"
              class="form-input"
              placeholder="请输入真实姓名"
              maxlength="20"
              @focus="onFocus('name')"
              @blur="onBlur"
            />
          </view>

          <view class="form-item">
            <view class="form-label">联系电话</view>
            <input
              v-model="claimForm.phone"
              class="form-input"
              type="number"
              placeholder="请输入手机号码"
              maxlength="11"
              @focus="onFocus('phone')"
              @blur="onBlur"
            />
          </view>

          <view class="form-item">
            <view class="form-label">收货地址</view>
            <input
              v-model="claimForm.address"
              class="form-input"
              placeholder="请输入省市区及街道地址"
              maxlength="100"
              @focus="onFocus('address')"
              @blur="onBlur"
            />
          </view>

          <view class="form-item">
            <view class="form-label">详细地址</view>
            <input
              v-model="claimForm.detailAddress"
              class="form-input"
              placeholder="请输入门牌号、楼层等详细信息（选填）"
              maxlength="50"
              @focus="onFocus('detail')"
              @blur="onBlur"
            />
          </view>

          <view class="form-tip">
            💡 请确保信息准确，奖品将按此地址邮寄
          </view>

          <view class="form-actions">
            <button
              class="cancel-btn"
              @click="showClaimForm = false"
            >
              取消
            </button>
            <button
              class="submit-btn"
              :style="{ backgroundColor: pkEventTheme.value?.solid || '#ff5c5c' }"
              @click="submitClaimInfo"
            >
              确认提交
            </button>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<style scoped>
.page {
  background: linear-gradient(
    to bottom,
    #ff7979 0%,    /* 浅红色 */
    #ffd4a3 50%,   /* 中间过渡色 */
    #ffcc99 100%   /* 浅橙色 */
  );
  padding: 20rpx;
  min-height: 100vh; 
}

/* 历史记录列表 */
.history-content {
  padding: 20rpx 0;
}

/* 统一领奖信息卡片 */
.claim-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.claim-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.claim-info-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.claim-info-btn {
  color: white;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 92, 92, 0.3);
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.claim-info-btn.modify-btn {
  background: #f0f0f0;
  color: #666;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.claim-info-status {
  color: #52c41a;
  font-size: 28rpx;
  font-weight: 500;
}

.claim-info-desc {
  font-size: 26rpx;
  color: #999;
}

.history-list {
  padding: 20rpx 0;
}

.history-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.prize-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.prize-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.prize-content {
  flex: 1;
}

.prize-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.prize-time {
  font-size: 26rpx;
  color: #999;
}

.prize-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}


/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-tip {
  font-size: 28rpx;
  color: #999;
}

/* 领奖表单弹窗 */
.claim-form-popup {
  background: white;
  border-radius: 16rpx 16rpx 0 0;
  padding: 40rpx 30rpx;
}

.popup-header {
  font-size: 36rpx;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
}

.form-description {
  padding: 0 20rpx 30rpx;
  text-align: center;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.form-content {
  padding: 0 10rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--theme-color);
  background: white;
  box-shadow: 0 0 0 4rpx rgba(255, 92, 92, 0.1);
  outline: none;
}

.form-input:focus {
  border-color: var(--theme-color);
  outline: none;
}

.form-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 40rpx;
  padding: 20rpx;
  background: #f0f9ff;
  border-radius: 8rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  padding-top: 20rpx;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
  font-weight: 500;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(255, 92, 92, 0.3);
}
</style>