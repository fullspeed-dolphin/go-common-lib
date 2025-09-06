<template>
	<view class="index-page">
		<view class="section-search">
			<u-search placeholder="搜索" shape="square" bgColor="#fff9f3" placeholderColor="#a67b6f" searchIconColor="#634942"
				borderColor="#634942" :showAction="false" v-model="searchTxt" @change="$u.debounce(confirmSearch, 300)"></u-search>
		</view>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="120rpx">
			<view class="" style="position:relative;z-index: 10;">

				<view v-if="!isSearching" class="section-banner">
					<u-swiper :list="bannerList" height="168rpx" indicator circular indicatorMode="dot"></u-swiper>
				</view>

				<SectionPanel title="文字作品" type="text">
					<TextItem v-for="(item, index) in dataList" :data="item" :key="index" />
				</SectionPanel>
			</view>
		</mescroll-uni>

		<tabbar type="textList" />
	</view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"
	import SectionPanel from "@/components/SectionPanel.vue"
	import TextItem from "@/components/TextItem.vue"
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	export default {
		mixins: [MescrollMixin],
		components: {
			tabbar,
			SectionPanel,
			TextItem
		},
		data() {
			return {
				searchTxt: "",
				isSearching: false,
				bannerList: [
					"https://cdn.uviewui.com/uview/album/1.jpg",
					"https://cdn.uviewui.com/uview/album/1.jpg",
					"https://cdn.uviewui.com/uview/album/1.jpg",
				],
				dataList: [{}, {}, {}, {}],
			};
		},
		onLoad(option) {
			// console.log("option", option);
		},
		methods: {
			confirmSearch() {
				const searchTxt = this.searchTxt.trim();

				this.isSearching = !!searchTxt;

				this.refreshList()
			},
			refreshList() {
				this.$nextTick(() => {
					this.mescroll.resetUpScroll(); // 重置列表数据为第一页
					this.mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
				});
			},
			goLink() {
				this.$goUrl("/pages/orderDetail")
			},
			getList(page) {
				uni.showLoading({
					mask: true
				});
				const data = {
					"Page": page.num,
					"Size": "10",
					text: this.searchTxt
				}
				this.$axios.post(`/api/store/balance/record?page=${page.num}`, data)
					.then(async (res) => {
						console.log(res)
						uni.hideLoading();

						//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
						this.mescroll.endSuccess(res.List.length);

						//如果是第一页需手动制空列表
						if (page.num == 1) {
							this.dataList = [];
						}

						this.dataList = this.dataList.concat(res.List); //追加新数据
					})
					.catch((error) => {
						uni.hideLoading();
						this.mescroll.endSuccess();
					});
			},
		}
	};
</script>

<style lang="less" scoped>
	.index-page {
		position: relative;
		background: #fff;

		&::before {
			position: absolute;
			content: "";
			top: 0;
			width: 100%;
			height: 390rpx;
			background: linear-gradient(#fef4e1, #fffefc);
		}
	}

	.section-banner {
		width: 690rpx;
		margin: 0 auto;
		border-radius: 14rpx !important;
		overflow: hidden;
	}

	.h2 {
		font-size: 32rpx;
		font-weight: 600;
	}

	.nav-item {
		min-width: 25%;
		margin-top: 30rpx;

		.txt {
			margin-top: 10rpx;
			font-size: 24rpx;
		}
	}

	.order-item {
		min-width: 33.33%;
		margin-top: 50rpx;
		padding-left: 20rpx;

		.number {
			color: #409eff;
			font-weight: 600;
			font-size: 32rpx;
		}

		.txt {
			margin-top: 10rpx;
			color: #999;
			font-size: 24rpx;
		}
	}

	::v-deep {
		.section-search {
			height: 120rpx;
		}

		.u-search {
			position: fixed;
			top: 0;
			width: 100%;
			z-index: 10;
			background: transparent;
			padding: 26rpx 30rpx;

			&::before {
				position: absolute;
				content: "";
				top: 0;
				left: 0;
				width: 100%;
				height: 120rpx;
				background: linear-gradient(#fef4e1, #fef6e7);
			}

			.u-search__content {
				position: relative;
				z-index: 1;
				border-radius: 14rpx !important;
			}
		}
	}
</style>