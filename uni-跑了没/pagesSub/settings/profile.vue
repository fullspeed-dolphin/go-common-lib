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
<script>
import PickerCell from '@/components/common/PickerCell.vue'
import moment from '@/utils/moment.js'
import { asyncAlls, baseLink } from '@/utils/util.js'
export default {
	components: { PickerCell },
  data() {
    return {
			isSubmitting: false,
      userInfo: {},
    }
  },
  onShow() {
		const userInfo = this.$store.getters.userInfo;
		
		if (!userInfo.Avatar) {
			userInfo.Avatar = ""
		}
		if (userInfo.Birthday) {
			userInfo.Birthday = moment(userInfo.Birthday).format('YYYY-MM-DD')
		}
		
    this.userInfo = userInfo;
		
		this.initData = JSON.parse(JSON.stringify(userInfo))
  },
  methods: {
		//获取昵称输入内容
		userNameInput(e) {
			this.nickname = e.detail.value
		},
		async changePic(e) {
			this.userInfo.Head = await this.imageToBase64(e.avatarUrl)
		},
		imageToBase64(filePath) {
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
		},
    async submit() {
			const {
				Head,
				Name,
			} = this.userInfo;
      // if (!Head || !Head.length) {
      //   return this.$toast('请上传头像')
      // }
      if (!Name || !Name.length) {
        return this.$toast('请输入昵称')
      }
			
      uni.showLoading({ mask: true })
			this.isSubmitting = true;
			try{
				
				console.log("this.initData", this.initData)
				
				if (this.initData.Name !== Name) {
					await this.$axios.post('/Student/Name/Update', { Name })
				}
				if (this.initData.Head !== Head && Head?.length) {
					await this.$axios.post('/Student/Head/Update', { Head })
				}
				
				uni.hideLoading()
				this.$toast('保存成功');
				
				setTimeout(() => {
					this.isSubmitting = false;
					uni.navigateBack()
				}, 300)
				
				// uni.setStorageSync('userInfo', {
				//   ...this.userInfo,
				//   ...data
				// })
			}catch(e){
				this.isSubmitting = false;
				uni.hideLoading()
				//TODO handle the exception
			}
    }
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
