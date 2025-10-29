<script setup>
import { onLaunch, onShow, onHide, onPageScroll } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
onPageScroll((e) => {
  console.log(e, "onPageScroll");
  uni.$emit("pageScroll", e);
});
</script>

<style lang="scss">
@import "@/uni_modules/uview-plus/theme.scss";
@import "@/uni_modules/uview-plus/index.scss";
// @import './static/iconfont.css';
@import "./assets/style/common.scss";
@import "./assets/style/theme.scss";
</style>
