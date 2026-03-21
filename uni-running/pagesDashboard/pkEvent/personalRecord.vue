<template>
  <div v-if="userCheckedInfo.required_checkins">
    <div class='section-panel' style="padding-bottom:40rpx;">
      <u-cell title="我的战绩" customClass="section-title" :border="false" isLink value="查看全部" @click="popupVisible = true" />

      <div class="flex-row u-mt-20">
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{userCheckedInfo.total_distance_km}} 
            <text class="c6 fs24">km</text>
          </view>
          <text class="c6 fs24">跑步总量</text>
        </view>
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{ userCheckedInfo.total_qualified_sessions }}/{{ userCheckedInfo.required_checkins }}</view>
          <text class="c6 fs24">打卡次数</text>
        </view>
        <view class="flex-1 flex-col-center">
          <view class="b u-mb-20" style="font-size:34rpx;color:#1e2939;">{{ userCheckedInfo.checkedPercent }}%</view>
          <text class="c6 fs24">打卡进度</text>
        </view>
      </div>
    </div>

    <!-- 弹窗显示记录列表 -->
    <u-popup :show="popupVisible" mode="bottom" z-index="20" :closeable="true" @close="popupVisible = false">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">打卡记录列表</text>
        </view>
        <scroll-view scroll-y class="record-list">
          <view v-for="record in userCheckedInfo.checkins" :key="record.id" class="record-item">
            <view class="record-row">
              <text class="label">日期：</text>
              <text>{{ new Date(record.check_date).toLocaleDateString() }}</text>
            </view>
            <view class="record-row">
              <text class="label">距离：</text>
              <text>{{ record.km }} km</text>
            </view>
            <view class="record-row">
              <text class="label">时间：</text>
              <text>{{ record.time }}</text>
            </view>
            <view class="record-row">
              <text class="label">速度：</text>
              <text>{{ record.speed }}</text>
            </view>
            <view v-if="record.image_url" class="record-row">
              <text class="label">图片：</text>
							<view class="record-image" @click="previewImage(record.image_url)">
								<up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
								  (record.image_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
								" mode="aspectFill"/>
							</view>
              <!-- <image :src="record.image_url" class="record-image" @click="previewImage(record.image_url)" /> -->
            </view>
            <!-- <view class="record-row">
              <text class="label">创建时间：</text>
              <text>{{ new Date(record.created_at).toLocaleString() }}</text>
            </view> -->
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";

const props = defineProps({
  activetyId: {
    type: [String, Number],
    required: true,
  },
});

const popupVisible = ref(false);

const userCheckedInfo = ref({});
function getuserCheckedInfo() {
  request.get("/user-api/user/getEventCheckins?event_id=" + props.activetyId, {}, { showError: false }).then((res) => {
    res.checkedPercent = res.required_checkins ? Math.round(res.total_qualified_sessions / res.required_checkins * 100) : 0
    userCheckedInfo.value = res;
  }).catch(() => {});
}

function previewImage(url) {
  uni.previewImage({
    urls: [url],
    current: url
  });
}

watch(() => props.activetyId, (newVal) => {
  if (newVal) {
    getuserCheckedInfo();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
  ::v-deep {
		.section-title {
			.u-cell__body {
				padding: 20rpx 20rpx 20rpx;
			}
      .u-cell__title-text {
        font-weight: 500;
        font-size: 32rpx;
        color: #222;
      }
      .uicon-arrow-right,
      .u-cell__value {
        color: #999;
      }
    }
  }

.section-panel {
  padding: 0rpx 0rpx 20rpx;
  background-color: white;
  border-radius: 24rpx;
  margin: 0 30rpx 30rpx;
  font-weight: 500;
  color: #364153;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.popup-content {
    height: 80vh;
    background-color: white;
    border-radius: 24rpx 24rpx 0 0;
    padding: 40rpx;

    .popup-header {
      text-align: center;
      margin-bottom: 20rpx;

      .popup-title {
        font-size: 36rpx;
        font-weight: 500;
        color: #222;
      }
    }

    .record-list {
      height: calc(80vh - 120rpx);

      .record-item {
        border-bottom: 1rpx solid #eee;
        padding: 20rpx 0;

        .record-row {
          display: flex;
          margin-bottom: 10rpx;

          .label {
            font-weight: 500;
            color: #666;
            min-width: 120rpx;
          }
        }

        .record-image {
          width: 100rpx;
          height: 100rpx;
          border-radius: 8rpx;
        }
      }
    }
  }
</style>