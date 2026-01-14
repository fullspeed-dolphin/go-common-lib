<template>
  <view class="">
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
      <view class="member-item flex-start panel" v-for="(item, index) in dataList" @click="openMemberDetail(item)" :key="index">
        <view class="img-box">
          <view class="img">
            <up-lazy-load borderRadius="100" 
							error-img="/static/images/user.png"
							:image="item.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill'" mode="aspectFill" />
          </view>
        </view>
        <view class="">
          <view class="u-mb-10" style="color: #222">{{
            item.nickname || "成员"
          }}</view>
        </view>
      </view>
    </mescroll-body>
		
		<MemberDetail ref="refMemberDetail" />
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js"
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);
import MemberDetail from "./memberDetail.vue";

// 响应式数据
const dataList = ref([]);
const group_id = ref("");

// 页面加载
onLoad((options) => {
  console.log(options);
  group_id.value = options.group_id;
});

const refMemberDetail = ref(null);
function openMemberDetail(item) {
	refMemberDetail.value.open(item)
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
			res = res?.memberships || []
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
.member-item {
  padding: 11rpx 34rpx;
  color: #666;
  box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    margin-right: 30rpx;
    overflow: hidden;
  }
  .img {
    display: block;
    width: 106rpx;
    height: 106rpx;
  }
}
</style>
