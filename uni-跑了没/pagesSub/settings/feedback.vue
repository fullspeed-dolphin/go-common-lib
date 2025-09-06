<template>
  <view class="rel">
		<van-cell class="textarea-box">
			<uni-easyinput v-model="decsription" type="textarea" :inputBorder="false" :trim="true" maxlength="200" :clearable="false" placeholder="请写下您的宝贵建议或咨询问题"/>
			<view class="counter">
				{{decsription.length}} / 200
			</view>
		</van-cell>
		<van-cell class="title-cell" title="联系方式" title-width="80px" center :border="false">
			<uni-easyinput v-model="contact" :inputBorder="false" :trim="true" :clearable="false" maxlength="50" placeholder="请留下您的邮箱或QQ"/>
		</van-cell>
		
		<view style="padding:0rpx 62rpx;margin-top:55rpx;">
		  <van-button round type="primary" block @click="submit()">提交</van-button>
		</view>
  </view>
</template>
<script>
export default {
  data () {
    return {
			decsription: "",
			contact: ""
		};
  },
  methods: {
		submit () {
		  if (!this.decsription.length) { return this.$toast('请写下您的宝贵建议或咨询问题')}
		  if (!this.contact.length) { return this.$toast('请留下您的邮箱或QQ')}
		
		  uni.showLoading({
		    title: '提交中...',
		    mask: true
		  })
		
		  const data = {
		    content: this.decsription,
		    email: this.contact,
		  };
			
		  this.$axios({ url: "api/page/add_feedback", data, method: 'post' }).then(res => {
				uni.hideLoading()
		    this.$toast("提交成功");
				
				this.decsription = ""
				this.contact = ""
				
				uni.navigateBack({
					delta: 1
				})
		  })
		},
	}
};
</script>

<style lang="less" scoped>
	::v-deep{
		.van-cell{
			padding-top:0;
			padding-bottom:0;
		}
		.van-cell__title{
			font-size: 28rpx;
			color: rgba(102, 102, 102, 1);
		}
		.title-cell{
			.uni-easyinput{
				text-align: right;
			}
		}
		.textarea-box{
			position: relative;
			padding-bottom: 30rpx;
			.uni-easyinput__content-textarea{
				height: 585rpx;
			}
			.counter{
				position: absolute;
				bottom:0px;
				right: 16px;
				color: rgba(51, 51, 51, 1);
				font-size: 20rpx;
			}
		}
	}
</style>
