<template>
	<view class="index-page">
		<view class="bg" :style="'background: linear-gradient('+ cardEntity.bg +')'"></view>
		<view class="" style="position:relative;z-index: 10;">
			<view v-if="pageType === 'photo'" class="section-banner">
				<image class="img" :src="detail.pic" mode="aspectFill"></image>
			</view>
			<view class="panel-info section-info">
				<view class="van-hairline--bottom" style="height:108rpx;margin-bottom: 24rpx;padding-top:10rpx;">
					<view class="h1" style="color:#0f1d34;">{{detail.title}}</view>
					<view class="h5" style="font-size: 24rpx;color:#28477b;margin-top:20rpx;">基本信息</view>
				</view>
				
				<view class="cell flex-row">
					<view class="label">文件编号</view>
					<view class="value">2462346234</view>
				</view>
				<view class="cell flex-row">
					<view class="label">作者</view>
					<view class="value">2462346234</view>
				</view>
				<view class="cell flex-row">
					<view class="label">尺寸</view>
					<view class="value">2462346234</view>
				</view>
				<view class="cell flex-row">
					<view class="label">文件格式</view>
					<view class="value">2462346234</view>
				</view>
				<view class="cell flex-row">
					<view class="label">用途</view>
					<view class="value">商业用途，可用于盈利性的商业，广告目的</view>
				</view>
				<view class="cell flex-row">
					<view class="label">版本登记号</view>
					<view class="value">未登记</view>
				</view>
				
				<view class="flex-between-center" style="margin-top:32rpx;">
					<view class="apply-btn">
						<u-button :text="cardEntity.applytxt" icon="download" :color="cardEntity.color" size="small" type="primary"></u-button>
					</view>
					<view class="favor-btn">
						<u-button text="收藏" size="small"></u-button>
					</view>
				</view>
			</view>
			<SectionPanel title="推荐作品" :type="pageType">
				<ArtItem v-for="(item, index) in dataList" :data="item" :key="index" />
			</SectionPanel>
		</view>
	</view>
</template>
<script>
	import tabbar from "@/components/tabBar.vue"
	import SectionPanel from "@/components/SectionPanel.vue"
	import ArtItem from "@/components/ArtItem.vue"
	export default {
		components: {
			tabbar,
			SectionPanel,
			ArtItem
		},
		data() {
			return {
				detail: {},
				dataList: [{}, {}, {}, {}],
			};
		},
		computed: {
			cardEntity() {
				const cardEntity = {
					'photo': {
						icon: 'icon-tupian',
						color:"linear-gradient(to right, #aaa3f2, #b9b4f9)",
						applytxt: "原图申请",
						bg:"#d8d5fc,#f2f2fd"
					},
					'video': {
						icon: 'icon-shipin',
						color:"#809e9f",
						applytxt: "原图申请",
						bg:"#e4fcfd,#f5fefe"
					},
					'audio': {
						icon: 'icon-yinpin',
						color:"linear-gradient(to right, #f9b7b5, #fecaca)",
						applytxt: "原图申请",
						bg:"#fde4e3,#fef7f6"
					},
					'art': {
						icon: 'icon-huabi-',
						color:"linear-gradient(to right, #6ea9c5, #4b788d)",
						applytxt: "原图申请",
						bg:"#cee8fc,#f0f8fe"
					},
					'text': {
						icon: 'icon-wenzi',
						color:"#f9b7b5",
						applytxt: "立即下载原曲",
						bg:"#fef2db,#fefbf4"
					},
				}
				
				return cardEntity[this.pageType]
			}
		},
		onLoad(option) {
			console.log("option", option);
			this.detail = option
			this.pageType = option.pageType
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
		overflow: hidden;
		.bg{
			position: absolute;
			content: "";
			top:0;
			width:100%;
			height: 390rpx;
			background: linear-gradient(#cee8fc, #f0f7fc);
		}
	}

	.section-banner {
		width: 690rpx;
		padding-top: 20rpx;
		margin: 0 auto;
		overflow: hidden;
		.img{
			width:100%;
			border-radius: 14rpx !important;
			height: 268rpx;
		}
	}

	.h2 {
		font-size: 32rpx;
		font-weight: 600;
	}

	.cell{
		line-height: 47rpx;
		.label{
			width: 174rpx;
			color: #66768a;
		}
		.value{
			color: #212121;
			line-height: 36rpx;
			width: 450rpx;
		}
	}
	::v-deep{
		.apply-btn{
			.u-button{
				height: 67rpx;
				width: 286rpx;
			}
		}
	}
	.favor-btn{
		::v-deep{
			.u-button{
				height: 67rpx;
			}
		}
	}
</style>