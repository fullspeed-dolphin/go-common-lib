<template>
  <view class="index-page">
		<u-navbar placeholder title="跑了没" :leftIcon="false"></u-navbar>
		
		<view class="" style="position:relative;z-index: 10;">
			<view class="section-search" @click="uni.$u.route('pagesSub/groupList')">
				<u-search :disabled="true" placeholder="搜索赛事或跑团" shape="round" bgColor="#fff" borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
			<view class="section-banner">
				<swiper class="swiper" circular indicator-dots indicator-active-color="#FF8C00" :autoplay="true" :interval="3000">
					<swiper-item v-for="(item, index) in bannerList" :key="index">
						<image class="img" :src="item.image_url" mode="aspectFill" @click="clickSwiper(item)"></image>
					</swiper-item>
				</swiper>
			</view>
			
			<view class="section-title">线下活动</view>
			<swiper class="event-swiper" circular indicator-active-color="#FF8C00" :autoplay="true" :interval="3000">
				<swiper-item v-for="(item, index) in bannerEventList" :key="index">
					<section class="section-offline" @click="uni.$u.route(`pagesSub/offlineEvents?id=${item.event_id}`)">
						<view class="section-banner">
							<image class="img" :src="item.image_url" mode="aspectFill"></image>
						</view>
						<view class="flex-start">
							<view class="flex-1 ofh text">
								<view class="name ellipsis">{{ item.description }}</view>
								<view class="time">{{ item.event_time }}</view>
							</view>
							
							<u-button type="primary" :color="item.status !== 'ACT' ? '#999' : ''" textColor="#fff" :disabled="item.status !== 'ACT'" size="small" shape="circle">
								<template v-if="item.status === 'PND'">未开始</template>
								<template v-if="item.status === 'ACT'">报名</template>
								<template v-if="item.status === 'EXP'">已截止</template>
							</u-button>
						</view>
					</section>
				</swiper-item>
			</swiper>
			
			<view class="section-title flex-between-center" @click="uni.$u.route('pagesSub/groupList')">
				跑团招募
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<GroupItem v-for="(item, index) in GroupList" :key="index" :item="item" />
			</section>
		</view>
		
		<tabbar type="index"/>
  </view>
</template>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import tabbar from "@/components/tabBar.vue"
import GroupItem from "@/components/GroupItem.vue"

// Reactive state
const searchTxt = ref("")
const eventList = ref([])
const bannerEventList = ref([])
const bannerList = ref([])
const GroupList = ref([])

// Lifecycle hooks
onLoad(() => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu()
  // #endif
})

onShow(() => {
  getGroupList()
  getEvents()
  getBannerList()
})

// Methods
const clickSwiper = (item) => {
  if (item.event_id) {
    uni.$u.route(`pagesSub/offlineEvents?id=${item.event_id}`)
    return
  }
  if (item.redirect_url) {
    uni.$u.route(`pagesSub/settings/webView?link=${item.redirect_url}`)
    return
  }
}

const confirmSearch = () => {
  const searchValue = searchTxt.value.trim()
}

const routeTo = (link) => {
  console.log(link)
  uni.$u.route(link)
}

const getEvents = async () => {
  try {
    const res = await getCurrentInstance().appContext.config.globalProperties.$axios.get('/event-api/getOfflineEventSwiper')
    bannerEventList.value = res
    uni.hideLoading()
  } catch (error) {
    console.error('Failed to fetch events:', error)
  }
}

const getBannerList = async () => {
  if (!bannerList.value.length) {
    uni.showLoading({ mask: true })
  }

  try {
    const res = await getCurrentInstance().appContext.config.globalProperties.$axios.get('/event-api/getTopSwiper')
    bannerList.value = res
    uni.hideLoading()
  } catch (error) {
    console.error('Failed to fetch banner list:', error)
    uni.hideLoading()
  }
}

const getGroupList = async () => {
  const data = {
    pageIndex: 0,
    pageSize: 5,
    keyword: ""
  }
  
  try {
    const res = await getCurrentInstance().appContext.config.globalProperties.$axios.get('/running-group/api/v1/groups/list', data)
    GroupList.value = res.data
  } catch (error) {
    console.error('Failed to fetch group list:', error)
  }
}
</script>

<style lang="less" scoped>
	.event-swiper{
		height: 360rpx;
	}
	.radius999{
		border-radius: 999em!important;
	}
	.section-offline{
		padding: 0 34rpx;
		.poster{
			display: block;
			width: 682rpx;
			height: 270rpx;
			background: #f5f5f5;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.text{
			padding: 20rpx 16rpx;
			.name{
				line-height: 40rpx;
				margin-bottom: 10rpx;
			}
			.time{
				line-height: 28rpx;
				font-size: 20rpx;
			}
		}
		::v-deep{
			.u-button--disabled{
				opacity: 0.6;
			}
		}
	}
	
	.section-banner{
		min-height: 270rpx;
		width: 682rpx;
		margin: 0 auto;
		border-radius: 16rpx!important;
		overflow: hidden;
		
		.swiper{
			height: 270rpx;
		}
		.img{
			display: block;
			width: 100%;
			height: 270rpx;
			border-radius: 16rpx!important;
			overflow: hidden;
		}
	}
	.section-title{
		margin: 50rpx 0 30rpx;
		position: relative;
		font-weight: bold;
		font-size: 34rpx;
		color: #000000;
		padding-left:78rpx;
		line-height: 48rpx;
		padding-right: 34rpx;
		&:before{
			position: absolute;
			content: "";
			left:0;
			width: 58rpx;
			height: 48rpx;
			background: linear-gradient( 90deg, #FFFFFF 0%, #FF8C00 100%);
		}
		.txt{
			font-size: 28rpx;
			font-weight: 400;
		}
	}
		
	::v-deep{
		.section-search{
			position: relative;
			height: 130rpx;
			&:before{
				position: absolute;
				content: "";
				width: 100%;
				height: 100%;
				top:0;
				left:0;
				z-index: 12;
			}
		}
		.u-search{
			position: fixed;
			// top:44px;
			width: 100%;
			z-index: 10;
			background: #fff;
			padding: 20rpx 34rpx;
		}
	}
</style>
