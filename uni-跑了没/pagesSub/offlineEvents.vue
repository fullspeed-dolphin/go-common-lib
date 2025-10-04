<template>
  <view class="" :class="{isFixedNavbar: isFixedNavbar}">
		<u-navbar :title="isFixedNavbar ? '' : '线下活动'" :placeholder="false"></u-navbar>
		
		<section style="padding:0;overflow: hidden;">
			<image :src="eventData.poster" mode="aspectFill" style="width:100%;display: block;height:300rpx;"></image>
		</section>
		
		<section class="panel bgf" style="margin-top: -90rpx;position: relative;z-index: 10;">
			<view class="h2 u-border-bottom">
				<view class="ellipsis2">
					{{eventData.title}}
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
			<!-- <view class="cell flex-start">
				客服微信：
				<view class="mr20">
					15864205324
				</view>  
				<u-button @click="copyText(15864205324)" type="primary" shape="circle" color="#3A8443" size="mini" text="复制"></u-button>
			</view> -->
		</section>
		
		<section class="panel">
			<view class="cell" style="margin-top:0;">
				<view class="label">活动说明：</view>
				<!-- <view class="value">{{eventData.text}}</view> -->
				<rich-text :nodes="eventData.text"></rich-text>
			</view>
		</section>
		
		<view class="" style="height:200rpx;"></view>
		<view class="section-bottom">
			<!-- <view class="txt">
				{{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			</view> -->
			<view class="u-border-top1" :class="{isSignUp: isSignUp}" style="padding: 26rpx 8rpx 0">
				<u-button type="primary" shape="circle" @click="routeTo()">{{isSignUp ? '取消报名' : '活动报名'}} </u-button>
			</view>
		</view>
  </view>
</template>
<script>
	import eventData from "@/utils/eventData.js"
export default {
  data () {
		return {
			isSignUp: false,
			eventData: eventData,
			isFixedNavbar: true
		}
  },
	onPageScroll(e) {
		this.isFixedNavbar = parseInt(e.scrollTop) < 30
	},
  methods: {
		routeTo() {
			if (this.isSignUp) {
				this.cancelSignUp()
				return false;
			}
			uni.$u.route('pagesSub/orderIn')
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
