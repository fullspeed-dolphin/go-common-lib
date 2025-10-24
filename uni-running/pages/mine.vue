<template>
  <view class="">
		<u-navbar placeholder title="个人中心" :leftIcon="false"></u-navbar>
    <view class="page-content">
    	<view class="rel section-user">
    		<view class="user-box" @click="handleUserClick">
    			<view class="flex-start">
						<view class="img-box">
							<image class="avatar" :src="userInfo.avatar_url || '../static/run.png'" mode="aspectFill"></image>
							<view class="gender">
								<u-icon v-if="userInfo.gender === 1" color="#409eff" name="man" size="17" ></u-icon>
								<u-icon v-if="userInfo.gender === 0" color="#f5abb8" name="woman" size="17" ></u-icon>
							</view>
						</view>
    				<view class="text">
							<block v-if="userInfo.id">
								<view class="name flex-start" >
									{{userInfo.nickname || '微信用户'}}
									<view class="ml10">
										<u-icon name="edit-pen-fill" size="17" ></u-icon>
									</view>
								</view>
								<view class="name" style="color: #666;margin-top:20rpx;">{{userInfo.phone || ''}}</view>
							</block>
    					<view class="name" v-else>登录/注册</view>
    				</view>
    			</view>
    		</view>
				
				<view class="setting" @click="routeTo('pagesSub/signerForm')">
					<u-icon name="setting-fill" size="20"></u-icon>
				</view>
    	</view>
			<view class="section-box">
				<u-cell title="我的跑团" class="nav-cell" @click="routeTo(`pagesSub/groupDetail?from=mine&group_id=${userInfo.running_group}`)" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" src="/static/images/个人信息Icon@2x.png"></image>
					</template>
				</u-cell>
				<!-- 				<u-cell title="我的消息" class="nav-cell" @click="routeTo('/pagesSub/myMessages')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" src="/static/images/我的消息Icon@2x.png"></image>
					</template>
				</u-cell> -->
				<u-cell title="我的订单" class="nav-cell" @click="routeTo('/pagesSub/orderList')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" src="/static/images/WX20250908-193754.png"></image>
					</template>
				</u-cell>
				<view class="service-cell u-cell u-cell__body" @click="showLoading()">
					<button class="u-reset-button" open-type="contact">
					  <view class="flex-row" style="width:100%;">
					  	<view class="flex-start flex-1">
					  		<view class="icon">
					  			<image class="nav-icon" src="/static/images/我的消息Icon@2x.png"></image>
					  		</view>
					  		联系客服
					  	</view>
							<u-icon name="arrow-right" size="14" ></u-icon>
					  </view>
					</button>
					
					<!-- <u-cell :title="null" class=" nav-cell" isLink>
						<template #icon>
							<image class="nav-icon" src="/static/images/我的消息Icon@2x.png"></image>
						</template>
						<button class="u-reset-button" open-type="contact">
						      联系客服
						</button>
					</u-cell> -->
				</view>
				
				<!-- <u-cell title="意见反馈" class="nav-cell" @click="routeTo('/pagesSub/settings/feedback')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" src="/static/images/帮助反馈Icon@2x.png"></image>
					</template>
				</u-cell> -->
				<u-cell title="智能设备" class="nav-cell" @click="routeTo('/pagesSub/device/deviceList')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="height: 40rpx;" src="/static/images/WX20251018-181116.png"></image>
					</template>
				</u-cell>
			</view>
			
	   <view v-if="userInfo.id" class="logout c9 flex-center">
				<text @click="logout()">-- 退出登录 --</text>
			</view>
			
    </view>
		<tabbar type="mine"/>
		
		<UserLogin ref="refUserLogin"/>
		<AccessUser ref="refAccessUser"/>
		
  </view>
</template>
<script>
	import { clearUserInfo } from "@/utils/util.js"
	import tabbar from "@/components/tabBar.vue"
	import UserLogin from "@/components/UserLogin.vue"
	import AccessUser from "@/components/common/AccessUser.vue"
export default {
	components: {
		tabbar, UserLogin, AccessUser
	},
  data () {
    return {};
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
	onShow() {
		this.$store.dispatch('getUserInfo')
	},
  methods: {
		showLoading() {
			uni.showLoading({
				mask: true
			})
			
			setTimeout(() => {
				uni.hideLoading()
			}, 300)
		},
		routeTo(link) {
			if (!this.userInfo.id) {
				return this.$refs.refUserLogin.open()
			}
			
			uni.$u.route(link)
		},
		handleUserClick() {
			if (!this.userInfo.id) {
				return this.$refs.refUserLogin.open()
			}
			
			this.$refs.refAccessUser.open()
		},
    logout () {
      uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
          if (res.confirm) {
						clearUserInfo();
						// setTimeout(() => {
						// 	uni.redirectTo({
						// 		url: '/pagesSub/login'
						// 	})
						// }, 200)
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
	.img-box{
		position: relative;
		.gender{
			position: absolute;
			background: #fff;
			bottom:-2rpx;
			right:25rpx;
			border-radius: 40rpx;
		}
	}
	::v-deep{
		.service-cell{
			.icon{
				display: flex;
				align-items: center;
				width: 52rpx;
				height: 52rpx;
				border-radius: 53rpx;
				background: rgba(0,0,0,0.06);
				justify-content: center;
				margin-right:22rpx;
			}
			.u-cell__body__content{
				flex: unset;
			}
			.u-cell__value{
				flex:1;
				text-align: left;
				max-width: 100%;
			}
			.u-reset-button{
				height: 120rpx;
				text-align: left;
				font-size: 15px;
				line-height: 22px;
				color: #303133;
				display: flex;
				flex-direction: row;
				box-sizing: border-box;
				padding: 10px 15px;
				font-size: 15px;
				color: #303133;
				align-items: center;
			}
		}
	}
	
	.setting{
		position: absolute;
		right: 20rpx;
		top:20rpx;
		padding: 20rpx;
	}
	::v-deep{
		.u-cell__left-icon-wrap{
			width: 52rpx;
			height: 52rpx;
			border-radius: 53rpx;
			background: rgba(0,0,0,0.06);
			justify-content: center;
			margin-right:22rpx!important;
		}
	}
	.nav-icon{
		width: 34rpx;
		height: 34rpx;
		display: block;
	}
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
			border: 1rpx solid rgba(0,0,0,0.06);
		}
		.name {
			font-weight: 500;
			font-size: 30rpx;
		}
	}
	
	::v-deep{
			.u-cell{
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
		background-color: #fff;
	}
.logout {
  margin-top: 50rpx;
}

.section-user{
	overflow: hidden;
	position: relative;
	.user-bg{
		width: 100%;
		height: 286rpx;
		display: block;
	}
}
</style>
