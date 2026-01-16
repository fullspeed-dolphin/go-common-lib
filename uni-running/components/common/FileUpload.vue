<template>
  <view class="flex1">
    <template v-if="maxCountNum === 1">
      <template v-if="!fileList.length">
        <u-upload
          :fileList="fileList"
          :file-mediatype="accept"
          :maxCount="maxCount"
          :mode="mode"
          :width="width"
          :height="height"
          @afterRead="afterRead"
          @delete="deleteFile"
          :auto-upload="false"
          :disabled="readonly"
          :disable-preview="disablePreview"
          :deletable="deletable"
          @fail="fail"
          upload-icon="photo"
        >
        </u-upload>
      </template>
      <template v-else>
        <view class="single-preview" :style="`width:${width}px;height:${height}px`">
          <image :src="fileList[0].url" class="preview-image" @click="chooseAndReplace" mode="aspectFill" />
          <view class="preview-actions">
            <u-icon name="close" size="10" color="#fff" @click.stop="deleteFile({ tempFilePath: fileList[0] })" />
          </view>
        </view>
      </template>
    </template>
    <template v-else>
      <u-upload
        :fileList="fileList"
        :file-mediatype="accept"
        :maxCount="maxCount"
        :mode="mode"
        :width="width"
        :height="height"
        @afterRead="afterRead"
        @delete="deleteFile"
        :auto-upload="false"
        :disabled="readonly"
        :disable-preview="disablePreview"
        :deletable="deletable"
        @fail="fail"
        upload-icon="photo"
      >
      </u-upload>
    </template>
  </view>
</template>
<script setup>
import { ref, watch } from "vue";
import { asyncAlls } from "@/utils/util.js";
import { baseLink } from "@/utils/config.js";
import { uploadToken } from "../../utils/config";

// Props定义
const props = defineProps({
	isCustom: {
		type: Boolean,
		default: false,
	},
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
  modelValue: [String, Object, Array],
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
  width: {
    type: [String, Number],
    default: 100,
  },
  height: {
    type: [String, Number],
    default: 100,
  },
});

const emit = defineEmits(["input", "update:modelValue", 'change']);

const maxCountNum = Number(props.maxCount) || 1;

// 响应式数据
const fileList = ref([]);
const fileTempList = ref([]);


function fail(e) {
	console.error(e)
}
// 监听modelValue变化
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      let temp = 1;
      // 首先将值转为数组
      const list = Array.isArray(val) ? val : props.modelValue.split(",");
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
// 删除文件 (兼容 u-upload 的 event 或者直接传入的文件对象)
const deleteFile = (event) => {
  let target = event && (event.tempFilePath || event);
  if (!target) return;
  const index = fileList.value.findIndex((i) => i.uid === (target.uid || target.url) || i.url === target.url);
  if (index > -1) {
    fileList.value.splice(index, 1);
  }
  const value = listToString(fileList.value);
  emit("input", value);
  emit("update:modelValue", value);
  emit("change", value);
};

// 点击已上传图片，重新选择并覆盖（仅用于单文件模式）
const chooseAndReplace = async () => {
  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sourceType: props.capture,
        success: (r) => resolve(r.tempFilePaths[0]),
        fail: (e) => reject(e),
      });
    });

    if (!res) return;

    uni.showLoading({ mask: true, title: '上传图片中' });
    const uploadedUrl = await uploadFile({ url: res });
    if (uploadedUrl) {
      const newItem = {
        name: uploadedUrl,
        url: uploadedUrl,
        extname: 'png',
        uid: new Date().getTime(),
      };
      fileList.value = [newItem];
      const value = listToString(fileList.value);
      emit('update:modelValue', value);
      emit('change', value);
    }
  } catch (e) {
    console.error(e);
  } finally {
    uni.hideLoading();
  }
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
    emit("update:modelValue", value);
		emit("change", value);
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

.single-preview {
  position: relative;
  width: 100%;
  display: flex;
}
.preview-image {
  width: 100%;
  height: auto;
  border-radius: 6px;
}
.preview-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 10rpx;
  background: rgba(0,0,0,.3);
  border-radius: 99px;
}
</style>
