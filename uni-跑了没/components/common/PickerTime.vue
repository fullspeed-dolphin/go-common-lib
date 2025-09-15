<template>
  <view class="pickerTime">
    <u-cell :title="title" :required="required" :border="false"
			:value="displayTime ? displayTime : placeholder" @click="isShowPop = true" isLink />
    <u-datetime-picker mode="date" :show="isShowPop" title="选择时间" v-model="timeValue" @cancel="isShowPop = false" @confirm="confrimTime" />
  </view>
</template>
<script>
import dayjs from "@/uni_modules/uview-ui/libs/util/dayjs.js"
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
      type: [String, Number],
      default: "",
    },
  },
  data() {
    return {
      isShowPop: false,
      timeValue: "",
    };
  },
	computed: {
		displayTime () {
			return dayjs(this.timeValue).format('YYYY-MM-DD');
		}
	},
  watch: {
    value: {
      handler(val) {
        // 初始化回显UI值
        if (val) {
          this.timeValue = dayjs(val).valueOf();
        } else {
					this.timeValue = dayjs().valueOf();
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
      console.log("time=======>", detail);
      this.$emit("input", detail.value);
    },
  },
};
</script>

<style lang="scss">
</style>
