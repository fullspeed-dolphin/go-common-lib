<template>
  <view>
    <u-cell
      :title="title"
      :required="required"
      titleStyle="min-width:100px;"
      :value="valueString ? valueString : placeholder"
      @click="openDialog"
      :isLink="!disabled"
    />
    <u-picker
      v-if="options.length"
      :title="title"
      ref="uPicker"
      :show="isShowPop"
      :default-index="defaultIndex"
      :value-key="'text'"
      @change="onChange"
      :columns="options"
      @confirm="confirm"
      @cancel="isShowPop = false"
    />
  </view>
</template>
<script setup>
import { ref, watch } from "vue";

// Props定义
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: "",
  },
  valuekey: {
    // picker column 的显示字段
    type: String,
    default: "label",
  },
  field: {
    // 当前字段
    type: String,
    default: "label",
  },
  value: {
    type: String | Number,
    default: "",
  },
  columns: {
    type: Array,
    default() {
      return [];
    },
  },
});

// Emits
const emit = defineEmits(["input", "change"]);

// 模板引用
const uPicker = ref(null);

// 响应式数据
const isShowPop = ref(false);
const valueString = ref("");
const defaultIndex = ref([0, 0]);
const options = ref([]);
const level1 = ref([]);
const level2 = ref({});

// 监听value变化
watch(
  () => props.value,
  (val) => {
    if (String(val)) {
      // console.log("val======>", val, this.columns);
      const storeInfo = props.columns.find((i) => val === i.id) || {};
      valueString.value = `${storeInfo.merchantName} / ${storeInfo.storeName}`;
    } else {
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// 监听columns变化
watch(
  () => props.columns,
  (val) => {
    if (String(val)) {
      let level1Data = []; // 第1列
      let level2Data = {}; // 第2列
      level1.value = level1Data;
      level2.value = level2Data;

      const columns = props.columns;

      console.log("columns", columns);
      columns.forEach((item) => {
        const columnIndex = level1Data.findIndex(
          (i) => i === item.merchantName
        );
        if (columnIndex === -1) {
          level1Data.push(item.merchantName);
          if (!level2Data[item.merchantName]) {
            level2Data[item.merchantName] = [];
          }

          level2Data[item.merchantName].push(item.label);
        } else {
          if (!level2Data[level1Data[columnIndex]]) {
            level2Data[level1Data[columnIndex]] = [];
          }

          level2Data[level1Data[columnIndex]].push(item.label);
        }
      });

      level2.value = level2Data;

      // console.log("level1=====>", level1, level2);

      options.value = [level1Data, level2Data[level1Data[0]]];

      // console.log("option===>", this.options);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// 方法定义
const openDialog = () => {
  if (props.disabled) return;
  isShowPop.value = true;
};

const onChange = (e) => {
  const { columnIndex, index } = e;
  // 微信小程序无法将picker实例传出来，只能通过ref操作
  const picker = uPicker.value;

  // console.log(columnIndex, index);
  // 当第一列值发生变化时，变化第二列(后一列)对应的选项
  if (columnIndex === 0) {
    // picker为选择器this实例，变化第二列对应的选项
    picker.setColumnValues(1, level2.value[options.value[0][index]]);
  }
};

const confirm = (detail) => {
  console.log(detail);
  valueString.value = `${detail.value[0]} / ${detail.value[1]}`;
  const storeInfo = props.columns.find((i) => i.storeName === detail.value[1]);
  emit("input", storeInfo.id);

  emit("change", storeInfo.merchantId, props.field);

  isShowPop.value = false;
};
</script>

<style lang="scss"></style>
