<template>
	<view>
		<!-- <u-navbar :title="null" bgColor="transparent"></u-navbar> -->
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" top="0">
		  <view style="padding: 34rpx">
				<view class="u-mb-20" v-for="(item, index) in dataList" :key="index">
					<EventItem :item="item" :key="index" height="474rpx" />
				</view>
			</view>
		</mescroll-body>

		<UserLogin ref="refUserLogin" @success="getMemberList()"/>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		nextTick
	} from "vue";
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from "@dcloudio/uni-app";
	import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback } = useMescroll(onPageScroll, onReachBottom);

	import {
		useStore
	} from "vuex";
	import UserLogin from "@/components/UserLogin.vue";
	import EventItem from "@/components/EventItem.vue";
	import request from "@/utils/request.js"
			
	// 使用store
	const store = useStore();
	const refUserLogin = ref(null);

	const dataList = ref([]);
	const getList = (mescroll) => {
	  uni.showLoading({ mask: true });
	  const data = {
	    pageIndex: mescroll.num - 1,
	    pageSize: 15,
	  };
		
		Promise.all([
			request.get(`/event-api/fsc_swipers?status=ACT&visibility=public`), 
			request.get(`/event-api/getOfflineEventSwiper`)
		]).then(res => {
			res =  res.flat();
	      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
	      mescroll.endSuccess(res.length);
	
	      //如果是第一页需手动制空列表
	      if (mescroll.num == 1) {
	        dataList.value = [];
	      }
	
	      dataList.value = dataList.value.concat(res); //追加新数据
	    })
	    .catch((error) => {
	      uni.hideLoading();
	      mescroll.endErr();
	    });
	};

	// #ifdef MP-WEIXIN
	// 分享给朋友
	onShareAppMessage(() => {
		return {
			title: '跑了没 - ' + (detail.value.name || ''),
			imageUrl: detail.value.avatar_url, // 可以设置自定义分享图片，留空则使用当前页面截图
		};
	});
	// 分享到朋友圈
	onShareTimeline(() => {
		return {
			title: '跑了没 - ' + (detail.value.name || ''),
			query: '', // 可以携带参数
			imageUrl: detail.value.avatar_url, // 可以设置自定义分享图片
		};
	});
	// #endif
</script>

<style lang="less" scoped>

</style>