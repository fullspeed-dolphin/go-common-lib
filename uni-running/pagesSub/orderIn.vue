<template>
		<u-navbar title="活动报名" placeholder bgColor="#f8f8f8"/>

		<section class="section-assign">
			<view class="cell flex-between-center">
				<view class="">跑团</view>
				<view class="flex-start" @click="openGroupPop()">
					<view class="txt" :class="{ c70: !myGroup.name }">
						{{ myGroup.name || "加入跑团" }}
					</view>
					<u-icon v-if="!myGroup.group_id" name="arrow-right" size="34rpx" color="#999"></u-icon>
				</view>
			</view>

			<view class="cell flex-between-center">
				<view class="">全速码</view>
				<view class="verify-code-input-wrapper">
					<u-input placeholder="请输入全速码" maxlength="5" border="none" v-model="verifyCode" inputAlign="right"
						color="#000000" fontSize="30rpx" :placeholderStyle="'font-size: 26rpx; color: #999999;font-weight: 700;'">
					</u-input>
				</view>
				<u-tag v-if="!!verifyCode.length" :text="computedCode.text" plain size="mini"
					:type="computedCode.isOk ? 'success' : 'error'"></u-tag>
			</view>
			<view class="cell flex-between-center">
				<view class="cell-label">参赛包领取地址<u-icon name="star-fill" color="#E53935" size="8"></u-icon></view>
				<view class="" style="width:540rpx;margin:0 -20rpx;">
					<PickerCell v-model="selectedAddress" :disabled="!addressPickerColumns.length" placeholder="请选择地址" :border="false" :columns="addressPickerColumns" />
				</view>
			</view>
		</section>

		<view class="section" style="margin-top:30rpx;">
			<view class="section-title">选择套餐<text v-if="multiPackageCount > 1" style="font-size: 24rpx; color: #999; margin-left: 10rpx;">（可选{{ multiPackageCount }}个套餐）</text></view>
			<view class="section-content">
				<view class="price-item" v-for="(item, index) in priceList" :key="index" 
					:class="{ disabled: item.isFull, active: item.isChecked }">
					<view class="price-item-header" @click="togglePackage(item)">
						<view class="flex-between-center" style="width:100%; align-items: flex-start;">
							<view class="price-item-content" >
								<view class="price-item-row">
									<view class="price-item-label">{{ item.label }}</view>
								</view>
								<view class="flex-start">
									<view class="price-item-price u-mr-20">￥{{ item.price }}</view>
									<view v-if="item.isFull" class="price-item-status">已满</view>
									<view v-else-if="item.capacity !== null && item.capacity !== undefined" class="price-item-capacity">
										剩余 {{ item.capacity - (item.capacityUsed || 0) }}
									</view>
								</view>
							</view>

							<view v-if="!item.isFull" class="flex-center u-mt-10" style="font-size: 24rpx;" :class="{active: item.isToggle}">
								{{item.isToggle ? '收起' : '展开' }}
								<u-icon name="arrow-right" :color="item.isChecked ? '#fff' : '#999'" size="10"></u-icon>
							</view>
						</view>
					</view>

					<view v-if="item.isToggle && item.isChecked" class="price-item-signers u-pl-10">
						<view class="u-flex u-flex-wrap" style="gap:20rpx; justify-content: flex-start; align-items: flex-end;">
							<block v-if="item.signerList">
								<view class="flex-col-center" v-for="(signer, indexSigner) in item.signerList" :key="signer.id">
									<view  class="add-btn flex-center rel"  @click="removeSigner(item, indexSigner)">
										<view style="position: absolute;right:-8rpx;top:-8rpx;z-index:6;">
											<u-icon name="close-circle" color="#999" size="20"></u-icon>
										</view>
										<image style="width:88rpx;height:88rpx;" src="/static/images/user.png" mode="aspectFill"></image>
									</view>
									<view class="u-mt-10" style="color:#333;font-weight:400;font-size: 24rpx;">{{signer.full_name}}</view>
								</view>
							</block>

							<view v-if="!item.isFull || (item.capacity - (item.capacityUsed || 0) > 0)" class="add-btn flex-center" v-for="(item1) in item.signers" @click="refSignerList.open(item)">
								<u-icon name="plus" color="#fff" size="16"></u-icon>
							</view>

							<view v-if="!item.signerList" style="flex: 1; font-size: 24rpx; color: #E53935; text-align: right;">
								请选择报名卡
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<section class="section" style="margin-top:30rpx;">
			<section v-if="priceList.length" class="section-content payment-content">
				<view class="money flex-row u-mb-20" style="align-items: baseline">
					￥{{ totalPrice }}
					<view class="txt"> {{ !totalPrice ? '(请添加报名人员）' :'' }} </view>
				</view>
				<view class="" style="margin-bottom: 20rpx; font-size: 24rpx">
					选择支付方式
				</view>
				<view class="flex-between-center method-cell">
					<image class="icon" src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/微信支付@2x.png"
						mode="aspectFill"></image>
					<image class="dot-icon" src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-dot@2x.png"
						mode="aspectFill"></image>
				</view>
			</section>
		</section>

		<section class="section-bottom">
			<view class="agreement-wrapper">
				<up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
					size="32rpx" />
				<view class="agreement-text">
					<text @click="isAgree = !isAgree">我已阅读并同意</text>
					<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>
					<text>、</text>
					<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=baoxian')">《保险须知》</text>
					<template v-if="event_id === '01KCRXHMXF7SEBYCMZ1X2M4E0Y'">
						<text>、</text>
						<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=notices_ShuiLianHu')">《水濂湖报名须知》</text>
						<text>、</text>
						<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=rule_ShuiLianHu')">《水濂湖活动章程》</text>
						<text>、</text>
						<text style="color: #ff8c00" @click="$u.route('pagesSub/settings/agreement?type=disclaimer_ShuiLianHu')">《水濂湖免责声明》</text>
					</template>
				</view>
			</view>
			<view class="" style="padding: 56rpx 20rpx 80rpx">
				<u-button type="primary" color="#ff8c00" shape="circle" @click="submitOrder()">￥{{ totalPrice }} 支付</u-button>
			</view>
		</section>

		<SignerList ref="refSignerList" @select="addSigner"/>
		<GroupList ref="refGroupList" @success="getUserGroup()" />
</template>
<script setup>
	import {
		ref,
		computed,
		watch
	} from "vue";
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app";
	import {
		useStore
	} from "vuex";
	import PickerCell from "@/components/common/PickerCell.vue"
	import GroupList from "./components/groupList.vue";
	import SignerList from "./components/SignerList.vue"
	import { asyncAlls } from "../utils/util";
		import request from "@/utils/request.js"

	// 使用store
	const store = useStore();

	// 模板引用
	const refSignerList = ref(null);
	const refGroupList = ref(null);
	const refUserLogin = ref(null);

	// 响应式数据
	const verifyCode = ref("");
	const myGroup = ref({});
	const activeType = ref({});
	const selectedPackages = ref([]); // 多选时存储选中的套餐数组
	const isAgree = ref(false);
	const SignerInfo = ref({});
	const eventInfo = ref({});
	const priceList = ref([]);
	const computedCode = ref({});
	const event_id = ref("");
	const isSubmitting = ref(false);
	const selectedAddress = ref("");
	const addressPickerColumns = ref([]);
	const multiPackageCount = ref(1); // 存储 multi_package 字段值

	// 计算属性
	const userInfo = computed(() => store.state.userInfo);

	// 判断是否多选
	const isMultiSelect = computed(() => {
		return multiPackageCount.value > 1;
	});
	
	const totalPrice = ref(0)
	watch(
		() => priceList.value,
		(newVal) => {
			let total = 0
			priceList.value.forEach(item => {
				if (item.isChecked) {
					total += (item.price || 0) * (item.signerList?.length || 0)
				}
			})
			
			totalPrice.value = total;
		},
		 { deep: true }
	);
	
	function selectPackage(item) {
		item.isChecked = !item.isChecked;
		
		if (priceList.value.filter(i => i.isChecked).length > multiPackageCount.value) {
			item.isChecked = false
		}
	}
	
	// 计算选中的标签（用于显示）
	const selectedLabels = computed(() => {
		if (isMultiSelect.value) {
			// 多选：用顿号连接所有选中项
			return selectedPackages.value.map(pkg => pkg.label).join('、') || '请选择套餐';
		} else {
			// 单选：返回选中项的标签
			return activeType.value?.label || '请选择套餐';
		}
	});

	// 监听verifyCode变化
	watch(
		() => verifyCode.value,
		(newVal) => {
			// let codeState = {
			//   isOk: false,
			//   text: "全速码无效",
			// };

			// computedCode.value = codeState;

			// if (!verifyCode.value) return;

			console.log("verifyCode.value", verifyCode.value);

			// const reg = /^[0-9a-zA-Z]*$/g;
			// if (verifyCode.value.length !== 5) {
			//   return;
			// }

			uni.$u.debounce(() => {
				getEventPrice()
			}, 300);
		}
	);

	// 页面加载
	onLoad((options) => {
		event_id.value = options.event_id;
		getEventPrice();
		getUserGroup();
		getEventAddresses();
	});

	// 方法定义
	const openGroupPop = () => {
		if (myGroup.value.group_id) return;

		refGroupList.value.open();
	};

	// 获取活动地址列表
	const getEventAddresses = async () => {
		if (!event_id.value) return;

		try {
			const res = await request.get(`/event-api/api/v1/events/${event_id.value}`);

			// 获取 multi_package 字段，判断是否多选
			if (res && res.multi_package !== undefined && res.multi_package !== null) {
				multiPackageCount.value = Number(res.multi_package);
			} else {
				multiPackageCount.value = 1; // 默认单选
			}

			console.log("multi_package:", multiPackageCount.value, "isMultiSelect:", isMultiSelect.value);

			if (res?.racekit_pickup_address) {
				try {
					// racekit_pickup_address 是 JSON 字符串，需要解析
					const addressData =
						typeof res.racekit_pickup_address === "string" ?
						JSON.parse(res.racekit_pickup_address) :
						res.racekit_pickup_address;
						
					
					
					if (
						addressData?.addresses &&
						Array.isArray(addressData.addresses)
					) {
						// 转换为 picker 需要的格式
						addressPickerColumns.value = addressData?.addresses.map(
							(addr, index) => ({
								label: addr,
								value: addr,
							})
						);
						
						const addressList = addressData?.addresses || []
						
						if (addressList.length === 1) {
							selectedAddress.value = addressPickerColumns.value[0].value
						}
					}
				} catch (error) {
					console.error("解析地址数据失败:", error);
				}
			}
		} catch (error) {
			console.error("获取活动地址失败:", error);
		}
	};

	const getUserGroup = () => {
		uni.showLoading({
			mask: true
		});

		if (!userInfo.value.running_group) {
			myGroup.value = {};

			return;
		}

		request.get(`/running-group/api/v1/groups/info?group_id=${userInfo.value.running_group}`).then(res => {
			if (res) {
				myGroup.value = res;
			}
		})
	};

	const getEventPrice = (spxcode = null) => {
		const data = {
			event_id: event_id.value,
			spxcode: verifyCode.value,
		};
		request.post("/booking-api/user/price", data).then((res) => {
			// request.post('/booking-api/user/price?test_for_fullspeed', data).then(res => {
			eventInfo.value = res;

			if (res.spxcode_status === "ACT") {
				computedCode.value = {
					isOk: true,
					text: "全速码有效",
				};
			} else {
				computedCode.value = {
					isOk: false,
					text: "全速码无效",
				};
			}

			let priceListData = [];
			res?.tickets?.map((ticket) => {
				Object.keys(ticket?.price || {}).forEach((i) => {
					const priceValue = ticket?.price[i];

					// 判断是新格式还是旧格式
					let itemData = {};
					if (typeof priceValue === 'object' && priceValue !== null) {
						// 新格式：带容量限制
						const capacity = priceValue.capacity;
						const capacityUsed = priceValue.capacity_used;

						// 判断是否已满：capacity_used >= capacity（只有两者都不为 null 时才判断）
						const isFull = (capacity !== null && capacity !== undefined) &&
							(capacityUsed !== null && capacityUsed !== undefined) &&
							capacityUsed >= capacity;

						itemData = {
							...priceValue,
							price: priceValue.price,
							label: i,
							capacity: capacity,
							capacityUsed: capacityUsed,
							isFull: isFull,
						};

						console.log(`套餐 ${i}: 容量 ${capacityUsed}/${capacity}, 已满: ${isFull}`);
					} else {
						// 旧格式：直接是数字
						itemData = {
							price: priceValue,
							label: i,
							isFull: false, // 旧格式默认不限制
						};
					}

					// console.log("data", itemData, ticket?.price);

					// 如果没有选中的套餐，且当前套餐未满，则设为默认选中
					if (!activeType?.value?.label && !itemData.isFull) {
						activeType.value = itemData;
					}

					priceListData.push(itemData);
				});
			});

			console.log("priceListData======>", priceListData)

			priceList.value = priceListData;

			// 如果有选中数据，更新选中的数据
			if (isMultiSelect.value) {
				// 多选模式：更新已选中的套餐价格，移除已满的套餐
				// selectedPackages.value = selectedPackages.value
				// 	.map(pkg => priceListData.find(i => i.label === pkg.label))
				// 	.filter(pkg => pkg !== undefined && !pkg.isFull);
			} else {
				// 单选模式：更新选中的套餐，如果已满则清空
				if (activeType.value.label) {
					const updatedItem = priceListData.find(i => i.label === activeType.value.label);
					if (updatedItem && !updatedItem.isFull) {
						activeType.value = updatedItem;
					} else {
						// 如果选中的套餐已满，选择第一个未满的套餐
						activeType.value = priceListData.find(i => !i.isFull) || {};
					}
				}
			}
		});
	};
	
	function removeSigner (item, indexSigner) {
		item.signerList.splice(indexSigner, 1);
		item.signers ++
		item.capacityUsed --
	}

	// 从身份证号码解析出生日期
	const parseBirthDateFromIdCard = (idCard) => {
		if (!idCard || idCard.length !== 18) return null;
		const birthStr = idCard.substring(6, 14); // YYYYMMDD
		const year = parseInt(birthStr.substring(0, 4));
		const month = parseInt(birthStr.substring(4, 6));
		const day = parseInt(birthStr.substring(6, 8));
		return new Date(year, month - 1, day);
	};

	// 从身份证号码解析性别 (第17位,奇数为男,偶数为女)
	const parseGenderFromIdCard = (idCard) => {
		if (!idCard || idCard.length !== 18) return null;
		const genderCode = parseInt(idCard.charAt(16));
		return genderCode % 2 === 1 ? '男' : '女';
	};

	const addSigner = (data) => {
		// console.log(data, priceList.value)

		const curOption = priceList.value.find(item => item.label === data.eventInfo.label);

		// 硬编码逻辑:仅对特定活动生效
		if (event_id.value === '01KCRXHMXF7SEBYCMZ1X2M4E0Y') {
			const idCard = data.signerInfo.cert_number;

			// 验证1:如果套餐价格为0,只能选择2016年1月1日之后出生的报名卡
			if (curOption.price === 0) {
				const birthDate = parseBirthDateFromIdCard(idCard);
				const limitDate = new Date(2016, 0, 1); // 2016-01-01
				if (!birthDate || birthDate < limitDate) {
					return uni.$u.toast('请选择2016年之后出生的报名卡');
				}
			}

			// 验证2:套餐名称包含'男'或'女',强制匹配性别
			const packageName = curOption.label;
			const genderFromIdCard = parseGenderFromIdCard(idCard);

			if (packageName.includes('男') && genderFromIdCard !== '男') {
				return uni.$u.toast('请选择正确性别的报名卡');
			}

			if (packageName.includes('女') && genderFromIdCard !== '女') {
				return uni.$u.toast('请选择正确性别的报名卡');
			}
		}

		// if (!isMultiSelect.value) {
		// 	const isSigned = priceList.value.some(item => {
		// 		return item?.signerList?.some(i => i.id === data.signerInfo.id)
		// 	})
		// 	if (isSigned) {
		// 		return uni.$u.toast('重复添加，只能单个项目报名~')
		// 	}
		// }
		
		if (!curOption.signerList) {
			curOption.signerList = [data.signerInfo]
			curOption.signers --
			curOption.capacityUsed ++
		} else {
			if (curOption.signerList.some(i => i.id === data.signerInfo.id)) {
				return uni.$u.toast('重复添加~')
			}

			curOption.signerList.push(data.signerInfo)
			curOption.signers --
			curOption.capacityUsed ++
		}

		// 添加报名卡后自动选中套餐
		if (!curOption.isChecked) {
			const checkedCount = priceList.value.filter(i => i.isChecked).length
			if (checkedCount < multiPackageCount.value) {
				curOption.isChecked = true
			}
		}
	};
	
	function canSelectPackage(item) {
		if (item.isChecked) return true
		const checkedCount = priceList.value.filter(i => i.isChecked).length
		return checkedCount < multiPackageCount.value
	}

	function togglePackage (item) {
		if (item.isFull) return;
		
		// 如果套餐未选中且已达选择上限，不响应点击
		if (!item.isChecked && !canSelectPackage(item)) {
			return
		}

		item.isToggle = !item.isToggle
		if (item.isToggle) {
			// 展开时自动选中套餐
			if (!item.isChecked) {
				item.isChecked = true
			}
		} else {
			// 收起时取消选中套餐
			item.isChecked = false
		}
	}

	const changeTab = (item) => {
		// 检查套餐是否已满
		if (item.isFull) {
			uni.$u.toast("该套餐已满，无法选择");
			return;
		}

		if (isMultiSelect.value) {
			// 多选逻辑：toggle 选中状态
			const index = selectedPackages.value.findIndex(pkg => pkg.label === item.label);
			if (index > -1) {
				// 已选中，移除
				selectedPackages.value.splice(index, 1);
			} else {
				// 未选中，添加（检查是否超过限制）
				if (selectedPackages.value.length >= multiPackageCount.value) {
					uni.$u.toast(`最多只能选择 ${multiPackageCount.value} 个套餐`);
					return;
				}
				selectedPackages.value.push(item);
			}
			console.log("已选中套餐:", selectedPackages.value);
		} else {
			// 单选逻辑：直接替换
			activeType.value = item;
		}
	};

	const submitOrder = async () => {
		if (!store.state.userInfo.id) {
			return refUserLogin.value.open();
		}
		
		if (!isAgree.value) return uni.$u.toast("请勾选同意协议");
		
		// 校验：所有被选中的套餐都必须添加人员
		const checkedPackages = priceList.value.filter(item => item.isChecked)
		if (!checkedPackages.length) return uni.$u.toast("请选择套餐");

		const packagesWithoutSigners = checkedPackages.filter(item => !item?.signerList?.length)
		if (packagesWithoutSigners.length > 0) {
			const names = packagesWithoutSigners.map(p => p.label).join('、')
			return uni.$u.toast(`请在「${names}」套餐内添加人员`);
		}

		if (!selectedAddress.value) return uni.$u.toast("请选择参赛包领取地址");

		// const reg = /^[0-9a-zA-Z]*$/g;
		// if (verifyCode.value) {
		//   if (!reg.test(verifyCode.value) || verifyCode.value.length !== 5) {
		//     return uni.$u.toast("全速码 格式有误");
		//   }
		// }

		// 校验：如果选中的套餐总价为0，拒绝付款
		if (totalPrice.value === 0) {
			uni.showModal({
				title: "提示",
				content: "当前套餐不支持单独购买",
				showCancel: false,
			});
			return;
		}
		if (isSubmitting.value) return;
		isSubmitting.value = true;
		uni.showLoading({
			mask: true,
		});
		
		try {
			let allSignerList = []
			priceList.value.filter(i => i.isChecked).forEach(item => {
				if (item.signerList) {
					item.signerList?.forEach(user => {
						allSignerList.push({
							...user,
							eventInfo: item
						})
					})
				}
			})
			const promiseList = allSignerList.map(item => createSingleOrder(item))
			
			const orderNoList = await asyncAlls(promiseList)
			console.log(orderNoList)
			
			const tempList = orderNoList.filter(i => !!i)
			if (tempList.length) {
				payOrder(orderNoList);
			}
		} catch(e) {
			console.error(e)
		}
		
		isSubmitting.value = false;
	};
	
	// 硬编码逻辑：根据套餐名称强制设置T-shirt尺码（仅对特定活动生效）
	function getFixedTshirtSize(packageLabel, originalSize) {
		// 仅对特定活动生效
		if (event_id.value !== '01KCRXHMXF7SEBYCMZ1X2M4E0Y') {
			return originalSize;
		}

		if (packageLabel.includes('男')) {
			return 'L';
		} else if (packageLabel.includes('女')) {
			return 'M';
		} else if (packageLabel.includes('小孩') || packageLabel.includes('儿童') || packageLabel.includes('亲子')) {
			return '130';
		} else {
			// 其他情况返回 null，调用方需要处理报错
			return null;
		}
	}

	async function createSingleOrder(signer) {
		const packageLabel = signer.eventInfo.label;

		// 获取强制设置的T-shirt尺码
		let tshirtSize = getFixedTshirtSize(packageLabel, signer.tshirt_size);

		// 特定活动下，如果无法确定尺码则报错
		if (event_id.value === '01KCRXHMXF7SEBYCMZ1X2M4E0Y' && tshirtSize === null) {
			uni.showModal({
				title: "提示",
				content: `套餐"${packageLabel}"无法确定T-shirt尺码，请联系客服`,
				showCancel: false,
			});
			return null;
		}

		const data = {
			full_name: signer.full_name || null,
			id_card: signer.cert_number || null,
			gender: signer.gender || null,
			phone_number: signer.phone_number || null,
			tshirt_size: tshirtSize,
			email: signer.email || null,
			blood_type: signer.blood_type || null,
			package: packageLabel,
			payment_method: "wechat",
			event_id: event_id.value,
			payment_amount: signer.eventInfo.price,
			spxcode: computedCode.value.isOk ? verifyCode.value : null,
			running_group: String(userInfo.value.running_group || ""),
			racekit_pickup_address: selectedAddress.value || null,
		};

		try {
			uni.showLoading({
				mask: true,
			});
			const res = await request.post(`/booking-api/registration/SignInEvent`, data)
			return res.reg_no
		} catch (error) {
			console.error(error)
			uni.showModal({
				title: "提示",
				content: error.msg,
				showCancel: false,
			});
		}
	}

	const payOrder = async (reg_no) => {
		const data = {
			reg_no,
			event_id: event_id.value,
			openid: userInfo.value.openid,
		};

		uni.showLoading({
			mask: true,
		});

		request.post(`/pay/wechat/payment`, data).then((res) => {
			wxPay(res);
		});
	};

	const wxPay = (respay) => {
		// 触发微信支付
		wx.requestPayment({
			timeStamp: respay.timeStamp,
			nonceStr: respay.nonceStr,
			package: respay.package,
			signType: respay.signType,
			paySign: respay.paySign,
			success: (res) => {
				uni.hideLoading();
				uni.$u.toast("支付成功");
				setTimeout(() => {
					// uni.navigateBack()
					uni.$u.route("pagesSub/orderSuccess?order_no=" + respay.order_no);
				}, 300);
			},
			fail: (res) => {
				uni.hideLoading();
				console.log("res======>", res);
				uni.$u.toast("支付未完成");
				setTimeout(() => {
					// uni.navigateBack()
					uni.$u.route("pagesSub/orderFail?order_no=" + respay.order_no);
				}, 300);
			},
		});
	};
	defineOptions({
		options: {
			styleIsolation: "shared",
		},
	});
</script>

<style lang="less">
	.add-btn{
		width: 88rpx;
		height: 88rpx;
		background: #FF8C00;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
	}
	.check-icon{
		border-radius: 50rpx;
		width: 40rpx;height: 40rpx;background: #FF8C00;
		&.active{
			transform: rotate(90deg);
		}
	}
	.page {
		background: #fafafa;
	}

	.section-bottom {
		margin: 30rpx 34rpx;

		.agreement-wrapper {
			display: flex;
			align-items: flex-start;
			gap: 10rpx;
		}

		.agreement-text {
			flex: 1;
			font-size: 26rpx;
			line-height: 1.6;
			color: #333;
			word-wrap: break-word;
			word-break: break-all;

			text {
				font-size: 26rpx;
				line-height: 1.6;
			}
		}
	}

	.section-assign {
		.cell {
			width: 682rpx;
			min-height: 100rpx;
			padding: 0 20rpx;
			margin: 0rpx auto 20rpx;
			background: #ffffff;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			border: 2rpx solid rgba(0, 0, 0, 0.06);
		}

		.txt {
			font-weight: 500;
			font-size: 30rpx;
			color: #000000;

			&.c70 {
				font-size: 26rpx;
				color: #999999;
			}
		}
	}

	.scroll-view {
		padding: 10rpx 34rpx;
	}

	::v-deep {
		.input-cell {
			padding: 0 !important;
		}

		.verify-code-input-wrapper {
			.u-input__content__field-wrapper__field {
				font-weight: bold !important;
			}
		}
	}

	.section {
		margin-top: 48rpx;
		padding: 0 34rpx;
		width: 100%;
	}
	
	.section-title {
		font-weight: bold;
		font-size: 30rpx;
		color: #000000;
		margin-bottom: 24rpx;
	}
	
	.section-content {
		background: #ffffff;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid rgba(0, 0, 0, 0.06);
		width: 100%;
		padding: 30rpx 20rpx;
	}

		.price-item {
			min-height: 90rpx;
			background: #f6fafb;
			border-radius: 16rpx;
			font-weight: bold;
			font-size: 30rpx;
			color: #000000;
			overflow: hidden;
			margin-bottom: 20rpx;
			&.active {
				border: 1px solid #ff8c00;
				box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
				.price-item-header{
					background: #ff8c00;
					color: #ffffff;
					border-radius: 0;
				}
				.price-item-content {
					.price-item-price,
					.price-item-status,
					.price-item-capacity {
						color: #ffffff;
					}
				}
			}

			.price-item-header {
				padding: 20rpx;
				background: #f6fafb;
				border-radius: 16rpx;
				// transition: background 0.3s ease;
			}

			.price-item-signers {
				padding: 20rpx 20rpx 20rpx 0;
				background: #ffffff;
			}

			&.disabled {
				background: #e0e0e0;
				color: #9e9e9e;
				cursor: not-allowed;
				opacity: 0.6;

				.price-item-status {
					color: #d32f2f;
				}

				.price-item-capacity {
					color: #9e9e9e;
				}
			}

			.price-item-content {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: 4rpx;

				.price-item-row {
					display: flex;
					align-items: center;
					gap: 16rpx;
				}

				.price-item-label {
					font-weight: bold;
					font-size: 30rpx;
				}

				.price-item-price {
					font-size: 26rpx;
					color: #ff8c00;
					font-weight: bold;
				}

				.price-item-status {
					font-size: 22rpx;
					color: #d32f2f;
					font-weight: normal;
				}

				.price-item-capacity {
					font-size: 22rpx;
					color: #666666;
					font-weight: normal;
				}
			}
		}

	.payment-content {
		.money {
			color: #e53935;
			font-size: 44rpx;
			.txt {
				font-size: 34rpx;
				color: #000;
				margin-left: 20rpx;
			}
		}

		.method-cell {
			.icon {
				width: 58rpx;
				height: 56rpx;
			}

			.dot-icon {
				width: 32rpx;
				height: 32rpx;
			}
		}
	}

	.cell-label {
		white-space: nowrap;
		margin-right: 20rpx;
	}
</style>