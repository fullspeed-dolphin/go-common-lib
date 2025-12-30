<script setup>
	import {
		onMounted,
		reactive,
		ref,
		watch
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
		total: {
			type: Number,
			default: 0,
		}
	})
	let emits = defineEmits(['dirHandle'])
	//用来设置virBox的宽度--为了帮助list去撑开父级，呈现滚动效果
	const virWidth = ref(0)
	const itemWidth = 150
	const listObj = reactive({
		list: [], //用来做列表渲染
		totalList: [] ,//备份myList
		originLeft: 0, // 滚动的位置
		middle : 0 ,// 中间位置图片
		originIndex: 0, // 当前图片
	})
	const transX = ref(0)
	watch(()=>props.dataList,(val)=>{
		
		let myList = val
		// console.log("val====",val.length)
		listObj.totalList = myList //因为myList外部无法访问到 备份一下
		// listObj.list = myList.slice(0, 5) //把数据拿到后 先截取前5条
		listObj.list = listObj.totalList.slice(props.originIndex, props.originIndex+5); // 每次显示 5 条数据
		virWidth.value = itemWidth * myList.length //让scrollBox呈现滚动条--让virBox的宽度变大（宽度=每条的宽度*总条数）
	})
		
	watch(()=>props.originIndex,(val)=>{
		console.log("val=====props.originIndex===",val)
		// if(val < 4) {
		// 	// listObj.originLeft = 0
		// } else {
		// 	// listObj.originLeft = (val-2) * 150
		// }
		// 更新列表数据  
		listObj.list = listObj.totalList.slice(val, val+5); // 每次显示 5 条数据
		// 更新位置
		// let scrollLeft = 150 * val;
		transX.value = 150 * val
	})
	const onScroll = (e) => {
		// console.log("e======",e)
		// e.detail.scrollTop 在 uniapp 的 scroll-view 组件中通常包含了滚动位置  
		let scrollLeft = e.detail.scrollLeft;
		// console.log('滚动位置:', scrollLeft);
 
		// 计算当前应该显示的列表项范围  
		let start = Math.floor(scrollLeft / itemWidth);
		let end = Math.ceil((scrollLeft + 750) / itemWidth); // 每次显示 5 条数据  
 
		// 更新列表数据  
		// let start = props.originIndex;
		// let end = props.originIndex + 5;
		listObj.list = listObj.totalList.slice(start, end);
		// 获取中间位置图片
		// listObj.middle = end - 2
		emits('dirHandle',start)
		//纵向偏移 把结构调整回来
		transX.value = scrollLeft
		// console.log('scroll===start=====',start)
	};
</script>
 
<template>
	<!-- 使用 scroll-view 组件来实现滚动 -->
	<scroll-view class="scrollBox" scroll-x="true" scroll-y="false" @scroll="onScroll" :scroll-left="`${transX}`">
		<!-- 虚拟滚动容器，不需要实际渲染内容 -->
		<view class="virBox" :style="{ width: virWidth*2 + 'rpx' }" :data-trans="`${transX}`"></view>
		<!-- 列表渲染 -->
		<view class="list" :style="{transform:`translateX(${transX*2}rpx)`}">
			<view class="item" v-for="(item,index) in listObj.list" :key="item">
				<image style="width:100rpx;height:96rpx;" :src="item + '?x-oss-process=image/resize,w_750'" :class="{active: index == 0}" />
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
	}
 
	.list {
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
	}
</style>