<template>
  <u-popup :show="isShowPop" :round="15" :mode="position || 'center'" closeable @close="close">
    <view class="con" style="min-height: 300rpx;max-width: 710rpx;overflow: hidden;border-radius: 20rpx;">
      <slot />
    </view>
    <view v-if="confirmButtonTxt" style="padding:30rpx;">
      <u-button type="primary" shape="circle" block @click="confirm">{{confirmButtonTxt}}</u-button>
    </view>
  </u-popup>
</template>
<script>
export default {
  options: {
    styleIsolation: "shared",
  },
  props: ["title", "confirmButtonTxt", "isShowConfirm", "position"],
  data() {
    return {
      isShowPop: false,
      text: "",
    };
  },
  methods: {
    open(data) {
      this.text = data || "";
      this.isShowPop = true;
    },
    close(data) {
      this.isShowPop = false;
			this.$emit("close")
    },
    confirm() {
      this.isShowPop = false;
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="scss">

</style>
