<template>
  <view class="tabbar-box">
		<u-tabbar
			:value="active"
			@change="onChange"
			activeColor="#4b788d"
			inactiveColor="#999"
			fixed
			placeholder
			zIndex="100"
			safeAreaInsetBottom
		>
			<u-tabbar-item :text="item.text" v-for="(item, index) in tabList" :key="index" :name="item.name" >
				<view slot="active-icon" class="iconfont active" :class="item.icon"></view>
				<view slot="inactive-icon" class="iconfont" :class="item.icon"></view>
			</u-tabbar-item>
		</u-tabbar>
  </view>
</template>
<script>
export default {
  props: ['type'],
  data () {
    return {
      active: this.type,
      tabList: [
				{
					"text": "首页",
					name: 'index',
					"pagePath": "/pages/index",
					icon: "icon-shouye",
					normal: '../static/tab_00.png',
					active: '../static/tab_01.png',
				},
				{
					"text": "运动",
					name: 'artList',
					"pagePath": "/pages/artList",
					icon: "icon-huabi-",
					normal: '../static/tab_00.png',
					active: '../static/tab_01.png',
				},
				{
					"text": "我的",
					name: 'mine',
					icon: "icon-wenzi",
					"pagePath": "/pages/mine",
					normal: '../static/tab_20.png',
					active: '../static/tab_21.png',
				},
			]
    };
  },
  methods: {
		onChange(detail) {
		  if (detail === this.type) return
		
		  uni.switchTab({
		    url: "/pages/" + detail
		  })
		}
  },
};
</script>

<style lang="scss" scoped>
.tabbar-box {
  height: 224rpx;
  box-sizing: content-box;
  margin-bottom: env(safe-area-inset-bottom);
}
::v-deep{
	.u-tabbar-item__icon{
		margin-bottom: 6rpx;
	}
}
.iconfont{
	font-size: 36rpx;
	color: rgb(125, 126, 128);
}
.active{
	color: #FF8C00;
}
.txt {
  font-size: 18rpx;
  font-weight: 400;
  // text-shadow: 0 -2px 0 rgba(111, 117, 146, 0.09);
}
</style>
