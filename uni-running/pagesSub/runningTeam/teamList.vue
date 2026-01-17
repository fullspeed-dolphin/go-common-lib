<template>
	<view class="page">
		<u-navbar title="全速俱乐部" placeholder></u-navbar>
		<section class="section-filter" :style="{ top: navbarHeight + 'px' }">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="refreshList" placeholder="请输入名称或团号或地址" shape="round" bgColor="#fff"
					borderColor="#FF8C00" :showAction="false"></u-search>
			</view>

			<view class="section-tabs">
				<view class="category-tags">
					<view class="tags-inner">
						<view class="tag-slider" :style="getSliderStyle()"></view>
						<view
							v-for="(item, index) in tabList"
							:key="item.value"
							:id="'tab-' + index"
							class="tag-item"
							:class="{ active: tabActive === index }"
							@click="changeTab(item, index)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>
		</section>
		<view class="mescroll-wrapper">
			<mescroll-uni @init="mescrollInit" @down="downCallback" @up="getList" :top="160" bottom="200"
				:safearea="true" :fixed="false" height="100%">
				<view class="container group-list" :class="['list-transition', listAnimationClass]">
					<GroupItem :item="item" variant="detail" v-for="(item, index) in dataList" :key="index" />
				</view>
			</mescroll-uni>
		</view>

		<section class="section-bottom">
				<u-button type="primary" height="80rpx" shape="circle" customStyle="height: 80rpx" color="#FF8C00"
					@click="openForm()">{{ userInfo.running_group ? "我的俱乐部" : "创建俱乐部" }}
				</u-button>
		</section>

		<UserLogin ref="refUserLogin" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		nextTick,
		onMounted
	} from "vue";
	import {
		onShow
	} from "@dcloudio/uni-app";
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom)

	import request from "@/utils/request.js"
	import {
		useStore
	} from "vuex";

	import GroupItem from "@/components/GroupItem.vue";
	import UserLogin from "@/components/UserLogin.vue";


	// 使用store
	const store = useStore();

	// 模板引用
	const refUserLogin = ref(null);
	const mescrollRef = ref(null);

	// 响应式数据
	const searchTxt = ref("");
	const tabActive = ref(0);
	const tabList = ref([{
			label: "全部",
			value: "all"
		},
		{
			label: "跑步",
			value: "running"
		},
		{
			label: "骑行",
			value: "cycling"
		},
	]);
	const curTab = ref({
		label: "全部",
		value: "all"
	});
	const dataList = ref([]);
	const navbarHeight = ref(0);

	// 列表切换动画状态
	const listAnimationClass = ref('');
	const slideDirection = ref('right');

	// 存储每个 tab 的位置信息
	const tabRects = ref([]);
	const tabContainerLeft = ref(0);

	// 获取滑块样式
	const getSliderStyle = () => {
		if (!tabRects.value.length || tabActive.value >= tabRects.value.length) return {};

		const rect = tabRects.value[tabActive.value];
		const left = rect.left - tabContainerLeft.value;

		return {
			width: rect.width + 'px',
			transform: `translateX(${left}px)`
		};
	};

	// 获取 tab 宽度和位置
	const getTabWidths = () => {
		nextTick(() => {
			// 获取容器基准位置
			const containerQuery = uni.createSelectorQuery();
			containerQuery.select('#tab-0').boundingClientRect();
			containerQuery.exec((res) => {
				if (res[0]) {
					tabContainerLeft.value = res[0].left;
				}
			});

			// 获取所有 tab 位置
			const query = uni.createSelectorQuery();
			query.selectAll('#tab-0, #tab-1, #tab-2').boundingClientRect();
			query.exec((res) => {
				if (res[0]) {
					tabRects.value = res[0].map(item => ({ width: item.width, left: item.left }));
				}
			});
		});
	};
	// section-filter 固定高度 230rpx，转换为 px

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// mescroll相关
	let mescroll = null;

	// 计算 navbar 高度
	const computeNavbarHeight = () => {
		const statusBarHeight = uni.getWindowInfo().statusBarHeight || 0;

		// #ifdef MP-WEIXIN
		const menuBtn = uni.getMenuButtonBoundingClientRect();
		if (menuBtn) {
			// 导航栏高度 = 胶囊底部 + (胶囊顶部 - 状态栏高度)
			const navHeight = menuBtn.bottom + (menuBtn.top - statusBarHeight);
			navbarHeight.value = navHeight;
		} else {
			navbarHeight.value = statusBarHeight + 44;
		}
		// #endif

		// #ifndef MP-WEIXIN
		navbarHeight.value = statusBarHeight + 44;
		// #endif
	};

	// 页面挂载
	onMounted(() => {
		computeNavbarHeight();
		getTabWidths();
	});

	// 页面显示
	onShow(() => {
		// 移除全局自定义事件监听器
		uni.$off("updateList");

		// 监听全局的自定义事件
		uni.$once("updateList", (data) => {
			// 判断二级页面是否修改过数据，如果修改过，需要刷新首页，保持信息一致
			if (data.isChange) {
				refreshList();
			}
		});
	});

	// 方法定义
	const viewDetail = (item) => {
		uni.setStorageSync("orderDetail", item);
		// uni.$u.route(`pagesSub/runningTeam/groupDetail?group_id=${item.group_id}`)
	};

	const openForm = () => {
		if (!store.state.userInfo.id) {
			return refUserLogin.value.open();
		}

		console.log(userInfo);

		if (userInfo.value.running_group) {
			uni.$u.route(
				`pagesSub/runningTeam/groupDetail?group_id=${userInfo.value.running_group}`
			);
			return;
		} else {
			uni.$u.route(`pagesSub/runningTeam/teamForm`);
		}
	};

	const changeTab = (item, index) => {
		if (index === tabActive.value) return;

		// 判断滑动方向
		slideDirection.value = index > tabActive.value ? 'right' : 'left';

		// 立即将滚动位置重置到顶部，避免列表为空时页面跳动
		getMescroll().scrollTo(0, 0);

		// 触发滑出动画
		listAnimationClass.value = slideDirection.value === 'right' ? 'slide-out-left' : 'slide-out-right';

		// 动画结束后切换数据
		setTimeout(() => {
			tabActive.value = index;
			curTab.value = item;
			refreshList();
		}, 250);
	};

	const refreshList = () => {
		nextTick(() => {
			getMescroll().resetUpScroll(); // 重置列表数据为第一页
			getMescroll().scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
		});
	};

	const getList = (mescroll) => {
		uni.showLoading({
			mask: true
		});

		const data = {
			pageIndex: mescroll.num - 1,
			pageSize: 10,
			keyword: searchTxt.value,
		};
		// 如果不是"全部"，则添加 club_type 过滤
		if (curTab.value.value !== 'all') {
			data.club_type = curTab.value.value;
		}
		request.get(`/running-group/api/v1/groups/list`, data)
			.then((res) => {
				uni.hideLoading();

				//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
				mescroll.endSuccess(res.data.length);

				//如果是第一页需手动制空列表
				if (mescroll.num == 1) {
					dataList.value = [];

					// 触发滑入动画（仅第一页，即 tab 切换后）
					if (listAnimationClass.value) {
						listAnimationClass.value = slideDirection.value === 'right' ? 'slide-in-right' : 'slide-in-left';
						setTimeout(() => {
							listAnimationClass.value = '';
						}, 350);
					}
				}

				dataList.value = dataList.value.concat(res.data); //追加新数据
			})
			.catch((error) => {
				uni.hideLoading();
				mescroll.endSuccess(6);
			});
	};
</script>

<style lang="scss" scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.mescroll-wrapper {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.group-item {
		padding: 10rpx 34rpx;

		.poster {
			width: 124rpx;
			height: 124rpx;
			background: #c1c5c6;
			margin-right: 40rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}

		.name {
			line-height: 40rpx;
			margin-bottom: 12rpx;
		}

		.city {
			line-height: 28rpx;
			font-size: 20rpx;
			margin-bottom: 18rpx;
		}

		.desc {
			width: 422rpx;
			line-height: 26rpx;
			font-size: 18rpx;
		}
	}

	.filter-btns {
		margin: 30rpx;
		border-radius: 40px;
		color: $color;

		&:after {
			border-color: $color;
			border-radius: 100px;
		}

		.flex-item {
			height: 80rpx;

			&:last-child {
				color: #fff;
				background: $color;
				overflow: hidden;
				border-radius: 0 40px 40px 0;
			}
		}
	}

	.section-filter {
		position: fixed;
		width: 100%;
		z-index: 10;
		background: #f5f5f5;
	}

	.section-tabs {
		display: flex;
		justify-content: flex-start;
		padding: 16rpx 24rpx;
	}

	.category-tags {
		.tags-inner {
			display: inline-flex;
			position: relative;
			gap: 20rpx;
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
		}

		.tag-item {
			position: relative;
			z-index: 1;
			padding: 12rpx 48rpx;
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

	.section-search {
		padding: 20rpx 24rpx 0;
	}

	.section-bottom {
		position: fixed;
		bottom: 30rpx;
		width: 100%;
		z-index: 10;
		padding: 0 30rpx 0rpx;
	}

	.group-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding-top: 32rpx;
	}

	// 列表切换动画
	.list-transition {
		will-change: transform, opacity;
	}

	.slide-out-left {
		animation: slideOutLeft 0.25s ease-in forwards;
	}

	.slide-out-right {
		animation: slideOutRight 0.25s ease-in forwards;
	}

	.slide-in-left {
		animation: slideInLeft 0.3s ease-out forwards;
	}

	.slide-in-right {
		animation: slideInRight 0.3s ease-out forwards;
	}

	@keyframes slideOutLeft {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(-60rpx);
			opacity: 0;
		}
	}

	@keyframes slideOutRight {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(60rpx);
			opacity: 0;
		}
	}

	@keyframes slideInLeft {
		from {
			transform: translateX(-60rpx);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideInRight {
		from {
			transform: translateX(60rpx);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>