<template>
  <view class="index-page">
		<u-navbar title="跑了没" :leftIcon="false"></u-navbar>
		
		<view class="" style="position:relative;z-index: 10;">
			<view class="section-search" @click="$u.route('pagesSub/groupList')">
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
					<section class="section-offline" @click="$u.route(`pagesSub/offlineEvents?id=${item.event_id}`)">
						<!-- <image class="poster" :src="item.background_image_url" mode="aspectFill"></image> -->
						<view class="section-banner">
							<image class="img" :src="item.image_url" mode="aspectFill"></image>
						</view>
						<view class="flex-start">
							<view class="flex-1 ofh text">
								<view class="name ellipsis">{{item.description}}</view>
								<view class="time">{{item.event_time}}</view>
							</view>
							
							<u-button type="primary" :color="item.status !== 'ACT' ? '#999' : ''" textColor="#fff" :disabled="item.status !== 'ACT'" size="small" shape="circle">
								<block v-if="item.status === 'PND'">未开始</block>
								<block v-if="item.status === 'ACT'">报名</block>
								<block v-if="item.status === 'EXP'">已截止</block>
							</u-button>
						</view>
					</section>
				</swiper-item>
			</swiper>
			
			<!-- <view class="section-title">线上赛事</view>
			<section class="section-offline"  @click="$u.route('pagesSub/offlineEvents')">
				<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				<view class="flex-start">
					<view class="text">
						<view class="name ellipsis">奔跑吧！广州·增城站奔跑吧！广州·增城站广州·增城站</view>
						<view class="time">2025.10.26 8:00</view>
					</view>
					<u-button type="primary" size="small" shape="circle" disabled color="#f4f4f4" text="未开始"></u-button>
				</view>
			</section> -->
			
			<view class="section-title flex-between-center" @click="$u.route('pagesSub/groupList')">
				跑团招募
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<GroupItem :item="item" v-for="(item,index) in GroupList" :key="index" />
			</section>
			
			<!-- <view class="section-title flex-between-center">
				名人达人
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<view class="group-item flex-start" v-for="(item,index) in 3" :key="index">
					<image class="poster radius999" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
					<view class="text">
						<view class="flex-between-center" style="width: 520rpx;">
							<view class="">
								<view class="name ellipsis">昵称</view>
								<view class="city ellipsis">广东广州</view>
							</view>
							<u-button type="primary" size="small" shape="circle" text="关注"></u-button>
						</view>
						<view class="desc ellipsis" style="color:#333;">全国跑友一家亲，SEA跑团来相聚。生命不息，跑···</view>
					</view>
				</view>
			</section> -->
		</view>
		
		<tabbar type="index"/>
  </view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"
	import GroupItem from "@/components/GroupItem.vue"
export default {
	components: { tabbar, GroupItem },
  data () {
    return {
			searchTxt: "",
			eventList: [],
			bannerEventList: [],
			bannerList: [],
			GroupList: []
		};
  },
	onLoad(options) {
		// #ifdef MP-WEIXIN
		wx.showShareMenu()
		// #endif
	},
	onShow() {
		this.getGroupList()
		this.getEvents()
		this.getBannerList()
	},
  methods: {
		clickSwiper(item) {
			if (item.event_id) {
				uni.$u.route(`pagesSub/offlineEvents?id=${item.event_id}`)
				
				return;
			}
			if (item.redirect_url) {
				uni.$u.route(`pagesSub/settings/webView?link=${item.redirect_url}`)
				
				return;
			}
				// uni.$u.route(`pagesSub/settings/webView?link=https://mp.weixin.qq.com/s/oNW0UYJCb78zrmzyoY0_Mg?token=1740573090&lang=zh_CN`)
		},
		confirmSearch() {
			const searchTxt = this.searchTxt.trim()
		},
		routeTo(link) {
			console.log(link)
			uni.$u.route(link);
		},
		getEvents() {			
			this.$axios.get(`/event-api/getOfflineEventSwiper`).then(res => {
				this.bannerEventList = res;
				uni.hideLoading()
			})
		},
		getBannerList() {
			if(!this.bannerList.length) {
				uni.showLoading({mask: true})
			}

			this.$axios.get(`/event-api/getTopSwiper`).then(res => {
				this.bannerList = res;
				uni.hideLoading()
			})
		},
		getGroupList() {
			const data = {
				"pageIndex": 0,
				"pageSize": 5,
				"keyword": ""
			}
			this.$axios.get(`/running-group/api/v1/groups/list`, data).then(res => {
				this.GroupList = res.data;
			})
		},
	}
};
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
				// color: #707070!important;
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
