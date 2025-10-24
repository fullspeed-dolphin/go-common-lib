<template>
  <div>
    <u-cell :title="title" :required="required" titleStyle="min-width:100px;" :value="valueString ? valueString : placeholder" @click="openDialog" :isLink="!disabled" />
    <u-picker v-if="options.length" :title="title" ref="uPicker" :show="isShowPop" :default-index="defaultIndex" :value-key="'text'" @change="onChange" :columns="options" @confirm="confirm" @cancel="isShowPop = false" />
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
  },
  data() {
    return {
      isShowPop: false,
      valueString: "",
      defaultIndex: [0, 0],
      options: [],
    };
  },
  watch: {
    value: {
      handler(val) {
        if (String(val)) {
          // console.log("val======>", val, this.columns);
          const storeInfo = this.columns.find((i) => val === i.id) || {};
          this.valueString = `${storeInfo.merchantName} / ${storeInfo.storeName}`;
        } else {
        }
      },
      deep: true,
      immediate: true,
    },
    columns: {
      handler(val) {
        if (String(val)) {
          let level1 = []; // 第1列
          let level2 = {}; // 第2列
          this.level1 = level1;
          this.level2 = level2;

          const columns = this.columns;

          console.log("columns", columns);
          columns.forEach((item) => {
            const columnIndex = level1.findIndex(
              (i) => i === item.merchantName
            );
            if (columnIndex === -1) {
              level1.push(item.merchantName);
              if (!level2[item.merchantName]) {
                level2[item.merchantName] = [];
              }

              level2[item.merchantName].push(item.label);
            } else {
              if (!level2[level1[columnIndex]]) {
                level2[level1[columnIndex]] = [];
              }

              level2[level1[columnIndex]].push(item.label);
            }
          });

          this.level2 = level2;

          // console.log("level1=====>", level1, level2);

          this.options = [level1, level2[level1[0]]];

          // console.log("option===>", this.options);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    openDialog() {
      if (this.disabled) return;
      this.isShowPop = true;
    },
    onChange(e) {
      const { columnIndex, index } = e;
      // 微信小程序无法将picker实例传出来，只能通过ref操作
      const picker = this.$refs.uPicker;

      // console.log(columnIndex, index);
      // 当第一列值发生变化时，变化第二列(后一列)对应的选项
      if (columnIndex === 0) {
        // picker为选择器this实例，变化第二列对应的选项
        picker.setColumnValues(1, this.level2[this.options[0][index]]);
      }
    },
    confirm(detail) {
      console.log(detail);
      this.valueString = `${detail.value[0]} / ${detail.value[1]}`;
      const storeInfo = this.columns.find(
        (i) => i.storeName === detail.value[1]
      );
      this.$emit("input", storeInfo.id);

      this.$emit("change", storeInfo.merchantId, this.field);

      this.isShowPop = false;
    },
  },
};
</script>

<style lang="scss">
</style>
