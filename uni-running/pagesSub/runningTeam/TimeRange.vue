<template>
  <view class="TimeRange u-flex-row">
  	<view class="u-flex-1">
			<PickerTime v-model="startTime" mode="datetime"
				:minDate="new Date().getTime()"
				:maxDate="startTime_maxDate"
				:filter1="timeFilter"
				:border="false"
				:isLink="false"
				@change="changeStartTime"
				returnType="YYYY-MM-DD hh:mm"
				placeholder="开始时间" />
		</view>
		<view class="flex-center">
			至
		</view>
		<view class="u-flex-1">
			<PickerTime v-model="endTime" mode="datetime"
				:minDate="endTime_minDate"
				:maxDate="endTime_maxDate"
				:filter1="timeFilter"
				:border="false"
				:isLink="false"
				@change="changeEndTime"
				returnType="YYYY-MM-DD hh:mm"
				placeholder="结束时间"/>
		</view>
  </view>
</template>
<script setup>
import PickerTime from "@/components/common/PickerTime.vue";
import { ref, watch } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["change", "update:modelValue", ]);

const startTime = ref("");
const endTime = ref("");

const GLOBAL_MAX = dayjs().add(4, 'M').valueOf();

const startTime_maxDate = ref(GLOBAL_MAX);
const endTime_minDate = ref(dayjs().valueOf());
const endTime_maxDate = ref(GLOBAL_MAX);

// 监听value变化
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
			console.log("va====>", val)
			startTime.value = dayjs(JSON.parse(val)[0]).valueOf()
			endTime.value = dayjs(JSON.parse(val)[1]).valueOf()
    } else {
      // timeValue.value = "";
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

function toTs(v) {
	if (!v) return null;
	if (typeof v === 'number') return Number(v);
	const n = Number(v);
	if (!isNaN(n)) return n;
	const d = dayjs(v);
	return d.isValid() ? d.valueOf() : null;
}

function changeStartTime(e) {
	const val = e?.detail?.value ?? e?.value ?? e;
	startTime.value = Number(val);
	const ts = toTs(val);
	if (ts) {
		endTime_minDate.value = ts;
		startTime_maxDate.value = endTime.value ? (toTs(endTime.value) ?? GLOBAL_MAX) : GLOBAL_MAX;
		if (endTime.value && toTs(endTime.value) < ts) {
			endTime.value = "";
		}
	} else {
		endTime_minDate.value = dayjs().valueOf();
		startTime_maxDate.value = endTime.value ? (toTs(endTime.value) ?? GLOBAL_MAX) : GLOBAL_MAX;
	}
	
	updateToParent()
}

function changeEndTime(e) {
	const val = e?.detail?.value ?? e?.value ?? e;
	endTime.value = Number(val);
	const ts = toTs(val);
	if (ts) {
		startTime_maxDate.value = ts;
		endTime_minDate.value = startTime.value ? (toTs(startTime.value) ?? dayjs().valueOf()) : dayjs().valueOf();
		if (startTime.value && toTs(startTime.value) > ts) {
			startTime.value = "";
		}
		if (toTs(startTime.value) && endTime_maxDate.value < toTs(startTime.value)) {
			endTime_maxDate.value = toTs(startTime.value);
		}
	} else {
		startTime_maxDate.value = GLOBAL_MAX;
		endTime_minDate.value = startTime.value ? (toTs(startTime.value) ?? dayjs().valueOf()) : dayjs().valueOf();
	}
	
	updateToParent()
}

// 如果外部以其它方式修改 start/end，也确保约束一致
watch(startTime, (v) => {
	const ts = toTs(v);
	if (ts) endTime_minDate.value = ts;
	startTime_maxDate.value = endTime.value ? (toTs(endTime.value) ?? GLOBAL_MAX) : GLOBAL_MAX;
});
watch(endTime, (v) => {
	const ts = toTs(v);
	if (ts) startTime_maxDate.value = ts;
	endTime_minDate.value = startTime.value ? (toTs(startTime.value) ?? dayjs().valueOf()) : dayjs().valueOf();
});

function updateToParent() {
	if (!startTime.value || !endTime.value) return;

	console.log("[startTime.value, endTime.value]===>", [startTime.value, endTime.value])

	const value = JSON.stringify([
		dayjs(startTime.value).toISOString(),
		dayjs(endTime.value).toISOString(),
	])

	emit('change', value);
	emit('update:modelValue', value);
}

// 时间过滤器：只保留 00 和 30 分钟
function timeFilter(type, options) {
	if (type === 'minute') return ["00", "30"];
	return options;
}
</script>

<style lang="scss">
.TimeRange{
	border-radius: 8px;
	background: #fff;
}
</style>
