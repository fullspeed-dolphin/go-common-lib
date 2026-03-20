<template>
  <view class="page">
    <u-navbar autoBack placeholder  title="战队列表" />
    <section class="section-header flex-col-center ">
      <view class="section-search u-mb-20" style="width:686rpx;">
        <u-search v-model="searchTxt" @search="refreshList" placeholder="输入战队名称" shape="round" bgColor="#f5f5f5" borderColor="#f5f5f5" :showAction="false"></u-search>
      </view>
      <!-- 分类标签 -->
      <view class="tab-container">
        <view class="category-tags">
          <view class="tags-inner">
            <view v-for="(item, index) in tabList" :key="item.value" :id="'tab-' + index" class="tag-item" :class="{ active: currentIndex === index }" @click="changeTab(index)">
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
    </section>

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="80">
        <view class="order-list">
          <view class="team-card" v-for="(item, index) in dataList" :key="index" @click="joinTeam(item)">
            <!-- <image :src="item.team_avatar_url" class="avatar" /> -->
            <div class="avatar">
              <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
								(item.team_avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
							" mode="aspectFill" />
            </div>
            <view class="content">
              <view class="title">{{ item.team_name }}</view>
              <view class="subtitle">{{ item.team_goal_km }} KM | {{item.current_members}}人</view>
              <view class="leader">队长：{{ item.leader_nickname }}</view>
            </view>

            <view class="join-btn flex-center" @click.stop="goToSignEvent(item)">
              加入
            </view>
          </view>
        </view>
      </mescroll-body>
    </view>

    <view v-if="!userStatusInfo.in_team" class="create-team-wrapper flex-center">
      <u-button class="create-team-btn"
        color="#ff5c5c"
        customStyle="width: 686rpx;height: 96rpx;border-radius: 999rpx;font-size: 34rpx;letter-spacing: 1px;"
        @click="$u.route('pagesDashboard/pkEvent/teamForm', { id: activetyId })">
        创建战队
      </u-button>
    </view>
    <view v-else-if="!hasSignedUp" class="create-team-wrapper flex-center">
      <u-button class="create-team-btn"
        color="#ff5c5c"
        customStyle="width: 686rpx;height: 96rpx;border-radius: 999rpx;font-size: 34rpx;letter-spacing: 1px;"
        @click="goToSignEvent()">
        立即报名参赛
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { onLoad, onShow, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import request from "@/utils/request.js";
const activetyId = ref(""); // 活动ID
const searchTxt = ref("");
const { mescrollInit, downCallback, getMescroll } = useMescroll(
  onPageScroll,
  onReachBottom
);

const userStatusInfo = ref({});
function getUserStatus() {
  request
    .get(
      "/event-api/online_events_team/user_status?event_id=" + activetyId.value
    )
    .then((res) => {
      console.log("userStatus", res);
      userStatusInfo.value = res;
    });
}

const myEvents = ref([]);
const hasSignedUp = computed(() => {
  return myEvents.value?.some((i) => i.event_id === activetyId.value);
});
function getMyEvents() {
  request.get("/event-api/online_events/my_events").then((res) => {
    myEvents.value = res;
  });
}

function joinTeamAPi(item) {
	/*console.log("joinTeamAPi", item);
	 uni.showLoading({ mask: true });
  request
    .post("/event-api/online_events_team/join", {
			event_id: activetyId.value,
			team_id: item.id,
    })
    .then(() => {
				getUserStatus();
				uni.$u.toast("成功加入战队, 准备跳转到活动报名页...", 2000, function success() {
					goToSignEvent();
				});
    })
    .catch((e) => {
      console.log("e", e);
    }); */
}

function joinTeam(item) {
  /* if (!userStatusInfo.value.in_team) {
    uni.showModal({
      title: "提示",
      content: "确定加入该战队吗？",
      success: (res) => {
        if (res.confirm) {
					joinTeamAPi(item)
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
    return;
  } */
  uni.$u.route(`pagesDashboard/pkEvent/teamDetail?id=${item.id}&eventId=${activetyId.value}`);
}
function joinTeamToSign(item) {
  uni.$u.route(`pagesDashboard/pkEvent/pkEventForm?id=${item.id}&eventId=${activetyId.value}`);
}

function goToSignEvent(item) {
	uni.$u.route("pagesDashboard/pkEvent/packageList", { 
    id: activetyId.value,
    eventId: activetyId.value,
    teamId: item?.id || "",
  });
}

// Tab 配置
const currentIndex = ref(0);
const tabList = ref([
  { label: "5.20KM", value: "" },
  { label: "3.14KM", value: "SUCC" },
]);

const changeTab = (index) => {
  currentIndex.value = index
  refreshList();
};

const refreshList = () => {
  getMescroll().resetUpScroll();
  getMescroll().scrollTo(0, 0);
};

const dataList = ref([]);
const getList = (mescroll) => {
  uni.showLoading({ mask: true });
  const data = {
    page_index: mescroll.num - 1,
    page_size: 10,
    team_goal_km: parseFloat(currentIndex.value ? "3.14KM" : "5.20KM"),
    team_name: searchTxt.value,
  };

  request
    .get(`/event-api/online_events_team?event_id=${activetyId.value}`, data)
    .then((res) => {
      const list = res?.list || [];
      mescroll.endSuccess(list.length, list.length >= 10);

      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(list);
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};


onLoad((options) => {
  activetyId.value = options.id;
  getUserStatus();
  getMyEvents();
});

const isFirstShow = ref(true);
onShow(() => {
  if (isFirstShow.value) {
    isFirstShow.value = false;
    return;
  }
  refreshList();
  getUserStatus();
  getMyEvents();
});

defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}
.section-header {
  position: fixed;
  width: 100%;
  z-index: 10;
  top: 50px;
  padding: 16rpx 24rpx;
  background: #fff;
}

.category-tags {
  .tags-inner {
    display: inline-flex;
    position: relative;
    gap: 12rpx;
    padding: 6rpx;
    background: #fff;
    border-radius: 999rpx;
  }

  .tag-slider {
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    height: calc(100% - 12rpx);
    background: #f3f4f6;
    border-radius: 999rpx;
    transition: transform 0.3s ease-out, width 0.3s ease-out;
    z-index: 0;

    &.no-transition {
      transition: none !important;
    }

    &.slider-hidden {
      opacity: 0;
    }
  }

  .tag-item {
    position: relative;
    z-index: 1;
    padding: 12rpx 24rpx;
    font-size: 28rpx;
    color: #999;
    background: #f5f5f5;
    line-height: 40rpx;
    width: 336rpx;
    white-space: nowrap;
    transition: color 0.3s ease;
    font-weight: bold;
    text-align: center;
    border-radius: 999rpx;
    &.active {
      color: #fff;
      background: #ff5c5c;
    }
  }
}

.content-wrapper {
  padding-top: 100rpx;
}

.order-list {
  padding: 16rpx 0;
}

.order-no {
  font-size: 26rpx;

  .txt {
    background: #1989fa;
    border-radius: 99rpx;
    color: #fff;
    padding: 5rpx 10rpx;
    font-size: 20rpx;
  }

  .copy {
    width: 28rpx;
    height: 28rpx;
    margin-left: 5rpx;
    margin-top: -3rpx;
  }
}

.team-card {
  display: flex;
  align-items: center;
  width: 686rpx;
  background: #ffffff;
  margin: 20rpx auto;
  padding: 20rpx 24rpx;
  box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.01);
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  .avatar {
    width: 110rpx;
    height: 110rpx;
    border-radius: 14rpx 14rpx 14rpx 14rpx;
    margin-right: 26rpx;
  }

  .content {
    flex: 1;
  }

  .title {
    font-size: 32rpx;
    color: #1e2939;
    font-weight: 500;
    margin-bottom: 8rpx;
  }

  .subtitle {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
  }

  .leader {
    font-size: 24rpx;
    color: #999;
  }

  .join-btn {
    width: 180rpx;
    height: 64rpx;
    color: #fff;
    font-weight: bold;
    font-size: 26rpx;
    color: #ffffff;
    background: #ff5c5c;
    border-radius: 999rpx;
  }
}

.create-team-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 0rpx;
  z-index: 10;
}
</style>
