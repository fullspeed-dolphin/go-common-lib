<template>
  <view class="" >
		<u-navbar title="活动报名"></u-navbar>
		
		<section class="section-assign">
			<view class="cell flex-between-center" @click="selectSigner()">
				<view class="">
					参赛者
				</view>
				<view class="flex-start">
					<view class="txt flex-row">
						请完善参赛者信息
						<u-icon name="star-fill" color="#E53935" size="8"></u-icon>
					</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<view class="cell flex-between-center">
				<view class="">跑团</view>
				<view class="flex-start">
					<view class="txt">
						加入跑团可享九折优惠
					</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
		</section>
		
		<section class="scroll-view">
			<view class="item" @click="changeTab(item)" v-for="(item,index) in typeList" :key="index">
				<view class="type-item flex-center" :class="{active: activeType === item}">
					{{item}}
				</view>
			</view>
		</section>
		
		<section class="section-payment panel">
			<view class="money flex-row" style="align-items: baseline;">
				￥69 
				<view class="txt">
					({{activeType}})
				</view>
			</view>
			<view class="" style="line-height: 34rpx;margin-bottom:34rpx;">
				选择支付方式
			</view>
			<view class="flex-between-center method-cell">
				<image class="icon" src="/static/images/微信支付@2x.png" mode="aspectFill"></image>
				<view class="radio"></view>
			</view>
		</section>
		
		<section class="section-bottom">
			<view class="txt flex-start">
				<u-checkbox-group v-model="isAgree">
					<u-checkbox inactiveColor="#000" name="agree" labelColor="#000" activeColor="#FF8C00" label="我已阅读并同意该"></u-checkbox>
				</u-checkbox-group>
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议以及用户承诺书》</text>
			</view>
			<view class="" style="padding: 26rpx 120rpx 0">
				<u-button type="primary" shape="circle" @click="submitOrder()">￥69 支付</u-button>
			</view>
		</section>
  </view>
</template>
<script>
export default {
  data () {
		return {
			typeList: ['5KM','10KM','半程马拉松'],
			activeType: '5KM',
			isAgree: [],
		}
  },
  methods: {
		selectSigner() {
			uni.$u.route('pagesSub/signUp')
		},
		changeTab(item) {
			this.activeType = item
		},
		submitOrder() {
			const token = uni.getStorageSync("token");
			if (!token) {
				this.$toast("请先登录~");
				setTimeout(() => {
					this.$goUrl("/pagesSub/login");
				}, 1000)
				return 
			}
			
			if (!this.isAgree.length) return this.$toast("请勾选同意协议");
			
			uni.$u.route('pagesSub/signUpStatus');
			
			return 
			
			const data = {
				"OrderDetails": [
					{
						"RelationID": this.activeType
					}
				]
			}
			if (this.isSubmitting) return;
			this.isSubmitting = true;
			uni.showLoading({
				mask: true
			})
			this.$axios.post(`/Trade/Save`, data).then(res => {
				this.creatOrder(res.Number)
			}).catch(err => {
				uni.hideLoading();
				this.isSubmitting = false;
			})
		},
		async getCode() {
			return (await new Promise(resolve => uni.login({success: e => resolve(e) }))).code
		},
		async creatOrder(Number) {
			const data = {
				Number,
				Code: await this.getCode()
			}
			
			return this.testPay(data);
			
			this.$axios.post(`/Payment/Wechat/Pay`, data).then(res => {
				console.log("res", res)
				uni.hideLoading();
				this.isSubmitting = false;
				this.wxPay(res);
			})
		},
		testPay(data) {
			this.$axios.post(`/Trade/TestPay`, data).then(res => {
				console.log("res", res)
				uni.hideLoading();
				this.isSubmitting = false;
				this.$toast('支付成功')
				setTimeout(() => {
					uni.navigateBack()
				}, 300)
			})
		},
		wxPay(respay) {
			// 触发微信支付
			wx.requestPayment({
				'timeStamp': respay.TimeStamp,
				'nonceStr': respay.NonceStr,
				'package': respay.Package,
				'signType': respay.SignType,
				'paySign': respay.PaySign,
				'success': (res) => {
					uni.hideLoading();
					this.$toast('支付成功')
					setTimeout(() => {
						uni.navigateBack()
					}, 300)
				},
				'fail': (res) => {
					uni.hideLoading();
					console.log("res======>", res)
					this.$toast('支付未完成')
					setTimeout(() => {
						uni.navigateBack()
					}, 300)
				}
			})
		},
	}
};
</script>

<style lang="less">
	.section-bottom{
		margin: 50rpx 34rpx;
	}
	.section-payment{
		padding: 50rpx 24rpx;
		.money{
			color:#E53935;
			font-size: 44rpx;
			line-height: 60rpx;
			margin-bottom: 30rpx;
			.txt{
				font-size: 28rpx;
				color: #000;
				margin-left:20rpx;
			}
		}
		.method-cell{
			.icon{
				width: 58rpx;
				height: 56rpx;
			}
			.radio{
				width: 10rpx;
				height: 10rpx;
				padding: 10rpx;
				background: #FF8C00;
				border-radius: 999em;
				border: 5rpx solid #fff;
				outline: 2px solid #FF8C00;
			}
		}
	}
	.section-assign{
		.cell{
			width: 682rpx;
			height: 72rpx;
			padding: 0 20rpx;
			margin: 50rpx auto;
			background: #FFFFFF;
			box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.txt{
			font-weight: 500;
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.scroll-view{
		padding: 20rpx 34rpx;
		.type-item{
			margin-right: 46rpx;
			width: 196rpx;
			height: 182rpx;
			background: #FFFFFF;
			font-weight: 500;
			font-size: 30rpx;
			color: #4A4A4A;
			box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			&.active{
				border: 2rpx solid #FF8C00;
				transform: scale(1.1);
				font-size: 30rpx;
				color: #FF8C00;
			}
		}
	}
</style>
