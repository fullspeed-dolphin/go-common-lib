<script setup>
import { onLaunch, onShow, onHide, onPageScroll } from "@dcloudio/uni-app";

onLaunch(() => {
  // 检测小程序更新
  checkUpdate();
});

// 检测小程序更新
const checkUpdate = () => {
  // #ifdef MP-WEIXIN
  if (uni.getUpdateManager) {
    const updateManager = uni.getUpdateManager();

    // 检查更新
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log("发现新版本，准备下载");
      }
    });

    // 下载更新
    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: (res) => {
          if (res.confirm) {
            // 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });

    // 更新失败
    updateManager.onUpdateFailed(() => {
      uni.showModal({
        title: "更新失败",
        content: "新版本下载失败，请删除小程序后重新搜索打开",
        showCancel: false,
      });
    });
  }
  // #endif
};
// onShow(() => {
//   console.log("App Show");
// });
// onHide(() => {
//   console.log("App Hide");
// });
onPageScroll((e) => {
  console.log(e, "onPageScroll");
  uni.$emit("pageScroll", e);
});
</script>

<style lang="scss">
@import "@/uni_modules/uview-plus/theme.scss";
@import "@/uni_modules/uview-plus/index.scss";
@import "./assets/style/common.scss";
@import "./static/iconfont.css";
@import "./assets/style/theme.scss";

// 全局样式：表单错误提示右对齐
.u-form-item__body__right__message {
  text-align: right;
}
</style>
