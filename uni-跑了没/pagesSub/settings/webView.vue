<template>
  <view>
		<web-view :src="link"></web-view>
  </view>
</template>
<script>
export default {
  data() {
    return {
			link: ""
		};
  },
	onLoad(options) {
		console.log('options==>', options.link)
		this.link = options.link
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
