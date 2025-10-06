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
						<view class="cell-item">成立时间：{{detail.establish_time}}</view>
						<view class="cell-item">跑团ID：{{detail.group_id}}</view>
						<view class="cell-item">跑团人数：{{detail.total_members}}人</view>
						<view class="cell-item">创建人：{{detail.creator_real_name}}</view>
						<view class="cell-item">手机号：{{detail.creator_phone}}</view>
						<view class="cell-item flex-row">成立地点：
							<view class="flex-1">
							{{detail.establish_location}}
							</view> 
						</view>
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
			
			<view class="" style="padding: 0rpx 34rpx;">
				<u-divider text="跑团成员" textColor="#000" lineColor="#707070"></u-divider>
			</view>
			
			<view class="member-item flex-start" v-for="(item,index) in memberList" :key="index">
				<view class="img-box">
					<image class="img" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				</view>
				<view class="">
					<view class="mb10" style="color: #222;">{{item.nickname || '成员'}}</view>
					{{item.user_phone}}
				</view>
			</view>
			<view v-if="memberList.length > 10" class="flex-center" style="margin-top: -20rpx;" @click="viewMoreMembers()">
				<text style="color:#FF8C00;margin-right:5rpx;">查看更多</text> 
				<u-icon name="arrow-down" color="#FF8C00"></u-icon>
			</view>
			
			<u-empty v-if="!memberList.length" mode="search" text="暂无跑团成员"/>
			
			<view class="" style="height: 120rpx;"></view>
			<!-- 未加入跑团，才可加入跑团 -->
			<section class="section-bottom">
				<view style="padding: 0rpx 156rpx 20rpx" class="flex-between-center">
					<u-button type="error" shape="circle" @click="deleteGroup()">删除跑团</u-button>
					<u-button type="primary" shape="circle" @click="updateGroup()">更新跑团</u-button>
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
		
		  // 监听全局的自定义事件
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
			getUserGroup(page) {
			  uni.showLoading({ mask: true });
				
				this.$axios.post(`/user-api/user/getCreatedGroup`).then((res) => {
					res.establish_time = res.establish_time.slice(0, 10)
					this.detail = res
					
					this.getMemberList()
				})
				this.$axios.post(`/user-api/user/getUserGroup`).then((res) => {
					res.establish_time = res.establish_time.slice(0, 10)
					this.detail = res
					
					this.getMemberList()
				})
			},
			getMemberList() {
				const data = {
					"pageIndex": 0,
					"pageSize": 10,
					groupId: Number(this.detail.group_id)
				}
				this.$axios.post(`/running-group/api/v1/groups/members`, data)
					.then((res) => {
						this.memberList = res.memberships
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
		}
	};
</script>

<style lang="less" scoped>
	.cell-item{
		min-width: 120rpx;
		padding: 6rpx 10rpx 10rpx 0;
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