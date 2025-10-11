<template>
  <view class="pb30" :class="{isFixedNavbar: isFixedNavbar}">
		<u-navbar :title="isFixedNavbar ? '' : '线下活动'" :placeholder="false"></u-navbar>
		
		<section style="padding:0;overflow: hidden;">
			<image :src="detail.background_image_url" mode="aspectFill" style="width:100%;display: block;height:500rpx;"></image>
		</section>
		
		<section class="panel bgf" style="margin-top: -90rpx;position: relative;z-index: 10;">
			<view class="h2 u-border-bottom">
				<view class="ellipsis2">
					{{detail.name}}
				</view>
			</view>
			<view class="cell flex-start">
				<view class="label">客服电话：</view>
				<view class="value flex-start">
					<view style="color: #1989fa;margin-right:10rpx;" @click="callPhone(19927709895)">19927709895</view>
					<u-button type="primary" color="#19be6b" shape="circle" size="mini" @click="copyText('Qsty2025')">
						复制微信号 Qsty2025
					</u-button>
				</view>
			</view>
			<view class="cell flex-row">
				<view class="label">报名时间：</view>
				<view class="value">{{detail.registration_time}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动时间：</view>
				<view class="value">{{detail.event_time}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动地点：</view>
				<view class="value flex">{{detail.event_location}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动项目：</view>
				<view class="value">{{detail.event_projects}}</view>
			</view>
			<!-- <view class="cell flex-row">
				活动规模：{{detail.capacity}}
			</view> -->
		</section>
		
		<section class="panel" style="padding: 20rpx 0 0;">
			<view class="cell" style="margin-top:0;">
				<view class="label pl20 pb20">活动说明：</view>
			</view>
			<rich-text :nodes="detail.text"></rich-text>
		</section>

		<view class="section-bottom">
			<!-- <view class="txt">
				{{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			</view> -->
			<view class="u-border-top1" :class="{isSignUp: isSignUp}" style="padding: 26rpx 8rpx 0">
				<u-button type="primary" :disabled="detail.status === 'PND'" shape="circle" @click="routeTo()">
					<block v-if="detail.status === 'ACT'">{{isSignUp ? '取消报名' : '活动报名'}}</block>
					<block v-if="detail.status === 'PND'">活动暂未开始</block>
				</u-button>
			</view>
		</view>
		
		<PhoneLogin ref="refPhoneLogin" />
  </view>
</template>
<script>
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
export default {
	components: { PhoneLogin },
  data () {
		return {
			isSignUp: false,
			detail: {},
			isFixedNavbar: true
		}
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onLoad(options) {
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			// withShareTicket: true,
			success: function () {},
			fail: function () {}
		})
		// #endif

		this.routerParams = options
		this.getDetail()
	},
	onPageScroll(e) {
		this.isFixedNavbar = parseInt(e.scrollTop) < 30
	},
  methods: {
		getDetail() {
			uni.showLoading({
				mask: true
			})
			this.$axios.get(`/event-api/api/v1/events/${this.routerParams.id}`).then(res => {
				res.text = `<img src="${res.long_image_url}" style="max-width:100%;" />`
				this.detail = res;
			})
		},
		routeTo() {
			if (!this.userInfo.id) {
				return this.$refs.refPhoneLogin.open()
			}
			
			
			if (this.detail.status !== 'ACT') {
				return this.$toast('活动无效')
			}
			
			if (this.isSignUp) {
				this.cancelSignUp()
				return false;
			}
			uni.$u.route('pagesSub/orderIn?event_id=' + this.routerParams.id)
		},
		cancelSignUp() {
			uni.showModal({
			  title: '提示',
			  content: '确定取消报名吗？',
			  success: (res) => {
			    if (res.confirm) {
						this.$axios({url: "api/index/logout"}).then(res => {
							this.$toast('已取消报名')
						})
			    } else if (res.cancel) {
			      console.log('用户点击取消');
			    }
			  }
			});
		},
		copyText(txt) {
			uni.setClipboardData({
				data: String(txt)
			})
		},
		callPhone(phoneNumber) {
			uni.makePhoneCall({
				phoneNumber
			})
		}
	}
};
</script>

<style lang="less">
	.offlineEvents{
		padding: 34rpx;
	}
	.panel{
		width: 682rpx;
		margin: 30rpx 34rpx 30rpx;
		padding: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
	}
	.h2{
		font-weight: 500;
		font-size: 30rpx;
		line-height: 42rpx;
		padding: 0 0 22rpx 0;
	}
	.cell{
		margin-top: 20rpx;
		font-size: 24rpx;
		line-height: 34rpx;
		.label{
			min-width: 120rpx;
		}
	}
	
	.section-bottom{
		position: fixed;
		bottom:0;
		width: 100%;
		left:0;
		padding: 0 34rpx 34rpx;
		.txt{
			font-size: 24rpx;
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}
	
	::v-deep{
		.isSignUp{
			.u-button{
				color: #FF8C00;
				background: #F2F2F2;
				border-color: #f2f2f2;
			}
		}
		
		.isFixedNavbar{
			.u-navbar--fixed{
				background: none!important;
			}
		}
	}
</style>
