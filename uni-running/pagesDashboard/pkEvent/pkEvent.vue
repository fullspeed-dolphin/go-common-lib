<template>
  <view class="">
    <u-navbar :title="null" bgColor="transparent"></u-navbar>
    <section class="section-header header-bg" :style="{background:'url('+detailInfo?.background_image_url+')'}">
      <view class="status-bar flex-start">
        <view class="flex-center bar">
          <view class="status-dot"></view>
          <text class="status-text">火热报名中·{{detailInfo?.registration_end_time}}截止</text>
        </view>
      </view>

      <view class="title">{{ detailInfo?.event_name }}</view>
      <view class="subtitle">{{ detailInfo?.event_subtitle }}</view>

      <view class="start-time flex-center">
        <view class="iconfont icon-riqi u-mr-10"></view>
        <text class="time-text">{{detailInfo?.start_time}} 开跑</text>
      </view>
    </section>

    <section class="section-stats-card">
      <view class="stat-item u-flex-1 flex-col-center">
        <text class="label">奖金池</text>
        <text class="value" style="color:#E11D48;">¥{{detailInfo?.total_prize_pool}}</text>
      </view>
      <view class="stat-item u-flex-1 flex-col-center">
        <text class="label">已报名</text>
        <text class="value">{{detailInfo?.total_registrations}}</text>
      </view>
      <view class="stat-item u-flex-1 flex-col-center">
        <text class="label">天数</text>
        <text class="value">{{ detailInfo?.diffDays }}</text>
      </view>
    </section>

    <!-- 功能按钮组 -->
    <section class="section-func-buttons flex-wrap">
      <view v-if="!userStatusInfo.in_team" class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/teamForm')">
        <view class="iconfont flex-center icon-zhandui1" style="color:#FCD515;background: #FEF9C2;"></view>
        <text class="func-text">创建战队</text>
      </view>
      <view v-if="userStatusInfo.in_team" class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/teamDetail?teamId='+userStatusInfo.team_info?.id)">
        <view class="iconfont flex-center icon-zhandui1" style="color:#FCD515;background: #FEF9C2;"></view>
        <text class="func-text">进入战队</text>
      </view>
      <view class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/teamList')">
        <view class="iconfont flex-center icon-list-1-copy" style="color:#155DFC;background: #DBEAFE;"></view>
        <text class="func-text">战队列表</text>
      </view>
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/activeRule')">
        <view class="iconfont flex-center icon-huodongguize" style="color:#FC9C15;background: #FEE8C2;"></view>
        <text class="func-text">活动规则</text>
      </view>
      <view class="func-item flex-col-center" @click="goto('/pagesSport/punchInUpload')">
        <view class="iconfont flex-center icon-lijidaka" style="color:#8515FC;background: #EBDBFE;"></view>
        <text class="func-text">立即打卡</text>
      </view>
      <!-- <view class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/pkRankList')">
			  <view class="iconfont flex-center icon-zhengshu" style="color:#EE2061;background: #FEDBE6;"></view>
			  <text class="func-text">完赛证书</text>
			</view> -->
      <view class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/pkRankList')">
        <view class="iconfont flex-center icon-paihangbang" style="color:#FC9C15;background: #FEE8C2;"></view>
        <text class="func-text">排行榜</text>
      </view>
    </section>
    <!-- 排行榜 -->
    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
          <view v-for="(item, index) in tabList" :key="item.value" :id="'tab-' + index" class="tag-item" :class="{ active: currentIndex === index }" @click="handleTabChange(item, index)">
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <view class="rank-list" @touchstart="onTouchStart" @touchend="handleTouchEnd">
      <!-- 个人排行榜 -->
      <template v-if="currentIndex === 0">
        <view v-for="(item, index) in rankList" :key="item.wechat_openid" class="rank-item">
          <view class="rank-number flex-center">
            {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
          </view>
          <image :src="item.avatar_url" class="user-avatar" />
          <view class="user-info">
            <view class="user-name">{{ item.real_name }}</view>
            <view class="user-detail u-flex-y-center">
              {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.team_name }}</view>
            </view>
            <view class="user-time">{{ item.total_sessions }}次</view>
          </view>
          <view class="progress">
            <text class="progress-percent"><text style="font-size:36rpx;">{{ item.total_distance_km }}</text>km</text>
          </view>
        </view>
      </template>
      <!-- 战队排行榜 -->
      <template v-else>
        <view v-for="(item, index) in rankList" :key="item.id" class="rank-item">
          <view class="rank-number flex-center">
            {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
          </view>
          <image :src="item.team_avatar_url" class="user-avatar" />
          <view class="user-info">
            <view class="user-name">{{ item.team_name }}</view>
            <view class="user-detail u-flex-y-center">
              组别 {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.current_members }}人</view>
            </view>
            <view class="user-time">完成率 {{ item.team_completion_rate }}%</view>
          </view>
          <view class="progress">
            <text class="progress-percent"><text style="font-size:36rpx;">{{ item.team_goal_km }}</text>km</text>
          </view>
        </view>
      </template>
      <view v-if="!rankList.length"><u-empty mode="data" text="暂无数据">
        </u-empty></view>
    </view>

    <view v-if="!userStatusInfo.in_team" class="join-btn-wrapper">
      <u-button class="join-btn" color="linear-gradient(64deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%)"
        customStyle="width: 686rpx;height: 96rpx;border-radius: 999rpx;letter-spacing: 1px;font-size: 34rpx;" :disabled="detailInfo?.status !== 'act'" @click="onceJoin()">
        立即报名参赛
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import { useTabAnimation } from "@/composables/useTabAnimation.js"; 

const activetyId = ref("");
const detailInfo = ref(null);


const init = () => {
  request
    .get(`/event-api/online_events/${activetyId.value}`)
    .then((res) => {
      let date2 = dayjs(res.end_time).format("YYYY-MM-DD");
      let date1 = dayjs(res.start_time).format("YYYY-MM-DD");
      
      res = {
        ...res,
        diffDays: dayjs(date2 + "").diff(date1 + "", "day"),
        registration_end_time: dayjs(res.registration_end_time).format("M月D日"),
        start_time: dayjs(res.start_time).format("M月D日"),
        total_registrations: formatNumber(res.total_registrations),
        status: res.status.toLowerCase(),
      }

      detailInfo.value = res;
    });
};

const userStatusInfo = ref({});
function getUserStatus() {
  request.get("/event-api/online_events_team/user_status?event_id=" + activetyId.value).then((res) => {
    console.log('userStatus', res)
    userStatusInfo.value = res;
  });
}

// 数字格式化
const formatNumber = (num) => {
  let [integerPart, decimalPart] = String(num).split(".");
  integerPart = integerPart.split("").reverse().join("");
  integerPart = integerPart.match(/\d{1,3}/g).join(",");
  integerPart = integerPart.split("").reverse().join("");
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

// 立即报名
const onceJoin = () => {
  if (!userStatusInfo.value.in_team) {
    uni.$u.toast("请先加入战队");
    uni.$u.route("pagesDashboard/pkEvent/teamList", { id: activetyId.value });
    return;
  }
  uni.$u.route("pagesDashboard/pkEvent/pkEventForm", { id: activetyId.value });
};

// 跳转
const goto = (url) => {
  if (detailInfo?.status !== "act") {
    // return uni.$u.toast('活动未开始');
  }
  uni.$u.route(url, { id: activetyId.value });
};

onLoad((options) => {
  console.log(options);
  activetyId.value = options.id || "01KH0WQX4H2C7Q4GJ217P8T922";
  init();
  initTabRects();
  getUserStatus();
  getRankList(0, activetyId.value);
});

// Tab 配置
const tabList = ref([
  {
    label: "个人排行榜",
    value: "",
  },
  {
    label: "战队排行榜",
    value: "SUCC",
  },
]);
// 使用 Tab 动画 composable
const {
  currentIndex,
  sliderStyle,
  sliderAnimClass,
  listAnimClass,
  changeTab,
  initTabRects,
  onTouchStart,
  onTouchEnd,
} = useTabAnimation({
  tabCount: tabList.value.length,
  loop: true,
});
// 当前选中的 tab
const curTab = computed(() => tabList.value[currentIndex.value]);
// 手势切换处理
const handleTouchEnd = (e) => {
  onTouchEnd(e, tabList.value);
};
// Tab 切换处理
const handleTabChange = (item, index) => {
  if (currentIndex.value === index) return;
  changeTab(index);
};
// 排行榜数据
const rankList = ref([]);
let rankRequestId = 0;

watch(currentIndex, (val) => {
  getRankList(val, activetyId.value);
});

// 排行榜type 0个人 1战队,id是event_id
const getRankList = (type, id) => {
  rankList.value = [];
  const reqId = ++rankRequestId;
  let url = !type
    ? "/event-api/ranking/personal?event_id=" + id
    : "/event-api/ranking/team?event_id=" + id;
  request.get(url).then((res) => {
    if (reqId !== rankRequestId) return;
    rankList.value = res || [];
  });
};
</script>

<style lang="scss" scoped>
.header-bg {
  color: white;
  padding: 220rpx 64rpx 70rpx;
  position: relative;
  z-index: 1;
  background: linear-gradient(
    226deg,
    #c70036 0%,
    #d2003c 20%,
    #dd0043 40%,
    #e90249 60%,
    #f41450 80%,
    #ff2056 100%
  );
  min-height: 512rpx;
}

.status-bar {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 26rpx;
  .bar {
    height: 48rpx;
    padding: 0 10rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx 20rpx 20rpx 20rpx;
  }
  .status-dot {
    width: 32rpx;
    height: 32rpx;
    background: #05df72;
    border-radius: 50%;
    margin-right: 5rpx;
  }
}

.section-header {
  .title {
    font-size: 60rpx;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 20rpx;
  }

  .subtitle {
    font-size: 36rpx;
    color: #ffe4e6;
    line-height: 50rpx;
    margin-bottom: 50rpx;
  }

  .start-time {
    width: 242rpx;
    height: 62rpx;
    color: #fff;
    background: #b72550;
    border-radius: 20rpx 20rpx 20rpx 20rpx;
  }
}

.section-stats-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  width: 686rpx;
  margin: 0 auto;
  transform: translateY(-30rpx);
  position: relative;
  z-index: 10;
  box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.02);
  display: flex;

  .stat-item {
    text-align: center;
    height: 96rpx;
    border-right: 1rpx solid #f3f4f6;
    &:last-child {
      border: 0;
    }
  }
  .label {
    font-size: 24rpx;
    color: #64748b;
    margin-bottom: 8rpx;
  }
  .value {
    font-size: 40rpx;
    font-weight: bold;
    color: #1e2939;
    line-height: 60rpx;
  }
}

/* 功能按钮组 */
.section-func-buttons {
  display: flex;
  padding: 40rpx 30rpx;
  background-color: white;
  border-radius: 24rpx;
  margin: 0 30rpx 30rpx;
  font-weight: 500;
  color: #364153;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  .func-item {
    padding: 20rpx 0rpx;
    width: 155rpx;
    text-align: center;
  }
  .iconfont {
    width: 80rpx;
    height: 80rpx;
    font-size: 40rpx;
    background: #fef9c2;
    border-radius: 32rpx;
    margin-bottom: 26rpx;
  }
}

// 排行榜样式
.tab-container {
  display: flex;
  justify-content: center;
  margin: 20rpx 30rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  border-bottom: 2rpx solid transparent;
}

.tab-item.active {
  color: #e12a48;
  border-bottom: 2rpx solid #e12a48;
}

.rank-list {
  margin: 0 30rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  margin: 10rpx 0;
  width: 686rpx;
  height: 144rpx;
  background: #ffffff;
  box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.01);
  border-radius: 32rpx 32rpx 32rpx 32rpx;

  &:nth-child(1) {
    .rank-number {
      color: #fdc700;
    }
  }

  &:nth-child(2) {
    .rank-number {
      color: #90a1b9;
    }
  }

  &:nth-child(3) {
    .rank-number {
      color: #ff8904;
    }
  }
  .group-tag {
    font-weight: 500;
    font-size: 16rpx;
    color: #155dfc;
    height: 32rpx;
    padding: 0 10rpx;
    margin-left: 10rpx;
    background: #eff6ff;
    border-radius: 12rpx 12rpx 12rpx 12rpx;
  }
  .rank-number {
    width: 96rpx;
    font-family: Inter, Inter;
    font-size: 24rpx;
    font-weight: bold;
    color: #acacac;
    text-align: center;
  }

  .user-avatar {
    margin-right: 26rpx;
    width: 96rpx;
    height: 96rpx;
    border-radius: 14rpx 14rpx 14rpx 14rpx;
    background: #f5f5f5;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    line-height: 42rpx;
    font-weight: bold;
    font-size: 28rpx;
    color: #1e2939;
  }

  .user-detail {
    font-size: 24rpx;
    color: #5c626f;
    margin-bottom: 8rpx;
  }

  .user-time {
    font-size: 20rpx;
    color: #e11d48;
  }

  .progress {
    font-size: 28rpx;
    color: #e12a48;
    font-weight: bold;
    margin-left: 20rpx;
    padding-right: 20rpx;
  }
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
    color: #e11d48;
    line-height: 40rpx;
    width: 336rpx;
    white-space: nowrap;
    transition: color 0.3s ease;
    font-weight: bold;
    text-align: center;

    &.active {
      color: #e11d48;
    }
  }
}

.join-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 54rpx;
  z-index: 10;
}
</style>