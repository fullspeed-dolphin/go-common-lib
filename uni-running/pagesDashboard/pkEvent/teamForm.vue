<template>
	<view class="form-page">
		<up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
			<view class="card-section logo-card">
				<view class="flex-center">
					<up-form-item :label="null" prop="poster">
						<FileUpload v-model="form.poster" @change="validateField('poster')" />
					</up-form-item>
				</view>
				<view class="logo-hint" style="color:#64748B">点击上方设置团队专属头像</view>
			</view>

			<!-- 基本信息分组 -->
			<view class="card-section">
				<view class="section-content">
					<up-form-item label="团队名称" prop="name" required>
						<view class="flex-start" style="width: 650rpx;
height: 100rpx;
background: #F5F8FB;
padding-left: 30rpx;
border-radius: 16rpx 16rpx 16rpx 16rpx;
border: 2rpx solid #E2E8F0;">
							<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="给你的战队起个响亮的名字吧~" />
						</view>
					</up-form-item>
					<up-form-item label="选择组别" prop="categoryType" required>
						<view class="flex-between-center u-pt-5">
							<view class="category-item flex-col-center" v-for="(item,index) in  groupInfo" :class="{active: form.categoryType === index+1}" @click="form.categoryType = (index+1)" >
								<view class="iconfont icon-xunhuan1-M" v-if="index==0" style="color:#2B7FFF;"></view>
								<view class="iconfont icon-aixin" v-else style="color:#F6339A;"></view>
								<view class="target">{{item.target_km}}公里</view>
								<view class="txt">{{ item.description }}</view>
							</view>					
						</view>
					</up-form-item>
					<view class="textarea-cell">
						<up-form-item label="团队介绍" prop="description" required>
							<view class="u-pt-5" style="position: relative;">
								<textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="110" placeholder-style="color: #64748B;" maxlength="150" placeholder="写一段话激励你的队友..." count></textarea>
								<view class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
									{{form.description.length}}/150
								</view>
							</view>
						</up-form-item>
					</view>
				</view>
			</view>
		</up-form>

		<view class="submit-wrapper">
			<u-button type="primary" color="linear-gradient(64deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%)" shape="circle" 
				customStyle="width: 686rpx;height: 96rpx;border-radius: 32rpx;"
			@click="submitForm()">
				立即创建战队
			</u-button>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		watch,
		nextTick
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";

	import FileUpload from "@/components/common/FileUpload.vue";
	import PickerMap from "@/components/common/PickerMap.vue";
	import PickerTime from "@/components/common/PickerTime.vue";
	import PickerCell from "@/components/common/PickerCell.vue";
	import request from "@/utils/request.js"

	const uForm = ref(null);
	const from = ref("");
	const activetyId = ref(""); // 活动ID
	const groupInfo = ref({}); // 组别
	
	const group_id = ref("");
	const form = ref({
		poster: "",
		name: "",
		categoryType: 1,
		description: "",
	});

	
	function validateField(propName) {
		uForm.value.validateField(propName, () => {}, "change");
	}

	const rules = ref({
		poster: [{
			required: true,
			message: "请点击上传图片",
			trigger: ["blur", "change"],
		}, ],
		name: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
		description: [{
			required: true,
			message: "必填项",
			trigger: ["blur", "change"],
		}, ],
	});

	// 页面加载
	onLoad((options) => {
		console.log("option", options);
		group_id.value = options.group_id;
		activetyId.value = options.id
		from.value = options.from;
		getDetail();
		getClubType()
	});

	// 方法定义
	const getDetail = (page) => {
		if (!group_id.value) return;
		request.get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
			.then((res) => {
				form.value = {
					...res,
					poster: res.avatar_url,
					name: res.name,
				};

			});
	};

	const submitForm = () => {
		uForm.value.validate().then((res) => {
			if (!isAgree.value) return uni.$u.toast("请勾选同意协议");

			const data = {
				avatar_url: form.value.poster,
				name: form.value.name,
				club_type: form.value.club_type,
				establish_location: form.value.establish_location,
				creator_real_name: form.value.fullName,
				introduction: form.value.description,
				creator_phone: form.value.phone,
			};
			uni.showLoading({
				mask: true,
			});

			let url = "/running-group/api/v1/groups";

			// 更新跑团
			if (group_id.value) {
				url = "/running-group/api/v1/groups/update";
			}
			request.post(url, data).then(async (res) => {
				console.log(res);

				// 跳转回上一级页面，返回上一页并传递参数
				uni.$emit("updateList", {
					isChange: true,
					from: from.value,
					group_id: res1.running_group,
				});

				// 创建俱乐部时显示审批提示弹窗
				if (!group_id.value) {
					uni.showModal({
						title: '提示',
						content: '你的俱乐部正在审批中，审批完成之后将在此显示',
						showCancel: false,
						confirmText: '我知道了',
						success: () => {
							uni.navigateBack();
						}
					});
				} else {
					// 更新俱乐部时直接提示并返回
					uni.$u.toast("更新成功");
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				}
			}).catch(e => {
				uni.hideLoading()
				uni.showModal({
				  title: '提示',
				  content: e.msg,
				  showCancel: false, // 如果不需要“取消”按钮
				  confirmText: '我知道了'
				});
			})
		});
	};
	// 获取组别
	const getClubType = () => {
		request.get('/event-api/online_events/'+activetyId.value).then(res => {
			groupInfo.value = res?.group_config?.groups || {}
		})
	};
</script>

<style lang="less" scoped>
	.category-item{
		width: 310rpx;
		height: 266rpx;
		background: #FFFFFF;
		border-radius: 36rpx 36rpx 36rpx 36rpx;
		border: 3rpx solid #E2E8F0;
		color:#64748B;
		.iconfont{
			font-size: 42rpx;
		}
		.target{
			font-size: 40rpx;
			margin: 40rpx 0;
		}
		&.active{
			background: #EFF6FF;
			border: 2rpx solid #BEDBFF;
			outline: 4rpx solid #D1D0F2;
			.target{
				color: #155DFC
			}
			.txt{
				color: #568AFD
			}
		}
		
		.txt{
			color:#929DAE;
		}
	}
	// 页面整体样式
	.form-page {
		min-height: 100vh;
		background: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	// 卡片通用样式
	.card-section {
		margin-bottom: 24rpx;
		overflow: hidden;
	}

	// Logo 卡片特殊样式
	.logo-card {
		padding: 40rpx 20rpx 30rpx;
		text-align: center;
	}

	.logo-hint {
		font-size: 24rpx;
		color: #999;
		margin-top: 16rpx;
	}

	// 分组标题
	.section-header {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section-icon {
		font-size: 36rpx;
		margin-right: 12rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	// 表单内容区
	.section-content {
		padding: 0 24rpx;
	}

	// 提交按钮
	.submit-wrapper {
		padding: 60rpx 8rpx 30rpx;
	}

	::v-deep {
		.textarea-cell {
			.u-input {
				width: 100%;
				height: 200rpx;
				border: 1px solid #ebedf0;
				border-radius: 16rpx;
				padding: 16rpx;
				box-sizing: border-box;
				text-align: left;
				background: #F5F8FB;
			}
		}

		.u-form-item__body__left__content__required {
			top: 0;
			font-size: 14px;
			position: relative !important;
			top: 0 !important;
			left: 0 !important;
			order: 1 !important;
			margin-left: 4rpx !important;
		}
		.u-form-item__body__left__content__label{
			flex:none;
		}

		.u-FileUploader {
			.u-upload__wrap {
				display: flex;
				justify-content: center;

				.u-upload__button {
					background: #fafafa;
					border-radius: 16rpx;
				}
			}
		}
	}
</style>