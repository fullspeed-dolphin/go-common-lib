<template>
	<up-popup :show="show" @close="close" closeable>
		<view class="flex-between-center" style="height: 100rpx;padding: 0 34rpx;">
			<view class="" style="font-weight: bold;font-size: 30rpx;color: rgba(0,0,0,0.8);">AI找我</view>
		</view>

		<view class="section-tabs flex-center van-hairline--bottom" style="color: #999;">
			<view class="flex-col-center flex-1" :class="{active: activeTab === 1}" @click="activeTab = 1">
				<view class="iconfont icon-renlianguanli2" style="font-size: 38rpx;"></view>
				人脸
			</view>
			<view class="flex-col-center flex-1" :class="{active: activeTab === 2}" @click="activeTab = 2">
				<view class="iconfont icon-a-haomapai1" style="font-size: 38rpx;"></view>
				号码牌
			</view>
		</view>
		<view style="padding-bottom: 60rpx;">
			<div v-if="activeTab === 1" class="flex-col-center" style="height:500rpx;">
				<section @click="takePhoto()" class="section-camera u-flex-xy-center bgf" style="font-weight: bold;color: #267FF7;width: 216rpx;
				height: 216rpx;margin-bottom:40rpx;">
					<div class="flex-col-center upload-box" style="">
						<view class="iconfont icon-paizhao flex-center"></view>
						<view>点击人脸拍照</view>
					</div>
				</section>
				<view class="" style="font-weight: bold;text-align: center;
							font-size: 24rpx;line-height: 36rpx;margin-top: 26rpx;margin-bottom:22rpx;
							color: #999;">
					请拍摄正脸照片，以确保人脸搜索的准确性
				</view>

				<section class="section-bottom" style="margin: 0rpx auto;">
					<view class="txt flex-start">
						<up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
							:customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
						<text @click="isAgree = !isAgree">
							<text class="u-ml-5">我已阅读并同意该</text>
						</text>
						<text style="color: #ff8c00"
							@click="$u.route('pagesSub/settings/agreement?type=faceScanPolicy')">《人脸识别使用条款》</text>
					</view>
				</section>
			</div>

			<view v-if="activeTab === 2" class="flex-col-center" style="height:500rpx;">
				<view class="flex-start" style="margin-top:14rpx;">
					<input v-model="searchTxt" class="u-input" maxlength="50" placeholder="请输入号码牌搜索照片" />

					<u-button type="primary" :disabled="searchTxt.length < 2" @click="searcNumber()"
						customStyle="width:146rpx;margin-left:16rpx;border-radius:16rpx;height: 92rpx;font-size:30rpx;"
						color="#FF8C00">
						搜索
					</u-button>
				</view>

				<section class="section-sample">
					<view class="" style="color: #707070;">
						号码牌示例图：
					</view>
					<view class="flex-start u-mt-20">
						<view class="card-icon">
							<view class="txt" style="margin: 8rpx 0 0 10rpx;">
								A1234
							</view>
						</view>
						建议输入完整号码搜索
					</view>
					<view class="flex-start u-mt-20">
						<view class="card-icon">
							<view class="txt" style="margin: 8rpx 0 0 10rpx;text-align: right;">
								<text style="color:#F9F9F9;">A</text>1234
							</view>
						</view>
						建议输入明显的号码，如1234
					</view>
					<view class="flex-start u-mt-20">
						<view class="card-icon">
							<view class="txt" style="margin: 6rpx 0;height:34rpx;">
								A1234
								<view class="s" style="font-size: 8rpx;margin-top:-10rpx;">bcd</view>
							</view>
						</view>
						建议只输入字母和数字，如A1234
					</view>
				</section>
			</view>
			
			<view style="font-size: 24rpx;color:#999;margin-top: 20rpx;text-align: center;">由易联支付AI平台强势驱动</view>
		</view>
	</up-popup>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import { baseLink, uploadToken } from "@/utils/config.js";
	import request from "@/utils/request.js";

	// Emits
	const emit = defineEmits(["open"]);

	const activeTab = ref(1);
	const isAgree = ref(false);
	const show = ref(false);
	const facePhoto = ref('');
	
	const event_id = ref('')
	function open(eventid) {
		event_id.value = eventid
		console.log('open')
		show.value = true;
	}

	function close() {
		show.value = false;
	}

	// 压缩图片
	const compressImage = (src) => {
		return new Promise((resolve) => {
			uni.compressImage({
				src,
				width: 750,
				quality: 80,
				success: (res) => {
					resolve(res.tempFilePath);
				},
				fail() {
					resolve(src);
				}
			});
		});
	};

	// 上传图片到 basic-service
	const uploadImage = async (filePath) => {
		uni.showLoading({
			title: '正在搜索...',
			mask: true
		});
		const compressedPath = await compressImage(filePath);
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: baseLink + '/basic-service/image/upload',
				filePath: compressedPath,
				name: 'image',
				header: {
					Authorization: uploadToken,
					'content-type': 'application/json'
				},
				success(res) {
					const data = JSON.parse(res.data);
					if (data.data && data.data.url) {
						resolve(data.data.url);
					} else {
						reject(new Error(data.msg || '上传失败'));
					}
				},
				fail(err) {
					reject(err);
				}
			});
		});
	};

	// 调用人脸搜索接口
	const searchFace = async (imageUrl) => {
		uni.showLoading({
			title: '正在搜索...',
			mask: true
		});
		return request.post('/face-rec/api/faces/search', {
			event_id: event_id.value,
			image_url: imageUrl
		});
	};

	const takePhoto = () => {
		if (!isAgree.value) return uni.$u.toast('请勾选协议~');
		
		uni.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['camera'],
			camera: 'front',
			async success(res) {
				console.log('拍照成功', res);
				const tempFilePath = res.tempFiles[0].tempFilePath;
				facePhoto.value = tempFilePath;

				handleTakePhoto(tempFilePath)
			},
			fail(err) {
				console.error('拍照失败', err)
				uni.showToast({
					title: '取消或失败',
					icon: 'none'
				})

				if (err.errMsg.includes('deny')) {
					uni.showModal({
						title: '需要相机权限',
						content: '请到 设置 > 隐私 > 相机 中允许访问',
						showCancel: true,
						confirmText: '去设置',
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.openSetting()
							}
						}
					})
				}
			}
		})
	}
	
	async function handleTakePhoto(tempFilePath) {		
		try {
			// 1. 上传图片到 basic-service
			const imageUrl = await uploadImage(tempFilePath);
			// const imageUrl = 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2025/12/30/5883c014-29a7-4fde-91f7-aa2966086c19.jpg';
			console.log('上传成功，图片URL:', imageUrl);
		
			// 2. 调用人脸搜索接口
			const searchResult = await searchFace(imageUrl);
		
			// 3. 提取结果并跳转到结果页面
			if (searchResult?.results?.length > 0) {
				// 存储搜索结果到缓存
				uni.setStorageSync('faceSearchResults', searchResult.results);
				// 关闭弹窗
				close();
				// 跳转到结果页面
				uni.navigateTo({
					url: '/pagesDashboard/eventAlbum/faceSearchResult'
				});
			} else {
				uni.$u.toast('未找到匹配的照片')
			}
		} catch (err) {
			console.error('人脸搜索失败:', err);
			uni.$u.toast('搜索失败，请重试')
		}
	}

	const searchTxt = ref("")

	const searcNumber = () => {
		uni.showLoading({
			mask: true
		});

		const params = {
			event_id: event_id.value,
			bib_number: searchTxt.value
		};

		request.post(`/number-rec/api/number/search`, params).then((res) => {
			if (res?.image_urls?.length > 0) {
				// 存储搜索结果到缓存
				uni.setStorageSync('faceSearchResults', res.image_urls);
				// 关闭弹窗
				close();
				// 跳转到结果页面
				uni.navigateTo({
					url: '/pagesDashboard/eventAlbum/faceSearchResult'
				});
			} else {
				uni.$u.toast('未找到匹配的照片')
			}
		})
	};

	// 暴露方法给父组件
	defineExpose({
		open,
		close,
	});
</script>

<style lang="scss" scoped>
	.card-icon {
		position: relative;
		padding-top: 1px;
		width: 62rpx;
		height: 46rpx;
		background: #FEEFDC;
		border-radius: 0rpx 0rpx 0rpx 0rpx;
		margin-right: 18rpx;

		.txt {
			width: 60rpx;
			height: 28rpx;
			font-family: PingFang SC, PingFang SC;
			font-weight: 800;
			font-size: 20rpx;
			color: #FF8C00;
			line-height: 28rpx;
			text-align: center;
			font-style: normal;
			text-transform: none;
			width: 62rpx;
			height: 28rpx;
			background: #FFFFFF;
			border-radius: 0rpx 0rpx 0rpx 0rpx;
		}
	}

	.section-sample {
		width: 682rpx;
		background: #F2F2F2;
		padding: 32rpx 16rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		margin-top: 30rpx;
		font-weight: bold;
		font-size: 24rpx;
		color: #999999;
		box-sizing: border-box;
		line-height: 32rpx;
	}

	.section-tabs {
		font-weight: bold;
		font-size: 26rpx;
		color: #FF8C00;
		line-height: 48rpx;
		padding-bottom: 32rpx;

		.iconfont {
			height: 38rpx;
			margin-bottom: 10rpx;
		}

		.active {
			position: relative;
			color: #FF8C00;

			&:before {
				position: absolute;
				bottom: -10rpx;
				left: 50%;
				transform: translate(-50%);
				content: "";
				width: 50rpx;
				height: 6rpx;
				background: #FF8C00;
				border-radius: 4rpx 4rpx 4rpx 4rpx;
			}
		}
	}

	.section-camera {
		position: relative;
		margin-top: 40rpx;

		&:before {
			position: absolute;
			content: "";
			left: -10rpx;
			top: -10rpx;
			width: 32rpx;
			height: 32rpx;
			border-top: 6rpx solid #999;
			border-left: 6rpx solid #999;
		}

		&:after {
			position: absolute;
			content: "";
			right: -10rpx;
			top: -10rpx;
			width: 32rpx;
			height: 32rpx;
			border-top: 6rpx solid #999;
			border-right: 6rpx solid #999;
		}

		.upload-box {
			&:before {
				position: absolute;
				content: "";
				left: -10rpx;
				bottom: -10rpx;
				width: 32rpx;
				height: 32rpx;
				border-bottom: 6rpx solid #999;
				border-left: 6rpx solid #999;
			}

			&:after {
				position: absolute;
				content: "";
				right: -10rpx;
				bottom: -10rpx;
				width: 32rpx;
				height: 32rpx;
				border-bottom: 6rpx solid #999;
				border-right: 6rpx solid #999;
			}
		}
	}

	.icon-paizhao {
		color: #fff;
		font-size: 30rpx;
		width: 68rpx;
		height: 68rpx;
		border-radius: 999px;
		background: #267FF7;
		margin-bottom: 20rpx;
	}

	.u-input {
		width: 520rpx;
		height: 92rpx;
		background: #F2F2F2;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		font-weight: bold;
		font-size: 24rpx;
		color: #979797;
		padding: 0 26rpx;
	}

	::v-deep {
		.u-form-item__body__left__content__label {
			color: #979797;
			font-size: 24rpx;
		}
	}
</style>