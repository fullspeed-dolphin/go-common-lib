<template>
  <div class="">
		<u-navbar placeholder title="我的订单"></u-navbar>
		
		<view class="bgf" style="position: relative;z-index:20;">
			<u-tabs lineHeight="2" :duration="0"
			:inactiveStyle="{color: '#000'}"
			:activeStyle="{color: '#FF8C00'}"
			:list="tabList" @change="changeTab" :scrollable="false" keyName="label" lineColor="#FF8C00" />
		</view>
		
    <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="220">
			<view class="" style="height:40rpx"></view>
			<view class="group-item" v-for="(item,index) in dataList" :key="index" @click="viewDetail(item)">
				<view class="pb20 flex-between-center">
					订单编号:{{item.order_no}} 
					<view class="">
						<u--text v-if="item.status == 'PND'" size='14' type="error" text="待支付"></u--text>
						<u--text v-if="item.status == 'SUCC'" size='14' type="success" text="已付款"></u--text>
						<u--text v-if="item.status == 'FAIL'" size='14' type="error" text="失败"></u--text>
						<u--text v-if="item.status == 'RFND'" size='14' type="info" text="已退款"></u--text>
						<u--text v-if="item.status == 'CXL'" size='14' type="info" text="已取消"></u--text>
						<u--text v-if="item.status == 'EXP'" size='14' type="info" text="已过期"></u--text>
					</view>
				</view>
				<view class="flex-row">
					<image class="poster" :src="item.event_info.background_image_url || '../static/run.png'" mode="aspectFill"></image>
					<view class="text">
						<view class="flex-between-center" style="width: 420rpx;">
							<view class="">
								<view class="name ellipsis2">{{item.event_info.name}}</view>
								<view class="city ellipsis">创建时间: {{item.created_at}}</view>
							</view>
						</view>
						<view class="flex-between-center">
							<view class="flex-row">
								报名费用：
								<view class="ellipsis" style="color:red;">￥{{item.amount_yuan}}</view>
							</view>
							<u-button v-if="item.status === 'PND'" type="primary" color="#19be6b" shape="circle" size="mini" @click="payOrder(item)">
								微信支付
							</u-button>
						</view>
					</view>
				</view>
			</view>
    </mescroll-uni>
  </div>
</template>

<script>
import tabbar from "@/components/tabBar.vue";
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
import dayjs from 'dayjs';

export default {
  mixins: [MescrollMixin],
  components: {},
  data() {
    return {
			searchTxt: "",
      tabActive: 0,
      tabList: [
				{ label: "待付款", value: 'PND' },
				{ label: "已付款", value: 'SUCC' },
				{ label: "已过期", value: 'EXP' },
			],
      curTab: { label: "待付款", value: 'PND' },
      dataList: [],
    };
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
  methods: {
		viewDetail(item) {
			uni.setStorageSync('orderDetail', item)
			uni.$u.route(`/pagesSub/orderDetail`)
		},
    changeTab(detail) {
      this.curTab = detail;
      console.log(detail);

      this.refreshList();
    },
    refreshList() {
      this.$nextTick(() => {
        this.mescroll.resetUpScroll(); // 重置列表数据为第一页
        this.mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
      });
    },
    getList(page) {
      uni.showLoading({ mask: true });
      
      const data = {
      	"pageIndex": page.num - 1,
      	"pageSize": 10,
      	"orderStatus": this.curTab.value
      }
      this.$axios.post(`/pay/order/statusByUser`, data).then(res => {
          uni.hideLoading();

          //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
          this.mescroll.endBySize(res.orders.length, res.total);

          //如果是第一页需手动制空列表
          if (page.num == 1) {
            this.dataList = [];
          }
					
          this.dataList = this.dataList.concat(res.orders); //追加新数据
        })
        .catch((error) => {
          uni.hideLoading();
          this.mescroll.endSuccess();
        });
    },
    payOrder(item) {
			const respay = item.payment_params
      // 触发微信支付
      wx.requestPayment({
      	'timeStamp': respay.timeStamp,
      	'nonceStr': respay.nonceStr,
      	'package': respay.package,
      	'signType': respay.signType,
      	'paySign': respay.paySign,
      	'success': (res) => {
      		uni.hideLoading();
      		this.$toast('支付成功')
      		setTimeout(() => {
      			// uni.navigateBack()
      			uni.$u.route('pagesSub/signUpStatus?order_no=' + item.order_no);
      		}, 300)
      	},
      	'fail': (res) => {
      		uni.hideLoading();
      		console.log("res======>", res)
      		this.$toast('支付未完成')
      		setTimeout(() => {
      			// uni.navigateBack()
      			uni.$u.route('pagesSub/signUpStatus?order_no=' + item.order_no);
      		}, 300)
      	}
      })
    },
  },
};
</script>

<style lang="scss" scoped>
	.group-item{
		padding: 20rpx;
		box-shadow: 1px 1px 10rpx rgba(0,0,0, .1);
		margin: 30rpx;
		.poster{
			width: 124rpx;
			height: 124rpx;
			background: #f5f5f5;
			margin-right: 30rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			line-height: 40rpx;
			margin-bottom: 12rpx;
			width:480rpx;
		}
		.city{
			line-height: 28rpx;
			font-size: 20rpx;
			margin-bottom: 18rpx;
		}
		.desc{
			width: 422rpx;
			line-height: 26rpx;
			font-size: 18rpx;
		}
	}
</style>