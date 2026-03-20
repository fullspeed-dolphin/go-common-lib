<template>
  <view class="">
    <u-navbar autoBack placeholder title="选择套餐" />
      <view class="card-section">
        <view style="font-weight: 800;font-size: 34rpx;color: #0F172A;padding:32rpx;">选择套餐</view>
        <view class="package-item u-flex-row" v-for="item in packageList" :key="item.id" @click="changePackage(item)">
          <view class="package-image">
            <up-lazy-load height="110" :image="item.package_image_url + '?x-oss-process=image/resize,w_110,h_110,m_fill'" errorImg="/static/images/user.png" />
          </view>
          <view class="package-item_right">
            <view class="real_name b" style="font-size:32rpx;">{{ item.package_name }}</view>
            <view class="txt">{{ item.package_description }}</view>
            <view class="target">
              <view>{{ item.package_subtitle }}</view>
              <view class="join-btn flex-center" :style="{ background: `linear-gradient(90deg, ${pkEventTheme?.gradient?.[0]}, ${pkEventTheme?.gradient?.[1]})` }" @click.stop="goSign(item)">
                去报名
              </view>
            </view>
          </view>

          <div v-if="item.is_recommended" class="recommended-tag">推荐</div>
        </view>
      </view>

    <up-popup :show="isShowModal" @close="close" overlayOpacity="0.3" :safeAreaInsetBottom="false" bgColor="#fff" mode="bottom" closeable>
      <div class="flex-center b" style="height:90rpx;font-size:32rpx;">{{ comBoDetail.package_name }}</div>
      <view class="container">
        <view class="packHead">
          <view class="item" :class="currentItemIndex === index ? 'active':''" v-for="(item,index) in tabList" @click="itemClick(item,index)">
            {{ item.name }}
          </view>
        </view>
        <view class="content" style="height:686rpx;">
          <view v-if="currentItemIndex==0">
            <view v-if="!comBoDetail.detail">
              <view class="nodata" text="暂无详情">暂无详情</view>
            </view>
            <scroll-view scroll-y style="height:686rpx;width:686rpx;" v-else>
              <image v-for="item in comBoDetail.detail" style="width:686rpx;" :src="item + '?x-oss-process=image/resize,w_750,m_fill'" mode="widthFix"></image>
            </scroll-view>
          </view>
          <view v-if="currentItemIndex==1">
            <scroll-view v-if="comBoDetail.spec" scroll-y style="height:686rpx;">
              <rich-text :nodes="comBoDetail.spec"></rich-text>
            </scroll-view scroll-y>
            <view v-else>
              <view class="nodata" text="暂无规格">暂无规格</view>
            </view>
          </view>
          <view v-if="currentItemIndex==2">
            <scroll-view scroll-y v-if="comBoDetail.video" style="height:686rpx;">
              <rich-text :nodes="comBoDetail.spec"></rich-text>
            </scroll-view scroll-y>
            <view v-else>
              <view class="nodata" text="暂无视频">暂无视频</view>
            </view>
          </view>
        </view>
      </view>
    </up-popup>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import FileUpload from "@/components/common/FileUpload.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import request from "@/utils/request.js";
import { formatRichText } from "@/utils/util.js";

import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);
const pkEventTheme = computed(() => store.state.pkEventTheme);

const props = defineProps({
  teamID: {
    type: String,
    default: "",
  },
});

const form = ref({
  real_name: "",
  contact_number: "",
  shipping_address: "",
  package_id: "",
  cert_type: "",
  cert_number: "",
});

// 获取套餐列表
const packageList = ref([]);
const getPackageList = () => {
  const data = {
    event_id: routerParams.value.eventId || routerParams.value.id,
  };
  request.get(`/event-api/online_events_packages`, data).then((res) => {
    packageList.value = res.map((item) => {
      return {
        ...item,
        spec: formatRichText(item.spec || ""),
        video: formatRichText(item.video || ""),
      };
    });
    // const package_id = res.find((i) => i.is_recommended)?.id || "";
    // changePackage(package_id);
  });
};

const routerParams = ref({});
onLoad((options) => {
  console.log("option", options);
  routerParams.value = options;
  // 套餐列表
  getPackageList();
});

// 查看套餐详情
const comBoDetail = ref({
  detail: "",
  video: "",
  spec: "",
});
function changePackage(item) {
  console.log("item-====", item);
  isShowModal.value = true;
  comBoDetail.value = item;
}

const tabList = ref([
  {
    name: "详情",
  },
  {
    name: "规格",
  },
  {
    name: "视频",
  },
]);

const goSign = (item) => {
  uni.$u.route(
    `pagesDashboard/pkEvent/pkEventForm`, {
      packageName: item.package_name,
      packageUrl: item.package_image_url || "",
      packageId: item.id,
      eventId: routerParams.value.eventId || routerParams.value.id,
      teamId: routerParams.value.teamId || "",
    })
};
const isShowModal = ref(false);
// 关闭弹框
function close() {
  isShowModal.value = false;
}
//
const currentItemIndex = ref(0);
function itemClick(item, index) {
  currentItemIndex.value = index;
}
</script>

<style lang="scss" scoped>
.input-wrap {
  height: 100rpx;
  padding-left: 30rpx;
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #e2e8f0;
}
.map-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e2e8f0;
  background: #fafafa;
  margin-right: 10rpx;
}
.package-item {
  min-height: 222rpx;
  padding: 42rpx 20rpx 32rpx 34rpx;
  background: #ffffff;
  border-top: 2rpx solid #e2e8f0;
  border-bottom: 2rpx solid #e2e8f0;
  margin-bottom: 20rpx;
  position: relative;
  &_right {
    flex: 1;
  }
  .recommended-tag {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: #ff5c5c;
    color: #fff;
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }
  .package-image {
    flex-shrink: 0;
    width: 168rpx;
    height: 168rpx;
    background: #f3f4f6;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
    margin-right: 26rpx;
    font-size: 40rpx;
    font-weight: 500;
  }

  .name {
    font-weight: 500;
    line-height: 48rpx;
    font-size: 32rpx;
    color: #101828;
  }
  .target {
    line-height: 48rpx;
    font-size: 32rpx;
    color: #ff5c5c;
    font-weight: 500;
    margin-bottom: 10rpx;
    display: flex;
    justify-content: space-between;
    .join-btn {
      width: 180rpx;
      height: 64rpx;
      color: #fff;
      font-weight: bold;
      font-size: 26rpx;
      color: #ffffff;
      background: #ff5c5c;
      border-radius: 999rpx;
    }
  }

  &.active {
    background: #fff1f2;
    border: 2rpx solid #ff5c5c;

    .iconfont {
      background: #fff;
      color: #ff5c5c;
    }
  }

  .txt {
    color: #929dae;
    min-height: 90rpx;
    font-size: 24rpx;
    line-height: 30rpx;
  }
}

.cert_type-line {
  padding-right: 20rpx;
  ::v-deep {
    .u-cell {
      width: 630rpx;
    }
    .u-cell__body__content {
      display: none;
    }
    .u-cell__value {
      flex: 1;
      text-align: left;
      margin-left: 0;
    }
  }
}

// 卡片通用样式
.card-section {
  // padding: 0 32rpx;
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
  padding: 0 32rpx;
}

// 提交按钮
.submit-wrapper {
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20rpx 32rpx 40rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

::v-deep {
  .u-form-item__body__left__content__required {
    top: 0;
    font-size: 24px;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    order: 1 !important;
    margin-left: 4rpx !important;
  }

  .u-form-item__body__left__content__label {
    flex: none !important;
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
.container {
  .packHead {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    .item {
      flex: 1;
      text-align: center;
      height: 60rpx;
      line-height: 60rpx;
      margin: 0 50rpx;
      &.active {
        border-bottom: 4rpx solid #ff5d5b;
      }
    }
  }
  .nodata {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    height: 686rpx;
    color: #999;
  }
}
</style>