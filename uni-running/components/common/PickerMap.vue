<template>
  <view :class="'pickermap ' + (!valueString ? 'placeholder' : '')">
    <u-cell
      :title="title"
      titleStyle="min-width:100px;"
      :border="false"
      isLink
      :required="required"
      :value="valueString ? valueString : placeholder"
      @click="chooseLocation"
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
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "请选择",
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
const emit = defineEmits(["input", "change"]);

// 响应式数据
const isShowPop = ref(false);
const valueString = ref(props.value);

// 监听value变化
watch(
  () => props.value,
  (val) => {
    if (String(val)) {
      valueString.value = val;
    } else {
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

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      console.log(res, "返回地址");
      // that.ruleForm.address = res.address;
      // that.ruleForm.latitude = res.latitude;
      // that.ruleForm.longitude = res.longitude;
      valueString.value = res.address;
      emit("input", res.address);

      console.log(res, "返回地址");
      emit("change", `${res.latitude},${res.longitude}`);
    },
    fail: function (e) {
      console.log(e, "报错");
    },
  });
};

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
.pickermap {
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
    .van-cell__title {
      max-width: 200rpx;
      min-width: 130rpx;
      margin-right: 10rpx;
      flex: none;
    }
  }
}
</style>
