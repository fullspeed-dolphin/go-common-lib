<template>
  <view class="">
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
        <text class="value" style="color:#E11D48;">¥20W+</text>
      </view>
      <view class="stat-item u-flex-1 flex-col-center">
        <text class="label">已报名</text>
        <text class="value">4,238</text>
      </view>
      <view class="stat-item u-flex-1 flex-col-center">
        <text class="label">天数</text>
        <text class="value">30</text>
      </view>
    </section>

    <section class="btn-container u-mb-30">
      <u-button class="join-btn" color="linear-gradient( 64deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%)" 
			customStyle="width: 686rpx;height: 96rpx;border-radius: 32rpx;letter-spacing: 1px;font-size: 34rpx;" 
			@click="$u.route('pagesDashboard/pkEvent/pkEventForm',{id: activetyId})">
				立即报名参赛
			</u-button>
    </section>

    <!-- 功能按钮组 -->
    <section class="section-func-buttons flex-wrap">
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/teamForm',{id: activetyId})">
        <view class="iconfont flex-center icon-zhandui1" style="color:#FCD515;background: #FEF9C2;"></view>
        <text class="func-text">创建战队</text>
      </view>
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/teamDetail',{id: activetyId})">
        <view class="iconfont flex-center icon-zhandui1" style="color:#FCD515;background: #FEF9C2;"></view>
        <text class="func-text">进入战队</text>
      </view>
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/teamList',{id: activetyId})">
        <view class="iconfont flex-center icon-list-1-copy" style="color:#155DFC;background: #DBEAFE;"></view>
        <text class="func-text">战队列表</text>
      </view>
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/activeRule')">
        <view class="iconfont flex-center icon-huodongguize" style="color:#FC9C15;background: #FEE8C2;"></view>
        <text class="func-text">活动规则</text>
      </view>
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/teamForm',{id: activetyId})">
        <view class="iconfont flex-center icon-lijidaka" style="color:#8515FC;background: #EBDBFE;"></view>
        <text class="func-text">立即打卡</text>
      </view>
			<view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/pkRankList',{id: activetyId})">
			  <view class="iconfont flex-center icon-zhengshu" style="color:#EE2061;background: #FEDBE6;"></view>
			  <text class="func-text">完赛证书</text>
			</view>
    </section>
	<section class="section-func-buttons flex-wrap" style="margin-bottom: 100rpx;">
      <view class="func-item flex-col-center" @click="$u.route('pagesDashboard/pkEvent/pkRankList',{id: activetyId})">
        <view class="iconfont flex-center icon-paihangbang" style="color:#FC9C15;background: #FEE8C2;"></view>
        <text class="func-text">排行榜</text>
      </view>
    </section>

  </view>
</template>

<script setup>
import { ref} from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js"
import dayjs from "dayjs";
const activetyId = ref('01KH0WQX4H2C7Q4GJ217P8T922');
const detailInfo = ref(null);
onLoad((options) => {
	console.log(options);
	// activetyId.value = options.id;
	init();
});
// uniapp 导航方法（无需 import）
const handleJoin = () => {
  uni.navigateTo({ url: '/pages/join/join' });
};

const createTeam = () => {
  uni.navigateTo({ url: '/pages/create-team/create-team' });
};

const goToTeamList = () => {
  uni.navigateTo({ url: '/pages/team-list/team-list' });
};

const goToRanking = () => {
  uni.navigateTo({ url: '/pages/ranking/ranking' });
};

const checkIn = () => {
  uni.navigateTo({ url: '/pages/check-in/check-in' });
};
const init=()=>{ 
	// let url = !type ? '/ranking/personal?activity_id=' + id : '/ranking/team?activity_id='+ id
  request.get('/event-api/online_events/01KH0WQX4H2C7Q4GJ217P8T922').then(res => {
	//   console.log('res===',res)
	  detailInfo.value = res || {}
	//   console.log('detailInfo.value===',dayjs(detailInfo.value.registration_end_time).format('MM月DD日'))
	  detailInfo.value.registration_end_time = dayjs(detailInfo.value.registration_end_time).format('M月D日')
	  detailInfo.value.start_time = dayjs(detailInfo.value.start_time).format('M月D日')
	//   console.log('detailInfo.value===',detailInfo.value)
    // if (res.code === 200) {
    // //   rankList.value = res.data
    // }
  })
}
</script>

<style lang="scss" scoped>
.header-bg {
  color: white;
  padding: 80rpx 64rpx 0rpx;
  position: relative;
  z-index: 1;
	background: linear-gradient( 226deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%);
	height: 512rpx;
}

.status-bar {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 26rpx;
	.bar{
		height: 48rpx;
		padding: 0 10rpx;
		background: rgba(255,255,255,0.2);
		border-radius: 20rpx 20rpx 20rpx 20rpx;
	}
	.status-dot {
	  width: 32rpx;
	  height: 32rpx;
	  background: #05DF72;
	  border-radius: 50%;
	  margin-right: 5rpx;
	}
}

.section-header{
	.title {
	  font-size: 60rpx;
	  font-weight: bold;
	  line-height: 1.2;
	  margin-bottom: 20rpx;
	}
	
	.subtitle {
	  font-size: 36rpx;
	  color: #FFE4E6;
		line-height: 50rpx;
	  margin-bottom: 50rpx;
	}
	
	.start-time {
	  width: 242rpx;
	  height: 62rpx;
		color: #fff;
	  background: #B72550;
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
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0,0,0,0.02);
  display: flex;

	.stat-item {
	  text-align: center;
		height: 96rpx;
		border-right: 1rpx solid #F3F4F6;
		&:last-child{
			border:0;
		}
	}
	.label {
	  font-size: 24rpx;
	  color: #64748B;
	  margin-bottom: 8rpx;
	}
	.value {
	  font-size: 40rpx;
	  font-weight: bold;
	  color: #1E2939;
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
		background: #FEF9C2;
		border-radius: 32rpx;
	  margin-bottom: 26rpx;
	}
}
</style>