<template>
  <div class="">
		<u-navbar autoBack placeholder title="跑团招募"></u-navbar>
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
		
		<UserLogin ref="refUserLogin"/>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import { getCurrentInstance } from 'vue'
import GroupItem from "@/components/GroupItem.vue"
import UserLogin from "@/components/UserLogin.vue"
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js"

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 使用store
const store = useStore()

// 模板引用
const refUserLogin = ref(null)
const mescrollRef = ref(null)

// 响应式数据
const searchTxt = ref("")
const tabActive = ref(0)
const tabList = ref([
	{ label: "同城", value: 0 },
	{ label: "热门", value: 1 },
])
const curTab = ref({})
const dataList = ref([])

// 计算属性
const userInfo = computed(() => store.state.userInfo)

// mescroll相关
let mescroll = null

const mescrollInit = (mescrollInstance) => {
	mescroll = mescrollInstance
}

// 页面显示
onShow(() => {
	// 移除全局自定义事件监听器
	uni.$off("updateList");

	// 监听全局的自定义事件
	uni.$once("updateList", (data) => {
		// 判断二级页面是否修改过数据，如果修改过，需要刷新首页，保持信息一致
		if (data.isChange) {
			refreshList();
		}
	});
})

// 方法定义
const viewDetail = (item) => {
	uni.setStorageSync('orderDetail', item)
	// uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`)
}

const openForm = () => {
	if (!store.state.userInfo.id) {
		return refUserLogin.value.open()
	}
	
	uni.$u.route(`pagesSub/groupForm`)
}

const changeTab = (detail) => {
	curTab.value = detail;
	console.log(detail);
	refreshList();
}

const refreshList = () => {
	nextTick(() => {
		mescroll.resetUpScroll(); // 重置列表数据为第一页
		mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
	});
}

const getList = (page) => {
	uni.showLoading({ mask: true });
	
	const data = {
		"pageIndex": page.num - 1,
		"pageSize": 10,
		"keyword": searchTxt.value
	}
	proxy.$axios.get(`/running-group/api/v1/groups/list`, data).then(res => {
		uni.hideLoading();

		//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
		mescroll.endSuccess(res.data.length)

		//如果是第一页需手动制空列表
		if (page.num == 1) {
			dataList.value = [];
		}

		dataList.value = dataList.value.concat(res.data); //追加新数据
	})
	.catch((error) => {
		uni.hideLoading();
		mescroll.endSuccess(6);
	});
}

const downCallback = (mescroll) => {
	// 下拉刷新的回调
	mescroll.resetUpScroll()
}
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