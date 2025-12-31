<template>
  <view class="page">
    <u-navbar :title="pageTitle" placeholder />
    <view class="form container">
      <view class="section">
        <view class="section-content">
          <up-form
            ref="formRef"
            :model="form"
            :rules="rules"
            labelWidth="200rpx"
          >
            <up-form-item label="联系人" prop="name">
              <up-input
                v-model="form.name"
                placeholder="姓名"
                border="none"
                inputAlign="right"
              />
            </up-form-item>

            <up-form-item label="手机号码" prop="phone">
              <up-input
                v-model="form.phone"
                placeholder="请输入手机号码"
                border="none"
                inputAlign="right"
                type="number"
              />
            </up-form-item>

            <up-form-item label="地区信息" prop="region">
              <view @click="handleChooseLocation">
                <up-input
                  :modelValue="form.region || ''"
                  placeholder="地区信息"
                  border="none"
                  inputAlign="right"
                  readonly
                >
                  <template #suffix>
                    <up-icon name="map" size="20" color="#FF8C00" />
                  </template>
                </up-input>
              </view>
            </up-form-item>

            <up-form-item label="详细地址" prop="detailAddress">
              <up-input
                v-model="form.detailAddress"
                placeholder="街道门牌信息"
                border="none"
                inputAlign="right"
              />
            </up-form-item>

            <up-form-item label="邮政编码" prop="postalCode">
              <up-input
                v-model="form.postalCode"
                placeholder="邮政编码"
                border="none"
                inputAlign="right"
                type="number"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-content paste-section">
          <textarea
            v-model="pasteText"
            class="paste-textarea"
            placeholder=""
            @blur="handlePasteRecognize"
          />
          <view class="paste-section-bottom-text" @click="handlePaste"
            >粘贴并识别地址</view
          >
        </view>
      </view>

      <section class="section-bottom">
        <view>
          <u-button
            type="primary"
            color="#FF8C00"
            :customStyle="buttonCustomStyle"
            :disabled="submitting"
            @click="handleSubmit"
            shape="circle"
            >确定</u-button
          >
        </view>
      </section>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, reactive } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "create", // create or edit
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);
const submitting = ref(false);
const pasteText = ref("");

const pageTitle = computed(() => {
  return props.mode === "edit" ? "编辑地址" : "添加地址";
});

const defaultForm = {
  name: "",
  phone: "",
  region: "",
  detailAddress: "",
  postalCode: "",
  latitude: "",
  longitude: "",
};

const form = reactive({ ...defaultForm, ...props.modelValue });

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: "请输入联系人姓名",
      trigger: "blur",
    },
  ],
  phone: [
    {
      required: true,
      message: "请输入手机号码",
      trigger: "blur",
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  region: [
    {
      required: true,
      message: "请选择地区信息",
      trigger: "change",
    },
  ],
  detailAddress: [
    {
      required: true,
      message: "请输入详细地址",
      trigger: "blur",
    },
  ],
};

// 监听外部传入的 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return;
    Object.assign(form, defaultForm, newVal);
  },
  { deep: true }
);

// 监听 form 变化，同步到外部
watch(
  () => form,
  () => emit("update:modelValue", { ...form }),
  { deep: true }
);

// 选择地址位置
const handleChooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      console.log("选择地址成功:", res);
      form.value.region = res.address;
      form.value.latitude = res.latitude;
      form.value.longitude = res.longitude;

      // 如果详细地址为空，可以使用地址详情填充
      if (!form.value.detailAddress && res.name) {
        form.value.detailAddress = res.name;
      }
    },
    fail: (err) => {
      console.error("选择地址失败:", err);
      if (err.errMsg && !err.errMsg.includes("cancel")) {
        uni.showToast({
          title: "选择地址失败",
          icon: "none",
        });
      }
    },
  });
};

const handlePaste = () => {
  uni.getClipboardData({
    success: (res) => {
      pasteText.value = res.data;
      handlePasteRecognize();
      uni.showToast({
        title: "粘贴成功",
        icon: "success",
      });
    },
    fail: () => {
      uni.showToast({
        title: "粘贴失败",
        icon: "none",
      });
    },
  });
};
// 粘贴并识别地址
const handlePasteRecognize = () => {
  if (!pasteText.value.trim()) {
    return;
  }

  // 简单的地址识别逻辑
  // 可以根据实际需求使用更复杂的地址解析库
  const text = pasteText.value.trim();

  // 尝试提取邮政编码（6位数字）
  const postalCodeMatch = text.match(/\d{6}/);
  if (postalCodeMatch && !form.value.postalCode) {
    form.value.postalCode = postalCodeMatch[0];
  }

  // 尝试提取手机号
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch && !form.value.phone) {
    form.value.phone = phoneMatch[0];
  }

  // 尝试提取姓名（通常在开头）
  const nameMatch = text.match(/^[\u4e00-\u9fa5]{2,4}/);
  if (nameMatch && !form.value.name) {
    form.value.name = nameMatch[0];
  }

  // 将地址信息填充到对应字段
  // 这里可以根据实际需求调整解析逻辑
  if (!form.value.region || !form.value.detailAddress) {
    // 简单的地址分割逻辑
    const addressParts = text.split(/省|市|区|县|街道|路|号/);
    if (addressParts.length > 0 && !form.value.region) {
      form.value.region = addressParts[0] + (addressParts[1] || "");
    }
    if (!form.value.detailAddress) {
      form.value.detailAddress = text;
    }
  }

  uni.showToast({
    title: "地址已识别",
    icon: "success",
  });

  // 清空粘贴区域
  pasteText.value = "";
};

const buttonCustomStyle = computed(() => {
  return `border-radius: 16rpx; font-weight: bold; font-size: 30rpx; color: #ffffff;`;
});

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate().then(() => {
    submitting.value = true;
    // 准备提交数据
    const submitData = {
      name: form.value.name,
      phone: form.value.phone,
      region: form.value.region,
      detailAddress: form.value.detailAddress,
      postalCode: form.value.postalCode,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    };
    // 触发提交事件
    emit("submit", submitData);
  });
};
</script>

<style lang="less" scoped>
.page {
  background: #fafafa;
  padding-bottom: 208rpx;
}
.section-content {
  background: #ffffff;
  padding: 32rpx 20rpx;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #f2f2f2;
}

.paste-section {
  position: relative;
  min-height: 200rpx;
  padding: 20rpx;
  position: relative;
  background: #f7f7f7;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  margin-top: 48rpx;
}

.paste-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  background: transparent;
}

.section-bottom {
  position: fixed;
  left: 0;
  bottom: env(safe-area-inset-bottom);
  z-index: 10;
  width: 100%;
  padding: 48rpx 32rpx;
}
.paste-section-bottom-text {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  font-weight: bold;
  font-size: 28rpx;
  color: #606791;
}
</style>
