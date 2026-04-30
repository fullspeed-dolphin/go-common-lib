<template>
	<u-navbar :title="detail.name || '活动详情'" bgColor="#fff" placeholder></u-navbar>
	<view class="u-pb-30" style="background: #f5f5f5" :class="{
      isLoadedPage: isLoadedPage,
    }">
		<view class="event-status flex-center" v-if="detail.status === 'ACT'" :style="themeColor !== '#43A047' ? { background: themeColor } : {}">
			活动进行中
		</view>

		<section style="padding: 0; overflow: hidden; height: 750rpx">
			<image class="img" :src="detail.background_image_url + '?x-oss-process=image/resize,w_700,h_700,m_fill'"
				mode="aspectFill" style="width: 100%; display: block; height: 100%"></image>
		</section>

		<view class="container">
			<section class="section-event panel bgf" style="position: relative; z-index: 10;">
				<view class="h2" :style="themeColor !== '#43A047' ? { color: themeColor } : {}">
					<view class="ellipsis2">
						{{ detail.name }}
					</view>
				</view>

				<view class="panel-item" :style="themePanelItemStyle">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-time@2x.png'" mode="aspectFill"></image>
						<text>报名时间：</text>
					</view>
					<view class="value">{{ detail.registration_time }}</view>
				</view>

				<view class="panel-item" :style="themePanelItemStyle">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-date@2x.png'" mode="aspectFill"></image>
						<text>{{ isCourseEvent ? '课程开始时间：' : '活动开始时间：' }}</text>
					</view>
					<view class="value">{{
            dayjs(detail.event_time).format("YYYY-MM-DD HH:mm")
          }}</view>
				</view>
				<view class="panel-item" :style="themePanelItemStyle">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-location@2x.png'" mode="aspectFill"></image>
						<text>活动地点：</text>
					</view>
					<view class="value" @click="copyText(detail.event_location)">{{
            detail.event_location
          }}</view>
				</view>

				<view class="panel-item" :style="themePanelItemStyle">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-item@2x.png'" mode="aspectFill"></image>
						<text>活动项目：</text>
					</view>
					<view class="flex-row flex-wrap">
						<view class="event-item flex-center" v-for="(item, index) in detail.eventItems" :key="index"
							:style="themeGradient ? { background: themeGradient } : {}">
							{{ item }}
						</view>
					</view>
				</view>

				<view class="panel-item" :style="themePanelItemStyle">
					<view class="label">
						<image class="icon" :src="staticBaseUrl + '/images/icon-event-item@2x.png'" mode="aspectFill"></image>
						<text>活动性质：</text>
					</view>
					<view class="flex-row flex-wrap">
						<template v-if="!isFscEvent">
							<view class="event-item flex-center tag-self">自营活动</view>
							<!-- <view class="event-item flex-center" :class="isPaidEvent ? 'tag-paid' : 'tag-free'">
								{{ isPaidEvent ? '付费' : '免费' }}
							</view> -->
						</template>
						<template v-else>
							<view class="event-item flex-center tag-fsc">跑团活动</view>
							<view class="event-item flex-center tag-visibility" v-if="detail.visibility">
								{{ visibilityMap[detail.visibility] || detail.visibility }}
							</view>
							<view class="event-item flex-center" :class="Number(detail.is_free) === 1 ? 'tag-free' : 'tag-paid'">
								{{ Number(detail.is_free) === 1 ? '免费' : '付费' }}
							</view>
						</template>
					</view>
				</view>

				

				<view class="cell flex-start u-pl-20 customer-phone">
					<view class="label">联系电话：</view>
					<view class="value flex-start">
						<view :style="{ color: themeColor, marginRight: '10rpx' }" @click="callPhone(detail.contact)">{{detail.contact}}</view>
					</view>
					<u-button type="primary" :color="themeColor" shape="circle" size="mini" @click="copyText(detail.contact)"
						class="copy-btn"
						customStyle="min-width: 76rpx; width: 76rpx;height: 34rpx; padding: 0; margin-left: 20rpx; font-weight: bold;font-size: 24rpx;color: #FFFFFF;">
						复制
					</u-button>
				</view>
			</section>

			<section class="panel" style="padding: 20rpx 0 0">
				<view class="cell event-description" style="margin-top: 0">
					<view class="label" style="font-size: 28rpx">活动说明：</view>
				</view>
				<rich-text :nodes="detail.text"></rich-text>
			</section>

			<view class="section-bottom1">
				<!-- <view class="txt">
				  {{isSignUp ? '取消' : ''}}报名截止：2025.09.30 9:00
			  </view> -->
				<view class="u-flex-between-center" style="width: 100%;">
					<u-button type="primary" :color="themeBtnColor" shape="circle" customStyle="height: 80rpx;" @click="routeTo()" disabled="isOutDated">
						<block v-if="isOutDated">
							活动已结束
						</block>
						<block v-else>
							<block v-if="Number(detail.is_free) === 1">进入活动</block>
							<block v-else-if="detail.status === 'ACT'">{{
								isSignUp ? "取消报名" : (isCourseEvent ? "立即报班" : "活动报名")
							}}</block>
							<block v-else-if="detail.status === 'PND'">活动暂未开始</block>
							<block v-else-if="detail.status === 'EXP'">{{ isLogin ? '查看报名情况' :'授权登录查看报名情况' }}</block>
						</block>
					</u-button>

					<up-button v-if="detail.status === 'EXP'" @click="routeTo()" type="primary" color="#07c160" shape="circle" customStyle="height: 80rpx;margin-left: 20rpx;" disabled="!isLogin">
						{{ isLogin ? '查看报名情况' :'授权登录查看报名情况' }}
					</up-button>
				</view>
			</view>
		</view>

		<button class="share-btn flex-center" :class="{ active: isScroll }" :style="themeGradient ? { background: themeGradient, borderColor: 'transparent' } : {}" open-type="share">
			<u-icon name="share" color="#fff" size="18"></u-icon>
		</button>

		<UserLogin ref="refUserLogin" @success="onLoginSuccess" />
	</view>
</template>
<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		staticBaseUrl
	} from "@/utils/config.js";
	import {
		onLoad,
		onUnload,
		onPageScroll,
		onShareAppMessage, onShareTimeline
	} from "@dcloudio/uni-app";
	import {
		useStore
	} from "vuex";
	import UserLogin from "@/components/UserLogin.vue";
	import dayjs from "dayjs";
	import request from "@/utils/request.js"
	import { useShare, buildPath } from "@/composables/useShare.js";

	const store = useStore();

	// 模板引用
	const refUserLogin = ref(null);

	// 待执行的操作（登录成功后继续执行）
	const pendingAction = ref(null);

	// 登录成功回调
	const onLoginSuccess = () => {
		if (pendingAction.value) {
			pendingAction.value();
			pendingAction.value = null;
		}
	};

	// 响应式数据
	const isScroll = ref(false);
	const isSignUp = ref(false);
	const detail = ref({});
	const isLoadedPage = ref(false);
	const routerParams = ref({});
	// const isPaidEvent = ref(false); // 普通活动是否为付费活动

	// 动态主题色（基于 color_config）
	const themeColor = computed(() => detail.value?.color_config?.solid || '#43A047');
	const themeGradient = computed(() => {
		const g = detail.value?.color_config?.gradient;
		if (g?.length === 2) return `linear-gradient(90deg, ${g[0]}, ${g[1]})`;
		return null;
	});
	const themeBtnColor = computed(() => {
		const g = detail.value?.color_config?.gradient;
		if(isOutDated) {
			return '#999';
		} else {
			return g?.length === 2 ? g[0] : '#FF8C00';
		}
	});
	// 信息卡片浅色背景（主题色 10% 透明度）
	const themePanelItemStyle = computed(() => {
		if (!detail.value?.color_config?.solid) return {};
		const c = detail.value.color_config.solid;
		// hex to rgba with 0.08 opacity
		const r = parseInt(c.slice(1, 3), 16);
		const g = parseInt(c.slice(3, 5), 16);
		const b = parseInt(c.slice(5, 7), 16);
		return { background: `rgba(${r}, ${g}, ${b}, 0.08)` };
	});

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// 特定活动ID硬编码：课程类活动
	const COURSE_EVENT_ID = '01KFDCDMWB682FDW00A2W7C0AK';
	const isCourseEvent = computed(() => routerParams.value.id === COURSE_EVENT_ID);

	// 判断是否为跑团活动（fsc_event）
	const isFscEvent = computed(() => !!routerParams.value.fsc_id);

	// visibility 映射
	const visibilityMap = {
		private: '全速俱乐部',
		rg_member_only: '跑团内部可见',
		public: '全平台可见'
	};

	// 定时器
	let timer = null;
	// 轮询活动状态（30秒间隔）
	let statusTimer = null;
	const pollStatus = () => {
		const id = routerParams.value.id;
		if (!id) return;
		const url = routerParams.value.fsc_id
			? `/event-api/fsc_events/${id}/status`
			: `/event-api/api/v1/events/${id}/status`;
		request.get(url).then((res) => {
			if (res?.status && res.status !== detail.value.status) {
				detail.value.status = res.status;
			}
		}).catch(() => {});
	};
	const isOutDated = computed(() => {
		const t = dayjs(detail.value.event_time);
		return t.isBefore(dayjs());
	});
	const isLogin = computed(() => !!userInfo.value.id);
	const startStatusPolling = () => {
		stopStatusPolling();
		statusTimer = setInterval(pollStatus, 30000);
	};
	const stopStatusPolling = () => {
		if (statusTimer) {
			clearInterval(statusTimer);
			statusTimer = null;
		}
	};

	// 分享配置
	useShare(() => ({
		title: detail.value.name || '活动详情',
		path: buildPath('/pagesSub/eventDetail', {
			id: routerParams.value.id,
			fsc_id: routerParams.value.fsc_id
		}),
		imageUrl: detail.value.background_image_url || ''
	}));

	// 页面加载
	onLoad((options) => {
		routerParams.value = options;
		getDetail();
		startStatusPolling();
	});

	// 页面卸载
	onUnload(() => {
		stopStatusPolling();
		isLoadedPage.value = false;
		uni.removeStorageSync("eventDetail");
	});
	
	onPageScroll((e) => {
		isScroll.value = true;

		clearTimeout(timer);
		timer = setTimeout(() => {
			isScroll.value = false;
		}, 100);
	});

	// 方法定义
	const getDetail = () => {
		const eventDetail = uni.getStorageSync("eventDetail");
		if (eventDetail) {
			detail.value = eventDetail;
		}

		uni.showLoading({
			mask: true,
		});
		let url = routerParams.value.fsc_id ? '/event-api/fsc_events/' : '/event-api/api/v1/events/';
		request.get(`${url}${routerParams.value.id}`)
			.then((res) => {
				res.text = `<img src="${res.long_image_url}?x-oss-process=image/resize,w_500" style="max-width:100%;" />`;
				res.eventItems = res.event_projects.split("、");

				try {
					const list = JSON.parse(res.registration_time)
					res.registration_time = `${dayjs(list[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(list[1]).format('YYYY-MM-DD HH:mm').slice(5)}`
				} catch (e) {
					console.error(e)
				}
				// test
				// res.status = "ACT";
				console.log("res", res);

				detail.value = res;

				isLoadedPage.value = true;

				// 普通活动：通过 /user/price 接口判断是否付费
				// if (!routerParams.value.fsc_id) {
				// 	checkEventPrice();
				// }
			})
			.catch((err) => {
				// 未登录时弹出登录框，登录成功后重新获取数据
				if (err?.code === 401) {
					pendingAction.value = () => getDetail();
					refUserLogin.value.open();
				}
			});
	};

	// 检查普通活动是否付费：遍历 tickets，任一 price != 0 即为付费
	// const checkEventPrice = () => {
	// 	request.post('/booking-api/user/price', {
	// 		event_id: routerParams.value.id
	// 	})
	// 		.then((res) => {
	// 			const tickets = res?.tickets;
	// 			if (!tickets) {
	// 				isPaidEvent.value = false;
	// 				return;
	// 			}
	// 			isPaidEvent.value = tickets.some(ticket =>
	// 				Object.values(ticket?.price || {}).some(pkg => {
	// 					const p = typeof pkg === 'object' ? pkg.price : pkg;
	// 					return p != 0;
	// 				})
	// 			);
	// 		})
	// 		.catch(() => {
	// 			isPaidEvent.value = false;
	// 		});
	// };

	const routeTo = () => {
		if (!userInfo.value.id) {
			pendingAction.value = () => routeTo();
			return refUserLogin.value.open();
		}

		// 免费活动跳转到活动详情页（带 token）
		if (Number(detail.value.is_free) === 1) {
			if (detail.value.event_detail_url) {
				const token = uni.getStorageSync("token");
				const separator = detail.value.event_detail_url.includes('?') ? '&' : '?';
				const url = `${detail.value.event_detail_url}${separator}token=${token}`;
				uni.$u.route(
					`pagesSub/settings/webView?link=${encodeURIComponent(url)}`
				);
			} else {
				uni.$u.toast("活动详情链接不存在");
			}
			return;
		}

		if (detail.value.status === "EXP" && !!detail.value.event_detail_url) {
			uni.$u.route(
				`pagesSub/settings/webView?link=${detail.value.event_detail_url}`
			);
			return;
		}

		if (detail.value.status === "PND") {
			return uni.$u.toast("报名时间未到\n感谢你的关注");
		}

		if (detail.value.status !== "ACT") {
			return uni.$u.toast("活动无效");
		}

		if (isSignUp.value) {
			cancelSignUp();
			return false;
		}
		uni.$u.route("pagesSub/orderIn?event_id=" + routerParams.value.id);
	};

	const cancelSignUp = () => {
		uni.showModal({
			title: "提示",
			content: "确定取消报名吗？",
			success: (res) => {
				if (res.confirm) {
					
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	const copyText = (txt) => {
		uni.setClipboardData({
			data: String(txt),
		});
	};

	const callPhone = (phoneNumber) => {
		uni.makePhoneCall({
			phoneNumber,
		});
	};
</script>

<style lang="scss" scoped>
	.share-btn {
		position: fixed;
		right: 20rpx;
		bottom: 200rpx;
		width: 90rpx;
		height: 90rpx;
		border-radius: 200rpx;
		color: #fff;
		z-index: 20;
		border: 1px solid #18b566;
		background-color: #18b566 !important;
		margin-bottom: 20rpx !important;
		flex-direction: column;
		font-size: 20rpx;
		box-shadow: 0px 0px 6rpx rgba(0, 0, 0, 0.4);
		transition: transform 0.3s;

		&:after {
			display: none;
		}

		&.active {
			transform: translate(100rpx);
		}
	}

	.event-item {
		color: #fff;
		background: #FF8C00;
		padding: 18rpx 26rpx;
		margin: 20rpx 20rpx 0rpx 0;
		border-radius: 16rpx;
		font-size: 32rpx;

		// 活动性质 tag 颜色
		&.tag-self {
			background: #3b82f6; // 自营活动 - 蓝色
		}

		&.tag-fsc {
			background: #22c55e; // 跑团活动 - 绿色
		}

		&.tag-visibility {
			background: #f59e0b; // visibility - 橙色
		}

		&.tag-free {
			background: #10b981; // 免费 - 翠绿色
		}

		&.tag-paid {
			background: #ef4444; // 付费 - 红色
		}
	}

	.panel-item {
		padding: 18rpx 14rpx;
		margin-top: 20rpx;
		background: #f6fafb;
		border-radius: 16rpx;

		.label {
			margin-bottom: 10rpx;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
			display: flex;
			align-items: center;

			.icon {
				width: 44rpx;
				height: 44rpx;
				margin-right: 10rpx;
			}
		}

		.value {
			font-weight: bold;
			font-size: 28rpx;
			color: #000000;
			line-height: 40rpx;
		}
	}

	.offlineEvents {
		padding: 34rpx;
	}

	.panel {
		margin: 30rpx auto;
		padding: 20rpx;
		border-radius: 26rpx;
		box-shadow: unset;
		background: #fff;
	}

	.h2 {
		font-weight: 600;
		font-size: 34rpx;
		text-align: center;
		line-height: 1.4;
	}

	.cell {
		margin-top: 20rpx;
		font-size: 24rpx;
		line-height: 34rpx;

		.label {
			min-width: 120rpx;
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
			line-height: 40rpx;

			.icon {
				width: 44rpx;
				height: 44rpx;
				margin-right: 10rpx;
			}
		}
	}

	.customer-phone {
		display: flex;
		align-items: center;

		.label {
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 28rpx;
			color: #707070;
		}
	}

	.event-description {
		.label {
			padding: 16rpx 20rpx 14rpx 20rpx;
		}
	}

	.section-bottom1 {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		z-index: 10;
		padding: 48rpx 54rpx;
		transform: translateY(100%);

		.txt {
			font-size: 24rpx;
			line-height: 34rpx;
			margin-bottom: 22rpx;
		}
	}

	.section-event {
		transform: translateY(0%);
		// margin-top: -110rpx;
	}

	.isLoadedPage {
		.section-bottom1 {
			// transition: transform 0.5s;
			// transform: translateY(0%);
			animation: slideIn 0.5s 0.5s forwards;
		}

		.section-event {
			transition: margin 0.5s;
			// transform: translateY(-100rpx);
			margin-top: -100rpx;
		}
	}

	::v-deep {
		.isSignUp {
			.u-button {
				color: #ff8c00;
				background: #f2f2f2;
				border-color: #f2f2f2;
			}
		}
	}

	.event-status {
		position: absolute;
		top: 200rpx;
		right: 0rpx;
		z-index: 2;
		background: rgba(25, 190, 107, .8);
		color: #fff;
		border-radius: 99rpx 0 0 99rpx;
		padding: 20rpx 30rpx;
	}

	@keyframes slideIn {
		0% {
			transform: translateY(100%);
			opacity: 0;
		}

		50% {
			transform: translateY(10px);
		}

		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}
	::v-deep .u-button--disabled {
		opacity:1 !important;
	}
</style>