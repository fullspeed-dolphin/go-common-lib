<template>
  <view class="">
    <u-cell :title="title" :required="required" :value="timeValue ? timeValue : placeholder" @click="isShowPop = true" isLink />
    <u-popup :show="isShowPop" mode="bottom" round="15">
      <smh-time-range :time="propTime" @confrim="confrimTimeRange" @cancel="isShowPop = false"></smh-time-range>
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
		default: "请选择时间",
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
		type: String,
		default: "",
	},
})

// Emits
const emit = defineEmits(['input'])

// 响应式数据
const isShowPop = ref(false)
const timeValue = ref("")
const propTime = ref(["09", "0", "0", "18", "0"])

// 监听value变化
watch(() => props.value, async (val) => {
	// 初始化回显UI值
	if (val && val !== timeValue.value) {
		timeValue.value = val;

		// propTime.value = [val.slice(0,2), val.slice(3,5), '0', val.slice(6,8), val.slice(9,11)]

		// console.log(propTime.value)
	}
}, {
	deep: true,
	immediate: true,
})

// 方法定义
const open = () => {
	isShowPop.value = true;
}

const confrimTimeRange = ({ time }) => {
	isShowPop.value = false;
	timeValue.value = time;
	console.log("time=======>", time);
	emit("input", time);
}

// 暴露方法给父组件
defineExpose({
	open
})
</script>

<style lang="scss" scoped>
::v-deep {
  .time1 {
    border-radius: 15px;
  }
}
</style>
