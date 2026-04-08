import { ref } from "vue";
import {
  loadProvinceData,
  loadCityData,
  loadAreaData,
} from "../utils/regionData.js";

const FIELD_KEY_REGEXP = /SaveSignerInfoRequest\.([A-Za-z0-9_]+)/;
const FALLBACK_FIELD_REGEXP = /'([A-Za-z0-9_]+)'/;

function parseFieldErrors(message) {
  if (!message || typeof message !== "string") return [];

  return message
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => {
      const keyMatch = text.match(FIELD_KEY_REGEXP);
      const fallbackMatch = !keyMatch && text.match(FALLBACK_FIELD_REGEXP);
      const fieldName = keyMatch?.[1] || fallbackMatch?.[1] || null;
      return {
        field: fieldName,
        message: text,
      };
    });
}

export const registrationFieldOrder = [
  "FullName",
  "FullNamePinyin",
  "Gender",
  "CertType",
  "CertNumber",
  "Birthday",
  "PhoneNumber",
  "Email",
  "Country",
  "State",
  "City",
  "Address",
  "BloodType",
  "TshirtSize",
  "EmgContact",
  "EmgContactPhone",
];

export function showRequestError(error, fallback = "请求失败", options = {}) {
  const code = error?.code;
  if (code && Number(code) === 200) {
    return;
  }
  const rawMessage =
    (typeof error === "string" && error) ||
    error?.msg ||
    error?.message ||
    fallback;

  let finalMessage = rawMessage;

  const orderedFields = options.fieldOrder;
  if (
    Array.isArray(orderedFields) &&
    orderedFields.length > 0 &&
    typeof rawMessage === "string"
  ) {
    const parsedErrors = parseFieldErrors(rawMessage);
    if (parsedErrors.length) {
      const orderedError = orderedFields
        .map((field) =>
          parsedErrors.find((errorItem) => errorItem.field === field)
        )
        .find(Boolean);
      finalMessage = orderedError?.message || parsedErrors[0].message;
    }
  }

  uni.showToast({
    title: String(finalMessage || fallback),
    icon: "none",
    duration: 5000,
  });
}

export function useRegionData() {
  const provinceData = ref([]);
  const cityData = ref([]);
  const areaData = ref([]);

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

  function nameToCode(name, type) {
    if (!name) return "";

    if (type === "province") {
      const item = provinceData.value.find((p) => p.name === name);
      return item ? item.code : name;
    } else if (type === "city") {
      const item = cityData.value.find((c) => c.name === name);
      return item ? item.code : name;
    } else if (type === "area") {
      const item = areaData.value.find((a) => a.name === name);
      return item ? item.code : name;
    }
    return name;
  }

  return {
    provinceData,
    cityData,
    areaData,
    loadRegionData,
    codeToName,
    nameToCode,
  };
}

// 校验18位身份证最后一位校验码（ISO 7064:1983.MOD 11-2）
export function checkIdCardCode(idCard) {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard[i]) * weights[i]
  }
  
  const lastCode = codes[sum % 11]
  return idCard[17].toUpperCase() === lastCode
}

// 校验身份证（支持15位和18位）
export function validateIdCard(rule, value, callback) {
  // 15位身份证正则
  const reg15 = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$/
  // 18位身份证正则
  const reg18 = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  
  if (!value) {
      return callback() // 交给 required 处理
  }
  
  const len = value.length
  
  // 长度校验
  if (len !== 15 && len !== 18) {
      return callback(new Error('身份证号码长度应为15位或18位'))
  }
  
  // 格式校验
  if (len === 15) {
      if (!reg15.test(value)) {
          return callback(new Error('15位身份证号码格式不正确'))
      }
  } else {
      if (!reg18.test(value)) {
          return callback(new Error('18位身份证号码格式不正确'))
      }
      // 18位校验最后一位校验码
      if (!checkIdCardCode(value)) {
          return callback(new Error('身份证号码校验码错误'))
      }
  }
  
  callback()
}
