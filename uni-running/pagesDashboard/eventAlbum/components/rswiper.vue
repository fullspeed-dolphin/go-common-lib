<template>
	<view style="width:750rpx;" @touchstart="touchStart" @touchend="touchEnd">
		<swiper class="swiper" circular @change="swiperChange" swiperDuration="250" :current="currentIndex"
			:disable-touch="disableTouch">
			<swiper-item class="flex-center" v-for="(item, index) in displaySwiperList" :key="index">
				<image style="display: block;width:750rpx;" v-if="item" :src="item + '?x-oss-process=image/resize,w_750'" mode="widthFix" />
			</swiper-item>
		</swiper>
		
		<view class="section-slider">
			<!-- <view class="title">当前：{{originIndex+1 }}/{{ originList.length }}</view> -->
			<!-- // <slider :value="originIndex" @change="sliderChange" :step="1" :max="originList.length -1" /> -->
			<xzsliderrange v-model="originIndexArr" solo :decoration="false"  @move="moveChange" :size="30" height="2px" activeBgc="rgb(0, 122, 255)" :max="totalNumber" :min="0"/>
		</view>
		<!-- loading -->
		<view class="loading">
			<up-loading-page bg-color="#e8e8e8" :loading="isloading" loading-text="加载中..." style="background-color:rgba(0,0,0,.3)"></up-loading-page>
		</view>
	</view>
</template>

<script setup>
	import xzsliderrange from "./xz-slider-range/xz-slider-range.vue"
	import {
		onMounted,
		ref,
		watch,
		nextTick,
		toRef
	} from 'vue';
	const props = defineProps({
		originList: {
			type: Array,
			default: []
		},
		originIndex: {
			type: [Number, String],
			default: 0
		},
		totalNumber: {
			type: [Number, String],
			default: 0
		}
	})
	const emits = defineEmits(['loadingMore'])
	watch(() => props.originList, (val) => {
		console.log('val========', props.originIndex)
		originList.value = props.originList
		originIndex.value = props.originIndex
		originIndexArr.value[0] = originIndex.value
		displayIndex.value = 0
		currentIndex.value = 0
		isloading.value = false
		initSwiperData(originIndex.value);
	})
	const originList = ref([]) // 源数据
	const displaySwiperList = ref([]) // swiper需要的数据
	const displayIndex = ref(0) // 用于显示swiper的真正的下标数值只有：0，1，2。
	const originIndex = ref(0) // 记录源数据的下标
	const originIndexArr = ref([1])
	const currentIndex = ref(0) // 显示swiper的当前值只有：0，1，2。
	const disableTouch = ref(false) // 是否阻止触摸
	const isloading = ref(false) // 加载动画内容
	const initSwiperData = (originIndex) => {
		// console.log('originIndex===', originIndex)
		setTimeout(() => {
			if (originIndex == 0 && endDir.value == 'right') {
				disableTouch.value = true
				// console.log("hello,world111", endDir.value)
				return;
			} else {
				// console.log("hello,world22", endDir.value)
				disableTouch.value = false
			}
			const originListLength = originList.value.length; // 源数据长度

			let displayList = [];
			displayList[displayIndex.value] = originList.value[originIndex];
			displayList[displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1] =
				originList.value[
					originIndex - 1 == -1 ? originListLength - 1 : originIndex - 1
				];
			displayList[displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1] =
				originList.value[
					originIndex + 1 == originListLength ? 0 : originIndex + 1
				];
			displaySwiperList.value = displayList;
			// originIndexArr.value[0] = originIndex
			// console.log('displayList', displayList)
		}, 200)

	}

	/**
	 * swiper滑动时候
	 */
	const swiperChange = (event) => {
		const {
			current
		} = event.detail;
		currentIndex.value = current
		// console.log(current, 'current=====',event.detail)
		const originListLength = originList.value.length; // 源数据长度
		if (originIndex.value + 3 > originListLength) {
			emits('loadingMore', originIndex.value + 1)
			isloading.value = true
			return;
		}
		// =============向后==========
		if (displayIndex.value - current == 2 || displayIndex.value - current == -1) {
			// console.log('向后滑动', displayIndex.value, current)
			originIndex.value =
				originIndex.value + 1 == originListLength ? 0 : originIndex.value + 1;
			displayIndex.value = displayIndex.value + 1 == 3 ? 0 : displayIndex.value + 1;
			initSwiperData(originIndex.value);
		}
		// ======如果两者的差为-2或者1则是向前滑动============(1,0和0,2 和2,1)
		else if (displayIndex.value - current == -2 || displayIndex.value - current == 1) {
			// console.log('向前面==滑动', displayIndex.value, current)
			originIndex.value = originIndex.value - 1 == -1 ? originListLength - 1 : originIndex.value - 1;
			displayIndex.value = displayIndex.value - 1 == -1 ? 2 : displayIndex.value - 1;
			initSwiperData(originIndex.value);
		}
		// console.log('originIndex.value',originIndex)s
		originIndexArr.value[0] = originIndex.value
		// console.log('originIndexArr.value[0]',originIndexArr.value[0])
	}
	// const sliderChange = (e) => {
	// 	originIndex.value = e.detail.value
	// 	console.log('value 发生变化：' + e.detail.value)
	// 	if (originIndex.value + 3 > originList.value.length) {
	// 		emits('loadingMore', originIndex.value + 1)
	// 		isloading.value = true
	// 		return;
	// 	}
	// 	initSwiperData(originIndex.value);
	// }
	const moveChange = (e) => {
		if(originIndex.value == e[0])return
		console.log('e===',e)
		originIndex.value = e[0]
		// originIndexArr.value[0] = originIndex.value
		// originIndexArr.value = originIndex.value
		// console.log('value 发生变化：' + e.detail.value)
		if (originIndex.value + 3 > originList.value.length) {
			emits('loadingMore', originIndex.value)
			isloading.value = true
			return;
		}
		initSwiperData(originIndex.value);
		originIndexArr.value[0] = originIndex.value
	}

	const startTime = ref(0)
	const startPosition = ref(0)
	const endPosition = ref(0)
	const endDir = ref('')
	// 起点
	const touchStart = (event) => {
		startTime.value = Date.now()
		startPosition.value = event.changedTouches[0].clientX
	}
	// 终点,计算移动距离
	const touchEnd = (event) => {
		const endTime = Date.now()
		if (endTime - startTime.value > 2000) {
			return;
		}
		endPosition.value = event.changedTouches[0].clientX


		//当移动距离超过10时判断左滑右滑。
		if (Math.abs(endPosition.value - startPosition.value) > 10) {
			endPosition.value = event.changedTouches[0].clientX
			endDir.value = endPosition.value - startPosition.value > 0 ? "right" : "left"

			if (endDir.value == 'left') {
				// console.log("wos==")
				disableTouch.value = false
				if (originIndex.value == 0) {
					// currentIndex.value = 1
					originIndex.value = 1
					initSwiperData(originIndex.value);
				}
			}
		} else {
			return;
		}

		// console.log(endDir.value)
	}
	onMounted(() => {
		originList.value = props.originList
		originIndex.value = props.originIndex
		originIndexArr.value[0] = originIndex.value
		// console.log("originList.value", originList.value)
		initSwiperData(originIndex.value);
	})
</script>

<style lang="scss" scoped>
	.title {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 60rpx;
		color: #fff
	}

	.swiper {
		height: calc(100vh - 120rpx);
	}

	.section-slider{
		position: fixed;
		width: 100%;
		bottom: 150rpx;
		left:0;
	}
</style>