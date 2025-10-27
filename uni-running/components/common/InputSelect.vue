<template>
  <view>
    <view class="lin-fixed" v-show="showComboxSelect" @click="gclick"></view>
    <view class="lin-combox">
      <uni-easyinput ref="uni-easyinput" :placeholder="placeholder" type="text" @input="oninput" />
      <view class="lin-combox-select" v-show="showComboxSelect">
        <view class="lin-popper__arrow"></view>
        <scroll-view scroll-y="true" :style="'max-height:' + maxHeight + 'px;'">
          <view v-if="loading" class="fedback-popper_loading">{{ loadingText }}</view>
          <template v-else>
            <view v-if="!list.length" class="fedback-popper_nodata">暂无数据</view>
            <view v-else class="items" v-for="item, key in list" :key="key" :id="key" @click="comboxCheckHandel(item)">
              {{ item[nameKey] }}
            </view>
          </template>
        </scroll-view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

// Props定义
const props = defineProps({
	loading: {
		type: Boolean,
		default: false
	},
	maxHeight: {
		type: String || Number,
		default: "125"
	},
	valueKey: {
		type: String,
		default: 'value'
	},
	nameKey: {
		type: String,
		default: 'label'
	},
	placeholder: {
		type: String,
		default: '请输入'
	},
	loadingText: {
		type: String,
		default: '加载中'
	},
	modelValue: [Number, String],
	value: [Number, String],
	list: {
		type: Array,
		default: () => []
	}
})

// Emits
const emit = defineEmits(['update:modelValue', 'input', 'confirm'])

// 模板引用
const uniEasyinput = ref(null)

// 响应式数据
const showComboxSelect = ref(false)
const checkValue = ref('')

// 监听value变化
watch(() => props.value, (val) => {
	checkValue.value = val
	getInitText()
})

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
	checkValue.value = val
	getInitText()
})

// 监听checkValue变化
watch(() => checkValue.value, (val) => { })

// 监听list变化
watch(() => props.list, (val) => {
	// console.log(val, 'watch')
})

// 组件挂载
onMounted(() => {
	if (!uniEasyinput.value) {
		console.error('请先导入uni-easyinput插件')
		return
	}
	watchInitialValue()
})

// 方法定义
const gclick = () => {
	showComboxSelect.value = false
	reset()
}

/*
 * 判断如果数据源有数据直接获取，没有数据就进行监听
 */
const watchInitialValue = () => {
	if (props.list.length) {
		getInitText()
		return
	}
	const unwatchList = watch(() => props.list, (val) => {
		getInitText()
		unwatchList()
	})
}

const getInitText = () => {
	checkValue.value = props.modelValue === null ? props.value : props.modelValue
	
	if (!props.list.length) return
	if (checkValue.value === '' || checkValue.value === undefined || checkValue.value === null) return
	if (showComboxSelect.value) return

	const _item = props.list.find((item) => {
		return item[props.valueKey] === +checkValue.value
	})
	uniEasyinput.value.val = _item[props.nameKey]
}

/**
 * 重置
 */
const reset = () => {
	emit('update:modelValue', '')
	emit('input', '')
	nextTick(() => {
		uniEasyinput.value.val = ''
	})
}

/**
 * 选中事件
 */
const comboxCheckHandel = (item) => {
	const text = item[props.nameKey]
	const value = item[props.valueKey]
	checkValue.value = ''
	checkValue.value = value
	showComboxSelect.value = false
	emit('update:modelValue', value)
	emit('input', value)
	nextTick(() => {
		uniEasyinput.value.val = text
	})
	emit('confirm', value)
}

/**
 * 输入事件
 */
const oninput = (val) => {
	emit('update:modelValue', val);
	emit('input', val)
	if (!val) {
		showComboxSelect.value = false
		return
	}
	showComboxSelect.value = true
}
</script>
<style lang="scss">
.lin-fixed {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
}

.lin-combox {
  position: relative;

  .lin-combox-select {
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 2;
    border-radius: 3px;
    padding: 3px 0;
    z-index: 8;
    background-color: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

    .fedback-popper_nodata {
      font-size: 13px;
      padding: 5px;
      color: #5d5959;
      text-align: center;
    }

    .lin-popper__arrow {
      position: absolute;
      top: -13px;
      left: 32px;
      z-index: 3;
      content: '';
      width: 0;
      height: 0;
      display: block;
      border-color: transparent;
      border-style: solid;
      border-width: 6px;
      border-bottom-color: #ebeef5;

      &::before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        border-color: transparent;
        border-style: solid;
        border-width: 6px;
        top: 1px;
        margin-left: -6px;
        border-top-width: 0;
        border-bottom-color: #fff;
      }
    }

    .items {
      height: 35px;
      line-height: 35px;
      padding: 0 10px;
      font-size: 15px;
    }

    .fedback-popper_loading {
      text-align: center;
      font-size: 13px;
      padding: 5px;
      color: #5d5959;
    }
  }

}
</style>

