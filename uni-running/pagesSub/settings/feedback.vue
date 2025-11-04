<template>
  <view class="page">
    <u-navbar autoBack placeholder title="意见反馈"></u-navbar>
    <view style="padding: 20rpx 34rpx">
      <u-form
        :model="form"
        ref="uForm"
        :rules="rules"
        labelWidth="auto"
        labelPosition="top"
      >
        <u-form-item label="反馈类型（必填）" prop="checked">
          <u-checkbox-group
            v-model="form.checked"
            iconPlacement="right"
            activeColor="#FF8C00"
            inactiveColor="#000"
            placement="column"
          >
            <u-checkbox
              labelColor="#000"
              :label="item.text"
              :name="item.value"
              v-for="(item, index) in issueTypeOptions"
              :key="index"
            ></u-checkbox>
          </u-checkbox-group>
        </u-form-item>

        <view class="u-border-top mt20" style="opacity: 0.3"></view>

        <view class="u-textarea">
          <u-form-item label="请补充详细问题和意见（必填）" prop="description">
            <u-textarea
              v-model="form.description"
              height="300"
              border="none"
              maxlength="240"
              autoHeight
              placeholder="请输入不少于10字的描述"
              count
            ></u-textarea>
          </u-form-item>
        </view>
      </u-form>

      <view class="" style="padding: 26rpx 120rpx 0">
        <u-button type="primary" shape="circle" @click="submitForm()"
          >提交</u-button
        >
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { getCurrentInstance } from "vue";
import FileUploader from "@/components/common/fileUploader.vue";

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 模板引用
const uForm = ref(null);

// 响应式数据
const form = ref({
  checked: [],
  description: "",
});
const issueTypeOptions = ref([
  { text: "功能异常：功能故障或不可用", value: 1 },
  { text: "产品建议：我有新创意/想法/意见", value: 2 },
  { text: "安全问题：密码/隐私/欺诈等", value: 3 },
  { text: "流程问题：加载慢/提示错误/页面卡顿等", value: 4 },
  { text: "其他", value: 5 },
]);
const rules = ref({
  checked: [
    {
      type: "array",
      min: 1,
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  description: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
});

// 方法定义
const submitForm = () => {
  uForm.value.validate().then((res) => {
    const token = uni.getStorageSync("token");
    if (!token) {
      proxy.$toast("请先登录~");
      setTimeout(() => {
        proxy.$goUrl("/pagesSub/login");
      }, 1000);
      return;
    }

    // if (!this.isAgree.length) return this.$toast('请勾选同意协议')

    const data = {
      Account: form.value.name,
      Password: form.value.password,
    };
    uni.showLoading({
      mask: true,
    });
    proxy.$axios.post(`/api/store/login`, data).then((res) => {
      console.log(res);

      proxy.$toast("提交成功");

      setTimeout((res) => {
        uni.navigateBack();
      }, 300);
    });
  });
};
</script>

<style lang="less" scoped>
.submit-btn {
  width: 682rpx;
  height: 72rpx;
  margin: 48rpx auto;
  border-radius: 16rpx;
  font-weight: bold;
  font-size: 30rpx;
  color: #ff8c00;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep {
  .u-form-item__body__left__content__label {
    font-size: 24rpx;
    color: #4c4c4c;
    margin-bottom: 20rpx;
  }
  .u-checkbox-group {
    width: 100%;
  }
  .u-checkbox {
    margin-bottom: 30rpx;
  }
  .u-form-item__body {
    padding-bottom: 0;
  }

  .u-form-item__body__right__message {
    margin-left: 0 !important;
    margin-top: 6rpx;
  }

  .u-textarea {
    border: 0;
    min-height: 450rpx;
    box-shadow: 0rpx 6rpx 10rpx 2rpx rgba(0, 0, 0, 0.16);
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }

  .input-placeholder {
    font-size: 24rpx;
    color: rgb(192, 196, 204);
  }
}
</style>
