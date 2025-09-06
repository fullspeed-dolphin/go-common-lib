<template>
	<view class="index-page">
		<u-navbar title="跑了没" leftIcon=""></u-navbar>
		<view class="section-search">
			<u-search placeholder="搜索赛事或跑团" bgColor="transparent" placeholderColor="#b1c5d3" searchIconColor="#fff"
				borderColor="#fff" :showAction="false" v-model="searchTxt"
				@change="$u.debounce(confirmSearch, 300)"></u-search>
		</view>
		<view class="tabs flex-between-center" style="padding: 0 34rpx;">
			<view class="tab-item flex-center" :class="{active: tabActive === item}" @click="changeTab(item)" v-for="(item,index) in tabsList" :key="index">
				{{item}}
			</view>
		</view>
		<OnlineEvents v-if="tabActive === '线上赛事'" />
		<OfflineEvents v-if="tabActive === '线下活动'" />
		<GroupEvents v-if="tabActive === '加入跑团'" />
		<!-- <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="180rpx">
			<view class="" style="position:relative;z-index: 10;">
				<SectionPanel title="视频作品" type="video">
					<VideoItem v-for="(item, index) in dataList" :data="item" :key="index" />
				</SectionPanel>
			</view>
		</mescroll-uni> -->
	</view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"
	import OfflineEvents from "@/components/pageEventList/OfflineEvents.vue"
	import OnlineEvents from "@/components/pageEventList/OnlineEvents.vue"
	import GroupEvents from "@/components/pageEventList/GroupEvents.vue"
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	export default {
		mixins: [MescrollMixin],
		components: {
			tabbar,
			OfflineEvents, OnlineEvents, GroupEvents
		},
		data() {
			return {
				searchTxt: "",
				isSearching: false,
				tabsList: ['线上赛事','线下活动','加入跑团'],
				tabActive: '加入跑团',
				dataList: [{}, {}, {}, {}],
			};
		},
		onLoad(option) {
			// console.log("option", option);
		},
		methods: {
			changeTab(item){
				this.tabActive = item;
			},
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
	.tab-item{
		width: 212rpx;
		height: 81rpx;
		border-radius: 60rpx 60rpx 60rpx 60rpx;
		border: 2rpx solid rgba(255,230,0,0.16);
		font-weight: 500;
		font-size: 30rpx;
		color: rgba(255,255,255,0.8);
		line-height: 36rpx;
		&.active{
			background: linear-gradient( 226deg, #FF8C00 0%, #3E45FF 100%);
		}
	}
	.index-page {
		position: relative;
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
		}

		.u-search {
			background: transparent;
		}
	}
</style>