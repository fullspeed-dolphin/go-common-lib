<template>
  <u-popup :show="isShowPop" :round="15" :mode="position || 'center'" closeable @close="close">
    <view class="con" style="min-height: 300rpx;max-width: 600rpx;overflow: hidden;border-radius: 20rpx;">
      <rich-text v-if="text" :nodes="text"></rich-text>
      <slot />
    </view>
    <slot name="confirm" v-if="isShowConfirm"></slot>
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
.popup-btn {
  margin: 30rpx;
}
::v-deep{
	.u-popup__content{
		overflow: hidden;
		border-radius: 20rpx!important;
		&:before{
			position: absolute;
			content: "";
			top:0;
			left:0;
			right:0;
			bottom:0;
			background: rgba(0,0,0,.1);
			z-index: 1;
		}
	}
	.u-popup__content__close{
		z-index: 10;
		.uicon-close{
			color: #fff!important;
		}
	}
}
</style>
