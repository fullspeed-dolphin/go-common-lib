<template>
  <view :style="themeStyle">
		<mescroll-body ref="mescrollRef" @init="mescrollInit" :down="{ use: false }" @down="downCallback" @up="getList" :top="0">
    <u-navbar autoBack placeholder :title="detailInfo?.event_name || '活动详情'"></u-navbar>
    <section class="flex-center" style="height: 512rpx;filter1: blur(10px);">
      <image class="img" style="width:750rpx;height:512rpx;" :src="
          (detailInfo?.background_image_url)  + '?x-oss-process=image/resize,w_750,h_500,m_fill'
        " mode="aspectFill"></image>
    </section>

    <section class="section-header header-bg" style="margin-top: -372rpx;">
      <view class="status-bar" style="display:flex;justify-content:flex-end;">
        <view v-if="hasSignedUp"
          style="color:#fff;font-size: 32rpx;font-weight: bold;background: rgba(25, 190, 107, .9);padding: 16rpx 32rpx; border-radius: 32rpx 0 0 32rpx;"
          class="rule-link flex-center">
          已报名
        </view>
      </view>

      <div style="background: rgba(255,255,255,1); box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.02);border-radius: 24rpx;margin: 94rpx 30rpx 10rpx;padding: 30rpx;">
        <view class="title" style="color: #222">{{ detailInfo?.event_name }}</view>
        <view class="subtitle">{{ detailInfo?.event_subtitle }}</view>

        <view style="display:flex;align-items:center;justify-content:space-between;font-size:24rpx;">
          <view v-if="detailInfo?.event_description" class="start-time flex-center" :style="{ background: `linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})` }" style="margin:0;width:auto;padding: 0 24rpx;">
            <text style="margin-right:8rpx;">🔥</text>
            <text class="time-text">{{detailInfo?.event_description}}</text>
          </view>
          <view class="start-time flex-center" style="margin:0;" :style="{ background: `linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})` }">
            <view class="iconfont icon-riqi u-mr-10"></view>
            <text class="time-text">{{detailInfo?.start_time}} 开跑</text>
          </view>
        </view>
        <section class="section-stats-card" style="margin-top: 30rpx;">
          <!-- <view class="stat-item u-flex-1 flex-col-center">
            <text class="label">奖金池</text>
            <text class="value" style="color:#ff5c5c;">¥{{detailInfo?.total_prize_pool}}</text>
          </view> -->
          <view class="stat-item u-flex-1 flex-col-center">
            <text class="label">已报名</text>
            <text class="value">{{detailInfo?.total_registrations}}</text>
          </view>
          <view class="stat-item u-flex-1 flex-col-center">
            <text class="label">战队总数</text>
            <text class="value">{{detailInfo?.total_teams}}</text>
          </view>
          <view class="stat-item u-flex-1 flex-col-center">
            <text class="label">天数</text>
            <text class="value">{{ detailInfo?.diffDays }}</text>
          </view>
        </section>
      </div>
    </section>

    <!-- 功能按钮组 -->
    <section class="section-func-buttons flex-wrap">
      <view v-if="!userStatusInfo.in_team" class="func-item flex-col-center" @click="createTeam">
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
      <view class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/pkRankList')">
        <view class="iconfont flex-center icon-paihangbang" style="color:#FC9C15;background: #FEE8C2;"></view>
        <text class="func-text">排行榜</text>
      </view>

      <!-- <view class="func-item flex-col-center" @click="goto('/pagesSport/punchInUpload')">
        <view class="iconfont flex-center icon-lijidaka" style="color:#8515FC;background: #EBDBFE;"></view>
        <text class="func-text">立即打卡</text>
      </view> -->
      <!-- <view class="func-item flex-col-center" @click="goto('pagesDashboard/pkEvent/pkRankList')">
			  <view class="iconfont flex-center icon-zhengshu" style="color:#EE2061;background: #FEDBE6;"></view>
			  <text class="func-text">完赛证书</text>
			</view> -->
    </section>

    <view v-if="userStatusInfo.in_team && hasSignedUp" class="section-btn flex-center" @click="goto('/pagesSport/punchInUpload')">
    	<view class="iconfont flex-center icon-lijidaka u-mr-10" style="color:#fff;font-size:42rpx;"></view>
    	立即打卡
    </view>

    <PersonalRecord v-if="userStatusInfo.in_team" :activetyId="activetyId" />
		
    <!-- 排行榜 -->
    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view v-for="(item, index) in tabList" :key="item.value" class="tag-item" :class="{ active: tabIndex === index }" @click="changeTab(index)">
            {{ item.label }}
          </view>
        </view>
      </view>
      <!-- 个人排序开关(仅在个人榜时显示) -->
      <view v-if="tabIndex === 0" class="sort-switch u-mt-20">
        <view class="sort-btn" :class="{ active: personalSortBy === 'distance' }" @click="switchPersonalSort('distance')">跑量排行</view>
        <view class="sort-btn" :class="{ active: personalSortBy === 'completion' }" @click="switchPersonalSort('completion')">完成率排行</view>
      </view>
      <!-- 战队排序开关(仅在战队榜时显示) -->
      <view v-if="tabIndex === 1" class="sort-switch u-mt-20">
        <view class="sort-btn" :class="{ active: teamSortBy === 'members' }" @click="switchTeamSort('members')">人数排行</view>
        <view class="sort-btn" :class="{ active: teamSortBy === 'distance' }" @click="switchTeamSort('distance')">跑量排行</view>
        <view class="sort-btn" :class="{ active: teamSortBy === 'completion' }" @click="switchTeamSort('completion')">完成率排行</view>
      </view>
    </view>
		
    <view class="rank-list">
      <!-- 个人排行榜 -->
      <template v-if="tabIndex === 0">
        <view v-for="(item, index) in rankList" :key="item.wechat_openid" class="rank-item">
          <view class="rank-number flex-center">
            {{ item.rank <= 3 ? 'NO.' + item.rank : item.rank }}
          </view>
          <div class="user-avatar">
            <up-lazy-load height="120" borderRadius="16" :is-effect="false" :image="
              item.avatar_url ? item.avatar_url + '?x-oss-process=image/resize,w_120,h_120,m_fill' : '/static/images/user.png'
            " mode="aspectFill" errorImg="/static/images/user.png" />
          </div>
          <!-- <view class="user-info">
            <view style="display:flex;align-items:center;">
              <view class="user-name">{{ item.real_name }}</view>
              <view class="group-tag">{{ item.team_name }}</view>
            </view>
            <view class="user-time">{{ item.team_goal_km }}KM组</view>
          </view> -->
          <view class="user-info">
            <view class="user-name">{{ item.real_name }}</view>
            <view class="user-detail">
              <view style="color:#999;font-size:24rpx;">{{ item.team_goal_km }}KM组</view>
              <view class="flex-center group-tag u-mb-10 u-mt-10">{{ item.team_name }}</view>
            </view>
            <!-- <view class="user-time">{{ item.total_sessions }}次</view> -->
          </view>
          <view class="progress">
            <text class="progress-percent">
              <template v-if="personalSortBy === 'completion'">
                <text style="font-size:40rpx;">{{ item.required_checkins ? Math.round(item.total_qualified_sessions / item.required_checkins * 100) : 0 }}%</text>
              </template>
              <template v-else>
                <text style="font-size:40rpx;">{{ item.total_distance_km }}</text>km
              </template>
            </text>
            <text v-if="personalSortBy === 'completion'" style="font-size:24rpx;color:#999;font-weight:normal;">{{ item.total_distance_km }}km</text>
            <text style="font-size:24rpx;color:#999;font-weight:normal;">{{ item.total_qualified_sessions }}/{{ item.required_checkins }}次打卡</text>
          </view>
        </view>
      </template>
      <!-- 战队排行榜 -->
      <template v-else>
        <view v-for="(item, index) in rankList" :key="item.id || index" class="rank-item" @click="goto('pagesDashboard/pkEvent/teamDetail?teamId=' + item.id)">
          <view class="rank-number flex-center">
            {{ item.rank <= 3 ? 'NO.' + item.rank : item.rank }}
          </view>
          <div class="user-avatar">
            <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
              (item.team_avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
            " mode="aspectFill" />
          </div>
          <view class="user-info">
            <view class="user-name">{{ item.team_name }}</view>
            <view class="user-time">组别：{{ item.team_goal_km }}KM</view>
            <view class="user-time">{{ item.current_members }}人 | 完成率 {{ Number(item.team_completion_rate).toFixed(2) }}%</view>
          </view>
          <view class="progress">
            <text class="progress-percent">
              <text style="font-size:36rpx;">{{ teamRankValue(item) }}</text>
            </text>
          </view>
        </view>
      </template>

    </view>
		</mescroll-body>
		
		
		<div class="hr100" style="height:120rpx;"></div>
    <view v-if="showSignUpBtn" class="join-btn-wrapper flex-center">
      <u-button class="join-btn" :color="`linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})`"
        customStyle="width: 686rpx;height: 96rpx;border-radius: 999rpx;letter-spacing: 1px;font-size: 34rpx;" @click="SignUpEvent()">
        立即报名参赛
      </u-button>
    </view>

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />

    <PopupAd 
      v-model="isShowPop" 
      @click="nav2Lottery"
      adImg="https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/02/09/a24e474e-8c8f-49d2-bcea-1e00eebedd38.png?x-oss-process=image/resize,w_90,h_90,m_fill"
    />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow, onReachBottom, onPageScroll } from "@dcloudio/uni-app";

import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

import { useShare, buildPath } from "@/composables/useShare.js";
import request from "@/utils/request.js";
import dayjs from "dayjs";

import UserLogin from "@/components/UserLogin.vue";
import PersonalRecord from "./personalRecord.vue";

import { useStore } from "vuex";
import PopupAd from "../../components/PopupAd.vue";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

const refUserLogin = ref(null);

const activetyId = ref("");
const detailInfo = ref(null);

// 授权登录后的回调，用户授权后的跳转
const loginCallBack = ref(null)
const loginCallAction = ref('')
function onLoginSuccess () {
	if (loginCallAction.value === 'SignUpEvent') {
		uni.$u.toast('前往选择战队')
		setTimeout(() => {
			console.log("loginCallBack?.value=====>", loginCallBack.value)
			loginCallBack?.value?.()
		}, 500)
		
		return;
	}
	
	if (loginCallAction.value.includes('routeTo')) {
		loginCallBack?.value?.(loginCallAction.value.replace('routeTo', ''))
		return;
	}
}

const tabIndex = ref(0);
const tabList = ref([
  {
    label: "个人排行榜",
    value: "",
  },
  {
    label: "战队排行榜",
    value: "",
  },
]);

// 战队排行榜排序字段
const teamSortBy = ref('members');
// 个人排行榜排序字段
const personalSortBy = ref('distance');


function changeTab(index) {
  tabIndex.value = index;
  refreshList();
}

const getEventData = () => {
  request
    .get(`/event-api/online_events/${activetyId.value}`)
    .then((res) => {
      let date2 = dayjs(res.end_time).format("YYYY-MM-DD");
      let date1 = dayjs(res.start_time).format("YYYY-MM-DD");
      
      res = {
        ...res,
        diffDays: dayjs(date2 + "").diff(date1 + "", "day") + 1,
        registration_end_time: dayjs(res.registration_end_time).format("M月D日"),
        start_time: dayjs(res.start_time).format("M月D日"),
        total_registrations: formatNumber(res.total_registrations),
        total_teams: formatNumber(res.total_teams),
        status: res.status.toLowerCase(),
      }

      detailInfo.value = res;

      store.commit('set', {
        type: 'pkEventTheme',
        data: res.color_config
      })
      store.commit('set', {
        type: 'pkEventRule',
        data: res.rule
      })
      store.commit('set', {
        type: 'pkEventStatus',
        data: res.status.toLowerCase()
      })
    });
};

const userStatusInfo = ref({});
function getUserStatus() {
  request.get("/event-api/online_events_team/user_status?event_id=" + activetyId.value, {}, { showError: false }).then((res) => {
    userStatusInfo.value = res;
  }).catch(() => {});
}

const userCheckedInfo = ref({});
function getuserCheckedInfo() {
  request.get("/user-api/user/getEventCheckins?event_id=" + activetyId.value, {}, { showError: false }).then((res) => {
    userCheckedInfo.value = res;
  }).catch(() => {});
}

const myEvents = ref([]);
function getMyEvents() {
  request.get("/event-api/online_events/my_events", {}, { showError: false }).then((res) => {
    myEvents.value = res;
  }).catch(() => {});
}
// 活动是否进行中
const isActive = computed(() => detailInfo.value?.status === 'act');

// 用户是否已报名（纯粹判断，不混入活动状态）
const hasSignedUp = computed(() => {
  if (!myEvents.value) return false;
  return myEvents.value.some((i) => i.event_id === activetyId.value);
});

// 是否显示报名按钮 = 活动进行中 + 用户未报名
const showSignUpBtn = computed(() => isActive.value && !hasSignedUp.value);

// 数字格式化
const formatNumber = (num) => {
  let [integerPart, decimalPart] = String(num).split(".");
  integerPart = integerPart.split("").reverse().join("");
  integerPart = integerPart.match(/\d{1,3}/g).join(",");
  integerPart = integerPart.split("").reverse().join("");
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

// 立即报名
const SignUpEvent = () => {
	if (!userInfo.value.id) {
		loginCallAction.value = 'SignUpEvent'
		loginCallBack.value = SignUpEvent;
	  refUserLogin.value.open();
	  return;
	}
  if (!userStatusInfo.value.in_team) {
    uni.$u.route("pagesDashboard/pkEvent/teamList", { id: activetyId.value });
    return;
  }
  
  goToSignEvent()
};

function createTeam() {
  if (detailInfo.value?.status !== 'act') return uni.$u.toast('活动报名时间已过');
  goto('pagesDashboard/pkEvent/teamForm');
}

function goToSignEvent(item) {
	uni.$u.route("pagesDashboard/pkEvent/packageList", { 
    id: activetyId.value,
    eventId: activetyId.value,
    teamId: item?.id || "",
  });
}

// 跳转
const goto = (url) => {
  if (!userInfo.value.id) {
		loginCallAction.value = 'routeTo' + url
		loginCallBack.value = goto;
		
		console.log("loginCallBack.value=====>", loginCallBack.value)
    refUserLogin.value.open();
    return;
  }

  uni.$u.route(url, { id: activetyId.value, eventId: activetyId.value });
};

onLoad((options) => {
  console.log(options);
  activetyId.value = options.id || "01KH0WQX4H2C7Q4GJ217P8T922";
});

let isFirstShow = true;
onShow(() => {
  getEventData();
  getUserStatus();
  getMyEvents();
  getuserCheckedInfo();
  if (!isFirstShow) {
    refreshList();
  }
  isFirstShow = false;
});

useShare(() => ({
  title: detailInfo.value?.event_name
    ? `${detailInfo.value.event_name}·线上跑`
    : "线上跑活动",
  path: buildPath("/pagesDashboard/pkEvent/pkEvent", {
    id: activetyId.value,
  }),
}));

const refreshList = () => {
  getMescroll().resetUpScroll();
  getMescroll().scrollTo(0, 0);
};

const rankList = ref([]);
const getList = (mescroll) => {
	uni.showLoading({ mask: true });
  const data = {
    page_index: mescroll.num - 1,
    page_size: 10,
    event_id: activetyId.value,
  };
	let url = tabIndex.value == 0 ? '/event-api/ranking/personal' : '/event-api/ranking/team'

  if (tabIndex.value === 0) {
    data.sort_by = personalSortBy.value;
  }
  if (tabIndex.value === 1) {
    data.sort_by = teamSortBy.value;
  }
  request.get(url, data).then((res) => {
      const list = res?.list || [];
      mescroll.endSuccess(list.length, list.length >= 10);

      if (mescroll.num == 1) {
        rankList.value = [];
      }

      rankList.value = rankList.value.concat(list);
    })
    .catch((error) => {
      mescroll.endErr();
    });
};

// 切换个人排序方式
const switchPersonalSort = (sort) => {
  if (personalSortBy.value === sort) return;
  personalSortBy.value = sort;
  refreshList();
};

// 切换战队排序方式
const switchTeamSort = (sort) => {
  if (teamSortBy.value === sort) return;
  teamSortBy.value = sort;
  refreshList();
};

// 战队显示字符
const teamRankValue = (item) => {
  if (teamSortBy.value === 'distance') return item.total_distance_km + 'km';
  if (teamSortBy.value === 'completion') return Number(item.team_completion_rate).toFixed(2) + '%';
  return item.current_members + '人';
};

// 弹窗广告状态
const isShowPop = ref(false)

// 弹窗广告跳转抽奖页面
const nav2Lottery = () => {
  uni.navigateTo({
    url: "/pagesDashboard/pkEvent/lottery",
  });
}

// 倒计时1秒显示广告
const countdown = () => {
  setTimeout(() => {
    isShowPop.value = true
	}, 1000)
}

// 页面加载后
onShow(() => {
	countdown()
})
</script>

<style lang="scss" scoped>
	.section-btn{
		position: relative;
		height: 120rpx;
		border-radius: 200rpx;
		margin: 20rpx 20rpx 40rpx;
		font-size: 32rpx;
		background: #fff;
		animation-name: zoomIn;
		animation-duration: 1s;
		 animation-iteration-count: infinite;
		color: #fff;
		background: var(--theme-gradient, #ff5c5c);
	}
	@keyframes zoomIn {
	    0% {
	      transform: scale(0.97);
	    }
	
	    50% {
	        transform: scale(1)
	    }
			
			100% {
			  transform: scale(0.97);
			}
	}
	
.header-bg {
  // color: white;
  padding: 220rpx 0rpx 20rpx 0rpx;
  position: relative;
  z-index: 1;
  // background: linear-gradient(
  //   226deg,
  //   #c70036 0%,
  //   #d2003c 20%,
  //   #dd0043 40%,
  //   #e90249 60%,
  //   #f41450 80%,
  //   #ff2056 100%
  // );
  min-height: 512rpx;
}

.status-bar {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 26rpx;
  .bar {
    height: 48rpx;
    padding: 0 10rpx;
    margin-left: 0;
    background: rgba(255, 255, 255, 0.8);
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

.tab-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20rpx 30rpx;
}

.sort-switch {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 0 0 16rpx;

  .sort-btn {
    padding: 10rpx 32rpx;
    font-size: 24rpx;
    color: #999;
    background: #f5f5f5;
    border-radius: 999rpx;

    &.active {
      color: #fff;
      background: var(--theme-gradient, #ff5c5c);
    }
  }
}

.section-header {
  .title {
    font-size: 45rpx;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 20rpx;
  }

  .subtitle {
    font-size: 32rpx;
    // color: #ffe4e6;
    line-height: 50rpx;
    margin-bottom: 30rpx;
  }

  .start-time {
    width: 242rpx;
    height: 62rpx;
    color: #fff;
    background: var(--theme-gradient, #ff5c5c);
    border-radius: 20rpx 20rpx 20rpx 20rpx;
  }
}

.section-stats-card {
  background-color: #f5f5f5;
  border-radius: 24rpx;
  padding: 30rpx 30rpx 20rpx;
  // width: 686rpx;
  margin: 0 auto;
  // transform: translateY(-30rpx);
  position: relative;
  z-index: 10;
  // box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.02);
  display: flex;

  .stat-item {
    text-align: center;
    height: 96rpx;
    border-right: 1rpx solid #fff;
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
  padding: 20rpx 30rpx;
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
  color: #fff;
  background: var(--theme-gradient, #ff5c5c);
}

.rank-list {
  margin: 0 30rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  margin: 10rpx 0;
  width: 686rpx;
  height: 180rpx;
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
    font-size: 22rpx;
    color: #155dfc;
    padding: 4rpx 10rpx;
    background: #eff6ff;
    border-radius: 12rpx;
    max-width: 280rpx;
    display: inline-block;
  }
  .rank-number {
    width: 96rpx;
    font-family: Inter, Inter;
    font-size: 28rpx;
    font-weight: bold;
    color: #acacac;
    text-align: center;
  }

  .user-avatar {
    margin-right: 26rpx;
    width: 110rpx;
    height: 110rpx;
    border-radius: 16rpx;
    background: #f5f5f5;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .user-name {
    line-height: 48rpx;
    font-weight: 800;
    font-size: 34rpx;
    color: #1e2939;
  }

  .user-detail {
    font-size: 26rpx;
    color: #155dfc;
  }

  .user-time {
    font-size: 24rpx;
    color: var(--theme-color, #ff5c5c);
  }

  .progress {
    font-size: 30rpx;
    color: var(--theme-color, #ff5c5c);
    font-weight: bold;
    margin-left: 10rpx;
    padding-right: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
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
    color: #999;
    background: #f5f5f5;
    line-height: 40rpx;
    width: 336rpx;
    white-space: nowrap;
    font-weight: bold;
    text-align: center;
    border-radius: 999rpx;
    &.active {
      color: #fff;
      background: var(--theme-gradient, #ff5c5c);
    }
  }
}

.join-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 0rpx;
  z-index: 10;
}
</style>