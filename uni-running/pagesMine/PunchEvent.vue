<template>
  <view class="sign-in-page">
    <!-- 活动卡片 -->
    <view v-if="selectedEvent.id" class="panel-info">
      <view class="activity-header" @click="isShowEventModal = true">
        <image :src="selectedEvent.background_image_url" class="avatar" />
        <view class="info">
          <view class="title">{{selectedEvent.name}}</view>
          <view v-if="selectedEvent.checkin_start_time" class="time">签到时间: {{selectedEvent.checkin_start_time}} ~ {{selectedEvent.checkin_end_time}}</view>
        </view>
        <u-icon name="arrow-down" color="#999" size="36rpx" />
      </view>
    </view>
		
		<view v-if="participants.length" class="panel-info">
			<view class="quota-info flex-start">
			  您名下共有{{participants.length}}个参赛名额
			</view>
			
			<!-- 参赛人员列表 -->
			<view class="participants-list">
			  <view v-for="(item, index) in participants" :key="index" class="participant-item" @click="selectSigner(item)">
			    <view class="">
			    	<view class="name-row">
			    	  <text class="name">{{ item.full_name }}</text>
			    	  <text v-if="item.isMe" class="me-tag flex-center">本人</text>
			    	</view>
			    	<text class="project">报名项目：{{ item.package }}</text>
			    </view>
			    
					<view v-if="item.status === 'check_in'" class="" style="color: #7dc33f;">
						已签到
					</view>
					<!-- <view v-if="item.status === 'no_check_in'" class="" style="color: #FF8C00;">
						未签到
					</view> -->
					<template v-if="item.status === 'no_check_in'" >
						<u-icon :name="item.checked ? 'checkmark-circle-fill' : 'checkmark-circle' " 
							:color="item.checked ? '#7dc33f' : '#999'" size="40rpx" />
					</template>
					
					<!-- <u-icon v-if="item.status === 'no_check_in'" name="checkmark-circle-fill" color="#7dc33f" size="40rpx" /> -->
			  </view>
			</view>
		</view>

    <!-- 签到按钮 -->
    <view v-if="selectedEvent.id" 
			class="sign-button-container flex-center" 
			:class="{
				[punchInStatus]: true,
				isEndEvent: isEndEvent
			}">
      <u-button
				:disabled="isEndEvent"
        type="primary"
        shape="circle"
        :custom-style="{ padding: '80rpx 0', fontSize: '40rpx' }"
        @click="handleSign"
      >
        <view class="btn-text" >
          <view class="highlight">活动</view>
          <view class="highlight">
						<block v-if="isEndEvent">
							签到已结束
						</block>
						<block v-if="!isEndEvent">
							{{punchInStatus === 'success' ? '签到成功' : '现场签到'}}
						</block>
					</view>
          <view class="signtime">{{ currentTime }}</view>
        </view>
      </u-button>
    </view>
		
		<template v-if="selectedEvent.id">
			<view class="flex-center" style="margin-top:20px;color:#999;">
				{{isInPunchArea ? '在签到范围' : '不在签到范围'}}
			</view>
		</template>
		
		
		<up-action-sheet round="16" 
			@close="isShowEventModal = false"
			:actions="eventList" title="请选择活动" 
			:show="isShowEventModal" @select="changeEvent"></up-action-sheet>
  </view>
</template>

<script setup>
	import dayjs from "dayjs";
import { ref, onMounted, computed } from 'vue'
import request from "@/utils/request.js"
import { asyncAlls } from "@/utils/util.js"
import {
	onLoad,
} from "@dcloudio/uni-app";

const punchInStatus = ref('pending')
const isShowEventModal = ref(false)
const selectedEvent = ref({})

const currentTime = ref('')

function getClockTime() {
	setInterval(() => {
		currentTime.value = uni.$u.timeFormat(new Date(), 'hh:MM:ss');
	}, 1000)
}

const eventList = ref([])
function getEvents () {
	uni.showLoading({
		mask: true
	})
	request.get(`/event-api/api/v1/events`).then((res) => {
		res = res.events.map(item => ({
			...item,
			checkin_start_time: item.checkin_start_time?.slice(0, 16).replace("T", " "),
			checkin_end_time: item.checkin_end_time?.slice(11, 16)
		}));
		eventList.value = res
		
		changeEvent(res[0])
	});
};

const isEndEvent = computed(() => {
	const eventTime = selectedEvent.value.event_time?.slice(0, 16).replace("T", " ");
	
	return dayjs(eventTime).isBefore(dayjs())
})


function selectSigner(item) {
	item.checked = !item.checked
	
	punchInStatus.value = 'pending'
}

function changeEvent(e) {
	console.log(e)
	if (selectedEvent.value.id === e.id) return;
	
	selectedEvent.value = e
	
	getCurrentEventSigners()
	getUserLocation()
	isShowEventModal.value = false
	punchInStatus.value = 'pending'
}

const participants = ref([])
const getCurrentEventSigners = () => {
	uni.showLoading({
		mask: true
	})
	
	participants.value = []
	request.get(`/event-api/ticket/getTicketByOpenID?event_id=${selectedEvent.value?.id}`).then((res) => {
		participants.value = res.tickets
	});
};

// 点击签到按钮
const handleSign = async () => {
	if (!isInPunchArea.value) return uni.$u.toast('不在签到范围');
	
	let checkedList = participants.value.filter(i => i.status === 'no_check_in').filter(i => i.checked)
	if (!checkedList.length) {
		return uni.$u.toast('请勾选参赛人~')
	}
	
	const promiseList = checkedList.map((item) =>
		signApi(item)
	);
	
	let tempFile = null
	try {
		tempFile = await asyncAlls(promiseList);
	} catch (error) {
		console.error(error)
		
		uni.showToast({
		  title: '签到失败！',
		  icon: 'error',
		  duration: 1500
		})
	
		return false;
	}
	
	getCurrentEventSigners()
	
	punchInStatus.value = 'success'
	
  uni.showToast({
    title: '签到成功！',
    icon: 'success',
    duration: 1500
  })
}

function signApi (item) {
	const data = {
		id: item.id,
		full_name: item.full_name,
	}
	
	request.post(`/event-api/ticket/checkin`, data)
}

const isInPunchArea = ref(false)
async function getUserLocation () {
	const { checkin_address } =  selectedEvent.value
	
	const { lat, long } = checkin_address
	// 获取起始位置
	const userLocation = await uni?.getLocation({
		isHighAccuracy: true,
		type: "gcj02",
		altitude: true,
	});
	
	console.log('userLocation====>', userLocation)
	
	if (isInRange(userLocation.latitude, userLocation.longitude, lat, long)) {
		console.log("✅ 在打卡范围内（≤500米）");
		// 触发打卡逻辑
		isInPunchArea.value = true;
	} else {
		isInPunchArea.value = false;
		const dist = getDistance(userLocation.latitude, userLocation.longitude, lat, long);
		console.log(`❌ 距离打卡点 ${dist.toFixed(1)} 米，不在范围内`);
	}
}

onLoad(async () => {
	getEvents()
	getClockTime()
})

/**
 * 计算两个经纬度之间的距离（单位：米）
 * @param {number} lat1 - 用户纬度
 * @param {number} lng1 - 用户经度
 * @param {number} lat2 - 地点纬度
 * @param {number} lng2 - 地点经度
 * @returns {number} 距离（米）
 */
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径，单位：米
  const toRad = (deg) => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 返回距离（米）
}

/**
 * 判断用户是否在指定地点 500 米范围内
 * @param {number} userLat - 用户纬度
 * @param {number} userLng - 用户经度
 * @param {number} placeLat - 打卡地点纬度
 * @param {number} placeLng - 打卡地点经度
 * @param {number} radius - 半径（默认 500 米）
 * @returns {boolean}
 */
function isInRange(userLat, userLng, placeLat, placeLng, radius = 500) {
  const distance = getDistance(userLat, userLng, placeLat, placeLng);
  return distance <= radius;
}
</script>

<style scoped lang="scss">
.sign-in-page {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 100rpx;
}

.activity-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.activity-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
	margin-right:20rpx;
}

.info {
  flex: 1;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
	line-height: 48rpx;
}

.signtime{
	font-size: 24rpx;
	color: #fff;
	margin-top:10rpx;
}
.time {
	color: #979797;
	font-size: 24rpx;
	line-height: 40rpx;
}

.quota-info {
  margin-top: 0rpx;
	height: 52rpx;
	font-weight: bold;
	font-size: 24rpx;
	color: #979797;
}

.participants-list {
}

.participant-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 16rpx;
	border: 2rpx solid rgba(0,0,0,0.06);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.name {
  font-size: 30rpx;
	font-weight: 500;
	line-height: 44rpx;
}

.me-tag {
	background: #F1FFDE;
	color: #8CC63E;
  width: 80rpx;
  height: 42rpx;
	font-size: 24rpx;
  border-radius: 8rpx;
  margin-left: 26rpx;
}

.project {
  font-size: 30rpx;
  font-weight: 500;
	line-height: 44rpx;
}

.sign-button-container {
  display: flex;
  justify-content: center;
  margin-top: 100rpx;
	::v-deep{
		.u-button--disabled{
			opacity: 1;
		}
		.u-button{
			width: 272rpx;
			height: 272rpx;
			border-radius: 999px;
			background: #FF8C00;
			box-shadow: 0rpx 6rpx 12rpx 2rpx #FF8C00;
		}
	}
	&.pending{
		::v-deep{
			.u-button{
				border-color: #FF8C00;
				background: #FF8C00;
				box-shadow: 0rpx 6rpx 12rpx 2rpx #FF8C00;
			}
		}
	}
	&.success{
		::v-deep{
			.u-button{
				border-color: #8CC63E;
				background: #8CC63E;
				box-shadow: 0rpx 6rpx 12rpx 2rpx #8CC63E;
			}
		}
	}
	&.isEndEvent{
		::v-deep{
			.u-button{
				border-color: #F2F2F2;
				background: #F2F2F2;
				box-shadow: 0rpx 6rpx 12rpx 2rpx #F5F5F5;
			}
		}
	}
}

.btn-text {
	padding-top:10rpx;
  text-align: center;
  line-height: 1.3;
}

.highlight {
  font-weight: bold;
  color: #fff;
	font-size: 40rpx;
}
</style>