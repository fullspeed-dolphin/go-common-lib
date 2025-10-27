<template>
	<view class="navbar-box">
        <view class="navbar-bg" :style="{ height: `${bgHeight}Px` }"></view>
        <u-navbar className="navbar" autoBack :title="title" :leftIcon="false" :bgColor="bgColor" placeholder></u-navbar>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: '跑了没'
    },
    bgHeight: {
        type: Number,
        default: 144
    }
})

const bgColor = ref('transparent')

// 监听页面滚动
const handleScroll = (e) => {
    const scrollTop = e.scrollTop || 0
    if (scrollTop >= 5) {
        bgColor.value = '#ffffff'
    } else {
        bgColor.value = 'transparent'
    }
}

onMounted(() => {
    // 监听页面滚动事件
    uni.$on('pageScroll', handleScroll)
})

onUnmounted(() => {
    // 移除滚动监听
    uni.$off('pageScroll', handleScroll)
})
</script>

<style lang="less" scoped>
.navbar-box {
    position: relative;
    .navbar-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: linear-gradient( 180deg, #FF8C00 0%, #FAFAFA 100%);
    }
}
</style>