<template>
  <view>
    <up-popup :show="isShowModal" zIndex="11" @close="close" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
      <view style="text-align: center;font-size:32rpx; margin-top:30rpx;font-weight:500;">分享到</view>
      <view class="iconList">
				<button class="item" open-type="share">
						<view class="img">
            <view class="iconfont icon-weixin"></view>
          </view>
          <view class="txt">微信好友</view>
        </button>
        <view class="item" @click="sharePoster">
          <view class="img">
            <view class="iconfont icon-haibaofenxiang"></view>
          </view>
          <view class="txt">生成海报</view>
        </view>
        <view class="item" @click="shareQRCode">
          <view class="img">
            <view class="iconfont icon-erweima1688"></view>
          </view>
          <view class="txt">生成小程序码</view>
        </view>
      </view>
      <view class="cancel-btn" @click="close">
        取消
      </view>
    </up-popup>
		
    <!-- 海报分享 -->
    <view class="qrShare">
      <SharePoster ref="refSharePoster" />
    </view>

    <!-- 二维码分享 -->
    <up-popup :show="qrCodeShow" zIndex="11" @close="closeQrcode" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
      <view style="text-align: center;margin-top:30rpx;">
        <image :src="qrCodeSrc" style="width:350rpx;height:350rpx;"></image>
        <view style="margin:20rpx 0;">长按二维码下载</view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import SharePoster from "./SharePoster.vue";
import request from "@/utils/request.js";

const routeParams = ref("");
// 弹出分享按钮
const isShowModal = ref(false);
const showShareBtn = () => {
  isShowModal.value = true;
};
function close() {
  isShowModal.value = false;
}
// 二维码分享
const qrCodeSrc = ref("");
const qrCodeShow = ref(false);
const shareQRCode = () => {
  qrCodeImg();
};
const qrCodeImg = (type = "qrcode") => {
  let data = {
    // path: `pagesSub/runningTeam/teamDetail?group_id=${routeParams.value.group_id}`
    path: routeParams.value,
  };
  request.post(`/image-service/wxacode`, data).then((res) => {
    if (type == "poster") {
      // qrCodeSrc.value = res.image
      console.log("detail.value=====", detail.value);
      refSharePoster.value.open({
        imgUrl: detail.value.avatar_url,
        title: detail.value.name,
        time: detail.value.establish_time,
        codeImg: res.image,
      });
      return;
    }
    qrCodeShow.value = true;
    nextTick(() => {
      // console.log("res==base64", res)
      qrCodeSrc.value = res.image;
    });
  });
};

const refSharePoster = ref(null);
const closeQrcode = () => {
  qrCodeShow.value = false;
};
// 海报分享
const sharePoster = () => {
  qrCodeImg("poster");
};
const detail = ref({});
function open(val, routeParamsUrl) {
  console.log("routeParams====", routeParamsUrl);
  isShowModal.value = true;
  detail.value = val;
  routeParams.value = routeParamsUrl;
}
defineExpose({
  open,
});
</script>
<script>
export default {
  options: {
    styleIsolation: "shared",
  },
};
</script>
<style lang="scss" scoped>
.cancel-btn {
  text-align: center;
  padding: 30rpx;
  font-size: 32rpx;
  color: #666;
  border-top: 1rpx solid #eee;
  margin-top: 20rpx;
}
.iconList {
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  padding: 40rpx 75rpx 40rpx;

  .item {
    position: relative;
    width: 200rpx;
    text-align: center;
		padding:0;
		margin:0;
    display: flex;
    align-items: center;
    flex-direction: column;
		background: transparent;
		&:after{
			display: none;
			background: transparent;
		}
    &:nth-child(1) {
      .img {
        color: #fff;
        background: #32d07c;
      }
    }

    .img {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      color: #252429;
      background: #f7f8fc;
			.iconfont{
				font-size: 46rpx;
			}
    }
    .txt {
      margin-top: 20rpx;
			font-size: 24rpx;
			color:#222;
			font-weight:500;
			line-height: 1;
    }
    .wechatBtn {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      opacity: 0;
    }
  }
}
.qrShare {
  ::v-deep .u-popup__content__close {
    top: 300rpx !important;
    width: 36px !important;
    height: 36px !important;
    background: rgba(34, 34, 34, 0.8) !important;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    .u-icon__icon {
      color: #fff !important;
    }
  }
}
</style>