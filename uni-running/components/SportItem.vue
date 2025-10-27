<template>
	<view class="group-item flex-between-center" @click="viewDetail(item)">
		<view class="flex-row">
			<view class="poster mr10 flex-center">
				<image class="icon" src="../static/checkicon@2x.png" mode="aspectFill"></image>
			</view>
			<view class="">
				<view class="flex-start amount-number">
					<view class="amount">0.00</view>
					<view class="">公里</view>
				</view>
				<view class="statics">
					<text class="mr10">用时 01:30:31</text>
					<text>配速7’29”</text>
				</view>
			</view>
		</view>
		<view class="text flex-start">
			<view class="time">
				9月3日
			</view>
			<u-icon name="arrow-right"></u-icon>
		</view>
	</view>
</template>
<script setup>
// Props
const props = defineProps({
	item: {
		type: Object,
		default: () => {}
	},
	from: {
		type: String,
		default: ''
	}
})

// Emits
const emit = defineEmits(['join'])

// 方法定义
const viewDetail = (item) => {
	// 搜索组件中不跳转详情，加入按钮控制交互
	if (props.from === 'search') return;
	
	uni.setStorageSync('sportDetail', item)
	uni.$u.route(`pagesSub/sportDetail?group_id=${item.group_id}`)
}

const joinGroup = (item) => {
	emit('join', item)
}
</script>

<style lang="scss" scoped>
	.group-item{
		height: 100rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 2rpx 2rpx 2rpx rgba(0,0,0,0.16);
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		.poster{
			.icon{
				width: 37rpx;
				height: 40rpx;
			}
			width: 61rpx;
			height: 61rpx;
			background: #FF8C00;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
	}
	.amount-number{
		color: #979797;
		font-size: 16rpx;
		.amount{
			font-weight: bold;
			font-size: 24rpx;
			margin-right: 4rpx;
			color: #000;
		}
	}
	.statics{
		font-size: 16rpx;
		color: #979797;
	}
	.time{
		font-size: 20rpx;
		color: #979797;
	}
</style>