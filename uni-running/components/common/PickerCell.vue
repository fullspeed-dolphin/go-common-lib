<template>
		<u-cell
			:customClass="'picker-cell '+  (!selected[valuekey] ? 'placeholder' : '')"
			:title="title"
			:required="required"
			:border="border"
			:value="selected[valuekey] ? selected[valuekey] : placeholder"
			@click="open()"
			:isLink="!disabled && !rightIcon"
		>
		</u-cell>
    <u-picker
			round="14"
      :title="'请选择' + (title || '')"
      :show="isShowPop"
      :defaultIndex="defaultIndex"
      :keyName="valuekey"
      :columns="[columns]"
      @confirm="confirm"
      @cancel="isShowPop = false"
    />
</template>
<script setup>
import { ref, watch } from "vue";

// Props定义
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "bottom",
  },
  rightIcon: {
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
  border: {
    type: Boolean,
    default: true,
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
    type: [String, Number],
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

// 响应式数据
const isShowPop = ref(false);
const selected = ref({});
const defaultIndex = ref([0]);

// 监听value变化
watch(
  () => props.value,
  (val) => {
    setDefaultValue();
  },
  {
    deep: true,
    immediate: true,
  }
);

// 监听columns变化
watch(
  () => props.columns,
  (columns) => {
    setDefaultValue();
    // console.log("columns", columns);
  },
  {
    deep: true,
    immediate: true,
  }
);

// 方法定义
function setDefaultValue () {
  if (String(props.value).length && props.columns?.length) {
    const index = props.columns.findIndex(
      (i) => String(i.value) === String(props.value)
    );

    // console.log("index=====>", index)
    if (index !== -1) {
      defaultIndex.value = [index];
      selected.value = props.columns[index];

      // console.log("selected=====>", selected.value)
    }
  } else {
    selected.value = {};
  }
};

const open = () => {
  if (props.disabled) return;
  isShowPop.value = true;
};

const confirm = (detail) => {
  console.log("detail", detail);
  selected.value = detail.value[0];
  emit("input", String(detail.value[0].value));

  emit("change", detail.value[0], props.field);

  isShowPop.value = false;
};

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<style lang="scss">
		.picker-cell{
			&.placeholder{
				.u-cell__value{
					color: #BFBFBF;
					font-size: 26rpx;
				}
			}
		}
</style>
