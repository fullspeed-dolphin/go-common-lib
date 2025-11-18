import { ref } from "vue";
import {
  loadProvinceData,
  loadCityData,
  loadAreaData,
} from "@/utils/regionData.js";

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
