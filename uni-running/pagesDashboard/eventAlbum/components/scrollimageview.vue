<script setup>
	import {
		onMounted,
		reactive,
		ref,
		watch,
	} from 'vue';
		
	let props = defineProps({
		dataList: { // 数据
			type: Array,
			default: [],
		},
		originIndex: { // 滚动到第几个图片
			type: Number,
			default: 0,
		},
		isShow: { // 如果是滑块滑动，则不需要执行滚动方法
			type: Boolean,
			default: false,
		}
	})
	let emits = defineEmits(['dirHandle'])
	//用来设置virBox的宽度--为了帮助list去撑开父级，呈现滚动效果
	const virWidth = ref(0)
	const itemWidth = ref(0) // 一个item的宽度
	const listObj = reactive({
		list: [], //用来做列表渲染
		totalList: [] ,//备份myList
		originLeft: 0, // 滚动的位置
		middle : 0 ,// 中间位置图片
		originIndex: 0, // 当前图片
	})
	const transX = ref(0)
	const timer = ref()
	const isScroll = ref(false) // 是否执行滚动
	const startNum = ref(props.originIndex) // 第一个的位置
	const screenWidth = ref(0) // 屏幕宽度
	watch(()=>props.dataList,(val)=>{
		let myList = val
		listObj.totalList = myList //因为myList外部无法访问到 备份一下
		virWidth.value = itemWidth.value * myList.length //让scrollBox呈现滚动条--让virBox的宽度变大（宽度=每条的宽度*总条数）
	})
		
	watch(()=>props.originIndex,(val)=>{
		startNum.value = val
		scrollLefts.value =  val * itemWidth.value
	})
	watch(()=>props.isShow,(val)=>{
		isScroll.value = val
	})
	const scrollLefts = ref(0)
	const onScroll = (e) => {
		let scrollLeft = e.detail.scrollLeft;
		scrollLefts.value = scrollLeft
		// 计算当前应该显示的列表项范围  
		let start = Math.floor(scrollLeft / itemWidth.value);
		let end = Math.ceil((scrollLeft + screenWidth.value) / itemWidth.value); // 每次显示 5 条数据  
		startNum.value = start
		// 更新列表数据  
		timer.value && clearTimeout(timer.value)
		timer.value = setTimeout(()=>{
			emits('dirHandle',start)
		},200)
	};
	onMounted(()=>{
		const { windowWidth, windowHeight } = uni.getSystemInfoSync();
		screenWidth.value = windowWidth
		itemWidth.value = screenWidth.value / 5
	})
</script>
 
<template>
	<!-- 使用 scroll-view 组件来实现滚动 -->
	<scroll-view class="scrollBox" scroll-x="true" @scroll="onScroll" :scroll-left="scrollLefts">
		<!-- 虚拟滚动容器，不需要实际渲染内容 -->
		<view class="virBox" :style="{ width: virWidth*2 + 'px' }">
			<!-- 列表渲染 -->
			<view class="list" :style="{width:listObj.totalList.length * itemWidth + 'px'}">
				<view :style="{width: (startNum) * itemWidth + 'px' }"></view>
				<template v-for="(item,index) in listObj.totalList" :key="item"> 
					<view class="item" v-if="index >= startNum-1 && index <= (startNum+5)" >
						<image style="width:96rpx;height:96rpx;border:2rpx solid #fff;"  :src="item + '?x-oss-process=image/resize,w_750'" :class="{active: index == 0}" />
					</view>
				</template>
			</view>
		</view>
	</scroll-view>
</template>
 
<style scoped>
	.scrollBox {
		position: relative;
		/* left: 40rpx; */
		top: 60rpx;
		width: 750rpx;
		height: 100rpx;
		overflow-x: scroll;
		cursor: move;
	}
 
	.virBox {
		width: 100%;
		height: 100rpx;
		display: flex;
		position:relative;
	}
	.list {
		display: flex;
		position: relative;
		width:750rpx;
	}
	.item {
		width: 100rpx;
		line-height: 100rpx;
		margin-left:50rpx;
		
		/* position:absolute; */
	}
	/* .list {
		position: absolute;
		top: 0rpx;
		left: 0rpx;
		width: 100%;
		height: 750rpx;
		display: flex;
	}
 
	.item {
		width: 100rpx;
		line-height: 100rpx;
		margin-left:50rpx;
	}
	.item .active {
		border:2rpx solid #fff;
		border-radius: 4rpx;
	} */
</style>