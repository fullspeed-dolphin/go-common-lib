<template>
	<view>
		<u-navbar autoBack placeholder  title="活动相册" />
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
				<up-lazy-load class="img" borderRadius="16" :image="item.image_url + '?x-oss-process=image/resize,w_150,h_150,m_fill'" mode="aspectFill" />

				<view class="card-content">
					<view class="title ellipsis2">
						{{item.description}}
					</view>
					<view class="info-row">
						<u-icon name="clock" size="14" />
						<view class="info-text">
							{{item.event_time}}
						</view>
					</view>
					<view class="info-row">
						<u-icon name="map" size="14" />
						<view class="info-text ellipsis2">
							{{item.event_location}}
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

	import request from "@/utils/request.js";
	import { useShare } from "@/composables/useShare.js";

	// 分享配置
	useShare({
		title: '活动相册',
		path: '/pagesDashboard/eventAlbum/albumList'
	});

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

		request.get(`/event-api/api/v1/events`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (mescroll.num == 1) dataList.value = []

				res = res.events?.filter?.(item => item.id).map(item => {
					return {
						event_id: item.id,
						name: item.name,
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
		min-height: 200rpx;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin: 0rpx auto 30rpx;
		align-items: flex-start;

		.img{
			width: 160rpx;
			height: 160rpx;
			flex-shrink: 0;
		}

		.card-content{
			flex: 1;
			margin-left: 24rpx;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-start;
		}

		.title{
			font-weight: bold;
			font-size: 32rpx;
			color: #000;
			line-height: 1.4;
			margin-bottom: 16rpx;
			text-align: left;
		}

		.info-row{
			display: flex;
			align-items: flex-start;
			margin-top: 12rpx;
			color: #979797;
			font-size: 26rpx;
			line-height: 1.4;
			text-align: left;
		}

		.info-text{
			margin-left: 12rpx;
			text-align: left;
		}

		::v-deep{
			.u-icon--right{
				align-items: flex-start;
			}
		}
	}
</style>