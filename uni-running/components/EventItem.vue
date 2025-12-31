<template>
	<view class="event-item" @click="joinEvent">
		<image class="poster"
			:src="(item.image_url) + '?x-oss-process=image/resize,w_600,h_320,m_fill'"
			mode="aspectFill"></image>
			
		<view class="u-p-20">
			<view class="event-item-title ellipsis2">{{ item.description }}</view>

			<view class="event-item-meta flex-between-center" v-if="showButton">
				<view>
					<view v-if="item.event_location" class="event-item-meta b ellipsis u-mt-10" style="max-width: 430rpx;">
						{{ item.is_online ? "线上跑" : '地址: ' + item.event_location}}
					</view>
					<view v-if="item.event_time" class="event-item-location b u-mt-20 u-mb-5">
						活动日期: {{ dayjs(item.event_time).format("YYYY-MM-DD") }}
					</view>
				</view>
				<view class="event-item-button">
					<block v-if="item.status === 'ACT'">立即报名</block>
					<block v-if="item.status === 'PND'">暂未开始</block>
					<block v-if="item.status === 'EXP'">查看详情</block>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
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

	const joinEvent = () => {
		if (props.from === "order") return;
		uni.$u.route(
			`pagesSub/offlineEvents?id=${props.item.event_id || props.item.id}`
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
	}

	.poster {
		display: block;
		width: 100%;
		height: 320rpx;
		border-radius: 16rpx 16rpx 0 0;
	}

	.event-item-title {
		position: absolute;
		width: 100%;
		bottom: 124rpx;
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
		font-size: 26rpx;
	}

	.event-item-button:active {
		background: #e67e00;
	}
</style>