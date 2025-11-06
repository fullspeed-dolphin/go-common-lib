<template>
  <view class="pickerTime">
    <u-cell
      :title="title"
      :required="required"
      :border="false"
      :value="displayTime ? displayTime : placeholder"
      @click="isShowPop = true"
      isLink
    />
    <u-datetime-picker
      mode="date"
      :show="isShowPop"
      title="选择时间"
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
  value: {
    type: [String, Number],
    default: "",
  },
});

// Emits
const emit = defineEmits(["input"]);

// 响应式数据
const isShowPop = ref(false);
const timeValue = ref("");

// 计算属性
const displayTime = computed(() => {
  return dayjs(timeValue.value).format("YYYY-MM-DD");
});

// 监听value变化
watch(
  () => props.value,
  (val) => {
    // 初始化回显UI值
    if (val) {
      timeValue.value = dayjs(val).valueOf();
    } else {
      timeValue.value = dayjs().valueOf();
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
  console.log("time=======>", detail);
  emit("input", detail.value);
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
  display: block;
  box-sizing: border-box;
  ::v-deep {
    .u-cell {
      width: 100% !important;
      max-width: 100% !important;
      display: block !important;
      box-sizing: border-box !important;
    }
  }
}
</style>
