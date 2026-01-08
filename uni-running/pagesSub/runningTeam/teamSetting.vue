<template>
  <view class="page-container">
    <view class="card-item panel"
			@click="$u.route(`pagesSub/runningTeam/teamMaps?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1083@2x.png" mode="aspectFill"></image>
			<text class="card-text">跑团地图库</text>
    </view>
    <view class="card-item panel"
			@click="$u.route(`pagesSub/runningTeam/teamSummary?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1084@2x.png" mode="aspectFill"></image>
			<text class="card-text">跑团数据</text>
    </view>
    <view class="card-item panel"
			@click="$u.route(`pagesSub/runningTeam/teamEventList?group_id=${group_id}`)">
    	<image class="img" src="./img/组 1085@2x.png" mode="aspectFill"></image>
			<text class="card-text">跑团活动管理</text>
    </view>

		<section class="section-bottom flex-wrap u-flex flex-between-center">
				<u-button type="primary" shape="circle" color="#f7f7f7" customStyle="color:#FF8C00;height: 84rpx;width: 314rpx;"
					@click="deleteGroup()">删除跑团</u-button>
				<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 84rpx;width: 314rpx;"
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
.page-container {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 24rpx 34rpx;
  padding-bottom: 160rpx;
}

.card-item {
  width: 682rpx;
  height: 168rpx;
  background: #FFFFFF;
  box-shadow: 0 8rpx 8rpx 0 rgba(255, 140, 0, 0.4);
  border-radius: 16rpx;
  font-weight: 700;
  font-size: 36rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  padding-left: 200rpx;

  .img {
    display: block;
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
  }

  .card-text {
    color: #000000;
  }
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  gap: 25px;

  ::v-deep {
    .u-button {
      margin: 0;
    }
  }
}
</style>
