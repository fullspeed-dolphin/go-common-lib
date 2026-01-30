<template>
	<view class="page">
		<u-navbar title="排行榜" placeholder />
		<view class="tab-container flex-center bgf" :style="{ top: getNavbarHeight() + 'px' }">
			<u-tabs lineHeight="2" :duration="0" :inactiveStyle="{ color: '#000' }" :activeStyle="{ color: '#FF8C00' }"
				:list="tab.items" @change="changeTab" :scrollable="false" keyName="label" lineColor="#FF8C00" />
		</view>
		<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="100">
			<!-- 个人跑量列表 -->
			<view v-if="tab.active === 0" class="ranking-list">
				<view class="ranking-item" v-for="(item, index) in dataList" :key="item.id || index">
					<!-- 排名 -->
					<view class="ranking-number">
						<view v-if="index < 3" class="medal-wrapper">
							<image :class="['medal-icon', `medal-${index + 1}`]" :src="getMedalIcon(index + 1)" mode="aspectFit">
							</image>
						</view>
						<text v-if="index >= 3" class="rank-text">{{ index + 1 }}</text>
					</view>
					<!-- 头像和奖牌 -->
					<view class="avatar-wrapper">
						<up-lazy-load height="120" borderRadius="200" error-img="/static/images/user.png"
							:image="item.avatar_url+ '?x-oss-process=image/resize,w_150,h_150,m_fill'" mode="aspectFill" />
					</view>
					<!-- 名称 -->
					<view class="name">{{ item.nickname || "用户" }}</view>
					<!-- 跑量 -->
					<view class="distance">{{
              formatDistance(item.total_km)
            }}km</view>
				</view>
			</view>

			<!-- 团队跑量列表 -->
			<view v-if="tab.active === 1" class="team-list">
				<GroupItem v-for="(item, index) in dataList" :key="item.id || item.group_id || index" :item="item"
					variant="detail" :rankIcon="index < 3 ? getMedalIcon(index + 1, true) : ''" />
			</view>
		</mescroll-body>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		nextTick
	} from "vue";
	import {
		useStore
	} from "vuex";
	import GroupItem from "@/components/GroupItem.vue";
	import request from "@/utils/request.js";
	import {
		useShare
	} from "@/composables/useShare.js";
	import { getNavbarHeight } from "@/utils/util.js"

	import {
		onPageScroll,
		onReachBottom
	} from "@dcloudio/uni-app";
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const {
		mescrollInit,
		downCallback,
		getMescroll
	} = useMescroll(onPageScroll, onReachBottom);

	// 使用store
	const store = useStore();

	// 分享配置
	useShare({
		title: '运动排行榜',
		path: '/pagesSub/sport/top'
	});

	// 模板引用
	const mescrollRef = ref(null);

	// 响应式数据
	const tab = ref({
		active: 0,
		items: [{
				label: "个人跑量",
				value: "personal"
			},
			{
				label: "团队跑量",
				value: "team"
			},
		],
	});

	const dataList = ref([]);

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// tab切换
	const changeTab = (detail) => {
		tab.value.active = detail.index;
		refreshList();
	};

	// 格式化距离（米转公里，保留2位小数）
	const formatDistance = (distance) => {
		if (!distance) return "0.00";
		// 如果已经是公里，直接返回；如果是米，转换为公里
		const km = distance > 10000 ? distance / 1000 : distance;
		return parseFloat(km).toFixed(2);
	};

	// 获取奖牌图标
	const getMedalIcon = (rank, isTeam = false) => {
		// 这里可以使用实际的奖牌图标路径
		// 1: 金牌, 2: 银牌, 3: 铜牌
		const medalMap = {
			1: isTeam ?
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top1@2x.png" :
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top1@2x.png", // 金牌，可以用实际路径替换
			2: isTeam ?
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top2@2x.png" :
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top2@2x.png", // 银牌
			3: isTeam ?
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top3@2x.png" :
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top3@2x.png", // 铜牌
		};
		return (
			medalMap[rank] ||
			(isTeam ?
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top3@2x.png" :
				"https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top3@2x.png")
		);
	};

	const refreshList = () => {
		getMescroll().resetUpScroll();
		getMescroll().scrollTo(0, 0);
	};

	const getList = (mescroll) => {
		uni.showLoading({
			mask: true
		});

		const data = {
			page: mescroll.num - 1,
			page_size: 10,
		};

		// 根据当前tab选择不同的API
		const apiUrl =
			tab.value.active === 0 ?
			`/sport-api/api/manual/user-ranking` // 个人跑量排行榜API
			:
			`/sport-api/api/manual/group-ranking`; // 团队跑量排行榜API

		request.get(apiUrl, data).then((res) => {
				res = res.list
				mescroll.endSuccess(res.length);

				//如果是第一页需手动制空列表
				if (mescroll.num == 1) {
					dataList.value = [];
				}

				dataList.value = dataList.value.concat(res); //追加新数据
			})
			.catch((error) => {
				uni.hideLoading();
				console.error("获取排行榜数据失败:", error);
			});
	};
</script>

<style lang="scss" scoped>
	.page {
		background: #fafafa;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tab-container {
		position: fixed;
		width: 100%;
		z-index: 10;
	}

	// 个人跑量列表样式
	.ranking-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 34rpx;

		.ranking-item {
			position: relative;
			display: flex;
			align-items: center;
			background: #ffffff;
			border-radius: 16rpx;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
			padding: 10rpx 26rpx;
			margin-bottom: 20rpx;

			.ranking-number {
				width: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.rank-text {
					font-weight: bold;
					font-size: 30rpx;
					color: #707070;
				}

				.medal-wrapper {
					position: absolute;
					top: 0;
					width: 50rpx;
					height: 50rpx;
					z-index: 2;

					.medal-icon {
						width: 38rpx;
						height: 51rpx;
					}
				}
			}

			.avatar-wrapper {
				position: relative;
				margin-left: 20rpx;
				margin-right: 24rpx;
				flex-shrink: 0;
				width: 100rpx;
				height: 100rpx;
			}

			.name {
				flex: 1;
				font-weight: bold;
				font-size: 28rpx;
				color: #000000;
				margin-right: 20rpx;
			}

			.distance {
				font-weight: bold;
				font-size: 24rpx;
				color: #000000;
				flex-shrink: 0;
			}
		}
	}

	// 团队跑量列表样式
	.team-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 34rpx;

		:deep(.group-item) {
			margin-bottom: 20rpx;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
		}
	}
</style>