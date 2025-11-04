<template>
  <AddressForm v-model="form" mode="edit" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AddressForm from "./form.vue";
import request from "@/utils/request.js";

const form = ref({});

function handleSubmit(payload) {
  try {
    // 这里应该调用实际的API接口更新地址
    // await request.put(`/address/${id}`, payload);

    // 临时使用本地存储
    const addressList = uni.getStorageSync("addressList") || [];
    const index = addressList.findIndex((item) => item.id === form.value.id);
    if (index !== -1) {
      addressList[index] = { ...form.value, ...payload };
      uni.setStorageSync("addressList", addressList);
    }

    uni.showToast({
      title: "更新成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 400);
  } catch (error) {
    console.error("更新地址失败:", error);
    uni.showToast({
      title: "更新失败",
      icon: "none",
    });
  }
}

onLoad((options) => {
  // 期望从路由参数中接收现有数据：options.data 为 encodeURIComponent(JSON.stringify(obj))
  try {
    if (options?.data) {
      const decoded = JSON.parse(decodeURIComponent(options.data));
      form.value = decoded || {};
    }
  } catch (e) {
    console.error("解析地址数据失败:", e);
  }
});
</script>

<style scoped></style>
