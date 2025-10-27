<template>
  <div class="">
		<u-navbar autoBack placeholder title="跑团成员"></u-navbar>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="190">
      <view class="member-item flex-start" v-for="(item,index) in dataList" :key="index">
      	<view class="img-box">
      		<image class="img" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
      	</view>
      	<view class="">
      		<view class="mb10" style="color: #222;">{{item.nickname || '成员'}}</view>
      		<!-- {{item.user_phone}} -->
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
  onLoad(options) {
		console.log(options)
		this.group_id = options.group_id
	},
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
				"pageIndex": page.num - 1,
				"pageSize": 10,
				groupId: Number(this.group_id)
			}
			
      this.$axios.post(`/running-group/api/v1/groups/members`, data)
        .then(async (res) => {
          uni.hideLoading();
					
					//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
					this.mescroll.endSuccess(res.memberships.length);

          //如果是第一页需手动制空列表
          if (page.num == 1) {
            this.dataList = [];
          }

          this.dataList = this.dataList.concat(res.memberships); //追加新数据
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
		.img-box{
			border-radius: 999px;
			background: #FFFFFF;
			border: 2rpx solid #707070;
			margin-right: 30rpx;
			overflow: hidden;
		}
		.img{
			display: block;
			width: 106rpx;
			height: 106rpx;
		}
	}
</style>