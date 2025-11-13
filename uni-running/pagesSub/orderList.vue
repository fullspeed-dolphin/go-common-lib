<template>
  <view class="page">
    <Navbar title="我的赛事" :bgHeight="370" />
    <view class="tab-container">
      <u-tabs
        lineHeight="2"
        :duration="0"
        :inactiveStyle="{ color: '#000' }"
        :activeStyle="{ color: '#FF8C00' }"
        :list="tab.items"
        @change="changeTab"
        :scrollable="false"
        keyName="label"
        lineColor="#FF8C00"
      />
    </view>
    <mescroll-uni
      ref="mescrollRef"
      @init="mescrollInit"
      @down="downCallback"
      @up="getList"
      top="300"
    >
      <view class="order-list">
        <view
          class="order-item"
          v-for="order in orders"
          :key="order.id"
          @click="viewDetail(order)"
        >
          <EventItem
            :item="order.event_info"
            direction="row"
            :showButton="false"
          />
          <view class="order-item-info">
            <view class="order-item-info-name">
              <text class="label">报名人：</text>
              <text class="value">{{ order.sign_info.full_name }}</text>
            </view>
            <view class="order-item-info-status">
              <u-text
                v-if="order.status == 'PND'"
                size="14"
                type="error"
                text="待支付"
              ></u-text>
              <u-text
                v-if="order.status == 'SUCC'"
                size="14"
                type="success"
                text="已付款"
              ></u-text>
              <u-text
                v-if="order.status == 'FAIL'"
                size="14"
                type="error"
                text="失败"
              ></u-text>
              <u-text
                v-if="order.status == 'RFND'"
                size="14"
                type="info"
                text="已退款"
              ></u-text>
              <u-text
                v-if="order.status == 'CXL'"
                size="14"
                type="info"
                text="已取消"
              ></u-text>
              <u-text
                v-if="order.status == 'EXP'"
                size="14"
                type="info"
                text="已过期"
              ></u-text>
            </view>
          </view>
        </view>
      </view>
    </mescroll-uni>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";
import Navbar from "@/components/navbar.vue";
import EventItem from "@/components/EventItem.vue";

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 使用store
const store = useStore();

// const orders = ref([
//   {
//     id: 1,
//     name: "黄永盛",
//     status: "SUCC",
//     event_info: {
//       id: 1,
//       image_url:
//         "https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2025/10/19/9806f1b0-61cb-4813-9623-c21339ed6d10.jpg",
//       description: "2025第四届十全十美欢乐跑暨“跑了没”启动仪式",
//       created_at: "2025-01-01",
//     },
//   },
// ]);
const orders = ref([]);

// 模板引用
const mescrollRef = ref(null);

// 响应式数据
const tab = ref({
  active: 0,
  items: [
    { label: "线上活动", value: "online" },
    { label: "线下赛事", value: "offline" },
  ],
});
const changeTab = (detail) => {
  tab.value.active = detail.index;
  getList(1);
};

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// mescroll相关
let mescroll = null;

const mescrollInit = (mescrollInstance) => {
  mescroll = mescrollInstance;
};

// 方法定义
const viewDetail = (item) => {
  uni.setStorageSync("orderDetail", item);
  // uni.$u.route(`/pagesSub/orderDetail`);
};

const refreshList = () => {
  nextTick(() => {
    mescroll.resetUpScroll(); // 重置列表数据为第一页
    mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
  });
};

const getList = (page) => {
  if (tab.value.active === 0) {
    orders.value = [];
    uni.hideLoading();
    mescroll.endBySize(0, 0);
    return;
  }
  uni.showLoading({ mask: true });

  const data = {
    pageIndex: page.num - 1,
    pageSize: 10,
    orderStatus: "SUCC",
  };
  proxy.$axios
    .post(`/pay/order/statusByUser`, data)
    .then((res) => {
      uni.hideLoading();

      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      mescroll.endBySize(res.orders.length, res.total);

      //如果是第一页需手动制空列表
      if (page.num == 1) {
        orders.value = [];
      }

      orders.value = orders.value.concat(
        res.orders?.map((order) => {
          order.event_info.event_time = order.created_at;
          return order;
        })
      ); //追加新数据
    })
    .catch((error) => {
      uni.hideLoading();
      mescroll.endSuccess();
    });
};

const payOrder = (item) => {
  const respay = item.payment_params;
  // 触发微信支付
  wx.requestPayment({
    timeStamp: respay.timeStamp,
    nonceStr: respay.nonceStr,
    package: respay.package,
    signType: respay.signType,
    paySign: respay.paySign,
    success: (res) => {
      uni.hideLoading();
      proxy.$toast("支付成功");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
    fail: (res) => {
      uni.hideLoading();
      console.log("res======>", res);
      proxy.$toast("支付未完成");
      setTimeout(() => {
        // uni.navigateBack()
        uni.$u.route("pagesSub/signUpStatus?order_no=" + item.order_no);
      }, 300);
    },
  });
};

const downCallback = (mescroll) => {
  // 下拉刷新的回调
  mescroll.resetUpScroll();
};
defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
</script>

<style lang="scss" scoped>
.page {
  background: #fafafa;
  padding-bottom: env(safe-area-inset-bottom);
}
.order-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  box-sizing: border-box;
  padding: 0 34rpx;
  .order-item {
    background: #ffffff;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    padding: 32rpx 16rpx;
    .order-item-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2rpx solid rgba(0, 0, 0, 0.06);
      padding-top: 24rpx;
      margin-top: 24rpx;
      .order-item-info-name {
        font-weight: bold;
        font-size: 28rpx;
        color: #999999;
        .value {
          color: #000000;
        }
      }
      .order-item-info-status {
        ::v-deep {
          .u-text__value {
            font-weight: bold !important;
            font-size: 28rpx !important;
          }
        }
      }
    }
  }
}
.tab-container {
  width: 500rpx;
  margin: 32rpx auto;
}
</style>
