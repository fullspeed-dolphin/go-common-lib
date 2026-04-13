<template>
  <view class="">
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
      <view class="u-flex-row u-flex-wrap" style="padding: 20rpx 34rpx;gap:26rpx;">
      	<view class="card-item" v-for="(item, index) in dataList" :key="index" @click="routeTo(item)">
      		<view class="img">
      			<up-lazy-load borderRadius="10" :image="
      				(item.avatar_url || '/static/images/user.png')  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
      			" mode="aspectFill" />
      		</view>
      	  <view class="flex-col-center">
      	    <view class="u-mb-20 ellipsis">黄埔体育中心体育馆</view>
      	    <view class="u-mb-10">里程：<text style="color:#FF8C00;">0 km</text></view>
      	  </view>
      	</view>
      </view>
    </mescroll-body>
		
		<section class="section-bottom">
				<u-button type="primary" color="#FF8C00" shape="circle" customStyle="height: 80rpx;width: 642rpx;margin: 0 auto;"
					@click="$u.route(`pagesSub/runningTeam/teamForm?group_id=`)">创建地图</u-button>
		</section>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js"
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);

// 模板引用
const mescrollRef = ref(null);

// 响应式数据
const dataList = ref([]);
const group_id = ref("");

// 页面加载
onLoad((options) => {
  console.log(options);
  group_id.value = options.group_id;
});

function routeTo(item) {
	uni.$u.route('/pagesSub/sportDetail')
}

const getList = (mescroll) => {
  uni.showLoading({ mask: true });
  const data = {
    pageIndex: mescroll.num - 1,
    pageSize: 15,
    groupId: Number(group_id.value),
  };

  request.post(`/running-group/api/v1/groups/members`, data)
    .then(async (res) => {
			res = []
      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      mescroll.endSuccess(res.length);

      //如果是第一页需手动制空列表
      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(res); //追加新数据
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};
</script>

<style lang="scss" scoped>
.card-item {
  width: 328rpx;
  height: 436rpx;
	padding: 16rpx;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  .img {
    display: block;
    width: 296rpx;
    height: 296rpx;
		margin-bottom: 20rpx;
  }
}

.section-bottom {
		position: fixed;
		bottom: 30rpx;
		width: 100%;
		z-index: 10;
		padding: 0 30rpx 20rpx;
		::v-deep {
			.u-button {
				margin: 0;
			}
		}
	}
</style>
