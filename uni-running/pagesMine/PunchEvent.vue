<template>
  <view class="sign-in-page">
    <!-- 活动卡片 -->
    <view class="panel-info">
      <view class="activity-header">
        <image src="/static/activity.jpg" class="avatar" />
        <view class="info">
          <text class="title">喜迎十五运 你跑了没</text>
          <text class="time">签到时间：2025-11-30 6:00–8:00</text>
        </view>
        <u-icon name="arrow-down" color="#999" size="40rpx" />
      </view>
    </view>
		
		<view class="panel-info">
			<view class="quota-info flex-start">
			  您名下共有3个参赛名额
			</view>
			
			<!-- 参赛人员列表 -->
			<view class="participants-list">
			  <view v-for="(item, index) in participants" :key="index" class="participant-item">
			    <view class="">
			    	<view class="name-row">
			    	  <text class="name">{{ item.name }}</text>
			    	  <text v-if="item.isMe" class="me-tag flex-center">本人</text>
			    	</view>
			    	<text class="project">报名项目：{{ item.project }}</text>
			    </view>
			    <u-icon name="checkmark-circle-fill" color="#7dc33f" size="40rpx" />
			  </view>
			</view>
		</view>

    <!-- 签到按钮 -->
    <view class="sign-button-container flex-center">
      <u-button
        type="primary"
        shape="circle"
        :custom-style="{ padding: '80rpx 0', fontSize: '40rpx' }"
        @click="handleSign"
      >
        <view class="btn-text">
          <view class="highlight">活动</view>
          <view class="highlight">现场签到</view>
          <text class="time">{{ currentTime }}</text>
        </view>
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 模拟数据
const participants = [
  {
    name: '张小雨',
    isMe: true,
    project: '挑战组10.10km'
  },
  {
    name: '张雪',
    isMe: false,
    project: '欢乐组5.20km'
  },
  {
    name: '张风',
    isMe: false,
    project: '挑战组10.10km'
  }
]

// 当前时间
const currentTime = ref('11:24:39')

onMounted(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 8)
})

// 点击签到按钮
const handleSign = () => {
  uni.showToast({
    title: '签到成功！',
    icon: 'success',
    duration: 1500
  })
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
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
}

.info {
  flex: 1;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.time {
  font-size: 26rpx;
  color: #999;
  margin-top: 4rpx;
}

.quota-info {
  margin-top: -20rpx;
  margin-bottom: 20rpx;
	height: 82rpx;
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
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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
		.u-button{
			width: 272rpx;
			height: 272rpx;
			border-radius: 999px;
			background: #FF8C00;
			box-shadow: 0rpx 6rpx 12rpx 2rpx #FF8C00;
		}
	}
}

.btn-text {
  text-align: center;
  line-height: 1.4;
}

.highlight {
  font-weight: bold;
  color: #fff;
	font-size: 40rpx;
}

.time {
  font-size: 24rpx;
  color: #fff;
  opacity: 0.8;
  margin-top: 8rpx;
}
</style>