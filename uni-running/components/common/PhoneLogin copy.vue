<template>
  <u-popup :show="isShowPop" mode="bottom" closeable round="15" @close="isShowPop = false">
		<view class="p20">
			<view class="section-box">
				<view class="title flex-center">跑了没小程序申请</view>
			</view>
			<view class="">
				<view class="mt20 mb10">
					获取你的手机号
				</view>
				<view class="c9 fs24 lh36">
					登录小程序，查看用户信息，开发者将在获取你的明示同意后，
					收集你的手机号
				</view>
			</view>
			<view style="margin-top:60rpx;">
				<u-button :disabled="isDisabled" type="primary" color="#19be6b" shape="circle" block open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
					授权手机号登录
				</u-button>
			</view>
		</view>
  </u-popup>
</template>
<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { getCurrentInstance } from 'vue'

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 使用store
const store = useStore()

// 响应式数据
const isShowPop = ref(false)
const isDisabled = ref(false)

// Emits
const emit = defineEmits(['success'])

// 方法定义
const open = () => {
	isShowPop.value = true;
}

const close = () => {
	isShowPop.value = false;
}

const getCode = async () => {
	return (
		await new Promise((resolve) =>
			uni.login({ success: (e) => resolve(e) })
		)
	).code;
}

const getPhoneNumber = async ({ detail }) => {
	// console.log(detail);
	if (detail.errMsg == "getPhoneNumber:fail user deny") {
		uni.$u.toast("用户已拒绝");
		
		isDisabled.value = false;
		return false;
	}
	
	uni.showLoading({
		title: "登录中...",
		mask: true,
	});
	
	isDisabled.value = true;
	
	const data = {
		jsCode: await getCode(),
		encryptedData: detail.encryptedData,
		ivStr: detail.iv,
		phoneCode: detail.code,
	};

	try {
		const res = await proxy.$axios.post("/wechat-login/login", data);
		
		uni.setStorageSync("token", res.sessionToken);
		
		uni.$u.toast("登录成功");
		
		close()
		
		await store.dispatch('getUserInfo')
		
		isDisabled.value = false;
		emit("success");
	} catch (error) {
		console.error(error)
		isDisabled.value = false;
		//TODO handle the exception
	}
}

// 暴露方法给父组件
defineExpose({
	open,
	close
})
</script>

<style lang="scss" scoped>
.section-link {
  padding: 0 60rpx;
}
.section-box {
  padding-top: 30rpx;
  margin-bottom: 55rpx;
}
.title {
  font-size: 34rpx;
  font-weight: 500;
  margin-bottom: 42rpx;
}
.sub-tit {
  font-size: 36rpx;
  letter-spacing: 1.8px;
  color: rgba(68, 68, 68, 1);
}

</style>
