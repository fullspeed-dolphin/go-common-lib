<template>
  <view class="">
    <u-navbar autoBack placeholder title="我的消息"></u-navbar>
    <mescroll-body
      @init="mescrollInit"
      @down="downCallback"
      @up="getList"
      top="180"
    >
      <view
        class="member-item flex-start"
        :class="{ 'u-border-bottom': index !== 4 }"
        v-for="(item, index) in 5"
        :key="index"
      >
        <image
          class="img"
          src="https://cdn.uviewui.com/uview/album/1.jpg"
          mode="aspectFill"
        ></image>
        <view class="flex-start">
          <view class="text" style="width: 432rpx">
            <view class="name ellipsis">赛事小秘书</view>
            <view class="desc ellipsis2">奔跑吧！广州·增城站广州·增城站</view>
          </view>
          <view class="time"> 9月20日 </view>
        </view>
      </view>
    </mescroll-body>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

const getList = (mescroll) => {
  uni.showLoading({ mask: true });
  const data = {
    Page: mescroll.num,
    Size: "10",
  };

  proxy.$axios
    .post(`/api/store/purchase/order/list?page=${mescroll.num}`, data)
    .then(async (res) => {
      uni.hideLoading();

      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      mescroll.endSuccess(res.List.length);

      //如果是第一页需手动制空列表
      if (mescroll.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(res.List); //追加新数据
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endErr();
    });
};
</script>

<style lang="scss">
.member-item {
  margin: 20rpx 34rpx;
  color: #666;
  .img {
    width: 106rpx;
    height: 106rpx;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #707070;
    margin-right: 30rpx;
  }
  .name {
    margin-top: 12rpx;
    font-weight: 500;
    font-size: 30rpx;
    color: #000000;
    line-height: 42rpx;
  }
  .desc {
    margin-top: 10rpx;
    color: #666;
    font-size: 24rpx;
    line-height: 34rpx;
  }
  .time {
    font-size: 24rpx;
    color: #666;
  }
}

.u-border-bottom {
  padding-bottom: 14rpx;
  border-color: #f5f5f5 !important;
}
</style>
