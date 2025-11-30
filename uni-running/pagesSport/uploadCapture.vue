<template>
	<view>
		<section class="section-form u-flex-row">
			<FileUpload v-model="ruleForm.picture" isCustom>
				<template #trigger>
					<view class="section-upload flex-col-center">
						<view class="icon">
							<up-icon name="plus" color="#E3E3E3" size="86rpx"></up-icon>
						</view>
						<view>上传打卡</view>
						<view>(上传软件截图或照片)</view>
					</view>
				</template>
			</FileUpload>
			<view class="u-ml-30">
				<view class="cell-item">
					<view class="label">距离(KM)</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.distance || '--'}}</view>
				</view>
				<view class="cell-item">
					<view class="label">时长</view>
					<view class="value u-flex-xy-center">{{exerciseInfo.duration || '--'}}</view>
				</view>
				<view @click="$u.route('pagesSport/captureRule?type=rule')" style="color: #FF8C00;line-height: 40rpx;">
					截图打卡规则
				</view>
			</view>
		</section>

		<section style="color:#999;line-height:40rpx;padding:0rpx 34rpx;">
			<view class="">
				1、打卡图需包含头像昵称且与跑了没头像昵称一致，配
				速/距离/公里数/日期缺一不可。
			</view>
			<view class="">
				2、当天跑步需在23：59前打卡，逾期不能补卡。国外
				跑友也按北京时间打卡。
			</view>
			<view class="">
				3、平均每公里用时在15分钟内才是有效打卡。
			</view>
			<view @click="$u.route('pagesSport/captureRule?type=failUpload')" style="color:#FF8C00;">
				无法上传打卡？
			</view>
		</section>

		<u-button type="primary" @click="submitForm()" customStyle="width:640rpx; margin: 60rpx auto 30rpx" color="#FF8C00"
			shape="circle">
			上传打卡
		</u-button>
	</view>
</template>
<script setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import FileUpload from "@/components/common/FileUpload.vue";
	import request from "../utils/request";
	
	const exerciseInfo = ref({
		distance: '26.80',
		duration: '03:01:16'
	})

	const ruleForm = ref({
		picture: "",
		activity: "",
		fullName: "",
		id_card: "",
		phone: "",
	});

	const submitForm = () => {
		const token = uni.getStorageSync("token");
		if (!token) {
			uni.$u.toast("请先登录~");
			setTimeout(() => {
				uni.$u.route("/pagesSub/login");
			}, 1000);
			return;
		}

		const data = {
			activity: ruleForm.value.activity,
		};
		uni.showLoading({
			mask: true,
		});

		request.post(`/running-group/api/v1/groups/update`, data).then(async (res) => {
			uni.$u.toast("");

			setTimeout(() => {
				uni.navigateBack();
			}, 500);
		});
	};
</script>

<style lang="less" scoped>
	.section-form {
		padding: 30rpx 34rpx 30rpx;
	}

	.cell-item {
		font-weight: bold;
		color: #000000;
		line-height: 40rpx;
		margin-bottom: 40rpx;

		.value {
			width: 206rpx;
			height: 88rpx;
			margin-top: 20rpx;
			color: #6C6C6C;
			background: #F2F2F2;
		}
	}

	::v-deep {
		.section-upload {
			width: 448rpx;
			height: 790rpx;
			background: #FFFFFF;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			border: 2rpx dashed #ccc;
			line-height: 40rpx;
			color: #999;

			.icon {
				margin-bottom: 42rpx;
			}

			.u-icon__icon {
				color: #ccc;
			}
		}
	}
</style>