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
<script setup>
import { ref, watch } from 'vue'

// Props定义
const props = defineProps({
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
})

// Emits
const emit = defineEmits(['input', 'change'])

// 响应式数据
const isShowPop = ref(false)
const selectedList = ref([])
const selectedLbaels = ref("")
const detail = ref({
	field: "",
	title: "",
	columns: [],
})

// 监听value变化
watch(() => props.value, (val) => {
	if (String(val)) {
		console.log("String(val)", props.columns, String(val));
		const list = String(val).split(",");
		const string = props.columns
			.filter((i) => list.includes(String(i.value)))
			.map((i) => i.label);
		selectedLbaels.value = string.join(",");
		selectedList.value = list;
	} else {
		selectedList.value = [];
		selectedLbaels.value = "";
	}
}, {
	deep: true,
	immediate: true,
})

// 方法定义
const confirm = () => {
	const valueText = props.columns
		.filter((i) => selectedList.value.includes(String(i.value)))
		.map((i) => i.label);

	emit("input", selectedList.value.join(","));

	emit("change", selectedList.value, valueText);

	isShowPop.value = false;
	selectedList.value = [];
}
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

