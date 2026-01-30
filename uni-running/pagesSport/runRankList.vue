<template>
	<view class="">
		<u-navbar title="跑量排行榜" placeholder />
		<!-- Tab 切换 -->
		<view class="tab-container" :style="{ top: getNavbarHeight() + 'px' }">
			<view class="category-tags">
				<view class="tags-inner">
					<view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
					<view
						v-for="(item, index) in tabList"
						:key="item.value"
						:id="'tab-' + index"
						class="tag-item"
						:class="{ active: currentIndex === index }"
						@click="handleTabChange(index)"
					>
						{{ item.label }}
					</view>
				</view>
			</view>
		</view>
		<!-- 内容区域 -->
		<view class="content-wrapper"
			@touchstart="onTouchStart"
			@touchend="handleTouchEnd">
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="0" :up="{ auto: false }">
				<!-- 个人跑量列表 -->
				<view v-if="currentIndex === 0" class="ranking-list list-transition" :class="listAnimClass">
					<view class="card-item" v-for="(item, index) in dataList" :key="item.id || index">
						<!-- 头像 -->
						<up-lazy-load class="avatar" borderRadius="16" error-img="/static/images/user.png"
							:image="item.avatar_url + '?x-oss-process=image/resize,w_150,h_150,m_fill'" mode="aspectFill" />
						<!-- 内容区域 -->
						<view class="card-content">
							<view class="title-row">
								<view class="name ellipsis">{{ item.nickname || "用户" }}</view>
								<view class="distance-tag">
									<text class="distance-value">{{ formatDistance(item.total_km) }}</text>
									<text class="distance-unit">km</text>
								</view>
							</view>
							<view class="group-name">{{ item.running_group_name || '无跑团信息' }}</view>
						</view>
						<!-- 排名角标 -->
						<view class="rank">
							<image v-if="index === 0" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (3).png" mode="aspectFill" />
							<image v-if="index === 1" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (4).png" mode="aspectFill" />
							<image v-if="index === 2" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (5).png" mode="aspectFill" />
							<image v-if="index === 3" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (6).png" mode="aspectFill" />
							<image v-if="index === 4" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (7).png" mode="aspectFill" />
							<image v-if="index >= 5 && index <= 7" class="icon" src="/pagesSub/runCoin/assets/Frame@2x (8).png" mode="aspectFill" />
							<view class="txt">{{ index + 1 }}</view>
						</view>
					</view>
				</view>

				<!-- 团队跑量列表 -->
				<view v-if="currentIndex === 1" class="team-list list-transition" :class="listAnimClass">
					<GroupItem v-for="(item, index) in dataList" :key="item.id || item.group_id || index" :item="item"
						variant="detail" :rankIndex="index" />
				</view>
			</mescroll-body>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		watch
	} from "vue";
	import {
		useStore
	} from "vuex";
	import GroupItem from "@/components/GroupItem.vue";
	import request from "@/utils/request.js";
	import {
		useShare
	} from "@/composables/useShare.js";
	import { useTabAnimation } from "@/composables/useTabAnimation.js";
	import { getNavbarHeight } from "@/utils/util.js"

	import {
		onLoad,
		onShow,
		onPageScroll,
		onReachBottom
	} from "@dcloudio/uni-app";
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

	// 使用store
	const store = useStore();

	// 分享配置
	useShare({
		title: '运动排行榜',
		path: '/pagesSub/sport/top'
	});

	// 模板引用
	const mescrollRef = ref(null);

	// Tab 配置
	const tabList = ref([
		{ label: "个人跑量", value: "personal" },
		{ label: "团队跑量", value: "team" },
	]);

	// 使用 Tab 动画 composable
	const {
		currentIndex,
		sliderStyle,
		sliderAnimClass,
		listAnimClass,
		changeTab,
		initTabRects,
		onTouchStart,
		onTouchEnd
	} = useTabAnimation({
		tabCount: tabList.value.length,
		loop: false
	});

	const dataList = ref([]);

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// Tab 切换处理
	const handleTabChange = (index) => {
		if (currentIndex.value === index) return;
		changeTab(index);
	};

	// 监听 tab 切换，重新加载数据
	watch(currentIndex, () => {
		dataList.value = [];
		setTimeout(() => {
			refreshList();
		}, 300);
	});

	// 手势切换处理
	const handleTouchEnd = (e) => {
		onTouchEnd(e, tabList.value);
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
		const data = {
			page: mescroll.num,
			page_size: 10,
		};

		// 根据当前tab选择不同的API
		const apiUrl =
			currentIndex.value === 0 ?
			`/sport-api/api/manual/user-ranking` // 个人跑量排行榜API
			:
			`/sport-api/api/manual/group-ranking`; // 团队跑量排行榜API

		request.get(apiUrl, data).then((res) => {
				// 第一页清空列表
				if (mescroll.num == 1) {
					dataList.value = [];
				}

				const list = res.list || [];
				dataList.value = dataList.value.concat(list); // 追加新数据

				mescroll.endSuccess(list.length);
			})
			.catch((error) => {
				mescroll.endErr();
				console.error("获取排行榜数据失败:", error);
			});
	};

	onLoad(() => {
		initTabRects();
	});

	onShow(() => {
		initTabRects();
	});
</script>

<style lang="scss" scoped>
	@import '@/styles/tab-animation.scss';

	.tab-container {
		position: fixed;
		width: 100%;
		z-index: 10;
		background: #fafafa;
		padding: 16rpx 24rpx;
		display: flex;
		justify-content: center;
	}

	.category-tags {
		.tags-inner {
			display: inline-flex;
			position: relative;
			gap: 12rpx;
			padding: 6rpx;
			background: #fff;
			border-radius: 999rpx;
		}

		.tag-slider {
			position: absolute;
			top: 6rpx;
			left: 6rpx;
			height: calc(100% - 12rpx);
			background: #FF8C00;
			border-radius: 999rpx;
			transition: transform 0.3s ease-out, width 0.3s ease-out;
			z-index: 0;

			&.no-transition {
				transition: none !important;
			}

			&.slider-hidden {
				opacity: 0;
			}
		}

		.tag-item {
			position: relative;
			z-index: 1;
			padding: 12rpx 40rpx;
			font-size: 28rpx;
			color: #666;
			line-height: 40rpx;
			white-space: nowrap;
			transition: color 0.3s ease;

			&.active {
				color: #fff;
				font-weight: bold;
			}
		}
	}

	.content-wrapper {
		padding-top: 100rpx;
	}

	// 个人跑量列表样式
	.ranking-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 34rpx;

		.card-item {
			position: relative;
			display: flex;
			align-items: flex-start;
			background: #ffffff;
			border-radius: 16rpx;
			padding: 28rpx 24rpx;
			margin-bottom: 30rpx;
			min-height: 180rpx;

			.avatar {
				width: 140rpx;
				height: 140rpx;
				flex-shrink: 0;
			}

			.card-content {
				flex: 1;
				margin-left: 24rpx;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				justify-content: flex-start;

				.title-row {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;

					.name {
						font-weight: bold;
						font-size: 30rpx;
						color: #000;
						line-height: 42rpx;
						max-width: 280rpx;
						margin-right: 16rpx;
					}

					.distance-tag {
						display: flex;
						align-items: center;

						.distance-value {
							font-size: 22rpx;
							color: #FF8C00;
						}

						.distance-unit {
							font-size: 22rpx;
							color: #FF8C00;
						}
					}
				}

				.group-name {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					min-width: 164rpx;
					height: 40rpx;
					padding: 0 16rpx;
					color: #D3B4A8;
					background: #F9F1F0;
					font-size: 24rpx;
					border-radius: 8rpx;
				}
			}

			.rank {
				position: absolute;
				top: 0;
				right: 22rpx;

				.icon {
					width: 56rpx;
					height: 56rpx;
				}

				.txt {
					position: absolute;
					top: 20rpx;
					right: 22rpx;
					color: #fff;
					width: 16rpx;
					height: 34rpx;
					font-size: 24rpx;
					font-weight: 800;
					display: flex;
					align-items: center;
					justify-content: center;
				}
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