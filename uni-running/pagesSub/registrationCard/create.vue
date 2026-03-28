<template>
  <RegistrationCardForm v-model="form" mode="create" :themeColor="themeColor" @submit="handleSubmit" />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RegistrationCardForm from "./form.vue";
import request from "@/utils/request.js";
import {
  useRegionData,
  showRequestError,
  registrationFieldOrder,
} from "./utils.js";

const form = ref({});
const themeColor = computed(() => {
  const config = uni.getStorageSync('eventThemeColor');
  return config?.solid || '#FF8C00';
});

// 省市区数据
const { loadRegionData, codeToName } = useRegionData();

// 根据code查找名称逻辑复用 utils.js

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

  // 处理cert_type：将中文转换为后端枚举值
  const certTypeMap = {
    "身份证": "CN_ID",
    "香港居民身份证": "HK_ID",
    "澳门居民身份证": "MA_ID",
    "港澳居民往来大陆通行证(回乡证)": "HK_MA_PASS"
  };
  const cert_type = certTypeMap[formData.idType] || "CN_ID";

  const apiData = {
    full_name: formData.name,
    full_name_pinyin: formData.pinyin,
    gender: gender,
    cert_type: cert_type,
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
    showRequestError(error, "创建报名卡失败", {
      fieldOrder: registrationFieldOrder,
    });
  }
}

onLoad(() => {});

// 加载省市区数据
onMounted(() => {
  loadRegionData();
});
</script>

<style lang="scss" scoped>
	::v-deep {
		.u-form-item {
			position: relative;
			&:last-child:after{
				display: none;
			}
			&:after {
				position: absolute;
				box-sizing: border-box;
				-webkit-transform-origin: center;
				transform-origin: center;
				content: " ";
				pointer-events: none;
				top: -50%;
				right: -50%;
				bottom: -50%;
				left: -50%;
				border-bottom: 1px solid #eee;
				-webkit-transform: scale(.5);
				transform: scale(.5)
			}
		}
     .u-radio-group{
      justify-content: flex-end;
    }
     .u-form-item__body__left__content__required{
			top:0;
			font-size: 14px;
			position: relative !important;
			top: 0 !important;
			left: 0 !important;
			margin-left: 4rpx !important;
		}
	}
	:deep(.u-form-item__body__left__content){
		.u-form-item__body__left__content__label{
			flex: none!important;
		}
	}
</style>
