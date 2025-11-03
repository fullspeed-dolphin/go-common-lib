<template>
  <view class="index-page">
    <view class="header">
      <u-navbar
        className="navbar"
        autoBack
        title="跑了没"
        :leftIcon="false"
        bgColor="transparent"
        placeholder
      ></u-navbar>
      <view class="header-content">
        <view class="user">
          <image
            class="avatar"
            :src="userInfo.avatar_url || '../static/run.png'"
            mode="aspectFill"
          ></image>
          <view class="user-info">
            <view class="nickname">{{ userInfo.nickname || "微信用户" }}</view>
            <view class="money"
              ><image
                class="img"
                src="/static/images/icon-coin@2x.png"
                mode="aspectFill"
              ></image>
              0</view
            >
          </view>
        </view>
        <view class="search-box">
          <u-search
            class="search"
            :disabled="true"
            placeholder=""
            shape="round"
            bgColor="#fff"
            :showAction="false"
            @click="$u.route('pagesSub/groupList')"
          ></u-search>
          <view class="message">
            <image
              class="img"
              src="/static/images/message@2x.png"
              mode="aspectFill"
            ></image>
          </view>
        </view>
      </view>
    </view>
    <view
      class="content"
      :style="{ paddingTop: `${contentPaddingTop}rpx`, position: 'relative' }"
    >
      <view class="section-banner">
        <swiper
          class="swiper"
          circular
          indicator-dots
          indicator-active-color="#FF8C00"
          :autoplay="true"
          :interval="3000"
          :previous-margin="12"
          :next-margin="12"
        >
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <image
              class="img"
              :src="item.image_url"
              mode="aspectFill"
              @click="clickSwiper(item)"
            ></image>
          </swiper-item>
        </swiper>
      </view>
      <view class="menu">
        <view class="menu-item" v-for="(item, index) in menus" :key="index">
          <image
            class="menu-item-icon"
            :src="item.icon"
            mode="aspectFill"
          ></image>
          <view class="menu-item-title">{{ item.title }}</view>
        </view>
      </view>

      <view class="section-title">
        <view class="section-title-left">线下活动</view>
        <view class="section-title-right">
          <view class="section-title-right-item">查看更多</view>
          <u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
        </view>
      </view>
      <swiper
        class="event-swiper"
        circular
        indicator-active-color="#FF8C00"
        :autoplay="true"
        :interval="3000"
        :display-multiple-items="1.2"
      >
        <swiper-item v-for="(item, index) in bannerEventList" :key="index">
          <view class="event-swiper-item">
            <EventItem :item="item" :key="index" height="514rpx" />
          </view>
        </swiper-item>
      </swiper>

      <view class="section-title">
        <view class="section-title-left">线上赛事</view>
        <view class="section-title-right">
          <view class="section-title-right-item">查看更多</view>
          <u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
        </view>
      </view>
      <swiper
        class="event-swiper"
        circular
        indicator-active-color="#FF8C00"
        :autoplay="true"
        :interval="3000"
        :display-multiple-items="1.2"
      >
        <swiper-item v-for="(item, index) in bannerEventList" :key="index">
          <view class="event-swiper-item">
            <EventItem :item="item" :key="index" height="514rpx" />
          </view>
        </swiper-item>
      </swiper>

      <!-- <view class="section-title">线上赛事</view>
			<section class="section-offline"  @click="$u.route('pagesSub/offlineEvents')">
				<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				<view class="flex-start">
					<view class="text">
						<view class="name ellipsis">奔跑吧！广州·增城站奔跑吧！广州·增城站广州·增城站</view>
						<view class="time">2025.10.26 8:00</view>
					</view>
					<u-button type="primary" size="small" shape="circle" disabled color="#f4f4f4" text="未开始"></u-button>
				</view>
			</section> -->

      <view class="section-title">
        <view class="section-title-left">跑团风采</view>
        <view class="section-title-right">
          <view class="section-title-right-item">查看更多</view>
          <u-icon name="arrow-right" size="24rpx" color="#ff8c00"></u-icon>
        </view>
      </view>
      <section class="section-group">
        <GroupItem
          :item="item"
          v-for="(item, index) in GroupList"
          :key="index"
        />
      </section>

      <!-- <view class="section-title flex-between-center">
				名人达人
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<view class="group-item flex-start" v-for="(item,index) in 3" :key="index">
					<image class="poster radius999" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
					<view class="text">
						<view class="flex-between-center" style="width: 520rpx;">
							<view class="">
								<view class="name ellipsis">昵称</view>
								<view class="city ellipsis">广东广州</view>
							</view>
							<u-button type="primary" size="small" shape="circle" text="关注"></u-button>
						</view>
						<view class="desc ellipsis" style="color:#333;">全国跑友一家亲，SEA跑团来相聚。生命不息，跑···</view>
					</view>
				</view>
			</section> -->
    </view>

    <tabbar type="index" />
  </view>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import { useStore } from "vuex";
import tabbar from "@/components/tabBar.vue";
import GroupItem from "@/components/GroupItem.vue";
import EventItem from "@/components/EventItem.vue";

// 使用store
const store = useStore();

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 响应式数据
const searchTxt = ref("");
const eventList = ref([]);
const bannerEventList = ref([]);
const bannerList = ref([]);
const GroupList = ref([]);

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// 计算 header 高度和 content padding
const headerHeight = ref(196); // navbar placeholder 88 + header-content 90 + 18 = 196
const contentPaddingTop = computed(() => headerHeight.value + 30);

// 页面加载
onLoad((options) => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu();
  // #endif

  // 动态计算 header 高度
  setTimeout(() => {
    uni
      .createSelectorQuery()
      .select(".header")
      .boundingClientRect((rect) => {
        console.log(rect, "header rect");
        if (rect && rect.height) {
          // px 转 rpx: rpx = px * (750 / windowWidth)
          const systemInfo = uni.getSystemInfoSync();
          const pxRatio = 750 / systemInfo.windowWidth;
          headerHeight.value = rect.height * pxRatio;
        }
      })
      .exec();
  }, 0);
});

// 页面显示
onShow(() => {
  getGroupList();
  getEvents();
  getBannerList();
});

// 方法定义
const clickSwiper = (item) => {
  if (item.event_id) {
    uni.$u.route(`pagesSub/offlineEvents?id=${item.event_id}`);
    return;
  }
  if (item.redirect_url) {
    uni.$u.route(`pagesSub/settings/webView?link=${item.redirect_url}`);
    return;
  }
  // uni.$u.route(`pagesSub/settings/webView?link=https://mp.weixin.qq.com/s/oNW0UYJCb78zrmzyoY0_Mg?token=1740573090&lang=zh_CN`)
};

const confirmSearch = () => {
  const searchTxtValue = searchTxt.value.trim();
};

const routeTo = (link) => {
  console.log(link);
  uni.$u.route(link);
};

const getEvents = () => {
  proxy.$axios.get(`/event-api/getOfflineEventSwiper`).then((res) => {
    bannerEventList.value = [...res, ...res, ...res];
    uni.hideLoading();
  });
};

const getBannerList = () => {
  if (!bannerList.value.length) {
    uni.showLoading({ mask: true });
  }

  proxy.$axios.get(`/event-api/getTopSwiper`).then((res) => {
    bannerList.value = res;
    uni.hideLoading();
  });
};

const getGroupList = () => {
  const data = {
    pageIndex: 0,
    pageSize: 5,
    keyword: "",
  };
  proxy.$axios.get(`/running-group/api/v1/groups/list`, data).then((res) => {
    GroupList.value = res.data;
  });
};

const menus = ref([
  {
    icon: "/static/images/华为运动健康@2x.png",
    title: "线上赛事",
    url: "pagesSub/groupList",
  },
  {
    icon: "/static/images/华为运动健康@2x.png",
    title: "跑团风采",
    url: "pagesSub/groupList",
  },
  {
    icon: "/static/images/华为运动健康@2x.png",
    title: "最美跑者",
    url: "pagesSub/groupList",
  },
  {
    icon: "/static/images/华为运动健康@2x.png",
    title: "全速天使",
    url: "pagesSub/groupList",
  },
]);
</script>

<style lang="less" scoped>
.index-page {
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(180deg, #ff8c00 0%, #fafafa 100%);
    z-index: 11;
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 34rpx 18rpx 34rpx;
      .user {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10rpx;
        .avatar {
          width: 90rpx;
          height: 90rpx;
          border-radius: 50%;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10rpx;
          .nickname {
            font-size: 24rpx;
            font-weight: bold;
          }
          .money {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 800;
            font-size: 32rpx;
            .img {
              width: 44rpx;
              height: 38rpx;
            }
          }
        }
      }
      .search-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 28rpx;
        ::v-deep {
          .u-search {
            width: 342rpx;
            height: 72rpx;
          }
          .u-search__content {
            width: 342rpx;
            height: 72rpx;
          }
        }
        .message {
          .img {
            width: 48rpx;
            height: 42rpx;
          }
        }
      }
    }
  }
  .content {
    background: #fafafa;
  }

  .event-swiper {
    padding: 0 34rpx;
    height: 514rpx;
    background: #fafafa;
    .event-swiper-item {
      padding-right: 20rpx;
    }
  }
  .radius999 {
    border-radius: 999em !important;
  }
  .section-offline {
    .poster {
      display: block;
      width: 100%;
      height: 270rpx;
      background: #f5f5f5;
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
    // ::v-deep {
    //   .u-button--disabled {
    //     color: #707070!important;
    //   }
    // }
  }

  .section-banner {
    min-height: 270rpx;
    width: 100%;
    margin: 0 auto;
    border-radius: 16rpx !important;
    overflow: hidden;

    .swiper {
      height: 270rpx;
    }
    .img {
      display: block;
      width: calc(100% - 24rpx);
      height: 270rpx;
      border-radius: 16rpx !important;
      overflow: hidden;
      margin: 0 12rpx;
    }
  }
  .section-title {
    margin: 40rpx 0;
    padding: 0 34rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    font-weight: 800;
    font-size: 40rpx;
    color: #000000;
    line-height: 48rpx;
    .txt {
      font-size: 28rpx;
      font-weight: 400;
    }
    .section-title-right {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10rpx;
      .section-title-right-item {
        font-size: 28rpx;
        color: #ff8c00;
      }
    }
  }
}
.menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 34rpx;
  margin-top: 40rpx;
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    .menu-item-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }
    .menu-item-title {
      font-weight: 800;
      font-size: 28rpx;
      color: #000000;
    }
  }
}
.section-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
