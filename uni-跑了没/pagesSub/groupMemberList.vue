<template>
  <div class="">
		<u-navbar title="跑团成员"></u-navbar>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="190">
      <view class="member-item flex-start" v-for="(item,index) in 5" :key="index">
      	<image class="img" src="https://cdn.uviewui.com/uview/album/1.jpg" mode="aspectFill"></image>
      	<view class="flex-start">
      		昵称
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
		padding: 11rpx 34rpx;
		color: #666;
		.img{
			display: block;
			width: 106rpx;
			height: 106rpx;
			border-radius: 999px;
			background: #FFFFFF;
			border: 2rpx solid #707070;
			margin-right: 30rpx;
		}
	}
</style>