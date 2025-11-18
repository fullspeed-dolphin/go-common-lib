<template>
  <RegistrationCardForm v-model="form" mode="edit" @submit="handleSubmit" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RegistrationCardForm from "./form.vue";
import request from "@/utils/request.js";
import {
  useRegionData,
  showRequestError,
  registrationFieldOrder,
} from "./utils.js";

const form = ref({});
const cardId = ref(null);

// 省市区数据
const { loadRegionData, codeToName, nameToCode } = useRegionData();

// 根据code查找名称及根据名称查找code逻辑复用 utils.js

// 将API数据转换为表单数据
function apiToForm(apiData) {
  if (!apiData) return {};

  // 处理region：将state和city名称转换为code组合
  let region = "";
  if (apiData.state || apiData.city) {
    const provinceCode = nameToCode(apiData.state, "province");
    const cityCode = nameToCode(apiData.city, "city");
    if (provinceCode && cityCode) {
      region = `${provinceCode},${cityCode}`;
    } else if (provinceCode) {
      region = provinceCode;
    } else if (cityCode) {
      region = cityCode;
    }
  }

  // 处理gender：API返回"male"或"female"，表单需要"male"或"female"
  let gender = "male";
  if (apiData.gender === "0" || apiData.gender === "female") {
    gender = "female";
  } else if (apiData.gender === "1" || apiData.gender === "male") {
    gender = "male";
  }

  return {
    name: apiData.full_name || "",
    pinyin: apiData.full_name_pinyin || "",
    gender: gender,
    idType: apiData.cert_type || "身份证",
    idCardNumber: apiData.cert_number || "",
    birthday: apiData.birthday || "",
    mobile: apiData.phone_number || "",
    email: apiData.email || "",
    country: apiData.country || "",
    region: region,
    address: apiData.address || "",
    bloodType: apiData.blood_type || "",
    clothesSize: apiData.tshirt_size || "",
    emergencyContact: apiData.emg_contact || "",
    emergencyPhone: apiData.emg_contact_phone || "",
    isOwner: apiData.is_self == 1,
    agreed: true, // 编辑时默认已同意
  };
}

// 将表单数据转换为API数据
function formToApi(formData) {
  // 处理region：将code转换为名称
  const regionParts = (formData.region || "").split(",");
  const provinceCode = regionParts[0] || "";
  const cityCode = regionParts[1] || regionParts[0] || "";
  const state = codeToName(provinceCode, "province");
  const city = codeToName(cityCode, "city");

  // 处理gender：表单是"male"/"female"，API需要"1"/"0"
  const gender = formData.gender === "female" ? "0" : "1";

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

// 获取报名卡详情
async function getCardDetail(id) {
  try {
    const res = await request.post("/booking-api/registration/getSignerInfo", {
      id: id,
    });
    if (res) {
      form.value = apiToForm(res);
    }
  } catch (error) {
    console.error("获取报名卡详情失败:", error);
    uni.showToast({ title: "获取详情失败", icon: "none" });
  }
}

async function handleSubmit(payload) {
  try {
    const apiData = formToApi(payload);
    // 添加id字段用于更新
    apiData.id = cardId.value;

    await request.post("/booking-api/registration/updateSignerInfo", apiData);

    uni.showToast({ title: "已更新", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 400);
  } catch (error) {
    console.error("更新报名卡失败:", error);
    showRequestError(error, "更新报名卡失败", {
      fieldOrder: registrationFieldOrder,
    });
  }
}

onLoad((options) => {
  // 从路由参数中获取id
  try {
    if (options?.data) {
      const decoded = JSON.parse(decodeURIComponent(options.data));
      if (decoded?.id) {
        cardId.value = decoded.id;
      }
    } else if (options?.id) {
      cardId.value = options.id;
    }
  } catch (e) {
    console.error("解析路由参数失败:", e);
  }
});

// 加载省市区数据
onMounted(async () => {
  // 先加载省市区数据
  await loadRegionData();

  // 然后加载卡片详情
  if (cardId.value) {
    getCardDetail(cardId.value);
  }
});
</script>

<style lang="scss" scoped>
	.txt_required{
		color: #f56c6c;
		line-height: 20px;
		font-size: 20px;
	}
	:deep(.u-form-item__body__left__content){
		flex-direction: row-reverse!important;
		justify-content: flex-end!important;
		.u-form-item__body__left__content__required{
			position: static!important;
			color: #f56c6c;
			line-height: 20px;
			font-size: 20px;
		}
		.u-form-item__body__left__content__label{
			flex: none!important;
		}
	}
</style>
