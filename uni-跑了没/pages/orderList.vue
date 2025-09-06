<template>
  <div class="">
		<view class="list2" style="height:56px;padding-top:20rpx;">
			<u-tabs :list="tabList" :activeStyle="{
			        color: '#F1FD53',
							borderColor: '#2E2F30',
							background: '#2E2F30'
			    }" @change="changeTab"></u-tabs>
		</view>
		
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="30">
      <view v-if='tabActive === "订单列表"' class="order-item" v-for="(item,index) in dataList" :key="index" @click="goLink(item)">
				<view class="flex-between-center u-border-bottom" style="height:76rpx;">
					<view v-if='tabActive === "订单列表"' class="">
						下单时间 {{item.CreateTime}}
					</view>
					<view v-else class="" style="color: #F34D4D;font-weight: 600;">
						配货中
					</view>
					<!-- <view class="type">
						配货完成
					</view> -->
				</view>
				<view v-for="(goods, indexGoods) in item.PurchaseOrderDetails" style="padding: 24rpx 0;">
					<view class="flex-between-center" style="">
						<view class="name">
							{{goods.Name}}
						</view>
						<view class="price">
							<text style="font-size: 24rpx;">￥</text>
							{{goods.Price}}
						</view>
					</view>
					<view class="flex-between-center" style="color: #616161;font-size: 24rpx;margin-top: 8rpx;">
						<view>{{goods.Color}}</view>
						<view>x{{goods.Quantity}}</view>
					</view>
					<!-- <view v-if='tabActive !== "订单列表"' class="flex-between-center" style="color: #F34D4D;font-size: 24rpx;margin-top: 8rpx;">
						<view>正在配货中</view>
					</view> -->
				</view>
				<view class="total">
					合计 
					<text class="flex-start" style="font-size: 32rpx;font-weight: 600;margin-left:8rpx;">
							<text style="font-size: 24rpx;">￥</text>
							{{item.Price}}
					</text>
				</view>
      </view>
			
			<view v-if='tabActive !== "订单列表" && dataList.length' class="order-item" key="2345753457">
				<view class="flex-between-center u-border-bottom" style="height:76rpx;">
					<view class="" style="color: #F34D4D;font-weight: 600;">
						配货中
					</view>
					<!-- <view class="type">
						配货完成
					</view> -->
				</view>
				<view v-for="(goods, indexGoods) in dataList" style="padding: 24rpx 0;">
					<view class="flex-between-center" style="">
						<view class="name">
							{{goods.Name}}
						</view>
						<view class="price">
							<text style="font-size: 24rpx;">￥</text>
							{{goods.Price}}
						</view>
					</view>
					<view class="flex-between-center" style="color: #616161;font-size: 24rpx;margin-top: 8rpx;">
						<view>{{goods.Color}}</view>
						<view>x{{goods.Quantity}}</view>
					</view>
				</view>
				<view class="total">
					合计 
					<text class="flex-start" style="font-size: 32rpx;font-weight: 600;margin-left:8rpx;">
							<text style="font-size: 24rpx;">￥</text>
							{{totalPrice}}
					</text>
				</view>
			</view>
    </mescroll-uni>
  </div>
</template>

<script>
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
export default {
  mixins: [MescrollMixin],
  data() {
    return {
			tabList: [
				{ name: '订单列表', value: '订单列表'},
				{ name: '未配货列表', value: '未配货列表'},
			],
      dataList: [],
			tabActive: '订单列表',
			totalPrice: 0
    };
  },
  onLoad() {},
  methods: {
		changeTab(item) {
			console.log(item)
			this.tabActive = item.value;
			
			this.refreshList()
		},
    refreshList() {
      this.$nextTick(() => {
        this.mescroll.resetUpScroll(); // 重置列表数据为第一页
        this.mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
      });
    },
		goLink(item) {
			this.$goUrl("/pages/orderDetail?ID=" + (item.ID || 'outStock'))
		},
    getList(page) {
      uni.showLoading({ mask: true });
			const data = {
				"Page": page.num,
				"Size": "10",
			}
			
			const list = this.tabActive === "订单列表" ? `/api/store/purchase/order/list?page=${page.num}` : `/api/store/outStock/record/list?page=${page.num}`
      this.$axios.post(list, data)
        .then(async (res) => {
          uni.hideLoading();
					
					//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
					this.mescroll.endSuccess(res.List.length);
					
					if (this.tabActive !== "订单列表") {
						this.dataList = res.List;
						this.totalPrice = res.Price
						return;
					}

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
  },
};
</script>

<style lang="scss">
	.total{
		height: 76rpx;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 24rpx 0;
	}
	::v-deep{
		.u-tabs{
			padding: 0 16rpx;
		}
		.list2{
			.u-tabs__wrapper__nav__item__text{
				width: 342rpx;
			}
		}
		.u-tabs__wrapper__nav__item__text{
			width: 303rpx;
			height: 64rpx!important;
			padding: 16rpx 10rpx;
			border-radius: 12rpx;
			background: #FFFFFF;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			border: 1px solid #D8D8D8;
			font-size: 32rpx;
			font-weight: 600;
			/* 文字_中间灰 */
			color: #616161;
		}
		.u-tabs__wrapper__nav__line{
			display: none;
		}
		.u-tabs__wrapper__nav__item{
			padding: 0 8rpx!important;
		}
	}
::v-deep {
  .incomplete {
    .van-tag {
      background: red;
    }
  }
}
.order-item {
  max-width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin: 24rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #222;
	.name{
		font-weight: 500;
	}
	.price{
		font-weight: 600;
	}
	.img{
		border-radius: 10rpx;
		background: #eee;
		margin-right: 20rpx;
	}
}
.section-tab {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 400;
}
.go-btn {
  height: 56rpx;
  padding: 0 30rpx;
  font-weight: 400;
}
</style>