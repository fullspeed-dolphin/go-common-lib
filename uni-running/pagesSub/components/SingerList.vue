<template>
	<up-popup :show="show" @close="close" closeable>
		<view class="flex-center van-hairline--bottom" style="height: 100rpx;padding: 0 34rpx;">
			<view class="" style="font-weight: bold;font-size: 30rpx;color: rgba(0,0,0,0.8);">选择人员</view>
		</view>

		<view class="card-item van-hairline--bottom" v-for="(item, index) in dataList" :key="index" @click="handleSelect(item)">
			<view class="name">
				<view class="name-text">{{ item.full_name }}</view>
				<view class="name-owner" v-if="item.is_self">本人</view>
			</view>
			<view class="id-card-number">
				<view class="id-card-number-text">{{
		      formatIdCard(item.cert_number || "")
		    }}</view>
				<view class="id-card-number-separator">|</view>
				<view class="id-card-number-type"> 成人 </view>
			</view>
		</view>
		<u-button type="primary" @click="$u.route('pagesSub/registrationCard/list')" shape="circle" customStyle="margin: 40rpx auto;width: 500rpx;">添加报名卡</u-button>
	</up-popup>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import request from "@/utils/request.js"

	// Emits
	const emit = defineEmits(["open", 'select']);

	const show = ref(false);

	const eventData = ref({})
	function open(data) {
		show.value = true;
		eventData.value = data
		getList()
	}

	function close() {
		show.value = false;
	}

	// 获取报名卡列表
	const loading = ref(false)
	const dataList = ref([])

	const getList = async () => {
		uni.showLoading({
			mask: true
		});
		try {
			loading.value = true;
			const res = await request.post(
				"/booking-api/registration/getSignerList", {}
			);
			if (Array.isArray(res)) {
				dataList.value = res;
			} else {
				dataList.value = [];
			}
		} catch (error) {
			console.error("获取报名卡列表失败:", error);
			showRequestError(error, "获取报名卡失败");
			dataList.value = [];
		} finally {
			loading.value = false;
		}
	};

	const formatIdCard = (idCard) => {
		if (!idCard || idCard.length < 3) return "***";
		return `${idCard.slice(0, 1)} *************** ${idCard.slice(-2)}`;
	};
	
	function handleSelect(item) {
		close();
		
		emit('select', {
			eventInfo: eventData.value,
			signerInfo: item
		})
	}

	// 暴露方法给父组件
	defineExpose({
		open,
		close,
	});
</script>

<style lang="scss" scoped>
	.card-item {
		margin: 20rpx;
		padding: 24rpx 20rpx;
		background: #ffffff;
		border-radius: 16rpx 16rpx 16rpx 16rpx;

		.name {
			display: flex;
			align-items: center;
			font-size: 28rpx;

			.name-text {
				font-weight: bold;
				font-size: 30rpx;
				color: #000000;
			}

			.name-owner {
				display: flex;
				align-items: center;
				margin-left: 26rpx;
				background: #f1ffde;
				border-radius: 8rpx 8rpx 8rpx 8rpx;
				font-weight: bold;
				font-size: 24rpx;
				color: #8cc63e;
				padding: 8rpx 16rpx;
			}
		}

		.id-card-number {
			display: flex;
			align-items: center;
			margin-top: 12rpx;
			font-weight: bold;
			font-size: 32rpx;
			color: #000000;

			.id-card-number-separator {
				margin: 0 16rpx;
				font-weight: 100;
				color: #bfbfbf;
			}
		}

		.card-item-actions {
			display: flex;
			justify-content: space-between;
			border-top: 1rpx solid #e5e5e5;
			align-items: center;
			margin-top: 20rpx;
			padding-top: 20rpx;

			.card-item-actions-item-group {
				display: flex;
				align-items: center;
				gap: 20rpx;
			}

			.card-item-actions-item {
				display: flex;
				align-items: center;
				font-size: 28rpx;
				color: #999;

				&.active {
					opacity: 0.8;
				}
			}
		}
	}
</style>