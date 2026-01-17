<template>
	<view class="page">
		<view class="page-content">
			<view class="rel section-user">
				<view class="user-box" >
					<view class="u-flex-y-center">
						<view class="img-box" @click="handleUserClick">
							<image class="avatar" :src="
                  userInfo.avatar_url ||
                  'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
                " mode="aspectFill"></image>
							<view class="gender">
								<u-icon v-if="userInfo.gender === 1" color="#409eff" name="man" size="17"></u-icon>
								<u-icon v-if="userInfo.gender === 0" color="#f5abb8" name="woman" size="17"></u-icon>
							</view>
						</view>
						<view class="text">
							<block v-if="userInfo.id">
								<view class="name u-flex-y-center" @click="handleUserClick">
									{{ userInfo.nickname || "微信用户" }}
									<view class="u-ml-10">
										<u-icon name="edit-pen-fill" size="17"></u-icon>
									</view>
								</view>
								<!-- <view class="name" style="color: #666; margin-top: 20rpx">
								{{ userInfo.phone || ""}}
								</view> -->
								<view class="u-flex-y-center" style="color: #666; margin-top: 16rpx">
									<image style="width:28rpx;height:30rpx;" src="/static/images/跑币@2x.png" mode="aspectFill"></image>
									<text class="u-ml-10 b c0">跑币余额:</text>
									<text class="u-ml-10 u-mr-10 b c0">0</text>
									<u-icon name="arrow-right" size="10"></u-icon>
								</view>
							</block>
							<view class="name" v-else @click="handleUserClick">登录/注册</view>
						</view>
					</view>
				</view>

				<!-- <view class="setting" @click="routeTo('pagesSub/signerForm')">
          <u-icon name="setting-fill" size="20"></u-icon>
        </view> -->
			</view>
			<view class="section-box">
				<u-cell title="我的订单" class="nav-cell" @click="routeTo(`pagesSub/orderList`)" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 32rpx; height: 40rpx"
							src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-event@2x.png"></image>
					</template>
				</u-cell>
				<u-cell title="全速俱乐部" class="nav-cell" @click="
            routeTo(
              `pagesSub/runningTeam/teamDetail?from=mine&group_id=${userInfo.running_group}`
            )
          " :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 40rpx; height: 40rpx"
							src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-group@2x.png"></image>
					</template>
				</u-cell>
				<u-cell title="报名卡" class="nav-cell" @click="routeTo('/pagesSub/registrationCard/list')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon"
							src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-user@2x.png"></image>
					</template>
				</u-cell>

				<u-cell title="智能设备" class="nav-cell" @click="routeTo('/pagesSub/device/deviceList')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 28rpx; height: 46rpx"
							src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-device@2x.png"></image>
					</template>
				</u-cell>

				<!-- <u-cell title="我的跑币" class="nav-cell" @click="routeTo('/pagesSub/device/deviceList')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 40rpx; height: 40rpx"
							src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-coin@2x.png"></image>
					</template>
				</u-cell> -->

				<view class="service-cell u-cell u-cell__body" @click="showLoading()">
					<button class="u-reset-button" open-type="contact">
						<view class="flex-row" style="width: 100%">
							<view class="u-flex-y-center flex-1 service-content">
								<view class="icon">
									<image class="nav-icon"
										src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-mine-customer@2x.png">
									</image>
								</view>
								<text class="service-text">联系客服</text>
							</view>
							<u-icon name="arrow-right" color="#909399" size="26rpx"></u-icon>
						</view>
					</button>
				</view>

				<u-cell title="现场签到" class="nav-cell" @click="routeTo('/pagesMine/PunchEvent')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 40rpx; height: 36rpx" src="/static/images/现场签到 @2x.png"></image>
					</template>
				</u-cell>
				
				<u-cell title="全速之家" class="nav-cell" @click="routeTo('/pagesMine/toolkit/UserRole')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 36rpx; height: 38rpx" src="/static/images/quansuzhijia.png"></image>
					</template>
				</u-cell>

				<u-cell title="关注全速体育" class="nav-cell" @click="openOfficialAccount" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 43rpx; height: 34rpx"
							src="/static/images/Wei20260108212025_5184_21.png"></image>
					</template>
				</u-cell>

				<!-- <u-cell title="意见反馈" class="nav-cell" @click="routeTo('/pagesSub/settings/feedback')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/帮助反馈Icon@2x.png"></image>
					</template>
				</u-cell> -->
			</view>

			<view v-if="userInfo.id" class="logout c9 flex-center">
				<text @click="logout()">-- 退出登录 --</text>
			</view>
		</view>
		<tabbar type="mine" />

		<UserLogin ref="refUserLogin" />
		<AccessUser ref="refAccessUser" />
	</view>
</template>
<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		onShow
	} from "@dcloudio/uni-app";
	import {
		useStore
	} from "vuex";
	import {
		clearUserInfo
	} from "@/utils/util.js";
	import tabbar from "@/components/tabBar.vue";
	import UserLogin from "@/components/UserLogin.vue";
	import AccessUser from "@/components/common/AccessUser.vue";

	const store = useStore();

	// 模板引用
	const refUserLogin = ref(null);
	const refAccessUser = ref(null);

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// 页面显示
	onShow(() => {
		store.dispatch("getUserInfo");
	});

	// 方法定义
	const showLoading = () => {
		uni.showLoading({
			mask: true,
		});

		setTimeout(() => {
			uni.hideLoading();
		}, 300);
	};

	const routeTo = (link) => {
		if (!userInfo.value.id) {
			return refUserLogin.value.open();
		}

		uni.$u.route(link);
	};

	const handleUserClick = () => {
		if (!userInfo.value.id) {
			return refUserLogin.value.open();
		}

		refAccessUser.value.open();
	};

	const logout = () => {
		uni.showModal({
			title: "提示",
			content: "确定退出登录吗？",
			success: (res) => {
				if (res.confirm) {
					clearUserInfo();
					// setTimeout(() => {
					// 	uni.redirectTo({
					// 		url: '/pagesSub/login'
					// 	})
					// }, 200)
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	const openOfficialAccount = () => {
		// #ifdef MP-WEIXIN
		wx.openOfficialAccountProfile({
			username: 'gh_7234583f8d1b',
			success: (res) => {
				console.log('打开公众号成功', res);
			},
			fail: (err) => {
				console.error('打开公众号失败', err);
				uni.showToast({
					title: '打开公众号失败',
					icon: 'none'
				});
			}
		});
		// #endif

		// #ifndef MP-WEIXIN
		uni.showToast({
			title: '仅支持微信小程序',
			icon: 'none'
		});
		// #endif
	};
</script>

<style lang="less" scoped>
	.page {
		background: #fafafa;
	}

	.img-box {
		position: relative;

		.gender {
			position: absolute;
			background: #fff;
			bottom: -2rpx;
			right: 25rpx;
			border-radius: 40rpx;
		}
	}

	::v-deep {
		.u-cell__left-icon-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 26rpx;
			height: 26rpx;
			margin-right: 22rpx !important;
		}

		.u-cell__title-text {
			font-weight: bold;
			font-size: 30rpx !important;
			color: rgba(0, 0, 0, 0.8);
		}

		.u-icon__icon {
			font-size: 26rpx !important;
		}

		.service-cell {
			.icon {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 26rpx;
				height: 26rpx;
				margin-right: 22rpx;
			}

			.service-content {
				display: flex;
				align-items: center;
			}

			.service-text {
				font-weight: bold;
				font-size: 30rpx;
				color: rgba(0, 0, 0, 0.8);
			}

			.u-cell__body__content {
				flex: unset;
			}

			.u-cell__value {
				flex: 1;
				text-align: left;
				max-width: 100%;
			}

			.u-reset-button {
				width: 100%;
				height: 100%;
				margin: 0;
				padding: 0;
				border: none;
				background: transparent;
				text-align: left;
				display: flex;
				flex-direction: row;
				box-sizing: border-box;
				align-items: center;

				&::after {
					border: none;
				}

				.flex-row {
					width: 100%;
					display: flex;
					align-items: center;
					padding: 0 15px;
					box-sizing: border-box;
				}
			}
		}
	}

	.setting {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		padding: 20rpx;
	}

	.nav-icon {
		width: 34rpx;
		height: 34rpx;
		display: block;
		flex-shrink: 0;
	}

	.user-box {
		height: 210rpx;
		padding: 56rpx 0 0rpx 48rpx;
		overflow: hidden;

		.avatar {
			display: block;
			width: 108rpx;
			height: 108rpx;
			margin-right: 30rpx;
			background: #f5f5f5;
			border-radius: 108rpx;
			text-align: center;
			font-size: 60rpx;
			color: #ccc;
			border: 1rpx solid rgba(0, 0, 0, 0.06);
		}

		.name {
			font-weight: 500;
			font-size: 30rpx;
		}
	}

	::v-deep {
		.u-cell {
			margin-bottom: 8rpx;
			border-radius: 10rpx;
			width: 680rpx;
			margin: 26rpx auto;
			height: 122rpx;
			border-radius: 24rpx 24rpx 24rpx 24rpx;
			border: 2rpx solid rgba(0, 0, 0, 0.06);

			.u-cell__body {
				height: 100%;
			}
		}

		.van-cell__title {
			font-size: 34rpx;
			font-weight: 600;
		}
	}

	.section-box {
		position: relative;
	}

	.logout {
		margin-top: 50rpx;
	}

	.section-user {
		overflow: hidden;
		position: relative;

		.user-bg {
			width: 100%;
			height: 286rpx;
			display: block;
		}
	}
</style>