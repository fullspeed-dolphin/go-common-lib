<template>
  <view class="">
    <Navbar title="报名卡" :bgHeight="370" />
    <view
      v-if="!registrationCardList.length"
      class="flex-col-center section-empty"
      style=""
    >
      尚未添加任何报名卡
      <view class="">点击下面的“添加报名卡”按钮进行添加</view>
    </view>

    <view class="flex-row flex-wrap card">
      <view
        class="card-item"
        v-for="(item, index) in registrationCardList"
        :key="index"
      >
        <view class="name">
          <view class="name-text">{{ item.name }}</view>
          <view class="name-owner" v-if="item.isOwner">本人</view>
        </view>
        <view class="id-card-number">
          <view class="id-card-number-text"
            >{{ item.idCardNumber.slice(0, 1) }} ***************
            {{ item.idCardNumber.slice(-2) }}</view
          >
          <view class="id-card-number-separator">|</view>
          <view class="id-card-number-type"> 成人 </view>
        </view>
        <view class="card-item-actions">
          <view class="card-item-actions-item">
            <up-checkbox
              shape="circle"
              activeColor="#8CC63E"
              :checked="item.isOwner"
              size="14"
            ></up-checkbox>
            设为本人
          </view>
          <view
            class="card-item-actions-item"
            @click="$u.route('pagesSub/registrationCard/edit')"
          >
            <u-icon name="edit-pen" size="20" color="#999999"></u-icon>
            修改
          </view>
        </view>
      </view>
    </view>

    <section class="section-bottom">
      <view style="padding: 56rpx 54rpx 40rpx">
        <u-button
          type="primary"
          color="#FF8C00"
          customStyle="border-radius: 16rpx;"
          @click="$u.route('pagesSub/registrationCard/create')"
          >添加报名卡</u-button
        >
      </view>
    </section>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import Navbar from "@/components/navbar.vue";

// 响应式数据
const registrationCardList = ref([
  {
    name: "报名卡1",
    isOwner: true,
    idCardNumber: "123456789012345678",
  },
]);
const options = ref({});

// 页面加载
onLoad((optionsParam) => {
  options.value = optionsParam;
});
</script>

<style lang="less" scoped>
.section-empty {
  min-height: 80vh;
  font-size: 34rpx;
  color: #707070;
  line-height: 48rpx;
  text-align: center;
}
.section-bottom {
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
}
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 34rpx;
  gap: 20rpx;
  .card-item {
    width: 100%;
    // height: 274rpx;
    padding: 24rpx 20rpx;
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    .name {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      .name-text {
        font-weight: bold;
        font-size: 30rpx;
        color: #000000;
      }
      .name-owner {
        display: flex;
        align-items: center;
        margin-left: 26rpx;
        background: #f1ffde;
        border-radius: 8rpx 8rpx 8rpx 8rpx;
        font-weight: bold;
        font-size: 24rpx;
        color: #8cc63e;
        padding: 8rpx 16rpx;
      }
    }
    .id-card-number {
      display: flex;
      align-items: center;
      margin-top: 12rpx;
      font-weight: bold;
      font-size: 32rpx;
      color: #000000;
      .id-card-number-separator {
        margin: 0 16rpx;
        font-weight: 100;
        color: #bfbfbf;
      }
    }
    .card-item-actions {
      display: flex;
      justify-content: space-between;
      border-top: 1rpx solid #e5e5e5;
      align-items: center;
      margin-top: 20rpx;
      padding-top: 20rpx;
      .card-item-actions-item {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #999;
        &.active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
