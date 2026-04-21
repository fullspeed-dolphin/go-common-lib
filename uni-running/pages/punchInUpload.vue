<template>
  <view class="page">
    <!-- 导航栏白色背景 -->
    <view class="nav-bg" :style="{ height: navSpacerHeight + 'px' }"></view>

    <!-- 左上角 Tab 切换 -->
    <view class="nav-tabs" :style="{ top: navTop + 'px', height: navHeight + 'px' }">
      <view v-for="item in tabList" :key="item.key"
        :class="['tab', activeTab === item.key ? 'tab--active' : 'tab--inactive']"
        @click="switchTab(item.key)">
        <text :class="['tab__text', activeTab === item.key ? 'tab__text--active' : 'tab__text--inactive']">{{ item.label }}</text>
        <view v-if="activeTab === item.key" class="tab__line"></view>
      </view>
    </view>

    <!-- 占位高度 -->
    <view :style="{ height: navSpacerHeight + 'px' }"></view>

    <!-- ===== 截图打卡 Tab ===== -->
    <view v-show="activeTab === 'screenshot'">

    <block v-if="pageIndex === 0 || !ruleForm.picture">
      <section class="u-pl-30 u-pt-40" style="margin-bottom: 140rpx;">
        <view class="u-flex-y-center" style="font-weight: 800;font-size: 48rpx;">
          <view class="iconfont icon-pulse-fill" style="color:#FF8C00;font-size: 48rpx;margin-right: 18rpx;"></view>
          全速运动
        </view>
        <view class="u-mt-20" style="color: #6A7282;">记录每一次汗水，赢取跑币奖励</view>

        <div class="u-flex-row u-flex-wrap">
          <view class="event-item" :class="{ 'active': item.checked }" :style="item.checked && item.gradient ? { background: `linear-gradient(90deg, ${item.gradient[0]}, ${item.gradient[1]})`, borderColor: item.gradient[0], color: '#fff' } : item.gradient ? { borderColor: item.gradient[0], color: item.gradient[0] } : {}" @click="selectEvent(item)" v-for="(item,index) in options_events_screenshot" :key="index">
            {{item.label}}
          </view>
        </div>
      </section>
    </block>

    <section class="flex-center" :style="isSuccess ? 'margin-top: 30rpx;' : 'margin-top: 80rpx;'" @click="checkBeforeUpload">
      <view :class="isSuccess ? 'upload-wrapper-confirm' : 'upload-wrapper'">
        <FileUpload v-model="ruleForm.picture" additional="ocr-checkin" isCustom :readonly="!hasCheckedEvent" :width="isSuccess ? 500 : 448" :height="isSuccess ? 750 : 600" @change="onImageUploaded">
          <template #trigger>
            <view class="section-upload flex-col-center" style="color: #99A1AF;line-height: 1.3;">
              <view class="iconfont flex-center icon-shangchuan"></view>
              <view style="font-size: 34rpx;font-weight: 500; color:#000;margin-bottom:20rpx;">上传运动截图</view>
              <view>支持主流运动</view>
              <view>APP截图自动</view>
              <view>识别数据</view>
            </view>
          </template>
        </FileUpload>
      </view>
    </section>

    <!-- 底部信息区 -->
    <view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="bottom-info-content">
      <view @click="$u.route('pagesSport/punchInRule?type=rule')" style="color:#777;font-size: 24rpx;position: fixed;right:0;top: 220rpx;background: #ddd;padding: 10rpx 20rpx; border-radius: 32rpx 0 0 32rpx;"
        class="rule-link flex-center">
        打卡规则
      </view>
      <view class="" style="font-size: 24rpx;color: #E53935;margin-top: 90rpx;padding-left:34rpx; line-height: 34rpx;text-align: left;">
        <view>1. 每日打卡即可获跑币，每日上限 100 个跑币(1km=10 跑币)。</view>
        <view>2. 截图需清晰显示时间+类型+数据(跑步/健走≥1km)。 </view>
        <view>3. 当日运动当日23:59前通过小程序上传，逾期无效。 </view>
        <view>4. 盗用/篡改截图将取消权益并记录违规。</view>
        <view>5. 不提供非技术原因补录历史数据的服务。</view>
      </view>
      <view class="tac" style="font-size: 16rpx;color: #99A1AF;margin-top: 40rpx;">
        <text style="color: #E53935;">安全提示：</text> 身体健康者参与，不适即停，风险自担； 选安全场地，避恶劣天气。
      </view>
    </view>

    <!-- 底部固定文字 -->
    <view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="powered-by-fixed">由全速科技AI平台强势驱动</view>

    <section v-if="isSubmiting" class="section-loading flex-center">
      <view class="panel1 bgf flex-col-center">
        <view style="margin-bottom: 40rpx; ">
          <up-loading-icon mode="circle" color="#FF8C00" textSize="40"></up-loading-icon>
        </view>
        <view style="font-weight: 600;font-size: 34rpx;margin-bottom: 30rpx;">系统正在识别</view>
        <view style="color: #6C7484;">智能提取数据中，请不要离开页面...</view>
      </view>
    </section>

    <block v-if="pageIndex === 1 && ruleForm.picture && exerciseInfo.distance">
      <section class="form-fields-confirm">
        <view style="font-weight: 800;font-size: 32rpx;">
          <up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
          识别结果
        </view>
        <view class="u-flex-row">
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #EFF6FF;">
              <up-icon name="map" size="40rpx" color="#2B7FFF" />
            </view>
            <view class="value">{{exerciseInfo.distance || 0}}</view>
            <text class="label-text">距离(KM)</text>
          </view>
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #FFF7ED;">
              <view class="iconfont icon-jishiqi" style="color:#FF8C00"></view>
            </view>
            <view class="value">{{exerciseInfo.duration || 0}}</view>
            <text class="label-text">时长</text>
          </view>
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #FAF5FF;">
              <view class="iconfont icon-shandianshandianfahuotuikuan" style="color:#AF4BFF"></view>
            </view>
            <view class="value">{{ formatPace(exerciseInfo.pace) }}</view>
            <text class="label-text">配速</text>
          </view>
        </view>
      </section>
      <view class="flex-center" style="color:#99A1AF;margin-top:30rpx;font-size: 24rpx;">
        请核对上方数据是否与截图一致
      </view>
      <view class="fixed-above-tabbar">
        <u-button type="primary" custom-style="width:642rpx;" color="#ff8c00" shape="circle" :loading="isChecking" :disabled="isChecking" @click="confirmToCheck()">提交数据</u-button>
      </view>
    </block>

    </view>
    <!-- ===== /截图打卡 Tab ===== -->

    <!-- ===== 设备打卡 Tab ===== -->
    <view v-show="activeTab === 'device'">
      <!-- 品牌区 + 活动标签（仅在有记录时显示，结构与截图Tab一致） -->
      <section v-if="hasDeviceBinding && deviceRecords.length > 0 && !deviceLoading" class="u-pl-30 u-pt-40">
        <view class="u-flex-y-center" style="font-weight: 800;font-size: 48rpx;">
          <view class="iconfont icon-pulse-fill" style="color:#FF8C00;font-size: 48rpx;margin-right: 18rpx;"></view>
          全速运动
        </view>
        <view class="u-mt-20" style="color: #6A7282;">记录每一次汗水，赢取跑币奖励</view>

        <div class="u-flex-row u-flex-wrap">
          <view class="event-item" :class="{ 'active': item.checked }"
            :style="item.checked && item.gradient ? { background: `linear-gradient(90deg, ${item.gradient[0]}, ${item.gradient[1]})`, borderColor: item.gradient[0], color: '#fff' } : item.gradient ? { borderColor: item.gradient[0], color: item.gradient[0] } : {}"
            @click="toggleDeviceEvent(item)" v-for="(item,index) in options_events_device" :key="index">
            {{item.label}}
          </view>
        </div>
      </section>

      <!-- 加载中 -->
      <view v-if="deviceLoading" class="device-empty flex-col-center" style="margin-top: 200rpx;">
        <up-loading-icon mode="circle" color="#FF8C00"></up-loading-icon>
        <view style="color: #99A1AF; margin-top: 20rpx; font-size: 28rpx;">加载中...</view>
      </view>

      <!-- 未绑定设备 -->
      <view v-else-if="!hasDeviceBinding" class="device-empty flex-col-center">
        <view class="iconfont icon-device-empty" style="font-size: 120rpx; color: #D1D5DC; margin-bottom: 30rpx;"></view>
        <view style="font-size: 32rpx; font-weight: 600; color: #1A1A1A; margin-bottom: 16rpx;">还没有绑定运动设备</view>
        <view style="font-size: 26rpx; color: #99A1AF; margin-bottom: 50rpx;">绑定后可自动同步运动数据</view>
        <u-button type="primary" color="#FF8C00" shape="circle" custom-style="width: 320rpx;" @click="$u.route('/pagesSub/device/deviceList')">去绑定设备</u-button>
      </view>

      <!-- 已绑定但今日无记录 -->
      <view v-else-if="deviceRecords.length === 0" class="device-empty flex-col-center">
        <view style="font-size: 120rpx; margin-bottom: 30rpx;">🏃</view>
        <view style="font-size: 32rpx; font-weight: 600; color: #1A1A1A; margin-bottom: 16rpx;">今日暂无运动记录</view>
        <view style="font-size: 26rpx; color: #99A1AF;">去运动吧！</view>
      </view>

      <!-- 设备记录列表 -->
      <view v-else class="device-list">
        <view class="device-card" :class="{ 'device-card--disabled': item.already_checked_in }" v-for="item in deviceRecords" :key="item.record_id">
          <view class="device-card__header">
            <view class="device-card__type">
              <text>{{ item.activity_name || '跑步' }}</text>
            </view>
            <view class="device-card__platform">{{ item.platform_display }}</view>
          </view>
          <view class="device-card__distance">{{ item.km }} km</view>
          <view class="device-card__meta">
            <view class="device-card__meta-item">
              <text class="device-card__meta-label">时长</text>
              <text class="device-card__meta-value">{{ item.time }}</text>
            </view>
            <view class="device-card__meta-item">
              <text class="device-card__meta-label">配速</text>
              <text class="device-card__meta-value">{{ formatPace(item.speed) }}</text>
            </view>
          </view>
          <view class="device-card__time">开始于 {{ formatStartTime(item.record_time) }}</view>

          <view v-if="!item.already_checked_in && recordWarnings(item).length" class="device-card__warnings">
            <view v-for="w in recordWarnings(item)" :key="w.event_id" class="device-card__warning-item">
              <view class="device-card__warning-dot"></view>
              <text class="device-card__warning-text">{{ w.label }}：{{ w.reason }}</text>
            </view>
          </view>

          <u-button v-if="item.already_checked_in" type="info" shape="circle" disabled custom-style="margin-top: 24rpx;">
            已打卡
          </u-button>
          <u-button v-else-if="recordWarnings(item).length" type="info" shape="circle" disabled custom-style="margin-top: 24rpx;">
            暂无法打卡
          </u-button>
          <u-button v-else type="primary" color="#FF8C00" shape="circle" :loading="deviceCheckinLoading[item.record_id]" :disabled="deviceCheckinLoading[item.record_id]" custom-style="margin-top: 24rpx;" @click="doDeviceCheckin(item)">
            打 卡
          </u-button>
        </view>
      </view>
    </view>

    <view v-if="isSuccessCheck" class="check flex-center b" style="width: 344rpx;
				height: 96rpx; position: fixed; left: 50%;top: 50%; transform: translate(-50%, -50%);
				background: #404040; color: #fff;font-size: 32rpx;
				border-radius: 46rpx 46rpx 46rpx 46rpx;">
      <up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
      <view class="u-ml-10">后台核验成功</view>
    </view>

    <SharePoster ref="refSharePoster" @close="onPosterClose" />

    <!-- 固定联系客服按钮 -->
    <button class="kefu-btn" open-type="contact">
      <view class="iconfont icon-kefu"></view>
      <view class="kefu-label">客服</view>
    </button>

    <up-modal :show="isShowModal" open-type="contact" :title="modalTitle" :content="modalErrorText" cancelText="联系客服" confirmText="知道了" contentTextAlign="center" cancelColor="rgb(41, 121, 255)" confirmColor="#ff8c00"
      @confirm="onModalConfirm" showCancelButton :asyncClose="true" />

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />

    <Tabbar type="punchInUpload" />
  </view>
</template>
<script setup>
import { ref, computed, nextTick } from "vue";
import { onLoad, onUnload, onShow, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import FileUpload from "@/components/common/FileUpload.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import UserLogin from "@/components/UserLogin.vue";
import AccessUser from "@/components/common/AccessUser.vue";
import SharePoster from "@/components/SharePoster/SharePoster.vue";
import request from "@/utils/request";
import Tabbar from "@/components/tabBar.vue";
import { baseLink, uploadToken } from "@/utils/config";
import { formatPace } from "@/utils/format.js";
import { useShare } from "@/composables/useShare.js";
import dayjs from "dayjs";
import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);

// ===== 导航栏定位（与胶囊按钮对齐）=====
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
const menuBtn = uni?.getMenuButtonBoundingClientRect?.() || {};
const navTop = menuBtn.top || (statusBarHeight + 6);
const navHeight = menuBtn.height || 32;
const navSpacerHeight = navTop + navHeight + 8;

// ===== Tab 切换 =====
const activeTab = ref('screenshot');

// 绑定设备的人优先看到设备打卡
const tabList = computed(() => {
  const screenshot = { key: 'screenshot', label: '截图打卡' };
  const device = { key: 'device', label: '设备打卡' };
  return hasDeviceBinding.value ? [device, screenshot] : [screenshot, device];
});

function switchTab(key) {
  activeTab.value = key;
  if (key === 'device' && !deviceTabInited.value) {
    fetchDeviceData();
  }
}

// 按手机本地时区展示运动开始时间（忽略上游的时区偏移标记）
function formatStartTime(s) {
  if (!s) return '';
  return dayjs(s).format('M月D日 HH:mm');
}

// 获取设备绑定状态和今日记录
// silent: onLoad 自动探测时用，未登录或失败都不弹 UI
async function fetchDeviceData(silent = false) {
  if (!userInfo.value.id) {
    if (silent) return;
    loginCallBack.value = () => {
      activeTab.value = 'device';
      fetchDeviceData();
    };
    nextTick(() => {
      refUserLogin.value.open();
    });
    return;
  }

  deviceLoading.value = true;
  try {
    // 1. 检查是否绑定了设备
    const bindRes = await request.get("/sport-api/api/platform/bindings", {}, { showError: false });
    const bindings = (bindRes?.bindings || []).filter((b) => b.platform !== 'honor');
    hasDeviceBinding.value = bindings.length > 0;

    if (!hasDeviceBinding.value) {
      return;
    }

    // 2. 获取今日可打卡的设备记录
    const records = await request.get("/sport-api/api/checkin/device-records", {}, { showError: false });
    deviceRecords.value = records || [];
    lastDeviceFetchTime.value = Date.now();

    // 3. 对拉到的记录并发跑预检（不阻塞主流程；失败也不影响数据展示）
    runValidation(deviceRecords.value);
  } catch (error) {
    console.error("获取设备数据失败:", error);
    if (!silent) uni.showToast({ title: "获取设备数据失败", icon: "none" });
  } finally {
    deviceTabInited.value = true;
    deviceLoading.value = false;
  }
}

// 对一组设备记录 × 当前勾选的活动做预检，结果写入 validateMap
// 并发发送 N 个请求（N 通常 1-3 条），最慢一个决定整体等待时长
async function runValidation(records) {
  if (!records || !records.length) {
    validateMap.value = {};
    return;
  }
  if (!userInfo.value.id) return;

  const selectedIds = options_events_device.value
    .filter((i) => i.checked)
    .map((i) => i.value);
  if (!selectedIds.length) {
    validateMap.value = {};
    return;
  }

  try {
    const results = await Promise.all(
      records.map((r) =>
        request.post(
          "/ocr-api/validate-checkin",
          { event_ids: selectedIds, km: r.km, speed: r.speed },
          { showError: false },
        ).catch((err) => {
          console.error("预检失败 record_id=", r.record_id, err);
          return null;
        }),
      ),
    );

    const next = {};
    records.forEach((r, idx) => {
      const arr = Array.isArray(results[idx]) ? results[idx] : [];
      const byEvent = {};
      arr.forEach((item) => {
        byEvent[item.event_id] = item;
      });
      next[r.record_id] = byEvent;
    });
    validateMap.value = next;
  } catch (e) {
    console.error("批量预检异常:", e);
  }
}

// 切换设备 tab 的活动勾选：翻转 checked + 重跑预检（只对已有 records，不重拉）
function toggleDeviceEvent(item) {
  item.checked = !item.checked;
  runValidation(deviceRecords.value);
}

// 查询某条 record 在当前勾选活动里有几个不通过，返回 [{event_id, reason, label}]
function recordWarnings(record) {
  const byEvent = validateMap.value[record.record_id];
  if (!byEvent) return [];
  const result = [];
  for (const item of options_events_device.value) {
    if (!item.checked || item.value === "default") continue;
    const r = byEvent[item.value];
    if (r && !r.ok) {
      result.push({ event_id: item.value, reason: r.reason, label: item.label });
    }
  }
  return result;
}

// 设备数据打卡
function doDeviceCheckin(item) {
  const checkedEvents = options_events_device.value.filter((i) => i.checked);
  if (checkedEvents.length === 0) {
    return uni.showToast({ title: "请至少选择一个活动", icon: "none" });
  }

  deviceCheckinLoading.value = { ...deviceCheckinLoading.value, [item.record_id]: true };

  request
    .post(
      "/ocr-api/device-checkin",
      {
        record_id: item.record_id,
        event_ids: checkedEvents.map((i) => i.value),
      },
      { showError: false, includeResponse: true }
    )
    .then((res) => {
      // 标记已打卡
      item.already_checked_in = true;

      // 显示核验成功浮层
      isSuccessCheck.value = true;

      // 提取跑币数量
      function extractNumbers(str) {
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number)?.[0] : "";
      }

      // 合并打卡次数
      const checkinCounts = {};
      res.data.events?.forEach((e) => {
        if (e.checkin_count != null) checkinCounts[e.id] = e.checkin_count;
      });
      res.data.results?.forEach((r) => {
        if (r.checkin_count != null) checkinCounts[r.event_id] = r.checkin_count;
      });

      // 只为成功的活动生成海报
      const successEventIds = (res.data.results || [])
        .filter((r) => r.success)
        .map((r) => r.event_id);

      if (successEventIds.length) {
        refSharePoster.value.open({
          ...userInfo.value,
          distance: parseFloat(res.data.km),
          duration: res.data.time,
          pace: res.data.speed,
          coinAmount: extractNumbers(res?.msg || ""),
          coinAmountMsg: res?.msg,
          checkinCounts,
          checkinTime: dayjs().format("YYYY年MM月DD日 HH:mm"),
          eventIds: successEventIds,
          events: res.data.events || [],
        });
      } else {
        // 无成功活动时，2秒后自动清除核验成功浮层
        setTimeout(() => { isSuccessCheck.value = false; }, 2000);
      }
    })
    .catch((err) => {
      console.error("设备打卡失败:", err);
      showModal({
        title: "打卡失败",
        content: err?.msg || "请稍后重试",
      });
    })
    .finally(() => {
      deviceCheckinLoading.value = { ...deviceCheckinLoading.value, [item.record_id]: false };
    });
}

const refUserLogin = ref(null);

// 授权登录后的回调，用户授权后的跳转
const loginCallBack = ref(null);
function onLoginSuccess() {
	setTimeout(() => {
		loginCallBack?.value?.();
	}, 500);
}

// 分享配置
useShare({
  title: "运动打卡",
  path: "/pages/punchInUpload",
});

const refSharePoster = ref(null);

const routerParams = ref({});
const options_events_screenshot = ref([]);
const options_events_device = ref([]);

// ===== 设备打卡状态 =====
const deviceRecords = ref([]);
const deviceLoading = ref(false);
const hasDeviceBinding = ref(false);
const deviceTabInited = ref(false);
const deviceCheckinLoading = ref({});
// 预检结果：record_id -> { event_id: { ok, reason } }
const validateMap = ref({});
// 上次拉 device-records 的时间戳，用于 onShow 节流（60s 内不重拉）
const lastDeviceFetchTime = ref(0);

const myEvents = ref([]);
function getMyEvents() {
	if (!userInfo.value.id) {
		loginCallBack.value = getMyEvents;
    
		nextTick(() => {
			refUserLogin.value.open();
		})
		
		return
  }

  request.get("/event-api/online_events/my_events", {}, { showError: false }).then((res) => {
    const now = dayjs();
    let activeEvents = (res || []).filter((i) => {
      return now.isAfter(dayjs(i.start_time)) && now.isBefore(dayjs(i.end_time));
    });

    const buildEventList = () => [
      ...activeEvents.map((i) => ({
        label: i.event_name,
        value: i.event_id,
        gradient: i.color_config?.gradient || null,
        checked: true,
      })),
      {
        label: "打卡送跑币",
        value: "default",
        checked: true,
      },
    ];

    options_events_screenshot.value = buildEventList();
    options_events_device.value = buildEventList();
  });
}

function selectEvent(item) {
  item.checked = !item.checked;
}

const hasCheckedEvent = computed(() =>
  options_events_screenshot.value.some((i) => i.checked)
);

function checkBeforeUpload() {
  if (!userInfo.value.id) {
		loginCallBack.value = getMyEvents;
    return refUserLogin.value.open();
  }
}

const pageIndex = ref(0);

const exerciseInfo = ref({
  distance: "",
  duration: "",
  pace: "",
});

const isSubmiting = ref(false);
const isSuccess = ref(false);
const isSuccessCheck = ref(false);
const isSubmitted = ref(false); // 标记用户是否已提交数据
const isChecking = ref(false); // 提交打卡中，防止重复点击

// 删除已上传的图片
const deleteUploadedImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    await new Promise((resolve, reject) => {
      uni.request({
        url: baseLink + "/basic-service/file/delete",
        method: "POST",
        header: {
          "X-API-KEY": uploadToken,
          "content-type": "application/json",
        },
        data: { url: imageUrl },
        success: () => resolve(),
        fail: (e) => reject(e),
      });
    });
    console.log("已删除上传的图片:", imageUrl);
  } catch (error) {
    console.error("删除图片失败:", error);
  }
};

onLoad(async (options) => {
  routerParams.value = options;
  getMyEvents();
  // 已登录时静默探测设备绑定，有绑定则默认切到设备打卡 tab
  if (userInfo.value.id) {
    await fetchDeviceData(true);
    if (hasDeviceBinding.value) {
      activeTab.value = 'device';
    }
  }
});

onShow(() => {
  // 上次已打完卡（海报可能被系统直接关掉，没走 onPosterClose）再回到本页时，重置回初始上传界面
  if (isSubmitted.value) {
    resetScreenshotTab();
  }
  // 距上次拉取超过 60s 才重拉（避免频繁切后台 → 回前台时反复请求）
  if (activeTab.value === 'device' && deviceTabInited.value) {
    const elapsed = Date.now() - lastDeviceFetchTime.value;
    if (elapsed > 60000) {
      deviceTabInited.value = false;
      fetchDeviceData();
    }
  }
});

// 页面卸载时检查是否需要删除图片
onUnload(() => {
  // 如果有上传的图片且用户没有提交数据，则删除图片
  if (ruleForm.value.picture && !isSubmitted.value) {
    deleteUploadedImage(ruleForm.value.picture);
  }
});

const isShowModal = ref(false);
const modalTitle = ref("");
const modalErrorText = ref("");
function showModal({ title, content }) {
  modalTitle.value = title || "提示";
  modalErrorText.value = content || "请稍后重试";
  isShowModal.value = true;
}

function onModalConfirm() {
  isShowModal.value = false;
  if (activeTab.value === 'device') {
    // 设备 Tab 留在当前页面
  } else {
    uni.navigateBack();
  }
}

// 重置截图打卡 Tab 到初始上传界面（用于关海报后、再次进入页面时）
function resetScreenshotTab() {
  isSuccess.value = false;
  isSubmitted.value = false;
  isSuccessCheck.value = false;
  isChecking.value = false;
  pageIndex.value = 0;
  ruleForm.value.picture = "";
  exerciseInfo.value = { distance: "", duration: "", pace: "" };
  verifyToken = "";
}

function onPosterClose() {
  isSuccessCheck.value = false;
  if (activeTab.value === 'screenshot') {
    resetScreenshotTab();
  }
}

// 图片上传成功后调用OCR识别
let verifyToken = "";
const onImageUploaded = async (imageUrl) => {
  if (!imageUrl) return;

  // 重置状态，确保加载时背景显示上传界面
  isSuccess.value = false;
  pageIndex.value = 0;

  try {
    isSubmiting.value = true;

    let res = await request.post(
      "/ocr-api/recognize",
      {
        image_url: imageUrl,
      },
      { showError: false, includeResponse: true }
    );

    const dataInfo = res?.data;
    // 校验返回数据是否有效（不为空、不为0）
    const isValidData =
      dataInfo &&
      dataInfo.km &&
      dataInfo.km !== "0" &&
      dataInfo.km !== "0.00" &&
      dataInfo.time &&
      dataInfo.time !== "00:00" &&
      dataInfo.time !== "00:00:00" &&
      dataInfo.speed;

    if (isValidData) {
      verifyToken = dataInfo.token;

      // 将识别结果填入
      exerciseInfo.value.distance = dataInfo.km;
      exerciseInfo.value.duration = dataInfo.time;
      exerciseInfo.value.pace = dataInfo.speed;

      isSuccess.value = true;
      // uni.showModal({
      // 	title: '打卡成功',
      // 	content: res?.msg || '打卡成功',
      // 	showCancel: false,
      // 	success: () => {
      // 		uni.redirectTo({
      // 			url: '/pagesSub/runCoin/myCoin'
      // 		});
      // 	}
      // });
    } else {
      // 识别失败，删除已上传的图片
      deleteUploadedImage(imageUrl);
      ruleForm.value.picture = "";
      isSuccess.value = false;
      showModal({
        title: "识别失败",
        content:
          res?.msg || "无法识别截图中的运动数据，请确保上传的是有效的运动截图",
      });
    }
  } catch (error) {
    isSuccess.value = false;
    // 识别失败，删除已上传的图片
    deleteUploadedImage(imageUrl);
    ruleForm.value.picture = "";

    uni.hideLoading();
    console.error("OCR识别失败:", error);
    showModal({
      title: "识别失败",
      content: error?.msg || error?.message || "识别服务异常，请稍后重试",
    });
  }

  isSubmiting.value = false;
  pageIndex.value = 1;
};

const ruleForm = ref({
  picture: "",
});

function confirmToCheck() {
  if (isChecking.value) return;
  isChecking.value = true;
  request
    .post(
      "/ocr-api/checkin",
      {
        token: verifyToken,
        event_ids: options_events_screenshot.value
          .filter((i) => i.checked)
          .map((i) => i.value),
      },
      { showError: false, includeResponse: true }
    )
    .then((res) => {
      // 标记已提交，防止页面卸载时删除图片
      isSubmitted.value = true;
      // 显示"后台核验成功"弹窗
      isSuccessCheck.value = true;
      isChecking.value = false;

      uni.setStorageSync("punchInUploadResult", res);

      function extractNumbers(str) {
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number)?.[0] : "";
      }

      // 从 events(.id) 和 results(.event_id) 合并打卡次数
      const checkinCounts = {};
      res.data.events?.forEach((e) => {
        if (e.checkin_count != null) checkinCounts[e.id] = e.checkin_count;
      });
      res.data.results?.forEach((r) => {
        if (r.checkin_count != null)
          checkinCounts[r.event_id] = r.checkin_count;
      });

      // 只为 results 中 success === true 的活动生成海报
      const successEventIds = (res.data.results || [])
        .filter((r) => r.success)
        .map((r) => r.event_id);

      if (successEventIds.length) {
        refSharePoster.value.open({
          ...userInfo.value,
          distance: parseFloat(res.data.km),
          duration: res.data.time,
          pace: res.data.speed,
          coinAmount: extractNumbers(res?.msg || ""),
          coinAmountMsg: res?.msg,
          checkinCounts,
          checkinTime: dayjs().format("YYYY年MM月DD日 HH:mm"),
          eventIds: successEventIds,
          events: res.data.events || [],
        });
      }

      // 2秒后隐藏弹窗并跳转
      // setTimeout(() => {
      // 	isSuccessCheck.value = false
      // 	uni.$u.route('pagesSport/recognizeSuccess', res)
      // }, 2000)
    })
    .catch((err) => {
      console.log("err======>", err);
      isChecking.value = false;
      showModal({
        title: "打卡失败",
        content: err?.msg || "请稍后重试",
      });
    });
}
</script>

<style lang="scss" scoped>
$primary: #FF8C00;
$c1: #1A1A1A;
$c3: #9CA3AF;

.page {
  min-height: 100vh;
}

.nav-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 90;
}

.nav-tabs {
  position: fixed;
  left: 0;
  padding-left: 32rpx;
  z-index: 91;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;

  &--active { gap: 6rpx; }
  &--inactive { justify-content: center; }

  &__text--active {
    font-size: 40rpx;
    font-weight: 700;
    color: $c1;
  }

  &__text--inactive {
    font-size: 32rpx;
    font-weight: 500;
    color: $c3;
  }

  &__line {
    width: 48rpx;
    height: 6rpx;
    background: $primary;
    border-radius: 4rpx;
  }
}

.event-item {
  padding: 15rpx 20rpx;
  border: 1px solid #ff8c00;
  border-radius: 32rpx;
  margin: 20rpx 20rpx 0 0;
  color: #ff8c00;
  font-size: 24rpx;
  &.active {
    background: #ff8c00;
    color: #fff;
  }
}
.section-loading {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  .panel1 {
    width: 606rpx;
    height: 404rpx;
    background: #ffffff;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
  }
}

.form-fields {
  width: 686rpx;
  height: 412rpx;
  padding: 50rpx;
  margin-top: 48rpx;
  margin: 48rpx auto 0;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx solid #f3f4f6;
}

.cell-item {
  font-weight: bold;
  margin-top: 40rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
  border-right: 2rpx solid #f3f4f6;
  &:last-child {
    border: 0;
  }
  .label {
    width: 80rpx;
    height: 80rpx;
    font-size: 40rpx;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
  }
  .label-text {
    font-size: 24rpx;
    color: #6a7282;
  }

  .value {
    width: 206rpx;
    height: 44rpx;
    margin-top: 30rpx;
    margin-bottom: 20rpx;
    font-weight: 800;
    font-size: 44rpx;
    text-align: center;
  }
}

/* 固定联系客服按钮 */
.kefu-btn {
  position: fixed;
  right: 24rpx;
  top: 1060rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: #18b566;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 10;
  box-shadow: 0 6rpx 18rpx rgba(24, 181, 102, 0.25);
  line-height: 1;
  .icon-kefu {
    font-size: 38rpx;
  }
  .kefu-label {
    font-size: 16rpx;
    color: #fff;
    margin-top: 6rpx;
  }
}

::v-deep {
  .sharePoster{
      .u-popup__content__close{
        left: 50rpx!important;
        top: 150rpx!important;
        right: auto!important;
      }
  }

  .uicon-arrow-right {
    color: #ff8c00 !important;
  }
  .upload-wrapper {
    .uicon-checkmark-circle {
      font-weight: 800;
    }
    .iconfont {
      width: 160rpx;
      height: 160rpx;
      color: #ff8c00;
      font-size: 52rpx;
      background: #f8eee0;
      margin-bottom: 40rpx;
      border-radius: 64rpx 64rpx 64rpx 64rpx;
    }
    .u-upload {
      width: 448rpx !important;
      height: 600rpx !important;
    }

    .u-upload__wrap {
      width: 448rpx !important;
      height: 600rpx !important;
    }

    .custom-preview {
      border: 2rpx solid #ff8c00;
      border-radius: 16rpx;
      background: #f5f5f5;
    }

    .u-upload__wrap__preview__image {
      width: 448rpx !important;
      height: 600rpx !important;
      border-radius: 16rpx;
      border: 2rpx solid #ff8c00;
    }
  }

  .upload-wrapper-confirm {
    .custom-preview {
      border: 2rpx solid #ff8c00;
      border-radius: 16rpx;
      background: #f5f5f5;
    }
  }

  .section-upload {
    width: 448rpx;
    height: 600rpx;
    border-radius: 36rpx;
    border: 10rpx dashed #d1d5dc;
    line-height: 40rpx;

    .icon {
      margin-bottom: 42rpx;
    }

    .u-icon__icon {
      color: #ff8c00;
    }
  }
}

.form-fields-confirm {
  width: 686rpx;
  padding: 20rpx 50rpx;
  margin: 20rpx auto 0;
  border-radius: 32rpx;
  border: 2rpx solid #f3f4f6;

  .cell-item {
    margin-top: 20rpx;
    .value {
      margin-top: 15rpx;
      margin-bottom: 10rpx;
    }
  }
}

.bottom-info-content {
  text-align: center;
  padding: 40rpx 0 30rpx;

  .rule-link {
    color: rgba(255, 140, 0, 0.75);
    font-size: 28rpx;
    line-height: 40rpx;
    padding: 10rpx 0;
  }
}

.powered-by-fixed {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 140, 0, 0.75);
  font-size: 28rpx;
}

.device-empty {
  margin-top: 200rpx;
  padding: 0 60rpx;
}

.device-list {
  padding: 30rpx;
}

.device-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #F3F4F6;

  &--disabled {
    opacity: 0.55;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__type {
    font-size: 30rpx;
    font-weight: 600;
    color: #1A1A1A;
  }

  &__platform {
    font-size: 24rpx;
    color: #99A1AF;
    background: #F3F4F6;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
  }

  &__distance {
    font-size: 56rpx;
    font-weight: 800;
    color: #1A1A1A;
    margin-bottom: 16rpx;
  }

  &__meta {
    display: flex;
    gap: 48rpx;
    margin-bottom: 16rpx;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  &__meta-label {
    font-size: 22rpx;
    color: #99A1AF;
    line-height: 1;
  }

  &__meta-value {
    font-size: 30rpx;
    font-weight: 600;
    color: #1A1A1A;
    line-height: 1;
  }

  &__time {
    font-size: 24rpx;
    color: #99A1AF;
    margin-top: 4rpx;
  }

  &__warnings {
    margin-top: 20rpx;
    padding: 18rpx 20rpx;
    background: #FEF3E7;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  &__warning-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
  }

  &__warning-dot {
    width: 10rpx;
    height: 10rpx;
    margin-top: 12rpx;
    border-radius: 50%;
    background: #FF8C00;
    flex: none;
  }

  &__warning-text {
    font-size: 24rpx;
    color: #92400E;
    line-height: 1.5;
  }
}
</style>
