<template>
  <RegistrationCardForm v-model="form" mode="edit" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RegistrationCardForm from "./form.vue";

const form = ref({});

function handleSubmit(payload) {
  // 这里应接入后端接口更新报名卡
  // await request.put(`/registration-card/${id}`, payload)
  uni.showToast({ title: "已更新", icon: "success" });
  setTimeout(() => {
    uni.navigateBack();
  }, 400);
}

onLoad((options) => {
  // 期望从路由参数中接收现有数据：options.data 为 encodeURIComponent(JSON.stringify(obj))
  try {
    if (options?.data) {
      const decoded = JSON.parse(decodeURIComponent(options.data));
      form.value = decoded || {};
    }
  } catch (e) {
    // ignore
  }
});
</script>

<style scoped></style>
