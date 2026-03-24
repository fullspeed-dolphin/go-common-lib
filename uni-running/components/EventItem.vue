<template>
	<view class="event-item" @click="joinEvent">
		<view class="poster">
			<image class="poster-img"
				:src="item.image_url + '?x-oss-process=image/resize,w_600,h_320,m_fill'"
				mode="aspectFill" />
			<view class="event-item-title ellipsis2">{{ item.description }}</view>
		</view>

		<view class="event-tag" :class="item.fsc_id ? 'tag-fsc' : 'tag-self'">{{item.fsc_id ? '跑团活动' : '自营活动'}}</view>

		<view class="u-p-20">
			<view class="event-item-meta flex-between-center" v-if="showButton">
				<view class="u-flex-1 ofh">
					<view v-if="item.event_location" class="event-item-meta b ellipsis u-mt-10">
						{{ item.is_online ? "线上跑" : '地址: ' + item.event_location}}
					</view>
					<view v-if="item.event_time" class="event-item-location b u-mt-20 u-mb-5">
						活动日期: {{ dayjs(item.event_time).format("YYYY-MM-DD") }}
					</view>
				</view>
				<view class="event-item-button" :style="buttonStyle">
					<block v-if="item.status === 'ACT'">立即报名</block>
					<block v-if="item.status === 'PND'">{{from === 'team' ? "审核中" : "暂未开始"}}</block>
					<block v-if="item.status === 'EXP'">{{from === 'team' ? "已过期" : "查看详情"}}</block>
					<block v-if="item.status === 'REJ'">审核未通过</block>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
	import { computed } from "vue";
	import dayjs from "dayjs";
	const props = defineProps({
		width: {
			type: String,
			default: "auto",
		},
		order_no: {
			type: String,
			default: "",
		},
		item: {
			type: Object,
			default: () => {},
		},
		showButton: {
			type: Boolean,
			default: true,
		},
		direction: {
			type: String,
			default: "column",
		},
		height: {
			type: String,
			default: "auto",
		},
		from: {
			type: String,
			default: "",
		},
	});

	const buttonStyle = computed(() => {
		if (props.item.status === 'REJ') return 'background: #999;';
		const g = props.item.color_config?.gradient;
		if (g?.length === 2) {
			return `background: linear-gradient(90deg, ${g[0]}, ${g[1]});`;
		}
		return '';
	});

	const joinEvent = () => {
		if (props.from === "order") return;
		
		if (props.from === "team") {
			uni.$u.route(`pagesSub/runningTeam/teamEventDetail?id=${props.item.event_id}`);
			return
		};
		if (props.item.is_online) {
			uni.$u.route(`pagesDashboard/pkEvent/pkEvent`, { id: props.item.event_id || props.item.id });
			return;
		}
		uni.$u.route(
			`pagesSub/eventDetail?id=${props.item.event_id || props.item.id}&fsc_id=${props.item.fsc_id || ''}`
		);
	};
</script>

<style lang="scss" scoped>
	.event-item {
		position: relative;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		.event-tag{
			position: absolute;
			right: 0;
			top:0;
			color: #fff;
			border-radius: 0 16rpx 0 16rpx;
			font-size: 24rpx;
			padding: 10rpx 20rpx;

			&.tag-self {
				background: #3b82f6; // 自营活动 - 蓝色
			}

			&.tag-fsc {
				background: #22c55e; // 跑团活动 - 绿色
			}
		}
	}

	.poster {
		position: relative;
		width: 100%;
		height: 320rpx;

		.poster-img {
			display: block;
			width: 100%;
			height: 320rpx;
		}
	}

	.event-item-title {
		position: absolute;
		width: 100%;
		bottom: 0;
		left: 0;
		font-weight: 500;
		line-height: 44rpx;
		font-size: 32rpx;
		color: #fff;
		padding: 50rpx 20rpx 10rpx;
		background-image: linear-gradient(-180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 80%);
	}

	.event-item-meta {
		color: #333;
		font-size: 26rpx;
	}

	.event-item-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 164rpx;
		height: 60rpx;
		color: #fff;
		background: #ff8c00;
		border-radius: 40rpx;
		font-size: 24rpx;
	}

	.event-item-button:active {
		background: #e67e00;
	}
</style>