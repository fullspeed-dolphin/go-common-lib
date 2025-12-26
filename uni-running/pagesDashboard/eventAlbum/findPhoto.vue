<template>
	<up-popup :show="show" @close="close" @open="open">
	<view class="flex-col-center">
		<view class="" style="font-weight: bold;color: #979797;margin-top:70rpx;">
			请点击上传或更换您的头像<text style="color: #E53935;">（必选）</text>
		</view>

		<section class="section-camera u-flex-xy-center bgf" style="font-weight: bold;color: #267FF7;width: 408rpx;
height: 408rpx;margin-bottom:40rpx;">
			<div class="flex-col-center upload-box" style="">
				<view class="iconfont icon-paizhao flex-center"></view>
				<view>点击图片上传</view>
			</div>
		</section>
		
		<up-form-item label="号码牌:" labelWidth="auto">
			<input v-model="searchTxt" class="u-input" maxlength="50" placeholder="添加号码牌获取更多照片" />
		</up-form-item>
		
		<u-button type="primary" @click="submitForm()" customStyle="width:460rpx; margin: 18rpx auto 0" color="#FF8C00"
			shape="circle">
			确定查找
		</u-button>
		
		<view class="" style="font-weight: bold;width:416rpx;
font-size: 26rpx;line-height: 36rpx;margin-top: 36rpx;margin-bottom:16rpx;
color: #979797;">
			同时上传头像和号码牌可识别到更多
			照片和视频，并避免您的权益被侵犯
		</view>
		
		<view class="" style="font-weight: bold;width:442rpx;
font-size: 26rpx;line-height: 36rpx;
color: #E53935;">
			警示：请勿搜索他人照片，否则，您将
			承担<text style="color:#43A047">《特别提示》</text>中的法律责任。
		</view>
	</view>
		</up-popup>
</template>

<script setup>
	import {
		ref
	} from "vue";
	
	// Emits
	const emit = defineEmits(["open"]);
	
	// 创建响应式数据  
	const show = ref(false);
	  
	// 定义方法  
	function open() {  
	  // 打开逻辑，比如设置 show 为 true  
	  show.value = true;  
	  // console.log('open');  
	}  
	  
	function close() {  
	  // 关闭逻辑，设置 show 为 false  
	  show.value = false;  
	  // console.log('close');  
	} 
	
	import request from "@/utils/request.js"

	const searchTxt = ref("")

	// 方法定义
	const viewDetail = (item) => {
		uni.$u.route(`pagesDashboard/eventAlbum/albumDetail?id=${item.id}`);
	};

	let mescroll = ref(null);
	const refreshList = () => {
		nextTick(() => {
			mescroll.value.resetUpScroll(); // 重置列表数据为第一页
			mescroll.value.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
		});
	};

	const dataList = ref([])
	const getList = (page) => {
		uni.showLoading({
			mask: true
		});

		const params = {
			pageIndex: page.num - 1,
			pageSize: 10,
			keyword: searchTxt.value
		};

		request.get(`/event-api/api/v1/events`, params).then((res) => {
				//如果是第一页需手动制空列表
				if (page.num == 1) dataList.value = []

				res = res.events.map(item => {
					return {
						...item,
						event_time: item.event_time?.replace("T", " ").slice(0, 10),
					}
				});

				dataList.value = dataList.value.concat(res)

				//隐藏下拉刷新和上拉加载的状态;
				mescroll.value.endSuccess(res.length);
			})
			.catch((error) => {
				console.log(error)
				uni.hideLoading();
				mescroll.value.endSuccess();
			});
	};
	
	// 暴露方法给父组件
	defineExpose({
	  open,
	  close,
	});
</script>

<style lang="scss" scoped>
	.section-camera{
		position: relative;
		margin-top:40rpx;
		&:before{
			position: absolute;
			content: "";
			left:-10rpx;
			top:-10rpx;
			width: 62rpx;
			height: 62rpx;
			border-top: 12rpx solid #000;
			border-left: 12rpx solid #000;
		}
		&:after{
			position: absolute;
			content: "";
			right:-10rpx;
			top:-10rpx;
			width: 62rpx;
			height: 62rpx;
			border-top: 12rpx solid #000;
			border-right: 12rpx solid #000;
		}
		.upload-box{
			&:before{
				position: absolute;
				content: "";
				left:-10rpx;
				bottom:-10rpx;
				width: 62rpx;
				height: 62rpx;
				border-bottom: 12rpx solid #000;
				border-left: 12rpx solid #000;
			}
			&:after{
				position: absolute;
				content: "";
				right:-10rpx;
				bottom:-10rpx;
				width: 62rpx;
				height: 62rpx;
				border-bottom: 12rpx solid #000;
				border-right: 12rpx solid #000;
			}
		}
	}
	.icon-paizhao {
		color: #fff;
		font-size: 58rpx;
		width: 110rpx;
		height: 110rpx;
		border-radius: 999px;
		background: #267FF7;
		margin-bottom: 20rpx;
	}
	
	.u-input {
		width: 340rpx;
		font-size: 24rpx;
		padding: 20rpx;
		border-radius: 16rpx;
		min-height: 100rpx;
		background: #ffffff;
		font-weight: bold !important;
		border: 2rpx solid rgba(0, 0, 0, 0.06);
		box-sizing: border-box;
	}
	
	::v-deep{
		.u-form-item__body__left__content__label{
			color: #979797;
			font-size: 24rpx;
		}
	}
</style>