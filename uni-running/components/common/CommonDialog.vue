<template>
  <u-popup
    :show="isShowPop"
    :round="15"
    :mode="position || 'center'"
    closeable
    @close="close"
  >
    <view
      class="con"
      style="max-width: 710rpx; overflow: hidden; border-radius: 20rpx"
    >
      <slot />
    </view>
    <view class="buttons">
      <view v-if="cancelButtonTxt" @click="close" class="button cancel">
        {{ cancelButtonTxt }}
      </view>
      <view v-if="confirmButtonTxt" class="button confirm" @click="confirm">
        {{ confirmButtonTxt }}
      </view>
    </view>
  </u-popup>
</template>
<script setup>
import { ref } from "vue";

// Props定义
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
const text = ref("");

// 方法定义
const open = (data) => {
  text.value = data || "";
  isShowPop.value = true;
};

const close = (data) => {
  isShowPop.value = false;
  emit("close");
};

const confirm = () => {
  isShowPop.value = false;
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
.buttons {
  border-top: 2rpx solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 34rpx;
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 111rpx;
    flex: 1 1 auto;
    &.active {
      opacity: 0.8;
    }
  }
  .cancel {
    color: #999999;
  }
  .confirm {
    color: #ff8c00;
  }
}
</style>
