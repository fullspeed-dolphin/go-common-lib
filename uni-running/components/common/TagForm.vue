<template>
  <view>
    <u-cell :title="title" title-width="130rpx" :required="required">
      <view class="flex-row-center">
        <view class="flex-item flex-box flex-wrap flex-reverse">
          <view class="ml10 mb10" v-for="(i,j) in tagList" :key="j">
            <u-tag type="primary" plain size="large" :text='i' closable @close="deleteTag(j)" />
          </view>
        </view>
        <view class="link flex-center" style="width:100rpx;" @click="isShowPop = true">
          添加
        </view>
      </view>
    </u-cell>
    <u-popup :show="isShowPop" mode="center" @close="isShowPop = false" z-index="120" closeable>
      <view class="flex-center" style="height: 80rpx;">添加标签</view>
      <view class="popup-con">
        <view class="input-box flex-start u-border-bottom">
          <uni-easyinput v-model="inputValue" type="text" :maxlength="10" placeholder="请输入标签" :clearable="false"></uni-easyinput>
        </view>
        <view style="padding:20rpx;margin-top:10rpx;">
          <u-button shape="circle" type="primary" block @click="submitForm()">确 认</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  options: {
    styleIsolation: "shared",
  },
  data() {
    return {
      isShowPop: false,
      tagList: [],
      inputValue: "",
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.value.split(",");
          this.tagList = list;
        } else {
          this.tagList = [];
          return [];
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    deleteTag(index) {
      this.tagList.splice(index, 1);
      this.$emit("input", this.tagList.join(","));
    },
    submitForm() {
      this.tagList.push(this.inputValue);
      this.inputValue = "";
      this.$emit("input", this.tagList.join(","));
      this.isShowPop = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.input-box {
  margin: 30rpx 30rpx 120rpx;
}
.popup-con {
  min-height: 330rpx;
}
</style>
