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
      style="width: 640rpx; overflow: hidden;padding-bottom: 30rpx;"
    >
			<view class="flex-center b" style="height: 100rpx;">
				用户详情
			</view>
      <view class="member-item flex-start">
        <view class="img-box">
          <view class="img">
            <up-lazy-load borderRadius="100" 
						error-img="/static/images/user.png"
						:image="detail.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill'" mode="aspectFill" />
          </view>
        </view>
        <view class="">
          <view class="u-mb-10 ellipsis" style="color: #222">
						{{detail.nickname || "成员"}}
					</view>
          <view class="u-mt-20" style="color: #222">
						性别：{{['女', '男'][detail.gender]}}
					</view>
        </view>
      </view>
    </view>
    <view class="buttons">
      <view class="button confirm" @click="confirm">
        确定
      </view>
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
.member-item {
  padding: 11rpx 34rpx;
  color: #666;
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    margin-right: 30rpx;
    overflow: hidden;
  }
  .img {
    display: block;
    width: 106rpx;
    height: 106rpx;
  }
}
</style>
