<template>
  <view @tap="clickPage()" class="pb30" style="background: #f5f5f5;" :class="{
		isFixedNavbar: isFixedNavbar,
		isLoadedPage: isLoadedPage
	}">
		<u-navbar :title="isFixedNavbar ? '' : '线下活动'" :placeholder="false"></u-navbar>
		
		<div class="event-status flex-center" v-if="detail.status === 'ACT'">活动进行中</div>
		
		<section style="padding:0;overflow: hidden;height:750rpx;" :class="{isScrolled: isScrolled}">
			<image class="img" :src="detail.background_image_url" mode="aspectFill" style="width:100%;display: block;height:100%;"></image>
		</section>
		
		<section class="section-event panel bgf" style="position: relative;z-index: 10;">
			<view class="h2">
				<view class="ellipsis2">
					{{detail.name}}
				</view>
			</view>
			
			<view class="panel-item">
				<view class="label">报名时间</view>
				<view class="value">{{detail.registration_time}}</view>
			</view>
			
			<view class="panel-item">
				<view class="label">活动时间</view>
				<view class="value">{{detail.event_time}}</view>
			</view>
			<view class="panel-item">
				<view class="label">活动地点：</view>
				<view class="value" @click="copyText(detail.event_location)">{{detail.event_location}}</view>
			</view>
			
			<view class="cell flex-row1 pl20">
				<view class="label">活动项目：</view>
				<view class="flex-row flex-wrap">
					<view class="event-item flex-center" v-for="(item,index) in detail.eventItems" :key="index">
						{{item}}
					</view>
				</view>
			</view>
			
			<view class="cell flex-start pl20">
				<view class="label">客服电话：</view>
				<view class="value flex-start">
					<view style="color: #1989fa;margin-right:10rpx;" @click="callPhone('19927709895')">19927709895</view>
				<!-- 	<u-button type="primary" color="#19be6b" shape="circle" size="mini" @click="copyText('Qsty2025')">
						复制微信号 Qsty2025
					</u-button> -->
				</view>
			</view>
		</section>
		
		<section class="panel" style="padding: 20rpx 0 0;">
			<view class="cell" style="margin-top:0;">
				<view class="label pl20 pb20" style="font-size: 28rpx;">活动说明：</view>
			</view>
			<rich-text :nodes="detail.text"></rich-text>
		</section>

		<view class="section-bottom">
			<!-- <view class="txt">
				{{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			</view> -->
			<view class="u-border-top1" :class="{isSignUp: isSignUp}" style="padding: 26rpx 20rpx 0">
				<u-button type="primary" :disabled="detail.status !== 'ACT'" shape="circle" @click="routeTo()">
					<block v-if="detail.status === 'ACT'">{{isSignUp ? '取消报名' : '活动报名'}}</block>
					<block v-if="detail.status === 'PND'">活动暂未开始</block>
					<block v-if="detail.status === 'EXP'">已截止</block>
				</u-button>
			</view>
		</view>
		
		<button class="share-btn flex-center"  :class="{active: isScroll}"  open-type="share">
			<u-icon name="share" color="#fff" size="18"></u-icon>
		</button>
		
		<PhoneLogin ref="refPhoneLogin" />
  </view>
</template>
<script>
	let timer = null;
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
export default {
	components: { PhoneLogin },
  data () {
		return {
			isScroll: false,
			isScrolled: false,
			isSignUp: false,
			detail: {},
			isFixedNavbar: true,
			isLoadedPage: false,   // 页面加载后控制动画
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
	onUnload() {
		this.isLoadedPage = false;
		uni.removeStorageSync('eventDetail')
	},
	onPageScroll(e) {
		this.isFixedNavbar = parseInt(e.scrollTop) < 30;
		
		this.isScroll = true;
	
		clearTimeout(timer);
		timer = setTimeout(() => {
			this.isScroll = false;
		}, 100);
	},
	onShareAppMessage() {
		return {
			title: this.detail.name, // 分享标题
			// path: '/pages/index/index',     // 分享路径（必须是已经存在的页面路径）
			imageUrl: this.detail.background_image_url // 可选：分享时显示的封面图（网络图片或本地图片）
		};
	},
  methods: {
		clickPage() {
			this.isScrolled = true;
		},
		getDetail() {
			const eventDetail = uni.getStorageSync('eventDetail')
			if (eventDetail) {
				this.detail = eventDetail
			}
			
			uni.showLoading({
				mask: true
			})
			this.$axios.get(`/event-api/api/v1/events/${this.routerParams.id}`).then(res => {
				res.text = `<img src="${res.long_image_url}" style="max-width:100%;" />`
				res.eventItems = res.event_projects.split('、')
				this.detail = res;
				
				this.isLoadedPage = true;
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
	.share-btn {
		position: fixed;
		right: 20rpx;
		bottom: 200rpx;
	  width: 90rpx;
	  height: 90rpx;
	  border-radius: 200rpx;
	  color: #fff;
		z-index: 20;
	  border: 1px solid #18b566;
	  background-color: #18b566 !important;
	  margin-bottom: 20rpx !important;
	  flex-direction: column;
	  font-size: 20rpx;
	  box-shadow: 0px 0px 6rpx rgba(0, 0, 0, 0.4);
		transition: transform 0.3s;
	  &:after {
	    display: none;
	  }
		&.active {
		  transform: translate(100rpx);
		}
	}
	.event-item{
		color: #fff;
		background: #f66761;
		padding: 18rpx 26rpx;
		margin: 20rpx 20rpx 0rpx 0;
		border-radius: 16rpx;
		font-size: 32rpx;
	}
	.panel-item{
		padding: 20rpx;
		margin: 20rpx 0;
		background: #f7fafb;
		border-radius: 16rpx;
		.label{
			margin-bottom: 15rpx;
			font-size: 24rpx;
			color: #666;
		}
		.value{
			line-height: 1.3;
		}
	}
	.offlineEvents{
		padding: 34rpx;
	}
	.panel{
		width: 710rpx;
		margin: 30rpx auto;
		padding: 20rpx;
		border-radius: 26rpx;
		box-shadow: unset;
		background: #fff;
	}
	.h2{
		font-weight: 600;
		font-size: 34rpx;
		text-align: center;
		line-height: 1.4;
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
		z-index: 10;
		padding: 0 34rpx 34rpx;
		transform: translateY(100%);
		.txt{
			font-size: 24rpx;
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}
	.section-event{
		transform: translateY(0%);
	}
	
	.isLoadedPage{
		.section-bottom{
			// transition: transform 0.5s;
			// transform: translateY(0%);
			animation: slideIn 0.5s 0.5s forwards;
		}
		.section-event{
			transition: transform 0.5s;
			transform: translateY(-100rpx);
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
	
	.event-status{
		position: absolute;
		top: 200rpx;
		right: 40rpx;
		z-index: 2;
		background: #19be6b;
		color: #fff;
		border-radius: 888rpx;
		padding: 20rpx 30rpx;
	}
	
	.isScrolled{
		transition: height 0.3s;
		height: 500rpx!important;
	}
	@keyframes slideIn {
	  0% {
	    transform: translateY(100%);
	    opacity: 0;
	  }
	  50% {
	    transform: translateY(10px);
	  }
	  100% {
	    transform: translateY(0);
	    opacity: 1;
	  }
	}
	
</style>
