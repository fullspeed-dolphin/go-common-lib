<template>
	<view class="u-pb-20">
		<section class="section-card u-flex-y-center">
			<image class="img" :src="
            (detail.avatar_url ||
            'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png')  + '?x-oss-process=image/resize,w_120,h_120,m_fill'
          " mode="aspectFill"></image>
			<view class="">
				<view class="name ellipsis2">{{ detail.name }}</view>
				<view class="b" style="margin-top: 30rpx;">
					<view class="">总举办活动次数：<text style="color:#FF8C00">23次</text></view>
					<view class="" style="margin-top: 30rpx;">跑团活动参与总人数：<text style="color:#FF8C00">2345人</text></view>
				</view>
			</view>
		</section>

		<section class="section-summary panel flex-row">
			<view class="flex-1 flex-col-center">
				<view class="number">
					{{ detail.total_members }}
				</view>
				跑团总跑量
			</view>
			<view class="divider"></view>
			<view class="flex-1 flex-col-center">
				<view class="number">
					{{ detail.total_members }}
				</view>
				今日总跑量
			</view>
			<view class="divider"></view>
			<view class="flex-1 flex-col-center">
				<view class="number">
					{{ detail.total_members }}
				</view>
				上周总跑量
			</view>
			<view class="divider"></view>
			<view class="flex-1 flex-col-center">
				<view class="number">
					{{ detail.total_members }}
				</view>
				上月总跑量
			</view>
		</section>

		<view class="u-pl-34 u-pt-30">
			<view class="member-item u-flex-row" v-for="(item, index) in memberList" :key="index">
				<view class="img" style="width:120rpx;height:120rpx;margin-right:30rpx;">
					<up-lazy-load height="70" borderRadius="100" :image="
							(item.avatar_url ||
							'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png')  + '?x-oss-process=image/resize,w_150,h_150,m_fill'
						" mode="aspectFill" />
				</view>
				<view class="">
					<view class="ellipsis name">{{item.nickname}}</view>
					<view class="score">今日跑量 <text style="color:#FF8C00;">100km</text> </view>
					<view class="score">上周跑量 <text style="color:#FF8C00;">100km</text> </view>
					<view class="score">上月跑量 <text style="color:#FF8C00;">100km</text> </view>
					<view class="score">年度跑量 <text style="color:#FF8C00;">100km</text> </view>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		nextTick
	} from "vue";
	import {
		onLoad,
		onUnload,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from "@dcloudio/uni-app";

	import {
		useStore
	} from "vuex";
	import EventItem from "@/components/EventItem.vue";
	import request from "@/utils/request.js"

	// 使用store
	const store = useStore();

	// 模板引用
	const refUserLogin = ref(null);

	// 响应式数据
	const isEmpty = ref(false);
	const detail = ref({});
	const routeParams = ref({});
	const eventList = ref([]);
	const memberList = ref([]);
	const memberLeader = ref({});

	const userInfo = computed(() => store.state.userInfo);

	onLoad((options) => {
		console.log("option", options);
		routeParams.value = options;

		getDetail();
	});

	const getEvents = () => {
		request.get(`/event-api/getOfflineEventSwiper`).then(res => {
			eventList.value = res;
		});
	};

	// 页面卸载
	onUnload(() => {
		uni.removeStorageSync("groupDetail");
	});

	// 页面显示
	onShow(() => {
		// 移除全局自定义事件监听器
		uni.$off("updateList");

		// 监听全局的自定义事件
		uni.$once("updateList", (data) => {
			// 判断从我的跑团创建，返回没有跑团 ID，页面空白的问题
			if (data.from === "mine" && data.group_id) {
				routeParams.value.group_id = data.group_id;
				getDetail();
			}
		});
	});


	const getDetail = (page) => {
		const groupDetail = uni.getStorageSync("groupDetail");
		if (groupDetail) {
			detail.value = groupDetail;
		}

		uni.showLoading({
			mask: true
		});

		request.get(
				`/running-group/api/v1/groups/info?group_id=${routeParams.value.group_id}`
			)
			.then((res) => {
				res.establish_time = res.establish_time.slice(0, 10);
				detail.value = res;

				isEmpty.value = false;

				getMemberList();
			});
	};

	const getMemberList = () => {
		const data = {
			pageIndex: 0,
			pageSize: 9,
			groupId: Number(detail.value.group_id),
		};
		request.post(`/running-group/api/v1/groups/members`, data)
			.then((res) => {
				memberLeader.value =
					(res.memberships || []).find((i) => i.role === "creator") || {};
				memberList.value = (res.memberships || []).filter(
					(i) => i.role !== "creator"
				);
			});
	};
</script>

<style lang="less" scoped>
	.panel {
		box-shadow: 10rpx 10rpx 10rpx 2rpx rgba(255, 140, 0, 0.3);
		border-radius: 32rpx 32rpx 32rpx 32rpx;
		border: 0;
		background: #fff;
		padding: 30rpx 20rpx;
	}
	
	.member-item{
		
	}

	.section-card {
		padding: 48rpx 0 30rpx 80rpx;

		.img {
			width: 168rpx;
			height: 168rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			margin-right: 42rpx;
		}

		.name {
			font-weight: 800;
			font-size: 42rpx;
		}
	}

	.section-summary {
		height: 126rpx;
		font-weight: bold;
		font-size: 20rpx;

		.number {
			font-size: 28rpx;
			color: #FF8C00;
			line-height: 50rpx;
			margin-bottom: 10rpx;
		}

		.divider {
			width: 1rpx;
			height: 58rpx;
			background-color: #f3f3f3;
			align-self: center;
		}
	}

	.member-item {
		background: #FFFFFF;
		box-shadow: 10rpx 10rpx 10rpx 2rpx rgba(255,140,0,0.3);
		border-radius: 32rpx 32rpx 32rpx 32rpx;
		padding: 32rpx 20rpx;
		color: #000;
		font-size: 32rpx;
		margin: 0 36rpx 16rpx 0;
		font-size: 24rpx;
		color: #707070;
		.number {
			font-weight: bold;
			font-size: 30rpx;
			color: #12012070;
			margin-right: 20rpx;
		}
		.name{
			color: #000;
			font-size: 32rpx;
			line-height: 1.2;
			margin-bottom: 10rpx;
		}
		.score {
			font-size: 24rpx;
			line-height: 34rpx;
		}

		.img {
			border-radius: 999px;
			display: block;
			width: 120rpx;
			height: 120rpx;
			background: #f5f5f5;
		}
	}
</style>