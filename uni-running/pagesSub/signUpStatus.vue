<template>
  <view class="" style="padding-top:166rpx;">
		<u-navbar autoBack placeholder title="支付状态" @leftClick="rightClick" :autoBack="false"></u-navbar>
		<section v-if="orderDetail.order_no" class="panel">
			<view class="status-icon flex-center" :class="{error: !isSuccess}">
				<u-icon 
					:name="isSuccess ? 'checkmark-circle-fill' : 'close-circle-fill'" 
					:color="isSuccess ? '#43A047' : '#E53935'" 
					size="78"></u-icon>
			</view>
			<view class="flex-center h1">
				{{isSuccess ? '恭喜你！支付成功' : '支付失败!'}}
			</view>
			<block v-if="!isSuccess">
				<view  class="" style="font-size: 32rpx;font-weight: 500;">
					支付失败！请核实订单或重新支付。
				</view>
				<view class="" style="padding: 150rpx 80rpx 0">
					<u-button type="primary" shape="circle" @click="goBack()">重新支付</u-button>
				</view>
			</block>
			
			<block v-if="isSuccess">
				<view class="cell flex-between-center u-border-bottom">
					<view class="label">订单金额</view>
					<view class="value">￥{{orderDetail.amount_yuan}}</view>
				</view>
				<view class="cell flex-between-center u-border-bottom">
					<view class="label">订单编号</view>
					<view class="value">{{orderDetail.order_no}}</view>
				</view>
				<view class="cell flex-between-center u-border-bottom">
					<view class="label">下单时间</view>
					<view class="value">{{orderDetail.created_at}}</view>
				</view>
				<view class="cell flex-between-center u-border-bottom">
					<view class="label">支付方式</view>
					<view class="value">微信</view>
				</view>
			</block>
		</section>
  </view>
</template>
<script>
export default {
  data () {
		return {
			isSuccess: false,
			orderDetail: {}
		}
  },
	onLoad(options) {
		this.order_no = options.order_no;
		
		uni.showLoading({
			mask: true
		})
		
		setTimeout(() => {
			this.getOrder()
		}, 2000)
	},
  methods: {
		getOrder() {
			const data = {
				order_no: this.order_no
			}
			
			this.$axios.post(`/pay/order/status`, data).then(res => {
				console.log("res", res)
				this.orderDetail = res;
				this.isSuccess = res.status === 'SUCC';
			})
		},
		goBack() {
			uni.navigateBack()
		},
		rightClick() {
			uni.navigateBack({
				delta: 2
			})
		}
	}
};
</script>

<style lang="less">
	.h1{
		font-weight: 500;
		font-size: 34rpx;
		color: #000000;
		line-height: 48rpx;
		margin-bottom: 120rpx;
		margin-top:-30rpx;
	}
	.panel{
		width: 650rpx;
		height: 730rpx;
		margin: 0 auto;
		padding: 0 68rpx;
		border-radius: 16rpx;
		box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
	}
	.cell{
		font-size: 24rpx;
		line-height: 72rpx;
	}
	.status-icon{
		width: 196rpx;
		height: 196rpx;
		margin: 0 auto 0;
		transform: translateY(-90rpx);
		background: rgba(67, 160, 71, .3);
		border-radius: 999rpx;
		&.error{
			background: rgba(229, 57, 53, .3);
		}
	}
</style>
