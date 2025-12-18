<template>
  <view class="">
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
      <view class="member-item flex-start" v-for="(item, index) in dataList" :key="index">
        <view class="img-box">
          <view class="img">
            <up-lazy-load borderRadius="100" :image="
						  (item.avatar_url ||
						  'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png')  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
						" mode="aspectFill" />
          </view>
        </view>
        <view class="">
          <view class="mb10" style="color: #222">{{
            item.nickname || "成员"
          }}</view>
        </view>
      </view>
    </mescroll-body>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

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

const getList = (mescroll) => {
  uni.showLoading({ mask: true });
  const data = {
    pageIndex: mescroll.num - 1,
    pageSize: 15,
    groupId: Number(group_id.value),
  };

  proxy.$axios
    .post(`/running-group/api/v1/groups/members`, data)
    .then(async (res) => {
      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      mescroll.endSuccess(res.memberships.length);

      //如果是第一页需手动制空列表
      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(res.memberships); //追加新数据
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};
</script>

<style lang="scss">
.member-item {
  padding: 11rpx 34rpx;
  color: #666;
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    border: 2rpx solid #707070;
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
