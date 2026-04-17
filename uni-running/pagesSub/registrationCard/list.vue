<template>
	<view class="">
		<u-navbar :title="isSelectMode ? '请选择报名卡' : '报名卡'" placeholder />
		<view v-if="!registrationCardList.length && !loading" class="flex-col-center section-empty" style="">
			尚未添加任何报名卡
			<view class="">点击下面的"添加报名卡"按钮进行添加</view>
		</view>

		<view style="padding-bottom: 160rpx;">
			<view class="card-item" :class="{ 'card-item-selectable': isSelectMode }"
				v-for="(item, index) in registrationCardList" :key="item.id || index"
				@click="isSelectMode ? handleSelect(item) : null">
				<view class="name">
					<view class="name-text">{{ item.full_name }}</view>
					<view class="name-owner" v-if="item.is_self" :style="{ color: themeColor, backgroundColor: themeColor + '1A' }">本人</view>
				</view>
				<view class="id-card-number">
					<view class="id-card-number-text">{{
            formatIdCard(item.cert_number || "")
          }}</view>
					<view class="id-card-number-separator">|</view>
					<view class="id-card-number-type">{{ isAdult(item.cert_number) ? "成人" : "儿童" }}</view>
				</view>
				<view class="card-item-actions">
					<view class="card-item-actions-item" @click.stop="handleSetAsOwner(item)">
						<up-checkbox @change="handleCheckboxChange($event, item)" usedAlone v-model:checked="item.is_self" shape="circle" :activeColor="themeColor"  size="14"  />
						设为本人
					</view>
					<view class="card-item-actions-item-group">
						<view class="card-item-actions-item" @click.stop="handleEdit(item)">
							<u-icon name="edit-pen" size="20" color="#999999"></u-icon>
							修改
						</view>
						<view class="card-item-actions-item" @click.stop="handleDelete(item)">
							<u-icon name="trash" size="20" color="#999999"></u-icon>
							删除
						</view>
					</view>
				</view>
			</view>
		</view>

		<section class="section-bottom">
			<view style="padding: 56rpx 54rpx 40rpx">
				<u-button type="primary" :color="themeColor" shape="circle"
					@click="$u.route('pagesSub/registrationCard/create')">添加报名卡</u-button>
			</view>
		</section>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		onMounted
	} from "vue";
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app";
	import request from "@/utils/request.js";
	import {
		showRequestError
	} from "./utils.js";
	import { useShare } from "@/composables/useShare.js";
	import { isAdult } from './utils.js'

	// 分享配置
	useShare({
		title: '我的报名卡',
		path: '/pagesSub/registrationCard/list'
	});

	// 响应式数据
	const registrationCardList = ref([]);
	const loading = ref(false);
	const options = ref({});
	const isSelectMode = ref(false);
	const themeColor = computed(() => {
		const config = uni.getStorageSync('eventThemeColor');
		return config?.solid || '#FF8C00';
	});

	// 格式化身份证号显示
	const formatIdCard = (idCard) => {
		if (!idCard || idCard.length < 3) return "***";
		return `${idCard.slice(0, 1)} *************** ${idCard.slice(-2)}`;
	};

	// 获取报名卡列表
	const getRegistrationCardList = async () => {
		try {
			loading.value = true;
			const res = await request.post(
				"/booking-api/registration/getSignerList", {}
			);
			if (Array.isArray(res)) {
				registrationCardList.value = res;
			} else {
				registrationCardList.value = [];
			}
		} catch (error) {
			console.error("获取报名卡列表失败:", error);
			showRequestError(error, "获取报名卡失败");
			registrationCardList.value = [];
		} finally {
			loading.value = false;
		}
	};

	// 设为本人
	const handleSetAsOwner = async (item) => {
		try {
			const id = item.id;
			if (!id) {
				uni.showToast({
					title: "数据异常",
					icon: "none"
				});
				return;
			}

			await request.post("/booking-api/registration/updateSignerInfo", {
				id: id,
				is_self: item.is_self == 1 ? 0 : 1,
			});

			uni.showToast({
				title: "设置成功",
				icon: "success"
			});
			// 刷新列表
			getRegistrationCardList();
		} catch (error) {
			console.error("设置失败:", error);
			showRequestError(error, "设置失败");
		}
	};

	// checkbox 状态变化时设为本人
	const handleCheckboxChange = async (isChecked, item) => {
		try {
			const id = item.id;
			if (!id) {
				uni.showToast({
					title: "数据异常",
					icon: "none"
				});
				return;
			}

			await request.post("/booking-api/registration/updateSignerInfo", {
				id: id,
				is_self: isChecked ? 1 : 0,
			});

			uni.showToast({
				title: "设置成功",
				icon: "success"
			});
			// 刷新列表
			getRegistrationCardList();
		} catch (error) {
			console.error("设置失败:", error);
			showRequestError(error, "设置失败");
		}
	};

	// 编辑报名卡
	const handleEdit = (item) => {
		const data = encodeURIComponent(JSON.stringify({
			id: item.id
		}));
		uni.navigateTo({
			url: `/pagesSub/registrationCard/edit?data=${data}`,
		});
	};

	// 删除报名卡
	const handleDelete = (item) => {
		uni.showModal({
			title: "提示",
			content: "确定要删除这个报名卡吗？",
			success: async (res) => {
				if (res.confirm) {
					try {
						const id = item.id;
						if (!id) {
							uni.showToast({
								title: "数据异常",
								icon: "none"
							});
							return;
						}

						await request.post("/booking-api/registration/deleteSignerInfo", {
							id: id,
						});

						uni.showToast({
							title: "删除成功",
							icon: "success"
						});
						// 刷新列表
						getRegistrationCardList();
					} catch (error) {
						console.error("删除失败:", error);
						showRequestError(error, "删除失败");
					}
				}
			},
		});
	};

	// 选择报名卡（选择模式）
	const handleSelect = (item) => {
		if (!item.id) {
			uni.showToast({
				title: "数据异常",
				icon: "none"
			});
			return;
		}

		// 将选中的 id 存储到本地存储
		uni.setStorageSync("selectedSignerId", item.id);

		// 返回上一页
		uni.navigateBack();
	};

	// 页面加载
	onLoad((optionsParam) => {
		options.value = optionsParam;
		// 检查是否是选择模式
		isSelectMode.value = optionsParam.selectMode === "1";
	});

	onMounted(() => {
		getRegistrationCardList();
	});

	onShow(() => {
		// 每次显示页面时刷新列表（编辑或创建后返回）
		getRegistrationCardList();
	});
</script>

<style lang="scss" scoped>
	.section-empty {
		min-height: 80vh;
		font-size: 34rpx;
		color: #707070;
		line-height: 48rpx;
		text-align: center;
	}

	.section-bottom {
		position: fixed;
		bottom: 0px;
		width: 100%;
		z-index: 10;
		margin: 0;
	}

	.card-item {
		margin: 20rpx 34rpx;
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
				border-radius: 8rpx 8rpx 8rpx 8rpx;
				font-size: 24rpx;
				padding: 8rpx 16rpx;
			}
		}

		.id-card-number {
			display: flex;
			align-items: center;
			margin-top: 12rpx;
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
				color: #999;
			}
		}
	}

	.card-item-selectable {
		cursor: pointer;
		transition: all 0.3s;

		&:active {
			opacity: 0.8;
			transform: scale(0.98);
		}
	}

	.card-item-select-hint {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #e5e5e5;
		text-align: center;
		font-size: 26rpx;
	}
</style>