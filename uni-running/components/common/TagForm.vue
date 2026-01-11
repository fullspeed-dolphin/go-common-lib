<template>
  <view class="TagForm">
    <up-form-item :label="title" :name="name" :required="required">
      <view class="flex-row-center tag-box">
        <view class="u-flex-row u-flex-wrap flex-reverse">
          <view class="ml10 mb10" v-for="(i,j) in tagList" :key="j">
            <u-tag type="primary" plain :text='i' closable @close="deleteTag(j)" />
          </view>
					<view v-if="!tagList.length" class="placeholder" @click="isShowPop = true">
						{{ placeholder }}
					</view>
        </view>
        <view class="link flex-center" style="width:100rpx;color:#2979ff;" @click="isShowPop = true">
          添加
        </view>
      </view>
    </up-form-item>
		
		<block v-if="isShowPop">
			<u-popup :show="isShowPop" mode="center" @close="isShowPop = false" z-index="120" closeable>
				<view class="flex-center" style="height: 80rpx;">添加{{title}}</view>
				<view class="popup-con" style="width: 600rpx;">
					<view class="input-box flex-start u-border-bottom">
						<input v-model="inputValue" type="text" :maxlength="10" :placeholder="placeholder" :clearable="false"></input>
					</view>
					<view style="padding:20rpx;margin-top:10rpx;">
						<u-button shape="circle" type="primary" block @click="submitForm()">确 认</u-button>
					</view>
				</view>
			</u-popup>
		</block>
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
	name: {
		type: String,
		default: "",
	},
	placeholder: {
		type: String,
		default: "请添加",
	},
	modelValue: {
		type: String,
		default: "",
	},
	required: {
		type: Boolean,
		default: false,
	},
})

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// 响应式数据
const isShowPop = ref(false)
const tagList = ref([])
const inputValue = ref("")

// 监听value变化
watch(() => props.modelValue, (val) => {
	if (val) {
		// 首先将值转为数组
		const list = Array.isArray(val) ? val : val.split(",");
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
	emit("update:modelValue", tagList.value.join(","));
}

const submitForm = () => {
	if (!String(inputValue.value).length) return;
	if (tagList.value.includes(inputValue.value)) return uni.$u.toast('重复添加~');
	
	tagList.value.push(inputValue.value);
	inputValue.value = "";
	emit("update:modelValue", tagList.value.join(","));
	isShowPop.value = false;
}
</script>

<style lang="scss">
	.TagForm{
		.input-box {
		  margin: 30rpx 30rpx 120rpx;
		}
		.popup-con {
		  min-height: 330rpx;
		}
		
		.placeholder{
			font-weight: bold;
			font-size: 13px;
			color: #dadada;
		}
	}
</style>
