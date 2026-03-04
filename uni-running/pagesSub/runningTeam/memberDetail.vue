<template>
  <u-popup
    :show="isShowPop"
    :round="15"
    :mode="position || 'center'"
    closeable
    @close="close"
  >
    <view class="detail-popup">
      <view class="detail-title">用户详情</view>

      <view class="detail-body">
        <!-- 头像 + 昵称 -->
        <view class="detail-row">
          <view class="detail-avatar">
            <up-lazy-load borderRadius="100"
              error-img="/static/images/user.png"
              :image="detail.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill'" mode="aspectFill" />
          </view>
          <view class="detail-label">{{ detail.nickname || '成员' }}</view>
        </view>

        <!-- 性别 -->
        <view class="detail-row">
          <view class="detail-icon">
            <u-icon name="man" size="36" color="#ff8c00" />
          </view>
          <view class="detail-label">性别：{{ ['女', '男'][detail.gender] }}</view>
        </view>

        <!-- 手机号 -->
        <view class="detail-row" v-if="detail.user_phone">
          <view class="detail-icon">
            <u-icon name="phone" size="36" color="#ff8c00" />
          </view>
          <view class="detail-label" style="flex: 1;">手机：{{ detail.user_phone }}</view>
          <view class="phone-actions">
            <view class="phone-action" @click.stop="callPhone">
              <u-icon name="phone" size="22" color="#fff" />
            </view>
            <view class="phone-action phone-action--copy" @click.stop="copyPhone">
              <u-icon name="file-text" size="22" color="#fff" />
            </view>
          </view>
        </view>
      </view>

      <view class="detail-btn" @click="confirm">知道了</view>
    </view>
  </u-popup>
</template>
<script setup>
import { ref } from "vue";

const props = defineProps([
  "title",
  "confirmButtonTxt",
  "isShowConfirm",
  "position",
  "cancelButtonTxt",
]);

// Emits
const emit = defineEmits(["close", "confirm"]);

// 响应式数据
const isShowPop = ref(false);
const detail = ref({});

// 方法定义
const open = (data) => {
  detail.value = data;
  isShowPop.value = true;
};

const close = (data) => {
  isShowPop.value = false;
	detail.value = {}
};

const callPhone = () => {
  if (!detail.value.user_phone) return;
  uni.makePhoneCall({ phoneNumber: detail.value.user_phone });
};

const copyPhone = () => {
  if (!detail.value.user_phone) return;
  uni.setClipboardData({ data: detail.value.user_phone });
};

const confirm = () => {
  close()
  emit("confirm");
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
  confirm,
});
</script>

<style lang="scss">
.detail-popup {
  width: 640rpx;
  overflow: hidden;
  padding: 0 40rpx 24rpx;
}

.detail-title {
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #222;
  padding: 36rpx 0 20rpx;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 16rpx 0 32rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.detail-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 140, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-label {
  font-size: 30rpx;
  color: #333;
}

.phone-actions {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

.phone-action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #ff8c00;
  display: flex;
  align-items: center;
  justify-content: center;

  &--copy {
    background: #4a90d9;
  }
}

.detail-btn {
  width: 70%;
  margin: 0 auto;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #ff8c00, #ffab40);
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  letter-spacing: 4rpx;
}
</style>
