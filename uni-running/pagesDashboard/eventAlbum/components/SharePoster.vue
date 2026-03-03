
<template>
  <up-popup v-if="show" :show="show" @close="close" closeable custom-style="background:rgba(0,0,0,.8);top:0;">
    <view class="flex-col-center" style="height:100vh;">
			<image :src="pictureImage" v-if="pictureImage" show-menu-by-longpress mode="widthFix" style="width: 600rpx"></image>
			<u-button v-if="pictureImage" type="primary" block shape="circle" @click="$u.toast('长按图片保存到相册')" custom-style="width:500rpx;margin: 40rpx auto 0">
				长按图片保存到相册
			</u-button>
			<l-painter ref="posterRef" @success="painterSsuccess" isCanvasToTempFilePath performance path-type="url" 
			custom-style="position: fixed; left: 200%" />
		</view>
  </up-popup>
</template>
<script setup>
import lPainter from "./lime-painter/components/l-painter/l-painter.vue"
import { ref, nextTick, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { useStore } from "vuex";
const store = useStore();

const album_info = computed(() => store.state.album_info);

const posterRef = ref(null);

// 存储最终生成的海报图片URL
const pictureImage = ref("");

const posterJson = ref({});

const painterSsuccess = (e) => {
  pictureImage.value = e;
  uni.hideLoading();
};

const renderPoster = (imageUrl) => {
  posterJson.value = {
    css: {
      width: "750rpx",
      paddingBottom: "40rpx",
      background: "linear-gradient(,#000 0%, #ff8c00 100%)",
    },
    views: [
      {
        css: {
          marginLeft: "40rpx",
          marginTop: "30rpx",
          padding: "32rpx",
          boxSizing: "border-box",
          background: "#fff",
          borderRadius: "16rpx",
          width: "670rpx",
          boxShadow: "0 20rpx 58rpx rgba(0,0,0,.5)",
        },
        views: [
          {
            src: imageUrl,
            type: "image",
            css: {
              objectFit: "cover",
              objectPosition: "50% 50%",
              width: "606rpx",
              height: "606rpx",
            },
          },
          {
            css: {
              marginTop: "32rpx",
              color: "#333333",
              fontSize: "30rpx",
            },
            views: [
              {
                text: album_info.value.name || "活动相册",
                type: "text",
                css: {
                  lineHeight: "48rpx",
                  width: "478rpx",
                },
              },
            ],
            type: "view",
          },
          {
            css: {
              marginTop: "10rpx",
            },
            views: [
              {
                text: album_info.value.event_time.slice(0, 10) || "",
                type: "text",
                css: {
                  paddingRight: "32rpx",
                  boxSizing: "border-box",
                  lineClamp: 2,
                  color: "#666666",
                  fontSize: "28rpx",
                  width: "478rpx",
                },
              },
              {
								src: "/static/images/qrcode.min.jpeg",
								type: "image",
                css: {
									marginTop: "-10rpx",
                  width: "128rpx",
                  height: "128rpx",
                },
              },
            ],
            type: "view",
          },
        ],
        type: "view",
      },
    ],
  };

  posterRef.value.render(posterJson.value);
};

const show = ref(false);

function open(imageUrl) {
  uni.showLoading({
    title: "正在生成海报",
    icon: "loading",
  });

  show.value = true;

  nextTick(() => {
    renderPoster(imageUrl);
  });
}

function close() {
  show.value = false;
}

defineExpose({
  open,
});
</script>

<style >
</style>
