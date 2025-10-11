<template>
	<view>
		<u-navbar title="我的跑团"></u-navbar>
		<mescroll-empty v-if="!detail.name" mode="data" :option="{
			btnText: '创建跑团',
		}" @emptyclick="$u.route(`pagesSub/groupForm`)"/>
		
		<block v-if="detail.name">
			<section class="section-card flex-col-center">
				<image class="img" :src="detail.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				<view class="name ellipsis2">{{detail.name}}</view>
				<view class="flex-between-center c9 b">
					<view class="cell-item">{{detail.establish_time}} 成立</view>
					<view class="cell-item">跑团ID {{detail.group_id}}</view>
				</view>
				<view class="cell-item flex-row  c9 b">
					<u-icon name="map" size="14" color="#999"></u-icon>
					<view class="flex-1">
					{{detail.establish_location}}
					</view> 
				</view>
			</section>
			
			<section class="section-summary panel flex-row">
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{detail.total_members}}
					</view>
					成员人数
				</view>
				<view class="flex-1 flex-col-center">
					<view class="number">
						{{detail.total_members}}
					</view>
					男女比例
				</view>
			</section>
			
			<section class="section-intro panel">
				<view class="h4">跑团介绍</view>
				<view style="font-weight: 500;
					line-height: 34rpx;">
						 {{detail.introduction}}
				</view>
			</section>
			
			<section class="panel">
				<view class="h4">跑团管理</view>
				<view class="bar flex-start">团长</view>
				<view class="flex-between-center">
					<view class="leader-item flex-start">
						<view class="img-box">
							<image class="img" :src="memberLeader.avatar_url || '../static/run.png'" mode="aspectFill"></image>
						</view>
						<view class="">
							<view class="mb10 ellipsis mt10" style="width:320rpx;">{{memberLeader.nickname || '成员'}}</view>
							<!-- {{memberLeader.user_phone}} -->
						</view>
					</view>
					<u-button type="primary" size="mini" shape="circle" @click="callPhone(memberLeader.user_phone)">联系Ta</u-button>
				</view>
				
				<view class="bar flex-between-center">
					成员
					<view v-if="memberList.length > 10" class="flex-center" style="font-size: 20rpx;" @click="viewMoreMembers()">
						<text style="color:#FF8C00;margin-right:5rpx;">查看更多</text> 
						<u-icon name="arrow-right" color="#FF8C00" size="10"></u-icon>
					</view>
				</view>
				
				<view class="flex-row flex-wrap">
					<view class="member-item flex-col-center" v-for="(item,index) in memberList" :key="index">
						<view class="img-box">
							<image class="img" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
						</view>
						<view class="">
							<view class="mb10 ellipsis tac mt10" style="width:120rpx;">{{item.nickname || '成员'}}</view>
						</view>
					</view>
				</view>
				
				<mescroll-empty v-if="!memberList.length" :option="{ tip: '暂无跑团成员~',}"/>
			</section>
			
			<view class="" style="height: 120rpx;"></view>
			<!-- 团长才可修改 -->
			<section v-if="isTeamLeader" class="section-bottom">
				<view style="padding: 0rpx 30rpx 40rpx" class="flex-between-center">
					<u-button type="primary" color="#f2f2f2" textColor="#FF8C00" width="320rpx" shape="circle" @click="deleteGroup()">删除跑团</u-button>
					<u-button type="primary" color="#f2f2f2" textColor="#FF8C00" width="320rpx" shape="circle" @click="updateGroup()">更新跑团</u-button>
				</view>
			</section>
			
			<section v-if="!isTeamLeader" class="section-bottom">
				<view style="padding: 0rpx 156rpx 40rpx" class="flex-center">
					<u-button type="primary" color="#f2f2f2" textColor="#FF8C00" width="320rpx" shape="circle" @click="leaveGroup()">退出跑团</u-button>
				</view>
			</section>
		</block>
	</view>
</template>
<script>
	export default {
		components: {},
		data() {
			return {
				isTeamLeader: false,
				memberLeader: {},
				detail: {},
				memberList: []
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
		onShow() {
		  // 移除全局自定义事件监听器
		  uni.$off("updateList");
		
		  // 监听全局的自定义事件,团长修改了跑团
		  uni.$once("updateList", (data) => {
		    // 判断二级页面是否修改过数据，如果修改过，需要刷新首页，保持信息一致
		    if (data.isChange) {
		      this.getUserGroup();
		    }
		  });
		},
		methods: {
			updateGroup() {
				uni.$u.route(`pagesSub/groupForm?group_id=${this.detail.group_id}`)
			},
			async getUserGroup(page) {
			  uni.showLoading({ mask: true });
				
				try {
					let res = await this.$axios.post(`/user-api/user/getCreatedGroup`)
					
					if (res) {
						this.isTeamLeader = true;
					}
					
					let temp = await this.$axios.post(`/user-api/user/getUserGroup`)
					
					if (temp) {
						res = temp
					}
					
					if (res?.establish_time) {
						res.establish_time = res?.establish_time?.slice?.(0, 10)
					}
					
					this.detail = res || {}
					
					this.getMemberList()
					
				} catch (error) {
					console.error(error)
					//TODO handle the exception
				}
				
				uni.hideLoading()
			},
			getMemberList() {
				if (!this.detail.group_id) return;
				
				const data = {
					"pageIndex": 0,
					"pageSize": 10,
					groupId: Number(this.detail.group_id)
				}
				this.$axios.post(`/running-group/api/v1/groups/members`, data)
					.then((res) => {
						this.memberLeader = (res.memberships || []).find(i => i.role === 'creator') || {}
						this.memberList = (res.memberships || []).filter(i => i.role !== 'creator')
					})
			},
			deleteGroup() {
			  uni.showModal({
			    title: "提示",
			    content: "是否确认删除该跑团？",
			    success: (res) => {
			      if (res.confirm) {
			        uni.showLoading({ mask: true });
			        this.$axios.delete(`/running-group/api/v1/groups?group_id=${this.detail.group_id}`)
			          .then((res) => {
			            this.$toast("删除成功！");
									
									// 调用用户数据，检查参加或创建跑团标记
									this.$store.dispatch('getUserInfo')
									
									setTimeout(() => {
										uni.navigateBack()
									}, 300)
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
			        uni.showLoading({ mask: true });
			        this.$axios.post(`/user-api/user/quitRunningGroup`)
			          .then((res) => {
			            this.$toast("操作成功！");
									
									// 调用用户数据，检查参加或创建跑团标记
									this.$store.dispatch('getUserInfo')
									
									setTimeout(() => {
										uni.navigateBack()
									}, 300)
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
.section-summary{
		height: 126rpx;
		font-weight: bold;
		font-size: 22rpx;
		color: #999999;
		.number{
			font-size: 36rpx;
			color: #000000;
			line-height: 50rpx;
			margin-bottom: 10rpx;
		}
	}
	.bar{
		height: 48rpx;
		padding: 0 14rpx;
		background: #F3F3F3;
		font-size: 28rpx;
		color: #000;
		font-weight: bold;
		border-radius: 8rpx 8rpx 8rpx 8rpx;
	}
	.h4{
		position: relative;
		font-weight: 800;
		font-size: 28rpx;
		color: #000000;
		line-height: 38rpx;
		padding-left: 20rpx;
		margin-bottom: 28rpx;
		&:before{
			position: absolute;
			content: "";
			width: 8rpx;
			left:0;
			height: 38rpx;
			background: #FF8C00;
			border-radius: 4rpx 4rpx 4rpx 4rpx;
		}
	}
	.section-intro{
		font-weight: bold;
		font-size: 24rpx;
		color: #999999;
		padding-bottom: 40rpx;
	}
	.cell-item{
		min-width: 120rpx;
		padding: 6rpx 10rpx 10rpx 0;
	}
	.leader-item{
		padding: 16rpx 0 28rpx;
		font-weight: bold;
		font-size: 26rpx;
		color: #000000;
		.img-box{
			border-radius: 999px;
			background: #FFFFFF;
			margin-right: 12rpx;
			overflow: hidden;
		}
		.img{
			display: block;
			width: 70rpx;
			height: 70rpx;
			background: #f5f5f5;
		}
	}
	.member-item{
		padding: 20rpx;
		color: #000;
		font-size: 24rpx;
		.img-box{
			border-radius: 999px;
			background: #FFFFFF;
			margin-right: 12rpx;
			overflow: hidden;
			border: 1rpx solid #f5f5f5;
		}
		.img{
			display: block;
			width: 70rpx;
			height: 70rpx;
			background: #f5f5f5;
		}
	}
	.section-card{
		padding: 34rpx 34rpx 0;
		.img{
			display: block;
			width: 142rpx;
			height: 142rpx;
			background: #f5f5f5;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			font-weight: 800;
			font-size: 36rpx;
			color: #000000;
			line-height: 50rpx;
			margin-top: 16rpx;
			margin-bottom: 10rpx;
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