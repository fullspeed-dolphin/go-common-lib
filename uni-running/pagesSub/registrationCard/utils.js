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
  if (idCard.length !== 18) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const num = idCard.charCodeAt(i) - 48; // '0'->48
    if (num < 0 || num > 9) return false; // 非数字
    sum += num * weights[i];
  }
  
  const lastCode = codes[sum % 11];
  return idCard[17].toUpperCase() === lastCode;
}

// 校验身份证
export function validateIdCard(rule, value, callback) {
  if (!value) return callback();
  
  const len = value.length;
  if (len !== 18) {
    return callback(new Error('只支持18位身份证号码'));
  }
  
  const reg18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
  if (!reg18.test(value)) {
    return callback(new Error('身份证号码格式不正确'));
  }
  
  // 日期真实性校验
  const year = parseInt(value.slice(6, 10), 10);
  const month = parseInt(value.slice(10, 12), 10);
  const day = parseInt(value.slice(12, 14), 10);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return callback(new Error('身份证出生日期无效'));
  }
  
  if (!checkIdCardCode(value)) {
    return callback(new Error('身份证校验码错误'));
  }
  
  callback();
}

/**
 * 判断身份证主人是否已满18周岁
 * @param {string} idCard - 18位身份证号码
 * @returns {boolean} - 成年返回true，未成年或无效返回false
 */
export function isAdult(idCard) {
  // 参数校验
  if (!idCard || typeof idCard !== 'string') return false;
  if (idCard.length !== 18) return false;
  
  // 提取出生日期
  const year = parseInt(idCard.slice(6, 10), 10);
  const month = parseInt(idCard.slice(10, 12), 10);
  const day = parseInt(idCard.slice(12, 14), 10);
  
  // 数值有效性校验
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // 计算年龄
  const today = new Date();
  let age = today.getFullYear() - year;
  
  // 今年生日还没过，年龄减1
  if (today.getMonth() < month - 1 || 
      (today.getMonth() === month - 1 && today.getDate() < day)) {
    age--;
  }
  
  return age >= 18;
}