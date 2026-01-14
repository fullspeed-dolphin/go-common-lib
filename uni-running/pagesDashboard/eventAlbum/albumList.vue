<template>
	<view>
		<section class="section-search u-flex">
			<u-search v-model="searchTxt" @search="refreshList" placeholder="请输入赛事名称" shape="round" bgColor="#fff"
				borderColor="#FF8C00" :showAction="false"></u-search>
			<!-- <view class="u-flex-xy-center iconfont icon-sheyingshiguanli" 
				@click="$u.route('pagesDashboard/eventAlbum/contractForm')" 
				style="width: 84rpx;font-size: 47rpx;font-family: 500;color:#707070;">
			</view> -->
		</section>
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
			<view class="card-item bgf u-flex" v-for="item in dataList" :key="item.event_id" @click="viewDetail(item)">
				<up-lazy-load class="img" borderRadius="16" :image="item.image_url + '?x-oss-process=image/resize,w_100,h_100,m_fill'" mode="aspectFill" />
				
				<view class="" style="width:510rpx;margin-left:12rpx;">
					<view class="u-flex">
						<view class="title ellipsis2 mb15" style="width:420rpx;line-height: 1.2;">
							{{item.description}}
						</view>
						<!-- <view class="u-ml-5">2345张</view> -->
					</view>
					<view class="">
						<view class="u-flex-y-center" style="width:180rpx;">
							<u-icon name="clock" labelPos="top" size="12" />
							<view class="ml10">
								{{item.event_time}}
							</view>
						</view>
						
						<view class="u-flex  u-ml-10">
							<u-icon name="map" size="12" />
							<view class="ml10 ellipsis2" style="line-height:1.2">
								{{item.event_location}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</mescroll-body>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom)

	import request from "@/utils/request.js"

	const searchTxt = ref("")

	// 方法定义
	const viewDetail = (item) => {
		uni.$u.route({
			url: `pagesDashboard/eventAlbum/albumDetail`,
			params: {
				...item
			}
		});
	};
	
	let mescroll = ref(null);
	const refreshList = () => {
		nextTick(() => {
			mescroll.value.resetUpScroll(); // 重置列表数据为第一页
			mescroll.value.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
		});
	};

	const dataList = ref([])
	const getList = (mescroll) => {
		uni.showLoading({
			mask: true
		});

		const params = {
			pageIndex: mescroll.num - 1,
			pageSize: 10,
			keyword: searchTxt.value
		};

		request.get(`/event-api/getOfflineEventSwiper`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (mescroll.num == 1) dataList.value = []

				res = res.filter(item => item.event_id).map(item => {
					return {
						event_id: item.event_id,
						description: item.description,
						image_url: item.image_url,
						event_time: item.event_time?.slice(0, 10),
						event_location: item.event_location
					}
				});

				dataList.value = dataList.value.concat(res)

				//隐藏下拉刷新和上拉加载的状态;
				mescroll.endSuccess(res.length);
			})
			.catch((error) => {
				console.log(error)
				uni.hideLoading();
				mescroll.endErr();
			});
	};
</script>

<style lang="scss" scoped>
	.section-search{
		position: relative;
		z-index: 10;
		padding: 20rpx 34rpx;
		background: #fafafa;
	}
	
	.card-item{
		width: 682rpx;
		min-height: 150rpx;
		border-radius: 16rpx;
		padding: 20rpx 16rpx;
		margin: 0rpx auto 30rpx;
		color:#979797;font-size:24rpx;
		.img{
			width: 120rpx;
			height: 120rpx;
		}
		.title{
			font-weight: bold;
			font-size: 28rpx;
			color:#000;
		}
		::v-deep{
			.u-icon--right{
				align-items: flex-start;
			}
		}
	}
</style>