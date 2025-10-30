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
            labelWidth="140rpx"
          >
            <up-form-item label="姓名" prop="name">
              <view class="row">
                <up-input
                  v-model="form.name"
                  placeholder="请填写您的真实姓名"
                  border="none"
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
              />
            </up-form-item>

            <up-form-item label="性别" prop="gender">
              <up-radio-group v-model="form.gender" activeColor="#8CC63E">
                <up-radio :name="'male'">男</up-radio>
                <up-radio :name="'female'" style="margin-left: 40rpx"
                  >女</up-radio
                >
              </up-radio-group>
            </up-form-item>

            <up-form-item label="证件类型" prop="idType">
              <up-input
                v-model="form.idType"
                placeholder="身份证"
                border="none"
                disabled
              />
            </up-form-item>

            <up-form-item label="证件号码" prop="idCardNumber">
              <up-input
                v-model="form.idCardNumber"
                placeholder="请填写证件号码"
                border="none"
              />
            </up-form-item>

            <up-form-item label="出生日期" prop="birthday">
              <up-input
                :value="form.birthday || ''"
                placeholder="请选择"
                border="none"
                readonly
                @click="showBirthday = true"
              />
            </up-form-item>

            <up-datetime-picker
              v-model="form.birthday"
              v-model:show="showBirthday"
              mode="date"
              @confirm="onDateConfirm"
            />

            <up-form-item label="手机号码" prop="mobile">
              <up-input
                v-model="form.mobile"
                placeholder="请输入手机号"
                border="none"
                type="number"
              />
            </up-form-item>

            <up-form-item label="邮箱" prop="email">
              <up-input
                v-model="form.email"
                placeholder="请填写"
                border="none"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-title">常住地址</view>
        <view class="section-content">
          <up-form :model="form" labelWidth="140rpx">
            <up-form-item label="国家/地区" prop="country">
              <up-input
                v-model="form.country"
                placeholder="请选择"
                border="none"
              />
            </up-form-item>
            <up-form-item label="省市区" prop="region">
              <up-input
                v-model="form.region"
                placeholder="请选择"
                border="none"
              />
            </up-form-item>
            <up-form-item label="详细地址" prop="address">
              <up-input
                v-model="form.address"
                placeholder="请填写详细地址"
                border="none"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="section">
        <view class="section-title">其他</view>
        <view class="section-content">
          <up-form :model="form" labelWidth="140rpx">
            <up-form-item label="血型" prop="bloodType">
              <up-input
                v-model="form.bloodType"
                placeholder="请选择"
                border="none"
              />
            </up-form-item>
            <up-form-item label="衣服尺寸" prop="clothesSize">
              <up-input
                v-model="form.clothesSize"
                placeholder="请选择"
                border="none"
              />
            </up-form-item>
            <up-form-item label="紧急联系人" prop="emergencyContact">
              <up-input
                v-model="form.emergencyContact"
                placeholder="请填写"
                border="none"
              />
            </up-form-item>
            <up-form-item label="紧急联系人电话" prop="emergencyPhone">
              <up-input
                v-model="form.emergencyPhone"
                placeholder="请填写"
                border="none"
                type="number"
              />
            </up-form-item>
          </up-form>
        </view>
      </view>

      <view class="agree">
        <up-checkbox
          v-model="form.agreed"
          shape="circle"
          activeColor="#8CC63E"
        />
        <view class="agree-text">阅读并同意以下内容</view>
      </view>

      <section class="section-bottom">
        <view style="padding: 30rpx 30rpx 40rpx">
          <u-button
            type="primary"
            color="#FF8C00"
            :disabled="!form.agreed || submitting"
            customStyle="border-radius: 16rpx;"
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

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  mode: { type: String, default: "create" },
});
const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);
const submitting = ref(false);
const showBirthday = ref(false);

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
  padding-bottom: 160rpx;
}
.form {
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
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 0;
  font-size: 28rpx;
  color: #333;
}
.agree-text {
  margin-left: 16rpx;
}
.section-bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 9;
  background: #fff;
}
</style>
