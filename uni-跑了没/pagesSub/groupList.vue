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
			<GroupItem :item="item" v-for="(item,index) in dataList" :key="index" />
    </mescroll-uni>
		
		<section v-if="!userInfo.running_group" class="section-bottom">
			<view style="padding: 0rpx 54rpx 20rpx">
				<u-button type="primary" shape="circle" @click="openForm()">创建跑团</u-button>
			</view>
		</section>
		
		<PhoneLogin ref="refPhoneLogin" />
  </div>
</template>

<script>
		import GroupItem from "@/components/GroupItem.vue"
	import PhoneLogin from "@/components/common/PhoneLogin.vue";
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";

export default {
  mixins: [MescrollMixin],
  components: { PhoneLogin, GroupItem },
  data() {
    return {
			searchTxt: "",
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
	onShow() {
	  // 移除全局自定义事件监听器
	  uni.$off("updateList");
	
	  // 监听全局的自定义事件
	  uni.$once("updateList", (data) => {
	    // 判断二级页面是否修改过数据，如果修改过，需要刷新首页，保持信息一致
	    if (data.isChange) {
	      this.refreshList();
	    }
	  });
	},
  methods: {
		viewDetail(item) {
			uni.setStorageSync('orderDetail', item)
			// uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`)
		},
		openForm() {
			if (!this.$store.state.userInfo.id) {
				return this.$refs.refPhoneLogin.open()
			}
			
			uni.$u.route(`pagesSub/groupForm`)
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
      	"keyword": this.searchTxt
      }
      this.$axios.get(`/running-group/api/v1/groups/list`, data).then(res => {
          uni.hideLoading();

          //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
          this.mescroll.endSuccess(res.data.length)

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