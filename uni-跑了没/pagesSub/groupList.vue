<template>
  <div class="">
		<u-navbar title="跑团招募"></u-navbar>
    <section class="section-filter bgf">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="refreshList" placeholder="搜索跑团" shape="round" bgColor="#fff" borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
			
      <!-- <u-tabs lineWidth="375rpx" lineHeight="2" :duration="0" 
			:inactiveStyle="{color: '#000'}"
			:activeStyle="{color: '#FF8C00'}"
			:list="tabList" @change="changeTab" :scrollable="false" keyName="label" lineColor="#FF8C00" /> -->
    </section>
    <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getList" top="240">
			<view class="" style="height:40rpx"></view>
			<view class="group-item flex-start" v-for="(item,index) in dataList" :key="index" @click="$u.route({url: `pagesSub/groupDetail`, params: item})">
				<image class="poster" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				<view class="text">
					<view class="flex-between-center" style="width: 520rpx;">
						<view class="">
							<view class="name ellipsis">{{item.name}}</view>
							<view class="city ellipsis">{{item.establish_location}} {{item.total_members}}人</view>
						</view>
						<u-button type="primary" size="small" shape="circle" text="加入"></u-button>
					</view>
					<view class="desc ellipsis">{{item.introduction}}</view>
				</view>
			</view>
    </mescroll-uni>
		
		<section v-if="!userInfo.running_group" class="section-bottom">
			<view style="padding: 0rpx 156rpx 20rpx">
				<u-button type="primary" shape="circle" @click="$u.route(`pagesSub/groupForm`)">创建跑团</u-button>
			</view>
		</section>
  </div>
</template>

<script>
import tabbar from "@/components/tabBar.vue";
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
import dayjs from '@/uni_modules/uview-ui/libs/util/dayjs.js';

const taleParams = {
  orderNo: "",
  orderStatus: "",
  linkTelPhone: "",
  storeId: "",
  payChannel: "",
  isAddOrder: "",
  thirdPayOrderNo: "",
  dateRange: [],
};

export default {
  mixins: [MescrollMixin],
  components: {},
  data() {
    return {
			searchTxt: "",
      taleParams: taleParams,
      tabActive: 0,
      tabList: [
				{ label: "同城", value: 0 },
				{ label: "热门", value: 1 },
			],
      curTab: {},
      dataList: [],
    };
  },
	computed: {
		userInfo() {
			return this.$store.state.userInfo
		}
	},
  methods: {
    changeTab(detail) {
      this.curTab = detail;
      console.log(detail);

      this.taleParams.orderStatus = detail.value;

      this.refreshList();
    },
    changeDropdown(e) {
      console.log(e);
      this.taleParams.orderStatus = e;
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
      const {
        orderNo,
      } = this.taleParams;
      
      const data = {
      	"pageIndex": 0,
      	"pageSize": 10,
      	"keyword": this.searchTxt
      }
      this.$axios.get(`/running-group/api/v1/groups/list`, data).then(res => {
          uni.hideLoading();

          //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
          this.mescroll.endBySize(res.data.length, 8);

          //如果是第一页需手动制空列表
          if (page.num == 1) {
            this.dataList = [];
          }

          this.dataList = this.dataList.concat(res.data); //追加新数据
        })
        .catch((error) => {
          uni.hideLoading();
          this.mescroll.endSuccess(6);
        });
    },
    goPage(item) {
      
    },
  },
};
</script>

<style lang="scss" scoped>
	.group-item{
		padding: 10rpx 34rpx;
		.poster{
			width: 124rpx;
			height: 124rpx;
			background: #C1C5C6;
			margin-right: 40rpx;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
		}
		.name{
			line-height: 40rpx;
			margin-bottom: 12rpx;
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
.filter-btns {
  margin: 30rpx;
  border-radius: 40px;
  color: $color;
  &:after {
    border-color: $color;
    border-radius: 100px;
  }
  .flex-item {
    height: 80rpx;
    &:last-child {
      color: #fff;
      background: $color;
      overflow: hidden;
      border-radius: 0 40px 40px 0;
    }
  }
}
.section-filter {
  position: fixed;
  width: 100%;
  z-index: 10;
}
.section-bottom {
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
}
</style>