<template>
  <view class="mine-page">
    <view class="page-content">
    	<view class="rel section-user">
    		<view class="user-box" @click="$goUrl(userInfo.Id ? '/pagesSub/settings/profile1' : '/pagesSub/login')">
    			<view class="flex-start">
						<image class="avatar" :src="userInfo.Avatar || '../static/img/默认头像@2x.png'" mode="aspectFill"></image>
    				<view class="text">
    					<view class="name" v-if="userInfo.Id">{{userInfo.NickName}}</view>
    					<view class="name" v-else>登录/注册</view>
    				</view>
    			</view>
    		</view>
    	</view>
			<view class="section-box">
				<u-cell title="我的跑团" class="nav-cell" @click="goLink('/pagesSub/historyList')" :border="false" isLink>
					<view slot="icon" class="iconfont icon-liulanjilu"></view>
				</u-cell>
				<u-cell title="我的消息" class="nav-cell" @click="goLink('/pagesSub/orderList')" :border="false" isLink>
					<view slot="icon" class="iconfont icon-dingdan-copy"></view>
				</u-cell>
				<u-cell title="我的赛事" class="nav-cell" @click="$goUrl('/pagesSub/settings/agreement')" :border="false" isLink>
					<view slot="icon" class="iconfont icon-duiwaichuzuguanli"></view>
				</u-cell>
				<u-cell title="意见反馈" class="nav-cell" @click="$u.route('/pagesSub/settings/feedback')" :border="false" isLink>
					<view slot="icon" class="iconfont icon-duiwaichuzuguanli"></view>
				</u-cell>
			</view>
			
	   <view v-if="userInfo.Id" class="logout c9 flex-center">
				<text @click="logout()">-- 退出登录 --</text>
			</view>
			
    </view>
		<tabbar type="mine"/>
  </view>
</template>
<script>
	import { clearUserInfo } from "@/utils/util.js"
	import tabbar from "@/components/tabBar.vue"
export default {
	components: {
		tabbar,
	},
  data () {
    return {
			// userInfo: {}
    };
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onShow() {
		this.$store.dispatch('getUserInfo')
		// this.userInfo = uni.getStorageSync('userInfo') || {}
		// if (uni.getStorageSync('token')) {
		// 	// this.$store.dispatch('getUserInfo');
		// } else {
		// 	uni.removeStorageSync('userInfo')
		// }
	},
  methods: {
		goLink(link) {
			if (!this.userInfo.Id) {
				this.$toast('请登录');
				setTimeout(() => {
					this.$goUrl("/pagesSub/login")
				}, 300)
				
				return
			}
			this.$goUrl(link)
		},
    logout () {
      uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
          if (res.confirm) {
						clearUserInfo();
						setTimeout(() => {
							uni.redirectTo({
								url: '/pagesSub/login'
							})
						}, 200)
						
						return false;
						
						this.$axios({url: "api/index/logout"}).then(res => {
							this.$toast('已退出登录')
							
							uni.removeStorageSync('token')
							
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/login'
								})
							}, 200)
						})
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    },
  }
};
</script>

<style lang="less" scoped>
	.user-box{
		height: 210rpx;
		padding: 56rpx 0 0rpx 48rpx;
		overflow: hidden;
		z-index: 10;
		.avatar{
			display: block;
			width: 108rpx;
			height: 108rpx;
			margin-right: 30rpx;
			background: #f5f5f5;
			border-radius: 108rpx;
			text-align: center;
			font-size: 60rpx;
			color: #ccc;
			border: 1rpx solid #999;
		}
		.name {
			font-weight: 500;
			font-size: 30rpx;
		}
	}
	
	::v-deep{
			.u-cell{
				padding-left:24rpx;
				padding-right:20rpx;
				background: #F6F6F6;
				margin-bottom: 8rpx;
				border-radius: 10rpx;
				width: 680rpx;
				margin: 26rpx auto;
				height: 122rpx;
				border-radius: 24rpx 24rpx 24rpx 24rpx;
				border: 2rpx solid rgba(0,0,0,0.06);
				.u-cell__body{
					height: 100%;
				}
			}
			.van-cell__title{
				font-size: 34rpx;
				font-weight: 600;
			}
	}
	.section-box{
		position: relative;
		z-index: 5;
		margin-top: -20rpx;
		padding: 10rpx 0 10rpx 10rpx;
		border-radius: 20rpx 20rpx 0 0;
		background-color: #fff;
	}
.logout {
  margin-top: 50rpx;
  padding-bottom: 200rpx;
	// background: #ebeced;
}
.mine-page{
	min-height: 100vh;
}
.section-user{
	overflow: hidden;
	.user-bg{
		width: 100%;
		height: 286rpx;
		display: block;
	}
}
</style>
