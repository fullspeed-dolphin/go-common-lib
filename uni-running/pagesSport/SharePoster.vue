
<template>
  <up-popup v-if="show" :show="show" @close="close" closeable custom-style="background:rgba(0,0,0,.8);top:0;">
    <view style="height:100vh;padding-top:250rpx;">
			<swiper class="event-swiper" circular @change="changeSwiper" indicator-active-color="#FF8C00" :display-multiple-items="1.2">
				<swiper-item>
					<view class="event-swiper-item u-pr-20 u-pl-40" style="margin-left1: 54rpx;">
						<image :src="pictureImage" v-if="pictureImage" show-menu-by-longpress mode="widthFix" style="width: 584rpx"></image>
					</view>
				</swiper-item>
				<swiper-item>
					<view class="event-swiper-item u-pl-40" style="margin-right1: 84rpx;">
						<image :src="pictureImage1" v-if="pictureImage1" show-menu-by-longpress mode="widthFix" style="width: 584rpx"></image>
					</view>
				</swiper-item>
			</swiper>
			
			<view class="flex-center">
				<view class="point" :class="{active: swiperIndex === 0}"></view>
				<view class="point" :class="{active: swiperIndex === 1}"></view>
			</view>
			
			<!-- <scroll-view class="scroll-view_H scroll-view" scroll-x="true" >
				<view class="item u-mr-30" style="margin-left: 84rpx;">
					<image :src="pictureImage" v-if="pictureImage" show-menu-by-longpress mode="widthFix" style="width: 600rpx"></image>
				</view>
				<view class="item" style="margin-right: 84rpx;">
					<image :src="pictureImage1" v-if="pictureImage1" show-menu-by-longpress mode="widthFix" style="width: 600rpx"></image>
				</view>
			</scroll-view> -->
			
			<l-painter ref="posterRef" @success="painterSsuccess" isCanvasToTempFilePath performance path-type="url" 
			custom-style="position: fixed; left: 200%" />
			
			<l-painter ref="posterRef1" @success="painterSsuccess1" isCanvasToTempFilePath performance path-type="url" 
			custom-style="position: fixed; left: 200%" />
				
			<view class="flex-center cf" style="margin-top:30rpx;">左右切换活动</view>
			
      <section class="section-btns flex-row">
				<div class="flex-col-center flex-1" @click="shareImage">
					<view class="iconfont flex-center icon-fenxiang"></view>
					分享
				</div>
				<div class="flex-col-center flex-1" @click="saveImage">
					<view class="iconfont flex-center icon-baocuntupian" style="background:#FE837A"></view>
					保存图片
				</div>
      </section>
		</view>
  </up-popup>
</template>
<script setup>
import lPainter from "./lime-painter/components/l-painter/l-painter.vue"
import { ref, nextTick, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";

import { getRandomMotivation } from "./assets/rules.js"
const motivationText = ref(getRandomMotivation().join(''))

const swiperIndex = ref(0)
function changeSwiper({detail}) {
	console.log(detail.current)
	swiperIndex.value = detail.current
}

const posterRef = ref(null);
const posterRef1 = ref(null);

// 存储最终生成的海报图片URL
const pictureImage = ref("");
const pictureImage1 = ref("");

const posterJson = ref({});
const posterJson1 = ref({});

const painterSsuccess = (e) => {
  pictureImage.value = e;
  uni.hideLoading();
};

const painterSsuccess1 = (e) => {
  pictureImage1.value = e;
  uni.hideLoading();
};

const renderPoster = (posterData) => {
  // posterData = {
  //     profieScore: 100,
  //     distance: 100,
  //     duration: 40,
  //     pace: 4,
  // }

  posterJson.value = {
		css: {
			width: "584rpx",
			height: '990rpx',
			paddingBottom: "40rpx",
			background: "#FF95AF",
			radius: '16rpx'
		},
    views: [
      {
        css: {},
        views: [
          {
            // src: '/static/poster/Rectangle 37@2x.min.png',
						src: 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/520_share.png',
            type: "image",
            css: {
              objectFit: "cover",
              objectPosition: "50% 50%",
              width: "584rpx",
              height: '990rpx',
							position: 'absolute',
							left: '0rpx',
							top: '0rpx',
							borderRadius: '33rpx'
            },
          },
					{
					  src: posterData.avatar_url || '/static/images/user.png',
					  type: "image",
					  css: {
					    objectFit: "cover",
					    objectPosition: "50% 50%",
					    width: "70rpx",
					    height: "70rpx",
							position: 'absolute',
							left: '36rpx',
							top: '48rpx',
							borderRadius: '33rpx'
					  },
					},
          {
            css: {
							position: 'absolute',
							left: '122rpx',
							top: '56rpx',
              color: "#333333",
              fontSize: "28rpx",
            },
            views: [
              {
                text: posterData.nickname || '--',
                type: "text",
                css: {
                  lineHeight: "28rpx",
                  width: "478rpx",
                  fontWeight: 'bold',
                },
              },
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '120rpx',
              top: '92rpx',
              display: 'flex',
              alignItems: 'center',
            },
            views: [
              {
								src: "/static/poster/coin.png",
								type: "image",
                css: {
                  width: "26rpx",
                  height: "26rpx",
                },
              },
							{
							  text: String(posterData.fscoin || ''),
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#000",
							    fontSize: "24rpx",
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '26rpx',
              top: '690rpx',
              width: '532rpx',
              height: '262rpx',
              background: 'rgba(255,255,255, .7)',
              borderRadius: '16rpx',
              border: '1px solid #fff',
              paddingTop: '14rpx'
            },
            views: [
							{
							  text: String(posterData.checkinCount || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '100rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.distance || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '120rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.duration || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '175rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.pace || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '130rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              // 底部label
              {
							  text: '累计打卡/天',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '100rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日距离/km',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '120rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日时长/min',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '175rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日配速/s',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '130rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '54rpx',
              top: '808rpx',
            },
            views: [
              {
								src: "/static/poster/Vector@2x.png",
								type: "image",
                css: {
                  width: "21rpx",
                  height: "21rpx",
                },
              },
							{
							  text: motivationText.value,
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#333",
							    fontSize: "18rpx",
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '54rpx',
              top: '856rpx',
            },
            views: [
              {
								src: posterData.avatar_url || '/static/images/user.png',
								type: "image",
                css: {
                  width: "70rpx",
                  height: "70rpx",
                  borderRadius: '35rpx',
                  marginRight: '10rpx'
                },
              },
							{
							  text: posterData.nickname || '--',
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#333",
							    fontSize: "28rpx",
                  width: '300rpx',
                  fontWeight: 'bold',
							  },
							},
              {
							  text: posterData.checkinTime,
							  type: "text",
							  css: {
                  marginTop: '-30rpx',
                  display: 'block',
									marginLeft: '90rpx',
							    color: "#333",
                  width: '300rpx',
							    fontSize: "18rpx",
							  },
							},
            ],
            type: "view",
          },
          // 二维码
          {
            css: {
              position: 'absolute',
              right: '50rpx',
              top: '790rpx',
              textAlign: 'center',
              width: '116rpx',
            },
            views: [
              {
								src: "/static/poster/小程序二维码@2x.png",
								type: "image",
                css: {
                  width: "116rpx",
                  height: "116rpx",
                },
              },
							{
							  text: "扫码加入",
							  type: "text",
							  css: {
                  display: 'block',
									marginTop: '15rpx',
							    color: "#333",
                  fontWeight: 'bold',
							    fontSize: "18rpx",
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

const renderPoster1 = (posterData) => {
  // posterData = {
  //     profieScore: 100,
  //     distance: 100,
  //     duration: 40,
  //     pace: 4,
  //     coinAmount: 43,
  // }

  posterJson1.value = {
		css: {
			width: "584rpx",
			height: '990rpx',
			paddingBottom: "40rpx",
			background: "#fff",
			radius: '16rpx'
		},
    views: [
      {
        css: {},
        views: [
					{
					  src: posterData.avatar_url || '/static/images/user.png',
					  type: "image",
					  css: {
					    objectFit: "cover",
					    objectPosition: "50% 50%",
					    width: "70rpx",
					    height: "70rpx",
							position: 'absolute',
							left: '36rpx',
							top: '48rpx',
							borderRadius: '33rpx'
					  },
					},
          {
            css: {
							position: 'absolute',
							left: '122rpx',
							top: '56rpx',
              color: "#333333",
              fontSize: "28rpx",
            },
            views: [
              {
                text: posterData.nickname || '--',
                type: "text",
                css: {
                  lineHeight: "28rpx",
                  width: "478rpx",
                  fontWeight: 'bold',
                },
              },
            ],
            type: "view",
          },
					// 二维码
					{
					  css: {
					    position: 'absolute',
					    left: '0rpx',
					    top: '224rpx',
					    textAlign: 'center',
					    width: '584rpx',
					  },
					  views: [
					    {
								src: "/static/poster/跑币@2x1.png",
								type: "image",
					      css: {
					        width: "212rpx",
					        height: "212rpx",
					      },
					    },
					  ],
					  type: "view",
					},
					{
					  css: {
					    position: 'absolute',
					    left: '0rpx',
					    top: '500rpx',
					    textAlign: 'center',
					    width: '584rpx',
					  },
					  views: [
							{
							  text: posterData.coinAmount ? "恭喜您获得跑币" : posterData.coinAmountMsg,
							  type: "text",
							  css: {
							    color: "#000",
					        fontWeight: 'bold',
							    fontSize: "40rpx",
							  },
							},
							{
							  text: posterData.coinAmount ? posterData.coinAmount : '',
							  type: "text",
							  css: {
							    color: "#FF8C00",
									marginTop: '-20rpx',
									marginLeft: '20rpx',
									marginRight: '20rpx',
							    fontWeight: 'bold',
							    fontSize: "64rpx",
							  },
							},						
							{
							  text: posterData.coinAmount ? "个" : '',
							  type: "text",
							  css: {
							    color: "#000",
							    fontWeight: 'bold',
							    fontSize: "40rpx",
							  },
							},
					  ],
					  type: "view",
					},
          {
            css: {
              position: 'absolute',
              left: '120rpx',
              top: '92rpx',
              display: 'flex',
              alignItems: 'center',
            },
            views: [
              {
								src: "/static/poster/coin.png",
								type: "image",
                css: {
                  width: "26rpx",
                  height: "26rpx",
                },
              },
							{
							  text: String(posterData.fscoin || ''),
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#000",
							    fontSize: "24rpx",
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '26rpx',
              top: '690rpx',
              width: '532rpx',
              height: '262rpx',
              background: '#eee',
              borderRadius: '16rpx',
              border: '1px solid #fff',
              paddingTop: '14rpx'
            },
            views: [
							{
							  text: String(posterData.checkinCount || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '100rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.distance || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '120rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.duration || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '175rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              {
							  text: String(posterData.pace || ''),
							  type: "text",
							  css: {
                  fontSize: "36rpx",
                  fontWeight: 'bold',
                  width: '130rpx',
                  height: '44rpx',
                  lineHeight: '44rpx',
							    color: "#000",
                  textAlign: 'center',
                  fontFamily: 'Inter, Inter',
							  },
							},
              // 底部label
              {
							  text: '累计打卡/天',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '100rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日距离/km',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '120rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日时长/min',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '175rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
              {
							  text: '今日配速/s',
							  type: "text",
							  css: {
                  fontSize: "16rpx",
                  fontWeight: 'bold',
                  width: '130rpx',
                  height: '22rpx',
                  marginTop: '4rpx',
							    color: "#000",
                  textAlign: 'center',
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '54rpx',
              top: '808rpx',
            },
            views: [
              {
								src: "/static/poster/Vector@2x1.png",
								type: "image",
                css: {
                  width: "21rpx",
                  height: "21rpx",
                },
              },
							{
							  text: motivationText.value,
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#333",
							    fontSize: "18rpx",
							  },
							},
            ],
            type: "view",
          },
          {
            css: {
              position: 'absolute',
              left: '54rpx',
              top: '856rpx',
            },
            views: [
              {
								src: posterData.avatar_url || '/static/images/user.png',
								type: "image",
                css: {
                  width: "70rpx",
                  height: "70rpx",
                  borderRadius: '35rpx',
                  marginRight: '10rpx'
                },
              },
							{
							  text: posterData.nickname || '--',
							  type: "text",
							  css: {
									marginLeft: '10rpx',
							    color: "#333",
							    fontSize: "28rpx",
                  width: '300rpx',
                  fontWeight: 'bold',
							  },
							},
              {
							  text: posterData.checkinTime,
							  type: "text",
							  css: {
                  marginTop: '-30rpx',
                  display: 'block',
									marginLeft: '90rpx',
							    color: "#333",
                  width: '300rpx',
							    fontSize: "18rpx",
							  },
							},
            ],
            type: "view",
          },
          // 二维码
          {
            css: {
              position: 'absolute',
              right: '50rpx',
              top: '790rpx',
              textAlign: 'center',
              width: '116rpx',
            },
            views: [
              {
								src: "/static/poster/打卡.png",
								type: "image",
                css: {
                  width: "116rpx",
                  height: "116rpx",
                },
              },
							{
							  text: "扫码加入",
							  type: "text",
							  css: {
                  display: 'block',
									marginTop: '15rpx',
							    color: "#333",
                  fontWeight: 'bold',
							    fontSize: "18rpx",
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

  posterRef1.value.render(posterJson1.value);
};

const show = ref(false);
// onLoad(() => {
// 	open({
// 		profieScore: 100,
// 		distance: 100,
// 		duration: 40,
// 		pace: 4,
// 		checkinCount: 4,
// 		checkinTime: 4,
// 	})
// })

async function open(propsData) {
  uni.showLoading({
    title: "正在生成海报",
    icon: "loading",
  });

  show.value = true;
	
	propsData.fscoin = await getInfo(propsData)
	
	uni.showLoading({
	  title: "正在生成海报",
	  icon: "loading",
	});

  setTimeout(() => {
		nextTick(() => {
		  renderPoster(propsData);
		  renderPoster1(propsData);
		});
	}, 100)
}

async function getInfo(propsData) {
  if (!propsData.id) return '';
  const res = await request.get(`/wallet-api/wallet/balance`) || {}
	return res.fscoin
}

function getCurrentPosterPath() {
  return swiperIndex.value === 0 ? pictureImage.value : pictureImage1.value;
}

function shareImage() {
  const path = getCurrentPosterPath();
  if (!path) {
    uni.showToast({ title: '海报未生成', icon: 'none' });
    return;
  }
  wx.showShareImageMenu({ path });
	
	setTimeout(() => {
		uni.switchTab({
			url: '/pages/index'
		})
	}, 300)
}

function saveImage() {
  const filePath = swiperIndex.value === 0 ? pictureImage.value : pictureImage1.value;
  if (!filePath) {
    uni.showToast({ title: '海报未生成', icon: 'none' });
    return;
  }
  uni.saveImageToPhotosAlbum({
    filePath,
    success() {
      uni.showToast({ title: '保存成功', icon: 'success' });
    },
    fail(err) {
      if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
        uni.showModal({
          title: '提示',
          content: '需要授权相册权限才能保存图片',
          confirmText: '去设置',
          success(res) { if (res.confirm) uni.openSetting(); }
        });
      }
    }
  });
}

function close() {
  show.value = false;
}

defineExpose({
  open,
});
</script>

<style lang="less" scoped>
	.point{
		width: 8rpx;
		height: 8rpx;
		background: #D5D5D6;
		border-radius: 12rpx;
		margin-right: 10rpx;
		&.active{
			width: 12rpx;
			height: 12rpx;
			background: #E2E2E2;
		}
	}
	.event-swiper {
	  // padding: 0 34rpx;
	  height: 1020rpx;
	
	  .event-swiper-item {
	    // padding-right: 20rpx;
	  }
	}
	
	.scroll-view_H {
		white-space: nowrap;
		width: 100%;
	}
	.section-btns{
		margin-top:50rpx;
		color:#fff;
		font-size: 24rpx;
		.iconfont{
			width: 98rpx;
			height: 98rpx;
			background: #0DC161;
			border-radius: 98rpx;
			font-size: 45rpx;
			margin-bottom: 20rpx;
		}
		.flex-1{
			width:180rpx;
		}
	}
</style>
