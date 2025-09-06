<template>
  <view class="panel">
		<view class="bg" :style="'background: linear-gradient('+ cardEntity.bg +')'"></view>
  	<view class="" style="position:relative;z-index: 1;">
  		<view class="cell flex-between-center">
  			<view class="title flex-start">
  				<view :class="'iconfont ' + cardEntity.icon"></view>
  				<view class="txt h3">
  					{{title}}
  				</view>
  			</view>
  			<view v-if="link" class="flex-start" @click="goLink()">
  				<view class="arrow-txt" :style="'color:' + cardEntity.color">查看全部</view>
  				<u-icon name="arrow-right" :color="cardEntity.color" size="12"></u-icon>
  			</view>
  		</view>
			
			<view class="panel-slot flex-wrap">
				<slot />
			</view>
  	</view>
  </view>
</template>
<script>
export default {
	props: {
		type: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: '标题'
		},
		link: {
			type: Boolean,
			default: false
		},
	},
  data () {
		return {
		}
  },
	computed: {
		cardEntity () {
			const cardEntity = {
				'photo': {
					icon: 'icon-tupian',
					color:"#a88ab2",
					bg:"#d8d5fc,#f2f2fd"
				},
				'video': {
					icon: 'icon-shipin',
					color:"#809e9f",
					bg:"#e4fcfd,#f5fefe"
				},
				'audio': {
					icon: 'icon-yinpin',
					color:"#bb9b99",
					bg:"#fde4e3,#fef7f6"
				},
				'art': {
					icon: 'icon-huabi-',
					color:"#879baa",
					bg:"#cee8fc,#f0f8fe"
				},
				'text': {
					icon: 'icon-wenzi',
					color:"#af9f80",
					bg:"#fef2db,#fefbf4"
				},
			}
			
			return cardEntity[this.type]
		}
	},
  methods: {
		goLink(item) {
			this.$emit('link')
		}
	}
};
</script>

<style lang="less">
	.panel{
		position: relative;
		.bg{
			position: absolute;
			content: "";
			top:0;
			width:100%;
			height: 90rpx;
			border-radius: 14rpx 14rpx 0 0;
			background: linear-gradient(#cee8fc, #f0f7fc);
		}
		.panel-slot{
			display: flex;
			gap: 16rpx;
			padding: 25rpx 0 20rpx 20rpx;
			min-height: 300rpx;
			background: #fff;
			border-radius: 14rpx;
			overflow: hidden;
			box-shadow: 0rpx 4rpx 8rpx rgba(102,102,102, .1);
		}
	}
	.cell{
		padding: 22rpx 24rpx;
		.iconfont{
			color:#212121;
			font-weight: 500;
			margin-right: 8rpx;
			font-size: 24rpx;
		}
	}
	.arrow-txt{
		font-size: 24rpx;
	}
	.h3{
		color:#212121;
		font-weight: 500;
	}
</style>
