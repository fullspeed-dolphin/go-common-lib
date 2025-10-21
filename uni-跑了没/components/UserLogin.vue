<template>
	<view class="">
		<PhoneLogin ref="refPhoneLogin" @success="successLogin"/>
		<AccessUser ref="refAccessUser"/>
	</view>
</template>
<script>
	import PhoneLogin from "@/components/common/PhoneLogin.vue"
	import AccessUser from "@/components/common/AccessUser.vue"
	export default {
		components: {PhoneLogin, AccessUser},
		data() {
			return {
				
			};
		},
		methods: {
			open() {
				this.$refs.refPhoneLogin.open()
			},
			// 登录成功后 如果用户没有头像信息，弹窗让用户填信息
			successLogin(hasProfilePic) {
				if (!hasProfilePic) {
					return this.$refs.refAccessUser.open()
				}
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>