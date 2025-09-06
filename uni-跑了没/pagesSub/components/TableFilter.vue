<template>
  <view>
    <u-popup :show="isShowPop" mode="bottom" round="15" @close="isShowPop = false" z-index="120" closeable>
      <view class="flex-center van-hairline--bottom" style="height: 96rpx;">
        {{title}}
      </view>
      <view class="popup-con1 p30">
        <view v-for="(item,index) in formFields" :key="index">
          <block v-if="item.inputField === 'field'">
            <u--input :label="item.label" v-model="item.value" :type="item.inputType" :maxlength="item.maxlength" :placeholder="item.placeholder ? item.placeholder : '请输入' + item.label" :border="false"
              :clearable="false"></u--input>
          </block>
          <!-- dropdown 单选 -->
          <block v-if="['Select', 'apiSelect'].includes(item.component) && item.isShow !== false">
            <PickerCell :title="item.label" v-model="item.value" :required="item.required" :columns="item.options || item.componentProps.options" />
          </block>
          <!-- dropdown 多选 -->
          <block v-if="['multiSelect'].includes(item.component)">
            <PickerSelect :title="item.label" v-model="item.value" :custom-class="item.required? 'van-cell--required' : ''" :columns="item.options || item.componentProps.options" />
          </block>
          <!-- DatePicker 单选 -->
          <block v-if="item.component === 'DatePicker' && item.isShow !== false">
            <u-cell :title="item.label" center :custom-class="item.required? 'van-cell--required' : ''">
              <uni-datetime-picker type="datetime" :clear-icon="false" v-model="item.value" />
            </u-cell>
          </block>
          <block v-if="item.component === 'businessHours'">
            <TimeRange :title="item.label" v-model="item.value" :required="item.required" />
          </block>
        </view>

        <view class="flex-box filter-btns u-border">
          <view class="flex-item flex-center" @click="resetFilter">重置</view>
          <view class="flex-item flex-center" @click="confirmFilter">确认</view>
        </view>

      </view>
    </u-popup>
  </view>
</template>
<script>
import { goTableFormPage } from "@/utils/searchSchema.js";
import PickerCell from "@/components/common/PickerCell.vue";
import PickerSelect from "@/components/common/PickerSelect.vue";
export default {
  props: [],
  components: { PickerCell, PickerSelect },
  options: {
    styleIsolation: "shared",
  },
  data() {
    return {
      isShowPop: false,
      cleanerId: "",
      optionList: [],
      formFields: [],
      columns: [],
      title: "",
      initFields: [],
    };
  },
  methods: {
    async open(data) {
      this.title = data.title;
      const fields = await goTableFormPage({
        row: data.row,
        formSchemaName: data.formSchemaName,
      });

      this.isShowPop = true;
      console.log("fields======>", fields);
      this.formFields = JSON.parse(JSON.stringify(fields));
      this.initFields = fields;
    },
    resetFilter() {
      this.formFields.forEach((item) => {
        item.value = "";
        item.valueText = "";
      });
      console.log(this.formFields);
    },
    confirmFilter() {
      let form = {};

      this.formFields.forEach((item) => {
        form[item.field] = item.value;
      });

      console.log(form);
      this.$emit("confirm", form);

      this.isShowPop = false;
    },
    changeInput({ detail }, item, index) {
      item.value = detail;

      this.$set(this.formFields, index, item);
    },
    submitForm() {
      const data = {
        roomId: this.roomId,
        cleanerIdList: [this.cleanerId],
      };

      this.$axios.post("/merchant/admin/room/bindCleaner", data).then((res) => {
        console.log(res);
        this.$toast("操作成功");
        this.isShowPop = false;
        this.$emit("save");
      });
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
::v-deep {
  .is-input-border {
    border: 0;
  }
  .uni-easyinput__content-input {
    height: auto;
    min-height: auto;
    padding: 0 !important;
    text-align: right;
  }
}
.filter-btns {
  margin: 30rpx;
  border-radius: 40px;
  color: $color;
  &:after {
    border-color: $color;
    border-radius: 100px;
  }
  .flex-item {
    height: 80rpx;
    &:last-child {
      color: #fff;
      background: $color;
      overflow: hidden;
      border-radius: 0 40px 40px 0;
    }
  }
}
</style>
