<template>
  <AddressForm v-model="form" mode="create" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import AddressForm from "./form.vue";
import request from "@/utils/request.js";

const form = ref({});

async function handleSubmit(payload) {
  try {
    // 这里应该调用实际的API接口
    // await request.post('/address', payload);

    // 临时使用本地存储
    const addressList = uni.getStorageSync("addressList") || [];
    const newAddress = {
      id: Date.now(), // 临时ID
      ...payload,
    };
    addressList.push(newAddress);
    uni.setStorageSync("addressList", addressList);

    uni.showToast({
      title: "添加成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 400);
  } catch (error) {
    console.error("添加地址失败:", error);
    uni.showToast({
      title: "添加失败",
      icon: "none",
    });
  }
}
</script>

<style scoped></style>
