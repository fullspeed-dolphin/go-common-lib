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
                src="/static/images/coin@2x.png"
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
    <view class="content" style="position: relative">
      <view class="section-banner">
        <swiper
          class="swiper"
          circular
          indicator-dots
          indicator-active-color="#FF8C00"
          :autoplay="true"
          :interval="3000"
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

      <view class="section-title">线下活动</view>
      <swiper
        class="event-swiper"
        circular
        indicator-active-color="#FF8C00"
        :autoplay="true"
        :interval="3000"
      >
        <swiper-item v-for="(item, index) in bannerEventList" :key="index">
          <section
            class="section-offline"
            :key="index"
            @click="$u.route(`pagesSub/offlineEvents?id=${item.event_id}`)"
          >
            <!-- <image class="poster" :src="item.background_image_url" mode="aspectFill"></image> -->
            <view class="section-banner">
              <image
                class="img"
                :src="item.image_url"
                mode="aspectFill"
              ></image>
            </view>
            <view class="flex-start">
              <view class="flex-1 ofh text">
                <view class="name ellipsis">{{ item.description }}</view>
                <view class="time">{{ item.event_time }}</view>
              </view>

              <u-button
                type="primary"
                textColor="#fff"
                size="small"
                shape="circle"
              >
                <block v-if="item.status === 'PND'">未开始</block>
                <block v-if="item.status === 'ACT'">报名</block>
                <block v-if="item.status === 'EXP'">查看详情</block>
              </u-button>
            </view>
          </section>
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

      <view
        class="section-title flex-between-center"
        @click="$u.route('pagesSub/groupList')"
      >
        跑团招募
        <view class="flex-start">
          <view class="txt">更多</view>
          <u-icon
            name="arrow-right"
            size="34rpx"
            color="rgba(0,0,0,.9)"
          ></u-icon>
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
import Navbar from "@/components/navbar.vue";

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

// 页面加载
onLoad((options) => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu();
  // #endif
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
    bannerEventList.value = res;
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
</script>

<style lang="less" scoped>
.index-page {
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 288rpx;
    background: linear-gradient(180deg, #ff8c00 0%, #fafafa 100%);
    z-index: 11;
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 34rpx;
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
          align-items: center;
          justify-content: space-between;
          gap: 10rpx;
          .nickname {
            font-size: 34rpx;
            font-weight: bold;
          }
          .money {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .img {
              width: 34rpx;
              height: 34rpx;
            }
          }
        }
      }
      .search-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20rpx;
        ::v-deep {
          .u-search {
            width: 342rpx;
            height: 72rpx;
          }
        }
        .message {
          .img {
            width: 58rpx;
            height: 48rpx;
          }
        }
      }
    }
  }
  .content {
    margin-top: 320rpx;
  }

  .event-swiper {
    height: 360rpx;
  }
  .radius999 {
    border-radius: 999em !important;
  }
  .section-offline {
    padding: 0 34rpx;
    .poster {
      display: block;
      width: 682rpx;
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
    ::v-deep {
      .u-button--disabled {
        // color: #707070!important;
      }
    }
  }

  .section-banner {
    min-height: 270rpx;
    width: 682rpx;
    margin: 0 auto;
    border-radius: 16rpx !important;
    overflow: hidden;

    .swiper {
      height: 270rpx;
    }
    .img {
      display: block;
      width: 100%;
      height: 270rpx;
      border-radius: 16rpx !important;
      overflow: hidden;
    }
  }
  .section-title {
    margin: 50rpx 0 30rpx;
    position: relative;
    font-weight: bold;
    font-size: 34rpx;
    color: #000000;
    padding-left: 78rpx;
    line-height: 48rpx;
    padding-right: 34rpx;
    &:before {
      position: absolute;
      content: "";
      left: 0;
      width: 58rpx;
      height: 48rpx;
      background: linear-gradient(90deg, #ffffff 0%, #ff8c00 100%);
    }
    .txt {
      font-size: 28rpx;
      font-weight: 400;
    }
  }
}
</style>
