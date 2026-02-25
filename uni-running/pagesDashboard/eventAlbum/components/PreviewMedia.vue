<template>
	<view class="PreviewMedia">
		<up-popup :show="isShowModal" @close="close" overlayOpacity="0.9" bgColor="transparent" mode="center" closeable>
			<view class="flex-center" style="height: 100vh;width:100vw">
				<SwiperSection ref="refSwiper" :originIndex="originIndex" @loadingMore="loadingMore" v-if="isShowModal" />
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
	const album_info = computed(() => store.state.album_info);
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

	defineExpose({
		openModal,
		close,
	});
</script>

<style lang="scss" >

</style>