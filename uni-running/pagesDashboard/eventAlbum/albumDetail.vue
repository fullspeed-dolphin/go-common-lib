<template>
	<view>
		<mescroll-uni ref="mescrollRef" @init="e => mescroll = e" @down="e => e.resetUpScroll()" @up="getList" top="0">
			<section class="section-banner">
				<up-lazy-load class="img" v-if="currentEvent" :image="currentEvent.image_url" mode="aspectFill" />
				<view class="summary">
					<view class="item u-flex-y-center">照片 2346</view>
					<view class="item u-flex-y-center">视频 2346</view>
					<view class="item u-flex-y-center">热度 2346</view>
				</view>
			</section>

			<section class="section-btns u-flex-xy-center" style="width:580rpx;margin: 24rpx auto ;">
				<up-button type="primary" 
					@click="refFindPhoto.open()"
					customStyle="width: 298rpx;font-size: 24rpx;height: 82rpx;">
					<text class="iconfont icon-saomiaorenlian u-mr-10"></text>
					查找照片和视频
				</up-button>
				<!-- <up-button type="info" plain openType="share" customStyle="width: 204rpx;font-size: 24rpx;color:#FF8C00;height: 82rpx;">
					<text class="iconfont icon-fenxiang u-mr-10"></text>
					分享照片
				</up-button> -->
			</section>

			<section class="section-tabs u-flex-y-center">
				<view class="item" :class="{active: tabActive === 'photo'}" @click="tabActive = 'photo'">照片</view>
				<view class="item" :class="{active: tabActive === 'video'}" @click="tabActive = 'video'">视频</view>
			</section>

			<section class="u-flex-y-center" style="height: 80rpx;padding-left: 34rpx;">
				<view class="iconfont icon-shijianzhou"></view>
				时间轴
			</section>

			<section class="u-flex-wrap u-flex" style="gap: 10rpx;padding: 0 34rpx;">
				<view class="card-item" v-for="item in dataList" :key="item.event_id" @click="viewDetail(item)">
					<up-lazy-load class="img" height="507" :image="item.image_url" mode="aspectFill" />
				</view>
			</section>
		</mescroll-uni>
		
		<FindPhoto ref="refFindPhoto"/>
	</view>
</template>

<script setup>
	import FindPhoto from "./components/FindPhoto.vue"
	import {
		ref,
	} from "vue";

	import {
		onLoad,
		onShareAppMessage,
	} from "@dcloudio/uni-app";

	const refFindPhoto = ref(null)

	import request from "@/utils/request.js"

	const tabActive = ref('photo')
	const currentEvent = ref(null)
	let eventId = ''

	// 方法定义
	const viewDetail = (item) => {
		uni.$u.route(`pagesDashboard/eventAlbum/albumDetail?id=${item.event_id}`);
	};

	let mescroll = ref(null);
	const refreshList = () => {
		nextTick(() => {
			mescroll.value.resetUpScroll(); // 重置列表数据为第一页
			mescroll.value.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
		});
	};

	const dataList = ref([])
	const getList = (page) => {
		uni.showLoading({
			mask: true
		});

		const params = {
			pageIndex: page.num - 1,
			pageSize: 10,
			keyword: ''
		};

		request.get(`/event-api/getOfflineEventSwiper`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (page.num == 1) dataList.value = []

				// 找到当前活动
				if (eventId && !currentEvent.value) {
					const event = res.find(item => item.event_id === eventId)
					if (event) {
						currentEvent.value = {
							event_id: event.event_id,
							description: event.description,
							image_url: event.image_url,
							event_time: event.event_time.slice(0, 10),
							event_location: event.event_location
						}
					}
				}

				const events = res.map(item => {
					return {
						event_id: item.event_id,
						description: item.description,
						image_url: item.image_url,
						event_time: item.event_time.slice(0, 10),
						event_location: item.event_location
					}
				});

				dataList.value = dataList.value.concat(events)

				//隐藏下拉刷新和上拉加载的状态;
				mescroll.value.endSuccess(events.length);
			})
			.catch((error) => {
				console.log(error)
				uni.hideLoading();
				mescroll.value.endSuccess();
			});
	};

	// 页面加载
	onLoad((options) => {
		eventId = options.id || ''

		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage']
		});
		// #endif
	});

	// 分享给朋友
	onShareAppMessage(() => {
		return {
			title: '跑了没 - 跑，一切活力的泉源',
			// path: '/pages/index',
			imageUrl: '', // 可以设置自定义分享图片，留空则使用当前页面截图
		};
	});
</script>

<style lang="scss" scoped>
	.section-banner {
		position: relative;

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
	
	.section-btns{
		::v-deep{
			.u-button--square{
				border-radius: 16rpx;
			}
		}
	}

	.section-tabs {
		height: 88rpx;
		border-bottom: 2rpx solid #EFEDEE;
		padding-left: 34rpx;
		font-weight: bold;
		text-align: center;

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
		.img {
			width: 336rpx;
			height: 502rpx;
		}
	}
</style>