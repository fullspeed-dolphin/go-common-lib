<template>
	<view style="padding-bottom: 100rpx;">
		<!-- <u-navbar autoBack placeholder title="全速天使招募" /> -->
		
		<view v-if="submitSuccessfully" class="flex-col-center" style="padding-top:200rpx;">
			<image style="width:300rpx;height:400rpx;" src="/static/images/wechat_2025-11-29_151550_391.min.png" mode="aspectFill"></image>
			<view class="" style="font-weight: 500;
				text-align: center;
				font-size: 34rpx;
				margin-top: 74rpx;
				line-height: 48rpx;">
				<view>我们已收到您的申请，</view>
				<view>工作人员将在第一时间联系您</view>
				<view>欢迎您成为全速大家庭的一份子！</view>
			</view>
			
			<view class="" style="font-weight: bold;
				margin-top:40rpx;
				font-size: 24rpx;
				color: #BFBFBF;">
				订单编号：{{paymentInfo.order_no}}
			</view>
		</view>
		
		<block v-if="!submitSuccessfully">
			<up-form :model="form" ref="refForm" :rules="rules" labelPosition="top" labelWidth="auto">
				<div class="userinfo-form">
					<up-form-item label="选择活动" prop="event_id" required>
						<PickerCell v-model="form.event_id" placeholder="--选择活动--" @change="changeEvent" :title="null" :border="false"
							:columns="options_events" />
					</up-form-item>
				</div>

				<div class="userinfo-form">
					<up-form-item label="姓名" prop="full_name" required>
						<u-input v-model="form.full_name" placeholder="请输入名称" />
					</up-form-item>
					<u-form-item label="性别" prop="gender" required>
						<PickerCell v-model="form.gender" :title="null" @change="validateField('gender')" placeholder="--选择性别--" :border="false" :columns="options_gender" />
					</u-form-item>
					<u-form-item label="身份证号码" prop="id_card" required>
						<u-input v-model="form.id_card" placeholder="请输入身份证号码" />
					</u-form-item>
					<up-form-item label="手机号码" prop="phone_number" required>
						<u-input v-model="form.phone_number" placeholder="请输入手机号码" />
					</up-form-item>
				</div>
			</up-form>
			
			<section v-if="priceInfo.spxAngel" class="payment-card">
				<view  class="amount-row">
					<text class="amount">¥{{priceInfo.spxAngel}}</text>
					<text class="desc">(该费用用于购买保险)</text>
				</view>
					
				<view class="title">选择支付方式</view>
					
				<view class="payment-methods">
					<view class="method-item">
						<image src="/static/images/微信支付@2x.png" class="icon" />
						<!-- <u-radio v-model="selected" :value="'wechat'" activeColor="#FF8C00" /> -->
						<up-checkbox shape="circle" activeColor="#FF8C00" v-model:checked="selected" usedAlone size="32rpx" />
					</view>
				</view>
			</section>

			<section class="section-bottom" style="width: 682rpx;margin: 48rpx auto;">
				<view class="txt flex-start">
					<up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
						:customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
					<text @click="isAgree = !isAgree">
						<text class="u-ml-5">我已阅读并同意该</text>
					</text>
					<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>以及
					<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=baoxian')">《保险须知》</text>
				</view>
			</section>

			<u-button type="primary" @click="submitForm()" :disabled="!priceInfo.spxAngel" customStyle="width:642rpx; margin: 0rpx auto" color="#FF8C00"
				shape="circle">
				立即支付
			</u-button>
		</block>
	</view>
</template>
<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import { useStore } from "vuex";
	import PickerCell from "@/components/common/PickerCell.vue";
	import request from "../utils/request";
	import { useShare } from "@/composables/useShare.js";

	// 使用store
	const store = useStore();

	// 分享配置
	useShare({
		title: '全速天使招募',
		path: '/pagesDashboard/angelForm'
	});
	
	const selected = ref('wechat') // 默认微信支付
	const isAgree = ref(false)

	// 模板引用
	const refForm = ref(null);

	const options_gender = ref([{
			label: "男",
			value: "1"
		},
		{
			label: "女",
			value: "0"
		},
		{
			label: "未知",
			value: "2"
		},
	]);
	
	function validateField (field) {
		refForm.value.validateField(field)
	}
	
	const options_events = ref([]);

	const form = ref({
		gender: "",
		event_id: "",
		full_name: "",
		id_card: "",
		phone_number: "",
	});

	const rules = ref({
		gender: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		event_id: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		full_name: [{
			required: true,
			message: '必填项',
			trigger: ['change', 'blur']
		}, ],
		id_card: [{
				required: true,
				message: '必填项',
				trigger: ['change', 'blur']
			},
			{
				validator: (rule, value, callback) => {
					return uni.$u.test.idCard(value);
				},
				message: '格式不正确',
				trigger: ['change', 'blur'],
			}
		],
		phone_number: [{
				required: true,
				message: '必填项',
				trigger: ['change', 'blur']
			},
			{
				validator: (rule, value, callback) => {
					// uni.$u.test.mobile()就是返回true或者false的
					return uni.$u.test.mobile(value);
				},
				message: '格式不正确',
				trigger: ['change', 'blur'],
			}
		],
	});
	
	getEvents()
	function getEvents() {
		uni.showLoading({
			mask: true
		})
		request.get(`/event-api/api/v1/events`).then((res) => {
			options_events.value = res.events.map(item => ({
				...item,
				value: item.id,
				label: item.name
			}))
		});
	};
	
	const selectedEvent = ref({})
	function changeEvent(e) {
		console.log(e)
		if (selectedEvent.value.id === e.id) return;
		
		selectedEvent.value = e
		
		getPriceInfo()
		
		validateField('event_id')
	}
	
	const priceInfo = ref({})
	function getPriceInfo() {
		request.get(`/booking-api/spxAngel/price?event_id=${selectedEvent.value.id}`).then((res) => {
			priceInfo.value = res
		});
	}
	
	const submitSuccessfully = ref(false)
	const submitForm = () => {
		refForm.value.validate().then((res) => {
			const token = uni.getStorageSync("token");
			if (!token) {
				uni.$u.toast("请先登录~");
				setTimeout(() => {
					uni.$u.route("/pagesSub/login");
				}, 1000);
				return;
			}
			
			if (!isAgree.value) return uni.$u.toast('请勾选协议~')

			const data = {
				...form.value,
				"payment_method": "wechat",
				"payment_amount": parseFloat(priceInfo.value.spxAngel)
			};
			uni.showLoading({
				mask: true,
			});

			request.post(`/booking-api/spxAngel/SignIn`, data).then((res) => {

				
				createOrder(res)
			});
		});
	};
	
	const paymentInfo = ref({})
	function createOrder(payment) {
		uni.showLoading({
			mask: true
		})
		const userInfo = store.state.userInfo;
		
		const data = {
			"reg_no": payment.reg_no,
			"openid": userInfo.openid,
			"event_id": form.value.event_id
		}
		
		request.post(`/pay/spxAngel/wechatPay`, data).then((res) => {
			paymentInfo.value = res;
			wxPay(res)
		});
	};
	
	function wxPay (respay) {
	  // 触发微信支付
	  wx.requestPayment({
	    timeStamp: respay.timeStamp,
	    nonceStr: respay.nonceStr,
	    package: respay.package,
	    signType: respay.signType,
	    paySign: respay.paySign,
	    success: (res) => {
	      uni.hideLoading();
	      uni.$u.toast("提交成功");
	      submitSuccessfully.value = true;
	    },
	    fail: (res) => {
	      uni.hideLoading();
	      console.log("res======>", res);
	      uni.$u.toast("支付未完成");
	    },
	  });
	};
</script>

<style lang="less" scoped>
	::v-deep {
		.u-form {
			padding: 0rpx 34rpx;
		}

		.picker-cell {
			&.placeholder{
				.u-cell__value {
					color: #BFBFBF;
					font-size: 26rpx;
				}
			}
			
			.u-cell__body__content {
				display: none;
			}

			.u-cell__value {
				flex: 1;
				text-align: left;
			}

			.u-cell__body {
				border: 0;
				height: 100rpx;
				background: rgba(255, 255, 255);
				border-radius: 16rpx;
				background: #ffffff;
				border: 2rpx solid rgba(0, 0, 0, 0.06);
			}

			.uicon-arrow-right {
				transform: rotate(90deg);
			}
		}

		.u-form-item__body__right__content__slot {
			width: 100% !important;
			display: block !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__right {
			width: 100% !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__right__content {
			width: 100% !important;
			flex: 1 !important;
			min-width: 0 !important;
		}

		.u-form-item__body__left__content__label {
			flex: unset !important;
		}

		.u-textarea__count {
			right: 20rpx !important;
			bottom: 14rpx !important;
		}

		.u-cell__right-icon-wrap {
			margin-left: 0 !important;
		}

		.u-form-item__body__left__content__required {
			top: 0 !important;
		}

		.u-form-item__body__right__message {
			margin-left: 0 !important;
			margin-top: 6rpx;
		}

		.u-border,
		.u-input {
			border: 0;
		}

		.u-input {
			border: 0;
			height: 100rpx;
			padding: 13px 15px !important;
			background: rgba(255, 255, 255);
			border-radius: 16rpx;
			background: #ffffff;
			border: 2rpx solid rgba(0, 0, 0, 0.06)!important;
		}

		.u-input__content__field-wrapper__field {
			color: #000000 !important;
			font-size: 28rpx !important;
		}

		.u-form-item__body {
			padding: 10px 0 0px !important;
		}

		.input-placeholder {
			font-size: 26rpx !important;
			color: #BFBFBF !important;
		}
	}

	.userinfo-form {
		margin: 46rpx 0;
		padding: 0 20rpx 20rpx;
		background: #FFFFFF;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
	}
	
	.payment-card {
	  width: 682rpx;
		margin: 0 auto;
		padding: 54rpx 24rpx;
	  background: #FFFFFF;
	  border-radius: 16rpx 16rpx 16rpx 16rpx;
	  border: 2rpx solid rgba(0,0,0,0.06);
		.amount-row {
		  display: flex;
		  align-items: center;
		  margin-bottom: 40rpx;
		}
		
		.amount {
		  font-size: 44rpx;
		  color: #E53935;
		  font-weight: bold;
		  margin-right: 10rpx;
		}
		
		.desc {
		  font-size: 20rpx;
		  color: #BFBFBF;
		}
		
		.title {
		  font-size: 24rpx;
		  margin-bottom: 24rpx;
		}
		
		.payment-methods {
		  display: flex;
		  flex-direction: column;
		  gap: 20rpx;
		}
		
		.method-item {
		  display: flex;
		  align-items: center;
		  justify-content: space-between;
			.icon {
			  width: 56rpx;
			  height: 56rpx;
			  border-radius: 8rpx;
			}
		}
		
		.label {
		  font-size: 28rpx;
		  color: #333;
		  margin-left: 10rpx;
		}
	}
</style>