<template>
  <view class="rel">
		<van-cell title="头像" title-width="80px" center>
		  <view class="flex-between-center">
		  	<view class=""></view>
				<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="({detail}) => changePic(detail)">
					<image class="avatar" :src="userInfo.Head" mode="aspectFill"></image>
				</button>
		  </view>
		</van-cell>
		
    <van-cell title="昵称" title-width="80px" center>
			<input type="nickname" :value="userInfo.Name" @blur="({detail}) => userInfo.Name = detail.value"
									placeholder="请输入昵称" />
    </van-cell>
		
		<!-- <van-cell title="手机号" :value="userInfo.Phone" /> -->

    <view style="padding:0rpx 62rpx;margin-top:55rpx;">
      <van-button round type="primary" :disabled="isSubmitting" block @click="submit()">保存</van-button>
    </view>

  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import { getCurrentInstance } from 'vue'
import PickerCell from '@/components/common/PickerCell.vue'
import moment from '@/utils/moment.js'
import { asyncAlls, baseLink } from '@/utils/util.js'

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 使用store
const store = useStore()

// 响应式数据
const isSubmitting = ref(false)
const userInfo = ref({})
const initData = ref({})

// 页面显示
onShow(() => {
	const userInfoData = store.getters.userInfo;
	
	if (!userInfoData.Avatar) {
		userInfoData.Avatar = ""
	}
	if (userInfoData.Birthday) {
		userInfoData.Birthday = moment(userInfoData.Birthday).format('YYYY-MM-DD')
	}
	
	userInfo.value = userInfoData;
	
	initData.value = JSON.parse(JSON.stringify(userInfoData))
})

// 方法定义
//获取昵称输入内容
const userNameInput = (e) => {
	// this.nickname = e.detail.value
}

const changePic = async (e) => {
	userInfo.value.Head = await imageToBase64(e.avatarUrl)
}

const imageToBase64 = (filePath) => {
	return new Promise((resolve, reject) => {
		const fileManager = wx.getFileSystemManager();
		fileManager.readFile({
			filePath: filePath,
			encoding: 'base64',
			success(res) {
				// res.data is the base64 string without prefix
				resolve('data:image/png;base64,' + res.data);
			},
			fail(err) {
				reject(err);
			}
		});
	});
}

const submit = async () => {
	const {
		Head,
		Name,
	} = userInfo.value;
	// if (!Head || !Head.length) {
	//   return proxy.$toast('请上传头像')
	// }
	if (!Name || !Name.length) {
		return proxy.$toast('请输入昵称')
	}
		
	uni.showLoading({ mask: true })
	isSubmitting.value = true;
	try{
		
		console.log("initData", initData.value)
		
		if (initData.value.Name !== Name) {
			await proxy.$axios.post('/Student/Name/Update', { Name })
		}
		if (initData.value.Head !== Head && Head?.length) {
			await proxy.$axios.post('/Student/Head/Update', { Head })
		}
		
		uni.hideLoading()
		proxy.$toast('保存成功');
		
		setTimeout(() => {
			isSubmitting.value = false;
			uni.navigateBack()
		}, 300)
		
		// uni.setStorageSync('userInfo', {
		//   ...userInfo.value,
		//   ...data
		// })
	}catch(e){
		isSubmitting.value = false;
		uni.hideLoading()
		//TODO handle the exception
	}
}
</script>

<style lang="less" scoped>
	.avatar-wrapper{
		margin:0;
		padding:0;
		width: 100rpx;
		height: 100rpx;
		border-radius: 100px;
		&:after{
			display: none;
		}
		.avatar{
			width: 100rpx;
			height: 100rpx;
			border-radius: 100px;
		}
	}
::v-deep {
  .van-cell__title {
    font-size: 28rpx;
    color: rgba(51, 51, 51, 1);
  }
  .title-cell {
    .uni-easyinput {
      text-align: right;
    }
  }
  .uploader-cell {
    .van-cell__value {
      display: flex;
      flex-direction: row-reverse;
    }
    .img {
      display: block;
      width: 80rpx;
      height: 80rpx;
      border-radius: 80rpx;
      border: 1px solid #eee;
    }
  }
}
</style>
