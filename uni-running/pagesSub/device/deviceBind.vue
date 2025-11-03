<template>
  <view>
    <Navbar title="添加设备" :bgHeight="370" />
    <view class="" style="padding-top: 50rpx">
      <view
        v-if="options.value"
        class="flex-center"
        style="margin-bottom: 50rpx"
      >
        <image
          v-if="options.value.includes('华为')"
          class="poster"
          src="/static/images/华为运动健康@2x.png"
          mode="aspectFill"
        ></image>
        <image
          v-if="options.value.includes('佳明')"
          class="poster"
          src="/static/images/佳明@2x.png"
          mode="aspectFill"
        ></image>
        <image
          v-if="options.value.includes('高驰')"
          class="poster"
          src="/static/images/高驰@2x.png"
          mode="aspectFill"
        ></image>
      </view>
      <view class="text" style="padding: 0 64rpx">
        <rich-text :nodes="textContent"></rich-text>
      </view>
    </view>

    <section class="section-bottom">
      <view style="padding: 56rpx 54rpx 40rpx">
        <u-button
          type="primary"
          color="#FF8C00"
          customStyle="border-radius: 16rpx;"
          @click="bindDevice()"
          >立即绑定</u-button
        >
      </view>
    </section>

    <CommonDialog ref="refCommonDialog">
      <view class="" style="width: 642rpx">
        <view
          class="flex-center"
          style="font-weight: bold; height: 100rpx; font-size: 34rpx"
          >绑定说明</view
        >
        <view
          class=""
          style="color: #707070; line-height: 45rpx; padding: 20rpx 30rpx"
        >
          由于小程序限制，<text class="txt">需要在手机浏览器中完成绑定</text
          >。请按下面步骤继续操作：
          <view class=""
            >1、点击下方 <text class="txt">“复制绑定链接”</text></view
          >
          <view class="">2、打开手机浏览器</view>
          <view class=""
            >3、<text class="txt"
              >点击浏览器地址栏，长按、粘贴，打开链接</text
            ></view
          >
          <view class="">4、在打开的授权页面填写账号密码完成绑定</view>
        </view>
        <view class="flex-between-center btns" style="padding: 40rpx">
          <u-button
            type="primary"
            customStyle="border-radius: 16rpx;height: 72rpx;"
            color="#F2F2F2"
            textColor="#707070"
            @click="$refs.refCommonDialog.close()"
            >取消</u-button
          >
          <u-button
            type="primary"
            color="#FF8C00"
            customStyle="border-radius: 16rpx;height: 72rpx;"
            @click="bindDevice()"
            >复制绑定链接</u-button
          >
        </view>
      </view>
    </CommonDialog>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import CommonDialog from "@/components/common/CommonDialog.vue";
import Navbar from "@/components/navbar.vue";
import { gaoChi, huaWei, jiaMing } from "./deviceBind.js";

// 模板引用
const refCommonDialog = ref(null);

// 响应式数据
const textContent = ref("");
const options = ref({
  value: "",
});

// 页面加载
onLoad((optionsParam) => {
  if (optionsParam.value.includes("华为")) {
    textContent.value = huaWei;
  }
  if (optionsParam.value.includes("佳明")) {
    textContent.value = jiaMing;
  }
  if (optionsParam.value.includes("高驰")) {
    textContent.value = gaoChi;
  }
  options.value = optionsParam;
});

// 方法定义
const bindDevice = () => {
  refCommonDialog.value.open();
};
</script>

<style lang="less" scoped>
.poster {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  border: 1px solid #f5f5f5;
}
.text {
  font-size: 32rpx;
  color: #000000;
  line-height: 51rpx;
}
.section-bottom {
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
}
.txt {
  color: #ff8c00;
}

::v-deep {
  .btns {
    .u-button {
      width: 260rpx;
      height: 72rpx;
      font-size: 30rpx;
    }
  }
}
</style>
