<template>
  <view class="" >
		<u-navbar title="活动报名"></u-navbar>
		
		<section class="section-assign">
			<view class="cell flex-between-center" @click="selectSigner()">
				<view class="">
					<u-icon name="star-fill" color="#E53935" size="8"></u-icon> 参赛者 
				</view>
				<view class="flex-start">
					<view class="txt flex-row">
						{{SignerInfo.id_card ? SignerInfo.full_name : '请完善参赛者信息'}}
					</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<view class="cell flex-between-center">
				<view class="">跑团</view>
				<view class="flex-start" @click="openGroupPop()">
					<view class="txt">
						{{myGroup.name || '加入跑团'}}
					</view>
					<u-icon v-if="!myGroup.group_id" name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
		</section>
		
		<section class="scroll-view flex-center">
			<view class="item" @click="changeTab(item)" v-for="(item,index) in priceList" :key="index">
				<view class="type-item flex-center" :class="{active: activeType.label === item.label}">
					{{item.label}}
				</view>
			</view>
		</section>
		
		<section class="section-payment panel">
			<view class="money flex-row" style="align-items: baseline;">
				￥{{activeType.price}}
				<view class="txt">
					({{activeType.label}})
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
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>以及
				<text style="color:#FF8C00" @click="$u.route('pagesSub/settings/agreement?type=baoxian')">《保险须知》</text>
			</view>
			<view class="" style="padding: 56rpx 8rpx 0">
				<u-button type="primary" shape="circle" @click="submitOrder()">￥{{activeType.price}} 支付</u-button>
			</view>
		</section>
		
		<GroupList ref="refGroupList" @success="getUserGroup()"/>
  </view>
</template>
<script>
	import GroupList from "./components/groupList.vue"
export default {
	components: { GroupList },
  data () {
		return {
			myGroup: {},
			activeType: {},
			isAgree: [],
			SignerInfo: {},
			eventInfo: {},
			priceList: []
		}
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onLoad(options) {
		this.event_id = options.event_id
	},
	onShow() {
		this.getSignerInfo()
		this.getEventPrice()
		this.getUserGroup()
	},
  methods: {
		openGroupPop() {
			if (this.myGroup.group_id) return;
			
			this.$refs.refGroupList.open()
		},
		async getUserGroup() {
		  uni.showLoading({ mask: true });
			
			try {
				let res = await this.$axios.post(`/user-api/user/getCreatedGroup`)
				if (res) {
					this.myGroup = res;
				}
				let temp = await this.$axios.post(`/user-api/user/getUserGroup`)
				if (temp) {
					this.myGroup = temp;
				}
				
			} catch (error) {
				console.error(error)
				//TODO handle the exception
			}
			
			uni.hideLoading()
		},
		getSignerInfo() {
			this.SignerInfo = uni.getStorageSync('SignerInfo') || {}
			
			return false;
			const data = {
				phone_number: this.userInfo.phone
			}
			this.$axios.post('/booking-api/registration/getSignerInfo', data).then(res => {
				this.SignerInfo = {
					...res,
					...(uni.getStorageSync('SignerInfo') || {})
				};
			})
		},
		getEventPrice() {
			uni.showLoading({
				mask: true
			})
			const data = {
				"event_id": this.event_id,
			}
			this.$axios.post('/booking-api/user/price', data).then(res => {
			// this.$axios.post('/booking-api/user/price?test_for_fullspeed', data).then(res => {
				this.eventInfo = res;
				let priceList = []
				Object.keys(res).forEach(i => {
					if (String(i).includes('km')) {
						priceList.push({
							price: res[i],
							label: i
						})
					}
				})
				
				this.activeType = priceList[0]
				this.priceList = priceList;
			})
		},
		selectSigner() {
			uni.$u.route('pagesSub/signerForm')
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
			
			if (!this.SignerInfo.id_card) return this.$toast("请完善参赛者信息");
			if (!this.isAgree.length) return this.$toast("请勾选同意协议");
			
			const data = {
				...this.SignerInfo,
				"running_km": parseFloat(this.activeType.label),
				"payment_method": "wechat",
				"event_id": this.event_id,
				"payment_amount": this.activeType.price,
				running_group: String(this.userInfo.running_group || '')
			}
			
			delete data.updated_at;
			delete data.status;
			delete data.created_at;
			
			if (this.isSubmitting) return;
			this.isSubmitting = true;
			uni.showLoading({
				mask: true
			})
			this.$axios.post(`/booking-api/registration/SignInEvent`, data).then(res => {
				this.creatOrder(res.reg_no)
			}).catch(err => {
				console.error(err)
				uni.hideLoading()
				uni.showModal({
					title: '提示',
					content: err.msg,
					showCancel: false,
				})
				this.isSubmitting = false;
			})
		},
		async getCode() {
			return (await new Promise(resolve => uni.login({success: e => resolve(e) }))).code
		},
		async creatOrder(reg_no) {
			const data = {
				reg_no,
				event_id: this.event_id,
				openid: this.userInfo.openid
			}
			
			uni.showLoading({
				mask: true
			})
			
			this.$axios.post(`/pay/wechat/payment`, data).then(res => {
				console.log("res", res)
				uni.hideLoading();
				this.isSubmitting = false;
				this.wxPay(res);
			})
		},
		wxPay(respay) {
			// 触发微信支付
			wx.requestPayment({
				'timeStamp': respay.timeStamp,
				'nonceStr': respay.nonceStr,
				'package': respay.package,
				'signType': respay.signType,
				'paySign': respay.paySign,
				'success': (res) => {
					uni.hideLoading();
					this.$toast('支付成功')
					setTimeout(() => {
						// uni.navigateBack()
						uni.$u.route('pagesSub/signUpStatus?order_no=' + respay.order_no);
					}, 300)
				},
				'fail': (res) => {
					uni.hideLoading();
					console.log("res======>", res)
					this.$toast('支付未完成')
					setTimeout(() => {
						// uni.navigateBack()
						uni.$u.route('pagesSub/signUpStatus?order_no=' + respay.order_no);
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
