<template>
  <view class="index-page">
		<u-navbar title="运动"></u-navbar>
		
		<view class="flex-center" style="height: 80vh; font-weight: 500;
font-size: 34rpx;
color: #707070;">
			暂未开始 
		</view>
		
		<tabbar type="sport"/>
  </view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"

export default {
	components: { tabbar },
  data () {
    return {
			searchTxt: "",
			bannerList: [
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
				"https://cdn.uviewui.com/uview/album/1.jpg",
			],
		};
  },
  methods: {
		confirmSearch() {
			const searchTxt = this.searchTxt.trim()
			
		},
		routeTo(link) {
			console.log(link)
			uni.$u.route(link);
		},
		getBannerList() {
			if(!this.bannerList.length) {
				uni.showLoading({mask: true})
			}
			const data = {
				Position: 0
			}
			this.$axios.post(`/Advertisement/Search/List`, data).then(res => {
				this.bannerList = res.List;
				uni.hideLoading()
			})
		},
	}
};
</script>

<style lang="less" scoped>

</style>
