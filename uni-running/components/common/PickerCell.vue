<template>
  <div>
    <view class="cell-line">
      <u-cell :title="title + ':'" :required="required" :border="border" :value="selected[valuekey] ? selected[valuekey] : placeholder" @click="open()" :isLink="!disabled && !rightIcon">
      </u-cell>
    </view>
    <u-picker :title="'请选择' + title" :show="isShowPop" :defaultIndex="defaultIndex" :keyName="valuekey" :columns="[columns]" @confirm="confirm" @cancel="isShowPop = false" />
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
      type: String | Number,
      default: "",
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isShowPop: false,
      selected: {},
      defaultIndex: [0],
    };
  },
  watch: {
    value: {
      handler(val) {
        this.setDefaultValue();
      },
      deep: true,
      immediate: true,
    },
    columns: {
      handler(columns) {
        this.setDefaultValue();
        // console.log("columns", columns);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    setDefaultValue() {
      if (String(this.value).length && this.columns?.length) {
        const index = this.columns.findIndex(
          (i) => String(i.value) === String(this.value)
        );

        // console.log("index=====>", index)
        if (index !== -1) {
          this.defaultIndex = [index];
          this.selected = this.columns[index];

          // console.log("selected=====>", this.selected)
        }
      } else {
        this.selected = {};
      }
    },
    open() {
      if (this.disabled) return;
      this.isShowPop = true;
    },
    confirm(detail) {
      console.log("detail", detail);
      this.selected = detail.value;
      this.$emit("input", String(detail.value[0].value));

      this.$emit("change", detail.value[0], this.field);

      this.isShowPop = false;
    },
  },
};
</script>

<style lang="scss">
</style>
