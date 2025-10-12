<template>
  <u-popup :show="isShowPop" mode="bottom" zIndex="10" closeable round="15" @close="isShowPop = false">
		<view class="flex-center" style="height:100rpx;font-size: 32rpx;">
			请选择跑团
		</view>
    <section class="section-filter bgf" style="margin-top:-20rpx;">
			<view class="section-search">
				<u-search v-model="searchTxt" @search="getList" placeholder="搜索跑团" shape="round" bgColor="#fff" borderColor="#FF8C00" :showAction="false"></u-search>
			</view>
    </section>
		<view class="" style="overflow: auto;max-height: 600rpx;min-height:400rpx;">
			<GroupItem from="search" :item="item" v-for="(item,index) in dataList" :key="index" @join="joinGroup" />
		</view>
  </u-popup>
</template>

<script>
import GroupItem from "@/components/GroupItem.vue"
export default {
  components: { GroupItem },
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
.section-filter {
  width: 100%;
}
</style>