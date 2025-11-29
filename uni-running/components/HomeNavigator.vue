<template>
	<view class="menu" v-if="!isRelease">
		<view class="menu-item" v-for="(item, index) in navList" :key="index" @click="routeTo(item)">
			<view class="menu-item-bg">
				<image class="menu-item-icon" :src="item.icon_url" mode="aspectFill"></image>
			</view>
			<view class="menu-item-title">{{ item.name }}</view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref
	} from 'vue'
	import {
		onShow,
	} from "@dcloudio/uni-app";
	import request from "@/utils/request.js"
	
	const envVersion = uni?.getAccountInfoSync?.().miniProgram.envVersion;
	const isRelease =['release'].includes(envVersion);
	
	const navList = ref([])
	// 页面显示
	onShow(() => {
		getNavList();
	});


	function getNavList() {
		request.get(`/event-api/grid-menu/icons`).then((res) => {
			navList.value = res
		});
	}
	
	function routeTo(item) {
		if (!item.path) return uni.$u.toast('功能筹备中，敬请期待...');
		uni.$u.route(item.path)
	}
</script>

<style lang="scss" scoped>
	.menu {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 22rpx;
		margin: 0 34rpx;
		margin-top: 40rpx;
		background: #ffffff;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid rgba(0, 0, 0, 0.06);

		.menu-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16rpx;

			.menu-item-icon {
				display: block;
				width: 100rpx;
				height: 100rpx;
			}

			.menu-item-title {
				margin-top: -16rpx;
				font-weight: 800;
				font-size: 22rpx;
				color: #000000;
			}
		}
	}
</style>