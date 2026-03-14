<template>
  <div class='section-panel' style="padding-bottom:40rpx;">
    <u-cell title="我的战绩" customClass="section-title" :border="false" isLink value="查看全部" />

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

const userCheckedInfo = ref({});
function getuserCheckedInfo() {
  request.get("/user-api/user/getEventCheckins?event_id=" + props.activetyId).then((res) => {
    console.log('userCheckedInfo', res)
    res.checkedPercent = res.required_checkins ? Math.round(res.total_qualified_sessions / res.required_checkins * 100) : 0
    userCheckedInfo.value = res;
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

/* 功能按钮组 */
.section-panel {
  padding: 0rpx 0rpx 20rpx;
  background-color: white;
  border-radius: 24rpx;
  margin: 0 30rpx 30rpx;
  font-weight: 500;
  color: #364153;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
</style>