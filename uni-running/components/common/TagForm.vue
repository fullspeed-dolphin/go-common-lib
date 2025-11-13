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
<script setup>
import { ref, watch } from 'vue'

// Props定义
const props = defineProps({
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
})

// Emits
const emit = defineEmits(['input'])

// 响应式数据
const isShowPop = ref(false)
const tagList = ref([])
const inputValue = ref("")

// 监听value变化
watch(() => props.value, (val) => {
	if (val) {
		// 首先将值转为数组
		const list = Array.isArray(val) ? val : props.value.split(",");
		tagList.value = list;
	} else {
		tagList.value = [];
		return [];
	}
}, {
	deep: true,
	immediate: true,
})

// 方法定义
const deleteTag = (index) => {
	tagList.value.splice(index, 1);
	emit("input", tagList.value.join(","));
}

const submitForm = () => {
	tagList.value.push(inputValue.value);
	inputValue.value = "";
	emit("input", tagList.value.join(","));
	isShowPop.value = false;
}
</script>

<style lang="scss" scoped>
.input-box {
  margin: 30rpx 30rpx 120rpx;
}
.popup-con {
  min-height: 330rpx;
}
</style>
