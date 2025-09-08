<template>
  <view>
		<rich-text class="richText" :nodes="detail.Content"></rich-text>
  </view>
</template>
<script>
	import agree_signUp from "@/utils/agree_signUp.js"
	import agree_privy from "@/utils/agree_privy.js"
export default {
  data() {
    return {
			detail: {
				Content: ""
			}
		};
  },
	onLoad(options) {
		if (options.type === 'signUp') {
			this.detail.Content = agree_signUp
			this.detail.Content = agree_privy
		}
	},
  methods: {
		getDetail(ID) {
			const data = {
				CallIndex: "RentalServices"
			}
			this.$axios.post(`/client/article/detail/callindex`, data).then(res => {
				this.detail = res
				
				uni.setNavigationBarTitle({
					title: res.Title
				});
			})
		}
	}
};
</script>

<style lang="scss" scoped>
.h1{
	padding: 24rpx;
	font-size: 40rpx;
	font-weight: 600;
	line-height: 120%;
}

.richText{
	line-height: 1.3;
	padding: 20px 24rpx 50rpx;
}
</style>
