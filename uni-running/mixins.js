// mixins.js
export const pageScrollMixin = {
    onPageScroll(e) {
      // 触发全局事件
      uni.$emit('pageScroll', {
        scrollTop: e.scrollTop,
        page: this.$page?.route || 'unknown',
        instance: this
      })
    },
    
    onUnload() {
      // 页面卸载时移除监听，避免内存泄漏
      uni.$off('onGlobalPageScroll')
    }
  }