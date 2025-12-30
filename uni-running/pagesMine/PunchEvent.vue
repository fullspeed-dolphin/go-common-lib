<template>
  <view class="sign-in-page">
    <!-- 活动卡片 -->
    <view v-if="selectedEvent.id" class="panel-info">
      <view class="activity-header" @click="isShowEventModal = true">
        <image :src="selectedEvent.background_image_url+ '?x-oss-process=image/resize,w_80,h_80,m_fill'" class="avatar" />
        <view class="info">
          <view class="title">{{selectedEvent.name}}</view>
          <view class="time" v-if="selectedEvent.checkin_start_time">
						签到时间: {{selectedEvent.checkInRangeTime}}
					</view>
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
			  <view v-for="(item, index) in participants" :key="index" class="participant-item" click="selectSigner(item)">
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
					<view v-if="item.status === 'no_check_in'" class="" style="color: #FF8C00;">
						未签到
					</view>
					<!-- <template v-if="item.status === 'no_check_in'" >
						<u-icon :name="item.checked ? 'checkmark-circle-fill' : 'checkmark-circle' " 
							:color="item.checked ? '#7dc33f' : '#999'" size="40rpx" />
					</template> -->
					
					<!-- <u-icon v-if="item.status === 'no_check_in'" name="checkmark-circle-fill" color="#7dc33f" size="40rpx" /> -->
			  </view>
			</view>
		</view>

    <!-- 签到按钮 -->
    <div class="sign-button-container flex-col-center" v-if="selectedEvent.id">
			<view
				:class="{
					[punchInStatus]: true,
					disableButton: !canSign
				}">
			  <u-button
					:disabled="!canSign"
			    type="primary"
			    shape="circle"
			    :custom-style="{ padding: '80rpx 0', fontSize: '40rpx' }"
			    @click="handleSign"
			  >
			    <view class="btn-text" >
			      <view class="highlight">活动</view>
			      <view class="highlight">
							<block v-if="!canSign">
								{{ disableReason }}
							</block>
							<block v-else>
								{{punchInStatus === 'success' ? '签到成功' : '现场签到'}}
							</block>
						</view>
			      <view class="signtime">{{ currentTime }}</view>
			    </view>
			  </u-button>
			</view>

			<view v-if="selectedEvent.id" class="flex-center" style="margin-top:20px;color:#999;min-height:40rpx;">
				<template v-if="isInCheckTime">
					<template v-if="!locationGranted">未获取定位权限</template>
					<template v-else>{{isInPunchArea ? '在签到范围' : '不在签到范围'}}</template>
				</template>
			</view>
		</div>

		<!-- 底部二维码签到按钮 -->
		<view v-if="participants.length && isInCheckTime" class="bottom-qrcode-btn">
			<view :class="['qrcode-btn-wrap', { 'is-pressed': showQrcodePopup }]">
				<u-button
					type="primary"
					shape="circle"
					:color="isInCheckTime ? '#FF8C00' : '#CCCCCC'"
					customStyle="height: 80rpx; width: 312rpx;"
					@click="handleQrcodeSign"
				>
					二维码签到
				</u-button>
			</view>
		</view>
		
		<!-- 二维码弹窗 -->
		<u-popup v-model:show="showQrcodePopup" mode="center" round="16" closeable @open="onQrcodePopupOpen">
			<view class="qrcode-popup">
				<view class="qrcode-title">请出示给工作人员</view>
				<view class="qrcode-content">
					<u-qrcode
						ref="qrcodeRef"
						cid="punch-event-qrcode"
						:val="qrcodeVal"
						:size="280"
						:lv="1"
						:loadMake="false"
						:onval="false"
						:showLoading="false"
					/>
				</view>
				<u-button
					type="primary"
					shape="circle"
					color="#FF8C00"
					@click="showQrcodePopup = false"
				>
					关闭
				</u-button>
			</view>
		</u-popup>
		
		<up-action-sheet round="16"
			@close="isShowEventModal = false"
			:actions="eventList" title="请选择活动" 
			:show="isShowEventModal" @select="changeEvent" />
		
		<UserLogin ref="refUserLogin" @success="getEvents()"/>
  </view>
</template>

<script setup>
import dayjs from "dayjs";
import { ref, onMounted, computed, nextTick } from 'vue'
import UserLogin from "@/components/UserLogin.vue";
import request from "@/utils/request.js"
import { asyncAlls } from "@/utils/util.js"
import { checkLocationPermission, getUserAreaScope } from './assets/location.js'
import {
	onLoad,
	onUnload,
	onShow
} from "@dcloudio/uni-app";

	import {
		useStore
	} from "vuex";
// 使用store
const store = useStore();
const refUserLogin = ref(null);
	
const punchInStatus = ref('pending')
const isShowEventModal = ref(false)
const selectedEvent = ref({})
const showQrcodePopup = ref(false)
const qrcodeData = ref('')
const qrcodeVal = ref('')
const qrcodeRef = ref(null)
const locationGranted = ref(false)  // 位置权限是否已授予

const currentTime = ref('')

let timerClockTime = null
function getClockTime() {
	clearInterval(timerClockTime)
	timerClockTime = setInterval(() => {
		currentTime.value = uni.$u.timeFormat(new Date(), 'hh:MM:ss');
		
		get_isInCheckTime()
	}, 1000)
}

const eventList = ref([])
function getEvents () {
	uni.showLoading({
		mask: true
	})
	request.get(`/event-api/api/v1/events`).then((res) => {
		res = res.events.map(item => {
			const start_time = item.checkin_start_time?.replace("T", " ").slice(0, 16)
			const end_time = item.checkin_end_time?.replace("T", " ").slice(0, 16)
			return {
				...item,
				checkin_start_time: start_time,
				checkin_end_time: end_time,
				checkInRangeTime: start_time ? `${start_time}~${end_time?.slice(11, 16)}` : null
			}
		});
		eventList.value = res
		
		changeEvent(res[0])
	});
};

// 自动监听时间，即使不刷新，到时间也会让按钮不可点击
const isInCheckTime = ref(false)
function get_isInCheckTime() {
	const now = dayjs()
	const isBefore = now.isBefore(selectedEvent.value.checkin_end_time)
	const isAfter = now.isAfter(selectedEvent.value.checkin_start_time)

	isInCheckTime.value = (isBefore && isAfter)
}

// 按钮是否可用：在签到时间内 + 已授权定位 + 在签到范围
const canSign = computed(() => isInCheckTime.value && locationGranted.value && isInPunchArea.value)

// 按钮不可用的原因提示
const disableReason = computed(() => {
	if (!isInCheckTime.value) return '不在签到时间'
	if (!locationGranted.value) return '未授权定位'
	if (!isInPunchArea.value) return '不在签到范围'
	return ''
})

function selectSigner(item) {
	item.checked = !item.checked
	
	punchInStatus.value = 'pending'
}

function changeEvent(e) {
	console.log(e)
	if (selectedEvent.value.id === e.id) return;

	selectedEvent.value = e

	get_isInCheckTime()  // 立即检测时间状态
	getCurrentEventSigners()
	handleCheckLocation()
	isShowEventModal.value = false
	punchInStatus.value = 'pending'
}

const participants = ref([])
const getCurrentEventSigners = () => {
	if (!store.state.userInfo.id) {
		return refUserLogin.value.open();
	}
	uni.showLoading({
		mask: true
	})
	
	participants.value = []
	request.get(`/event-api/ticket/getTicketByOpenID?event_id=${selectedEvent.value?.id}`).then((res) => {
		participants.value = res.tickets
		// 保存完整 data 用于二维码
		qrcodeData.value = JSON.stringify({ tickets: res.tickets, total: res.total || res.tickets.length })
	});
};

// 点击签到按钮
const handleSign = async () => {
	if (!store.state.userInfo.id) {
		return refUserLogin.value.open();
	}

	// let checkedList = participants.value.filter(i => i.status === 'no_check_in').filter(i => i.checked)
	// if (!checkedList.length) {
	// 	return uni.$u.toast('请勾选参赛人~')
	// }
	
	const promiseList = participants.value.map((item) => signApi(item));
	
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
// check_in_type: qrcode，gps签到的设置成check_in_type: gps
function signApi (item) {
	const data = {
		id: item.id,
		full_name: item.full_name,
		check_in_type: "gps"
	}

	return request.post(`/event-api/ticket/checkin`, data)
}

// 二维码签到点击处理
function handleQrcodeSign() {
	if (isInCheckTime.value) {
		showQrcodePopup.value = true
	} else {
		uni.$u.toast('不在签到时间范围内')
	}
}

// 二维码弹窗打开后生成二维码
async function onQrcodePopupOpen() {
	if (!qrcodeData.value) return
	// 先设置数据
	qrcodeVal.value = qrcodeData.value
	// 等待 Vue 更新完成
	await nextTick()
	// 延迟确保 canvas 已挂载
	setTimeout(() => {
		if (qrcodeRef.value && qrcodeRef.value.val) {
			qrcodeRef.value._makeCode()
		}
	}, 300)
}

const isInPunchArea = ref(false)
async function getUserLocation (userLat, userLng) {
	if (!userLat) {
		return uni.$u.toast('获取不到用户定位信息')
	}
	
	const { checkin_address } =  selectedEvent.value
	
	if (!checkin_address.lat) {
		return console.error('获取不到活动经纬度信息')
	}
	
	const { lat, long } = checkin_address
	
	const UserAreaScope = getUserAreaScope(userLat, userLng, lat, long)
	if (UserAreaScope.isInRange) {
		console.log("✅ 在打卡范围内（≤500米）");
		// 触发打卡逻辑
		isInPunchArea.value = true;
	} else {
		isInPunchArea.value = false;
		const dist = UserAreaScope.distance;
		console.log(`❌ 距离打卡点 ${dist.toFixed(1)} 米，不在范围内`);
	}
}

const handleCheckLocation = async () => {
  try {
    const result = await checkLocationPermission()
    console.log('定位权限状态:', result)

    if (result.status === 'granted') {
      console.log('✅ 定位可用，坐标:', result.location)
      locationGranted.value = true
      // 执行打卡、地图等逻辑
      getUserLocation(result.location.latitude, result.location.longitude)
    } else {
      // 用户拒绝或未授权
      locationGranted.value = false
      isInPunchArea.value = false
    }
  } catch (error) {
    console.error('定位检测异常:', error)
    locationGranted.value = false
    isInPunchArea.value = false
    uni.showToast({ title: '定位功能异常', icon: 'error' })
  }
}

// 用户跳出页面开启定位后返回，直接再检查定位
let isPageLoaded = false
onShow(() => {
	if (isPageLoaded) {
		handleCheckLocation()
	}
	
	isPageLoaded = true
})

onLoad(() => {
	getEvents()
	getClockTime()
})

onUnload(() => {
	clearInterval(timerClockTime)
})
</script>

<style scoped lang="scss">
.sign-in-page {
  background-color: #f8f8f8;
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
	position: absolute;
	bottom : 250rpx;
	left: 50%;
	transform: translate(-50%);
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
	.pending{
		::v-deep{
			.u-button{
				border-color: #FF8C00;
				background: #FF8C00;
				box-shadow: 0rpx 6rpx 12rpx 2rpx #FF8C00;
			}
		}
	}
	.success{
		::v-deep{
			.u-button{
				border-color: #8CC63E;
				background: #8CC63E;
				box-shadow: 0rpx 6rpx 12rpx 2rpx #8CC63E;
			}
		}
	}
	
	.disableButton{
		::v-deep{
			.u-button{
				border-color: #CCCCCC;
				background: #CCCCCC;
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

.qrcode-popup {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .qrcode-title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }

  .qrcode-content {
    margin-bottom: 30rpx;
  }
}

.bottom-qrcode-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 34rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #f8f8f8;
  display: flex;
  justify-content: center;
}

.qrcode-btn-wrap {
  &.is-pressed {
    ::v-deep .u-button {
      filter: brightness(0.85);
      transform: scale(0.98);
    }
  }
}
</style>