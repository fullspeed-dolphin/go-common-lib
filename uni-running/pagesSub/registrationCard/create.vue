<template>
  <RegistrationCardForm v-model="form" mode="create" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RegistrationCardForm from "./form.vue";

const form = ref({});

function handleSubmit(payload) {
  // 这里应接入后端接口保存报名卡
  // await request.post('/registration-card', payload)
  uni.showToast({ title: "已保存", icon: "success" });
  setTimeout(() => {
    uni.navigateBack();
  }, 400);
}

onLoad(() => {});
</script>

<style scoped></style>
