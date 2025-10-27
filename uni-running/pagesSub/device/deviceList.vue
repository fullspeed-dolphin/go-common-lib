<template>
  <view class="" style="padding-top: 50rpx;">
		<u-navbar autoBack placeholder title="智能设备"></u-navbar>
		<view v-if="!deviceList.length" class="flex-col-center section-empty" 
		style="">
			尚未添加任何设备
			<view class="">点击下面的“添加设备”按钮进行添加</view>
		</view>
		
		<view class="flex-row flex-wrap" style="padding-left:34rpx;">
			<view class="brand-item"
				@click="$u.route('pagesSub/device/deviceDetail?value=' + item.label)"
				v-for="(item,index) in deviceList" :key="index">
				<view class="flex-start mb30">
					<image class="img" :src="item.img" mode="aspectFill"></image>
					<view class="label">{{item.label}}</view>
				</view>
				<view class="" style="font-size: 22rpx;line-height: 1.6;color: #333;">
					<!-- <view class="">{{item.model}}</view> -->
					<view class="">{{item.account}}</view>
					<view class="">{{item.bindTime}}</view>
				</view>
			</view>
		</view>
		
		
		<section class="section-bottom">
			<view style="padding: 56rpx 54rpx 40rpx">
				<u-button type="primary" shape="circle" @click="$u.route('pagesSub/device/deviceBrands')">添加设备</u-button>
			</view>
		</section>
  </view>
</template>
<script>
export default {
  data () {
    return {
			deviceList: [
				// {
				// 	img: '/static/images/华为运动健康@2x.png',
				// 	label: '华为运动健康',
				// 	value: '',
				// 	model: '设备型号：HUAWEI GT5',
				// 	account: '绑定账号：15934560765',
				// 	bindTime: '绑定时间：2025-10-14 ',
				// },
				// {
				// 	img: '/static/images/佳明@2x.png',
				// 	label: '佳明',
				// 	value: '',
				// 	model: '设备型号：HUAWEI GT5',
				// 	account: '绑定账号：15934560765',
				// 	bindTime: '绑定时间：2025-10-14 ',
				// },
				// {
				// 	img: '/static/images/高驰@2x.png',
				// 	label: '高驰',
				// 	value: '',
				// 	model: '设备型号：HUAWEI GT5',
				// 	account: '绑定账号：15934560765',
				// 	bindTime: '绑定时间：2025-10-14 ',
				// },
			]
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
.section-empty{
	min-height: 80vh;
	font-size: 34rpx;
	color: #707070;
	line-height: 48rpx;
	text-align: center;
}
	.section-bottom {
	  position: fixed;
	  bottom: 0px;
	  width: 100%;
	  z-index: 10;
	}
.brand-item{
	width: 325rpx;
	// height: 274rpx;
	padding: 30rpx 32rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
	border-radius: 16rpx 16rpx 16rpx 16rpx;
	margin-right: 34rpx;
	margin-bottom: 34rpx;
	.img{
		width:80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
		border: 1px solid #f5f5f5;
	}
}
</style>
