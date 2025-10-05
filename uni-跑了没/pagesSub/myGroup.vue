<template>
	<view>
		<u-navbar title="我的跑团"></u-navbar>
		<u-empty v-if="!detail.name" mode="data" />
		<block v-if="detail.name">
			<section  class="section-card flex-row">
				<image class="img" :src="detail.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				<view class="" style="width:500rpx;">
					<view class="name ellipsis2">{{detail.name}}</view>
					<view class="text flex-wrap flex-row flex-between-center">
						<view class="cell-item">成立时间：{{detail.establish_time.slice(0, 10)}}</view>
						<view class="cell-item">跑团ID：{{detail.group_id}}</view>
						<view class="cell-item">成立地点：{{detail.establish_location}}</view>
						<view class="cell-item">跑团人数：{{detail.total_members}}人</view>
						<view class="cell-item">创建人：{{detail.creator_real_name}}</view>
						<view class="cell-item">手机号：{{detail.creator_phone}}</view>
						<!-- <view class="">
							<view class="mb20">创建人：{{detail.creator_real_name}}</view>
						</view> -->
					</view>
				</view>
			</section>
			
			<view class="" style="padding: 0rpx 34rpx;">
				<u-divider text="跑团介绍" textColor="#000" lineColor="#707070"></u-divider>
			</view>
			
			<section style="font-weight: 500;
				padding: 10rpx 34rpx 20rpx;
				line-height: 1.4;
				color: #000000;">
					 {{detail.introduction}}
			</section>
			
			<!-- <view class="" style="padding: 0rpx 34rpx;">
				<u-divider text="跑团成员" textColor="#000" lineColor="#707070"></u-divider>
			</view> -->
			
			<!-- <view class="member-item flex-start" v-for="(item,index) in 5" :key="index">
				<view class="img-box">
					<image class="img" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
				</view>
				<view class="flex-start">
					昵称
				</view>
			</view>
			<view class="flex-center" style="margin-top: -20rpx;" @click="$u.route(`pagesSub/groupMemberList`)">
				<text style="color:#FF8C00;margin-right:5rpx;">查看更多</text> 
				<u-icon name="arrow-down" color="#FF8C00"></u-icon>
			</view> -->
		</block>
	</view>
</template>
<script>
	export default {
		components: {},
		data() {
			return {
				detail: {},
				routeParams: {},
			};
		},
		computed: {
			userInfo() {
				return this.$store.state.userInfo
			}
		},
		onLoad(options) {
			console.log("option", options);
			this.routeParams = options;
			this.getUserGroup()
		},
		methods: {
			getUserGroup(page) {
			  uni.showLoading({ mask: true });
				
				this.$axios.post(`/user-api/user/getCreatedGroup`)
					.then((res) => {
						this.detail = res
					})
			},
			leaveGroup() {
			  uni.showModal({
			    title: "提示",
			    content: "是否确认退出该跑团？",
			    success: (res) => {
			      if (res.confirm) {
			        const data = {
			          orderNo: this.orderNo,
			        };
			
			        uni.showLoading({ mask: true });
			        this.$axios
			          .post(`/order/admin/orders/cancelOrder `, data)
			          .then((res) => {
			            uni.hideLoading();
			            this.getDetail();
			            this.$toast("退出成功！");
			          });
			      } else if (res.cancel) {
			        console.log("用户点击取消");
			      }
			    },
			  });
			},
		}
	};
</script>

<style lang="less" scoped>
	.cell-item{
		min-width: 120rpx;
		padding: 10rpx;
	}
	.member-item{
		padding: 11rpx 34rpx;
		color: #666;
		.img-box{
			border-radius: 999px;
			background: #FFFFFF;
			border: 2rpx solid #707070;
			margin-right: 30rpx;
			overflow: hidden;
		}
		.img{
			display: block;
			width: 106rpx;
			height: 106rpx;
		}
	}
	.section-card{
		padding: 34rpx;
		.img{
			display: block;
			width: 154rpx;
			height: 154rpx;
			margin-right: 30rpx;
			background: #D8D8D8;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			font-weight: 500;
			font-size: 32rpx;
			color: #000000;
			line-height: 44rpx;
			margin-bottom: 22rpx;
		}
		.text{
			font-weight: 500;
			font-size: 24rpx;
			line-height: 32rpx;
		}
	}

	.h2 {
		font-size: 32rpx;
		font-weight: 600;
	}

	.cell{
		line-height: 47rpx;
		.label{
			width: 174rpx;
			color: #66768a;
		}
		.value{
			color: #212121;
			line-height: 36rpx;
			width: 450rpx;
		}
	}
	
	.section-bottom {
	  position: fixed;
	  bottom: 0px;
	  width: 100%;
	  z-index: 10;
	}
</style>