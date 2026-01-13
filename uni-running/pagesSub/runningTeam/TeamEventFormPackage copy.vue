<template>
	<view class="u-mb-30 u-mt-30 flex-between-center">
		<div>设置套餐信息</div>
		<div><u-button type="success" size="small" @click="addPackage">
      + 新增套餐
    </u-button></div>
	</view>
  <u-form :model="form" :rules="formRules" ref="formRef" labelWidth="auto">
    <view v-for="(item, index) in form.packages" :key="index" class="package-item panel-section u-mb-20">
      <!-- 套餐名称 -->
      <u-form-item :label="`套餐${form.packages > 1 ? index + 1 : ''}名称`" :prop="`packages[${index}].name`" required>
        <u-input v-model="item.name" placeholder="请输入名称" @input="validateField(`packages[${index}].name`)" />
      </u-form-item>

      <!-- 价格 -->
      <u-form-item :label="`价格(元)`" :prop="`packages[${index}].price`" required>
        <input v-model="item.price" type="number" placeholder="请输入价格" @input="validateField(`packages[${index}].price`)"/>
      </u-form-item>

      <!-- 可报名人数 -->
      <u-form-item :label="`报名卡数`" :prop="`packages[${index}].signers`" required>
        <input v-model="item.signers" type="number" placeholder="一个套餐应该可以设置几张报名卡" @input="validateField(`packages[${index}].signers`)"/>
      </u-form-item>

      <!-- 套餐库存 -->
      <u-form-item :label="`套餐库存`" :prop="`packages[${index}].capacity`" required>
        <input v-model="item.capacity" type="number" placeholder="请输入套餐库存" @input="validateField(`packages[${index}].capacity`)"/>
      </u-form-item>

      <!-- 删除按钮（至少保留一个） -->
      <u-button v-if="form.packages.length > 1" type="error" size="small" @click="removePackage(index)" style="margin-top: 10rpx;">
        删除此套餐
      </u-button>
    </view>

    
  </u-form>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

// 表单数据
const form = reactive({
  packages: [{ name: "", price: "", signers: "", capacity: "" }],
});

// 动态规则对象
const formRules = reactive({});

// 表单引用
const formRef = ref();

// 初始化规则（根据当前 packages 生成）
const initRules = () => {
  const newRules = {};
  form.packages.forEach((_, index) => {
    newRules[`packages[${index}].name`] = [
      {
        required: true,
        message: "请输入套餐名称",
        trigger: ["blur", "change"],
      },
    ];
    newRules[`packages[${index}].price`] = [
      { required: true, message: "请输入价格", trigger: ["blur", "change"] },
      {
        pattern: /^\d+(\.\d{1,2})?$/,
        message: "价格格式不正确",
        trigger: "blur",
      },
    ];
    newRules[`packages[${index}].signers`] = [
      {
        required: true,
        message: "请输入报名卡数",
        trigger: ["blur", "change"],
      },
      { pattern: /^[1-9]\d*$/, message: "必须为正整数", trigger: "blur" },
    ];
    newRules[`packages[${index}].capacity`] = [
      {
        required: true,
        message: "请输入最大容量",
        trigger: ["blur", "change"],
      },
      { pattern: /^[1-9]\d*$/, message: "必须为正整数", trigger: "blur" },
    ];
  });
  Object.assign(formRules, newRules);
};

function validateField(propName) {
	formRef.value.validateField(propName, () => {}, "change");
}

// 监听 packages 变化，自动更新 rules
watch(
  () => form.packages,
  () => {
    initRules();
  },
  { deep: true, immediate: true }
);

// 新增套餐
const addPackage = () => {
  form.packages.push({ name: "", price: "", signers: "", capacity: "" });
  // watch 会自动触发 initRules
};

// 删除套餐
const removePackage = (index) => {
  if (form.packages.length <= 1) {
    // useToast().warning('至少保留一个套餐')
    return;
  }
  form.packages.splice(index, 1);
};

// 提交
const submitForm = async () => {
  try {
    await formRef.value.validate();

    // 格式化为最终对象
    const result = {};
    form.packages.forEach((item) => {
      result[item.name] = {
        price: parseFloat(item.price),
        signers: parseInt(item.signers, 10),
        capacity: parseInt(item.capacity, 10),
      };
    });

    console.log("提交数据:", result);
    // useToast().success('提交成功！')
  } catch (errors) {
    console.error(errors)
  }
};

// 暴露方法给父组件
defineExpose({
  submitForm,
});
</script>

<style lang="less" scoped>
.package-manager {
  padding: 20rpx;

  .package-item {
    margin-bottom: 30rpx;
    position: relative;
    padding-bottom: 60rpx;
  }

  .delete-btn {
    position: absolute;
    bottom: 10rpx;
    right: 20rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .delete-text {
    color: #ff4d4f;
    font-size: 24rpx;
  }
}
</style>