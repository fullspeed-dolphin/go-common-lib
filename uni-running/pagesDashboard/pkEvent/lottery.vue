<script setup>
import { computed, ref } from 'vue';
import { useStore } from "vuex";
import LuckyWheel from '@lucky-canvas/uni/lucky-wheel'

const store = useStore();
const pkEventTheme = computed(() => store.state.pkEventTheme);
const themeStyle = computed(() => ({
  '--theme-color': pkEventTheme.value?.solid || '#ff5c5c',
  '--theme-gradient': `linear-gradient(90deg, ${pkEventTheme.value?.gradient?.[0] || '#ff5c5c'}, ${pkEventTheme.value?.gradient?.[1] || '#ff5c5c'})`,
}));

// 组件引用
const myLucky = ref(null);

const blocks = ref([{ padding: '13px', background: '#617df2' }])
const prizes = ref([
  { fonts: [{ text: '0', top: '10%' }], background: '#e9e8fe' },
  { fonts: [{ text: '1', top: '10%' }], background: '#b8c5f2' },
  { fonts: [{ text: '2', top: '10%' }], background: '#e9e8fe' },
  { fonts: [{ text: '3', top: '10%' }], background: '#b8c5f2' },
  { fonts: [{ text: '4', top: '10%' }], background: '#e9e8fe' },
  { fonts: [{ text: '5', top: '10%' }], background: '#b8c5f2' },
])
const buttons = ref([
  { radius: '50px', background: '#617df2' },
  { radius: '45px', background: '#afc8ff' },
  {
    radius: '40px', background: '#869cfa',
    pointer: true,
    fonts: [{ text: '开始\n抽奖', top: '-20px' }]
  },
])

// 可选：定义 defaultStyle（如果需要自定义样式）
const defaultStyle = ref({
  // 可以在这里自定义样式，例如：
  // fontColor: '#333',
  // fontSize: '14px'
})

// 2. 定义回调方法
const startCallBack = () => {
  // 先开始旋转
  myLucky.value?.play()
  
  // 模拟请求接口获取中奖结果
  // 实际项目中替换为真实的 API 请求
  setTimeout(() => {
    // 假设后端返回的中奖索引是 0（根据实际情况修改）
    // 注意：索引对应 prizes 数组的位置，从 0 开始
    const index = 1
    // 调用 stop 停止旋转并传递中奖索引
    myLucky.value?.stop(index)
  }, 3000)
}

const endCallBack = (prize) => {
  // 抽奖结束回调，prize 是中奖的奖品对象
  console.log('中奖结果:', prize)
  
  // 在这里处理中奖逻辑，例如：
  // 1. 弹出中奖弹窗
  // 2. 上报中奖数据
  // 3. 更新用户奖品列表等
  uni.showToast({
    title: `恭喜获得 ${prize.fonts?.[0]?.text || '奖品'}！`,
    icon: 'success'
  })
}
</script>

<template>
  <view :style="themeStyle">
    <u-navbar autoBack placeholder :title="detailInfo?.event_name || '幸运大转盘'" />

    <view class="wheel-container">
      <LuckyWheel
        ref="myLucky"
        width="600rpx"
        height="600rpx"
        :blocks="blocks"
        :prizes="prizes"
        :buttons="buttons"
        :defaultStyle="defaultStyle"
        @start="startCallBack"
        @end="endCallBack"
      />      
    </view>
  </view>
</template>

<style scoped>
.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
}
</style>