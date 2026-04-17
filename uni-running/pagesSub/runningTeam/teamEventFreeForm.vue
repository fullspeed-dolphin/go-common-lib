<template>
  <view class="page-container">
    <u-navbar :title="event_id ? `更新免费活动` : '发布免费活动'" autoBack placeholder></u-navbar>

    <view class="form-content">
      <!-- 活动图片 -->
      <view class="section">
        <text class="section-label">活动图片</text>
        <view class="img-row" id="imgRow">
          <view class="img-upload-item"
            v-for="(img, idx) in displaySlots" :key="'slot-' + idx"
            :class="{
              'img-dragging': dragState.dragging && dragState.fromIndex === idx,
              'img-drag-over': dragState.dragging && dragState.overIndex === idx && dragState.overIndex !== dragState.fromIndex
            }"
            @longpress="onDragStart(idx, $event)"
            @touchmove.prevent="onDragMove(idx, $event)"
            @touchend="onDragEnd"
            @touchcancel="onDragEnd"
          >
            <template v-if="img">
              <image class="img-preview" :src="img" mode="aspectFill" @click="!dragState.dragging && previewImage(idx)" />
              <view class="img-delete" @click.stop="removeImage(idx)">
                <u-icon name="close" size="12" color="#fff"></u-icon>
              </view>
              <view class="img-sort-hint" v-if="!dragState.dragging">
                <text class="img-sort-text">长按拖拽</text>
              </view>
              <view class="img-drag-mask" v-if="dragState.dragging && dragState.fromIndex === idx">
                <text class="img-drag-mask-text">← 左右拖动排序 →</text>
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
            <input class="form-input" v-model="form.name" placeholder="请输入活动主题" placeholder-style="color: #D1D5DB;" />
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
        <view class="insurance-hint" v-if="form.need_insurance === 1">
          <text class="insurance-hint-text">开启运动保险后，参与者报名时需填写正确的证件号码</text>
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
        <image class="btn-publish-icon" src="/static/icons/send.png" mode="aspectFit" />
        <text class="btn-publish-text">{{ isSubmitting ? '提交中...' : event_id ? '更新活动' : '发布活动' }}</text>
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
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import { baseLink } from "@/utils/config.js";
import { uploadToken } from "@/utils/config";
import dayjs from "dayjs";

const group_id = ref("");
const event_id = ref("");
const isSubmitting = ref(false);
const showTimePicker = ref(false);
const pickerTime = ref(Date.now());
const imageList = ref([]);

// 拖拽排序状态
const dragState = ref({
  dragging: false,
  fromIndex: -1,
  overIndex: -1,
  startX: 0,
});

// 始终显示3个槽位
const displaySlots = computed(() => {
  const slots = [...imageList.value];
  while (slots.length < 3) slots.push('');
  return slots.slice(0, 3);
});

// 获取每个槽位的X范围（基于触摸位置判断落在哪个槽位）
const getSlotIndex = (touchX, startX, fromIndex) => {
  // 根据手指水平移动距离估算目标槽位
  const slotWidth = 120; // 大约每个槽位的宽度(px)，含gap
  const deltaX = touchX - startX;
  let targetIndex = fromIndex + Math.round(deltaX / slotWidth);
  targetIndex = Math.max(0, Math.min(2, targetIndex));
  return targetIndex;
};

const onDragStart = (idx, e) => {
  if (!imageList.value[idx]) return; // 空槽位不可拖拽
  uni.vibrateShort(); // 触感反馈
  dragState.value = {
    dragging: true,
    fromIndex: idx,
    overIndex: idx,
    startX: e.touches[0].clientX,
  };
};

const onDragMove = (idx, e) => {
  if (!dragState.value.dragging) return;
  const touchX = e.touches[0].clientX;
  const overIndex = getSlotIndex(touchX, dragState.value.startX, dragState.value.fromIndex);
  // 只有目标槽位有图片时才允许交换
  if (imageList.value[overIndex]) {
    dragState.value.overIndex = overIndex;
  }
};

const onDragEnd = () => {
  if (!dragState.value.dragging) return;
  const { fromIndex, overIndex } = dragState.value;
  if (fromIndex !== overIndex && imageList.value[fromIndex] && imageList.value[overIndex]) {
    // 交换位置
    const temp = imageList.value[fromIndex];
    imageList.value[fromIndex] = imageList.value[overIndex];
    imageList.value[overIndex] = temp;
  }
  dragState.value = { dragging: false, fromIndex: -1, overIndex: -1, startX: 0 };
};

const form = ref({
  name: "",
  event_time: "",
  event_location: "",
  event_projects: "欢乐跑",
  need_insurance: 0,
  description: "",
});

onLoad((options) => {
  console.log("Received options:=====11", options);
  group_id.value = options.group_id;
  if(options.id) {
    event_id.value = options.id;
    // 编辑模式，加载活动详情
    request.get(`/event-api/fsc_events/${options.id}`).then((res) => {
      form.value.name = res.name || "";
      form.value.event_time = res.event_time ? String(new Date(res.event_time).getTime()) : "";
      form.value.event_location = res.event_location || "";
      form.value.need_insurance = res.need_insurance || 0;
      form.value.description = res.description || "";
      if (res.background_image_url) {
        try {
          const urls = JSON.parse(res.background_image_url);
          if (Array.isArray(urls)) {
            imageList.value = urls;
          }
        } catch (e) {
          console.log("Failed to parse background_image_url", e);
        }
      }
    }).catch((e) => {
      uni.$u.toast(e.msg || "加载活动详情失败");
    });
  }
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
        "X-API-KEY": uploadToken,
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
    is_free: 1,
    need_insurance: form.value.need_insurance,
    status: "PND",
    visibility: "private",
    background_image_url: imageList.value.length > 0 ? JSON.stringify(imageList.value) : undefined,
  };
  if(event_id.value) {
    data.event_id = event_id.value;
    data.status = "ACT";
    try {
      const res = await request.post("/event-api/fsc_events/update", data);
      // 创建成功后，自动为创建者报名（团长即第一个参与人员）
      // if (res?.id) {
      //   await request.post("/booking-api/fsc_events/registration", {
      //     event_id: res.id,
      //   }).catch(() => {});
      // }
      uni.hideLoading();
      uni.$u.toast("更新成功");
      uni.$emit("updateList", { isChange: true });
      setTimeout(() => uni.navigateBack({ delta: 2 }), 500);
    } catch (e) {
      uni.hideLoading();
      uni.$u.toast(e.msg || "更新失败");
    } finally {
      isSubmitting.value = false;
    }
  } else {

    try {
      const res = await request.post("/event-api/fsc_events", data);
      // 创建成功后，自动为创建者报名（团长即第一个参与人员）
      if (res?.id) {
        await request.post("/booking-api/fsc_events/registration", {
          event_id: res.id,
        }).catch(() => {});
      }
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

.img-dragging {
  transform: scale(0.95);
  transition: transform 0.15s;
}

.img-drag-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.img-drag-mask-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.img-drag-over {
  border: 3rpx solid #FF8C00;
  border-radius: 20rpx;
  transform: scale(1.05);
  transition: transform 0.15s, border 0.15s;
}

.img-sort-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.35);
  padding: 4rpx 0;
  display: flex;
  justify-content: center;
}

.img-sort-text {
  font-size: 18rpx;
  color: #FFFFFF;
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

.insurance-hint {
  padding: 12rpx 20rpx;
  background: #FFF5EB;
  border-radius: 0 0 24rpx 24rpx;
  margin-top: -1rpx;
}

.insurance-hint-text {
  font-size: 22rpx;
  color: #FF8C00;
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
  gap: 16rpx;
}

.btn-publish-icon {
  width: 36rpx;
  height: 36rpx;
}

.btn-publish-text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
