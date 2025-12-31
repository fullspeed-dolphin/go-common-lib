<!-- UI 参考 https://m.alltuu.com/album/3102256506/?menu=live -->
<template>
	<view class="albumDetail-page">
		<zPaging ref="paging" use-virtual-list
			cell-height-mode="fixed"
			:virtual-list-col="4" :inner-list-style="{'display':'flex','flex-wrap':'wrap'}"
			fixed-cell-height="180rpx"
			:default-page-size="60" :force-close-inner-list="true" 
			@virtualListChange="virtualListChange"
			@query="queryList" @scroll="onListScroll">
			<u-navbar :title="currentEvent.name" placeholder></u-navbar>
			<view class="" sot="header">
				<section class="section-banner">
					<up-lazy-load class="img" :image="currentEvent.image_url + '?x-oss-process=image/resize,w_600'" mode="aspectFill" />
					<view class="summary">
						<view class="item u-flex-y-center">照片 {{totalNumber}}</view>
						<!-- <view class="item u-flex-y-center">视频 2346</view> -->
						<!-- <view class="item u-flex-y-center">浏览量 {{visitAmount}}</view> -->
					</view>
				</section>
				
				<section class="" style="padding: 20rpx 20rpx 34rpx 30rpx;">
					<view class="u-mt-10" style="font-size: 18px;font-weight: 500;line-height:26px;">
						{{currentEvent.description}}
					</view>
					<div class="u-mt-20 c6" style="color:rgba(0, 0, 0, 0.6);">
						已有 <span style="color: #ff8c00;">{{visitAmount}}</span> 人次浏览了此相册
					</div>
					<view class="flex-between-center c6 fs24 u-mt-20" style="line-height: 1.2;">
						<view class="">
							<view class="u-mt-10 flex-start">
								<u-icon name="clock" color="#666" size="24rpx"></u-icon>
								<view class="u-ml-10">{{currentEvent.event_time}}</view>
							</view>
							<view class="u-mt-10 u-flex-row" style="line-height: 1.2;">
								<view class=""><u-icon name="map" color="#666" size="24rpx"></u-icon></view>
								<view class="u-ml-10 ellipsis2" style1="max-width: 320rpx;">{{currentEvent.event_location}}</view>
							</view>
						</view>
						<!-- <up-button type="primary" @click="$refs.refFindPhoto.open()"
							customStyle="width: 280rpx;font-size: 24rpx;margin:0;height: 82rpx;border-radius: 16rpx;">
							<text class="iconfont icon-saomiaorenlian u-mr-10"></text>
							查找照片和视频
						</up-button> -->
					</view>
				</section>
		
				<section class="section-btns u-flex-xy-center" style="width:580rpx;margin: 24rpx auto;">
					<up-button type="primary" @click="$refs.refFindPhoto.open(currentEvent.event_id)"
						customStyle="width: 298rpx;font-size: 24rpx;height: 82rpx;border-radius: 16rpx;">
						<text class="iconfont icon-saomiaorenlian u-mr-10"></text>
						查找照片和视频
					</up-button>
				</section>
		
				<view style="height: 44px;">
					<section class="section-tabs u-flex-y-center" :class="{isFixed: isShowBackTop}" 
						:style="{ top: addUnit(getPx('44px') + getWindowInfo().statusBarHeight,'px') }">
						<view class="item" :class="{active: tabActive === 'photo'}" @click="tabActive = 'photo'">照片</view>
						<!-- <view class="item" :class="{active: tabActive === 'video'}" @click="tabActive = 'video'">视频</view> -->
					</section>
				</view>
				
				<view v-if="isShowBackTop" @click="$refs.paging.scrollToTop()" class="back-to-top" :class="{active: isScrolling}">
					 <view class="box">
						 <view class="flex-center">
								顶部 <text class="iconfont icon-back-top"></text>
						 </view>
						 <view class="number">{{ currentImageIndex }} / {{totalNumber}}</view>
					 </view>
				</view>
			</view>
			
			<view class="u-flex u-flex-wrap u-p-10">
				<image 
					class="card-img" :src="item.item + tt" mode="aspectFill" 
					v-for="(item, index) in virtualList"
					:id="'zp-id-' + item.zp_index" :key="item.zp_index"
					@click="handleImg(item.item,item.zp_index)" :alt="index"/>
			</view>
		</zPaging>
		
		<!-- 轮播图 -->
		<PreviewMedia ref="refPreviewMedia" @loadingMore="loadingMore"/>
		<FindPhoto ref="refFindPhoto" />
	</view>
</template>

<script >
	import zPaging from "./components/z-paging/components/z-paging/z-paging.vue"
	import request from "@/utils/request.js"
	import FindPhoto from "./components/FindPhoto.vue"
	import PreviewMedia from "./components/PreviewMedia.vue"
	import { addUnit, getPx, getWindowInfo } from '@/uni_modules/uview-plus/libs/function/index.js';
	
	function throttle(func, delay) {
	  let lastTime = 0;
	  return function (...args) {
	    const now = Date.now();
	    if (now - lastTime >= delay) {
	      lastTime = now;
	      func.apply(this, args);
	    }
	  };
	}
	
	export default {
		components: {
			zPaging, FindPhoto, PreviewMedia
		},
		data() {
			return {
				addUnit, getPx, getWindowInfo,
				allImages: [],
				visitAmount: 0,
				totalNumber: 0,
				itemHeight: 180,
				isScrolling: false,
				currentImageIndex: 0,
				isShowBackTop: false,
				currentEvent: {},
				tabActive: 'photo',
				virtualList: [],
				ossParams: '?x-oss-process=image/crop,w_500,h_400,x_100,y_100/format,webp/q_80',
				tt: '?x-oss-process=image/resize,w_250/quality,q_80/format,webp',
				tt1: '?x-oss-process=image/watermark,image_d2F0ZXJtYXJrL1BSTzUzMDE1NC9tYXJrMTQ1MTkwMS5wbmc_eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsbV9maXhlZCx0eXBlXzIsd180ODAsaF84MCxsaW1pdF8wL2Zvcm1hdCxwbmc=,g_south,x_0,y_0,t_100',
				swiperPageNo:0,
				swiperPageSize: 10,
				isloading:false,
				isNextLevel: false
			}
		},
		methods: {
			async loadingMore(index) {
				// console.log('albumDetail的触发')
				this.isNextLevel = true
				const res = await this.queryList(this.swiperPageNo+1, this.swiperPageSize)
				// console.log('albumDetail的触发res====',res)
				this.$refs.refPreviewMedia.openModal('',index,this.virtualList2, this.totalNumber)
			},
			onListScroll(e) {
				this.isScrolling = true;
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
	
				this.scrollTimer = setTimeout(() => {
					this.isScrolling = false;
				}, 150);
				
				this.throttleScroll(e)
			},
			throttleScroll: throttle(function(e) {
				// console.log(e.detail)
				const { scrollHeight } = e.detail;
				const scrollTop = parseInt(e.detail.scrollTop)
				console.log('scrollTop=====>', scrollTop)
				this.isShowBackTop = scrollTop >= 385;
				
				// 提前10行图的时候 触发加载
				const { screenHeight } = uni.getWindowInfo()
				const distanceToBottom = scrollHeight - scrollTop - screenHeight;
				
				// console.log('scrollTop====>',  scrollHeight , scrollTop , screenHeight)
				// console.log('distanceT====>',  distanceToBottom, this.itemHeight * 5)
				
				if (distanceToBottom <= this.itemHeight * 5 && !this.isLoadingMore) {
					this.loadMoreData()
				}
				
				// 计算滚动到第几张图片位置
				const photoIndex = Math.floor(scrollTop / 90)  * 4 + 8;
				this.currentImageIndex = Math.min(photoIndex, this.totalNumber);
			}, 120),
			virtualListChange(vList) {
				this.virtualList = vList;
			},
			getDetail (){
			  uni.showLoading({ mask: true });
			  request.get(`/event-api/api/v1/events/${this.currentEvent.event_id}`).then((res) => {
					res.event_id = res.id
					res.event_time.slice(0, 10)
					this.currentEvent = res
				});
				
			  request.post(`/image-service/albums/view/count?event_id=${this.currentEvent.event_id}`).then((res) => {
					this.visitAmount = res.view_count
				});
			},
			addVistAmount() {
				request.post(`/image-service/albums/view/increment?event_id=${this.currentEvent.event_id}`)
			},
			loadMoreData (){
			  if (this.isLoadingMore) return;
				console.log('提前触发加载====>')
			  this.$refs.paging?.doLoadMore()
			},
			queryList(pageNo, pageSize) {
				console.log('queryList=====>')
				this.swiperPageNo = pageNo
				this.swiperPageSize = pageSize
								
				const params = {
					pageIndex: pageNo - 1,
					pageSize: pageSize,
					keyword: '',
					event_id: this.currentEvent.event_id,
				}
				
				this.isLoadingMore = true
				return request.get(`/image-service/oss`, params).then(res => {
					console.log('加载成功')
					const list = res.urls || []
					this.allImages = list;
					this.$refs.paging.complete(list);
					
					this.totalNumber = res.total
					
					if(pageNo == 1) {
						this.virtualList2 = list;
					} else {
						this.virtualList2 = this.virtualList2.concat(list)
					}
					
					// 待数据更新后，再更新状态，防止滚动高度未更新，二次判断高度，请求了接口
					setTimeout(() => {
						this.isLoadingMore = false
					}, 150)
				})
			},
			handleImg(link,index) {
				this.$refs.refPreviewMedia.openModal(link,index,this.virtualList2, this.totalNumber)
			},
			openPreview(index) {
				if (!this.$refs.preview) return;
				this.$refs.preview.openModal(this.allImages, index || 0);
			}
		},
		onLoad(options) {
			console.log('options=====>', options)
			this.currentEvent = options
			this.getDetail()
			this.addVistAmount()
			
			wx?.showShareMenu?.({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
		},
		onShareAppMessage() {
			return {
				title: '跑了没 - ' + (this.currentEvent.name || ''),
				imageUrl: this.currentEvent.background_image_url
			};
		},
		onShareTimeline() {
			return {
				title: '跑了没 - ' + (this.currentEvent.name || ''),
				query: '', // 可以携带参数
				imageUrl: this.currentEvent.background_image_url
			};
		},
	}
</script>

<style lang="scss">
	.albumDetail-page{
		.PreviewMedia{
			.u-popup__content__close {
				top: 300rpx!important;
				.u-icon__icon{
					color: #fff!important;
				}
			}
		}
		.back-to-top{
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
			.box{
				transform: translateY(0rpx);
				transition: transform 0.3s;
			}
			&.active{
				.box{
					transform: translateY(-60rpx);
				}
			}
		}
		.section-banner {
			position: relative;
			height: 362rpx;
			.img {
				width: 100%;
				height: 362rpx;
			}
		
			.summary {
				position: absolute;
				left: 0;
				bottom: 30rpx;
		
				.item {
					min-width: 170rpx;
					padding: 10rpx 0 10rpx 32rpx;
					color: #fff;
					font-weight: bold;
					font-size: 24rpx;
					background: rgba(0, 0, 0, .6);
					border-radius: 0rpx 8rpx 8rpx 0rpx;
					margin-bottom: 10rpx;
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
				width: 94rpx;
				padding-bottom: 10rpx;
		
				&.active {
					color: #FF8C00;
					border-bottom: 4rpx solid #FF8C00;
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
	}
	
</style>