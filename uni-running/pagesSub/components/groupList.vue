<template>
	<u-popup :show="isShowPop" mode="bottom" zIndex="10" closeable round="15" @close="isShowPop = false">
		<view class="flex-center" style="height: 100rpx; font-size: 32rpx">
			请选择跑团
		</view>
		<section class="section-filter bgf u-pl-20 u-pr-20" style="margin-top: -20rpx">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="getList" placeholder="搜索跑团" shape="round" bgColor="#fff"
					borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
		</section>
		<scroll-view scroll-y style="overflow: auto; max-height: 600rpx; min-height: 400rpx">
			<GroupItem from="search" :item="item" v-for="(item, index) in dataList" :key="index" @join="joinGroup" />
		</scroll-view>
	</u-popup>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import { useStore } from "vuex";
	import request from "@/utils/request.js"
	import GroupItem from "@/components/GroupItem.vue";
const store = useStore();

	// 模板引用
	const refPhoneLogin = ref(null);

	// 响应式数据
	const searchTxt = ref("");
	const isShowPop = ref(false);
	const dataList = ref([]);

	// Emits
	const emit = defineEmits(["success"]);

	// 方法定义
	const open = () => {
		isShowPop.value = true;
		getList();
	};

	const close = () => {
		isShowPop.value = false;
	};

	const getList = () => {
		uni.showLoading({
			mask: true
		});

		const data = {
			pageIndex: 0,
			pageSize: 20,
			keyword: searchTxt.value,
		};
		request.get(`/running-group/api/v1/groups/list`, data).then((res) => {
			dataList.value = res.data.map(item => ({
				...item,
				introduction: item.introduction?.slice(0, 30) || ''
			}))
		});
	};

	const joinGroup = (item) => {
		uni.showModal({
			title: "提示",
			content: "是否确认加入该跑团？",
			success: (res) => {
				if (res.confirm) {
					const data = {
						running_group: Number(item.group_id),
					};

					uni.showLoading({
						mask: true
					});
					request.post(`/user-api/user/joinRunningGroup`, data)
						.then(async (res) => {
							uni.hideLoading();
							uni.$u.toast("加入成功！");

							close();

							await store.dispatch("getUserInfo");

							emit("success");
						});
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
		});
	};

	// 暴露方法给父组件
	defineExpose({
		open,
		close,
	});
</script>

<style lang="scss">

</style>