<template>
  <view>
		<view class="b" style="font-size: 30rpx;padding: 34rpx 34rpx 0;">选择活动</view>
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
		
		<view style="position: fixed;width:100%;bottom: 100rpx;">
			<u-button type="primary" @click="startScan()"
			customStyle="width:642rpx; margin: 0rpx auto" color="#FF8C00"
				shape="circle">
				点击扫码
			</u-button>
		</view>

		<up-action-sheet round="16"
			@close="isShowEventModal = false"
			:actions="eventList" title="请选择活动" 
			:show="isShowEventModal" @select="changeEvent" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
	onLoad
} from "@dcloudio/uni-app";
import request from "@/utils/request.js"

const isShowEventModal = ref(false)
const selectedEvent = ref({})

function changeEvent(e) {
	console.log(e)
	if (selectedEvent.value.id === e.id) return;

	selectedEvent.value = e

	isShowEventModal.value = false
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

const startScan = () => {
  uni.scanCode({
    onlyFromCamera: true, // 仅从摄像头扫描（不从相册）
    scanType: ['qrCode'],
    success: (res) => {
      console.log('扫码成功:', res.result)
      handleScanResult(res.result)
    },
    fail: (err) => {
      console.error('扫码失败:', err)
      uni.showToast({ title: '扫码已取消', icon: 'none' })
    }
  })
}

// 处理扫码结果
const handleScanResult = (code) => {
	const params = {
		code: code
	}
  request.post('/api/code/code', params).then(res => {
		
	})
}

onLoad(() => {
	getEvents()
})
</script>

<style scoped>
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
</style>