<template>
  <view class="page">
    <Navbar :title="pageTitle" :bgHeight="370" />
    <view class="form">
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="section-content">
          <up-form
            ref="formRef"
            :model="form"
            :rules="rules"
            labelWidth="260rpx"
          >
            <up-form-item label="姓名" prop="name">
              <view class="row">
                <up-input
                  v-model="form.name"
                  placeholder="请填写您的真实姓名"
                  border="none"
                  inputAlign="right"
                />
                <view class="owner">
                  <up-checkbox
                    v-model="form.isOwner"
                    shape="circle"
                    activeColor="#8CC63E"
                    size="16"
                  />
                  <text class="owner-text">本人</text>
                </view>
              </view>
            </up-form-item>

            <up-form-item label="中文拼音" prop="pinyin">
              <up-input
                v-model="form.pinyin"
                placeholder="请填写"
                border="none"
                inputAlign="right"
              />
            </up-form-item>

            <up-form-item label="性别" prop="gender">
              <up-radio-group
                v-model="form.gender"
                activeColor="#8CC63E"
                shape="square"
                customStyle="flex: 0 0 auto; margin-left: auto;"
              >
                <up-radio :name="'male'" label="男" />
                <up-radio :name="'female'" label="女" />
              </up-radio-group>
            </up-form-item>

            <up-form-item label="证件类型" prop="idType">
              <view @click="showIdTypePicker = true">
                <up-input
                  :modelValue="form.idType || ''"
                  placeholder="请选择"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="arrow-right" size="18" color="#999" />
                  </template>
                </up-input>
              </view>
              <up-picker
                v-model="selectedIdType"
                :show="showIdTypePicker"
                :columns="[idTypeOptions]"
                :defaultIndex="idTypeIndex"
                keyName="name"
                valueName="id"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onIdTypeConfirm"
                @cancel="showIdTypePicker = false"
                @close="showIdTypePicker = false"
              />
            </up-form-item>

            <up-form-item label="证件号码" prop="idCardNumber">
              <up-input
                v-model="form.idCardNumber"
                placeholder="请填写证件号码"
                border="none"
                inputAlign="right"
              />
            </up-form-item>

            <up-form-item label="出生日期" prop="birthday">
              <up-datetime-picker
                hasInput
                v-model="form.birthday"
                v-model:show="showBirthday"
                mode="date"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                minDate="1920-01-01"
                maxDate="2025-12-31"
              >
                <template #trigger="{ value }">
                  <up-input
                    :modelValue="value || ''"
                    placeholder="请选择"
                    border="none"
                    inputAlign="right"
                  >
                    <template #suffix>
                      <up-icon name="arrow-right" size="18" color="#999" />
                    </template>
                  </up-input>
                </template>
              </up-datetime-picker>
            </up-form-item>

            <up-form-item label="手机号码" prop="mobile">
              <up-input
                v-model="form.mobile"
                placeholder="请输入手机号"
                border="none"
                type="number"
                inputAlign="right"
              />
            </up-form-item>

            <up-form-item label="邮箱" prop="email">
              <up-input
                v-model="form.email"
                placeholder="请填写"
                border="none"
                inputAlign="right"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-title">常住地址</view>
        <view class="section-content">
          <up-form :model="form" labelWidth="260rpx">
            <up-form-item label="国家/地区" prop="country">
              <view @click="showCountryPicker = true">
                <up-input
                  :modelValue="countryDisplayName"
                  placeholder="请选择"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="arrow-right" size="18" color="#999" />
                  </template>
                </up-input>
              </view>
              <up-picker
                v-model="selectedCountry"
                :show="showCountryPicker"
                :columns="[countryOptions]"
                :defaultIndex="countryIndex"
                keyName="name"
                valueName="id"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onCountryConfirm"
                @cancel="showCountryPicker = false"
                @close="showCountryPicker = false"
              />
            </up-form-item>
            <up-form-item label="省市区" prop="region">
              <view @click="openProvincePicker">
                <up-input
                  :modelValue="regionDisplayName"
                  placeholder="请选择"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="arrow-right" size="18" color="#999" />
                  </template>
                </up-input>
              </view>
              <up-picker
                v-model="selectedProvince"
                :show="showProvincePicker"
                :columns="[provinceOptions]"
                :defaultIndex="provinceIndex"
                keyName="name"
                valueName="code"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onProvinceConfirm"
                @cancel="showProvincePicker = false"
                @close="showProvincePicker = false"
              />
              <up-picker
                v-model="selectedCity"
                :show="showCityPicker"
                :columns="[cityOptions]"
                :defaultIndex="cityIndex"
                keyName="name"
                valueName="code"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onCityConfirm"
                @cancel="showCityPicker = false"
                @close="showCityPicker = false"
              />
              <up-picker
                v-model="selectedArea"
                :show="showAreaPicker"
                :columns="[areaOptions]"
                :defaultIndex="areaIndex"
                keyName="name"
                valueName="code"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onAreaConfirm"
                @cancel="showAreaPicker = false"
                @close="showAreaPicker = false"
              />
            </up-form-item>
            <up-form-item label="详细地址" prop="address">
              <up-input
                v-model="form.address"
                placeholder="请填写详细地址"
                border="none"
                inputAlign="right"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-title">其他</view>
        <view class="section-content">
          <up-form :model="form" labelWidth="260rpx">
            <up-form-item label="血型" prop="bloodType">
              <view @click="showBloodTypePicker = true">
                <up-input
                  :modelValue="bloodTypeDisplayName"
                  placeholder="请选择"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="arrow-right" size="18" color="#999" />
                  </template>
                </up-input>
              </view>
              <up-picker
                v-model="selectedBloodType"
                :show="showBloodTypePicker"
                :columns="[bloodTypeOptions]"
                :defaultIndex="bloodTypeIndex"
                keyName="name"
                valueName="value"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onBloodTypeConfirm"
                @cancel="showBloodTypePicker = false"
                @close="showBloodTypePicker = false"
              />
            </up-form-item>
            <up-form-item label="衣服尺寸" prop="clothesSize">
              <view @click="showTshirtSizePicker = true">
                <up-input
                  :modelValue="tshirtSizeDisplayName"
                  placeholder="请选择"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="arrow-right" size="18" color="#999" />
                  </template>
                </up-input>
              </view>
              <up-picker
                v-model="selectedTshirtSize"
                :show="showTshirtSizePicker"
                :columns="[tshirtSizeOptions]"
                :defaultIndex="tshirtSizeIndex"
                keyName="name"
                valueName="value"
                cancelText="取消"
                confirmText="确认"
                confirmColor="#FF8C00"
                @confirm="onTshirtSizeConfirm"
                @cancel="showTshirtSizePicker = false"
                @close="showTshirtSizePicker = false"
              />
            </up-form-item>
            <up-form-item label="紧急联系人" prop="emergencyContact">
              <up-input
                v-model="form.emergencyContact"
                placeholder="请填写"
                border="none"
                inputAlign="right"
              />
            </up-form-item>
            <up-form-item label="紧急联系人电话" prop="emergencyPhone">
              <up-input
                v-model="form.emergencyPhone"
                placeholder="请填写"
                border="none"
                type="number"
                inputAlign="right"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-content agree">
          <view class="agree-text">
            <span>阅读并同意以下内容</span>
            <up-checkbox
              v-model:checked="form.agreed"
              :usedAlone="true"
              shape="circle"
              activeColor="#8CC63E"
            />
          </view>
          <view class="agree-content"
            >您已知晓您在跑了没录入的参赛人身份信息，并将用于报名
            活动赛事等所有需要实名制的赛事产品，并在您保存时进行
            验证，请确保此信息真实有效。
            跑了没将通过加密等方式保护此信息。</view
          >
        </view>
      </view>

      <section class="section-bottom">
        <view style="padding: 54rpx 48rpx">
          <u-button
            type="primary"
            :color="form.agreed ? '#FF8C00' : '#F2F2F2'"
            :disabled="!form.agreed || submitting"
            :customStyle="buttonCustomStyle"
            @click="onSubmit"
            >保存</u-button
          >
        </view>
      </section>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import Navbar from "@/components/navbar.vue";
import provinceData from "@/static/jsons/province.json";
import cityData from "@/static/jsons/city.json";
import areaData from "@/static/jsons/area.json";

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  mode: { type: String, default: "create" },
});
const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);
const submitting = ref(false);
const showBirthday = ref(false);
const showIdTypePicker = ref(false);
const idTypeIndex = ref([0]);
const selectedIdType = ref([]);
const showCountryPicker = ref(false);
const countryIndex = ref([0]);
const selectedCountry = ref([]);

// 省市区 picker 状态
const showProvincePicker = ref(false);
const provinceIndex = ref([0]);
const selectedProvince = ref([]);
const showCityPicker = ref(false);
const cityIndex = ref([0]);
const selectedCity = ref([]);
const showAreaPicker = ref(false);
const areaIndex = ref([0]);
const selectedArea = ref([]);

// 省市区数据
const provinceOptions = ref([]);
const cityOptions = ref([]);
const areaOptions = ref([]);

// 血型 picker 状态
const showBloodTypePicker = ref(false);
const bloodTypeIndex = ref([0]);
const selectedBloodType = ref([]);

// 衣服尺寸 picker 状态
const showTshirtSizePicker = ref(false);
const tshirtSizeIndex = ref([0]);
const selectedTshirtSize = ref([]);

const defaultForm = {
  name: "",
  isOwner: false,
  pinyin: "",
  gender: "male",
  idType: "身份证",
  idCardNumber: "",
  birthday: "",
  mobile: "",
  email: "",
  country: "",
  region: "",
  address: "",
  bloodType: "",
  clothesSize: "",
  emergencyContact: "",
  emergencyPhone: "",
  agreed: false,
};

const form = reactive({ ...defaultForm, ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return;
    Object.assign(form, defaultForm, val);
  },
  { deep: true }
);

watch(
  () => form,
  () => emit("update:modelValue", { ...form }),
  { deep: true }
);

const pageTitle = computed(() =>
  props.mode === "edit" ? "编辑报名卡" : "添加报名卡"
);

const countryDisplayName = computed(() => {
  if (!form.country) return "";
  const country = countryOptions.find((item) => item.id === form.country);
  return country ? country.name : form.country;
});

const regionDisplayName = computed(() => {
  const parts = [];

  if (selectedProvince.value && selectedProvince.value.length > 0) {
    const province = provinceOptions.value.find(
      (p) => p.code === selectedProvince.value[0]
    );
    if (province) parts.push(province.name);
  }

  if (selectedCity.value && selectedCity.value.length > 0) {
    const city = cityOptions.value.find(
      (c) => c.code === selectedCity.value[0]
    );
    if (city) parts.push(city.name);
  }

  if (selectedArea.value && selectedArea.value.length > 0) {
    const area = areaOptions.value.find(
      (a) => a.code === selectedArea.value[0]
    );
    if (area) parts.push(area.name);
  }

  return parts.join("/");
});

const bloodTypeDisplayName = computed(() => {
  if (!form.bloodType) return "";
  const bloodType = bloodTypeOptions.find(
    (item) => item.value === form.bloodType
  );
  return bloodType ? bloodType.name : form.bloodType;
});

const idTypeOptions = [
  { id: "身份证", name: "身份证" },
  { id: "军官证", name: "军官证" },
  { id: "护照", name: "护照" },
  { id: "港澳居民往来大陆通行证", name: "港澳居民往来大陆通行证" },
  { id: "台胞证", name: "台胞证" },
];

const countryOptions = [
  { id: "China", name: "中国(China)" },
  { id: "HongKong", name: "中国香港(HongKong)" },
  { id: "Macau", name: "中国澳门(Macau)" },
];

const bloodTypeOptions = [
  { name: "A型", value: "A" },
  { name: "B型", value: "B" },
  { name: "AB型", value: "AB" },
  { name: "O型", value: "O" },
];
const tshirtSizeOptions = [
  { name: "120", value: "120" },
  { name: "130", value: "130" },
  { name: "140", value: "140" },
  { name: "XS", value: "XS" },
  { name: "S", value: "S" },
  { name: "M", value: "M" },
  { name: "L", value: "L" },
  { name: "XL", value: "XL" },
  { name: "2XL", value: "2XL" },
  { name: "3XL", value: "3XL" },
  { name: "4XL", value: "4XL" },
];

const tshirtSizeDisplayName = computed(() => {
  if (!form.clothesSize) return "";
  const tshirtSize = tshirtSizeOptions.find(
    (item) => item.value === form.clothesSize
  );
  return tshirtSize ? tshirtSize.name : form.clothesSize;
});

const buttonCustomStyle = computed(() => {
  return `border-radius: 16rpx; font-weight: bold; font-size: 30rpx; ${
    form.agreed ? "color: #ffffff;" : "color: #999999;"
  }`;
});

// 初始化省市区数据
provinceOptions.value = provinceData.map((p) => ({
  code: p.code,
  name: p.name,
}));

// 监听 idType 变化，设置默认 index 和 selectedIdType
watch(
  () => form.idType,
  (val) => {
    if (val) {
      const index = idTypeOptions.findIndex((item) => item.id === val);
      if (index !== -1) {
        idTypeIndex.value = [index];
        selectedIdType.value = [val];
      }
    } else {
      selectedIdType.value = [];
    }
  },
  { immediate: true }
);

// 监听 selectedIdType 变化，同步到 form.idType
watch(
  () => selectedIdType.value,
  (val) => {
    if (val && val.length > 0) {
      form.idType = val[0];
    }
  }
);

function onIdTypeConfirm(e) {
  showIdTypePicker.value = false;
}

// 监听 country 变化，设置默认 index 和 selectedCountry
watch(
  () => form.country,
  (val) => {
    if (val) {
      const index = countryOptions.findIndex((item) => item.id === val);
      if (index !== -1) {
        countryIndex.value = [index];
        selectedCountry.value = [val];
      }
    } else {
      selectedCountry.value = [];
    }
  },
  { immediate: true }
);

// 监听 selectedCountry 变化，同步到 form.country
watch(
  () => selectedCountry.value,
  (val) => {
    if (val && val.length > 0) {
      form.country = val[0];
      // 如果选择了香港或澳门，自动选择对应的省市区
      if (val[0] === "HongKong") {
        selectedProvince.value = ["810000"];
        selectedCity.value = ["810000"];
        selectedArea.value = ["810000"];
      } else if (val[0] === "Macau") {
        selectedProvince.value = ["820000"];
        selectedCity.value = ["820000"];
        selectedArea.value = ["820000"];
      }
    }
  }
);

function onCountryConfirm(e) {
  showCountryPicker.value = false;
}

// 监听 form.region 变化，反向同步到省市区选择器（用于编辑时回显）
// 使用一个标志来避免循环更新
let isUpdatingFromRegion = false;
watch(
  () => form.region,
  (region) => {
    // 如果当前值已经匹配，跳过更新
    const currentRegion = [
      selectedProvince.value[0],
      selectedCity.value[0],
      selectedArea.value[0],
    ]
      .filter(Boolean)
      .join(",");

    if (currentRegion === region) {
      return;
    }

    isUpdatingFromRegion = true;

    if (!region) {
      selectedProvince.value = [];
      selectedCity.value = [];
      selectedArea.value = [];
      isUpdatingFromRegion = false;
      return;
    }

    const parts = region.split(",");
    const provinceCode = parts[0] || "";
    const cityCode = parts[1] || "";
    const areaCode = parts[2] || "";

    // 设置省
    if (provinceCode) {
      const province = provinceOptions.value.find(
        (p) => p.code === provinceCode
      );
      if (province) {
        selectedProvince.value = [provinceCode];
        const pIndex = provinceOptions.value.findIndex(
          (p) => p.code === provinceCode
        );
        if (pIndex !== -1) {
          provinceIndex.value = [pIndex];
        }

        // 加载该省的城市数据
        const provinceDataItem = provinceData.find(
          (p) => p.code === provinceCode
        );
        if (provinceDataItem) {
          cityOptions.value = cityData
            .filter((city) => city.province === provinceDataItem.province)
            .map((city) => ({ code: city.code, name: city.name }));

          // 设置市
          if (cityCode) {
            const cityItem = cityOptions.value.find((c) => c.code === cityCode);
            if (cityItem) {
              selectedCity.value = [cityCode];
              const cIndex = cityOptions.value.findIndex(
                (c) => c.code === cityCode
              );
              if (cIndex !== -1) {
                cityIndex.value = [cIndex];
              }

              // 加载该市的区数据
              const cityDataItem = cityData.find((c) => c.code === cityCode);
              if (cityDataItem) {
                areaOptions.value = areaData
                  .filter(
                    (area) =>
                      area.province === cityDataItem.province &&
                      area.city === cityDataItem.city
                  )
                  .map((area) => ({ code: area.code, name: area.name }));

                // 设置区
                if (areaCode) {
                  const areaItem = areaOptions.value.find(
                    (a) => a.code === areaCode
                  );
                  if (areaItem) {
                    selectedArea.value = [areaCode];
                    const aIndex = areaOptions.value.findIndex(
                      (a) => a.code === areaCode
                    );
                    if (aIndex !== -1) {
                      areaIndex.value = [aIndex];
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    isUpdatingFromRegion = false;
  },
  { immediate: true }
);

// 修改省市区选择变化的watch，避免循环
watch(
  [
    () => selectedProvince.value,
    () => selectedCity.value,
    () => selectedArea.value,
  ],
  ([province, city, area]) => {
    if (isUpdatingFromRegion) return;

    const parts = [];
    if (province && province.length > 0) parts.push(province[0]);
    if (city && city.length > 0) parts.push(city[0]);
    if (area && area.length > 0) parts.push(area[0]);
    form.region = parts.join(",");
  }
);

// 省市区选择函数
function openProvincePicker() {
  showProvincePicker.value = true;
}

function onProvinceConfirm(e) {
  showProvincePicker.value = false;
  // 选择省后，加载该省的城市数据
  if (selectedProvince.value && selectedProvince.value.length > 0) {
    const province = provinceData.find(
      (p) => p.code === selectedProvince.value[0]
    );
    if (province) {
      cityOptions.value = cityData
        .filter((city) => city.province === province.province)
        .map((city) => ({ code: city.code, name: city.name }));

      // 延迟打开城市选择器
      setTimeout(() => {
        showCityPicker.value = true;
      }, 300);
    }
  }
}

function onCityConfirm(e) {
  showCityPicker.value = false;
  // 选择市后，加载该市的区数据
  if (selectedCity.value && selectedCity.value.length > 0) {
    const city = cityData.find((c) => c.code === selectedCity.value[0]);
    if (city) {
      areaOptions.value = areaData
        .filter(
          (area) => area.province === city.province && area.city === city.city
        )
        .map((area) => ({ code: area.code, name: area.name }));

      // 延迟打开区选择器
      setTimeout(() => {
        showAreaPicker.value = true;
      }, 300);
    }
  }
}

function onAreaConfirm(e) {
  showAreaPicker.value = false;
}

// 监听 bloodType 变化，设置默认 index 和 selectedBloodType
watch(
  () => form.bloodType,
  (val) => {
    if (val) {
      const index = bloodTypeOptions.findIndex((item) => item.value === val);
      if (index !== -1) {
        bloodTypeIndex.value = [index];
        selectedBloodType.value = [val];
      }
    } else {
      selectedBloodType.value = [];
    }
  },
  { immediate: true }
);

// 监听 selectedBloodType 变化，同步到 form.bloodType
watch(
  () => selectedBloodType.value,
  (val) => {
    if (val && val.length > 0) {
      form.bloodType = val[0];
    }
  }
);

function onBloodTypeConfirm(e) {
  showBloodTypePicker.value = false;
}

// 监听 clothesSize 变化，设置默认 index 和 selectedTshirtSize
watch(
  () => form.clothesSize,
  (val) => {
    if (val) {
      const index = tshirtSizeOptions.findIndex((item) => item.value === val);
      if (index !== -1) {
        tshirtSizeIndex.value = [index];
        selectedTshirtSize.value = [val];
      }
    } else {
      selectedTshirtSize.value = [];
    }
  },
  { immediate: true }
);

// 监听 selectedTshirtSize 变化，同步到 form.clothesSize
watch(
  () => selectedTshirtSize.value,
  (val) => {
    if (val && val.length > 0) {
      form.clothesSize = val[0];
    }
  }
);

function onTshirtSizeConfirm(e) {
  showTshirtSizePicker.value = false;
}

const rules = {
  name: [
    { required: true, message: "请填写姓名", trigger: ["blur", "change"] },
  ],
  gender: [{ required: true, message: "请选择性别", trigger: ["change"] }],
  idCardNumber: [
    { required: true, message: "请填写证件号码", trigger: ["blur", "change"] },
  ],
  birthday: [
    { required: true, message: "请选择出生日期", trigger: ["change"] },
  ],
  mobile: [
    { required: true, message: "请填写手机号码", trigger: ["blur", "change"] },
  ],
};

function onDateConfirm(e) {
  // up-datetime-picker 已经双向绑定，这里兜底格式化
  if (typeof e?.value === "string") form.birthday = e.value;
}

function onSubmit() {
  if (!form.agreed) return;
  formRef.value?.validate().then(() => {
    submitting.value = true;
    emit("submit", { ...form });
  });
}

onLoad(() => {});
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  padding-bottom: 208rpx;
}
.section {
  padding: 0 34rpx;
}
.section-title {
  font-weight: 500;
  font-size: 24rpx;
  color: #000000;
  padding: 0 10rpx;
  margin: 48rpx 0 30rpx 0;
}
.section-content {
  background: #ffffff;
  padding: 32rpx 20rpx;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #f2f2f2;
}
.row {
  display: flex;
  align-items: center;
}
.owner {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  color: #333;
}
.owner-text {
  margin-left: 10rpx;
  font-size: 26rpx;
}
.agree {
  margin-top: 48rpx;
}
.agree-text {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  font-size: 30rpx;
  color: #000000;
}
.agree-content {
  font-weight: 500;
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
  line-height: 34rpx;
}
.section-bottom {
  margin-top: 48rpx;
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  width: 100%;
  z-index: 9;
}
</style>
