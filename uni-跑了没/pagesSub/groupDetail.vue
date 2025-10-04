<template>
	<view>
		<u-navbar :title="pageTitle"></u-navbar>
		<section class="section-card flex-row">
			<image class="img" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
			<view class="" style="width:500rpx;">
				<view class="name ellipsis2">{{detail.name}}</view>
				<view class="flex-between-center text">
					<view class="">
						<view class="mb20">成立时间：{{detail.establish_time.slice(0, 10)}}</view>
						<view class="">成立地点：{{detail.establish_location}}</view>
					</view>
					<view class="">
						<view class="mb20">跑团ID：{{detail.group_id}}</view>
						<view class="">跑团人数：{{detail.total_members}}人</view>
					</view>
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
		
		<view class="" style="padding: 0rpx 34rpx;">
			<u-divider text="跑团成员" textColor="#000" lineColor="#707070"></u-divider>
		</view>
		
		<view class="member-item flex-start" v-for="(item,index) in 5" :key="index">
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
		</view>
		
		<view class="" style="height: 120rpx;"></view>
		<!-- 未加入跑团，才可加入跑团 -->
		<section v-if="userInfo.running_group" class="section-bottom">
			<view style="padding: 0rpx 156rpx 20rpx">
				<u-button type="primary" shape="circle" @click="joinGroup()">加入跑团</u-button>
			</view>
		</section>
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
			pageTitle() {
				return this.routeParams.from === 'mine' ? '我的跑团' : '跑团详情';
			},
			userInfo() {
				return this.$store.state.userInfo
			}
		},
		
		onLoad(options) {
			console.log("option", options);
			this.routeParams = options;
			// this.detail = options
			this.getDetail()
		},
		methods: {
			getDetail(page) {
			  uni.showLoading({ mask: true });
				const data = {
					ID: this.options
				}
				
				this.$axios.post(`/user-api/user/getUserGroup`)
					.then((res) => {
						this.detail = res
					})
			},
			joinGroup() {
				// 一个人能创建5个，每个20人起，一个队百人封顶
			  uni.showModal({
			    title: "提示",
			    content: "是否确认加入该跑团？",
			    success: (res) => {
			      if (res.confirm) {
			        const data = {
			          running_group: this.orderNo,
			        };
			
			        uni.showLoading({ mask: true });
			        this.$axios
			          .post(`/user-api/user/joinRunningGroup`, data)
			          .then((res) => {
			            uni.hideLoading();
			            this.getDetail();
			            this.$toast("加入成功！");
			          });
			      } else if (res.cancel) {
			        console.log("用户点击取消");
			      }
			    },
			  });
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