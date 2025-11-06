<template>
  <view class="flex1">
    <!-- <u-cell :title="title" :required="required" :border="false"> -->
    <u-upload
      :fileList="fileList"
      :file-mediatype="accept"
      :maxCount="maxCount"
      :mode="mode"
      @afterRead="afterRead"
      @delete="deleteFile"
      :auto-upload="false"
      :disabled="readonly"
      :disable-preview="disablePreview"
      :deletable="deletable"
      @fail="fail"
      upload-icon="plus"
    />
    <!-- </u-cell> -->
  </view>
</template>
<script setup>
import { ref, watch } from "vue";
import { asyncAlls } from "@/utils/util.js";
import { baseLink } from "@/utils/config.js";
import { uploadToken } from "../../utils/config";

// Props定义
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: "",
  },
  value: [String, Object, Array],
  capture: {
    type: Array,
    default() {
      return ["album", "camera"];
    },
  },
  accept: {
    type: String,
    default: "image",
  },
  mode: {
    type: String,
    default: "grid",
  },
  imageStyles: {
    type: Object,
    default() {
      return {
        width: 90,
        height: 90,
        border: {
          radius: "8",
        },
      };
    },
  },
  maxCount: {
    type: [Number, String],
    default: 1,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disablePreview: {
    type: Boolean,
    default: false,
  },
  deletable: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(["input", "update:modelValue"]);

// 响应式数据
const fileList = ref([]);
const fileTempList = ref([]);

// 监听value变化
watch(
  () => props.value,
  (val) => {
    if (val) {
      let temp = 1;
      // 首先将值转为数组
      const list = Array.isArray(val) ? val : props.value.split(",");
      // 然后将数组转为对象数组
      fileList.value = list.map((item) => {
        if (typeof item === "string") {
          item = {
            name: item,
            url: item,
            extname: "",
          };
        }
        item.uid = item.uid || new Date().getTime() + temp++;
        return item;
      });
    } else {
      fileList.value = [];
      return [];
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// 方法定义
// 删除文件
const deleteFile = (event) => {
  const index = fileList.value.findIndex((i) => i === event.tempFilePath);
  fileList.value.splice(index, 1);
  const value = listToString(fileList.value);
  emit("input", value);
  emit("update:modelValue", value);
};

const afterRead = async (event) => {
  console.log("event", event);
  uni.showLoading({
    mask: true,
    title: "上传图片中",
  });
  const promiseList = [event].map((item) => uploadFile(item.file));

  try {
    const tempFile = await asyncAlls(promiseList);

    console.log("promiseList=====>", tempFile);

    const temp = tempFile.filter((i) => !!i);
    if (!temp.length) {
      fileList.value = [];
      uni.hideLoading();
      return;
    }
    const tempList = tempFile.map((item) => ({
      name: item,
      url: item,
      extname: "png",
    }));

    fileList.value = [...fileList.value, ...tempList];

    console.log("fileList===========>", fileList.value);
    uni.hideLoading();
    const value = listToString(fileList.value);
    emit("input", value);
    emit("update:modelValue", value);
  } catch (e) {
    console.error(e);
  }
};

// 对象转成指定字符串分隔
const listToString = (list, separator) => {
  let strs = "";
  separator = separator || ",";
  for (const i in list) {
    // strs += list[i].url.replace(this.baseUrl, '') + separator
    strs += list[i].url + separator;
  }

  return strs != "" ? strs.substr(0, strs.length - 1) : "";
};

const compressImage = (src) => {
  return new Promise((resolve) => {
    uni.compressImage({
      src,
      width: 750,
      height: "auto",
      quality: 80,
      success: (res) => {
        resolve(res.tempFilePath);
        console.log("已经压缩：", res.tempFilePath);
      },
      fail(e) {
        console.error(e);
      },
    });
  });
};

const uploadFile = async (file) => {
  const filePath = await compressImage(file.url);
  console.log("filePath===========>", filePath);
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: baseLink + `/basic-service/image/upload`,
      filePath: filePath,
      name: "image",
      header: {
        Authorization: uploadToken,
        "content-type": "application/json",
      },
      success(res) {
        res = JSON.parse(res.data);
        if (res.data.url) {
          return resolve(res.data.url);
        } else {
          uni.showToast({
            icon: "none",
            title: res.msg || "上传失败",
          });
        }
      },
      fail(e) {
        uni.showToast({
          icon: "none",
          title: "上传失败",
        });

        console.error(e);
        reject(e);
      },
    });
  });
};
</script>

<style lang="scss">
.flex1 {
  flex: 1;
}
::v-deep {
  .u-upload__deletable {
    width: 18px !important;
    height: 18px !important;
  }
}
</style>
