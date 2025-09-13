<!-- 适用于 cell 多选 -->
<template>
  <view>
    <u-cell :title="title" :required="required" :value="selectedLbaels ? selectedLbaels : placeholder" @click="isShowPop = true" isLink />
    <u-popup :show="isShowPop" mode="bottom" round="15">
      <view class="van-picker__toolbar u-border-bottom u-border-top">
        <view class="van-picker__cancel" @click="isShowPop = false, selectedList = []">取消</view>
        <view class="van-picker__title">{{title}}</view>
        <view class="van-picker__confirm" @click="confirm">确认</view>
      </view>
      <view class="popup-con">
        <uni-data-checkbox selectedTextColor="#333" v-model="selectedList" :localdata="columns" multiple selectedColor="rgba(86,188,174, 1)" mode="list"></uni-data-checkbox>
      </view>
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
      default: "请选择",
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
      selectedList: [],
      selectedLbaels: "",
      detail: {
        field: "",
        title: "",
        columns: [],
      },
    };
  },
  watch: {
    value: {
      handler(val) {
        if (String(val)) {
          console.log("String(val)", this.columns, String(val));
          const list = String(val).split(",");
          const string = this.columns
            .filter((i) => list.includes(String(i.value)))
            .map((i) => i.label);
          this.selectedLbaels = string.join(",");
          this.selectedList = list;
        } else {
          this.selectedList = [];
          this.selectedLbaels = "";
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    confirm() {
      const valueText = this.columns
        .filter((i) => this.selectedList.includes(String(i.value)))
        .map((i) => i.label);

      this.$emit("input", this.selectedList.join(","));

      this.$emit("change", this.selectedList, valueText);

      this.isShowPop = false;
      this.selectedList = [];
    },
  },
};
</script>

<style lang="scss" scoped>
.popup-con {
  max-height: 400rpx;
  overflow: auto;
  padding: 20rpx 20rpx;
}
.van-picker__toolbar {
  display: flex;
  justify-content: space-between;
  height: 44px;
  height: var(--picker-toolbar-height, 44px);
  line-height: 44px;
  line-height: var(--picker-toolbar-height, 44px);
}
.van-picker__cancel,
.van-picker__confirm {
  padding: 0 16px;
  padding: var(--picker-action-padding, 0 16px);
  font-size: 14px;
  font-size: var(--picker-action-font-size, 14px);
  color: #1989fa;
  color: var(--picker-action-text-color, #1989fa);
}
.van-picker__title {
  max-width: 50%;
  text-align: center;
  font-weight: 500;
  font-weight: var(--font-weight-bold, 500);
  font-size: 16px;
  font-size: var(--picker-option-font-size, 16px);
}
</style>

