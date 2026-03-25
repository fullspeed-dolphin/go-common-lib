<template>
  <view class="page-container">
    <u-navbar title="发布免费活动" autoBack placeholder></u-navbar>

    <view class="form-content">
      <!-- 活动图片 -->
      <view class="section">
        <text class="section-label">活动图片</text>
        <view class="img-row">
          <view class="img-upload-item" v-for="idx in 3" :key="idx">
            <template v-if="imageList[idx - 1]">
              <image class="img-preview" :src="imageList[idx - 1]" mode="aspectFill" @click="previewImage(idx - 1)" />
              <view class="img-delete" @click.stop="removeImage(idx - 1)">
                <u-icon name="close" size="12" color="#fff"></u-icon>
              </view>
            </template>
            <view v-else class="img-add" @click="chooseImage">
              <u-icon name="plus" size="24" color="#D1D5DB"></u-icon>
              <text class="img-add-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="form-row" @click="focusInput('name')">
          <text class="form-label">活动主题</text>
          <view class="form-value-row">
            <input class="form-input" v-model="form.name" placeholder="请输入活动主题" placeholder-class="placeholder" />
          </view>
        </view>
        <view class="form-row">
          <text class="form-label">活动时间</text>
          <view class="form-value-row" @click="showTimePicker = true">
            <text :class="form.event_time ? 'form-value' : 'placeholder'">{{ form.event_time ? formatTime(form.event_time) : '请选择时间' }}</text>
            <u-icon name="arrow-right" size="16" color="#D1D5DB"></u-icon>
          </view>
        </view>
        <view class="form-row" @click="chooseLocation">
          <text class="form-label">活动地点</text>
          <view class="form-value-row">
            <text :class="form.event_location ? 'form-value-location' : 'placeholder'">{{ form.event_location || '请选择活动地点' }}</text>
            <u-icon name="arrow-right" size="16" color="#D1D5DB"></u-icon>
          </view>
        </view>
        <view class="form-row">
          <text class="form-label">活动项目</text>
          <view class="form-value-row">
            <input class="form-input" v-model="form.event_projects" placeholder="欢乐跑" placeholder-class="placeholder" />
          </view>
        </view>
        <view class="form-row form-row-last">
          <text class="form-label">运动保险</text>
          <view class="form-value-row">
            <view class="radio-group">
              <view class="radio-item" :class="{ active: form.need_insurance === 1 }" @click="form.need_insurance = 1">
                <text>是</text>
              </view>
              <view class="radio-item" :class="{ active: form.need_insurance === 0 }" @click="form.need_insurance = 0">
                <text>否</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 活动描述 -->
      <view class="section">
        <text class="section-label">活动描述</text>
        <view class="desc-box">
          <textarea class="desc-input" v-model="form.description" placeholder="请输入活动描述" maxlength="150" />
          <text class="desc-count" v-if="form.description">{{ form.description.length }}/150</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="section-bottom">
      <view class="btn-publish" @click="submitForm">
        <text class="btn-publish-text">{{ isSubmitting ? '提交中...' : '发布活动' }}</text>
      </view>
    </view>

    <!-- 时间选择器 -->
    <u-datetime-picker
      :show="showTimePicker"
      v-model="pickerTime"
      mode="datetime"
      @confirm="onTimeConfirm"
      @cancel="showTimePicker = false"
      @close="showTimePicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { baseLink } from "@/utils/config.js";
import { uploadToken } from "@/utils/config";
import dayjs from "dayjs";

const group_id = ref("");
const isSubmitting = ref(false);
const showTimePicker = ref(false);
const pickerTime = ref(Date.now());
const imageList = ref([]);

const form = ref({
  name: "",
  event_time: "",
  event_location: "",
  event_projects: "欢乐跑",
  need_insurance: 0,
  description: "",
});

onLoad((options) => {
  group_id.value = options.group_id;
});

const formatTime = (ts) => {
  return dayjs(Number(ts)).format("YYYY.MM.DD HH:mm");
};

const onTimeConfirm = (e) => {
  form.value.event_time = String(e.value);
  showTimePicker.value = false;
};

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      form.value.event_location = res.address;
    },
    fail: (e) => {
      console.log("chooseLocation fail", e);
    },
  });
};

const chooseImage = () => {
  const remaining = 3 - imageList.value.length;
  if (remaining <= 0) return;
  uni.chooseImage({
    count: remaining,
    sourceType: ["album", "camera"],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        if (imageList.value.length < 3) {
          uploadImage(path);
        }
      });
    },
  });
};

const compressImage = (src) => {
  return new Promise((resolve) => {
    uni.compressImage({
      src,
      width: 750,
      height: "auto",
      quality: 80,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(src),
    });
  });
};

const uploadImage = async (filePath) => {
  uni.showLoading({ mask: true, title: "上传图片中" });
  try {
    const compressed = await compressImage(filePath);
    uni.uploadFile({
      url: baseLink + `/basic-service/image/upload`,
      filePath: compressed,
      name: "image",
      header: {
        Authorization: uploadToken,
        "content-type": "application/json",
      },
      success: (res) => {
        uni.hideLoading();
        const data = JSON.parse(res.data);
        if (data.data?.url) {
          imageList.value.push(data.data.url);
        } else {
          uni.$u.toast(data.msg || "上传失败");
        }
      },
      fail: (e) => {
        uni.hideLoading();
        uni.$u.toast(e?.msg || "上传失败");
      },
    });
  } catch (e) {
    uni.hideLoading();
    uni.$u.toast("上传失败");
  }
};

const removeImage = (idx) => {
  imageList.value.splice(idx, 1);
};

const previewImage = (idx) => {
  uni.previewImage({
    current: idx,
    urls: imageList.value,
  });
};

const submitForm = async () => {
  if (isSubmitting.value) return;

  if (!form.value.name) {
    uni.$u.toast("请输入活动主题");
    return;
  }
  if (!form.value.event_time) {
    uni.$u.toast("请选择活动时间");
    return;
  }

  isSubmitting.value = true;
  uni.showLoading({ mask: true });

  const data = {
    fsc_id: Number(group_id.value),
    name: form.value.name,
    event_time: dayjs(Number(form.value.event_time)).toISOString(),
    event_location: form.value.event_location || undefined,
    event_projects: form.value.event_projects || undefined,
    capacity: form.value.capacity ? Number(form.value.capacity) : undefined,
    contact: form.value.contact || undefined,
    description: form.value.description || undefined,
    is_free: 0,
    status: "PND",
    visibility: "private",
    background_image_url: imageList.value.length > 0 ? JSON.stringify(imageList.value) : undefined,
  };

  try {
    await request.post("/event-api/fsc_events", data);
    uni.hideLoading();
    uni.$u.toast("发布成功");
    uni.$emit("updateList", { isChange: true });
    setTimeout(() => uni.navigateBack({ delta: 2 }), 500);
  } catch (e) {
    uni.hideLoading();
    uni.$u.toast(e.msg || "发布失败");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
  padding-bottom: 200rpx;
}

.form-content {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.img-row {
  display: flex;
  gap: 20rpx;
}

.img-upload-item {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
}

.img-preview {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.img-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-add {
  width: 100%;
  height: 100%;
  background: #F6F7F8;
  border: 2rpx dashed #E5E7EB;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.img-add-text {
  font-size: 20rpx;
  color: #D1D5DB;
}

.form-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 1rpx solid #F3F4F6;
  overflow: hidden;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.form-row-last {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
  flex-shrink: 0;
}

.form-value-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  justify-content: flex-end;
}

.form-input {
  text-align: right;
  font-size: 28rpx;
  color: #1A1A1A;
  flex: 1;
}

.form-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #FF8C00;
}

.radio-group {
  display: flex;
  gap: 16rpx;
}

.radio-item {
  padding: 8rpx 32rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: #F6F7F8;
  border: 1rpx solid #E5E7EB;

  &.active {
    background: #FFF5EB;
    color: #FF8C00;
    border-color: #FF8C00;
    font-weight: 500;
  }
}

.placeholder {
  color: #D1D5DB;
  font-size: 28rpx;
}

.form-value-location {
  font-size: 28rpx;
  color: #FF8C00;
  font-weight: 500;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc-box {
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 1rpx solid #F3F4F6;
  padding: 24rpx;
  position: relative;
  min-height: 200rpx;
}

.desc-input {
  width: 100%;
  font-size: 28rpx;
  color: #1A1A1A;
  min-height: 160rpx;
}

.desc-count {
  position: absolute;
  right: 24rpx;
  bottom: 16rpx;
  font-size: 22rpx;
  color: #9CA3AF;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}

.btn-publish {
  width: 100%;
  height: 96rpx;
  background: #FF8C00;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-publish-text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
