<template>
	<section class="u-flex-row u-flex-wrap u-pl-34" style="gap: 22rpx;padding-top: 70px;">
		<u-navbar autoBack placeholder title="全速之家" />
		<view v-if="isStaff" class="card-item u-flex-y-center" 
			@click="$u.route('pagesMine/toolkit/Toolkit?role=全速员工')">
			全速员工
		</view>
	</section>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
		useStore
} from "vuex";
import request from "@/utils/request.js"
import { useShare } from "@/composables/useShare.js";

const store = useStore();

// 分享配置
useShare({
	title: '角色选择',
	path: '/pagesMine/toolkit/UserRole'
});

const options = ref([
	{label: '我是摄影师', value: ''},
	{label: '我是团长', value: ''},
	{label: '全速员工', value: ''},
]);

function goPage(item) {
	uni.$u.route(`pagesMine/toolkit/Toolkit?role=${item.label}`)
}

const isStaff = ref(true)
const getUserList = () => {
	const params = {
		code: 'code'
	}
  request.post('/api/code/code', params).then(res => {
		const openid = store.state.userInfo.openid;
		
		isStaff.value = res.some(i => i.openid === openid)
	})
}

onLoad(() => {
	// getUserList()
})
</script>

<style lang="scss" scoped>
.card-item {
	font-weight: bold;
	font-size: 34rpx;
	color: #FFFFFF;
  width: 330rpx;
  height: 150rpx;
	padding-left: 20rpx;
  background: radial-gradient( 0% 0% at 50% 50%, #0080FF 0%, #0064FF 100%);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
}
</style>
