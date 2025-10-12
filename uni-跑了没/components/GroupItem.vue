<template>
	<view class="group-item flex-start" @click="viewDetail(item)">
		<image class="poster" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
		<view class="text">
			<view class="flex-between-center" style="width: 520rpx;">
				<view class="">
					<view class="name ellipsis">{{item.name}}</view>
					<view class="city flex-row">
						<view class="ellipsis mr10" style="width:320rpx;">
							{{item.establish_location}}
						</view>
						{{item.total_members}}人
					</view>
				</view>
				<u-button type="primary" size="small" shape="circle" @click="joinGroup(item)">加入</u-button>
			</view>
			<view class="desc ellipsis">{{item.introduction}}</view>
		</view>
	</view>
</template>
<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => {}
			},
			from: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				
			};
		},
		methods: {
			viewDetail(item){
				// 搜索组件中不跳转详情，加入按钮控制交互
				if (this.from === 'search') return;
				
				uni.setStorageSync('groupDetail', item)
				uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`)
			},
			joinGroup(item) {
				this.$emit('join', item)
			}
		},
	};
</script>

<style lang="scss" scoped>
	.group-item{
		padding: 10rpx 34rpx;
		.poster{
			width: 124rpx;
			height: 124rpx;
			background: #f5f5f5;
			margin-right: 40rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			line-height: 40rpx;
			margin-bottom: 12rpx;
		}
		.city{
			line-height: 28rpx;
			font-size: 20rpx;
			margin-bottom: 18rpx;
		}
		.desc{
			width: 422rpx;
			line-height: 26rpx;
			font-size: 18rpx;
		}
	}
</style>