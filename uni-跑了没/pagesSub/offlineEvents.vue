<template>
  <view class="" :class="{isFixedNavbar: isFixedNavbar}">
		<u-navbar :title="isFixedNavbar ? '' : '线下活动'" :placeholder="false"></u-navbar>
		
		<section style="padding:0;overflow: hidden;">
			<image :src="eventData.background_image_url" mode="aspectFill" style="width:100%;display: block;height:300rpx;"></image>
		</section>
		
		<!-- <section class="panel bgf" style="margin-top: -90rpx;position: relative;z-index: 10;">
			<view class="h2 u-border-bottom">
				<view class="ellipsis2">
					{{eventData.name}}
				</view>
			</view>
			<view class="cell flex-row">
				<view class="label">报名时间：</view>
				<view class="value">{{eventData.signTime}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动时间：</view>
				<view class="value">{{eventData.eventTime}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动地点：</view>
				<view class="value flex">{{eventData.eventAddress}}</view>
			</view>
			<view class="cell flex-row">
				<view class="label">活动项目：</view>
				<view class="value">{{eventData.eventItems}}</view>
			</view>
			<view class="cell flex-row">
				活动规模：{{eventData.signAmount}}
			</view>
		</section> -->
		
		<!-- <section class="panel">
			<view class="cell" style="margin-top:0;">
				<view class="label">活动说明：</view>
			</view>
		</section> -->
		
		<view class="">
			<rich-text :nodes="eventData.text"></rich-text>
		</view>
		
		<view class="section-bottom">
			<!-- <view class="txt">
				{{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			</view> -->
			<view class="u-border-top1" :class="{isSignUp: isSignUp}" style="padding: 26rpx 8rpx 0">
				<u-button type="primary" shape="circle" @click="routeTo()">{{isSignUp ? '取消报名' : '活动报名'}} </u-button>
			</view>
		</view>
		
		<PhoneLogin ref="refPhoneLogin" />
  </view>
</template>
<script>
	import eventData from "@/utils/eventData.js"
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
export default {
	components: { PhoneLogin },
  data () {
		return {
			isSignUp: false,
			eventData: {},
			isFixedNavbar: true
		}
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onLoad(options) {
		this.routerParams = options
		this.getDetail()
	},
	onPageScroll(e) {
		this.isFixedNavbar = parseInt(e.scrollTop) < 30
	},
  methods: {
		getDetail() {
			this.$axios.get(`/event-api/api/v1/events/${this.routerParams.id}`).then(res => {
				res.text = `<img src="${res.long_image_url}" style="max-width:100%;" />`
				this.eventData = res;
			})
		},
		routeTo() {
			if (!this.userInfo.id) {
				return this.$refs.refPhoneLogin.open()
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
