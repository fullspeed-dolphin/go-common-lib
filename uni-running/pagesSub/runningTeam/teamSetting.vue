<template>
  <view class="">
    <view class="card-item panel u-flex-y-center" 
			@click="$u.route(`pagesSub/runningTeam/teamMaps?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1083@2x.png" mode="aspectFill"></image>
			跑团地图库
    </view>
    <view class="card-item panel u-flex-y-center" 
			@click="$u.route(`pagesSub/runningTeam/teamSummary?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1084@2x.png" mode="aspectFill"></image>
			跑团数据
    </view>
    <view class="card-item panel u-flex-y-center" 
			@click="$u.route(`pagesSub/runningTeam/teamEventForm?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1085@2x.png" mode="aspectFill"></image>
			跑团活动管理
    </view>
		
		<section class="section-bottom flex-wrap u-flex flex-between-center">
				<u-button type="primary" shape="circle" color="#F2F2F2" customStyle="color:#FF8C00;height: 80rpx;width: 312rpx;"
					@click="deleteGroup()">删除跑团</u-button>
				<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 312rpx;"
					@click="$u.route(`pagesSub/runningTeam/teamForm?group_id=${group_id}`)">更新跑团</u-button>
		</section>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js"

const group_id = ref("");

const deleteGroup = () => {
	uni.showModal({
		title: "提示",
		content: "是否确认删除该跑团？",
		success: (res) => {
			if (res.confirm) {
				uni.showLoading({
					mask: true
				});
				request.delete(
						`/running-group/api/v1/groups?group_id=${group_id.value}`
					)
					.then((res) => {
						uni.$u.toast("删除成功！");

						// 调用用户数据，检查参加或创建跑团标记
						store.dispatch("getUserInfo");

						setTimeout(() => {
							uni.navigateBack();
						}, 300);
					}).catch(e => {
						uni.hideLoading()
						uni.showModal({
							title: '提示',
							content: e.msg,
							showCancel: false, // 如果不需要“取消”按钮
							confirmText: '我知道了'
						});
						console.log(e)
					})
			} else if (res.cancel) {
				console.log("用户点击取消");
			}
		},
	});
};
	
onLoad((options) => {
  console.log(options);
  group_id.value = options.group_id;
});
</script>

<style lang="scss">
.card-item {
  width: 682rpx;
  height: 170rpx;
	padding-left: 150rpx;
  background: #FFFFFF;
  box-shadow: 10rpx 10rpx 10rpx 2rpx rgba(255,140,0,0.3);
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  font-weight: 800;
  font-size: 36rpx;
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    margin-right: 30rpx;
    overflow: hidden;
  }
  .img {
    display: block;
    width: 78rpx;
    height: 78rpx;
		margin-right: 22rpx;
  }
}

.section-bottom {
		position: fixed;
		bottom: 0;
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
</style>
