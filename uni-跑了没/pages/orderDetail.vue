<template>
  <div class="">
		<view class="flex-start section-status">
			<!-- <u-icon name="checkmark-circle-fill" color="#222" size="24"></u-icon> -->
			<!-- <u-icon name="more-circle-fill" color="#222" size="24"></u-icon> -->
			<view class="" style="margin-left:24rpx;font-size: 40rpx;font-weight: 600;color: #2E2F30;">
				订单详情
			</view>
		</view>
		
		<view class="order-item" >
			<view class="flex-between-center u-border-bottom b" style="height:72rpx;font-size: 24rpx;">
				<view class="">
					订单列表
				</view>
			</view>
			<view v-for="(goods,index) in detail.PurchaseOrderDetails" :key="index"style="padding: 24rpx 0;">
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
				<view v-if='options.ID === "outStock"' class="flex-between-center" style="color: #F34D4D;font-size: 24rpx;margin-top: 8rpx;">
					<view>正在配货中</view>
				</view>
			</view>
		</view>
		
		<view class="order-item">
			 <view class="flex-between-center" style="color: #222;height:76rpx;">
			 	<view>订单金额</view>
			 	<view style="font-size: 32rpx;font-weight: 600;"><text style="font-size: 24rpx;">￥</text> 
					{{detail.Price}}
				</view>
			 </view>
			 <u-cell v-if="detail.CreateTime" title="下单时间" :value="detail.CreateTime" :border="false"/>
		</view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
    };
  },
  onLoad(options) {
		this.options = options
		this.getDetail()
	},
  methods: {
    getDetail(page) {
      uni.showLoading({ mask: true });
			const data = {
				ID: this.options.ID
			}
			
			if (this.options.ID === "outStock") {
				this.$axios.post(`/api/store/outStock/record/list?page=1`)
				  .then(async (res) => {
						uni.hideLoading();
						res.PurchaseOrderDetails = res.List
						this.detail = res
				  })
				  .catch((error) => {
				    uni.hideLoading();
				  });
					
				return false;
			}
      this.$axios.post(`/api/store/purchase/order/detail`, data)
        .then(async (res) => {
					uni.hideLoading();
					this.detail = res
        })
        .catch((error) => {
          uni.hideLoading();
        });
    },
  },
};
</script>

<style lang="scss">
.section-status{
	width: 702rpx;
	height: 144rpx;
	margin: 24rpx;
	display: flex;
	align-items: center;
	padding: 48rpx 40rpx;
	border-radius: 16rpx;
	background: #F1FD53;
}
::v-deep {
	.u-cell__body{
		height: 76rpx;
		padding:0;
	}
	.u-cell__value,
	.u-cell__title-text{
		font-size: 28rpx;
		color: #222;
	}
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