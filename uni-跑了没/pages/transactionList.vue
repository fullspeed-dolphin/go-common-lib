<template>
  <div class="">
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList">
      <view class="order-item" v-for="(item,index) in dataList" :key="index">
				<view class="" style="padding: 24rpx 0;">
					<view class="flex-between-center" style="">
						<view class="name">
							{{item.Remark}}
						</view>
						<view class="price" :class="{red: item.Remark === '消费'}">
							<text v-if="item.Remark === '消费'" style="font-size:24rpx;">-</text>
							<text style="font-size:24rpx;">￥</text>
							{{item.Price}}
						</view>
					</view>
					<view class="flex-between-center" style="color: #616161;font-size: 24rpx;margin-top: 8rpx;">
						<view>{{item.CreateTime}}</view>
						<view>余额￥{{item.Balance}}</view>
					</view>
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
			AreaList: [
				{ name: '订单列表', value: '订单列表'},
				{ name: '未配货列表列表', value: '未配货列表列表'},
			],
      dataList: [],
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
		goLink() {
			this.$goUrl("/pages/orderDetail")
		},
    getList(page) {
      uni.showLoading({ mask: true });
			const data = {
				"Page": page.num,
				"Size": "10",
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
  },
};
</script>

<style lang="scss">
	::v-deep{
		.mescroll-uni-fixed{
			top:0!important;
		}
	}
.red{
	color: #F34D4D;
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
}
</style>