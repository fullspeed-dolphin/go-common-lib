<template>
	<view>
		<u-navbar :title="null" bgColor="transparent"></u-navbar>

		<mescroll-empty v-if="isEmpty" mode="data" :option="{
        btnText: '创建跑团',
      }" @emptyclick="$u.route(`pagesSub/runningTeam/teamForm?from=mine`)" />

		<block v-if="!isEmpty">
			<section class="flex-center" style="height: 432rpx;filter: blur(50px);">
				<image class="img" style="width:750rpx;height:432rpx;" :src="
				    (detail.avatar_url ||
				    'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png')  + '?x-oss-process=image/resize,w_120,h_120,m_fill'
				  " mode="aspectFill"></image>
					
			</section>
			<section class="section-card flex-col-center" style="margin-top: -160rpx;">
				<image class="img" :src="
            (detail.avatar_url ||
            'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png')  + '?x-oss-process=image/resize,w_120,h_120,m_fill'
          " mode="aspectFill"></image>
				<view class="name ellipsis2">{{ detail.name }}</view>
				<view class="flex-between-center c3">
					<view class="cell-item">{{ detail.establish_time }} 成立</view>
					<view class="cell-item">跑团ID {{ detail.group_id }}</view>
				</view>
				<view class="cell-item flex-row c3">
					<u-icon name="map" size="12" color="#333"></u-icon>
					<view class="flex-1">
						{{ detail.establish_location }}
					</view>
				</view>
			</section>

			<section class="section-summary panel flex-row">
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{ detail.total_members }}
					</view>
					成员人数
				</view>
				<view class="divider"></view>
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{ detail.gender_ratio }}
					</view>
					男女比例
				</view>
				<!-- <view class="divider"></view>
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{ detail.total_members }}
					</view>
					上月总跑量
				</view>
				<view class="divider"></view>
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{ detail.total_members }}
					</view>
					周人均跑量
				</view> -->
			</section>

			<section class="panel">
				<view class="h4">跑团宣言</view>
				<view style="line-height: 40rpx; padding-left: 18rpx;">
					{{ detail.introduction }}
				</view>
			</section>

			<section class="panel">
				<view class="h4">团长</view>
				<view class="flex-between-center">
					<view class="leader-item flex-start" @click="openMemberDetail(memberLeader)">
						<view class="img-box">
							<up-lazy-load height="120" borderRadius="200" class="img" 
								error-img="/static/images/user.png"
								:image="memberLeader.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill'" mode="aspectFill" />
						</view>
						<view class="">
							<view class="ellipsis" style="width: 300rpx;line-height: 44rpx;">
								{{memberLeader.nickname || "成员"}}
							</view>
						</view>
					</view>
					<view style="width: 184rpx">
						<u-button type="primary" plain color="#FF8C00" size="small" shape="circle"
							@click="callPhone(memberLeader.user_phone)">
							联系团长
						</u-button>
					</view>
				</view>
			</section>

			<section class="panel" style="padding-right:0;">
				<view class="h4">成员</view>
				<view class="flex-row flex-wrap">
					<view class="member-item flex-col-center" v-for="(item, index) in memberList" @click="openMemberDetail(item)" :key="index">
						<view class="img">
							<up-lazy-load height="120" borderRadius="200" 
							error-img="/static/images/user.png"
							:image="item.avatar_url+ '?x-oss-process=image/resize,w_150,h_150,m_fill'" mode="aspectFill" />
						</view>
						<view class="">
							<view class="u-mb-10 ellipsis tac u-ml-10" style="width: 120rpx;margin-top: 16rpx;line-height: 44rpx;">
								{{ item.nickname}}
							</view>
						</view>
					</view>
				</view>
				<mescroll-empty v-if="!memberList.length" :option="{ tip: '暂无跑团成员~' }" />
				<view class="flex-center u-mt-15">
					<u-button type="text"
						v-if="memberList.length >= 8"
						customStyle="width: 236rpx;height: 84rpx;" shape="circle"
						@click="viewMoreMembers()">
						<text style="color:#409eff;">查看更多</text>
						<u-icon name="arrow-right" color="#409eff" size="14"></u-icon>
					</u-button>
				</view>
			</section>

			<section class="panel" style="box-shadow: none;">
				<view class="h4">跑团活动</view>
				<view v-for="(item, index) in eventList" :key="index">
					<EventItem :item="item" :key="index" height="474rpx" from="team" />
				</view>
				<mescroll-empty v-if="!eventList.length" :option="{ tip: '暂无跑团活动~' }" />
			</section>

			<view class="" style="height: 120rpx"></view>

			<section class="section-bottom flex-center">
				<button v-if="!isEmpty" class="share-btn flex-center" open-type="share">
					分享跑团
				</button>
				<!-- 未加入跑团，才可加入跑团 -->
				<block v-if="!userInfo.running_group && detail.user_role === 'guest'">
					<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;"
						@click="joinGroup()">加入跑团</u-button>
				</block>
				<block v-if="detail.user_role === 'creator'">
					<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;"
						@click="$u.route(`pagesSub/runningTeam/teamSetting?group_id=${detail.group_id}`)">跑团管理工具</u-button>
				</block>
				<block v-if="detail.user_role === 'member'">
					<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;"
						@click="leaveGroup()">退出跑团</u-button>
				</block>
			</section>
		</block>
		
		<MemberDetail ref="refMemberDetail" />

		<UserLogin ref="refUserLogin" @success="getMemberList()"/>
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
		onPageScroll,
		onShareAppMessage,
		onShareTimeline
	} from "@dcloudio/uni-app";

	import {
		useStore
	} from "vuex";
	import UserLogin from "@/components/UserLogin.vue";
	import EventItem from "@/components/EventItem.vue";
	import MemberDetail from "./memberDetail.vue";
	import request from "@/utils/request.js"
			
	// 使用store
	const store = useStore();

	const refUserLogin = ref(null);

	// 响应式数据
	const isEmpty = ref(false);
	const detail = ref({});
	const routeParams = ref({});
	const eventList = ref([]);
	const memberList = ref([]);
	const memberLeader = ref({});

	// 计算属性
	const pageTitle = computed(() => {
		return routeParams.value.from === "mine" ? "我的跑团" : "跑团详情";
	});

	const userInfo = computed(() => store.state.userInfo);
	
	const refMemberDetail = ref(null);
	function openMemberDetail(item) {
		refMemberDetail.value.open(item)
	}

	// 页面加载
	onLoad((options) => {
		console.log("option", options);
		routeParams.value = options;

		if (!options.group_id || options.group_id === "null") {
			isEmpty.value = true;
			return;
		}

		getDetail();
		
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline'] // 开启分享给朋友和分享到朋友圈
		});
		// #endif
		
		// nextTick(() => {
		// 	if (!store.state.userInfo.id) {
		// 		return refUserLogin.value.open();
		// 	}
		// })
	});
	
	const getEvents = () => {
		// /event-api/fsc_swipers?fsc_id=1004 
		request.get(`/event-api/fsc_swipers?fsc_id=${routeParams.value.group_id}`).then(res => {
			eventList.value = res.map(item => {
				return {
					...item,
					event_time: isNaN(item.event_time) ? item.event_time :  Number(item.event_time),
				}
			});
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

		getEvents();
	});

	// 方法定义
	const viewMoreMembers = () => {
		uni.$u.route(
			`pagesSub/runningTeam/teamMemberList?group_id=${routeParams.value.group_id}`
		);
	};

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
				res = res.memberships || []
				memberLeader.value = res.find((i) => i.role === "creator") || {};
				memberList.value = res.filter((i) => i.role !== "creator");
			});
	};

	const joinGroup = () => {
		if (!store.state.userInfo.id) {
			return refUserLogin.value.open();
		}
		uni.showModal({
			title: "提示",
			content: "是否确认加入该跑团？",
			success: (res) => {
				if (res.confirm) {
					const data = {
						running_group: Number(detail.value.group_id),
					};

					uni.showLoading({
						mask: true
					});
					request.post(`/user-api/user/joinRunningGroup`, data)
						.then((res) => {
							uni.hideLoading();
							getDetail();
							uni.$u.toast("加入成功！");
						});
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	const leaveGroup = () => {
		uni.showModal({
			title: "提示",
			content: "是否确认退出该跑团？",
			success: (res) => {
				if (res.confirm) {
					uni.showLoading({
						mask: true
					});
					request.post(`/user-api/user/quitRunningGroup`).then((res) => {
						uni.$u.toast("操作成功！");

						// 调用用户数据，检查参加或创建跑团标记
						store.dispatch("getUserInfo");

						getDetail();
					});
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	const callPhone = (phoneNumber) => {
		uni.makePhoneCall({
			phoneNumber,
		});
	};

	// #ifdef MP-WEIXIN
	// 分享给朋友
	onShareAppMessage(() => {
		return {
			title: '跑了没 - ' + (detail.value.name || ''),
			imageUrl: detail.value.avatar_url, // 可以设置自定义分享图片，留空则使用当前页面截图
		};
	});
	// 分享到朋友圈
	onShareTimeline(() => {
		return {
			title: '跑了没 - ' + (detail.value.name || ''),
			query: '', // 可以携带参数
			imageUrl: detail.value.avatar_url, // 可以设置自定义分享图片
		};
	});
	// #endif
	
	const navBarBg = ref('transparent');
	onPageScroll((e) => {
		const scrollTop = e.scrollTop || 0;
		if (scrollTop >= 5) {
		  navBarBg.value = "#ffffff";
		} else {
		  navBarBg.value = 'transparent';
		}
	})
</script>

<style lang="less" scoped>
	.panel {
		border:0;
		background: #fff;
		padding: 30rpx 20rpx;
	}
	
	::v-deep{
		.event-item{
			box-shadow: 0rpx 6rpx 12rpx 2rpx rgba(255,140,0,0.16);
			margin-bottom: 30rpx;
		}
	}

	.share-btn {
		margin: 0;
		height: 80rpx;
		width: 312rpx;
		border-radius: 200rpx;
		color: #fff;
		border: 1px solid #07C160;
		background-color: #07C160 !important;
		padding: 0 20rpx;
		font-size: 28rpx;
		font-weight: bold;

		&:after {
			display: none;
		}
	}

	.section-summary {
		height: 126rpx;
		color: #999999;

		.number {
			font-weight: bold;
			font-size: 30rpx;
			color: #000;
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

	.bar {
		height: 48rpx;
		padding: 0 14rpx;
		background: #f3f3f3;
		font-size: 28rpx;
		color: #000;
		font-weight: bold;
		border-radius: 8rpx 8rpx 8rpx 8rpx;
	}

	.h4 {
		display: flex;
		align-items: center;
		gap: 20rpx;
		position: relative;
		font-weight: 800;
		font-size: 36rpx;
		color: #000000;
		line-height: 50rpx;
		padding-left: 18rpx;
		margin-bottom: 22rpx;

		&:before {
			position: absolute;
			content: "";
			width: 8rpx;
			left: 0;
			height: 32rpx;
			background: #ff8c00;
			border-radius: 4rpx 4rpx 4rpx 4rpx;
		}
	}

	.cell-item {
		min-width: 120rpx;
		padding: 6rpx 10rpx 10rpx 0;
		font-size: 24rpx;
	}

	.leader-item {
		font-size: 32rpx;

		.img-box {
			border-radius: 999px;
			background: #ffffff;
			margin-right: 30rpx;
			overflow: hidden;
		}

		.img {
			display: block;
			width: 120rpx;
			height: 120rpx;
			background: #f5f5f5;
		}
	}

	.member-item {
		// font-size: 32rpx;
		margin: 0 36rpx 16rpx 0;
		&:nth-child(4n){
			margin-right: 0;
		}
		.number {
			font-weight: bold;
			font-size: 30rpx;
			color: #12012070;
			margin-right: 20rpx;
		}

		.name {
			text-align: left;
			margin-left: 30rpx;
		}

		.score {
			font-weight: bold;
			font-size: 24rpx;
			color: #000000;
		}

		.img {
			border-radius: 999px;
			display: block;
			width: 120rpx;
			height: 120rpx;
			background: #f5f5f5;
		}
	}

	.section-card {
		position: relative;
		z-index: 1;
		padding: 34rpx 34rpx 0;
		.img {
			display: block;
			width: 200rpx;
			height: 200rpx;
			background: #f5f5f5;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}

		.name {
			font-weight: 800;
			font-size: 36rpx;
			color: #000000;
			line-height: 50rpx;
			margin-top: 16rpx;
			margin-bottom: 18rpx;
		}

		.text {
			font-weight: 500;
			font-size: 24rpx;
			line-height: 32rpx;
		}
	}

	.h2 {
		font-size: 32rpx;
		font-weight: 600;
	}

	.cell {
		line-height: 47rpx;

		.label {
			width: 174rpx;
			color: #66768a;
		}

		.value {
			color: #212121;
			line-height: 36rpx;
			width: 450rpx;
		}
	}

	.section-bottom {
		position: fixed;
		bottom: 30rpx;
		width: 100%;
		z-index: 10;
		padding: 0 30rpx 20rpx;
		gap: 25px;

		::v-deep {
			.u-button {
				margin: 0;
			}
		}
	}

	.u-border-left {
		border-color: #f3f3f3;
	}
</style>