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
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0" ref="mescroll">
			<view class="card-list">
				<view class="card-item" v-for="item in dataList" :key="item.event_id" :style="getCardStyle(item)" @click="viewDetail(item)">
					<view class="card-cover">
						<image class="card-cover-img"
							:src="item.image_url + '?x-oss-process=image/resize,w_400/quality,q_75/format,webp&t=' + cacheKey"
							mode="aspectFill" lazy-load />
					</view>
					<view class="card-body">
						<view class="card-title ellipsis2">{{item.name}}</view>
						<view class="card-meta">
							<view class="meta-item" v-if="item.event_time">
								<u-icon name="clock" size="24rpx" color="#999" />
								<text class="meta-text">{{item.event_time}}</text>
							</view>
							<view class="meta-item" v-if="item.event_location">
								<u-icon name="map" size="24rpx" color="#999" />
								<text class="meta-text">{{item.event_location}}</text>
							</view>
							<view class="meta-item" v-if="item.view_count">
								<u-icon name="eye" size="24rpx" color="#999" />
								<text class="meta-text">{{item.view_count}}</text>
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
		ref,
		nextTick
	} from "vue";
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback,getMescroll } = useMescroll(onPageScroll, onReachBottom)

	const cacheKey = Date.now()
	import request from "@/utils/request.js";
	import { useShare } from "@/composables/useShare.js";
	import dayjs from "dayjs";

	// 分享配置
	// useShare({
	// 	title: '活动相册',
	// 	path: '/pagesDashboard/eventAlbum/albumList'
	// });

	function getCardStyle(item) {
		const cc = item.color_config
		if (!cc) return {}
		const hex2rgba = (hex, a) => {
			const r = parseInt(hex.slice(1, 3), 16)
			const g = parseInt(hex.slice(3, 5), 16)
			const b = parseInt(hex.slice(5, 7), 16)
			return `rgba(${r}, ${g}, ${b}, ${a})`
		}
		const style = {}
		const g = cc.gradient
		if (g?.length === 2) {
			style.background = `linear-gradient(135deg, ${hex2rgba(g[0], 0.08)}, #ffffff 40%, #ffffff 60%, ${hex2rgba(g[1], 0.06)})`
			style.boxShadow = `0 2px 10px ${hex2rgba(g[0], 0.12)}, 0 1px 4px ${hex2rgba(g[1], 0.08)}`
		} else if (cc.solid) {
			style.boxShadow = `0 2px 10px ${hex2rgba(cc.solid, 0.12)}`
		}
		return style
	}

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
		console.log("刷新列表")
		nextTick(() => {
			getMescroll().resetUpScroll();
			getMescroll().scrollTo(0, 0);
			// mescroll.value?.resetUpScroll(); // 重置列表数据为第一页
			// mescroll.value?.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
		});
	};

	const dataList = ref([])
	const getList = (mescroll) => {
		uni.showLoading({
			mask: true
		});

		const params = {
			page_index: mescroll.num - 1,
			page_size: 10,
			keyword: searchTxt.value
		};

		request.get(`/image-service/albums/list`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (mescroll.num == 1) dataList.value = []

				const list = (res.albums || []).map(item => ({
					...item,
					event_time: item.event_time ? dayjs(item.event_time).format('YYYY-MM-DD') : ''
				}));

				dataList.value = dataList.value.concat(list)

				//隐藏下拉刷新和上拉加载的状态;
				mescroll.endSuccess(list.length);
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
		background: #f5f5f5;
	}

	.card-list {
		padding: 24rpx 34rpx;
	}

	.card-item {
		display: flex;
		flex-direction: row;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		border: 2rpx solid rgba(0, 0, 0, 0.06);

		.card-cover {
			flex: none;
			width: 240rpx;
			align-self: stretch;
			min-height: 200rpx;
			overflow: hidden;

			.card-cover-img {
				width: 100%;
				height: 100%;
				display: block;
			}
		}

		.card-body {
			flex: 1;
			padding: 24rpx;
			display: flex;
			flex-direction: column;
			gap: 14rpx;
			overflow: hidden;

			.card-title {
				font-weight: 600;
				font-size: 28rpx;
				color: #1a1a1a;
				line-height: 1.4;
				text-align: left;
			}

			.card-meta {
				display: flex;
				flex-direction: column;
				gap: 14rpx;

				.meta-item {
					display: flex;
					align-items: center;
					gap: 10rpx;
					min-width: 0;

					.meta-text {
						font-size: 24rpx;
						color: #999;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}
		}
	}
</style>