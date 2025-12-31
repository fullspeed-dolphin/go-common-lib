
	import request from "@/utils/request.js"

// 缓存已加载的数据
let provinceDataCache = null;
let cityDataCache = null;
let areaDataCache = null;

// 加载 Promise 缓存，避免重复请求
let provinceDataPromise = null;
let cityDataPromise = null;
let areaDataPromise = null;

/**
 * 从网络加载 JSON 数据
 * @param {string} url - JSON 文件 URL
 * @returns {Promise<Object>}
 */
async function loadJsonFromUrl(url) {
  try {
    const response = await request.get(url);
    return response;
  } catch (error) {
    console.error(`加载 JSON 文件失败: ${url}`, error);
    throw error;
  }
}

/**
 * 加载省份数据
 * @returns {Promise<Array>}
 */
export async function loadProvinceData() {
  if (provinceDataCache) {
    return provinceDataCache;
  }
  
  if (provinceDataPromise) {
    return provinceDataPromise;
  }
  
  provinceDataPromise = loadJsonFromUrl(`/province.json`)
    .then((data) => {
      provinceDataCache = data;
      return data;
    })
    .finally(() => {
      provinceDataPromise = null;
    });
  
  return provinceDataPromise;
}

/**
 * 加载城市数据
 * @returns {Promise<Array>}
 */
export async function loadCityData() {
  if (cityDataCache) {
    return cityDataCache;
  }
  
  if (cityDataPromise) {
    return cityDataPromise;
  }
  
  cityDataPromise = loadJsonFromUrl(`/city.json`)
    .then((data) => {
      cityDataCache = data;
      return data;
    })
    .finally(() => {
      cityDataPromise = null;
    });
  
  return cityDataPromise;
}

/**
 * 加载区县数据
 * @returns {Promise<Array>}
 */
export async function loadAreaData() {
  if (areaDataCache) {
    return areaDataCache;
  }
  
  if (areaDataPromise) {
    return areaDataPromise;
  }
  
  areaDataPromise = loadJsonFromUrl(`/area.json`)
    .then((data) => {
      areaDataCache = data;
      return data;
    })
    .finally(() => {
      areaDataPromise = null;
    });
  
  return areaDataPromise;
}

/**
 * 同时加载所有省市区数据
 * @returns {Promise<{province: Array, city: Array, area: Array}>}
 */
export async function loadAllRegionData() {
  const [province, city, area] = await Promise.all([
    loadProvinceData(),
    loadCityData(),
    loadAreaData(),
  ]);
  
  return {
    province,
    city,
    area,
  };
}

/**
 * 清除缓存（如果需要重新加载）
 */
export function clearRegionDataCache() {
  provinceDataCache = null;
  cityDataCache = null;
  areaDataCache = null;
  provinceDataPromise = null;
  cityDataPromise = null;
  areaDataPromise = null;
}
