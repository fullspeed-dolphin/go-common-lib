<template>
	<view class="bg">
		<u-navbar autoBack placeholder title="跑币排行榜" bgColor="transparent"></u-navbar>
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0" :up="{ auto: false }">
			<view class="card-item bgf u-flex" v-for="(item, index) in dataList" :key="index">
				<up-lazy-load class="img" borderRadius="16" :image="item.avatar_url + '?x-oss-process=image/resize,w_150,h_150,m_fill'" mode="aspectFill" />

				<view class="card-content">
					<view class="title u-flex-y-center">
						<view class="ellipsis u-m-r-10" style="max-width: 300rpx;">{{item.nickname}}</view>
						
						<view v-if="item.fscoin" class="u-flex-y-center">
							<image style="width:20rpx;height:20rpx;" src="/static/images/coin.png" mode="aspectFill"></image>
							<view style="font-size: 16rpx;color: #FF8C00;">{{item.fscoin}}个</view>
						</view>
					</view>
					
					<view v-if="item.running_group" class="group-name flex-center">
						{{item.running_group}}
					</view>
					
					<view v-if="item.fscoin" class="rank">
						<image v-if="index === 0" class="icon" src="./assets/Frame@2x (3).png" mode="aspectFill" />
						<image v-if="index === 1" class="icon" src="./assets/Frame@2x (4).png" mode="aspectFill" />
						<image v-if="index === 2" class="icon" src="./assets/Frame@2x (5).png" mode="aspectFill" />
						<image v-if="index === 3" class="icon" src="./assets/Frame@2x (6).png" mode="aspectFill" />
						<image v-if="index === 4" class="icon" src="./assets/Frame@2x (7).png" mode="aspectFill" />
						<image v-if="index === 5 || index === 6 || index === 7" class="icon" src="./assets/Frame@2x (8).png" mode="aspectFill" />
						<view class="txt flex-center">{{index + 1}}</view>
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
	import { useShare } from "@/composables/useShare.js";

	// 分享配置
	useShare({
		title: '跑币排行榜',
		path: '/pagesSub/runCoin/coinRanks'
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
		uni.showLoading({ mask: true });

		const params = {
			page: mescroll.num,
			page_size: 10,
		};

		request.get(`/wallet-api/wallet/list`, params).then((res) => {
				// 第一页清空列表
				if (mescroll.num == 1) dataList.value = []

				const list = res.list || []
				dataList.value = dataList.value.concat(list)

				uni.hideLoading();
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
	.bg{
		position: relative;
		&:before{
			position: absolute;
			content: "";
			width: 100vw;
			height: 461rpx;
			background: #F9EEE4;
			border-radius: 0px 0px 0px 0px;
			filter: blur(100rpx);
		}
	}

	.card-item{
		position: relative;
		width: 682rpx;
		min-height: 200rpx;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin: 0rpx auto 30rpx;
		align-items: flex-start;
		.rank{
			position: absolute;
			top:0;
			right: 22rpx;
			.icon{
				width: 56rpx;
				height: 56rpx;
			}
			.txt{
				position: absolute;
				top:20rpx;
				right: 22rpx;
				color: #fff;
				width: 16rpx;
				height: 34rpx;
				font-size: 24rpx;
				font-weight: 800;
			}
		}
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
			font-size: 30rpx;
			color: #000;
			line-height: 42rpx;
			margin-bottom: 16rpx;
		}

		.group-name{
			min-width: 164rpx;
			height: 40rpx;
			padding: 0 10rpx;
			color: #D3B4A8;
			background: #F9F1F0;
			font-size: 24rpx;
			border-radius: 8rpx 8rpx 8rpx 8rpx;
		}
	}
</style>