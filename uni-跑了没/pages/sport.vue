<template>
  <view class="pt20">
		<u-navbar title="运动" :leftIcon="false"></u-navbar>
		
		<section class="section-dashboard">
			<view class="h1">
				累计里程
			</view>
			<view class="bar flex-start">
				<view class="amount">
					0.00
				</view>
				<view class="">公里</view>
			</view>
			<view class="statics flex-row">
				<view class="flex-1">
					<view class="label">运动次数</view>
					<view class="value">0</view>
				</view>
				<view class="flex-1">
					<view class="label">平均配速</view>
					<view class="value">--</view>
				</view>
				<view class="flex-1">
					<view class="label">时长</view>
					<view class="value">--</view>
				</view>
				<view class="flex-1">
					<view class="label">消耗大卡</view>
					<view class="value">0</view>
				</view>
			</view>
		</section>
		
		<!-- <section class="panel" style="padding:0;overflow: hidden;">
			<u-collapse :value="['row-0']">
				<u-collapse-item title="2025年9月" :name="'row-'+index" v-for="(item, index) in bannerList" :key="'row-'+index">
					<template #sub>
						<view class="flex-start amount-number">
					</template>
						<view class="amount">0.00</view>
						<view class="">公里</view>
					</view>
					
					<SportItem :item="{}" v-for="(item,sindex) in 3" :key="'index' + sindex" />
				</u-collapse-item>
			</u-collapse>
		</section> -->
		
		<view class="flex-center" 
			style="height: 20vh; font-weight: 500;
			font-size: 34rpx;
			color: #707070;">
			暂无数据
		</view>
		
		<tabbar type="sport"/>
  </view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"
	import SportItem from "@/components/SportItem.vue"

export default {
	components: { tabbar, SportItem },
  data () {
    return {
			bannerList: [
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
			],
		};
  },
  methods: {
		getBannerList() {
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
.section-dashboard{
	width: 682rpx;
	height: 376rpx;
	margin: 0 auto;
	padding: 50rpx 16rpx 0;
	background: linear-gradient( 180deg, #FFB861 0%, #FFFFFF 100%);
	box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
	border-radius: 16rpx 16rpx 16rpx 16rpx;
	.h1{
		font-weight: 500;
		font-size: 34rpx;
		line-height: 48rpx;
	}
	.bar{
		width: 650rpx;
		height: 90rpx;
		margin: 20rpx 0 40rpx; 
		background: rgba(255,255,255, .3);
		padding-left: 30rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		font-size: 24rpx;
		.amount{
			font-weight: bold;
			font-size: 44rpx;
			margin-right: 10rpx;
		}
	}
}
.statics{
	font-size: 24rpx;
	line-height: 48rpx;
	padding-left: 12rpx;
	.value{
		// margin-top:6rpx;
	}
}
.amount-number{
	color: #979797;
	font-size: 24rpx;
	.amount{
		font-weight: bold;
		font-size: 34rpx;
		margin-right: 4rpx;
		color: #000;
	}
}

::v-deep{
	.u-collapse-item{
		.u-cell{
			.u-cell__body{
				padding: 27rpx;
			}
		}
	}
}
</style>
