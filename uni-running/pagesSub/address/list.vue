<template>
  <view class="page">
    <u-navbar title="选择地址" placeholder />
    <view v-if="!addressList.length" class="flex-col-center section-empty">
      <view class="empty-text">暂无地址信息</view>
    </view>

    <view v-else class="container address-list">
      <view
        class="address-item"
        v-for="(item, index) in addressList"
        :key="index"
        @click="handleSelectAddress(item)"
      >
        <view class="address-main">
          <view class="address-name">{{ item.name }}</view>
          <view class="address-region">{{ item.region }}</view>
          <view class="address-detail">{{ item.detailAddress }}</view>
        </view>
        <view class="address-edit" @click.stop="handleEdit(item, index)">
          <u-icon name="edit-pen" size="18" color="#999999"></u-icon>
          <text class="edit-text">修改</text>
        </view>
      </view>
    </view>

    <section class="section-bottom">
      <view style="padding: 56rpx 54rpx 40rpx">
        <u-button
          type="primary"
          color="#FF8C00"
          shape="circle"
          @click="handleAdd"
          >添加地址信息</u-button
        >
      </view>
    </section>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";

const addressList = ref([
  {
    name: "张三",
    phone: "13800138000",
    region: "北京市",
    detailAddress: "北京市海淀区",
    postalCode: "100000",
    latitude: 39.9042,
    longitude: 116.4074,
  },
]);

// 获取地址列表
const getAddressList = async () => {
  try {
    // 这里应该调用实际的API接口
    // const res = await request.get('/address/list');
    // addressList.value = res || [];
    // 临时使用本地存储模拟数据
    // const stored = uni.getStorageSync("addressList") || [];
    // addressList.value = stored;
  } catch (error) {
    console.error("获取地址列表失败:", error);
    uni.showToast({
      title: "获取地址列表失败",
      icon: "none",
    });
  }
};

// 选择地址（如果需要返回选择的地址）
const handleSelectAddress = (item) => {
  // 如果是从其他页面跳转过来选择地址，返回选择的地址
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // 可以通过事件总线或全局状态传递选择的地址
    uni.$emit("addressSelected", item);
    uni.navigateBack();
  }
};

// 编辑地址
const handleEdit = (item, index) => {
  const data = encodeURIComponent(JSON.stringify(item));
  uni.navigateTo({
    url: `/pagesSub/address/edit?data=${data}`,
  });
};

// 删除地址
const handleDelete = (item, index) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除这个地址吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          // 这里应该调用实际的API接口
          // await request.delete(`/address/${item.id}`);

          // 临时使用本地存储
          addressList.value.splice(index, 1);
          uni.setStorageSync("addressList", addressList.value);

          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
        } catch (error) {
          console.error("删除地址失败:", error);
          uni.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

// 添加地址
const handleAdd = () => {
  uni.navigateTo({
    url: "/pagesSub/address/create",
  });
};

onMounted(() => {
  getAddressList();
});

onShow(() => {
  // 每次显示页面时刷新列表（编辑或创建后返回）
  getAddressList();
});
</script>

<style lang="less" scoped>
.page {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 180rpx;
}

.flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.section-empty {
  min-height: 60vh;
  color: #999999;
  font-size: 28rpx;
}

.empty-text {
  margin-top: 100rpx;
}

.container {
  padding: 20rpx 34rpx;
}

.address-list {
  margin-top: 20rpx;
}

.address-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
}

.address-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.address-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #000000;
  margin-bottom: 12rpx;
}

.address-region {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.address-detail {
  font-size: 28rpx;
  color: #000000;
  line-height: 1.5;
}

.address-edit {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  padding: 10rpx 0;
  flex-shrink: 0;
}

.edit-text {
  font-size: 26rpx;
  color: #999999;
  margin-left: 8rpx;
}

.section-bottom {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  width: 100%;
  z-index: 9;
  background: #fafafa;
}
</style>
