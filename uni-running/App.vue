<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import "@/uni_modules/uview-plus/index.scss";
// @import './static/iconfont.css';
@import './assets/style/common.scss';
@import './assets/style/theme.scss';
</style>