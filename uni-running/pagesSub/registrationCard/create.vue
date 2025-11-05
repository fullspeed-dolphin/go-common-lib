<template>
  <RegistrationCardForm v-model="form" mode="create" @submit="handleSubmit" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RegistrationCardForm from "./form.vue";
import request from "@/utils/request.js";
import {
  loadProvinceData,
  loadCityData,
  loadAreaData,
} from "@/utils/regionData.js";

const form = ref({});

// 省市区数据
const provinceData = ref([]);
const cityData = ref([]);
const areaData = ref([]);

// 根据code查找名称
function codeToName(code, type) {
  if (!code) return "";

  if (type === "province") {
    const item = provinceData.value.find((p) => p.code === code);
    return item ? item.name : code;
  } else if (type === "city") {
    const item = cityData.value.find((c) => c.code === code);
    return item ? item.name : code;
  } else if (type === "area") {
    const item = areaData.value.find((a) => a.code === code);
    return item ? item.name : code;
  }
  return code;
}

// 将表单数据转换为API数据
function formToApi(formData) {
  // 处理region：将code转换为名称
  const regionParts = (formData.region || "").split(",");
  const provinceCode = regionParts[0] || "";
  const cityCode = regionParts[1] || regionParts[0] || "";
  const state = codeToName(provinceCode, "province");
  const city = codeToName(cityCode, "city");

  // 处理gender：表单是"male"/"female"，API需要"1"/"2"
  const gender = formData.gender === "female" ? "2" : "1";

  const apiData = {
    full_name: formData.name,
    full_name_pinyin: formData.pinyin,
    gender: gender,
    cert_type: formData.idType,
    cert_number: formData.idCardNumber,
    birthday: formData.birthday,
    phone_number: formData.mobile,
    email: formData.email,
    country: formData.country,
    state: state,
    city: city,
    address: formData.address,
    blood_type: formData.bloodType,
    tshirt_size: formData.clothesSize,
    emg_contact: formData.emergencyContact,
    emg_contact_phone: formData.emergencyPhone,
    is_self: formData.isOwner ? 1 : 0,
  };

  return apiData;
}

async function handleSubmit(payload) {
  try {
    const apiData = formToApi(payload);

    await request.post("/booking-api/registration/createSignerInfo", apiData);

    uni.showToast({ title: "已保存", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 400);
  } catch (error) {
    console.error("创建报名卡失败:", error);
  }
}

// 加载省市区数据
async function loadRegionData() {
  try {
    const [province, city, area] = await Promise.all([
      loadProvinceData(),
      loadCityData(),
      loadAreaData(),
    ]);
    provinceData.value = province;
    cityData.value = city;
    areaData.value = area;
  } catch (error) {
    console.error("加载省市区数据失败:", error);
  }
}

onLoad(() => {});

onMounted(() => {
  loadRegionData();
});
</script>

<style scoped></style>
