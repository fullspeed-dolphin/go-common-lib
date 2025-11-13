<template>
  <view class="rel">
    <view class="panel section-help">
      <view style1="margin-top:-20rpx;">
        <van-cell title="修改密码" center is-link @click="$goUrl('/pagesSub/settings/editPassword')" />
        <van-cell title="更新信息" center is-link @click="$goUrl('/pagesSub/settings/companyUpdate')" />
        <van-cell title="关于我们" center is-link @click="$goUrl('/pagesSub/blogDetail?id=27&type=article&title=关于我们')" />
        <!-- <van-cell title="联系客服" center is-link @click="$goUrl('/pagesSub/blogDetail?id=23&type=article')" /> -->
        <van-cell title="用户协议" center is-link @click="$goUrl('/pagesSub/blogDetail?id=28&type=article&title=用户协议')" />
        <van-cell title="隐私协议" center is-link @click="$goUrl('/pagesSub/blogDetail?id=29&type=article&title=隐私协议')" />
      </view>
    </view>

    <view class="panel section-help">
      <view style1="margin-top:-20rpx;">
        <van-cell title="退出登录" class="tac" center @click="logout" />
      </view>
    </view>
  </view>
</template>
<script setup>
import { getCurrentInstance } from 'vue'

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 方法定义
const logout = () => {
	uni.showModal({
		title: '提示',
		content: `确定退出登录吗？`,
		cancelText: '取消',
		confirmText: '确定',
		confirmColor: "#ff523d",
		success: res => {
			if (res.confirm) {
				proxy.$toast('已退出登录')

				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				// this.isLogin = false

				setTimeout(() => {
					uni.redirectTo({
						url: '/pagesSub/login'
					})
				}, 200)
			}
		}
	})
}
</script>

<style lang="less" scoped>
.section-help {
  padding: 0;
}
</style>
