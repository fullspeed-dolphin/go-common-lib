<template>
  <div class="pickermap">
    <u-cell :title="title" titleStyle="min-width:100px;" :border="false" isLink :required="required" :value="valueString ? valueString : placeholder" @click="chooseLocation" />
  </div>
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
      type: String | Number,
      default: "",
    },
  },
  data() {
    return {
      isShowPop: false,
      valueString: this.value,
    };
  },
  watch: {
    value: {
      handler(val) {
        if (String(val)) {
        } else {
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
    chooseLocation() {
      const that = this;
      uni.chooseLocation({
        success: (res) => {
          console.log(res, "返回地址");
          // that.ruleForm.address = res.address;
          // that.ruleForm.latitude = res.latitude;
          // that.ruleForm.longitude = res.longitude;
          this.valueString = res.address;
          this.$emit("input", res.address);

          console.log(res, "返回地址");
          this.$emit("change", `${res.latitude},${res.longitude}`);
        },
        fail: function (e) {
          console.log(e, "报错");
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .van-cell__title {
    max-width: 200rpx;
    min-width: 130rpx;
    margin-right: 10rpx;
    flex: none;
  }
}
</style>
