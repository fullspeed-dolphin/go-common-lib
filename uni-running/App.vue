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
// @import "@/uni_modules/uview-plus/theme.scss";
// @import "@/uni_modules/uview-plus/index.scss";
// @import './static/iconfont.css';
@import "@/uni_modules/uview-plus/theme.scss";
@import "@/uni_modules/uview-plus/index.scss";
@import "./assets/style/common.scss";
@import "./assets/style/theme.scss";

// 全局样式：表单错误提示右对齐
.u-form-item__body__right__message {
  text-align: right;
}
</style>
