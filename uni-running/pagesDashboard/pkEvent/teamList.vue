<template>
	<view class="page">
		<section class="section-header flex-col-center ">
			<view class="section-search u-mb-30" style="width:686rpx;">
				<u-search v-model="searchTxt" @search="refreshList" placeholder="输入战队名称" shape="round" bgColor="#f5f5f5"
					borderColor="#f5f5f5" :showAction="false"></u-search>
			</view>
			<!-- 分类标签 -->
			<view class="tab-container">
				<view class="category-tags">
					<view class="tags-inner">
						<view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
						<view
							v-for="(item, index) in tabList"
							:key="item.value"
							:id="'tab-' + index"
							class="tag-item"
							:class="{ active: currentIndex === index }"
							@click="handleTabChange(item, index)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>
		</section>

		<!-- 内容区域 -->
		<view class="content-wrapper"
			@touchstart="onTouchStart"
			@touchend="handleTouchEnd">
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" :top="100">
				<view class="order-list" :class="['list-transition', listAnimClass]">
					<view class="team-card" v-for="(item, index) in dataList" :key="index" @click="$u.route('pagesDashboard/pkEvent/teamDetail?id=' + item.id)">
						<image :src="item.event_info && item.event_info.background_image_url" class="avatar" />
				
						<view class="content">
							<view class="title">跑者无界战队</view>
							<view class="subtitle">3.14KM | 200人</view>
							<view class="leader">队长：王东</view>
						</view>
				
						<view class="join-btn flex-center">加入战队</view>
					</view>
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
	onLoad,
	onShow,
	onPageScroll,
	onReachBottom
} from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import { useTabAnimation } from "@/composables/useTabAnimation.js";
import request from "@/utils/request.js";

const {
	mescrollInit,
	downCallback,
	getMescroll
} = useMescroll(onPageScroll, onReachBottom);

// Tab 配置
const tabList = ref([
	{ label: "3.14KM", value: "" },
	{ label: "5.20KM", value: "SUCC" },
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
	loop: true
});

// 当前选中的 tab
const curTab = computed(() => tabList.value[currentIndex.value]);


// Tab 切换处理
const handleTabChange = (item, index) => {
	if (currentIndex.value === index) return;
	changeTab(index);
};

// 数据
const dataList = ref([]);

// 监听 tab 切换，重新加载数据
watch(currentIndex, () => {
	// 立即清空旧数据，避免切换时显示旧 tab 的数据
	dataList.value = [];
	setTimeout(() => {
		refreshList();
	}, 300);
});

// 手势切换处理
const handleTouchEnd = (e) => {
	onTouchEnd(e, tabList.value);
};

const viewDetail = (item) => {
	uni.$u.route(`pagesSub/orderSuccess?order_no=${item.order_no}`);
};

const refreshList = () => {
	getMescroll().resetUpScroll();
	getMescroll().scrollTo(0, 0);
};

const getList = (mescroll) => {
	uni.showLoading({ mask: true });

	const data = {
		pageIndex: mescroll.num - 1,
		pageSize: 10,
	};

	// 如果选中了具体状态，传给后端过滤
	const status = curTab.value.value;
	if (status) {
		data.orderStatus = status;
	}

	request.post(`/pay/order/list`, data).then((res) => {
		res = res.orders.map(item => {
			const sign_info_list = item.sign_info_list
			return {
				...item,
				...(getRefundInfo(item.created_at, item.refund_valid_hour || 24)),
				sign_list: sign_info_list?.map(i => i.full_name).join(',') || ''
			}
		})

		mescroll.endSuccess(res.length);

		if (mescroll.num == 1) {
			dataList.value = [];
		}

		dataList.value = dataList.value.concat(res);
	})
	.catch((error) => {
		uni.hideLoading();
		mescroll.endErr();
	});
};

function getRefundInfo(orderTime, endHour) {
	const orderDate = new Date(orderTime.replace(/-/g, '/'));
	const now = new Date();
	const refundDeadline = new Date(orderDate.getTime() + endHour * 60 * 60 * 1000);
	const canRefund = now < refundDeadline;

	let remainingTimeStr = '';

	if (canRefund) {
		const diffMs = refundDeadline - now;
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		remainingTimeStr = `还剩 ${hours} 小时 ${minutes} 分钟可申请退款`;
	} else {
		remainingTimeStr = `已超过 ${endHour} 小时，无法退款`;
	}

	return {
		canRefund,
		refundDeadline,
		remainingTimeStr
	};
}

onLoad(() => {
	initTabRects();
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
@import '@/styles/tab-animation.scss';

.page {
	min-height: 100vh;
}
.section-header{
	position: fixed;
	width: 100%;
	z-index: 10;
	top: 0;
	padding: 16rpx 24rpx;
}
.tab-container {
	
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
		background: #F3F4F6;
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
		padding: 12rpx 24rpx;
		font-size: 28rpx;
		color: #E11D48;
		line-height: 40rpx;
		width: 336rpx;
		white-space: nowrap;
		transition: color 0.3s ease;
		font-weight: bold;
		text-align: center;
		&.active {
			color: #E11D48;
		}
	}
}

.content-wrapper {
	padding-top: 100rpx;
}

.order-list {
	padding: 16rpx 0;
}

.order-no {
	font-size: 26rpx;

	.txt {
		background: #1989fa;
		border-radius: 99rpx;
		color: #fff;
		padding: 5rpx 10rpx;
		font-size: 20rpx;
	}

	.copy {
		width: 28rpx;
		height: 28rpx;
		margin-left: 5rpx;
		margin-top: -3rpx;
	}
}

.team-card {
  display: flex;
  align-items: center;
	width: 686rpx;
	background: #FFFFFF;
	margin: 20rpx auto;
	padding: 20rpx 24rpx;
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0,0,0,0.01);
	border-radius: 32rpx 32rpx 32rpx 32rpx;
	.avatar {
		width: 110rpx;
		height: 110rpx;
		border-radius: 14rpx 14rpx 14rpx 14rpx;
	  margin-right: 26rpx;
	}
	
	.content {
	  flex: 1;
	}
	
	.title {
	  font-size: 32rpx;
	  color: #1E2939;
	  font-weight: 500;
	  margin-bottom: 8rpx;
	}
	
	.subtitle {
	  font-size: 24rpx;
	  color: #666;
	  margin-bottom: 8rpx;
	}
	
	.leader {
	  font-size: 24rpx;
	  color: #999;
	}
	
	.join-btn {
	  width: 140rpx;
	  height: 50rpx;
		color: #fff;
		font-weight: bold;
		font-size: 20rpx;
		color: #FFFFFF;
	  background: linear-gradient( 226deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%);
	  border-radius: 16rpx 16rpx 16rpx 16rpx;
	}
}


</style>
