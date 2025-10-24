<template>
  <view class="page">
		<u-navbar title="用户登录"></u-navbar>
		<view class="section-box flex-col-center">
		  <image class="logo" src="../static/run.png" mode="aspectFill"></image>
		  <view class="title flex-center">欢迎使用跑了没</view>
		</view>
		<view style="padding:100rpx 104rpx 0;">
			<PhoneLogin @success="successLogin" />
		</view>
  </view>
</template>
<script>
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
export default {
	components: { PhoneLogin },
  data () {
    return {
		};
  },
	onLoad(options) {
		this.options = this.options;
	},
  methods: {
		successLogin() {
		  if (this.options?.direct) {
		    uni.navigateBack()
		
		    return false;
		  }
		
		  uni.switchTab({
		    url: "/pages/index",
		    success() {
		      uni.hideLoading();
		    },
		  });
		},
  }
};
</script>

<style lang="less" scoped>
	.logo {
	  width: 160rpx;
	  height: 160rpx;
	  border-radius: 24rpx;
	  background: #f5f5f5;
		outline: 1px solid #f5f5f5;
	}
	.title {
	  margin-top: 50rpx;
	  font-size: 40rpx;
	  font-weight: 500;
	}
	.section-box {
	  padding-top: 140rpx;
	  margin-bottom: 105rpx;
	}
</style>
