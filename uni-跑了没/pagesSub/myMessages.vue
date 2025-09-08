<template>
  <div class="">
		<u-navbar title="我的消息"></u-navbar>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="88">
      <view class="member-item flex-start" :class="{'u-border-bottom': index !== 4}" v-for="(item,index) in 5" :key="index">
      	<image class="img" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
      	<view class="flex-start" >
      		<view class="text" style="width: 432rpx;">
      			<view class="name ellipsis">赛事小秘书</view>
      			<view class="desc ellipsis2">奔跑吧！广州·增城站广州·增城站</view>
      		</view>
      		<view class="time">
      			9月20日
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
      dataList: [],
    };
  },
  onLoad() {},
  methods: {
    refreshList() {
      this.$nextTick(() => {
        this.mescroll.resetUpScroll(); // 重置列表数据为第一页
        this.mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
      });
    },
    getList(page) {
      uni.showLoading({ mask: true });
			const data = {
				"Page": page.num,
				"Size": "10",
			}
			
      this.$axios.post(`/api/store/purchase/order/list?page=${page.num}`, data)
        .then(async (res) => {
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
.member-item{
		margin: 20rpx 34rpx;
		color: #666;
		.img{
			width: 106rpx;
			height: 106rpx;
			border-radius: 999px;
			background: #FFFFFF;
			border: 1px solid #707070;
			margin-right: 30rpx;
		}
		.name{
			margin-top:12rpx;
			font-weight: 500;
			font-size: 30rpx;
			color: #000000;
			line-height: 42rpx;
		}
		.desc{
			margin-top:10rpx;
			color: #666;
			font-size: 24rpx;
			line-height: 34rpx;
		}
		.time{
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.u-border-bottom{
		padding-bottom: 14rpx;
		border-color: #f5f5f5!important;
	}
</style>