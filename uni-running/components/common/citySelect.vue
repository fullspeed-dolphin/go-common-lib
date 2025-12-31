<template>
  <view>
    <u-cell :title="title" :required="required" title-width="130rpx" :value="addressString? addressString : placeholder" @click="isShowAddressPop = true" isLink />
    <u-popup :show="isShowAddressPop" mode="bottom" round="15" @close="isShowAddressPop = false" z-index="120" closeable>
      <view class="flex-center" style="font-size:16px;font-weight:500;height:44px;">
        请选择所在地区
      </view>
      <u-tabs v-if="tabList.length" :current="curTabActive" :list="tabList" @change="changeTab" :scrollable="false" keyName="title" lineColor="#56bcae" />

      <view v-for="(item, index) in tabList" :key="index" :name="item.status">
        <scroll-view scroll-y class="serverPop" v-if="curTabActive === item.status">
          <view v-if="item.isLoading" class="flex-center c9 pt30">
            加载中...
          </view>
          <view class="flex-between-center u-border-top p20" v-for="(address, addressindex) in item.addressList" :key="addressindex" @click="getList(index + 1, address)">
            {{address.name}}
            <uni-icons size="30" :type="address.name == item.currentValue.name ?'checkbox-filled' : 'circle'" :color="address.name == item.currentValue.name ?'rgba(86,188,174, 1)' : '#ccc'" />
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import request from "@/utils/request.js"

const props = defineProps({
	title: {
		type: String,
		default: "",
	},
	placeholder: {
		type: String,
		default: "请选择地址",
	},
	required: {
		type: Boolean,
		default: false,
	},
	customClass: {
		type: String,
		default: "",
	},
	value: {
		type: String,
		default: "",
	},
})

// Emits
const emit = defineEmits(['input'])

// 响应式数据
const isFirstOpen = ref(false)
const isShowAddressPop = ref(false)
const addressString = ref("")
const curTabActive = ref(0)
const addressCode = ref("")
const tabList = ref([
	{
		title: "请选择",
		status: 0,
		currentValue: {},
		isLoading: false,
		addressList: [],
	},
	{
		title: "",
		currentValue: {},
		isLoading: false,
		status: 1,
		addressList: [],
	},
	{
		title: "",
		currentValue: {},
		isLoading: false,
		status: 2,
		addressList: [],
	},
])

// 监听value变化
watch(() => props.value, async (val) => {
	// 初始化回显UI值
	if (val && val !== addressCode.value) {
		const addressPack = await getAddressString(val, tabList.value);

		console.log("addressPack", addressPack);
		addressString.value = addressPack.addressString;
		tabList.value = addressPack.table;
		curTabActive.value = 2;
	}
}, {
	deep: true,
	immediate: true,
})

// 组件挂载
onMounted(() => {
	getList();
})

// 方法定义
// 切换菜单
const changeTab = (detail) => {
	curTabActive.value = detail.status;
}

// changeAddress
const getList = (level = 0, address) => {
	console.log("level======>", level);
	const data = {
		code: level == 0 ? null : address.code,
	};

	const tabListData = tabList.value;

	if (level != 0) {
		// 设置标题
		tabListData[level - 1].title = address.name;
		tabListData[level - 1].currentValue = address;

		if (level < 3) {
			tabListData[level].title = "请选择";
		}
	}

	if (level == 1) {
		// 选择了 provinces
		curTabActive.value = 1;
		tabListData[2].addressList = [];
		tabListData[2].currentValue = "";
		tabListData[2].title = "";
	}

	if (level == 2) {
		// 选择了 provinces
		curTabActive.value = 2;
	}

	// 最后一列选定
	if (level == 3) {
		isShowAddressPop.value = false;
		tabList.value = tabListData;

		let addressValue = [];
		let addressStringData = [];
		tabList.value.forEach((item) => {
			addressValue.push(item.currentValue.code);
			addressStringData.push(item.currentValue.name);
		});

		console.log("addressString", addressStringData);

		addressString.value = addressStringData.join("/");
		addressCode.value = addressValue.join(",");
		return emit("input", addressValue.join(","));
	}

	const type = ["province", "city", "district"][level];

	tabListData[level].isLoading = true;
	request.get(`/system/admin/dict/type/${type}`, data).then((res) => {
		isFirstOpen.value = true;
		tabListData[level].addressList = res;
		tabListData[level].isLoading = false;

		tabList.value = tabListData;
	});
}

// 传入 table 可以跟组件 citySelect 相配合，初始化回显控件的值
const getAddressString = async (locationCode1, table1 = []) => {
	let table = JSON.parse(JSON.stringify(table1));
	const locationCode = locationCode1.split(",");

	console.log("locationCode=======>", locationCode);

	const ProvinceList = await request.get(
		`/system/admin/dict/type/province`
	);
	let provice = "";
	let proviceFilters = ProvinceList.filter(
		(i) => i.code === locationCode[0]
	);
	if (proviceFilters.length) {
		const currentItem = proviceFilters[0];
		provice = currentItem.name;

		if (!table.length) return;
		table[0] = {
			title: currentItem.name,
			currentValue: currentItem,
			isLoading: false,
			status: 0,
			addressList: ProvinceList,
		};
	}

	let city = "";
	if (locationCode[0]) {
		const data = {
			code: locationCode[0],
		};
		const Cities = await request.get(
			`/system/admin/dict/type/city`,
			data
		);
		let cityFilters = Cities.filter((i) => i.code === locationCode[1]);
		if (cityFilters.length) {
			const currentItem = cityFilters[0];
			city = currentItem.name;

			if (!table.length) return;
			table[1] = {
				title: currentItem.name,
				currentValue: currentItem,
				isLoading: false,
				status: 1,
				addressList: Cities,
			};
		}
	}

	let District = "";

	if (locationCode[1]) {
		const data = {
			code: locationCode[1],
		};
		const Districts = await request.get(
			`/system/admin/dict/type/district`,
			data
		);
		let DistrictsFilters = Districts.filter(
			(i) => i.code === locationCode[2]
		);
		if (DistrictsFilters.length) {
			const currentItem = DistrictsFilters[0];
			District = currentItem.name;

			if (!table.length) return;
			table[2] = {
				title: currentItem.name,
				currentValue: currentItem,
				isLoading: false,
				status: 2,
				addressList: Districts,
			};
		}
	}

	return {
		addressString: `${provice}/${city}/${District}`,
		table,
	};
}
</script>

<style lang="scss" scoped>
::v-deep {
  .serverPop {
    // width: 640rpx;
    height: 600rpx;
    .scroll-cell {
      .van-cell__value {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
}
</style>
