
<!-- 虚拟列表演示(非内置列表写法) -->
<!-- 写法较简单，在页面中对当前需要渲染的虚拟列表数据进行for循环，在vue3中兼容性良好 -->
<template>
<!-- // https://zyt-cloud.github.io/virtual/index.html -->
	<!-- 如果页面中的cell高度是固定不变的，则不需要设置cell-height-mode，如果页面中高度是动态改变的，则设置cell-height-mode="dynamic" -->
	<zPaging ref="paging" use-virtual-list enable-back-to-top
		cell-height-mode="fixed"
		:preload-page="20"
		:virtual-list-col="2" :inner-list-style="{'display':'flex','flex-wrap':'wrap'}"
		:default-page-size="30" :force-close-inner-list="true" @virtualListChange="virtualListChange"
		@query="queryList" @scroll="onListScroll">
		<view class="" sot="header">
			<section class="section-banner">
				<up-lazy-load class="img" v-if="currentEvent"
					:image="currentEvent.image_url + '?x-oss-process=image/resize,w_600,h_200,m_fill'" mode="aspectFill" />
				<view class="summary">
					<view class="item u-flex-y-center">照片 2346</view>
					<view class="item u-flex-y-center">视频 2346</view>
					<view class="item u-flex-y-center">热度 2346</view>
				</view>
			</section>

			<section class="section-btns u-flex-xy-center" style="width:580rpx;margin: 24rpx auto;">
				<up-button type="primary" @click="refFindPhoto.open()"
					customStyle="width: 298rpx;font-size: 24rpx;height: 82rpx;">
					<text class="iconfont icon-saomiaorenlian u-mr-10"></text>
					查找照片和视频
				</up-button>
			</section>

			<view v-if="isShowBackTop" style="height: 88rpx;"></view>
			<section class="section-tabs u-flex-y-center" :class="{isFixed: isShowBackTop}" >
				<view class="item" :class="{active: tabActive === 'photo'}" @click="tabActive = 'photo'">照片</view>
				<view class="item" :class="{active: tabActive === 'video'}" @click="tabActive = 'video'">视频</view>
			</section>
			
			<view v-if="isShowBackTop" @click="goToTop()" class="back-to-top" :class="{active: isScrolling}">
				 <view class="box">
					 <view class="flex-center">
							顶部 
							<text class="iconfont icon-back-top"></text>
					 </view>
					 <view class="number">{{ currentImageIndex }} / 3000</view>
				 </view>
			</view>
		</view>
		<!-- :id="`zp-id-${item.zp_index}`"和:key="item.zp_index" 必须写，必须写！！！！ -->
		<!-- 这里for循环的index不是数组中真实的index了，请使用item.zp_index获取真实的index -->
		<view class="u-flex u-flex-wrap u-pl-10">
			<view class="card-item" v-for="(item, index) in virtualList" :id="`zp-id-${item.zp_index}`" :key="item.zp_index">
				<image class="img" :src="item.item + tt" mode="aspectFill" @click="handleImg(item.item,item.zp_index)" />
			</view>
		</view>
	</zPaging>
	<!-- 轮播图 -->
	<PreviewMedia ref="refPreviewMedia" @loadingMore="loadingMore"/>
</template>

<script>
	import zPaging from "@/uni_modules/z-paging/components/z-paging/z-paging.vue"
	import request from "@/utils/request.js"
	import FindPhoto from "./components/FindPhoto.vue"
	import PreviewMedia from "./components/PreviewMedia.vue"
	export default {
		components: {
			zPaging, FindPhoto, PreviewMedia
		},
		data() {
			return {
				allImages: [],
				itemHeight: 240,
				isScrolling: false,
				currentImageIndex: 0,
				isShowBackTop: false,
				currentEvent: {},
				tabActive: 'photo',
				virtualList: [],
				ossParams: '?x-oss-process=image/crop,w_500,h_400,x_100,y_100/format,webp/q_80',
				tt: '?x-oss-process=image/resize,w_720/quality,q_80/format,webp',
				tt1: '?x-oss-process=image/watermark,image_d2F0ZXJtYXJrL1BSTzUzMDE1NC9tYXJrMTQ1MTkwMS5wbmc_eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsbV9maXhlZCx0eXBlXzIsd180ODAsaF84MCxsaW1pdF8wL2Zvcm1hdCxwbmc=,g_south,x_0,y_0,t_100',
				swiperPageNo:0,
				swiperPageSize: 10,
				isloading:false,
				isNextLevel: false
			}
		},
		onLoad(options) {
			console.log('options=====>', options)
			this.currentEvent = options
		},
		methods: {
			async loadingMore(index) {
				// console.log('albumDetail的触发')
				this.isNextLevel = true
				const res = await this.queryList(this.swiperPageNo+1,this.swiperPageSize)
				// console.log('albumDetail的触发res====',res)
				this.$refs.refPreviewMedia.openModal('',index,this.virtualList2)
			},
			goToTop() {
				this.$refs.paging.scrollToTop();
			},
			onListScroll(e) {
				// console.log(e.detail.scrollTop)
				const scrollTop = e.detail.scrollTop
				this.isShowBackTop = scrollTop >= 256;
				
				const index = Math.floor(scrollTop / this.itemHeight);
				// 限制范围：不能超过总图片数 - 1, 2 列
				this.currentImageIndex = Math.min(index, this.virtualList.length - 1) * 2 + 4;
				
				this.isScrolling = true;
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
	
				this.scrollTimer = setTimeout(() => {
					this.isScrolling = false;
				}, 150);
			},
			virtualListChange(vList) {
				this.virtualList = vList;
			},
			queryList(pageNo, pageSize) {
				this.swiperPageNo = pageNo
				this.swiperPageSize = pageSize
								
				const params = {
					pageIndex: pageNo,
					pageSize: pageSize,
					keyword: '',
					event_id: this.currentEvent.event_id || '01K9VG019M6SDK49NNGGAZQM5C',
				};

				request.get(`/image-service/oss`, params).then((res) => {
					// keep full list for preview
					this.allImages = res.urls || [];
					this.$refs.paging.complete(res.urls);
					
					if(pageNo == 1) {
						this.virtualList2 = res.urls
					} else {
						this.virtualList2 = this.virtualList2.concat(res.urls)
					}
				})
			},
			handleImg(link,index) {
				this.$refs.refPreviewMedia.openModal(link,index,this.virtualList2)
			},
			openPreview(index) {
				// index should be the global index provided by virtual list
				if (!this.$refs.preview) return;
				this.$refs.preview.openModal(this.allImages, index || 0);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.back-to-top{
		position: fixed;
		top: 140px;
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
		height: 344rpx;
		.img {
			width: 100%;
			height: 344rpx;
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
				background: rgba(112, 112, 112, .5);
				border-radius: 0rpx 8rpx 8rpx 0rpx;
				margin-bottom: 10rpx;
			}
		}
	}

	.section-btns {
		::v-deep {
			.u-button--square {
				border-radius: 16rpx;
			}
		}
	}
	.isFixed {
			z-index: 990;
			position: fixed;
			top: 0;
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

	.card-item {
		min-width: 48%;
		padding: 0 10rpx 10rpx 0;
		.img {
			display: block;
			width: 360rpx;
			height: 480rpx;
		}
	}
</style>