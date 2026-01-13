<template>
  <view :class="'pickerTime ' + (!displayTime ? 'placeholder' : '')">
    <u-cell
      :title="title"
      :required="required"
      :border="false"
      :value="displayTime ? displayTime : placeholder"
      @click="isShowPop = true"
      :isLink="isLink"
    />
    <u-datetime-picker
      :mode="mode"
      :show="isShowPop"
			:minDate="minDate"
			:maxDate="maxDate"
      title="选择时间"
      :filter="filter"
      v-model="timeValue"
      @cancel="isShowPop = false"
      @confirm="confrimTime"
    />
  </view>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";

// Props定义
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  isLink: {
    type: Boolean,
    default: true,
  },
  filter: {
    type: [Function, null],
    default: null,
  },
  minDate: {
    type: [String, Number],
    default: "",
  },
  maxDate: {
    type: [String, Number],
    default: "",
  },
  mode: {
    type: String,
    default: "date",
  },
  placeholder: {
    type: String,
    default: "请选择时间",
  },
  required: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// 响应式数据
const isShowPop = ref(false);
const timeValue = ref("");

// 计算属性
const displayTime = computed(() => {
  if (!timeValue.value) return "";
  return dayjs(timeValue.value).format("YYYY-MM-DD HH:mm");
});

// 监听value变化
watch(
  () => props.modelValue,
  (val) => {
    // 初始化回显UI值
    if (val) {
      timeValue.value = Number(val);
    } else {
      // timeValue.value = "";
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// 方法定义
const open = () => {
  isShowPop.value = true;
};

const confrimTime = (detail) => {
  isShowPop.value = false;
  timeValue.value = detail.value;
  console.log("ti====>", detail, dayjs(detail.value).format("YYYY-MM-DD HH:mm"));
  emit("update:modelValue", String(detail.value));
  emit("change", String(detail.value));
};

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
.pickerTime {
  width: 100%;
  max-width: 100%;
  ::v-deep {
    .u-cell {
      width: 100% !important;
    }
  }
}
</style>
