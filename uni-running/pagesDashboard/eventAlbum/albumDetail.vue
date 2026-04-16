<!-- UI 参考 https://m.alltuu.com/album/3102256506/?menu=live -->
<template>
	<view class="albumDetail-page">
		<u-navbar autoBack placeholder :title="album_info?.name || '详情'" />
		<zPaging ref="paging" use-virtual-list cell-height-mode="fixed"
			:virtual-list-col="displayType === 'photo' ? 4 : 2"
			:fixed-cell-height="displayType === 'photo' ? '180rpx' : '200rpx'"
			:inner-list-style="{'display':'flex','flex-wrap':'wrap'}" :default-page-size="60"
			:force-close-inner-list="true" @virtualListChange="e => virtualList = e" @query="queryList" @scroll="onListScroll">

			<AlbumInfo :event-id="currentEvent.event_id" />

			<view style="height: 44px;">
				<section class="section-tabs flex-between-center" :class="{isFixed: isShowBackTop}"
					:style="{ top: addUnit(getPx('44px') + getWindowInfo().statusBarHeight,'px') }">
					<view class="u-flex-row">
						<view class="item" :class="{active: displayType === 'photo'}" :style="displayType === 'photo' ? {'--tab-color': themeColor} : {}" @click="changeTab('photo')">照片</view>
						<view class="item" :class="{active: displayType === 'video'}" :style="displayType === 'video' ? {'--tab-color': themeColor} : {}" @click="changeTab('video')">视频</view>
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

			<view class="u-flex u-flex-wrap u-pt-10 u-pl-5 u-pb-10">
				<block v-if="displayType === 'photo'">
					<image class="card-img" :src="item.item + '?x-oss-process=image/resize,w_250/quality,q_80/format,webp'"
						mode="aspectFill" v-for="(item, index) in virtualList" :id="'zp-id-' + item.zp_index" :key="item.zp_index"
						@click="handleImg(item.item,item.zp_index)" />
				</block>
				
				<block v-if="displayType === 'video'">
					<view class="card-video" v-for="(item, index) in virtualList" :id="'zp-id-' + item.zp_index"
						:key="item.zp_index" @click="handleVideo(item.item)">
						<view class="iconfont icon-bofang"></view>
						<image class="img" :src="item.item + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'" mode="aspectFill"></image>
					</view>
				</block>
			</view>
		</zPaging>

		<!-- 照片查看器（自定义 swiper，每次滑动触发 addViewCount 统计浏览量） -->
		<PreviewMedia ref="refPreviewMedia" @loadingMore="loadingMore" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
	} from "vue";
	import {
		useStore
	} from "vuex";
	import {
		onLoad,
		onUnload,
		onShareAppMessage, onShareTimeline
	} from "@dcloudio/uni-app";
	import { useShare, buildPath } from "@/composables/useShare.js";
	const store = useStore();

	const album_total = computed(() => store.state.album_total);
	const album_info = computed(() => store.state.album_info);
	const themeColor = computed(() => album_info.value?.color_config?.solid || '#FF8C00');

	import zPaging from "./components/z-paging/components/z-paging/z-paging.vue"
	import request from "@/utils/request.js"
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

	// 分享配置 - 使用 Vuex 中 AlbumInfo 获取的完整数据
	useShare(() => ({
		title: album_info.value?.name
			? `全速运动 - ${album_info.value.name} - 活动相册`
			: '全速运动 - 活动相册',
		path: buildPath('/pagesDashboard/eventAlbum/albumCover', {
			event_id: currentEvent.value.event_id
		}),
		imageUrl: album_info.value?.image_url || album_info.value?.background_image_url || ''
	}));
	const isLoadingMore = ref(false)
	const isScrolling = ref(false)
	const paging = ref(null)
	const refPreviewMedia = ref(null)
	const displayType = ref('photo')
	const virtualList = ref([])
	const currentPageData = ref([])
	// uni.previewMedia 单次最多 50 个 sources，本次访问内是否已提示过该限制
	const hasShownVideoLimitTip = ref(false)

	function changeTab(type) {
		displayType.value = type;
		paging.value.reload();
		// 切换 photo/video 时重新拉全量 URL，供 uni.previewImage / uni.previewMedia 滑完整个相册
		store.dispatch('getAllAlbumUrls', {
			event_id: currentEvent.value.event_id,
			displayType: type
		})
	}

	async function loadingMore(index) {
		await loadMoreData()
		refPreviewMedia.value.openModal('', index, 'photo')
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

		const itemHeight = displayType.value === 'photo' ? uni.upx2px(180) : uni.upx2px(200); // 卡片高度，使用固定 rpx 高度转换为 px
		const lanes = displayType.value === 'photo' ? 4 : 2; // 列数

		if (distanceToBottom <= itemHeight * 5 && !isLoadingMore.value) {
			loadMoreData()
		}

		// 计算滚动到第几张图片位置
		const photoIndex = Math.floor(scrollTop / itemHeight) * lanes;
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
		console.log('handleImg=====>', link, index)
		const allUrls = store.state.album_all_urls?.photo || []
		let urls = allUrls
		let idx = allUrls.indexOf(link)
		if (idx === -1) {
			urls = store.state.album_data
			idx = urls.indexOf(link)
		}
		if (idx === -1 || !urls || urls.length === 0) return
		const MAX = 1000
		const start = Math.min(
			Math.max(0, idx - Math.floor(MAX / 2)),
			Math.max(0, urls.length - MAX)
		)
		const slice = urls.slice(start, start + MAX)
		uni.previewImage({
			urls: slice,
			current: link,
			indicator: 'number',
			loop: false,
		})
	}

	function handleVideo(link) {
		// 用微信原生预览器，支持视频左右滑切换、自带"保存到相册"菜单
		// 只读 video 字段，避免竞态下拿到照片的全量 URL
		const allUrls = store.state.album_all_urls?.video || []
		// 不能用 Math.max(0, -1) 兜底 indexOf：那样 idx 永远是 0，预览窗口永远切在前 50 个
		let urls = allUrls
		let idx = allUrls.indexOf(link)
		if (idx === -1) {
			urls = store.state.album_data
			idx = urls.indexOf(link)
		}
		if (idx === -1 || !urls || urls.length === 0) return
		// wx.previewMedia 限制 sources 最多 50 个，以当前视频为中心截一个 50 大小的窗口
		const MAX = 50
		const start = Math.min(
			Math.max(0, idx - Math.floor(MAX / 2)),
			Math.max(0, urls.length - MAX)
		)
		const sources = urls.slice(start, start + MAX).map(url => ({
			url,
			type: 'video',
			poster: url + '?x-oss-process=video/snapshot,t_5,f_jpg,w_720'
		}))
		const open = () => uni.previewMedia({ sources, current: idx - start })

		// 视频总数超过 50 时，本次访问首次点击需告知限制
		if (urls.length > MAX && !hasShownVideoLimitTip.value) {
			hasShownVideoLimitTip.value = true
			uni.showModal({
				title: '提示',
				content: `相册视频较多（${urls.length} 个），受微信限制单次预览最多 50 个。如需查看其他视频，请退出预览后再次点击对应视频。`,
				showCancel: false,
				confirmText: '知道了',
				success: open
			})
		} else {
			open()
		}
	}

	onLoad((options) => {
		console.log("========",options)
		currentEvent.value = options
		// 后台预取全量 URL（不阻塞主流程），供"查看高清图"时使用
		store.dispatch('getAllAlbumUrls', {
			event_id: options.event_id,
			displayType: 'photo'
		})
	})
	onUnload(() => {
		// 离开页面清空全量 URL，避免占内存
		store.commit('set', { type: 'album_all_urls', data: { photo: [], video: [] } })
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
				padding: 0 10rpx 10rpx;
				font-size: 16px;

				&.active:before {
					position: absolute;
					content: "";
					bottom: -10rpx;
					left: 0;
					right: 0;
					height: 4px;
					background: var(--tab-color, #FF8C00);
					border-radius: 2px;
				}
			}
		}

		.card-img {
			display: block;
			/* #ifndef MP-WEIXIN */
			width: 174rpx;
			/* #endif */
			/* #ifdef MP-WEIXIN */
			width: 178rpx;
			/* #endif */
			height: 180rpx;
			margin: 5rpx;
			box-sizing: border-box;
			background: #f5f5f5;
			&:nth-child(4n){
				margin-right:0;
			}
		}

		.card-video {
			position: relative;
			display: block;
			/* #ifndef MP-WEIXIN */
			width: 353rpx;
			/* #endif */
			/* #ifdef MP-WEIXIN */
			width: 357rpx;
			/* #endif */
			height: 200rpx;
			margin: 5rpx;
			box-sizing: border-box;
			overflow: hidden;
			background: #f5f5f5;
			border-radius: 10rpx;

			.img {
				width: 100%;
				height: 100%;
				border-radius: 10rpx;
			}

			.icon-bofang {
				position: absolute;
				top: 50%;
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