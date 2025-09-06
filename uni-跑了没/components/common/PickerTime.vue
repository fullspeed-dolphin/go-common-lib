<template>
  <view class="">
    <u-cell :title="title" :required="required" :value="timeValue ? timeValue : placeholder" @click="isShowPop = true" isLink />
    <u-datetime-picker mode="time" :show="isShowPop" title="选择时间" v-model="timeValue" @cancel="isShowPop = false" @confirm="confrimTime" />
  </view>
</template>
<script>
export default {
  options: {
    styleIsolation: "shared",
  },
  props: {
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
      type: String,
      default: "12:00",
    },
  },
  data() {
    return {
      isShowPop: false,
      timeValue: "",
    };
  },
  watch: {
    value: {
      handler(val) {
        // 初始化回显UI值
        if (val) {
          this.timeValue = val.slice(0, 5);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    open() {
      this.isShowPop = true;
    },
    confrimTime(detail) {
      this.isShowPop = false;
      this.timeValue = detail.value;
      console.log("time=======>", detail.value);
      this.$emit("input", detail.value + ":00");
    },
  },
};
</script>

<style lang="scss">
</style>
