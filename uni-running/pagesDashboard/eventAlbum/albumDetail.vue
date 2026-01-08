<!-- UI 参考 https://m.alltuu.com/album/3102256506/?menu=live -->
<template>
	<view class="albumDetail-page">
		<zPaging ref="paging" use-virtual-list cell-height-mode="fixed" :virtual-list-col="4"
			:inner-list-style="{'display':'flex','flex-wrap':'wrap'}" fixed-cell-height="180rpx" :default-page-size="60"
			:force-close-inner-list="true" @virtualListChange="e => virtualList = e" @query="queryList" @scroll="onListScroll">

			<AlbumInfo />

			<view style="height: 44px;">
				<section class="section-tabs flex-between-center" :class="{isFixed: isShowBackTop}"
					:style="{ top: addUnit(getPx('44px') + getWindowInfo().statusBarHeight,'px') }">
					<view class="u-flex-row">
						<view class="item" :class="{active: displayType === 'photo'}" @click="changeTab('photo')">照片</view>
						<view class="item" :class="{active: displayType === 'video'}" @click="changeTab('video')">视频</view>
					</view>
					<view class="">
						<button class="share-btn flex-center" open-type="share">
							<view class="iconfont icon-fenxiang"></view>
						</button>
					</view>
				</section>
			</view>

			<view v-if="isShowBackTop" @click="$refs.paging.scrollToTop()" class="back-to-top" :class="{active: isScrolling}">
				<view class="box">
					<view class="flex-center">
						顶部 <text class="iconfont icon-back-top"></text>
					</view>
					<view class="number">{{ currentImageIndex }} / {{album_total}}</view>
				</view>
			</view>

			<view class="u-flex u-flex-wrap u-p-10">
				<block v-if="displayType === 'photo'">
					<image class="card-img" :src="item.item + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'"
						mode="aspectFill" v-for="(item, index) in virtualList" :id="'zp-id-' + item.zp_index" :key="item.zp_index"
						@click="handleImg(item.item,item.zp_index)" />
				</block>
				
				<block v-if="displayType === 'video'">
					<view class="card-video" v-for="(item, index) in virtualList" :id="'zp-id-' + item.zp_index"
						:key="item.zp_index" @click="$refs.refPreviewVideo.openModal(item.item)">
						<view class="iconfont icon-bofang"></view>
						<image class="img" :src="item.item + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'" mode="aspectFill"></image>
						<view class="ellipsis2 u-p-10">
							{{item.item}}
						</view>
					</view>
				</block>
			</view>
		</zPaging>

		<!-- 轮播图 -->
		<PreviewMedia ref="refPreviewMedia" @loadingMore="loadingMore" />
		<PreviewVideo ref="refPreviewVideo" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		useStore
	} from "vuex";
	import {
		onLoad, onShareAppMessage, onShareTimeline
	} from "@dcloudio/uni-app";
	const store = useStore();

	const album_total = computed(() => store.state.album_total);

	import zPaging from "./components/z-paging/components/z-paging/z-paging.vue"
	import request from "@/utils/request.js"
	import PreviewVideo from "./components/PreviewVideo.vue"
	import PreviewMedia from "./components/PreviewMedia.vue"
	import AlbumInfo from "./components/AlbumInfo.vue"
	import {
		addUnit,
		getPx,
		getWindowInfo
	} from '@/uni_modules/uview-plus/libs/function/index.js';

	function throttle(func, delay) {
		let lastTime = 0;
		return function(...args) {
			const now = Date.now();
			if (now - lastTime >= delay) {
				lastTime = now;
				func.apply(this, args);
			}
		};
	}

	const currentImageIndex = ref(0)
	const currentEvent = ref({})
	const isShowBackTop = ref(false)
	const isLoadingMore = ref(false)
	const isScrolling = ref(false)
	const paging = ref(null)
	const refPreviewMedia = ref(null)
	const displayType = ref('photo')
	const virtualList = ref([])
	const currentPageData = ref([])

	function changeTab(type) {
		displayType.value = type;
		paging.value.reload();
	}

	async function loadingMore(index) {
		await loadMoreData()
		refPreviewMedia.value.openModal('', index, currentPageData.value)
	}

	const scrollTimer = ref(null)

	function onListScroll(e) {
		isScrolling.value = true;
		if (scrollTimer.value) clearTimeout(scrollTimer.value)

		scrollTimer.value = setTimeout(() => {
			isScrolling.value = false;
		}, 150);

		throttleScroll(e)
	}

	const throttleScroll = throttle(function(e) {
		// console.log(e.detail)
		const { scrollHeight } = e.detail;
		const scrollTop = parseInt(e.detail.scrollTop)
		// console.log('scrollTop=====>', scrollTop)
		isShowBackTop.value = scrollTop >= 385;

		// 提前10行图的时候 触发加载
		const {
			screenHeight
		} = uni.getWindowInfo()
		const distanceToBottom = scrollHeight - scrollTop - screenHeight;

		// console.log('scrollTop====>',  distanceToBottom, scrollHeight , scrollTop , screenHeight)

		const itemHeight = displayType.value === 'photo' ? 180 : 270; // 卡片高度
		const lanes = displayType.value === 'photo' ? 4 : 2; // 列数

		if (distanceToBottom <= itemHeight * 5 && !isLoadingMore.value) {
			loadMoreData()
		}
		
		// 计算滚动到第几张图片位置, 图片高度 90px, 视频高度 135px
		const photoIndex = Math.floor(scrollTop / (itemHeight / 2)) * lanes + (lanes * 2);
		currentImageIndex.value = Math.min(photoIndex, album_total.value);
	}, 120)


	function virtualListChange(vList) {
		console.log('vList=======>', vList)
		virtualList.value = vList;
	}

	function loadMoreData() {
		if (isLoadingMore.value) return;
		paging.value?.doLoadMore()
	}

	function queryList(pageNo, pageSize) {
		console.log('queryList=====>')
		isLoadingMore.value = true
		
		store.dispatch('getAlbumData', {
			pageIndex: pageNo - 1,
			pageSize: pageSize,
			keyword: '',
			event_id: currentEvent.value.event_id,
			displayType: displayType.value
		}).then(res => {
			paging.value.complete(res);
			
			currentPageData.value = res;
			// 待数据更新后，再更新状态，防止滚动高度未更新，二次判断高度，请求了接口
			setTimeout(() => {
				isLoadingMore.value = false
			}, 150)
		})
	}

	function handleImg(link, index) {
		refPreviewMedia.value.openModal(link, index, currentPageData.value)
	}

	onLoad((options) => {
		currentEvent.value = options

		wx?.showShareMenu?.({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
	})
	
	onShareAppMessage(() => {
		return {
			title: '跑了没 - ' + (currentEvent.value.name || ''),
			imageUrl: currentEvent.value.background_image_url
		};
	})
	onShareTimeline(() => {
		return {
			title: '跑了没 - ' + (currentEvent.value.name || ''),
			query: '', // 可以携带参数
			imageUrl: currentEvent.value.background_image_url
		};
	})
	
</script>

<style lang="scss">
	.share-btn {
		margin: 0;

		&:after {
			display: none;
		}

		::v-deep {
			background: none;
		}
	}
	.SwiperSection{
		.section-btns{
			::v-deep{
				.u-button{
					border:none;
					margin:0;
					padding:0;
					background-color: transparent;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					font-size: 20rpx;
					font-weight: 400;
					.u-icon{
						margin-bottom: 10rpx;
						display: block!important;
					}
				}
			}
		}
	}
	.PreviewMedia {
		.u-popup__content__close {
			top: 300rpx !important;
			width: 36px !important;
			height: 36px !important;
			background: rgba(34, 34, 34, 0.8) !important;
			border-radius: 999px;
			display: flex;
			align-items: center;
			justify-content: center;
	
			.u-icon__icon {
				color: #fff !important;
			}
		}
	}
	
	.albumDetail-page {
		.back-to-top {
			position: fixed;
			top: 240px;
			left: 0;
			padding: 0 8px;
			min-width: 75px;
			height: 30px;
			line-height: 30px;
			font-size: 24rpx;
			color: #fff;
			background: rgba(0, 0, 0, 0.8);
			text-align: center;
			border-radius: 0 15px 15px 0;
			overflow: hidden;
			z-index: 100;

			.box {
				transform: translateY(0rpx);
				transition: transform 0.3s;
			}

			&.active {
				.box {
					transform: translateY(-60rpx);
				}
			}
		}

		.isFixed {
			z-index: 990;
			position: fixed;
			top: 88rpx;
			width: 100%;
		}

		.section-tabs {
			height: 88rpx;
			border-bottom: 2rpx solid #EFEDEE;
			padding-left: 34rpx;
			font-weight: bold;
			text-align: center;
			background: #fff;

			.item {
				position: relative;
				width: 94rpx;
				padding-bottom: 10rpx;
				font-size: 16px;

				&.active:before {
					position: absolute;
					content: "";
					bottom: -10rpx;
					left: 50%;
					transform: translateX(-50%);
					background: #FF8C00;
					width: 14px;
					height: 4px;
					border-radius: 2px;
				}
			}
		}

		.card-img {
			display: block;
			width: 25%;
			height: 180rpx;
			padding: 5rpx;
			box-sizing: border-box;
		}

		.card-video {
			position: relative;
			display: block;
			width: 50%;
			height: 270rpx;
			padding: 5rpx;
			box-sizing: border-box;
			overflow: hidden;

			.img {
				width: 100%;
				height: 192rpx;
				border-radius: 10rpx 10rpx 0 0;
			}

			.icon-bofang {
				position: absolute;
				top: 40%;
				left: 50%;
				width: 30px;
				height: 30px;
				line-height: 30px;
				border-radius: 50%;
				font-size: 16px;
				text-align: center;
				transform: translate(-50%, -50%);
				background: #fff;
				color: #333;
				mix-blend-mode: screen;
				z-index: 1;
			}
		}
	}
</style>