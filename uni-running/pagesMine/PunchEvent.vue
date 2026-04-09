<template>
  <view class="sign-in-page">
	<u-navbar autoBack placeholder  title="现场签到" />
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
					disableButton: !canSign
				}"
				:style="canSign ? {
					'--btn-bg': punchInStatus === 'success'
						? '#8CC63E'
						: `linear-gradient(135deg, ${themeColor.gradient[0]}, ${themeColor.gradient[1]})`,
					'--btn-shadow': 'transparent',
					'--btn-border': 'transparent',
				} : {}">
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
				<template v-if="!isInCheckTime && selectedEvent.checkin_start_time">不在签到时间</template>
			</view>
		</div>

		<!-- 底部人工签到入口 -->
		<view v-if="participants.length && isInCheckTime" class="bottom-manual-link" @click="handleQrcodeSign">
			无法签到？<text :style="{ color: themeColor.solid }">点此人工签到</text>
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
					:color="themeColor.solid"
					@click="showQrcodePopup = false"
				>
					关闭
				</u-button>
			</view>
		</u-popup>
		
		<u-picker
			round="14"
			title="请选择活动"
			:show="isShowEventModal"
			:columns="[eventList]"
			keyName="label"
			:defaultIndex="eventDefaultIndex"
			confirmColor="#FF8C00"
			@confirm="onEventConfirm"
			@cancel="isShowEventModal = false"
		/>
		
		<UserLogin ref="refUserLogin" @success="onLoginSuccess"/>
  </view>
</template>

<script setup>
import dayjs from "dayjs";
import { ref, onMounted, computed, nextTick } from 'vue'
import UserLogin from "@/components/UserLogin.vue";
import request from "@/utils/request.js"
import { asyncAlls } from "@/utils/util.js"
import {
	onLoad,
	onUnload,
} from "@dcloudio/uni-app";

	import {
		useStore
	} from "vuex";
import { useShare } from "@/composables/useShare.js";

// 使用store
const store = useStore();

// 分享配置
useShare({
	title: '活动签到',
	path: '/pagesMine/PunchEvent'
});
const refUserLogin = ref(null);

// 待执行的操作（登录成功后继续执行）
const pendingAction = ref(null);

// 登录成功回调
const onLoginSuccess = () => {
	getEvents();
	if (pendingAction.value) {
		pendingAction.value();
		pendingAction.value = null;
	}
};

const punchInStatus = ref('pending')
const isShowEventModal = ref(false)
const selectedEvent = ref({})
const showQrcodePopup = ref(false)
const qrcodeData = ref('')
const qrcodeVal = ref('')
const qrcodeRef = ref(null)

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
const eventDefaultIndex = ref([0])

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
				label: item.name,
				value: item.id,
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

// 按钮是否可用：仅判断签到时间
const canSign = computed(() => isInCheckTime.value)

// 按钮不可用的原因提示
const disableReason = computed(() => {
	if (!isInCheckTime.value) return '不在签到时间'
	return ''
})

// hex 转 rgba
function hexToRgba(hex, alpha) {
	hex = hex.replace('#', '')
	if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
	const r = parseInt(hex.substring(0,2), 16)
	const g = parseInt(hex.substring(2,4), 16)
	const b = parseInt(hex.substring(4,6), 16)
	return `rgba(${r},${g},${b},${alpha})`
}

// 活动主题色
const themeColor = computed(() => {
	const cc = selectedEvent.value?.color_config
	const solid = cc?.solid || '#FF8C00'
	return {
		solid,
		gradient: cc?.gradient || [solid, solid],
		shadow: hexToRgba(solid, 0.35),
	}
})

function selectSigner(item) {
	item.checked = !item.checked

	punchInStatus.value = 'pending'
}

// u-picker 确认事件
function onEventConfirm(detail) {
	const e = detail.value[0]
	changeEvent(e)
}

function changeEvent(e) {
	console.log(e)
	if (selectedEvent.value.id === e.id) return;

	// 更新 defaultIndex
	const idx = eventList.value.findIndex(item => item.id === e.id)
	if (idx !== -1) {
		eventDefaultIndex.value = [idx]
	}

	selectedEvent.value = e

	get_isInCheckTime()  // 立即检测时间状态
	getCurrentEventSigners()
	isShowEventModal.value = false
	punchInStatus.value = 'pending'
}

const participants = ref([])
const getCurrentEventSigners = () => {
	if (!store.state.userInfo.id) {
		pendingAction.value = () => getCurrentEventSigners();
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
		pendingAction.value = () => handleSign();
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
			background: var(--btn-bg, #FF8C00);
			border-color: var(--btn-border, #FF8C00);
			box-shadow: 0rpx 6rpx 16rpx 0rpx var(--btn-shadow, rgba(255,140,0,0.35));
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

.bottom-manual-link {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 0;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  text-align: center;
  font-size: 26rpx;
  color: #999;
}
</style>