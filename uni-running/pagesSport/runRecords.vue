<template>
  <view>
    <u-navbar title="运动记录" placeholder />

    <view class="container u-pb-30">
      <section class="section-dashboard rel">
        <view class="h1-year flex-row u-mb-40">
          <PickerCell v-model="selectedYear" placeholder="累计里程" @change="changeYear" :title="null" :border="false"
							:columns="options_events" />
        </view>

        <view class="bar flex-start">
          <div class="flex-row" style="align-items: flex-end;">
            <view class="amount"> {{yearSummaryData.total_distance_km}} </view>
            <!-- <view class="unit u-pb-3">{{yearSummaryData.total_distance_units}}</view> -->
          </div>
        </view>
        <div class="device flex-col-center" style="position:absolute;top: 10px; right: 10px;" @click="isShowPicker_device = true">
          <image v-if="selectedDevice.imgUrl" class="poster" :src="selectedDevice.imgUrl" mode="aspectFill"></image>
          <view v-else class="iconfont icon-shouhuanfuwu" style="color:#ff8c00; font-size: 40rpx;"></view>
          <view class="value b" style="font-size: 22rpx; color: #111; margin-top: 8rpx;">
            {{selectedDevice.name || '切换设备'}}
          </view>
        </div>
        <view class="statics flex-row">
          <view class="flex-1">
            <view class="label">运动次数</view>
            <view class="value">{{yearSummaryData.total_records}}</view>
          </view>
          <view class="flex-1">
            <view class="label">平均配速</view>
            <view class="value">{{yearSummaryData.total_listPace}}</view>
          </view>
          <view class="flex-1">
            <view class="label">时长</view>
            <view class="value">{{yearSummaryData.total_duration_time}}</view>
          </view>
          <view class="flex-1">
            <view class="label">消耗大卡</view>
            <view class="value">{{yearSummaryData.total_active_kilocalories}}</view>
          </view>
        </view>
      </section>

      <!-- 当天健康记录 -->
      <section v-if="!selectedDevice.name" class="panel">
        <view class="h1 b" style="padding: 20rpx 0 0 10rpx;font-size: 32rpx;margin-bottom: 20rpx;"> 今日运动总结 </view>
        <view class="statics flex-row b">
          <view class="flex-1">
            <view class="label">运动步数</view>
            <view class="value">{{todaySummaryData.total_steps}}</view>
          </view>
          <view class="flex-1">
            <view class="label">里程长度</view>
            <view class="value">{{ todaySummaryData.total_distance_meters }}</view>
          </view>
          <view class="flex-1">
            <view class="label">时长</view>
            <view class="value">{{ todaySummaryData.total_duration_seconds }}</view>
          </view>
          <view class="flex-1">
            <view class="label">消耗大卡</view>
            <view class="value">{{todaySummaryData.total_calories}}</view>
          </view>
        </view>
      </section>

      <section class="date-list">
        <view class="date-item" v-for="(item, index) in monthlyRecords" :key="'row-' + index" :class="{ 'last-item': index === monthlyRecords.length - 1 }">
          <view class="date-header" @click="toggleExpand(index)">
            <view class="date-title">{{ item.month }}</view>
            <view class="flex-start amount-number">
              <view class="amount">{{ item.total_distance_km }}</view>
              <!-- <view class="">公里</view> -->
            </view>
            <view class="date-icon" :class="{ expanded: expandedIndex === index }">
              <u-icon name="arrow-up" size="14" color="#616161"></u-icon>
            </view>
          </view>
          <view class="date-content" :class="{ expanded: expandedIndex === index }" v-if="expandedIndex === index">
            <SportItem :item="itemDay" v-for="(itemDay, sindex) in item.records" :key="'index' + sindex" />
            <div v-if="item.records.length === 0" class="flex-row-center" style="color:#979797; padding: 30rpx 0;">
              当月暂无运动记录
            </div>
          </view>
        </view>
      </section>

      <view v-if="deviceList.length === 0" class="section-empty">
        <view>暂无数据请</view>
        <view class="link" @click="$u.route('/pagesSub/device/deviceList')">添加设备</view>
      </view>
    </view>

    <up-action-sheet :actions="deviceList" title="选择设备" cancelText="取消" round="10"
      @close="isShowPicker_device = false" @select="selectDevice"
      :show="isShowPicker_device" />
  </view>
</template>
<script setup>
import SportItem from "./SportItem.vue";
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import PickerCell from "@/components/common/PickerCell.vue";
import dayjs from "dayjs";
import { formatDuration, formatDistance, formatPace, getTypeSum } from "./assets/utils.js";
import parse from "../uni_modules/uview-plus/components/u-parse/parse";
// import { useShare } from "@/composables/useShare.js";

// // 分享配置
// useShare({
//   title: '运动记录',
//   path: '/pagesSub/sport/list'
// });

const todaySummaryData = ref({})
function getSoprtRecords() {
  request.get("/sport-api/api/healthdata/summary").then((res) => {
    // console.log("运动记录====>", res);
    res.total_duration_seconds = formatDuration(res.total_duration_seconds);
    res.total_distance_meters = formatDistance(res.total_distance_meters);
    todaySummaryData.value = res;
  });
}

const monthlyRecords = ref([]);
const selectedYear = ref(dayjs().year());
const options_events = computed(() => {
  const cy = dayjs().year();
  const arr = [];
  for (let i = 0; i < 5; i++) {
    arr.push(cy - i);
  }

  return [
    // { label: '全部设备累计里程', value: '' },
    ...(arr.map(y => ({ label: `${y}年累计里程`, value: y })))
  ]
});

function changeYear(y) {
  if (selectedYear.value === y) return;
  selectedYear.value = y;
  getMonthlyRecords();
}

const yearSummaryData = ref({});
function getMonthlyRecords() {
  const now = dayjs();
  const targetYear = selectedYear.value.value || now.year();
  const currentMonth = now.year() === targetYear ? now.month() + 1 : 12;
  const monthRanges = [];
  for (let m = 1; m <= 12; m++) {
    if (m > currentMonth) break;
    const start = dayjs(`${targetYear}-${m}-01`).startOf('month');
    const end = start.endOf('month');
    monthRanges.push({
      start_date: start.format('YYYY-MM-DD'),
      end_date: end.format('YYYY-MM-DD'),
      month: `${targetYear}年${m}月`,
    });
  }

  const mapList = monthRanges.map((range) => getRecords(range))
  Promise.all(mapList).then((res) => {
    // console.log("每月数据====>", res, getTypeSum(res, "raw_list_listPace"), getTypeSum(res, "total_records") );
    // 计算列表中距离之和
    const listMeters = (res || []).reduce((sum, i) => (sum + (parseFloat(i.raw_list_distance_meters) || 0)), 0);

    yearSummaryData.value = {
      total_distance_km: formatDistance(listMeters / 100), // 只显示数字部分
      total_distance_units: formatDistance(listMeters / 100).includes(' km') ? '公里' : '米',
      total_active_kilocalories: getTypeSum(res, "total_active_kilocalories"),
      total_records: getTypeSum(res, "total_records"),
      total_duration_time: formatDuration(getTypeSum(res, "total_duration_seconds")),
      total_listPace: getTypeSum(res, "raw_list_listPace") ? formatPace(getTypeSum(res, "raw_list_listPace") / getTypeSum(res, "total_records") / 100) : '--',
    };

    monthlyRecords.value = res.sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date))) // 按日期降序排序
  });
}

async function getRecords(range) {
  const params = {
    page: 1,
    page_size: 100,
    platform: selectedDevice.value.platform || '',
    ...range,
  };

  // console.log("请求参数====>", params.platform);

  if (params.platform === 'huawei') {
    params.data_type = 'outdoor_walking';
    params.activity_type = 'outdoor_walking';
  }

  if (params.platform === 'garmin') {
    params.data_type = 'activityDetails';
    params.activity_type = 'RUNNING';
  }

  const res =  await request.get("/sport-api/api/healthdata", params)
  const list = res.list || [];
  // 计算列表中距离之和
  const listMeters = list.reduce((sum, i) => (sum + (parseFloat(i.distance_in_meters) || 0) * 100), 0);
  const listPace = list.reduce((sum, i) => (sum + parseInt((parseFloat(i.average_pace) || 0) * 100)), 0);

  return {
    ...range,
    total_distance_km: formatDistance(getTypeSum(list, "distance_in_meters")),
    total_active_kilocalories: getTypeSum(list, "active_kilocalories"),
    total_duration_seconds: getTypeSum(list, "duration_in_seconds"),
    total_records: list.length,
    raw_list_distance_meters: listMeters,
    raw_list_listPace: listPace,
    records: list.map(item => ({
      ...item,
      distance_km: formatDistance(item.distance_in_meters),
      duration_in_time: formatDuration(item.duration_in_seconds),
    })),
  };
}

const isShowPicker_device = ref(false);
const selectedDevice = ref({});
function selectDevice(item) {
  // console.log("选择设备====>", item);
  isShowPicker_device.value = false;
  selectedDevice.value = item;

  getMonthlyRecords()
}

const deviceList = ref([]);
function getDevicesList() {
  request.get("/sport-api/api/platform/bindings").then((res) => {
    deviceList.value = (res.bindings || []).map((item) => {
      const imgMapping = {
        huawei:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/华为运动健康@2x.png",
        garmin:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/佳明@2x.png",
        gaochi:
          "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/高驰@2x.png",
      };

      let created_at = item.created_at?.replace("T", " ")?.slice(0, 16);

      return {
        ...item,
        imgUrl: imgMapping[item.platform] || "",
        name: item.display_name || item.platform,
        value: item.platform,
        created_at: created_at ? created_at + '绑定' : "",
      };
    }).filter(item => item.bound && item.platform !== 'honor');

    if (deviceList.value.length > 0) {
      selectDevice(deviceList.value[0]);
    }
  });
}

onLoad(() => {
  getDevicesList();
  getSoprtRecords();
});

const sports = ref([]);
const expandedIndex = ref(0);

const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index;
};
</script>

<style lang="scss" scoped>
::v-deep{
  .picker-cell{
    padding:0;
    width: auto !important;
    .u-cell__body{
      padding:0!important;
    }
    .u-cell__value{
      font-weight: 400;
      font-size: 34rpx;
      color: #000000;
      line-height: 48rpx;
    }
  }
}

.poster {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  border: 1px solid #f5f5f5;
  background: #fff;
}
.section-dashboard {
  min-height: 376rpx;
  margin: 44rpx auto 0 auto;
  padding: 30rpx 16rpx 0;
  background: linear-gradient(180deg, #feeed9 0%, #ffffff 100%);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  border: 2rpx solid #e7e7e7;
  .h1 {
    font-weight: 400;
    font-size: 34rpx;
    color: #000000;
    line-height: 48rpx;
  }
  .bar {
    width: 650rpx;
    height: 90rpx;
    margin: 20rpx 0 40rpx;
    background: #fff;
    padding-left: 30rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    font-size: 24rpx;
    .amount {
      font-weight: bold;
      font-size: 44rpx;
      margin-right: 10rpx;
    }
  }
}
.statics {
  font-size: 24rpx;
  line-height: 48rpx;
  padding-left: 12rpx;
}
.amount-number {
  color: #979797;
  font-size: 24rpx;
  .amount {
    font-weight: bold;
    font-size: 34rpx;
    margin-right: 4rpx;
    color: #000;
  }
}

.section-empty {
  height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 34rpx;
  color: #707070;
  line-height: 48rpx;
  .link {
    color: #ff8c00;
  }
}
.date-list {
  width: 100%;
  margin-top: 40rpx;
  // padding: -2rpx 0 -2rpx 0;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: #fff;
}
.date-item {
  border-bottom: 2rpx solid #e7e7e7;
  overflow: hidden;

  &.last-item {
    border-bottom: none;
  }

  .date-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 30rpx 26rpx;
    cursor: pointer;

    .date-title {
      font-weight: 400;
      font-size: 30rpx;
      color: #000000;
      line-height: 42rpx;
      flex: 1;
    }

    .amount-number {
      flex-shrink: 0;
    }

    .date-icon {
      flex-shrink: 0;
      transition: transform 0.3s;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .date-content {
    margin: 0 42rpx;
    padding: 30rpx 0;
    border-top: 2rpx solid #e7e7e7;
  }
}
</style>
