<template>
  <view class="page">
    <view class="page-content">
      <view class="rel section-user">
        <view class="user-box">
          <view class="u-flex-y-center">
            <view class="img-box" @click="handleUserClick">
              <image class="avatar" :src="
                  userInfo.avatar_url ||
                  'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
                " mode="aspectFill"></image>
              <view class="gender flex-center">
                <u-icon v-if="userInfo.gender === 1" color="#409eff" name="man" size="20"></u-icon>
                <u-icon v-if="userInfo.gender === 0" color="#f5abb8" name="woman" size="20"></u-icon>
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
                <view @click="routeTo('/pagesSub/runCoin/myCoin')" class="coin-pill">
                  <image class="coin-icon" src="/static/images/coin.png" mode="aspectFill"></image>
                  <text class="coin-label">我的跑币:</text>
                  <text class="coin-value">{{coinInfo.fscoin}}</text>
                  <u-icon name="arrow-right" color="#e65100" size="12"></u-icon>
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
						<view class="nav-icon iconfont icon-dingdan"></view>
          </template>
        </u-cell>
        <!-- <u-cell title="我的跑币" class="nav-cell" @click="routeTo('/pagesSub/runCoin/myCoin')" :border="false" isLink>
					<template #icon>
						<image class="nav-icon" style="width: 40rpx; height: 40rpx"
							src="/static/images/coin.png"></image>
					</template>
				</u-cell> -->
        <u-cell title="全速俱乐部" class="nav-cell" @click="
            routeTo(
              `pagesSub/runningTeam/teamDetail?from=mine&group_id=${userInfo.running_group}`
            )
          " :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-baomingmingdan"></view>
          </template>
        </u-cell>
        <u-cell title="报名卡" class="nav-cell" @click="routeTo('/pagesSub/registrationCard/list')" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-baomingka1"></view>
          </template>
        </u-cell>

        <u-cell title="智能设备" class="nav-cell" @click="routeTo('/pagesSub/device/deviceList')" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-zhinengshoubiao"></view>
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
									<view class="nav-icon iconfont icon-lianxikefu"></view>
                </view>
                <text class="service-text">联系客服</text>
              </view>
              <u-icon name="arrow-right" color="#909399" size="26rpx"></u-icon>
            </view>
          </button>
        </view>

        <u-cell title="现场签到" class="nav-cell" @click="routeTo('/pagesMine/PunchEvent')" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-qiandao_daka"></view>
          </template>
        </u-cell>

        <u-cell title="全速之家" class="nav-cell" @click="routeTo('/pagesMine/toolkit/UserRole')" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-zhuye"></view>
          </template>
        </u-cell>

        <u-cell v-if="isReleaseVersion()" title="关注全速体育" class="nav-cell" @click="openOfficialAccount" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-weixin"></view>
          </template>
        </u-cell>

				<u-cell title="关于我们" class="nav-cell" @click="routeTo('/pagesSub/settings/aboutUs')" :border="false" isLink>
          <template #icon>
						<view class="nav-icon iconfont icon-guanyuwomen"></view>
          </template>
        </u-cell>
      </view>

      <view v-if="userInfo.id" class="logout c9 flex-center" style="padding-bottom: 60rpx;">
        <text class="u-pb-20" @click="logout()">-- 退出登录 --</text>
      </view>
    </view>
    <tabbar type="mine" />

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />
    <AccessUser ref="refAccessUser" />
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { clearUserInfo } from "@/utils/util.js";
import tabbar from "@/components/tabBar.vue";
import UserLogin from "@/components/UserLogin.vue";
import AccessUser from "@/components/common/AccessUser.vue";
import request from "@/utils/request.js";
import { useShare } from "@/composables/useShare.js";
import { isReleaseVersion } from "@/utils/util.js";

const store = useStore();

// 分享配置
useShare({
  title: "我的个人中心",
  path: "/pages/mine",
});

// 模板引用
const refUserLogin = ref(null);
const refAccessUser = ref(null);

// 待执行的操作（登录成功后继续执行）
const pendingAction = ref(null);

// 登录成功回调
const onLoginSuccess = () => {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
};

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 页面显示
onShow(() => {
  store.dispatch("getUserInfo");

  getInfo();
});

const coinInfo = ref({});
function getInfo() {
  if (!userInfo.value.id) return;
  request.get(`/wallet-api/wallet/balance`).then((res) => {
    coinInfo.value = res;
  });
}

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
    pendingAction.value = () => uni.$u.route(link);
    return refUserLogin.value.open();
  }

  uni.$u.route(link);
};

const handleUserClick = () => {
  if (!userInfo.value.id) {
    pendingAction.value = () => refAccessUser.value.open();
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
        uni.$u.toast("退出登录成功");
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const openOfficialAccount = () => {
  // #ifdef MP-WEIXIN
  wx.openOfficialAccountProfile({
    username: "gh_7234583f8d1b",
    success: (res) => {
      console.log("打开公众号成功", res);
    },
    fail: (err) => {
      console.error("打开公众号失败", err);
      uni.showToast({
        title: "打开公众号失败",
        icon: "none",
      });
    },
  });
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({
    title: "仅支持微信小程序",
    icon: "none",
  });
  // #endif
};
</script>

<style lang="less" scoped>
.img-box {
  position: relative;

  .gender {
    position: absolute;
    background: #fff;
    bottom: -2rpx;
    right: 40rpx;
    width: 36rpx;
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
	font-weight: 600;
	width: 43rpx; height: 34rpx;font-size:38rpx;color:#FF8C00;
}

.user-box {
  height: 260rpx;
  padding: 56rpx 0 0rpx 48rpx;
  overflow: hidden;

  .avatar {
    display: block;
    width: 140rpx;
    height: 140rpx;
    margin-right: 36rpx;
    background: #f5f5f5;
    border-radius: 140rpx;
    text-align: center;
    font-size: 60rpx;
    color: #ccc;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
  }

  .name {
    font-weight: 600;
    font-size: 36rpx;
  }

  .coin-pill {
    display: inline-flex;
    align-items: center;
    margin-top: 20rpx;
    padding: 10rpx 24rpx;
    background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
    border-radius: 100rpx;
    border: 2rpx solid #ffb74d;

    .coin-icon {
      width: 32rpx;
      height: 34rpx;
    }

    .coin-label {
      margin-left: 10rpx;
      font-size: 26rpx;
      color: #e65100;
      font-weight: 500;
    }

    .coin-value {
      margin-left: 8rpx;
      margin-right: 8rpx;
      font-size: 28rpx;
      color: #e65100;
      font-weight: 600;
    }
  }
}

::v-deep {
  .u-cell {
    margin-bottom: 8rpx;
    border-radius: 10rpx;
    width: 680rpx;
    margin: 26rpx auto;
    height: 110rpx;
    border-radius: 24rpx 24rpx 24rpx 24rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    background: #fff;

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