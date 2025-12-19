<template>
	<up-popup :show="show" @close="close" closeable>
		<view class="flex-center van-hairline--bottom" style="height: 100rpx;padding: 0 34rpx;">
			<view class="" style="font-weight: bold;font-size: 30rpx;color: rgba(0,0,0,0.8);">选择报名卡</view>
		</view>

		<view class="card-item van-hairline--bottom" v-for="(item, index) in dataList" :key="index" @click="selectItem(item)">
			<view class="card-item-wrapper">
				<view class="radio-btn" @click.stop="selectItem(item)">
					<u-icon v-if="selectedId === item.id" name="checkmark-circle-fill" color="#FF8C00" size="22"></u-icon>
					<view v-else class="radio-circle"></view>
				</view>
				<view class="card-item-content">
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
			</view>
		</view>
		<u-button v-if="dataList.length" type="primary" @click="confirmSelect" shape="circle" :disabled="!selectedId" customStyle="margin: 40rpx auto;width: 500rpx;">确认</u-button>
		<u-button :type="dataList.length ? 'info' : 'primary'" @click="$u.route('pagesSub/registrationCard/list')" shape="circle" :plain="dataList.length > 0" customStyle="margin: 40rpx auto;width: 500rpx;">创建报名卡</u-button>
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
	const selectedId = ref(null);
	const selectedItem = ref(null);

	const eventData = ref({})
	function open(data) {
		show.value = true;
		eventData.value = data
		selectedId.value = null
		selectedItem.value = null
		getList()
	}

	function close() {
		show.value = false;
	}

	function selectItem(item) {
		selectedId.value = item.id
		selectedItem.value = item
	}

	function confirmSelect() {
		if (!selectedItem.value) return
		close();
		emit('select', {
			eventInfo: eventData.value,
			signerInfo: getLimitSingerdata()
		})
	}
	
	// gender: "male",
	// birthday: "",
	// 0、如果证件类型选择的是身份证，要做实时校验
	// 1、在报名卡中如果检测到是大于18岁的男性，T-shirt尺码只给选择L
	// 2、如果是大于18岁的女性，T-shirt尺码只给选择M
	// 3、2016年之后出生的身份证只给130的T-shirt尺码
	
	function getLimitSingerdata () {
		const form = JSON.parse(JSON.stringify(selectedItem.value))
		
		if (form?.birthday) {
			const userAge = new Date().getFullYear() - form.birthday.slice(0, 4);
			
			if (userAge > 18) {
				if (form.gender === "1") {
					form.clothesSize = 'L'
				} else {
					form.clothesSize = 'M'
				}
			}
			
			if (userAge < 10) {
				form.clothesSize = '130'
			}
		}
		
		console.log("form====>", form)
		
		return form;
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
			console.error(error);
			dataList.value = [];
		} finally {
			loading.value = false;
		}
	};

	const formatIdCard = (idCard) => {
		if (!idCard || idCard.length < 3) return "***";
		return `${idCard.slice(0, 1)} *************** ${idCard.slice(-2)}`;
	};
	
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

		.card-item-wrapper {
			display: flex;
			align-items: center;

			.radio-btn {
				margin-right: 20rpx;
				flex-shrink: 0;

				.radio-circle {
					width: 40rpx;
					height: 40rpx;
					border: 2rpx solid #ccc;
					border-radius: 50%;
					box-sizing: border-box;
				}
			}

			.card-item-content {
				flex: 1;
			}
		}

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