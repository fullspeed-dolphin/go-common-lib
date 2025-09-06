<template>
  <view class="index-page">
		<u-navbar title="跑了没"></u-navbar>
		
		<view class="" style="position:relative;z-index: 10;">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="confirmSearch" placeholder="搜索赛事或跑团 ..." shape="round" bgColor="#fff" borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
			<view class="section-banner">
				<u-swiper :list="bannerList" height="270rpx" 
					 indicatorMode="dot"
					 indicatorActiveColor="#FF8C00"
					 indicator circular>
				</u-swiper>
			</view>
			
			<view class="section-title">线下活动</view>
			<section class="section-offline" @click="routeTo('pagesSub/offlineEvents')">
				<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				<view class="flex-start">
					<view class="text">
						<view class="name ellipsis">奔跑吧！广州·增城站奔跑吧！广州·增城站广州·增城站</view>
						<view class="time">2025.10.26 8:00</view>
					</view>
					<u-button type="primary" size="small" shape="circle" text="报名"></u-button>
				</view>
			</section>
			
			<view class="section-title">线上赛事</view>
			<section class="section-offline"  @click="routeTo('pagesSub/offlineEvents')">
				<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				<view class="flex-start">
					<view class="text">
						<view class="name ellipsis">奔跑吧！广州·增城站奔跑吧！广州·增城站广州·增城站</view>
						<view class="time">2025.10.26 8:00</view>
					</view>
					<u-button type="primary" size="small" shape="circle" disabled color="#f4f4f4" text="未开始"></u-button>
				</view>
			</section>
			
			<view class="section-title flex-between-center">
				跑团
				<view class="flex-start">
					<view class="txt">更多</view>
					<u-icon name="arrow-right" size="34rpx" color="rgba(0,0,0,.9)"></u-icon>
				</view>
			</view>
			<section class="section-group">
				<view class="group-item flex-start" v-for="(item,index) in 3" :key="index">
					<image class="poster" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
					<view class="text">
						<view class="flex-between-center" style="width: 520rpx;">
							<view class="">
								<view class="name ellipsis">SEA跑团</view>
								<view class="city ellipsis">广东广州 738人</view>
							</view>
							<u-button type="primary" size="small" shape="circle" text="加入"></u-button>
						</view>
						<view class="desc ellipsis">全国跑友一家亲，SEA跑团来相聚。生命不息，跑···</view>
					</view>
				</view>
			</section>
			
			
			<view class="section-title flex-between-center">
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
			</section>
		</view>
		
		<tabbar type="index"/>
  </view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"

export default {
	components: { tabbar },
  data () {
    return {
			searchTxt: "",
			bannerList: [
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
			],
		};
  },
  methods: {
		confirmSearch() {
			const searchTxt = this.searchTxt.trim()
			
		},
		routeTo(link) {
			console.log(link)
			uni.$u.route(link);
		},
		getBannerList() {
			if(!this.bannerList.length) {
				uni.showLoading({mask: true})
			}
			const data = {
				Position: 0
			}
			this.$axios.post(`/Advertisement/Search/List`, data).then(res => {
				this.bannerList = res.List;
				uni.hideLoading()
			})
		},
	}
};
</script>

<style lang="less" scoped>
	.radius999{
		border-radius: 999em!important;
	}
	.section-offline{
		padding: 0 34rpx;
		.poster{
			display: block;
			width: 682rpx;
			height: 270rpx;
			background: #C1C5C6;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.text{
			padding: 20rpx 16rpx;
			width: 560rpx;
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
				color: #707070!important;
			}
		}
	}
	
	.section-banner{
		width: 682rpx;
		margin: 0 auto;
		border-radius: 16rpx!important;
		overflow: hidden;
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
	
	.group-item{
		padding: 20rpx 34rpx;
		.poster{
			width: 124rpx;
			height: 124rpx;
			background: #C1C5C6;
			margin-right: 40rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			line-height: 40rpx;
			margin-bottom: 12rpx;
		}
		.city{
			line-height: 28rpx;
			font-size: 20rpx;
			margin-bottom: 18rpx;
		}
		.desc{
			width: 422rpx;
			line-height: 26rpx;
			font-size: 18rpx;
		}
	}
	
	::v-deep{
		.section-search{
			height: 130rpx;
		}
		.u-search{
			position: fixed;
			top:44px;
			width: 100%;
			z-index: 10;
			background: #fff;
			padding: 20rpx 34rpx;
		}
	}
</style>
