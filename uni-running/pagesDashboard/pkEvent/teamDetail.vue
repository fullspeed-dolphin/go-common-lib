<template>
	<mescroll-body ref="mescrollRef" @init="mescrollInit" :down="{ use: false }" @down="downCallback" @up="getList" :top="0">
  <view class="">
    <section class="team-header">
      <!-- 毛玻璃背景：绝对定位，自动跟随 header 高度 -->
      <view class="blur-bg">
        <image class="blur-img" :src="(detailInfo?.team_avatar_url) + '?x-oss-process=image/resize,w_750,h_500,m_fill'" mode="aspectFill"></image>
      </view>
      <!-- 内容层 -->
      <view class="header-content">
        <section class="flex-between-center">
          <view class="flex-row" style="align-items: flex-start;">
            <image :src="detailInfo.team_avatar_url" class="team-avatar" mode="aspectFill" />
            <view class="team-info">
              <view class="team-name">{{ detailInfo.team_name }}</view>
              <view class="team-meta">{{ detailInfo.team_goal_km }}KM | {{ detailInfo.current_members }}人 | 队长：{{ detailInfo.leader_nickname }}</view>
              <view class="welcome-text">{{ detailInfo.team_introduction }}</view>
            </view>
          </view>
        </section>

        <!-- 统计卡片 -->
        <view class="stats-container flex-between-center">
          <view class="stat-item flex-col-center">
            <text class="stat-value">{{ detailInfo.total_distance_km }}</text>
            <text class="stat-label">总跑量(km)</text>
          </view>
          <view class="stat-item flex-col-center">
            <text class="stat-value">{{ detailInfo.current_members }}</text>
            <text class="stat-label">战队人数</text>
          </view>
          <view class="stat-item flex-col-center">
            <text class="stat-value">{{ teamRank || '-' }}</text>
            <text class="stat-label">战队排名</text>
          </view>
        </view>
      </view>
    </section>

    <!-- 分类标签 -->
    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view v-for="(item, index) in tabList" :key="item.value" class="tag-item" :class="{ active: currentIndex === index }" @click="handleTabChange(index)">
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="isLeader" class="list-toolbar">
      <view class="toolbar-btn" @click="toggleGlobalPhone">
        <u-icon :name="showPhone ? 'eye-fill' : 'eye-off'" size="16" :color="showPhone ? '#1456f0' : '#999'"></u-icon>
        <text class="toolbar-text">{{ showPhone ? '隐藏' : '显示' }}</text>
      </view>
    </view>

    <view class="rank-list">
      <view v-for="(item, index) in rankList" :key="index" class="rank-item">
        <view class="rank-number flex-center">
          {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
        </view>
        <div class="user-avatar">
          <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
              item.avatar_url ? item.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill' : '/static/images/user.png'
            " mode="aspectFill" errorImg="/static/images/user.png" />
            <view class="gender">
								<u-icon v-if="item.gender === '1'" color="#409eff" name="man" size="17"></u-icon>
								<u-icon v-if="item.gender === '0'" color="#f5abb8" name="woman" size="17"></u-icon>
							</view>
        </div>
        <view class="user-info">
          <view class="user-name u-flex-y-center">
            {{ item.real_name }}
            <view v-if="item.is_team_leader" class="leader-tag">队长</view>
            <view v-if="item.status === 'PND'" class="status-tag pnd">未报名</view>
          </view>
          <view v-if="item.phone && showPhone" class="phone-row">
            <text @click="isPhoneVisible(item) && callPhone(item.phone)" class="phone-text">
              {{ isPhoneVisible(item) ? item.phone : maskPhone(item.phone) }}
            </text>
            <u-icon
              :name="isPhoneVisible(item) ? 'eye-fill' : 'eye-off'"
              size="14"
              :color="isPhoneVisible(item) ? '#1456f0' : '#999'"
              @click="togglePhoneVisible(item)"
            />
          </view>
          <view class="user-detail u-flex-y-center">
            {{ item.total_distance_km }} KM
          </view>
          <view class="user-time">{{ item.total_qualified_sessions }}/{{ item.required_checkins }}次打卡</view>
        </view>
        <view class="progress">
          <template v-if="currentIndex === 0">
            <text class="progress-percent" style="font-size:36rpx;">{{ item.required_checkins ? Math.round(item.total_qualified_sessions / item.required_checkins * 100) : 0 }}%</text>
            <text class="progress-sub">{{ item.total_qualified_sessions }}/{{ item.required_checkins }}次</text>
          </template>
          <template v-else>
            <text class="progress-percent"><text style="font-size:36rpx;">{{ item.total_distance_km }}</text>km</text>
          </template>
        </view>
      </view>
    </view>
  </view>
	</mescroll-body>

  <div class="hr100" style="height:120rpx;"></div>
  <section v-if="isLoadedPage" class="share-btn-wrapper">
    <block v-if="isShowShareBtn">
      <view @click="showShareBtn" class="main-btn" style="background:#07C160;text-align: center;">邀请好友加入</view>
      <!-- <button class="main-btn" style="background:#07C160" open-type="share">邀请好友加入</button> -->
    </block>
    
    <button v-if="!userStatusInfo.in_team" class="main-btn" @click="joinTeam()">加入战队</button>

    <!-- 加入任何一个战队后，不可加入其他战队 -->
    <block v-if="userStatusInfo.in_team">
      <button v-if="isNoSignUpEvent" class="main-btn" @click="goToSignEvent">立即报名</button>
      <!-- 只在当前team 成员可退出，活动进行中禁止退出 -->
      <block v-if="userStatusInfo.team_info.id === teamID && !userStatusInfo.is_team_leader && !isEventActive">
        <button class="main-btn" style="background:#999" @click="leaveTeam(detailInfo)">退出战队</button>
      </block>
    </block>
  </section>
	
	<button v-if="!isShowShareBtn" class="share-btn flex-center" :class="{ active: isScroll }" open-type="share">
		<u-icon name="share" color="#fff" size="18"></u-icon>
	</button>
	
	<UserLogin ref="refUserLogin" @success="onLoginSuccess" />
  <!-- 套餐列表 -->
  <up-popup :show="isShowModal" @close="close" overlayOpacity="1" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
    <div class="flex-center b" style="height:90rpx;font-size:32rpx;">完善信息</div>
    <scroll-view scroll-y style="height: 90vh;width:100vw;overflow-y: auto;background: #fff;">
      <pkEventForm :teamID="teamID"/>
    </scroll-view>
  </up-popup>

  <up-popup :show="isShowShareModal" zIndex="11" @close="closeShare" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
			<view style="text-align: center;margin-top:30rpx;">分享到</view>
      <view class="iconList">
				<view class="item" @click="wechatShare">
					<!-- <u-icon name="weixin-fill" color="#2979ff" size="28"></u-icon> -->
					<view class="img">
						<view class="iconfont icon-weixin" style="font-size:40rpx"></view>
					</view>
					<view class="txt">微信分享</view>
					<button class="wechatBtn" open-type="share">
					分享{{clubTypeName}}
				</button>
				</view>
				<view class="item" @click="sharePoster">
					<!-- <u-icon name="photo" color="#2979ff" size="28"></u-icon> -->
					 <view class="img"><view class="iconfont icon-haibaofenxiang" style="font-size:40rpx"></view></view>
					<view class="txt">海报分享</view>
				</view>
				<view class="item" @click="shareQRCode">
					<!-- <u-icon name="scan" color="#2979ff" size="28"></u-icon> -->
					<view class="img"><view class="iconfont icon-erweima1688" style="font-size:40rpx"></view></view>
					<view class="txt">小程序码分享</view>
				</view>
			</view>
		</up-popup>
		<!-- 海报分享 -->
		 <view class="qrcode">
			 <SharePoster ref="refSharePoster"/>
		 </view>
		<!-- 二维码分享 -->
		
		<up-popup :show="qrCodeShow" zIndex="11" @close="closeQrcode" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
			<view style="text-align: center;margin-top:30rpx;">
				<image :src="qrCodeSrc" style="width:350rpx;height:350rpx;"></image>
				<view style="margin:20rpx 0;">长按二维码下载</view>
			</view>
		</up-popup>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad, onShow, onReachBottom, onPageScroll } from "@dcloudio/uni-app";

import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

import request from "@/utils/request.js";
import { useShare, buildPath } from "@/composables/useShare.js";
import dayjs from "dayjs";

import UserLogin from "@/components/UserLogin.vue";
import pkEventForm from "@/pagesDashboard/pkEvent/pkEventForm.vue";
import SharePoster from "./SharePoster.vue"
import { useStore } from "vuex";

const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const refUserLogin = ref(null);

const loginCallBack = ref(null)
function onLoginSuccess () {
	loginCallBack?.value?.()
}

const teamID = ref("");
const detailInfo = ref({});
const isShowModal = ref(false); // 是否显示套餐列表
function getDetailInfo() {
  request.get(`/event-api/online_events_team/${teamID.value}`).then((res) => {
    detailInfo.value = res;
  });
}

const eventID = ref("");
const eventInfo = ref({});
const isEventActive = computed(() => {
  if (!eventInfo.value.start_time || !eventInfo.value.end_time) return false;
  const now = dayjs();
  return now.isAfter(dayjs(eventInfo.value.start_time)) && now.isBefore(dayjs(eventInfo.value.end_time));
});
function getEventInfo() {
  console.log('=====eventID====',eventID)
  request.get(`/event-api/online_events/${eventID.value}`).then((res) => {
    eventInfo.value = res;
  });
}

const isScroll = ref(false);
let timer = null;
onPageScroll((e) => {
  isScroll.value = true;

  clearTimeout(timer);
  timer = setTimeout(() => {
    isScroll.value = false;
  }, 100);
});

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
    team_id: teamID.value,
    event_id: eventID.value,
		sort_by: currentIndex.value === 0 ? 'checkins' : ''
  };
	
  request
    .get(`/event-api/online_events_team/members`, data)
    .then((res) => {
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

function leaveTeam() {
	const params = {
		event_id: eventID.value
	}
	uni.showModal({
		title: "提示",
		content: "确定退出战队吗？",
		success: (res) => {
			if (res.confirm) {
				request.post("/event-api/online_events_team/quit", params).then((res) => {
					uni.$u.toast('退出成功')
					getUserStatus()
					refreshList()
				});
			} else if (res.cancel) {
				console.log("用户点击取消");
			}
		},
	});
}

const teamRank = ref(0);
function getTeamRank() {
  request.get("/event-api/ranking/team?event_id=" + eventID.value + "&page_index=0&page_size=100").then((res) => {
    const list = res?.list || [];
    const idx = list.findIndex(item => item.id === teamID.value);
    teamRank.value = idx >= 0 ? idx + 1 : 0;
  });
}

const userStatusInfo = ref({});
const isLoadedPage = ref(false)
function getUserStatus() {
  request.get("/event-api/online_events_team/user_status?event_id=" + eventID.value).then((res) => {
    userStatusInfo.value = res;
		isLoadedPage.value = true
  });
}

const myEvents = ref([]);
function getMyEvents() {
  request.get("/event-api/online_events/my_events").then((res) => {
    myEvents.value = res;
  });
}
const isNoSignUpEvent = computed(() => {
  if (!myEvents.value) return true;
  return !myEvents.value.some((i) => i.event_id === eventID.value);
});

const isShowShareBtn = computed(() => {
  const info = userStatusInfo.value || {};
  let otherButtons = 0;

  // 未加入战队时会显示「加入战队」按钮
  if (!info.in_team) {
    otherButtons++;
  } else {
    // 已加入战队：可能显示「立即报名」
    if (isNoSignUpEvent.value) otherButtons++;
    // 只有当前队员且非队长、活动未进行时显示「退出战队」按钮
    if (info.team_info && info.team_info.id === teamID.value && !info.is_team_leader && !isEventActive.value) otherButtons++;
  }

  // 如果其他按钮 + 邀请按钮 总数 > 3，则隐藏邀请按钮
  return otherButtons + 1 <= 2;
});

onLoad((options) => {
  console.log("======options=======", options);
  
  teamID.value = options.teamId || options.id;
  eventID.value = options.eventId || options.id;

	if (!userInfo.value.id) {
		nextTick(() => {
			loginCallBack.value = getUserData
			refUserLogin.value.open();
		})
  }
});
function getUserData() {
	getUserStatus();
	getMyEvents();
}

onShow(() => {
  console.log("=======页面显示了===")
  if (!teamID.value) return;

  getDetailInfo();
  getTeamRank();
  getEventInfo();

	getUserData();
});

function callPhone(phone) {
  if (!phone) return;
  uni.makePhoneCall({
    phoneNumber: phone,
  })
}

function joinTeamAPi() {
  isShowModal.value = true;
	/* const item = detailInfo.value
	console.log("joinTeamAPi", item);
	uni.showLoading({ mask: true });
  request
    .post("/event-api/online_events_team/join", {
			event_id: eventID.value,
			team_id: item.id,
    })
    .then(() => {
				getUserStatus();
				refreshList()
				uni.$u.toast("加入战队成功");
				setTimeout(() => {
					// goToSignEvent();
          isShowModal.value = true;
				}, 500)
    })
    .catch((e) => {
      uni.$u.toast(e.msg || "加入战队失败");
    }); */
    
}
function close() {
  isShowModal.value = false;
}
function goToSignEvent() {
	uni.$u.route("pagesDashboard/pkEvent/pkEventForm", { id: eventID.value });
}

function joinTeam() {
	if (!userInfo.value.id) {
		loginCallBack.value = joinTeam;

		nextTick(() => {
			refUserLogin.value.open();
		})

		return false;
  }

  if (!userStatusInfo.value.in_team) {
    joinTeamAPi();
  }
}

useShare(() => ({
  title: detailInfo.value.team_name
    ? `加入${detailInfo.value.team_name}，一起为爱奔跑！`
    : "邀请你加入战队",
  path: buildPath("/pagesDashboard/pkEvent/teamDetail", {
    teamId: teamID.value,
    eventId: eventID.value,
  }),
}));

const showPhone = ref(false);
const phoneVisibleMap = ref({});
const isLeader = computed(() => userStatusInfo.value?.is_team_leader);

function toggleGlobalPhone() {
  showPhone.value = !showPhone.value;
  phoneVisibleMap.value = {};
}

function isPhoneVisible(item) {
  const key = item.wechat_openid;
  return key in phoneVisibleMap.value ? phoneVisibleMap.value[key] : true;
}

function togglePhoneVisible(item) {
  const key = item.wechat_openid;
  phoneVisibleMap.value[key] = !isPhoneVisible(item);
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

const currentIndex = ref(0);
const tabList = ref([
  { label: "个人完赛", value: "" },
  { label: "总距离", value: "SUCC" },
]);
const handleTabChange = (index) => {
  currentIndex.value = index;
	refreshList()
};

// 编辑按钮点击
const handleEdit = () => {
  uni.$u.route("pagesDashboard/pkEvent/teamForm");
};


// 弹出分享按钮
	const isShowShareModal = ref(false);
	const showShareBtn = () =>{
		isShowShareModal.value = true;
	}
	function closeShare() {
	isShowShareModal.value = false;
	}
	const wechatShare = () => { 
		uni.share({
			provider: "weixin",
			scene: "WXSceneSession",
			type: 1,
			summary: detail.value.name,
			success: function (res) {
				console.log("success:" + JSON.stringify(res));
			},
			fail: function (err) {
				console.log("fail:" + JSON.stringify(err));
			}
		});
	}
	// 二维码分享
	const qrCodeSrc = ref('');
	const qrCodeShow = ref(false);
	const shareQRCode = () => { 
		// qrCodeImg()
		let data = {
			path: `pagesDashboard/pkEvent/teamDetail?id=${teamID.value}&eventId=${eventID.value}`
		}
		request.post(
				`/image-service/wxacode`,data
			)
			.then((res) => {
				qrCodeShow.value = true;
				nextTick(() => {
					// console.log("res==base64", res)
					qrCodeSrc.value = res.image
				})
			});
	}
	const refSharePoster = ref(null)
	const closeQrcode=() => { 
		qrCodeShow.value = false;
	}
	// 海报分享
	const sharePoster = () => { 
		// qrCodeImg('poster')
		refSharePoster.value.open({imgUrl:detailInfo.value.team_avatar_url,title:detailInfo.value.team_name,time:userInfo.value.nickname+'邀请你加入团队'})
	}
</script>

<style lang="scss" scoped>
.team-header {
  position: relative;
  overflow: hidden;
  width: 750rpx;
}

.blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(10px);
}

.blur-img {
  width: 100%;
  height: 100%;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 86rpx 50rpx 30rpx;
  background: linear-gradient(to bottom, rgba(255,255,255,.7) 60%, #f5f5f5);
  .team-avatar {
    width: 120rpx;
    height: 120rpx;
    flex-shrink: 0;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 4rpx solid #ffb3b3;
    margin-right: 30rpx;
  }
  .team-meta {
    font-size: 26rpx;
    color: #222;
    margin-bottom: 8rpx;
  }
  .welcome-text {
    font-size: 24rpx;
    color: #666;
  }
  .team-name {
    line-height: 60rpx;
    font-weight: 800;
    font-size: 40rpx;
    color: #101828;
  }
  .edit-icon {
    width: 40rpx;
    height: 40rpx;
    margin-left: 10rpx;
    font-size: 40rpx;
    color: #6a7282;
  }
}

.stats-container {
  margin-top: 50rpx;
  .stat-item {
    width: 206rpx;
    height: 144rpx;
    background: #f9fafb;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
  }

  .stat-value {
    font-weight: 800;
    font-size: 40rpx;
    color: #101828;
    line-height: 60rpx;
  }

  .stat-label {
    font-size: 24rpx;
    color: #6a7282;
    line-height: 36rpx;
  }
}

/* 标签切换 */
.tab-container {
  display: flex;
  justify-content: center;
  margin: 30rpx 30rpx 20rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
	position: relative;
	z-index: 10;
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.1);
}

.list-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 0 30rpx;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 0;
}

.toolbar-text {
  font-size: 24rpx;
  color: #666;
}

.phone-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.phone-text {
  color: #1456f0;
  padding: 10rpx 0;
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
  color: #ff5c5c;
  border-bottom: 2rpx solid #ff5c5c;
}

/* 排行榜列表 */
.rank-list {
  margin: 0 30rpx;
}

.rank-item {
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  margin: 10rpx 0;
  width: 686rpx;
  min-height: 144rpx;
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
  .rank-number {
    width: 96rpx;
    font-family: Inter, Inter;
    font-size: 24rpx;
    font-weight: bold;
    color: #acacac;
    text-align: center;
  }

  .user-avatar {
    position: relative;
    margin-right: 26rpx;
    width: 96rpx;
    height: 96rpx;
    border-radius: 14rpx 14rpx 14rpx 14rpx;
    background: #f5f5f5;
    .gender {
			position: absolute;
			background: #fff;
			bottom: -2rpx;
			right: 0rpx;
			border-radius: 40rpx;
		}
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
  .leader-tag {
    font-size: 18rpx;
    font-weight: 500;
    color: #ff5c5c;
    background: #fff0f0;
    padding: 2rpx 10rpx;
    border-radius: 8rpx;
    margin-left: 10rpx;
  }
  .status-tag {
    font-size: 18rpx;
    font-weight: 500;
    padding: 2rpx 10rpx;
    border-radius: 8rpx;
    margin-left: 10rpx;
  }
  .status-tag.pnd {
    color: #999;
    background: #f3f4f6;
  }

  .user-detail {
    font-size: 24rpx;
    color: #5c626f;
    margin-bottom: 8rpx;
  }

  .user-time {
    font-size: 20rpx;
    color: #5c626f;
  }

  .progress {
    font-size: 28rpx;
    color: #ff5c5c;
    font-weight: bold;
    margin-left: 20rpx;
    padding-right: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .progress-sub {
    font-size: 22rpx;
    color: #999;
    font-weight: normal;
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

.share-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48rpx 30rpx;
	gap: 30rpx;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.main-btn {
  width: 686rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 1px;
  color: #fff;
  background: #ff5c5c;
  border: none;

  &::after {
    border: none;
  }
}
.share-btn {
		position: fixed;
		right: 20rpx;
		bottom: 200rpx;
		width: 90rpx;
		height: 90rpx;
		border-radius: 200rpx;
		color: #fff;
		z-index: 20;
		border: 1px solid #18b566;
		background-color: #18b566 !important;
		margin-bottom: 20rpx !important;
		flex-direction: column;
		font-size: 20rpx;
		box-shadow: 0px 0px 6rpx rgba(0, 0, 0, 0.4);
		transition: transform 0.3s;

		&:after {
			display: none;
		}

		&.active {
			transform: translate(100rpx);
		}
	}
  .iconList {
		display: flex;
		justify-content: center;
		justify-items: center;
		align-items: center;
		padding: 40rpx 75rpx 40rpx;
		
		.item {
			position:relative;
			width:200rpx;
			text-align: center;
			display: flex;
			align-items: center;
			flex-direction: column;
			&:nth-child(1) {
				.img {
					background:#07C160;
				}
			}
			&:nth-child(2) {
				.img {
					color:#fff;
					background:#999;
				}
			}
			&:nth-child(3) {
				.img {
					background:#A0522D;
				}
			}
			.img {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 80rpx;
				height:80rpx;
				border-radius: 50%;
				color:#fff;
				
			}
			.txt {
				margin-top:20rpx;
			}
			.wechatBtn {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				z-index: 1;
				opacity:0;
			}
		}
	}
  .qrcode {
		::v-deep .u-popup__content__close {
			top: 300rpx !important;
			width: 36px !important;
			height: 36px !important;
			background: rgba(34, 34, 34, 0.8) !important;
			border-radius: 999px;
			display: flex;
			align-items: center;
			justify-content: center;
	
			.u-icon__icon {
				color: #fff !important;
			}
		}
	}
</style>