<template>
	<view class="">
		<PhoneLogin ref="refPhoneLogin" @success="successLogin"/>
		<AccessUser ref="refAccessUser" @success="emit('success')"/>
	</view>
</template>
<script setup>
import { ref } from 'vue'
import PhoneLogin from "@/components/common/PhoneLogin.vue"
import AccessUser from "@/components/common/AccessUser.vue"

// 模板引用
const refPhoneLogin = ref(null)
const refAccessUser = ref(null)

// 方法定义
const open = () => {
	refPhoneLogin.value.open()
}

const emit = defineEmits(["success"]);

// 登录成功后 如果用户没有头像信息，弹窗让用户填信息
const successLogin = (hasProfilePic) => {
	if (!hasProfilePic) {
		return refAccessUser.value.open()
	} else {
		emit('success')
	}
}

// 暴露方法给父组件
defineExpose({
	open
})
</script>

<style lang="scss" scoped>

</style>