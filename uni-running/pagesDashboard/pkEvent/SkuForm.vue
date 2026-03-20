<template>
  <view class="container1">
    <!-- 商品信息卡片 -->
    <view class="product-card u-flex-row">
      <view class="combo-content_left u-mr-20" style="width:120rpx;height:120rpx;">
        <up-lazy-load height="80" :image="packageData.packageUrl + '?x-oss-process=image/resize,w_110,h_110,m_fill'" errorImg="/static/images/user.png" />
      </view>
      <div class="">
        <view class="name" style="font-size: 32rpx; font-weight: bold;">{{ packageData.packageName }} (邮寄发放)</view>
        <view class="price-row u-mt-20">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ currentSku?.price ?? '0.00' }}</text>
        </view>

        <view class="info-row">
          <text class="stock-tag">库存：{{ currentSku?.stock ?? '-' }}</text>
          <text class="selected-info" v-if="selectedSpec && selectedSize">
            已选：{{ selectedSpec }} / {{ selectedSize }}
          </text>
          <text class="selected-info placeholder" v-else>
            请选择规格
          </text>
        </view>
      </div>
    </view>

    <view class="sku-wrapper">
      <!-- 1. 性别选择 (Spec) -->
      <view class="sku-group">
        <text class="group-label">套餐款式</text>
        <view class="options-list">
          <view v-for="spec in specList" :key="spec" class="sku-btn" :class="{
              'active': selectedSpec === spec,
              'disabled': isSpecDisabled(spec)
            }" @click="handleSelectSpec(spec)">
            {{ spec }}
          </view>
        </view>
      </view>

      <!-- 2. 尺码选择 (Size) -->
      <view class="sku-group">
        <text class="group-label">套餐尺寸</text>
        <view class="options-grid">
          <view v-for="size in sizeList" :key="size" class="sku-btn grid-btn" :class="{
              'active': selectedSize === size,
              'disabled': isSizeDisabled(size)
            }" @click="handleSelectSize(size)">
            <text class="btn-text">{{ size }}</text>
            <text v-if="getStockCount(size) === 0" class="no-stock-tag">无货</text>
          </view>
        </view>
      </view>

    </view>

    <!-- 底部操作栏 -->
    <!-- <view class="action-bar">
      <view class="submit-btn" :class="{ 'btn-disabled': !canSubmit }" @click="handleSubmit">
        {{ submitButtonText }}
      </view>
    </view> -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request.js";

const props = defineProps({
  packageData: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

watch(
  () => props.packageData,
  (newVal) => {
    if (newVal && newVal.packageId) {
      getSkuList();
    }
  },
  { immediate: true }
);

const skuData = ref([]); // 从 API 获取的原始 SKU 数据
function getSkuList() {
  request
    .get(`/event-api/package_skus?package_id=${props.packageData.packageId}`)
    .then((res) => {
      skuData.value = res || [];

      initOptions();
      autoSelectDefault();
    });
}

// 如果只有1个  sku信息且有库存 自动选中
function autoSelectDefault() {
  const availableSkus = skuData.value.filter(
    (item) => item.status === "ACT" && item.stock > 0
  );

  if (availableSkus.length === 1) {
    const singleSku = availableSkus[0];
    selectedSpec.value = singleSku.spec_name;
    selectedSize.value = singleSku.size_name;
  }
}

const selectedSpec = ref(""); // 选中性别
const selectedSize = ref(""); // 选中尺码
const specList = ref([]); // 性别选项列表
const sizeList = ref([]); // 尺码选项列表

const initOptions = () => {
  const specs = new Set();
  const sizes = new Set();

  skuData.value.forEach((item) => {
    if (item.status === "ACT") {
      specs.add(item.spec_name);
      sizes.add(item.size_name);
    }
  });

  specList.value = Array.from(specs);
  sizeList.value = Array.from(sizes);
};

// --- 4. 核心计算逻辑 ---

// 查找当前选中的完整 SKU 对象
const currentSku = computed(() => {
  if (!selectedSpec.value || !selectedSize.value) return null;

  return (
    skuData.value.find(
      (item) =>
        item.spec_name === selectedSpec.value &&
        item.size_name === selectedSize.value
    ) || null
  );
});

const emit = defineEmits(["update:modelValue", "change"]);
watch(currentSku, (newSku) => {
  if (newSku) {
    console.log("当前选中 SKU:", newSku);
    emit("update:modelValue", currentSku.value);
  }
});

// 判断是否可以提交
const canSubmit = computed(() => {
  if (!currentSku.value) return false;
  return currentSku.value.stock > 0;
});

// 底部按钮文案
const submitButtonText = computed(() => {
  if (!selectedSpec.value || !selectedSize.value) return "请选择规格";
  if (!canSubmit.value) return "已售罄";
  return "立即购买";
});

// 判断性别是否禁用 (该性别下所有尺码都无货)
const isSpecDisabled = (spec) => {
  const hasStock = skuData.value.some(
    (item) => item.spec_name === spec && item.stock > 0 && item.status === "ACT"
  );
  return !hasStock;
};

// 判断尺码是否禁用
const isSizeDisabled = (size) => {
  // 1. 没选性别，禁用所有尺码
  if (!selectedSpec.value) return true;

  // 2. 选了性别，但该组合无库存或不存在
  const sku = skuData.value.find(
    (item) => item.spec_name === selectedSpec.value && item.size_name === size
  );

  return !sku || sku.stock <= 0;
};

// 获取某尺码在当前性别下的库存数 (用于显示)
const getStockCount = (size) => {
  if (!selectedSpec.value) return 0;
  const sku = skuData.value.find(
    (item) => item.spec_name === selectedSpec.value && item.size_name === size
  );
  return sku ? sku.stock : 0;
};

// 点击性别
const handleSelectSpec = (spec) => {
  if (isSpecDisabled(spec)) return;

  // 如果点击已选中的，取消选择
  if (selectedSpec.value === spec) {
    selectedSpec.value = "";
    selectedSize.value = ""; // 联动清空
    return;
  }

  selectedSpec.value = spec;
  selectedSize.value = ""; // 切换性别必须重置尺码
};

// 点击尺码
const handleSelectSize = (size) => {
  if (isSizeDisabled(size)) return;

  if (selectedSize.value === size) {
    selectedSize.value = "";
    return;
  }

  selectedSize.value = size;
};

const handleSubmit = () => {
  if (!selectedSpec.value || !selectedSize.value) {
    uni.showToast({ title: "请选择完整规格", icon: "none" });
    return;
  }

  if (!canSubmit.value) {
    uni.showToast({ title: "该规格已售罄", icon: "none" });
    return;
  }

  uni.showModal({
    title: "确认购买",
    content: `商品：${currentSku.value.spec_name} - ${currentSku.value.size_name}\n价格：¥${currentSku.value.price}`,
    success: (res) => {
      if (res.confirm) {
        console.log("提交订单数据:", currentSku.value);
        // TODO: 调用下单 API
      }
    },
  });
};
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx;
  padding-bottom: 140rpx;
  background-color: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.product-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  .price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;
  }

  .price-symbol {
    font-size: 28rpx;
    color: #ff4400;
    font-weight: bold;
    margin-right: 4rpx;
  }

  .price-value {
    font-size: 44rpx;
    color: #ff4400;
    font-weight: 800;
  }

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .stock-tag {
    font-size: 24rpx;
    color: #999;
  }

  .selected-info {
    font-size: 26rpx;
    color: #333;
    background: #f5f5f5;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    align-self: flex-start;

    &.placeholder {
      color: #bbb;
      background: transparent;
      padding: 0;
    }
  }
}

.sku-wrapper {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .sku-group {
    margin-bottom: 40rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .group-label {
      font-size: 28rpx;
      color: #222;
      margin-bottom: 20rpx;
      display: block;
      font-weight: 500;
    }

    .options-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
    }

    .sku-btn {
      padding: 20rpx 24rpx;
      background: #f5f5f5;
      border: 1rpx solid #eee;
      border-radius: 12rpx;
      font-size: 26rpx;
      color: #333;
      text-align: center;
      position: relative;
      transition: all 0.2s;

      &.grid-btn {
        padding: 16rpx 10rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80rpx;

        .btn-text {
          margin-bottom: 4rpx;
        }

        .no-stock-tag {
          font-size: 20rpx;
          color: #ccc;
          transform: scale(0.9);
        }
      }

      /* 选中状态 */
      &.active {
        background: #fff0e8;
        border-color: #ff4400;
        color: #ff4400;
        font-weight: 600;
      }

      /* 禁用状态 */
      &.disabled {
        background: #f0f0f0;
        color: #ccc;
        border-color: transparent;
        cursor: not-allowed;

        // &::after {
        //   content: "";
        //   position: absolute;
        //   top: 50%;
        //   left: 50%;
        //   width: 110%;
        //   height: 2rpx;
        //   background: #dcdcdc;
        //   transform: translate(-50%, -50%) rotate(-45deg);
        // }
      }
    }
  }
}

/* 底部按钮 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(90deg, #ff6600, #ff4400);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(255, 68, 0, 0.3);

    &.btn-disabled {
      background: #e0e0e0;
      color: #999;
      box-shadow: none;
    }
  }
}
</style>