<template>
	<view class="filter">
		<u-popup :show="isShowPop" mode="bottom" closeable round="15" @close="isShowPop = false">
			<view class="p20">
				<view class="section-box mt10 flex-box">
					<!-- <image class="logo mr10" src="../../static/img/basicprofile.jpeg"
						style="width: 40rpx;height:40rpx;border-radius: 999rpx;" mode="aspectFill"></image> -->
					<view class="title flex-center">跑了没小程序申请</view>
				</view>
				<view class="">
					<view class="mt20 mb10">
						获取你的昵称、头像
					</view>
					<view class="c9 fs24 lh36">
						登录小程序，查看用户信息，开发者将在获取你的明示同意后，
						收集你的微信昵称、 头像
					</view>
				</view>
				<view class="mt20">
					<view class="flex-start u-border-bottom input-line">
						头像
						<button class="avatar-wrapper u-reset-button flex-end" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
							<image class="avatar"
								:src="formData.avatarUrl?formData.avatarUrl:'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'">
							</image>
							<!-- <text class="loginLogoText" v-if="!formData.avatarUrl">授权头像</text> -->
						</button>
					</view>
					<view class="flex-start u-border-bottom input-line">
						<view class="h4">昵称</view>
						<input name="nickname" type="nickname" class="flex tar" placeholder="请输入昵称" v-model="formData.nickname" />
					</view>
					<view class="flex-between-center u-border-bottom input-line">
						<view class="h4">性别</view>
						<u-radio-group
						   v-model="formData.gender"
						 >
						   <u-radio
						     activeColor="#FF8C00"
						     v-for="(item, index) in radiolist"
						     :key="index"
						     :label="item.name"
						     :name="item.value"
						   >
						   </u-radio>
						 </u-radio-group>
					</view>
				</view>
				<view class="mt20 pt30" style="margin-top:50rpx;">
					<u-button type="primary" color="#19be6b" shape="circle" block class="submit-btn" @click="submit">
						确认更改
					</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>
<script>
	import { baseLink } from "@/utils/config.js"
	export default {
		options: {
		  styleIsolation: "shared",
		},
		data() {
			return {
				isShowPop: false,
				radiolist: [
					{
						name: '男',
						value: 1
					}, {
						name: '女',
						value: 0
					}
				],
				formData: {
					avatarUrl: "",
					nickname: "",
					gender: 1
				}
			};
		},
		methods: {
			//获取微信头像
			onChooseAvatar(e) {
				this.formData.avatarUrl = e.detail.avatarUrl;
				console.log("eeee", e.detail);
			},
			open() {
				const userInfo = this.$store.state.userInfo;
				
				if (!this.formData.avatarUrl) {
					this.formData.avatarUrl = userInfo.avatar_url;
					this.formData.nickname = userInfo.nickname
					this.formData.gender = userInfo.gender
				}
				
				this.isShowPop = true;
			},
			close() {
				this.isShowPop = false;
				this.formData = {
					avatarUrl: "",
					nickname: "",
					gender: 1
				}
			},
			async submit() {
				if (!this.formData.avatarUrl.length) return this.$toast('请上传头像')
				if (!this.formData.nickname.length) return this.$toast('请输入昵称')
				
				uni.showLoading({
					mask: true
				})
				
				let link = this.formData.avatarUrl;
				
				// 头像 tmp 开头，说明更换了头像，需要上传
				if (this.formData.avatarUrl.includes('//tmp')) {
					link = await this.uploadFile(this.formData.avatarUrl);
				}
				
				uni.showLoading({
					mask: true
				})
				
				const data = {
					"avatar_url": link,
					"nickname": this.formData.nickname,
					"gender": this.formData.gender
				}
				this.$axios.post(`/user-api/user/updateUserInfo`, data).then(res => {
					this.$store.dispatch('getUserInfo')
					this.close()
				})
			},
			compressImage(src) {
				return new Promise((resolve) => {
					uni.compressImage({
						src,
						width: 750,
						height: "auto",
						quality: 80,
						success: (res) => {
							resolve(res.tempFilePath);
							console.log(res.tempFilePath);
						},
					});
				});
			},
			async uploadFile(filePath) {
				console.log("filePath", filePath)
				// const filePath = await this.compressImage(file);
			
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: baseLink + `/basic-service/image/upload`,
						filePath: filePath,
						name: "image",
						header: {
							Authorization: uni.getStorageSync('token'),
							'content-type': 'application/json',
						},
						success(res) {
							res = JSON.parse(res.data);
							if (res.data.url) {
								return resolve(res.data.url);
							} else {
								uni.showToast({
									icon: "none",
									title: res.msg || "上传失败",
								});
							}
						},
						fail(e) {
							return resolve("");
			
							uni.showToast({
								icon: "none",
								title: "上传失败",
							});
			
							console.error(e);
							reject(e);
						},
					});
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.title {
	  font-size: 34rpx;
	  font-weight: 500;
	  margin-bottom: 42rpx;
	}
	
	.flex{
		flex:1;
	}
	.input-line{
		padding: 20rpx 0;
	}
	.avatar-wrapper {
			display: block;
			text-align: right;
			flex:1;
			.avatar {
				height: 80rpx;
				width: 80rpx;
				border-radius: 5rpx;
			}
		}
	.button-group {
		padding-left: 20rpx;
	}

	.btn-item {
		margin: 10rpx 10rpx;
		min-width: 215rpx;
	}

	.display {
		height: 80rpx;

		&.active {
			.ellipsis {
				color: #1989fa;
			}
		}
	}

	::v-deep {
		.u-radio{
			margin-left: 30rpx;
		}
		.u-radio-group{
			justify-content: flex-end;
		}
		.u-button {
			height: 76rpx;
			border-color: #e2e2e2 !important;
		}

		.active {
			.u-button {
				border-color: #1989fa !important;
			}
		}
	}
</style>