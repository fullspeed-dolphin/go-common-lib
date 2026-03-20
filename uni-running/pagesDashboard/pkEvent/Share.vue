<template>
    <view >
        <up-popup :show="isShowModal" zIndex="11" @close="close" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
			<view style="text-align: center;margin-top:30rpx;">分享到</view>
			<view class="iconList">
				<view class="item" @click="wechatShare">
					<!-- <u-icon name="weixin-fill" color="#2979ff" size="28"></u-icon> -->
					<view class="img">
						<view class="iconfont icon-weixin" style="font-size:40rpx"></view>
					</view>
					<view class="txt">微信分享</view>
					<button class="wechatBtn" open-type="share">
					分享{{clubTypeName}}
				</button>
				</view>
				<view class="item" @click="sharePoster">
					<!-- <u-icon name="photo" color="#2979ff" size="28"></u-icon> -->
					 <view class="img"><view class="iconfont icon-haibaofenxiang" style="font-size:40rpx"></view></view>
					<view class="txt">海报分享</view>
				</view>
				<view class="item" @click="shareQRCode">
					<!-- <u-icon name="scan" color="#2979ff" size="28"></u-icon> -->
					<view class="img"><view class="iconfont icon-erweima1688" style="font-size:40rpx"></view></view>
					<view class="txt">小程序码分享</view>
				</view>
			</view>
		</up-popup>
		<!-- 海报分享 -->
		 <view class="qrShare">
			 <SharePoster ref="refSharePoster"/>
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
import {
		ref,
		computed,
		nextTick,
		onMounted,
	} from "vue";
	import {
		onLoad,
		onUnload,
		onShow,
		onPageScroll,
	} from "@dcloudio/uni-app";

	// import {
	// 	useStore
	// } from "vuex";
    import SharePoster from "./SharePoster.vue"
	import request from "@/utils/request.js"
    const routeParams = ref('');
    // 页面加载
	// onLoad((options) => {
	// 	console.log("option===", options);
	// 	// console.log("refSharePoster.value====",refSharePoster.value)
	// 	routeParams.value = options;

	// 	if (!options.group_id || options.group_id === "null") {
	// 		isEmpty.value = true;
	// 		return;
	// 	}
	// });
    // 弹出分享按钮
	const isShowModal = ref(false);
	const showShareBtn = () =>{
		isShowModal.value = true;
	}
	function close() {
	isShowModal.value = false;
	}
	const wechatShare = () => { 
		uni.share({
			provider: "weixin",
			scene: "WXSceneSession",
			type: 1,
			summary: detail.value.name,
			success: function (res) {
				console.log("success:" + JSON.stringify(res));
			},
			fail: function (err) {
				console.log("fail:" + JSON.stringify(err));
			}
		});
	}
	// 二维码分享
	const qrCodeSrc = ref('');
	const qrCodeShow = ref(false);
	const shareQRCode = () => { 
		qrCodeImg()
	}
    const qrCodeImg = (type='qrcode') => { 
        let data = {
			// path: `pagesSub/runningTeam/teamDetail?group_id=${routeParams.value.group_id}`
			path: routeParams.value
			
		}
		request.post(
				`/image-service/wxacode`,data
			)
			.then((res) => {
                if(type=='poster'){
					// qrCodeSrc.value = res.image
					console.log("detail.value=====",detail.value)
                    refSharePoster.value.open({imgUrl:detail.value.avatar_url,title:detail.value.name,time:detail.value.establish_time,codeImg:res.image})
                    return;
				}
				qrCodeShow.value = true;
				nextTick(() => {
					// console.log("res==base64", res)
					qrCodeSrc.value = res.image
				})
			});
	}

	const refSharePoster = ref(null)
	const closeQrcode=() => { 
		qrCodeShow.value = false;
	}
	// 海报分享
	const sharePoster = () => { 
		qrCodeImg('poster')
	}	
    const detail = ref({});
    function open(val,routeParamsUrl) {
		console.log("routeParams====",routeParamsUrl)
        isShowModal.value = true;
        detail.value = val;
        routeParams.value = routeParamsUrl;
    }
    defineExpose({
        open
    });
</script>
<script>
export default {
  options: {
    styleIsolation: 'shared'
  }
}
</script>
<style lang="scss" scoped>
	.iconList {
		display: flex;
		justify-content: center;
		justify-items: center;
		align-items: center;
		padding: 40rpx 75rpx 40rpx;
		
		.item {
			position:relative;
			width:200rpx;
			text-align: center;
			display: flex;
			align-items: center;
			flex-direction: column;
			&:nth-child(1) {
				.img {
					background:#07C160;
				}
			}
			&:nth-child(2) {
				.img {
					color:#fff;
					background:#999;
				}
			}
			&:nth-child(3) {
				.img {
					background:#A0522D;
				}
			}
			.img {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 80rpx;
				height:80rpx;
				border-radius: 50%;
				color:#fff;
				
			}
			.txt {
				margin-top:20rpx;
			}
			.wechatBtn {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				z-index: 1;
				opacity:0;
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