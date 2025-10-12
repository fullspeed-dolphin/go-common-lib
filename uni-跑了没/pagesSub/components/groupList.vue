<template>
  <u-popup :show="isShowPop" mode="bottom" zIndex="10" closeable round="15" @close="isShowPop = false">
		<view class="flex-center" style="height:100rpx;font-size: 32rpx;">
			请选择跑团
		</view>
    <section class="section-filter bgf" style="margin-top:-20rpx;">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="refreshList" placeholder="搜索跑团" shape="round" bgColor="#fff" borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
    </section>
		<view class="" style="overflow: auto;max-height: 600rpx;min-height:400rpx;">
			<view class="group-item flex-start" v-for="(item,index) in dataList" :key="index">
				<image class="poster" :src="item.avatar_url || '../static/run.png'" mode="aspectFill"></image>
				<view class="text">
					<view class="flex-between-center" style="width: 520rpx;">
						<view class="">
							<view class="name ellipsis">{{item.name}}</view>
							
							<view class="city flex-row">
								<view class="ellipsis mr10" style="max-width:350rpx;">
									{{item.establish_location}}
								</view>
								{{item.total_members}}人
							</view>
						</view>
						<u-button type="primary" size="small" shape="circle" @click="joinGroup(item)">加入</u-button>
					</view>
					<view class="desc ellipsis">{{item.introduction}}</view>
				</view>
			</view>
		</view>
  </u-popup>
</template>

<script>
import dayjs from '@/uni_modules/uview-ui/libs/util/dayjs.js';

const taleParams = {
  orderStatus: "",
};

export default {
  components: {},
  data() {
    return {
			searchTxt: "",
      isShowPop: false,
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
		open() {
			this.isShowPop = true;
			this.getList()
		},
		close() {
			this.isShowPop = false;
		},
    getList() {
      uni.showLoading({ mask: true });
      
      const data = {
      	"pageIndex": 0,
      	"pageSize": 20,
      	"keyword": this.searchTxt
      }
      this.$axios.get(`/running-group/api/v1/groups/list`, data).then(res => {
				uni.hideLoading();

				this.dataList = res.data;
			})
    },
		joinGroup(item) {
			if (!this.$store.state.userInfo.id) {
				return this.$refs.refPhoneLogin.open()
			}
		  uni.showModal({
		    title: "提示",
		    content: "是否确认加入该跑团？",
		    success: (res) => {
		      if (res.confirm) {
		        const data = {
		          running_group: Number(item.group_id)
		        };
		
		        uni.showLoading({ mask: true });
		        this.$axios
		          .post(`/user-api/user/joinRunningGroup`, data)
		          .then(async (res) => {
		            uni.hideLoading();
		            this.$toast("加入成功！");
								
								this.close()
								
								await this.$store.dispatch('getUserInfo')
								
								this.$emit('success')
		          });
		      } else if (res.cancel) {
		        console.log("用户点击取消");
		      }
		    },
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
  width: 100%;
}
</style>