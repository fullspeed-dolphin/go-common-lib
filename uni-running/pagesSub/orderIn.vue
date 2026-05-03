<template>
  <u-navbar title="活动报名" placeholder bgColor="#f8f8f8" />

  <section class="section-assign">
    <view v-if="showField('group')" class="cell flex-between-center">
      <view class="">{{ getLabel('group') }}</view>
      <view class="flex-start" @click="openGroupPop()">
        <view class="txt" :class="{ c70: !myGroup.name }">
          {{ myGroup.name || "加入跑团" }}
        </view>
        <u-icon v-if="!myGroup.group_id" name="arrow-right" size="34rpx" color="#999"></u-icon>
      </view>
    </view>

    <view v-if="showField('code')" class="cell flex-between-center">
      <view class="">{{ getLabel('code') }}</view>
      <view class="verify-code-input-wrapper">
        <u-input :placeholder="`请输入${getLabel('code')}`" maxlength="5" border="none" v-model="verifyCode" inputAlign="right" color="#000000" fontSize="30rpx"
          :placeholderStyle="'font-size: 26rpx; color: #999999;font-weight: 700;'">
        </u-input>
      </view>
      <u-tag v-if="!!verifyCode.length" :text="computedCode.text" plain size="mini" :type="computedCode.isOk ? 'success' : 'error'"></u-tag>
    </view>
    <view v-if="showField('address')" class="cell flex-between-center">
      <view class="cell-label">{{ getLabel('address') }}<u-icon name="star-fill" color="#E53935" size="8"></u-icon></view>
      <view class="" style="width:540rpx;margin:0 -20rpx;">
        <PickerCell v-model="selectedAddress" :disabled="!addressPickerColumns.length" :placeholder="`请选择${getLabel('address')}`" :border="false" :columns="addressPickerColumns" />
      </view>
    </view>
  </section>

  <view v-if="showField('package')" class="section" style="margin-top:30rpx;" :style="{ '--theme-color': themeColor }">
    <view class="section-title">
      <text>{{ getLabel('package') }}</text>
      <text v-if="eventCapacity.mode === 'event'" class="remaining-quota">（剩余名额：{{ (eventCapacity.capacity || 0) - (eventCapacity.capacity_used || 0) }}）</text>
    </view>
    <view class="section-content">
      <!-- 空状态提示 -->
      <view v-if="!packageList.length" class="package-empty-hint">
        <u-icon name="info-circle" color="#999" size="18"></u-icon>
        <text>{{ showField('code') ? `请输入${getLabel('code')}查看可选套餐` : '暂无可选套餐' }}</text>
      </view>
      <view class="price-item" v-for="(item, index) in packageList" :key="index" :class="{ disabled: item.isFull, active: item.count > 0 }">

        <!-- 套餐头部：左侧信息 + 右侧数量选择器 -->
        <view class="price-item-header" @click="onPackageClick(item)">
          <view class="price-item-left">
            <view class="price-item-label">{{ item.label }}<text v-if="item.groupSize > 1" class="group-size-hint">（需{{ item.groupSize }}张报名卡）</text></view>
            <view class="price-item-meta">
              <text class="price-item-price">￥{{ item.price }}</text>
              <text v-if="item.isFull" class="price-item-status">已满</text>
              <text v-else-if="item.capacity !== null && item.capacity !== undefined" class="price-item-capacity">
                剩余 {{ item.capacity - (item.capacityUsed || 0) }}
              </text>
            </view>
          </view>

          <!-- 数量选择器 -->
          <view class="price-item-right">
            <view class="quantity-selector" v-if="!item.isFull">
              <view class="qty-btn minus" :class="{ disabled: item.count <= 0 }" @click.stop="decreaseCount(item)">
                <u-icon name="minus" size="14" :color="item.count <= 0 ? '#ccc' : '#333'"></u-icon>
              </view>
              <view class="qty-value">{{ item.count || 0 }}</view>
              <view class="qty-btn plus" :class="{ disabled: isPlusDisabled(item) }" @click.stop="increaseCount(item)">
                <u-icon name="plus" size="14" :color="isPlusDisabled(item) ? '#ccc' : '#333'"></u-icon>
              </view>
            </view>
          </view>
        </view>

        <!-- 报名卡空位区域：count > 0 时显示 -->
        <view v-if="item.count > 0" class="price-item-slots">
          <view v-for="(group, groupIndex) in item.groups" :key="groupIndex" class="slot-group">
            <!-- 已添加的报名卡 -->
            <view v-for="(slot, slotIndex) in group" :key="slotIndex" class="slot-item">
              <view class="slot-filled">
                <image class="slot-avatar" src="/static/images/user.png" mode="aspectFill"></image>
                <view class="slot-remove" @click.stop="removeSlot(item, groupIndex, slotIndex)">
                  <u-icon name="close-circle" color="#999" size="20"></u-icon>
                </view>
              </view>
              <view class="slot-name">{{ slot.full_name }}</view>
            </view>
            <!-- 添加按钮：显示所有剩余空位 -->
            <view v-for="emptyIdx in ((item.groupSize || 1) - group.length)" :key="'empty-' + emptyIdx" class="slot-item" @click="handleAddSigner(item, groupIndex)">
              <view class="slot-empty">
                <u-icon name="plus" color="#999" size="20"></u-icon>
              </view>
              <view class="slot-name">添加</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 提示信息区域 -->
  <section v-if="packageList.length && totalSelectedCount > 0" class="section-tips" :style="{ '--theme-color': themeColor }">
    <view class="tips-title">温馨提示</view>
    <view class="tips-list">
      <view class="tips-item">1、最多可选择 <text class="tips-highlight">{{ multiPackageCount }}</text> 种套餐，如需多人报名请增加套餐份数</view>
      <view class="tips-item">2、参赛服尺寸请详询活动组织方</view>
    </view>
  </section>

  <!-- 支付区域 -->
  <section v-if="packageList.length" class="section-payment">
    <!-- 应付金额 -->
    <view class="payment-amount">
      <view class="amount-label">应付金额</view>
      <view class="amount-value">
        <text class="amount-symbol">¥</text>
        <text class="amount-number">{{ totalPrice }}</text>
        <text v-if="!totalPrice" class="amount-hint">（请添加报名人员）</text>
      </view>
    </view>
    <!-- 支付方式 -->
    <view class="payment-method">
      <view class="method-label">支付方式</view>
      <view class="payment-card active">
        <view class="payment-card-left">
          <image class="payment-icon" src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/微信支付@2x.png" mode="aspectFit"></image>
          <text class="payment-name">微信支付</text>
        </view>
        <view class="payment-card-right">
          <u-icon name="checkmark-circle-fill" :color="themeColor" size="40rpx"></u-icon>
        </view>
      </view>
    </view>
  </section>

  <!-- 底部固定区域：协议 + 按钮 -->
  <view class="fixed-bottom-bar">
    <view class="agreement-wrapper flex-start">
      <up-checkbox shape="circle" :activeColor="themeColor" v-model:checked="isAgree" :usedAlone="true" size="32rpx" />
      <view class="agreement-text">
        <text @click="isAgree = !isAgree">我已阅读并同意</text>
        <text :style="{ color: themeColor }" @click="$u.route('pagesSub/settings/agreement?type=signUp')">《用户协议》</text>
        <text>、</text>
        <text :style="{ color: themeColor }" @click="$u.route('pagesSub/settings/agreement?type=baoxian')">《保险须知》</text>
        <template v-if="event_id === '01KCRXHMXF7SEBYCMZ1X2M4E0Y'">
          <text>、</text>
          <text :style="{ color: themeColor }" @click="$u.route('pagesSub/settings/agreement?type=notices_ShuiLianHu')">《水濂湖报名须知》</text>
          <text>、</text>
          <text :style="{ color: themeColor }" @click="$u.route('pagesSub/settings/agreement?type=rule_ShuiLianHu')">《水濂湖活动章程》</text>
          <text>、</text>
          <text :style="{ color: themeColor }" @click="$u.route('pagesSub/settings/agreement?type=disclaimer_ShuiLianHu')">《水濂湖免责声明》</text>
        </template>
      </view>
    </view>
    <view style="margin-top: 20rpx;">
      <u-button type="primary" :color="themeBtnColor" shape="circle" customStyle="height: 80rpx;" @click="submitOrder()">{{ totalPrice > 0 ? `￥${totalPrice} 支付` : '确认报名' }}</u-button>
    </view>
  </view>

  <!-- 底部占位，防止内容被固定栏遮挡 -->
  <view style="height: 280rpx;"></view>

  <SignerList ref="refSignerList" @select="onSelectSigner" :themeColor="themeColor" />
  <GroupList ref="refGroupList" @success="getUserGroup()" />
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

import PickerCell from "@/components/common/PickerCell.vue";
import GroupList from "./components/groupList.vue";
import SignerList from "./components/SignerList.vue";
import { asyncAlls } from "../utils/util";
import request from "@/utils/request.js";
import {
  isUnder14,
  wxPay,
  getPackageData,
  parseBirthDateFromIdCard,
  parseGenderFromIdCard,
} from "./utils/orderTool.js";
import { deepClone } from "@/uni_modules/uview-plus/libs/function/index";

import { useStore } from "vuex";
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
const packageList = ref([]);
const computedCode = ref({});
const event_id = ref("");
const isSubmitting = ref(false);
const colorConfig = ref(null);

// 动态主题色
const themeColor = computed(() => colorConfig.value?.solid || '#FF8C00');
const themeGradient = computed(() => {
  const g = colorConfig.value?.gradient;
  if (g?.length === 2) return `linear-gradient(90deg, ${g[0]}, ${g[1]})`;
  return null;
});
const themeBtnColor = computed(() => {
  const g = colorConfig.value?.gradient;
  return g?.length === 2 ? g[0] : '#FF8C00';
});
const selectedAddress = ref("");
const addressPickerColumns = ref([]);
const multiPackageCount = ref(1); // 存储 multi_package 字段值

// 表单标签配置
const formLabels = ref(null);

// 默认标签
const DEFAULT_LABELS = {
  group: "跑团",
  code: "全速码",
  address: "参赛包领取地址",
  package: "选择套餐",
};

// 判断字段是否显示（null 或空字符串都隐藏）
const showField = (key) => {
  if (!formLabels.value || !(key in formLabels.value)) return true;
  const value = formLabels.value[key];
  return value !== null && value !== "";
};

// 获取字段标签
const getLabel = (key) => {
  return formLabels.value?.[key] || DEFAULT_LABELS[key];
};

const userInfo = computed(() => store.state.userInfo);

// 当前正在填充的空位信息
const currentSlotInfo = ref({ item: null, groupIndex: 0, slotIndex: 0 });

// 计算套餐最大可选数量
function getMaxCount(item) {
  if (item.capacity === null || item.capacity === undefined) {
    return item.maxGroups || 20;
  }
  return Math.min(
    item.capacity - (item.capacityUsed || 0),
    item.maxGroups || 20
  );
}

// 是否已达最大数量
function isMaxCount(item) {
  return (item.count || 0) >= getMaxCount(item);
}

// 是否禁用 + 按钮（综合检查套餐容量和 multi_package 限制）
function isPlusDisabled(item) {
  // 检查套餐自身容量限制
  if (isMaxCount(item)) return true;
  // 检查 multi_package 限制：只有当该套餐尚未被选中（count === 0）时才检查
  // 如果已经选中了，允许继续增加数量
  if ((item.count || 0) === 0 && isReachedMultiPackageLimit()) return true;
  return false;
}

// 增加数量
function increaseCount(item) {
  if (isMaxCount(item)) return;

  // 检查是否已达到 multi_package 限制（当前套餐 count 为 0 时需要检查是否能新增一种套餐）
  if ((item.count || 0) === 0 && isReachedMultiPackageLimit()) {
    uni.$u.toast(`最多只能选择 ${multiPackageCount.value} 种套餐`);
    return;
  }

  if (!item.count) item.count = 0;
  item.count++;

  // 新增一组空数组（不预设空位，由用户逐个添加）
  if (!item.groups) item.groups = [];
  item.groups.push([]);
}

// 点击套餐卡片
function onPackageClick(item) {
  if (item.isFull) return;

  if (item.count > 0) {
    // 已选中：弹窗确认是否取消
    confirmClearPackage(item);
  } else {
    // 未选中：检查是否需要清除其他套餐（单选模式）
    if (!isMultiSelect.value && totalSelectedCount.value > 0) {
      // 单选模式下，切换到新套餐前需要确认清除其他套餐
      uni.showModal({
        title: "提示",
        content: "切换套餐会清空已选择的报名卡信息，是否继续？",
        confirmText: "是",
        cancelText: "否",
        success: (res) => {
          if (res.confirm) {
            // 清空所有其他套餐
            packageList.value.forEach((pkg) => {
              if (pkg !== item) {
                pkg.count = 0;
                pkg.groups = [];
              }
            });
            // 然后增加当前套餐
            increaseCount(item);
          }
        },
      });
    } else {
      // 多选模式或没有已选套餐，直接增加
      increaseCount(item);
    }
  }
}

// 确认清空套餐
function confirmClearPackage(item) {
  uni.showModal({
    title: "提示",
    content: "取消选中套餐会清空所有选中的报名卡信息，是否继续？",
    confirmText: "是",
    cancelText: "否",
    success: (res) => {
      if (res.confirm) {
        // 清空该套餐
        item.count = 0;
        item.groups = [];
      }
    },
  });
}

// 减少数量
function decreaseCount(item) {
  if (!item.count || item.count <= 0) return;

  // 如果减到 0，弹窗确认
  if (item.count === 1) {
    confirmClearPackage(item);
    return;
  }

  item.count--;
  // 移除最后一组
  if (item.groups && item.groups.length > 0) {
    item.groups.pop();
  }
}

// 点击添加报名卡按钮
function handleAddSigner(item, groupIndex) {
  const group = item.groups[groupIndex];
  const maxSigners = item.groupSize || 1;

  // 检查是否已达到该组的报名卡数量上限
  if (group.length >= maxSigners) {
    uni.$u.toast("已到达最高报名卡数量上限");
    return;
  }

  // 记录当前要填充的位置（groupIndex，slotIndex 为当前数组长度，即新增位置）
  currentSlotInfo.value = { item, groupIndex, slotIndex: group.length };
  refSignerList.value.open(item);
}

// 移除报名卡
function removeSlot(item, groupIndex, slotIndex) {
  if (item.groups && item.groups[groupIndex]) {
    item.groups[groupIndex].splice(slotIndex, 1);
  }
}

const isMultiSelect = computed(() => {
  return multiPackageCount.value > 1;
});

// 计算当前已选择的套餐总数（所有套餐的 count 之和）
const totalSelectedCount = computed(() => {
  return packageList.value.reduce((sum, item) => sum + (item.count || 0), 0);
});

// 计算每个套餐最大报名卡数量（取所有套餐中的最大值）
const maxSignersPerPackage = computed(() => {
  if (!packageList.value.length) return 1;
  return Math.max(...packageList.value.map((item) => item.groupSize || 1));
});

// 检查是否已达到 multi_package 限制（统计已选择的套餐种类数）
function isReachedMultiPackageLimit(excludeItem = null) {
  const selectedTypeCount = packageList.value.filter((item) => {
    if (excludeItem && item === excludeItem) return false;
    return (item.count || 0) > 0;
  }).length;
  return selectedTypeCount >= multiPackageCount.value;
}

const totalPrice = ref(0);
watch(
  () => packageList.value,
  (newVal) => {
    let total = 0;

    const isEventLevel = eventCapacity.value?.mode === "event";
    packageList.value.forEach((item) => {
      if (item.count > 0) {
        if (isEventLevel) {
          // 事件级容量：按组数计算
          total += (item.price || 0) * item.count;
        } else {
          // 套餐级容量：按实际添加的报名卡数量计算
          const actualSigners = item.groups ? item.groups.flat().length : 0;
          total += (item.price || 0) * actualSigners;
        }
      }
    });

    totalPrice.value = total;
  },
  { deep: true }
);

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
      getEventPackageList();
    }, 300);
  }
);

const eventCapacity = ref({});

const getEventPackageList = async (spxcode = null) => {
  const data = {
    event_id: event_id.value,
    spxcode: verifyCode.value,
  };

  let res_capacity = await request.get(
    `/booking-api/capacity?event_id=${event_id.value}`,
    data
  );

  // res_capacity = {
  // 	"mode": "package",
  // 	"capacity": [
  // 		{"package": "个人组", "capacity": 800},
  // 		{"package": "亲子组", "capacity": 500}
  // 	],
  // 	"capacity_used": [
  // 		{"package": "个人组", "capacity_used": 320},
  // 		{"package": "亲子组", "capacity_used": 180}
  // 	]
  // };

  console.log("res_capacity=====>", res_capacity);

  if (res_capacity?.mode === "event") {
    eventCapacity.value = res_capacity;
  }

  request.post("/booking-api/user/price", data).then((res) => {
    eventInfo.value = res;

    if (res.spxcode_status === "ACT") {
      computedCode.value = {
        isOk: true,
        text: `${getLabel("code")}有效`,
      };
    } else {
      computedCode.value = {
        isOk: false,
        text: `${getLabel("code")}无效`,
      };
    }

    let packageData = getPackageData(res?.tickets, res_capacity);

    packageList.value = packageData;

    // 如果有选中数据，更新选中的数据
    if (isMultiSelect.value) {
      // 多选模式：更新已选中的套餐价格，移除已满的套餐
      // selectedPackages.value = selectedPackages.value
      // 	.map(pkg => packageData.find(i => i.label === pkg.label))
      // 	.filter(pkg => pkg !== undefined && !pkg.isFull);
    } else {
      // 单选模式：更新选中的套餐，如果已满则清空
      if (activeType.value.label) {
        const updatedItem = packageData.find(
          (i) => i.label === activeType.value.label
        );
        if (updatedItem && !updatedItem.isFull) {
          activeType.value = updatedItem;
        } else {
          // 如果选中的套餐已满，选择第一个未满的套餐
          activeType.value = packageData.find((i) => !i.isFull) || {};
        }
      }
    }
  });
};

// 选择了报名卡后的回调
const onSelectSigner = (data) => {
  const { item, groupIndex, slotIndex } = currentSlotInfo.value;
  const signerInfo = data.signerInfo;

  if (!item || !item.groups || !item.groups[groupIndex]) {
    return uni.$u.toast("选择位置无效，请重试");
  }

  // 检查是否重复添加（同一套餐内）
  const isExists = item.groups.flat().some((s) => s.id === signerInfo.id);
  if (isExists) {
    return uni.$u.toast(`「${signerInfo.full_name}」已在本套餐中`);
  }

  // 硬编码逻辑:仅对特定活动生效
  if (event_id.value === "01KCRXHMXF7SEBYCMZ1X2M4E0Y") {
    const idCard = signerInfo.cert_number;

    // 验证1:如果套餐价格为0,只能选择2016年1月1日之后出生的报名卡
    if (item.price === 0) {
      const birthDate = parseBirthDateFromIdCard(idCard);
      const limitDate = new Date(2016, 0, 1); // 2016-01-01
      if (!birthDate || birthDate < limitDate) {
        return uni.$u.toast("请选择2016年之后出生的报名卡");
      }
    }

    // 验证2:套餐名称包含'男'或'女',强制匹配性别
    const packageName = item.label;
    const genderFromIdCard = parseGenderFromIdCard(idCard);

    if (packageName.includes("男") && genderFromIdCard !== "男") {
      return uni.$u.toast("请选择正确性别的报名卡");
    }

    if (packageName.includes("女") && genderFromIdCard !== "女") {
      return uni.$u.toast("请选择正确性别的报名卡");
    }
  }

  // 添加到组中
  item.groups[groupIndex].push(signerInfo);
};

const submitOrder = async () => {
  if (!store.state.userInfo.id) {
    return refUserLogin.value.open();
  }

  if (!isAgree.value) return uni.$u.toast("请勾选同意协议");

  if (showField("address") && !selectedAddress.value) {
    return uni.$u.toast(`请选择${getLabel("address")}`);
  }

  // 获取所有选中的套餐（count > 0）
  const selectedPackages = packageList.value.filter((item) => item.count > 0);
  if (showField("package") && !selectedPackages.length) {
    return uni.$u.toast(`请选择${getLabel("package")}`);
  }

  // 检查所有组是否已填满报名卡
  for (const pkg of selectedPackages) {
    const requiredSigners = pkg.groupSize || 1;
    for (const group of pkg.groups) {
      if (group.length < requiredSigners) {
        return uni.$u.toast(
          `请完成「${pkg.label}」的报名卡选择（需要${requiredSigners}人）`
        );
      }
    }
  }

  // [Claude Opus 4.5 注释] 亲子组校验：至少一个儿童
  // for (const pkg of selectedPackages) {
  // 	if (pkg.label.includes('亲子')) {
  // 		for (const group of pkg.groups) {
  // 			const hasChild = group.some(s => isUnder14(s.cert_number));
  // 			if (!hasChild) {
  // 				return uni.$u.toast('亲子套餐每组至少需要一个儿童');
  // 			}
  // 		}
  // 	}
  // }

  // const reg = /^[0-9a-zA-Z]*$/g;
  // if (verifyCode.value) {
  //   if (!reg.test(verifyCode.value) || verifyCode.value.length !== 5) {
  //     return uni.$u.toast("全速码 格式有误");
  //   }
  // }

  if (isSubmitting.value) return;
  isSubmitting.value = true;
  uni.showLoading({ mask: true });

  try {
    let allSignerList = [];
    packageList.value
      .filter((i) => i.count > 0)
      .forEach((item) => {
        if (item.groups) {
          item.groups.flat().forEach((user) => {
            allSignerList.push({
              ...user,
              eventInfo: item,
            });
          });
        }
      });
    console.log("allSignerList=====>", allSignerList);

    const promiseList = allSignerList.map((item) => createSingleOrder(item));

    const orderNoList = await asyncAlls(promiseList);
    console.log(orderNoList);

    const tempList = orderNoList.filter((i) => !!i);
    if (tempList.length) {
      await payOrder(tempList);
    }
  } catch (e) {
    console.error(e);
  }

  isSubmitting.value = false;
};

// 硬编码逻辑：根据套餐名称强制设置T-shirt尺码（仅对特定活动生效）
function getFixedTshirtSize(packageLabel, originalSize) {
  // 仅对特定活动生效
  if (event_id.value !== "01KCRXHMXF7SEBYCMZ1X2M4E0Y") {
    return originalSize;
  }

  if (packageLabel.includes("男")) {
    return "L";
  } else if (packageLabel.includes("女")) {
    return "M";
  } else if (
    packageLabel.includes("小孩") ||
    packageLabel.includes("儿童") ||
    packageLabel.includes("亲子")
  ) {
    return "130";
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
  if (event_id.value === "01KCRXHMXF7SEBYCMZ1X2M4E0Y" && tshirtSize === null) {
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
    const res = await request.post(
      `/booking-api/registration/SignInEvent`,
      data
    );
    return res.reg_no;
  } catch (error) {
    console.error(error);
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

  uni.showLoading({ mask: true });

  try {
    const res = await request.post(`/pay/wechat/payment`, data);
    if (res.free) {
      uni.hideLoading();
      // uni.$u.route("pagesSub/orderSuccess?order_no=" + res.order_no);
			uni.navigateTo({
			  url: "/pagesSub/orderSuccess?order_no=" + res.order_no
			});
    } else {
      wxPay(res);
    }
  } catch (err) {
    uni.hideLoading();
    uni.showModal({
      title: "提示",
      content: err?.msg || "支付流程异常，请联系客服",
      showCancel: false,
    });
  }
};

// 获取活动地址列表
const getEventAddresses = async () => {
  if (!event_id.value) return;

  try {
    const res = await request.get(`/event-api/api/v1/events/${event_id.value}`);

    // 读取表单标签配置
    formLabels.value = res?.form_labels || null;
    // 读取主题色配置并存储供子页面使用
    colorConfig.value = res?.color_config || null;
    if (res?.color_config) {
      uni.setStorageSync('eventThemeColor', res.color_config);
    } else {
      uni.removeStorageSync('eventThemeColor');
    }

    // 获取 multi_package 字段，判断是否多选
    if (res && res.multi_package !== undefined && res.multi_package !== null) {
      multiPackageCount.value = Number(res.multi_package);
    } else {
      multiPackageCount.value = 1; // 默认单选
    }

    console.log(
      "multi_package:",
      multiPackageCount.value,
      "isMultiSelect:",
      isMultiSelect.value
    );

    if (res?.racekit_pickup_address) {
      try {
        // racekit_pickup_address 是 JSON 字符串，需要解析
        const addressData =
          typeof res.racekit_pickup_address === "string"
            ? JSON.parse(res.racekit_pickup_address)
            : res.racekit_pickup_address;

        if (addressData?.addresses && Array.isArray(addressData.addresses)) {
          // 转换为 picker 需要的格式
          addressPickerColumns.value = addressData?.addresses.map(
            (addr, index) => ({
              label: addr,
              value: addr,
            })
          );

          const addressList = addressData?.addresses || [];

          if (addressList.length === 1) {
            selectedAddress.value = addressPickerColumns.value[0].value;
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
    mask: true,
  });

  if (!userInfo.value.running_group) {
    myGroup.value = {};

    return;
  }

  request
    .get(
      `/running-group/api/v1/groups/info?group_id=${userInfo.value.running_group}`
    )
    .then((res) => {
      if (res) {
        myGroup.value = res;
      }
    });
};

// 页面加载
onLoad((options) => {
  event_id.value = options.event_id;
  getEventPackageList();
  getUserGroup();
  getEventAddresses();
});

// 方法定义
const openGroupPop = () => {
  if (myGroup.value.group_id) return;

  refGroupList.value.open();
};

defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
</script>

<style lang="scss">
.page {
  background: #fafafa;
}

.section-tips {
  margin: 30rpx 34rpx;
  padding: 24rpx;
  background: #fff7ed;
  border-radius: 16rpx;
  border: 1rpx solid #ffe4c4;

  .tips-title {
    font-size: 28rpx;
    font-weight: bold;
    color: var(--theme-color, #ff8c00);
    margin-bottom: 16rpx;
  }

  .tips-list {
    .tips-item {
      font-size: 24rpx;
      color: #666;
      line-height: 1.8;
    }

    .tips-highlight {
      color: var(--theme-color, #ff8c00);
      font-weight: bold;
    }
  }
}

.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 20rpx 34rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.06);

  .agreement-wrapper {
    gap: 10rpx;
  }

  .agreement-text {
    flex: 1;
    font-size: 24rpx;
    line-height: 1.5;
    color: #333;
    word-wrap: break-word;
    word-break: break-all;

    text {
      font-size: 24rpx;
      line-height: 1.5;
    }
  }
}

.section-bottom {
  margin: 30rpx 34rpx;

  .agreement-wrapper {
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

  .remaining-quota {
    font-size: 26rpx;
    font-weight: normal;
    color: #e53935;
    margin-left: 8rpx;
  }
}

.section-content {
  background: #ffffff;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  width: 100%;
  padding: 30rpx 20rpx;
}

.package-empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999;
}

.price-item {
  background: #f0f4f5;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 2rpx solid rgba(0, 0, 0, 0.04);

  &.active {
    border: 2rpx solid var(--theme-color, #ff8c00);
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.15);

    .price-item-header {
      background: var(--theme-color, #ff8c00);
    }

    .price-item-label {
      color: #ffffff;

      .group-size-hint {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .price-item-price,
    .price-item-capacity {
      color: #ffffff;
    }

    .quantity-selector {
      background: rgba(255, 255, 255, 0.95);
    }
  }

  &.disabled {
    background: #e0e0e0;
    opacity: 0.6;

    .price-item-status {
      color: #d32f2f;
    }
  }

  .price-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 20rpx;
    background: #f0f4f5;
    transition: background 0.2s ease;
  }

  .price-item-left {
    flex: 1;
  }

  .price-item-right {
    flex-shrink: 0;
    margin-left: 20rpx;
  }

  .price-item-label {
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
    transition: color 0.2s ease;

    .group-size-hint {
      font-size: 24rpx;
      font-weight: normal;
      color: #999;
      transition: color 0.2s ease;
    }
  }

  .price-item-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 8rpx;
  }

  .price-item-price {
    font-size: 28rpx;
    color: var(--theme-color, #ff8c00);
    font-weight: bold;
    transition: color 0.2s ease;
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
    transition: color 0.2s ease;
  }

  // 数量选择器
  .quantity-selector {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 8rpx;
    border: 1rpx solid #e0e0e0;

    .qty-btn {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        opacity: 0.4;
      }
    }

    .qty-value {
      width: 60rpx;
      text-align: center;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
  }

  // 报名卡空位区域
  .price-item-slots {
    padding: 20rpx;
    background: #fff;
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .slot-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .slot-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }

  .slot-empty,
  .slot-filled {
    width: 88rpx;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slot-empty {
    background: #f5f5f5;
    border: 2rpx dashed #ccc;

    &.slot-disabled {
      background: #e8e8e8;
      border-color: #ddd;
      opacity: 0.6;
    }
  }

  .slot-filled {
    position: relative;
    background: #fff;
    border: 1rpx solid #eee;

    .slot-avatar {
      width: 100%;
      height: 100%;
      border-radius: 16rpx;
    }

    .slot-remove {
      position: absolute;
      right: -8rpx;
      top: -8rpx;
    }
  }

  .slot-name {
    font-size: 24rpx;
    color: #666;
    font-weight: normal;
  }
}

// 支付区域（合并金额+支付方式）
.section-payment {
  margin: 30rpx 34rpx 20rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);

  // 应付金额
  .payment-amount {
    .amount-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 12rpx;
    }

    .amount-value {
      display: flex;
      align-items: baseline;

      .amount-symbol {
        font-size: 36rpx;
        font-weight: bold;
        color: #e53935;
      }

      .amount-number {
        font-size: 56rpx;
        font-weight: bold;
        color: #e53935;
        margin-left: 4rpx;
      }

      .amount-hint {
        font-size: 26rpx;
        color: #999;
        margin-left: 16rpx;
      }
    }
  }

  // 支付方式
  .payment-method {
    margin-top: 32rpx;

    .method-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 16rpx;
    }
  }

  .payment-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    background: #fafafa;
    border-radius: 12rpx;
    border: 2rpx solid #e8e8e8;
    transition: all 0.2s ease;

    &.active {
      background: #fff7ed;
      border-color: #ff8c00;
    }

    .payment-card-left {
      display: flex;
      align-items: center;

      .payment-icon {
        width: 48rpx;
        height: 48rpx;
      }

      .payment-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-left: 16rpx;
      }
    }

    .payment-card-right {
      display: flex;
      align-items: center;
    }
  }
}

.cell-label {
  white-space: nowrap;
  margin-right: 20rpx;
}
</style>