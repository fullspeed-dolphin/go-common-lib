<template>
  <view class="index-page">
    <view class="header">
      <view class="plaeholder" :style="{height: menuBtnInfo.placeholder} "></view>
      <view class="search-box flex-start" :style="menuBtnInfo" @click="$u.route('pagesSub/runningTeam/teamList')">
        <u-icon name="search" size="24"></u-icon>
        <view class="u-ml-5">请输入名称或团号或地址</view>
      </view>
    </view>

    <view class="container">
      <view class="section-banner">
        <swiper class="swiper" circular indicator-dots indicator-active-color="#FF8C00" :autoplay="true" :interval="3000">
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <image class="img" :src="item.image_url + '?x-oss-process=image/resize,w_700,h_350,m_fill'" mode="aspectFill" @click="clickSwiper(item)"></image>
          </swiper-item>
        </swiper>
      </view>
    </view>

    <HomeNavigator />

    <u-cell title="线下活动" customClass="section-title" :border="false" isLink url="pagesSub/eventList" value="查看更多" />

    <swiper class="event-swiper" circular indicator-active-color="#FF8C00" :autoplay="true" :interval="3000" :display-multiple-items="1.2">
      <swiper-item v-for="(item, index) in offlineEventList" :key="index">
        <view class="event-swiper-item">
          <EventItem :item="item" :key="index" height="474rpx" />
        </view>
      </swiper-item>
    </swiper>

    <block v-if="onlineEventList && onlineEventList.length > 0">
      <u-cell title="线上赛事" customClass="section-title" :border="false" isLink url="pagesSub/eventList" value="查看更多" />
      <swiper class="event-swiper" circular indicator-active-color="#FF8C00" :autoplay="true" :interval="3000" :next-margin="126">
        <swiper-item v-for="(item, index) in onlineEventList" :key="index">
          <view class="event-swiper-item">
            <EventItem :item="item" :key="index" height="474rpx" />
          </view>
        </swiper-item>
      </swiper>
    </block>

    <u-cell title="全速俱乐部" customClass="section-title" :border="false" isLink url="pagesSub/runningTeam/teamList" value="查看更多" />

    <section class="section-group">
      <GroupItem :item="item" v-for="(item, index) in GroupList" :key="index" />
    </section>

    <view style="margin-top: 50rpx; padding: 0 34rpx 0rpx;">
      <u-divider text="已经到底了~"></u-divider>
    </view>

    <tabbar type="index" />

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />
  </view>
</template>
<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
import { useShare } from "@/composables/useShare.js";
import { useTabAnimation } from "@/composables/useTabAnimation.js";
import { useStore } from "vuex";
import tabbar from "@/components/tabBar.vue";
import GroupItem from "@/components/GroupItem.vue";
import HomeNavigator from "@/components/HomeNavigator.vue";
import EventItem from "@/components/EventItem.vue";
import UserLogin from "@/components/UserLogin.vue";
import request from "@/utils/request.js";
import { staticBaseUrl } from "@/utils/config";

// 使用store
const store = useStore();
const refUserLogin = ref(null);

// 分享配置
useShare({
  title: "全速运动 - 跑，一切活力的泉源",
  path: "/pages/index",
});

// 待执行的操作（登录成功后继续执行）
const pendingAction = ref(null);

// 登录成功回调
const onLoginSuccess = () => {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
};

const eventList = ref([]);
const offlineEventList = ref([]);
const bannerList = ref([]);
const GroupList = ref([]);
const onlineEventList = ref([]);

// 分类切换
const onEventCategoryChange = (index) => {
  eventCategoryIndex.value = index;
};

// 计算属性
const menuBtnInfo = computed(() => {
  const menuBtn = uni?.getMenuButtonBoundingClientRect?.() || {};

  return {
    top: menuBtn.top - 1 + "px",
    height: menuBtn.height + 1 + "px",
    width: menuBtn.left - 30 + "px",
    placeholder: menuBtn.top + menuBtn.height + 10 + "px",
  };
});

const userInfo = computed(() => store.state.userInfo);

const ensureLogin = (action = null) => {
  const token = uni.getStorageSync("token");
  const hasLogin = !!(token || userInfo.value.id);
  if (hasLogin) return true;

  // 保存待执行的操作
  if (action) {
    pendingAction.value = action;
  }
  openUserLogin();
  return false;
};

// 页面加载
onLoad((options) => {
  openUserLogin();
});

function openUserLogin() {
  // #ifdef MP-WEIXIN
  const envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
  if (!userInfo.value.id && envVersion === "release") {
    nextTick(() => {
      refUserLogin.value.open();
    });
  }
  // #endif
}

// 页面显示
onShow(() => {
  getBannerList();
  getGroupList();
  getEvents();
  getOnlineEvents();
});

// 方法定义
const clickSwiper = (item) => {
  if (!ensureLogin(() => clickSwiper(item))) return;

  if (
    item.id === "01KA8MPFAF0VBY1G35CVCNC1CW" ||
    item.banner_id === "01KA8MPFAF0VBY1G35CVCNC1CW"
  ) {
    // 跳转到其他小程序
    uni.navigateToMiniProgram({
      appId: "wx42a8cf3627cc70a5",
      path: "/pages/themes/t3/home/index?stage_code=xp6aC0kldn",
      extraData: {},
      envVersion: "release", // 正式版：release，开发版：develop，体验版：trial
      success: (res) => {
        console.log("跳转成功", res);
      },
      fail: (err) => {
        console.error("跳转失败", err);
        uni.showToast({
          title: "跳转失败",
          icon: "none",
          duration: 2000,
        });
      },
    });
    return;
  }

  if (item.event_id) {
    uni.$u.route(
      `pagesSub/eventDetail?id=${item.event_id}&fsc_id=${item.fsc_id || ""}`
    );
    return;
  }
  if (item.redirect_url) {
    uni.$u.route(
      `pagesSub/settings/webView?link=${encodeURIComponent(
        item.redirect_url
      )}&title=${encodeURIComponent(item.description || "全速运动")}`
    );
    return;
  }
};

const getEvents = () => {
  Promise.all([
    request.get(`/event-api/fsc_swipers?status=ACT&visibility=public`),
    request.get(`/event-api/getOfflineEventSwiper`),
  ]).then((res) => {
    const list = res.flat();
    // dirty code: 将特定 swiper 标记为跑团活动
    const targetItem = list.find(
      (item) => item.id === "01KEH51YPXSHF4QRT5C82HZFH1"
    );
    if (targetItem) targetItem.fsc_id = "dirty";
    offlineEventList.value = list;
  });
};

const getOnlineEvents = () => {
  request.get(`/event-api/getOnlineEventSwiper`).then((res) => {
    onlineEventList.value = res;
  });
};

const getBannerList = () => {
  if (!bannerList.value.length) {
    uni.showLoading({
      mask: true,
    });
  }

  Promise.all([
    request.get(`/event-api/fsc_swipers?status=ACT&visibility=public&is_top=1`),
    request.get(`/event-api/getTopSwiper`),
  ]).then((res) => {
    bannerList.value = res.flat();
  });
};

const getGroupList = () => {
  Promise.all([
    request.get(
      `/running-group/api/v1/groups/list?pageIndex=0&pageSize=5&club_type=running`
    ),
    request.get(
      `/running-group/api/v1/groups/list?pageIndex=0&pageSize=5&club_type=cycling`
    ),
  ]).then((res) => {
    console.log("GroupList res=====>", res);
    GroupList.value = res.map((i) => i.data).flat();
  });
};
</script>

<style lang="less" scoped>
.header {
  .search-box {
    position: fixed;
    top: 100rpx;
    left: 30rpx;
    width: 100%;
    padding: 0 20rpx;
    max-width: 640px !important;
    color: #999;
    background: rgba(250, 250, 250, 0.7);
    z-index: 11;
    border-radius: 36rpx 36rpx 36rpx 36rpx;
    border: 2rpx solid #f58700;
  }
}

.index-page {
  .event-swiper {
    padding: 0 34rpx;
    height: 444rpx;

    .event-swiper-item {
      padding-right: 20rpx;
    }
  }

  .section-offline {
    .poster {
      display: block;
      width: 100%;
      height: 270rpx;
      border-radius: 16rpx 16rpx 16rpx 16rpx;
    }

    .text {
      padding: 20rpx 16rpx;

      .name {
        line-height: 40rpx;
        margin-bottom: 10rpx;
      }

      .time {
        line-height: 28rpx;
        font-size: 20rpx;
      }
    }
  }

  .section-banner {
    min-height: 344rpx;
    width: 100%;
    margin: 0 auto;
    border-radius: 16rpx !important;
    overflow: hidden;

    .swiper {
      height: 344rpx;
    }

    .img {
      display: block;
      width: 100%;
      height: 344rpx;
      border-radius: 16rpx !important;
      overflow: hidden;
    }
  }
	::v-deep {
		.section-title {
			.u-cell__body {
				padding-top: 40rpx;
				padding-bottom: 40rpx;
			}
      .u-cell__title-text {
        font-weight: 800;
        font-size: 36rpx;
        color: #000000;
      }
      .uicon-arrow-right,
      .u-cell__value {
        color: #ff8c00;
      }
    }
  }
}

.section-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  min-height: 900rpx;
  padding: 0 34rpx;
}
</style>
