<template>
	<view class="page">
		<Navbar :title="pageTitle" :bgHeight="370" />
		<!-- <view class="form-tip">所有信息均为必填项</view> -->
		<up-form ref="formRef" :model="form" :rules="rules" labelWidth="260rpx">
			<view class="section">
				<view class="section-title">基本信息</view>
				<view class="section-content">
					<up-form-item prop="name" required>
						<template #label>
							<view class="label-with-icon" @click="showTip('用于购买保险，必须实名')">
								<text class="flex-row">姓名<text class="txt_required">*</text></text>
								<up-icon name="info-circle" size="16" color="#FF8C00" class="tip-icon" />
							</view>
						</template>
						<view class="row" style="width:100%;padding-right:20rpx;">
							<up-input v-model="form.name" placeholder="请填写您的真实姓名" border="none" inputAlign="right" />
							<view class="owner">
								<up-checkbox v-model:checked="form.isOwner" :usedAlone="true" shape="circle" activeColor="#8CC63E"
									size="16" />
								<text class="owner-text">本人</text>
							</view>
						</view>
					</up-form-item>

					<up-form-item label="中文拼音" prop="pinyin">
						<up-input v-model="form.pinyin" placeholder="请填写" border="none" inputAlign="right" />
					</up-form-item>

					<up-form-item label="性别" prop="gender" required>
						<up-radio-group v-model="form.gender" activeColor="#8CC63E" shape="square"
							customStyle="flex: 0 0 auto; margin-left: auto;">
							<up-radio :name="'male'" label="男" />
							<up-radio :name="'female'" label="女" />
						</up-radio-group>
					</up-form-item>

					<up-form-item label="证件类型" prop="idType" required>
						<view @click="showIdTypePicker = true">
							<up-input :modelValue="form.idType || ''" placeholder="请选择" border="none" inputAlign="right" readonly>
								<template #suffix>
									<up-icon name="arrow-right" size="18" color="#999" />
								</template>
							</up-input>
						</view>
						<up-picker v-model="selectedIdType" :show="showIdTypePicker" :columns="[idTypeOptions]"
							:defaultIndex="idTypeIndex" keyName="name" valueName="id" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" @confirm="onIdTypeConfirm" @cancel="showIdTypePicker = false"
							@close="showIdTypePicker = false" />
					</up-form-item>

					<up-form-item label="证件号码" prop="idCardNumber" required>
						<template #label>
							<view class="label-with-icon" @click="showTip('用于购买保险，必须输入真实的证件号码')">
								<text class="flex-row">证件号码<text class="txt_required">*</text></text>
								<up-icon name="info-circle" size="16" color="#FF8C00" class="tip-icon"/>
							</view>
						</template>
						<up-input v-model="form.idCardNumber" placeholder="请填写证件号码" border="none" inputAlign="right" />
					</up-form-item>

					<up-form-item label="出生日期" prop="birthday">
						<up-datetime-picker hasInput v-model="birthdayTimestamp" mode="date" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" :minDate="startDate" :maxDate="endDate" @confirm="onBirthdayConfirm">
							<template #trigger="{ value }">
								<up-input :modelValue="value || ''" placeholder="请选择" border="none" inputAlign="right" readonly>
									<template #suffix>
										<up-icon name="arrow-right" size="18" color="#999" />
									</template>
								</up-input>
							</template>
						</up-datetime-picker>
					</up-form-item>

					<up-form-item label="手机号码" prop="mobile" required>
						<up-input v-model="form.mobile" placeholder="请输入手机号" border="none" type="number" inputAlign="right" />
					</up-form-item>

					<up-form-item label="邮箱" prop="email">
						<up-input v-model="form.email" placeholder="请填写" border="none" inputAlign="right" />
					</up-form-item>
				</view>
			</view>

			<view class="section">
				<view class="section-title">常住地址</view>
				<view class="section-content">
					<up-form-item label="国家/地区" prop="country">
						<view @click="showCountryPicker = true">
							<up-input :modelValue="countryDisplayName" placeholder="请选择" border="none" inputAlign="right" readonly>
								<template #suffix>
									<up-icon name="arrow-right" size="18" color="#999" />
								</template>
							</up-input>
						</view>
						<up-picker v-model="selectedCountry" :show="showCountryPicker" :columns="[countryOptions]"
							:defaultIndex="countryIndex" keyName="name" valueName="id" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" @confirm="onCountryConfirm" @cancel="showCountryPicker = false"
							@close="showCountryPicker = false" />
					</up-form-item>
					<up-form-item label="省市区" prop="region" required>
						<view @click="openProvincePicker">
							<up-input :modelValue="regionDisplayName" placeholder="请选择" border="none" inputAlign="right" readonly>
								<template #suffix>
									<up-icon name="arrow-right" size="18" color="#999" />
								</template>
							</up-input>
						</view>
						<up-picker v-model="selectedProvince" :show="showProvincePicker" :columns="[provinceOptions]"
							:defaultIndex="provinceIndex" keyName="name" valueName="code" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" @confirm="onProvinceConfirm" @cancel="showProvincePicker = false"
							@close="showProvincePicker = false" />
						<up-picker v-model="selectedCity" :show="showCityPicker" :columns="[cityOptions]" :defaultIndex="cityIndex"
							keyName="name" valueName="code" cancelText="取消" confirmText="确认" confirmColor="#FF8C00"
							@confirm="onCityConfirm" @cancel="showCityPicker = false" @close="showCityPicker = false" />
						<up-picker v-model="selectedArea" :show="showAreaPicker" :columns="[areaOptions]" :defaultIndex="areaIndex"
							keyName="name" valueName="code" cancelText="取消" confirmText="确认" confirmColor="#FF8C00"
							@confirm="onAreaConfirm" @cancel="showAreaPicker = false" @close="showAreaPicker = false" />
					</up-form-item>
					<up-form-item label1="详细地址" prop="address" required>
						<template #label>
							<div @click="showTip('邮寄需要')">
								<view class="label-with-icon">
									<text class="flex-row">详细地址<text class="txt_required">*</text></text>
									<up-icon name="info-circle" size="16" color="#FF8C00" class="tip-icon" />
								</view>
							</div>
						</template>
						<view class="address-input-wrapper">
							<up-input v-model="form.address" placeholder="请填写详细地址" border="none" inputAlign="right" />
							<view class="address-icon-wrapper" @click="handleChooseLocation">
								<up-icon name="map" size="20" color="#FF8C00" />
							</view>
						</view>
					</up-form-item>
				</view>
			</view>

			<view class="section">
				<view class="section-title">其他</view>
				<view class="section-content">
					<up-form-item label="血型" prop="bloodType">
						<view @click="showBloodTypePicker = true">
							<up-input :modelValue="bloodTypeDisplayName" placeholder="请选择" border="none" inputAlign="right" readonly>
								<template #suffix>
									<up-icon name="arrow-right" size="18" color="#999" />
								</template>
							</up-input>
						</view>
						<up-picker v-model="selectedBloodType" :show="showBloodTypePicker" :columns="[bloodTypeOptions]"
							:defaultIndex="bloodTypeIndex" keyName="name" valueName="value" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" @confirm="onBloodTypeConfirm" @cancel="showBloodTypePicker = false"
							@close="showBloodTypePicker = false" />
					</up-form-item>
					<up-form-item label1="衣服尺寸" prop="clothesSize" required>
						<template #label>
							<div @click="showTip('参赛服所需')">
								<view class="label-with-icon">
									<text class="flex-row">衣服尺寸<text class="txt_required">*</text></text>
									<up-icon name="info-circle" size="16" color="#FF8C00" class="tip-icon" />
								</view>
							</div>
						</template>
						<view style="width:100%;padding-right:20rpx;" @click="showTshirtSizePicker = true">
							<up-input :modelValue="tshirtSizeDisplayName" placeholder="请选择" border="none" inputAlign="right" readonly>
								<template #suffix>
									<up-icon name="arrow-right" size="18" color="#999" />
								</template>
							</up-input>
						</view>
						<up-picker v-model="selectedTshirtSize" :show="showTshirtSizePicker" :columns="[tshirtSizeOptions]"
							:defaultIndex="tshirtSizeIndex" keyName="name" valueName="value" cancelText="取消" confirmText="确认"
							confirmColor="#FF8C00" @confirm="onTshirtSizeConfirm" @cancel="showTshirtSizePicker = false"
							@close="showTshirtSizePicker = false" />
					</up-form-item>
					<up-form-item label="紧急联系人" prop="emergencyContact" required>
						<up-input v-model="form.emergencyContact" placeholder="请填写" border="none" inputAlign="right" />
					</up-form-item>
					<up-form-item label="紧急联系人电话" prop="emergencyPhone" required>
						<up-input v-model="form.emergencyPhone" placeholder="请填写" border="none" type="number" inputAlign="right" />
					</up-form-item>
				</view>
			</view>

			<view class="section">
				<view class="section-content agree">
					<view class="agree-text">
						<span>阅读并同意以下内容</span>
						<up-checkbox v-model:checked="form.agreed" :usedAlone="true" shape="circle" activeColor="#8CC63E" />
					</view>
					<view class="agree-content">您已知晓您在跑了没录入的参赛人身份信息，并将用于报名
						活动赛事等所有需要实名制的赛事产品，并在您保存时进行
						验证，请确保此信息真实有效。
						跑了没将通过加密等方式保护此信息。</view>
				</view>
			</view>

			<section class="section-bottom">
				<view style="padding: 54rpx 48rpx">
					<u-button type="primary" :color="form.agreed ? '#FF8C00' : '#F2F2F2'" :disabled="!form.agreed || submitting"
						shape="circle" :customStyle="buttonCustomStyle" @click="onSubmit">保存</u-button>
				</view>
			</section>
		</up-form>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref,
		watch,
		computed,
		nextTick,
		onMounted
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import Navbar from "@/components/navbar.vue";
	import dayjs from "dayjs";
	import {
		pinyin
	} from "../utils/pinyin-pro";
	import {
		loadProvinceData,
		loadCityData,
		loadAreaData,
	} from "@/utils/regionData.js";

	const props = defineProps({
		modelValue: {
			type: Object,
			default: () => ({})
		},
		mode: {
			type: String,
			default: "create"
		},
	});
	const emit = defineEmits(["update:modelValue", "submit"]);

	const formRef = ref(null);
	const submitting = ref(false);
	// 日期选择器的开始和结束日期（时间戳格式，供 up-datetime-picker 使用）
	const startDate = dayjs("1950-01-01").valueOf();
	const endDate = dayjs().valueOf();
	const showIdTypePicker = ref(false);
	const idTypeIndex = ref([0]);
	const selectedIdType = ref([]);
	const showCountryPicker = ref(false);
	const countryIndex = ref([0]);
	const selectedCountry = ref([]);

	// 省市区 picker 状态
	const showProvincePicker = ref(false);
	const provinceIndex = ref([0]);
	const selectedProvince = ref([]);
	const showCityPicker = ref(false);
	const cityIndex = ref([0]);
	const selectedCity = ref([]);
	const showAreaPicker = ref(false);
	const areaIndex = ref([0]);
	const selectedArea = ref([]);

	// 省市区数据
	const provinceOptions = ref([]);
	const cityOptions = ref([]);
	const areaOptions = ref([]);

	// 原始省市区数据（从网络加载）
	const provinceData = ref([]);
	const cityData = ref([]);
	const areaData = ref([]);
	const regionDataLoaded = ref(false);

	// 血型 picker 状态
	const showBloodTypePicker = ref(false);
	const bloodTypeIndex = ref([0]);
	const selectedBloodType = ref([]);

	// 衣服尺寸 picker 状态
	const showTshirtSizePicker = ref(false);
	const tshirtSizeIndex = ref([0]);
	const selectedTshirtSize = ref([]);

	const defaultForm = {
		name: "",
		isOwner: false,
		pinyin: "",
		gender: "male",
		idType: "身份证",
		idCardNumber: "",
		birthday: "",
		mobile: "",
		email: "",
		country: "",
		region: "",
		address: "",
		bloodType: "",
		clothesSize: "",
		emergencyContact: "",
		emergencyPhone: "",
		agreed: false,
	};

	const form = reactive({
		...defaultForm,
		...props.modelValue
	});

	watch(
		() => props.modelValue,
		(val) => {
			if (!val) return;
			Object.assign(form, defaultForm, val);
		}, {
			deep: true
		}
	);

	watch(
		() => form,
		() => emit("update:modelValue", {
			...form
		}), {
			deep: true
		}
	);

	// 监听姓名变化，自动生成拼音
	// 使用标志位避免用户手动修改拼音后被覆盖
	const isAutoGeneratingPinyin = ref(false);
	const lastAutoGeneratedPinyin = ref("");

	watch(
		() => form.name,
		(newName) => {
			if (!newName) {
				// 如果姓名为空，且当前拼音是自动生成的，则清空拼音
				if (form.pinyin === lastAutoGeneratedPinyin.value) {
					isAutoGeneratingPinyin.value = true;
					form.pinyin = "";
					lastAutoGeneratedPinyin.value = "";
					nextTick(() => {
						isAutoGeneratingPinyin.value = false;
					});
				}
				return;
			}

			// 提取中文字符
			const chineseChars = newName.match(/[\u4e00-\u9fa5]/g);
			if (chineseChars && chineseChars.length > 0) {
				try {
					// 将每个中文字符转换为拼音，用空格分隔
					const pinyinArray = chineseChars.map((char) => {
						return pinyin(char, {
							toneType: "none", // 不带声调
							type: "first", // 只返回第一个拼音
							v: true, // 使用 v 代替 ü
						}).toUpperCase();
					});

					const generatedPinyin = pinyinArray.join(" ");

					// 如果当前拼音是之前自动生成的，或者是空的，则更新
					if (form.pinyin === lastAutoGeneratedPinyin.value || !form.pinyin) {
						isAutoGeneratingPinyin.value = true;
						form.pinyin = generatedPinyin;
						lastAutoGeneratedPinyin.value = generatedPinyin;
						nextTick(() => {
							isAutoGeneratingPinyin.value = false;
						});
					}
				} catch (error) {
					console.error("生成拼音失败:", error);
				}
			} else {
				// 如果没有中文字符，清空拼音（如果之前是自动生成的）
				if (form.pinyin === lastAutoGeneratedPinyin.value) {
					isAutoGeneratingPinyin.value = true;
					form.pinyin = "";
					lastAutoGeneratedPinyin.value = "";
					nextTick(() => {
						isAutoGeneratingPinyin.value = false;
					});
				}
			}
		}
	);

	// 监听身份证号码变化，自动解析出生日期
	// 使用标志位避免用户手动修改出生日期后被覆盖
	const isAutoGeneratingBirthday = ref(false);
	const lastAutoGeneratedBirthday = ref("");

	watch(
		() => form.idCardNumber,
		(newIdCard) => {
			// 只在证件类型为"身份证"时才自动解析
			if (form.idType !== "身份证") {
				return;
			}

			if (!newIdCard) {
				// 如果身份证号码为空，且当前出生日期是自动生成的，则清空出生日期
				if (form.birthday === lastAutoGeneratedBirthday.value) {
					isAutoGeneratingBirthday.value = true;
					form.birthday = "";
					lastAutoGeneratedBirthday.value = "";
					nextTick(() => {
						isAutoGeneratingBirthday.value = false;
					});
				}
				return;
			}

			// 移除空格等非数字字符
			const idCard = newIdCard.replace(/\s+/g, "");

			// 验证身份证号码格式（15位或18位）
			if (!/^(\d{15}|\d{17}[\dXx])$/.test(idCard)) {
				return;
			}

			try {
				let birthdayStr = "";

				if (idCard.length === 18) {
					// 18位身份证：第7-14位是出生日期（YYYYMMDD）
					birthdayStr = idCard.substring(6, 14);
				}
				//  else if (idCard.length === 15) {
				//   // 15位身份证：第7-12位是出生日期（YYMMDD）
				//   const year = idCard.substring(6, 8);
				//   const month = idCard.substring(8, 10);
				//   const day = idCard.substring(10, 12);
				//   // 判断年份：00-30 认为是 2000-2030，31-99 认为是 1931-1999
				//   const fullYear = parseInt(year) <= 30 ? `20${year}` : `19${year}`;
				//   birthdayStr = `${fullYear}${month}${day}`;
				// }

				// 验证日期格式和有效性
				if (birthdayStr && birthdayStr.length === 8) {
					const year = birthdayStr.substring(0, 4);
					const month = birthdayStr.substring(4, 6);
					const day = birthdayStr.substring(6, 8);

					// 验证日期是否有效
					const date = dayjs(`${year}-${month}-${day}`);
					if (date.isValid()) {
						const formattedBirthday = date.format("YYYY-MM-DD");

						// 如果当前出生日期是之前自动生成的，或者是空的，则更新
						if (
							form.birthday === lastAutoGeneratedBirthday.value ||
							!form.birthday
						) {
							isAutoGeneratingBirthday.value = true;
							form.birthday = formattedBirthday;
							lastAutoGeneratedBirthday.value = formattedBirthday;

							// 手动触发验证
							nextTick(() => {
								if (formRef.value) {
									formRef.value.validateField("birthday", () => {}, "change");
								}
								isAutoGeneratingBirthday.value = false;
							});
						}
					}
				}
			} catch (error) {
				console.error("解析身份证出生日期失败:", error);
			}
		}
	);

	// 监听证件类型变化，如果从身份证改为其他类型，清空自动生成的出生日期
	watch(
		() => form.idType,
		(newIdType, oldIdType) => {
			// 如果从身份证改为其他类型，且当前出生日期是自动生成的，则清空
			if (oldIdType === "身份证" && newIdType !== "身份证") {
				if (form.birthday === lastAutoGeneratedBirthday.value) {
					isAutoGeneratingBirthday.value = true;
					form.birthday = "";
					lastAutoGeneratedBirthday.value = "";
					nextTick(() => {
						isAutoGeneratingBirthday.value = false;
					});
				}
			}
			// 如果改为身份证，且身份证号码已填写，尝试解析出生日期
			else if (
				oldIdType !== "身份证" &&
				newIdType === "身份证" &&
				form.idCardNumber
			) {
				// 触发身份证号码的 watch
				const idCard = form.idCardNumber;
				form.idCardNumber = "";
				nextTick(() => {
					form.idCardNumber = idCard;
				});
			}
		}
	);

	const pageTitle = computed(() =>
		props.mode === "edit" ? "编辑报名卡" : "添加报名卡"
	);

	const countryDisplayName = computed(() => {
		if (!form.country) return "";
		const country = countryOptions.find((item) => item.id === form.country);
		return country ? country.name : form.country;
	});

	const regionDisplayName = computed(() => {
		const parts = [];

		if (selectedProvince.value && selectedProvince.value.length > 0) {
			const province = provinceOptions.value.find(
				(p) => p.code === selectedProvince.value[0]
			);
			if (province) parts.push(province.name);
		}

		if (selectedCity.value && selectedCity.value.length > 0) {
			const city = cityOptions.value.find(
				(c) => c.code === selectedCity.value[0]
			);
			if (city) parts.push(city.name);
		}

		if (selectedArea.value && selectedArea.value.length > 0) {
			const area = areaOptions.value.find(
				(a) => a.code === selectedArea.value[0]
			);
			if (area) parts.push(area.name);
		}

		return parts.join("/");
	});

	const bloodTypeDisplayName = computed(() => {
		if (!form.bloodType) return "";
		const bloodType = bloodTypeOptions.find(
			(item) => item.value === form.bloodType
		);
		return bloodType ? bloodType.name : form.bloodType;
	});

	const idTypeOptions = [{
			id: "身份证",
			name: "身份证"
		},
		{
			id: "香港居民身份证",
			name: "香港居民身份证"
		},
		{
			id: "澳门居民身份证",
			name: "澳门居民身份证"
		},
		// { id: "军官证", name: "军官证" },
		// { id: "护照", name: "护照" },
		// { id: "港澳居民往来大陆通行证", name: "港澳居民往来大陆通行证" },
		// { id: "台胞证", name: "台胞证" },
	];

	const countryOptions = [{
			id: "中国",
			name: "中国(China)"
		},
		{
			id: "中国香港",
			name: "中国香港(HongKong)"
		},
		{
			id: "中国澳门",
			name: "中国澳门(Macau)"
		},
	];

	const bloodTypeOptions = [{
			name: "A型",
			value: "A"
		},
		{
			name: "B型",
			value: "B"
		},
		{
			name: "AB型",
			value: "AB"
		},
		{
			name: "O型",
			value: "O"
		},
	];
	const tshirtSizeOptions = [{
			name: "120",
			value: "120"
		},
		{
			name: "130",
			value: "130"
		},
		{
			name: "140",
			value: "140"
		},
		{
			name: "XS",
			value: "XS"
		},
		{
			name: "S",
			value: "S"
		},
		{
			name: "M",
			value: "M"
		},
		{
			name: "L",
			value: "L"
		},
		{
			name: "XL",
			value: "XL"
		},
		{
			name: "2XL",
			value: "2XL"
		},
		{
			name: "3XL",
			value: "3XL"
		},
		{
			name: "4XL",
			value: "4XL"
		},
	];

	const tshirtSizeDisplayName = computed(() => {
		if (!form.clothesSize) return "";
		const tshirtSize = tshirtSizeOptions.find(
			(item) => item.value === form.clothesSize
		);
		return tshirtSize ? tshirtSize.name : form.clothesSize;
	});

	const buttonCustomStyle = computed(() => {
		return `font-weight: bold; font-size: 30rpx; ${
    form.agreed ? "color: #ffffff;" : "color: #999999;"
  }`;
	});

	// 加载省市区数据
	async function initRegionData() {
		try {
			const [province, city, area] = await Promise.all([
				loadProvinceData(),
				loadCityData(),
				loadAreaData(),
			]);

			provinceData.value = province;
			cityData.value = city;
			areaData.value = area;

			// 初始化省份选项
			provinceOptions.value = province.map((p) => ({
				code: p.code,
				name: p.name,
			}));

			regionDataLoaded.value = true;
		} catch (error) {
			console.error("加载省市区数据失败:", error);
			uni.showToast({
				title: "加载地址数据失败",
				icon: "none",
			});
		}
	}

	// 监听 idType 变化，设置默认 index 和 selectedIdType
	watch(
		() => form.idType,
		(val) => {
			if (val) {
				const index = idTypeOptions.findIndex((item) => item.id === val);
				if (index !== -1) {
					idTypeIndex.value = [index];
					selectedIdType.value = [val];
				}
			} else {
				selectedIdType.value = [];
			}
		}, {
			immediate: true
		}
	);

	// 监听 selectedIdType 变化，同步到 form.idType
	watch(
		() => selectedIdType.value,
		(val) => {
			if (val && val.length > 0) {
				form.idType = val[0];
			}
		}
	);

	function onIdTypeConfirm(e) {
		showIdTypePicker.value = false;
	}

	// 监听 country 变化，设置默认 index 和 selectedCountry
	watch(
		() => form.country,
		(val) => {
			if (val) {
				const index = countryOptions.findIndex((item) => item.id === val);
				if (index !== -1) {
					countryIndex.value = [index];
					selectedCountry.value = [val];
				}
			} else {
				selectedCountry.value = [];
			}
		}, {
			immediate: true
		}
	);

	// 监听 selectedCountry 变化，同步到 form.country
	watch(
		() => selectedCountry.value,
		(val) => {
			if (val && val.length > 0) {
				form.country = val[0];
				// 如果选择了香港或澳门，自动选择对应的省市区
				if (val[0] === "HongKong") {
					selectedProvince.value = ["810000"];
					selectedCity.value = ["810000"];
					selectedArea.value = ["810000"];
				} else if (val[0] === "Macau") {
					selectedProvince.value = ["820000"];
					selectedCity.value = ["820000"];
					selectedArea.value = ["820000"];
				}
			}
		}
	);

	function onCountryConfirm(e) {
		showCountryPicker.value = false;
	}

	// 监听 form.region 变化，反向同步到省市区选择器（用于编辑时回显）
	// 使用一个标志来避免循环更新
	let isUpdatingFromRegion = false;
	watch(
		() => form.region,
		(region) => {
			// 如果当前值已经匹配，跳过更新
			const currentRegion = [
					selectedProvince.value[0],
					selectedCity.value[0],
					selectedArea.value[0],
				]
				.filter(Boolean)
				.join(",");

			if (currentRegion === region) {
				return;
			}

			isUpdatingFromRegion = true;

			if (!region) {
				selectedProvince.value = [];
				selectedCity.value = [];
				selectedArea.value = [];
				isUpdatingFromRegion = false;
				return;
			}

			const parts = region.split(",");
			const provinceCode = parts[0] || "";
			const cityCode = parts[1] || "";
			const areaCode = parts[2] || "";

			// 设置省
			if (provinceCode) {
				const province = provinceOptions.value.find(
					(p) => p.code === provinceCode
				);
				if (province) {
					selectedProvince.value = [provinceCode];
					const pIndex = provinceOptions.value.findIndex(
						(p) => p.code === provinceCode
					);
					if (pIndex !== -1) {
						provinceIndex.value = [pIndex];
					}

					// 加载该省的城市数据
					const provinceDataItem = provinceData.value.find(
						(p) => p.code === provinceCode
					);
					if (provinceDataItem) {
						cityOptions.value = cityData.value
							.filter((city) => city.province === provinceDataItem.province)
							.map((city) => ({
								code: city.code,
								name: city.name
							}));

						// 设置市
						if (cityCode) {
							const cityItem = cityOptions.value.find((c) => c.code === cityCode);
							if (cityItem) {
								selectedCity.value = [cityCode];
								const cIndex = cityOptions.value.findIndex(
									(c) => c.code === cityCode
								);
								if (cIndex !== -1) {
									cityIndex.value = [cIndex];
								}

								// 加载该市的区数据
								const cityDataItem = cityData.value.find(
									(c) => c.code === cityCode
								);
								if (cityDataItem) {
									areaOptions.value = areaData.value
										.filter(
											(area) =>
											area.province === cityDataItem.province &&
											area.city === cityDataItem.city
										)
										.map((area) => ({
											code: area.code,
											name: area.name
										}));

									// 设置区
									if (areaCode) {
										const areaItem = areaOptions.value.find(
											(a) => a.code === areaCode
										);
										if (areaItem) {
											selectedArea.value = [areaCode];
											const aIndex = areaOptions.value.findIndex(
												(a) => a.code === areaCode
											);
											if (aIndex !== -1) {
												areaIndex.value = [aIndex];
											}
										}
									}
								}
							}
						}
					}
				}
			}

			isUpdatingFromRegion = false;
		}, {
			immediate: true
		}
	);

	// 修改省市区选择变化的watch，避免循环
	watch(
		[
			() => selectedProvince.value,
			() => selectedCity.value,
			() => selectedArea.value,
		],
		([province, city, area]) => {
			if (isUpdatingFromRegion) return;

			const parts = [];
			if (province && province.length > 0) parts.push(province[0]);
			if (city && city.length > 0) parts.push(city[0]);
			if (area && area.length > 0) parts.push(area[0]);
			form.region = parts.join(",");
		}
	);

	// 省市区选择函数
	function openProvincePicker() {
		showProvincePicker.value = true;
	}

	function onProvinceConfirm(e) {
		showProvincePicker.value = false;
		// 选择省后，加载该省的城市数据
		if (selectedProvince.value && selectedProvince.value.length > 0) {
			const province = provinceData.value.find(
				(p) => p.code === selectedProvince.value[0]
			);
			if (province) {
				cityOptions.value = cityData.value
					.filter((city) => city.province === province.province)
					.map((city) => ({
						code: city.code,
						name: city.name
					}));

				// 延迟打开城市选择器
				setTimeout(() => {
					showCityPicker.value = true;
				}, 300);
			}
		}
	}

	function onCityConfirm(e) {
		showCityPicker.value = false;
		// 选择市后，加载该市的区数据
		if (selectedCity.value && selectedCity.value.length > 0) {
			const city = cityData.value.find((c) => c.code === selectedCity.value[0]);
			if (city) {
				areaOptions.value = areaData.value
					.filter(
						(area) => area.province === city.province && area.city === city.city
					)
					.map((area) => ({
						code: area.code,
						name: area.name
					}));

				// 延迟打开区选择器
				setTimeout(() => {
					showAreaPicker.value = true;
				}, 300);
			}
		}
	}

	function onAreaConfirm(e) {
		showAreaPicker.value = false;
	}

	// 监听 bloodType 变化，设置默认 index 和 selectedBloodType
	watch(
		() => form.bloodType,
		(val) => {
			if (val) {
				const index = bloodTypeOptions.findIndex((item) => item.value === val);
				if (index !== -1) {
					bloodTypeIndex.value = [index];
					selectedBloodType.value = [val];
				}
			} else {
				selectedBloodType.value = [];
			}
		}, {
			immediate: true
		}
	);

	// 监听 selectedBloodType 变化，同步到 form.bloodType
	watch(
		() => selectedBloodType.value,
		(val) => {
			if (val && val.length > 0) {
				form.bloodType = val[0];
			}
		}
	);

	function onBloodTypeConfirm(e) {
		showBloodTypePicker.value = false;
	}

	// 监听 clothesSize 变化，设置默认 index 和 selectedTshirtSize
	watch(
		() => form.clothesSize,
		(val) => {
			if (val) {
				const index = tshirtSizeOptions.findIndex((item) => item.value === val);
				if (index !== -1) {
					tshirtSizeIndex.value = [index];
					selectedTshirtSize.value = [val];
				}
			} else {
				selectedTshirtSize.value = [];
			}
		}, {
			immediate: true
		}
	);

	// 监听 selectedTshirtSize 变化，同步到 form.clothesSize
	watch(
		() => selectedTshirtSize.value,
		(val) => {
			if (val && val.length > 0) {
				form.clothesSize = val[0];
			}
		}
	);

	function onTshirtSizeConfirm(e) {
		showTshirtSizePicker.value = false;
	}

	const rules = {
		name: [{
			required: true,
			message: "请填写姓名",
			trigger: ["blur", "change"]
		}, ],
		gender: [{
			required: true,
			message: "请选择性别",
			trigger: ["change"]
		}],
		idType: [{
			required: true,
			message: "请选择证件类型",
			trigger: ["change"]
		}],
		idCardNumber: [{
			required: true,
			message: "请填写证件号码",
			trigger: ["blur", "change"]
		}, ],
		birthday1: [{
			required: true,
			message: "请选择出生日期",
			trigger: ["change"],
			validator: (rule, value, callback) => {
				console.log(value, "出生日期1111");
				// 验证字符串格式的日期（YYYY-MM-DD）或空值
				if (!value || value === "") {
					callback(new Error("请选择出生日期"));
				} else if (typeof value === "string") {
					// 验证格式是否为 YYYY-MM-DD
					const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (dateRegex.test(value) && dayjs(value).isValid()) {
						callback();
					} else {
						callback(new Error("请选择出生日期"));
					}
				} else {
					callback(new Error("请选择出生日期"));
				}
			},
		}, ],
		mobile: [{
			required: true,
			message: "请填写手机号码",
			trigger: ["blur", "change"]
		}, ],
		country: [{
			required: true,
			message: "请填写国家或地区",
			trigger: ["blur", "change"]
		}],
		region: [{
			required: true,
			message: "请填写省份",
			trigger: ["blur", "change"]
		}],
		address: [{
			required: true,
			message: "请填写详细地址",
			trigger: ["blur", "change"]
		}],
		clothesSize: [{
			required: true,
			message: "请选择衣服尺寸",
			trigger: ["blur", "change"]
		}],
		emergencyContact: [{
			required: true,
			message: "请填写进击联系人姓名",
			trigger: ["blur", "change"]
		}],
		emergencyPhone: [{
			required: true,
			message: "请填写进击联系人手机号码",
			trigger: ["blur", "change"]
		}],
	};

	const birthdayTimestamp = computed(() => {
		return form.birthday ? dayjs(form.birthday).valueOf() : "";
	});

	// 处理日期选择器确认事件
	function onBirthdayConfirm(e) {
		// up-datetime-picker 的 confirm 事件返回的是时间戳（number）
		// 需要转换为 YYYY-MM-DD 格式的字符串
		console.log(form.birthday, e, "form.birthday");
		form.birthday = dayjs(e.value || startDate).format("YYYY-MM-DD");

		// 手动触发验证
		nextTick(() => {
			if (formRef.value) {
				formRef.value.validateField("birthday", () => {}, "change");
			}
		});
	}

	// 根据地址字符串解析省市区
	function parseAddressToRegion(addressStr) {
		if (!addressStr) return null;

		let provinceName = "";
		let cityName = "";
		let areaName = "";
		let country = "中国";

		// 检查是否是香港或澳门
		if (
			addressStr.includes("香港") ||
			addressStr.includes("HongKong") ||
			addressStr.includes("Hong Kong")
		) {
			country = "中国香港";
			provinceName = "香港特别行政区";
			cityName = "香港特别行政区";
			areaName = "香港特别行政区";
		} else if (
			addressStr.includes("澳门") ||
			addressStr.includes("Macau") ||
			addressStr.includes("Macao")
		) {
			country = "中国澳门";
			provinceName = "澳门特别行政区";
			cityName = "澳门特别行政区";
			areaName = "澳门特别行政区";
		} else {
			// 解析中国大陆地址
			// 首先尝试从已知省份数据中精确匹配
			for (const province of provinceData.value) {
				if (addressStr.includes(province.name)) {
					provinceName = province.name;
					break;
				}
			}

			// 如果精确匹配失败，尝试正则匹配
			if (!provinceName) {
				const provincePatterns = [
					/([^省]+省)/,
					/([^自治区]+自治区)/,
					/([^市]+(?:市|特别行政区))/,
				];

				for (const pattern of provincePatterns) {
					const match = addressStr.match(pattern);
					if (match) {
						const matched = match[1];
						// 验证是否是有效的省份名称
						const found = provinceData.value.find((p) => p.name === matched);
						if (found) {
							provinceName = matched;
							break;
						}
					}
				}
			}

			// 匹配市
			if (provinceName) {
				const province = provinceData.value.find((p) => p.name === provinceName);
				if (province) {
					// 先加载该省的所有城市数据
					const provinceCities = cityData.value.filter(
						(c) => c.province === province.province
					);

					// 尝试精确匹配城市
					for (const city of provinceCities) {
						if (addressStr.includes(city.name)) {
							cityName = city.name;
							break;
						}
					}

					// 如果是直辖市，市名和省名相同
					const directCities = ["北京市", "天津市", "上海市", "重庆市"];
					if (directCities.includes(provinceName) && !cityName) {
						cityName = provinceName;
					}

					// 如果没有精确匹配到，尝试正则匹配
					if (!cityName) {
						const cityPatterns = [
							/([^市县]+(?:市|州|盟))(?=市|县|区|街道|路|街)/,
						];

						for (const pattern of cityPatterns) {
							const match = addressStr.match(pattern);
							if (match) {
								const matched = match[1];
								const found = provinceCities.find((c) => c.name === matched);
								if (found) {
									cityName = matched;
									break;
								}
							}
						}
					}

					// 匹配区/县
					if (cityName) {
						const city = cityData.value.find(
							(c) => c.name === cityName && c.province === province.province
						);
						if (city) {
							// 先加载该市的所有区数据
							const cityAreas = areaData.value.filter(
								(a) => a.province === city.province && a.city === city.city
							);

							// 尝试精确匹配区
							for (const area of cityAreas) {
								if (addressStr.includes(area.name)) {
									areaName = area.name;
									break;
								}
							}

							// 如果没有精确匹配到，尝试正则匹配
							if (!areaName) {
								const areaPatterns = [
									/([^区县旗市]+(?:区|县|旗|市))(?=街道|路|街|镇|乡|村|号)/,
								];

								for (const pattern of areaPatterns) {
									const match = addressStr.match(pattern);
									if (match) {
										const matched = match[1];
										// 排除省名和市名
										if (
											matched !== provinceName &&
											matched !== cityName &&
											!matched.includes(
												provinceName.replace(/省|自治区|特别行政区/, "")
											) &&
											!matched.includes(cityName.replace(/市|州|盟/, ""))
										) {
											const found = cityAreas.find((a) => a.name === matched);
											if (found) {
												areaName = matched;
												break;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		// 查找对应的代码
		let provinceCode = "";
		let cityCode = "";
		let areaCode = "";

		if (provinceName) {
			const province = provinceData.value.find((p) => p.name === provinceName);
			if (province) {
				provinceCode = province.code;

				// 加载城市数据
				if (cityName) {
					const city = cityData.value.find(
						(c) => c.name === cityName && c.province === province.province
					);
					if (city) {
						cityCode = city.code;

						// 加载区数据
						if (areaName) {
							const area = areaData.value.find(
								(a) =>
								a.name === areaName &&
								a.province === city.province &&
								a.city === city.city
							);
							if (area) {
								areaCode = area.code;
							}
						}
					}
				}
			}
		}

		return {
			country,
			provinceCode,
			cityCode,
			areaCode,
		};
	}

	// 选择地址位置
	function handleChooseLocation() {
		uni.chooseLocation({
			success: (res) => {
				console.log("选择地址成功:", res);

				// 获取完整地址字符串用于解析
				const fullAddress = res.address || "";

				// 将选择的地址填充到详细地址字段
				// 优先使用 name（具体地点名称），如果没有则使用 address
				if (res.name) {
					form.address = res.name;
				} else if (fullAddress) {
					form.address = fullAddress;
				}

				// 根据地址解析省市区
				if (fullAddress) {
					const regionInfo = parseAddressToRegion(fullAddress);

					if (regionInfo) {
						// 设置国家
						if (regionInfo.country) {
							form.country = regionInfo.country;

							// 如果是香港或澳门，需要同步设置 selectedCountry
							const countryIdx = countryOptions.findIndex(
								(c) => c.id === regionInfo.country
							);
							if (countryIdx !== -1) {
								countryIndex.value = [countryIdx];
								selectedCountry.value = [regionInfo.country];
							}
						}

						// 设置省市区（通过更新 form.region，会触发 watch 自动设置 selectedProvince 等）
						if (regionInfo.provinceCode) {
							const regionParts = [];
							regionParts.push(regionInfo.provinceCode);
							if (regionInfo.cityCode) {
								regionParts.push(regionInfo.cityCode);
								if (regionInfo.areaCode) {
									regionParts.push(regionInfo.areaCode);
								}
							}
							form.region = regionParts.join(",");
						}
					}
				}

				// 手动触发验证
				nextTick(() => {
					if (formRef.value) {
						formRef.value.validateField("address", () => {}, "change");
						if (form.country) {
							formRef.value.validateField("country", () => {}, "change");
						}
						if (form.region) {
							formRef.value.validateField("region", () => {}, "change");
						}
					}
				});
			},
			fail: (err) => {
				console.error("选择地址失败:", err);
				if (err.errMsg && !err.errMsg.includes("cancel")) {
					uni.showToast({
						title: "选择地址失败",
						icon: "none",
					});
				}
			},
		});
	}

	function showTip(title) {
		uni.showToast({
			title: title,
			icon: "none",
			duration: 2000,
		});
	}

	const showValidationError = (message) => {
		uni.showModal({
			title: "提示",
			content: String(message || "请完善报名信息"),
			showCancel: false,
			confirmText: "我知道了",
		});
	};

	function onSubmit() {
		if (!form.agreed) return;
		formRef.value
			?.validate()
			.then(() => {
				submitting.value = true;
				emit("submit", {
					...form
				});
				submitting.value = false;
			})
			.catch((errors) => {
				const firstError = Array.isArray(errors) ? errors[0] : errors;
				const errMsg = firstError?.message || "请完善报名信息";
				showValidationError(errMsg);
				console.error("报名卡校验失败:", errors);
			});
	}

	onLoad(() => {});

	// 组件挂载时加载省市区数据
	onMounted(() => {
		initRegionData();
	});
</script>

<style lang="less" scoped>
	.page {
		background: #fafafa;
		padding-bottom: 208rpx;
	}

	.section {
		padding: 0 34rpx;
	}

	.section-title {
		font-weight: 500;
		font-size: 24rpx;
		color: #000000;
		padding: 0 10rpx;
		margin: 48rpx 0 30rpx 0;
	}

	.section-content {
		background: #ffffff;
		padding: 10rpx 20rpx 0rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid #f2f2f2;
	}

	.row {
		display: flex;
		align-items: center;
	}

	.owner {
		display: flex;
		align-items: center;
		margin-left: 20rpx;
		color: #333;
	}

	.owner-text {
		margin-left: 10rpx;
		font-size: 26rpx;
	}

	.agree {
		margin-top: 48rpx;
	}

	.agree-text {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 30rpx;
		color: #000000;
	}

	.agree-content {
		font-weight: 500;
		font-size: 24rpx;
		color: #999999;
		margin-top: 16rpx;
		line-height: 34rpx;
	}

	.section-bottom {
		margin-top: 48rpx;
		position: fixed;
		bottom: 0;
		width: 100%;
		z-index: 9;
	}

	.picker-view {
		width: 100%;
	}

	.address-input-wrapper {
		display: flex;
		align-items: center;
		width: 100%;
		position: relative;
		padding-right: 80rpx;
	}

	.address-icon-wrapper {
		position: absolute;
		right: 20rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		height: 100%;
		pointer-events: auto;
	}

	.label-with-icon {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-weight: 700;
		font-size: 30rpx;
		color: #000;
	}

	.tip-icon {
		cursor: pointer;
		flex-shrink: 0;
	}

	.form-tip {
		font-size: 24rpx;
		color: #ff4d4f;
		font-weight: 600;
		text-align: center;
		margin: 20rpx 0;
		transform: translateY(2px);
	}

	.txt_required {
		color: #f56c6c;
		line-height: 20px;
		font-size: 20px;
	}
</style>