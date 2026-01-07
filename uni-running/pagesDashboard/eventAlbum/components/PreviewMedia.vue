<template>
	<view v-if="isShowModal" class="PreviewMedia">
	<up-popup :show="isShowModal" @close="close" overlayOpacity="0.9" bgColor="transparent" mode="center" closeable>
		<view class="flex-center" style="height: 100vh;width:100vw">
			<SwiperSection ref="refSwiper" :originIndex="originIndex" @loadingMore="loadingMore" v-if="isShowModal" />
			<view class="flex-center" style="position: fixed;left:0;bottom: 90rpx;width: 100%;">
				<!-- <view class="slider-range" style="width: 686rpx;">
					<view>测试</view>
					<SliderRange v-model="sliderRange" solo :decoration="false" :max="60" />
				</view> -->

				<up-button @click="downloadPicture" type="primary" shape="circle" icon="download"
					customStyle="width:186rpx;height:60rpx;">
					下载原图
				</up-button>
			</view>
		</view>
	</up-popup>
	</view>
</template>

<script setup>
import SliderRange from "./xz-slider-range/xz-slider-range.vue";
import SwiperSection from "./rswiper.vue"
	import {
		ref, onMounted, computed
	} from "vue";
	import {
		useStore
	} from "vuex";
	const store = useStore();
	
	const album_total = computed(() => store.state.album_total);
	const album_data = computed(() => store.state.album_data);
	const sliderRange = ref(20);

	const emits = defineEmits(["open",'loadingMore']);

	const isShowModal = ref(false);
	const refSwiper = ref(null);
	const originList = ref([]) // 源数据
	const originIndex = ref(0) // 记录源数据的下标
	
	function openModal(link, index) {
		console.log('link====>', link, index)
		if(link) {
			isShowModal.value = true;
		}
		
		originIndex.value = index
	}
	const loadingMore=(index)=> {
		emits('loadingMore', index)
	}
	
	function close() {
		isShowModal.value = false;
	}

	function downloadPicture() {
		const currentIndex = refSwiper.value?.originIndex;
		const list = refSwiper.value?.originList;
		const imageUrl = list?.[currentIndex];

		if (!imageUrl) {
			uni.showToast({ title: '获取图片失败', icon: 'none' });
			return;
		}

		uni.showLoading({ title: '下载中...' });

		uni.downloadFile({
			url: imageUrl,
			success: (res) => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.hideLoading();
							uni.showToast({ title: '保存成功', icon: 'success' });
						},
						fail: (err) => {
							uni.hideLoading();
							if (err.errMsg?.includes('auth deny')) {
								uni.showToast({ title: '请授权相册权限', icon: 'none' });
							} else {
								uni.showToast({ title: '保存失败', icon: 'none' });
							}
						}
					});
				} else {
					uni.hideLoading();
					uni.showToast({ title: '下载失败', icon: 'none' });
				}
			},
			fail: () => {
				uni.hideLoading();
				uni.showToast({ title: '下载失败', icon: 'none' });
			}
		});
	}
	defineExpose({
		openModal,
		close,
	});
</script>

<style lang="scss" >

</style>