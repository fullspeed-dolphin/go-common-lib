<template>
	<view class="AlbumInfo">
		<u-navbar :title="detail.name" placeholder></u-navbar>
		<section class="section-banner" :style="{ height: bannerHeight }">
			<image class="img" :src="bannerSrc" :mode="bannerMode" :style="{ height: bannerHeight }" @load="onBannerLoad" />
			<view v-if="album_total" class="summary">
				<view class="item u-flex-y-center" :style="{ background: themeColor + 'CC' }">
					<!-- displayType === 'photo' ? '照片' : '视频' -->
					数量
					{{album_total}}
				</view>
			</view>
		</section>
		
		<section class="section-info" :style="infoStyle">
			<view class="u-mt-10" style="font-size: 18px;font-weight: 500;line-height:26px;">
				{{detail.description}}
			</view>
			<div class="u-mt-20 c6" style="color:rgba(0, 0, 0, 0.6);">
				已有 <span :style="{ color: themeColor }">{{visitAmount}}</span> 人次浏览了此相册
			</div>
			<view class="flex-between-center c6 fs24 u-mt-20" style="line-height: 1.2;">
				<view class="">
					<view class="u-mt-10 flex-start">
						<u-icon name="clock" color="#666" size="24rpx"></u-icon>
						<view class="u-ml-10">{{detail.event_time}}</view>
					</view>
					<view class="u-mt-10 u-flex-row" style="line-height: 1.2;">
						<view class=""><u-icon name="map" color="#666" size="24rpx"></u-icon></view>
						<view class="u-ml-10 ellipsis2" style1="max-width: 320rpx;">{{detail.event_location}}</view>
					</view>
				</view>
			</view>
		</section>

		<section class="section-btns u-flex-xy-center" style="width:580rpx;margin: 24rpx auto;">
			<up-button type="primary" @click="refFindPhoto.open(detail.event_id, themeColor)"
				:customStyle="`width: 298rpx;font-size: 24rpx;height: 82rpx;border-radius: 16rpx;background-color:${themeColor};border-color:${themeColor};`">
				<text class="iconfont icon-saomiaorenlian u-mr-10"></text>
				查找照片和视频
			</up-button>
		</section>

		<FindPhoto ref="refFindPhoto" />
	</view>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import request from "@/utils/request.js"
import FindPhoto from "./FindPhoto.vue"
import dayjs from "dayjs";

const store = useStore();

const props = defineProps({
	eventId: String
});

const album_total = computed(() => store.state.album_total);

const refFindPhoto = ref(null);
const routeParams = ref({});

// 统一用 watch + immediate 替代 onMounted + watch 双重触发
const hasInitialized = ref(false);
watch(() => props.eventId, (newVal) => {
	if (newVal && !hasInitialized.value) {
		hasInitialized.value = true;
		routeParams.value = { event_id: newVal };
		getDetail();
		addVistAmount();
	}
}, { immediate: true });

const detail = ref({})
const visitAmount = ref(0)

const themeColor = computed(() => detail.value.color_config?.solid || '#ff8c00')

const infoStyle = computed(() => {
	const cc = detail.value.color_config
	if (!cc?.gradient?.length) return { padding: '20rpx 20rpx 34rpx 30rpx' }
	const hex2rgba = (hex, a) => {
		const r = parseInt(hex.slice(1, 3), 16)
		const g = parseInt(hex.slice(3, 5), 16)
		const b = parseInt(hex.slice(5, 7), 16)
		return `rgba(${r}, ${g}, ${b}, ${a})`
	}
	const g = cc.gradient
	return {
		padding: '20rpx 20rpx 34rpx 30rpx',
		background: `linear-gradient(135deg, ${hex2rgba(g[0], 0.06)}, #ffffff 50%, ${hex2rgba(g[1], 0.04)})`
	}
})

const MIN_HEIGHT = 362
const MAX_HEIGHT = 600
const bannerHeight = ref(MIN_HEIGHT + 'rpx')
const bannerMode = ref('aspectFill')

const cacheBuster = Date.now()
const bannerSrc = computed(() => {
	const url = detail.value.background_image_url || detail.value.image_url
	return url ? url + `?x-oss-process=image/resize,w_600&t=${cacheBuster}` : ''
})

function onBannerLoad(e) {
	const { width, height } = e.detail
	const ratio = height / width
	const h = Math.round(750 * ratio)
	if (h <= MAX_HEIGHT) {
		bannerHeight.value = Math.max(h, MIN_HEIGHT) + 'rpx'
		bannerMode.value = 'widthFix'
	} else {
		bannerHeight.value = MAX_HEIGHT + 'rpx'
		bannerMode.value = 'aspectFill'
	}
}
function getDetail (){
	uni.showLoading({ mask: true });
	request.get(`/image-service/albums/detail`, { event_id: routeParams.value.event_id }).then((res) => {
		res.event_time = res.event_time ? dayjs(res.event_time).format('YYYY-MM-DD') : ''
		detail.value = res

		store.commit('set', {
			type: 'album_info',
			data: res
		})
	});

	request.post(`/image-service/albums/view/count?event_id=${routeParams.value.event_id}`).then((res) => {
		visitAmount.value = res.view_count
	});
}

function addVistAmount() {
	request.post(`/image-service/albums/view/increment?event_id=${routeParams.value.event_id}`)
}
</script>

<style lang="scss">
	.AlbumInfo{
		.section-banner {
			position: relative;
			min-height: 362rpx;
			overflow: hidden;
			transition: height 0.3s ease;
			.img {
				width: 100%;
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
	}
</style>
