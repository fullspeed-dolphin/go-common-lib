<template>
	<view>
		<view class="u-mb-30 u-mt-30 flex-between-center">
		<div>设置套餐信息</div>
		<div><u-button type="success" size="small" @click="addPackage">
      + 新增套餐
    </u-button></div>
	</view>
  <u-form :model="form" :rules="formRules" ref="formRef" labelWidth="auto">
    <view v-for="(item, index) in form.packages" :key="item.id" class="package-item panel-section u-mb-20">
      <!-- 套餐名称 -->
      <u-form-item :label="`套餐${form.packages.length > 1 ? index + 1 : ''}名称`" :prop="`packages[${index}].name`" required>
        <input v-model="item.name" placeholder="请输入名称" @input="clearFieldValidate(index, `name`)" />
      </u-form-item>

      <!-- 价格 -->
      <u-form-item :label="`价格(元)`" :prop="`packages[${index}].price`" required>
        <input v-model="item.price" type="number" placeholder="请输入价格" @input="clearFieldValidate(index, `price`)"/>
      </u-form-item>

      <!-- 可报名人数 -->
      <u-form-item :label="`报名卡数`" :prop="`packages[${index}].signers`">
        <input v-model="item.signers" type="number" placeholder="默认为1" @input="clearFieldValidate(index, `signers`)"/>
      </u-form-item>

      <!-- 套餐库存 -->
      <u-form-item :label="`套餐库存`" :prop="`packages[${index}].capacity`">
        <input v-model="item.capacity" type="number" placeholder="留空表示不限制" @input="clearFieldValidate(index, `capacity`)"/>
      </u-form-item>

      <!-- 删除按钮（至少保留一个） -->
      <u-button v-if="form.packages.length > 1" type="error" size="small" @click="removePackage(index)" style="margin-top: 10rpx;">
        删除此套餐
      </u-button>
    </view>

		 <!-- <u-button type="primary" @click="submitForm" :disabled="form.packages.length === 0">
        {{ form.packages.length === 0 ? '至少添加一个套餐' : '提交修改' }}
      </u-button> -->
  </u-form>

	<!-- 底部提示 -->
	<view class="panel-section" style="margin-top: 30rpx;text-align:left;">
		<view style="font-size: 32rpx;margin-bottom: 20rpx;color:rgb(255, 140, 0);">提示：</view>
		<view style="color:#777;font-size:24rpx;line-height: 1.3;">
			<view class="u-flex-row"><view style="width:30rpx;">1、</view><view>如果没有报名卡限制，报名卡数设置为1或留空</view></view>
			<view class="u-flex-row"><view style="width:30rpx;">2、</view><view>如果套餐库存没有上限，留空即可</view></view>
		</view>
	</view>
	</view>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import request from "@/utils/request.js";

// 接收父组件传递的 eventId（编辑模式）
const props = defineProps({
  eventId: {
    type: String,
    default: ''
  }
});

// 表单数据（使用 ref 以便在脚本中显式使用 .value）
const form = ref({
  packages: [{ id: Date.now(), name: "", price: "", signers: "", capacity: "" }],
});

// 动态规则对象
const formRules = ref({
});

// 表单引用
const formRef = ref();

// 初始化/更新校验规则
const initRules = () => {
  const newRules = {}
  form.value.packages.forEach((_, index) => {
    newRules[getFieldPath(index, 'name')] = [
      { required: true, message: '请输入套餐名称', trigger: ["blur", "change"] }
    ]
    newRules[getFieldPath(index, 'price')] = [
      { required: true, message: '请输入价格', trigger: ["blur", "change"] },
      { pattern: /^\d+(\.\d{1,2})?$/, message: '价格格式不正确（最多两位小数）', trigger: ["blur", "change"] }
    ]
    // signers 和 capacity 为可选字段，仅在有值时校验格式
    newRules[getFieldPath(index, 'signers')] = [
      { pattern: /^[1-9]\d*$/, message: '必须为正整数', trigger: ["blur", "change"] }
    ]
    newRules[getFieldPath(index, 'capacity')] = [
      { pattern: /^[1-9]\d*$/, message: '必须为正整数', trigger: ["blur", "change"] }
    ]
  })

	formRules.value = newRules
}

// 生成字段路径，如 "packages[0].name"
const getFieldPath = (index, field) => {
  return `packages[${index}].${field}`
}
const clearFieldValidate = (index, field) => {
  const path = getFieldPath(index, field)
  formRef.value?.clearValidate(path)
}

function validateField(propName) {
  if (!formRef.value) return;

	console.log("propName=====>", propName)
  // 直接触发单字段校验，库实现会根据规则更新错误显示
  try {
		formRef.value.validateField(propName, () => {});
  } catch (e) {
    // 一些环境下 validateField 可能是异步或返回 Promise
    // 若抛错则尝试兼容调用签名
    if (typeof formRef.value.validateField === 'function') {
      formRef.value.validateField(propName, () => {});
    }
  }
}

// 监听 packages 数组长度变化，自动更新 rules（不监听内容变化，避免输入时重复触发验证）
watch(
  () => form.value.packages.length,
  () => {
    initRules();
  },
  { immediate: true }
);

// 新增套餐
const addPackage = () => {
  form.value.packages.push({ id: Date.now(), name: "", price: "", signers: "", capacity: "" });
};

// 删除套餐
const removePackage = (index) => {
  form.value.packages.splice(index, 1);
};

// 自定义验证单个套餐
const validatePackage = (item, index) => {
  const errors = []

  if (!item.name || !item.name.trim()) {
    errors.push({ field: `packages[${index}].name`, message: '请输入套餐名称' })
  }

  if (!item.price && item.price !== 0) {
    errors.push({ field: `packages[${index}].price`, message: '请输入价格' })
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(item.price))) {
    errors.push({ field: `packages[${index}].price`, message: '价格格式不正确（最多两位小数）' })
  }

  // signers 和 capacity 为可选字段，仅在有值时校验格式
  if (item.signers && !/^[1-9]\d*$/.test(String(item.signers))) {
    errors.push({ field: `packages[${index}].signers`, message: '报名卡数必须为正整数' })
  }

  if (item.capacity && !/^[1-9]\d*$/.test(String(item.capacity))) {
    errors.push({ field: `packages[${index}].capacity`, message: '套餐库存必须为正整数' })
  }

  return errors
}

// 提交
const submitForm = async () => {
  console.log("form.packages=====>", form.value.packages)
	// await formRef.value.validate();
  // 自定义验证所有套餐
  const allErrors = []
  form.value.packages.forEach((item, index) => {
    const errors = validatePackage(item, index)
    allErrors.push(...errors)
  })

  if (allErrors.length > 0) {
    console.error("验证失败:", allErrors)
    // 显示第一个错误
    uni.showToast({ title: allErrors[0].message, icon: 'none' })
    return { success: false, errors: allErrors }
  }

  // 格式化为最终对象
  const result = {};
  form.value.packages.forEach((item) => {
    const packageData = {
      price: parseFloat(item.price),
      signers: item.signers ? parseInt(item.signers, 10) : 1, // 默认为 1
    };
    // capacity 有值时才传，为空表示不限制
    if (item.capacity) {
      packageData.capacity = parseInt(item.capacity, 10);
    }
    result[item.name] = packageData;
  });

  console.log("提交数据:", result);
  return { success: true, data: result }
};

// 加载套餐数据（编辑时回显）
const loadTicketData = async (eventId) => {
  if (!eventId) return
  try {
    const res = await request.get('/event-api/ticket_type', { event_id: eventId })
    console.log('套餐 API 响应:', res)

    // API 返回 { ticket_types: [{ price: {...} }] }
    const ticketData = res?.ticket_types?.[0]
    if (ticketData?.price) {
      const priceObj = typeof ticketData.price === 'string' ? JSON.parse(ticketData.price) : ticketData.price
      const newPackages = Object.entries(priceObj).map(([name, data], idx) => ({
        id: Date.now() + idx,
        name,
        price: String(data.price ?? ''),
        signers: data.signers != null ? String(data.signers) : '',
        capacity: data.capacity != null ? String(data.capacity) : ''
      }))
      // 使用 splice 确保响应式更新
      form.value.packages.splice(0, form.value.packages.length, ...newPackages)
    }
  } catch (e) {
    console.error('加载套餐数据失败', e)
  }
}

// 组件挂载时，如果有 eventId 则自动加载套餐数据
onMounted(() => {
  if (props.eventId) {
    loadTicketData(props.eventId)
  }
})

// 暴露方法给父组件
defineExpose({
  submitForm
});
</script>

<style lang="scss">

</style>