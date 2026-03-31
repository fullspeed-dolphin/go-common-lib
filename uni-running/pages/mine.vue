<template>
  <view class="page">
    <view class="page-content">
      <!-- 标题栏到英雄区的过渡 -->
      <view class="nav-hero-transition"></view>
      <!-- Hero 区域 -->
      <view class="hero-section">
        <view class="hero-content">
          <view class="hero-avatar-wrap" @click="handleUserClick">
            <image class="hero-avatar" :src="userInfo.avatar_url ||
              'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
              " mode="aspectFill"></image>
          </view>
          <block v-if="userInfo.id">
            <view class="hero-name-row" @click="handleUserClick">
              <text class="hero-name">{{ userInfo.nickname || "微信用户" }}</text>
              <u-icon name="edit-pen-fill" color="rgba(46,59,94,0.6)" size="16"></u-icon>
            </view>
            <view class="hero-coin-pill" @click="routeTo('/pagesSub/runCoin/myCoin')">
              <u-icon name="rmb-circle" color="#FFFFFF" size="20"></u-icon>
              <text class="coin-text">跑币 {{ coinInfo.fscoin || 0 }}</text>
              <u-icon name="arrow-right" color="#FFFFFF" size="12"></u-icon>
            </view>
          </block>
          <view class="hero-name-row" v-else @click="handleUserClick">
            <text class="hero-name">登录/注册</text>
          </view>
        </view>
      </view>

      <!-- 过渡渐变 -->
      <view class="hero-transition"></view>

      <!-- 内容区域 -->
      <view class="mine-content">
        <!-- 我的服务 -->
        <view class="mine-section">
          <text class="section-title">我的服务</text>
          <view class="section-card">
            <view class="menu-row" @click="routeTo('pagesSub/orderList')">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-dingdan menu-icon"></view>
              </view>
              <text class="menu-label">我的订单</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="routeTo(`pagesSub/runningTeam/teamDetail?from=mine&group_id=${userInfo.running_group}`)">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-baomingmingdan menu-icon"></view>
              </view>
              <text class="menu-label">全速俱乐部</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <template v-if="isGroupCreator">
              <view class="menu-divider"></view>
              <view class="menu-row" @click="routeTo(`pagesSub/runningTeam/teamSetting?group_id=${userInfo.running_group}`)">
                <view class="menu-icon-wrap">
                  <u-icon name="setting" size="36rpx" color="#FF8C00"></u-icon>
                </view>
                <text class="menu-label">{{ clubType === 'cycling' ? '车队' : '跑团' }}管理工具</text>
                <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
              </view>
            </template>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="goRegistrationCard">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-baomingka1 menu-icon"></view>
              </view>
              <text class="menu-label">报名卡</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="routeTo('/pagesSub/device/deviceList')">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-zhinengshoubiao menu-icon"></view>
              </view>
              <text class="menu-label">智能设备</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
          </view>
        </view>

        <!-- 更多 -->
        <view class="mine-section">
          <text class="section-title">更多</text>
          <view class="section-card">
            <view class="menu-row" @click="openWeComChat()">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-lianxikefu menu-icon"></view>
              </view>
              <text class="menu-label">联系客服</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="routeTo('/pagesMine/PunchEvent')">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-qiandao_daka menu-icon"></view>
              </view>
              <text class="menu-label">现场签到</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="routeTo('/pagesMine/toolkit/UserRole')">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-zhuye menu-icon"></view>
              </view>
              <text class="menu-label">全速之家</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <view class="menu-divider"></view>
            <view class="menu-row" @click="routeTo('/pagesSub/settings/aboutUs')">
              <view class="menu-icon-wrap">
                <view class="iconfont icon-guanyuwomen menu-icon"></view>
              </view>
              <text class="menu-label">关于我们</text>
              <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
            </view>
            <template v-if="userInfo.id">
              <view class="menu-divider"></view>
              <view class="menu-row" @click="logout()">
                <view class="menu-icon-wrap">
                  <view class="menu-icon-svg icon-logout"></view>
                </view>
                <text class="menu-label">退出登录</text>
                <u-icon name="arrow-right" color="#B8C4D0" size="16"></u-icon>
              </view>
            </template>
          </view>
        </view>

        <view class="footer-version">
          <view class="footer-line"></view>
          <text class="footer-text">全速科技{{ appVersion ? ' v' + appVersion : '' }}</text>
          <view class="footer-line"></view>
        </view>
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

// 是否是团长/队长
const isGroupCreator = ref(false);
const clubType = ref('');

// 小程序版本号
const appVersion = (() => {
  try {
    return uni.getAccountInfoSync().miniProgram.version || '';
  } catch (e) {
    return '';
  }
})();

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
  checkGroupRole();
}

function checkGroupRole() {
  const groupId = userInfo.value.running_group;
  if (!groupId) {
    isGroupCreator.value = false;
    return;
  }
  request.get(`/running-group/api/v1/groups/info?group_id=${groupId}`).then((res) => {
    isGroupCreator.value = res.user_role === 'creator';
    clubType.value = res.club_type || '';
  }).catch(() => {
    isGroupCreator.value = false;
    clubType.value = '';
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

const goRegistrationCard = () => {
  uni.removeStorageSync('eventThemeColor');
  routeTo('/pagesSub/registrationCard/list');
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
    // pendingAction.value = () => refAccessUser.value.open();
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

// 联系客服
const openWeComChat = () => {
  uni.showLoading({
    mask: true,
  });

  setTimeout(() => {
    uni.hideLoading();
  }, 300);
  // #ifdef MP-WEIXIN
  wx.openCustomerServiceChat({
    extInfo: {
      url: "https://work.weixin.qq.com/kfid/kfcb41efa532f58830b"
    },
    corpId: 'wwaac238486eb8781e',
    onOpen: (res) => {
      console.log('success', res);
    },
    onError: (err) => {
      console.error('fail', err);
      uni.showModal({
        content: '客服系统繁忙，请稍后重试或拨打热线电话',
        showCancel: false
      });
    }
  });
  // #endif
};
</script>

<style lang="scss" scoped>
.nav-hero-transition {
  height: 60rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF0E0 100%);
}

.hero-section {
  background: linear-gradient(180deg, #FFF0E0 0%, #FFFFFF 100%);
  padding: 0 32rpx 48rpx 32rpx;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  padding-top: 80rpx;
}

.hero-avatar-wrap {
  .hero-avatar {
    display: block;
    width: 144rpx;
    height: 144rpx;
    border-radius: 50%;
    border: 6rpx solid #FF8C00;
    background: #f5f5f5;
  }
}

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.hero-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #2E3B5E;
}

.hero-coin-pill {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 28rpx 20rpx 32rpx;
  background: #FF8C00;
  border-radius: 100rpx;

  .coin-icon {
    width: 40rpx;
    height: 40rpx;
  }

  .coin-text {
    font-size: 32rpx;
    font-weight: 700;
    color: #FFFFFF;
  }
}

.hero-transition {
  height: 80rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
}

.mine-content {
  background: #FAFAFA;
  padding: 48rpx 48rpx 32rpx;
  min-height: 400rpx;
}

.mine-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #2E3B5E;
  margin-bottom: 20rpx;
}

.section-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 8rpx 0;
  overflow: hidden;
}

.menu-row {
  display: flex;
  align-items: center;
  padding: 28rpx 40rpx;
  gap: 28rpx;
}

.menu-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon {
  font-size: 36rpx;
  font-weight: 600;
  color: #FF8C00;
}


.menu-label {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: #2E3B5E;
}

.menu-divider {
  height: 1px;
  background: #E8E8E8;
  margin: 0 40rpx;
}

.menu-icon-svg {
  width: 36rpx;
  height: 36rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-logout {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRjhDMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiLz48cG9seWxpbmUgcG9pbnRzPSIxNiAxNyAyMSAxMiAxNiA3Ii8+PGxpbmUgeDE9IjIxIiB5MT0iMTIiIHgyPSI5IiB5Mj0iMTIiLz48L3N2Zz4K");
}

.footer-version {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 40rpx 48rpx 60rpx;
}

.footer-line {
  flex: 1;
  height: 1px;
  background: #E0E0E0;
}

.footer-text {
  color: #C0C0C0;
  font-size: 24rpx;
  white-space: nowrap;
}
</style>
