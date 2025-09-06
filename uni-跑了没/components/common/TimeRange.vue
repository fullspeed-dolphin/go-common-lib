<template>
  <view class="">
    <u-cell :title="title" :required="required" :value="timeValue ? timeValue : placeholder" @click="isShowPop = true" isLink />
    <u-popup :show="isShowPop" mode="bottom" round="15">
      <smh-time-range :time="propTime" @confrim="confrimTimeRange" @cancel="isShowPop = false"></smh-time-range>
    </u-popup>
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
      default: "",
    },
  },
  data() {
    return {
      isShowPop: false,
      timeValue: "",
      propTime: ["09", "0", "0", "18", "0"],
    };
  },
  watch: {
    value: {
      async handler(val) {
        // 初始化回显UI值
        if (val && val !== this.timeValue) {
          this.timeValue = val;

          // this.propTime = [val.slice(0,2), val.slice(3,5), '0', val.slice(6,8), val.slice(9,11)]

          // console.log(this.propTime)
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
    confrimTimeRange({ time }) {
      this.isShowPop = false;
      this.timeValue = time;
      console.log("time=======>", time);
      this.$emit("input", time);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .time1 {
    border-radius: 15px;
  }
}
</style>
