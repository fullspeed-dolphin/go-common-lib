<template>
  <view>
	<u-navbar autoBack placeholder  title="全速之家" />
    <section class="u-flex-row u-flex-wrap u-pl-34" style="gap: 22rpx;padding-top: 48rpx;">
			<view class="card-item u-flex-y-center" @click="$u.route(`pagesMine/toolkit/ScanCode`)">活动扫码</view>
		</section>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
const routeRole = ref('');

// 页面加载
onLoad((options) => {
	routeRole.value = options.role || '';
  if (options.role){
		uni.setNavigationBarTitle({
			title: options.role
		})
	}
});

</script>

<style lang="scss" scoped>
.card-item {
	font-weight: bold;
	font-size: 34rpx;
	color: #FFFFFF;
  width: 330rpx;
  height: 150rpx;
	padding-left: 20rpx;
	background: radial-gradient( 0% 0% at 50% 50%, #FEB800 0%, #FDA800 100%);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
}
</style>
