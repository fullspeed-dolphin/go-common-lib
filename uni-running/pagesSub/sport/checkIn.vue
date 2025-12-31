<template>
  <view class="page">
    <u-navbar title="运动打卡记录" placeholder />

    <view class="content">
      <!-- 日历模块 -->
      <view class="calendar-section">
        <view class="calendar-header">
          <text class="calendar-title">日历</text>
          <view class="month-nav">
            <u-icon
              name="arrow-left"
              size="16"
              color="#000"
              @click="prevMonth"
            ></u-icon>
            <text class="month-text"
              >{{ currentYear }}年 {{ formatMonth(currentMonth) }}</text
            >
            <u-icon
              name="arrow-right"
              size="16"
              color="#000"
              @click="nextMonth"
            ></u-icon>
          </view>
        </view>

        <view class="calendar-weekdays">
          <view class="weekday" v-for="day in weekdays" :key="day">{{
            day
          }}</view>
        </view>

        <view class="calendar-days">
          <view
            class="calendar-day"
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="{
              'other-month': day.otherMonth,
              'has-checkin': day.hasCheckin,
              'today': day.isToday,
              'selected': day.fullDate === selectedDate,
            }"
            @click="handleDayClick(day)"
          >
            <text class="day-number">{{ day.date }}</text>
            <view v-if="day.hasCheckin" class="checkin-dot"></view>
          </view>
        </view>
      </view>

      <!-- 运动数据 -->
      <view class="sport-data-section" v-if="sportData.distance || sportData.duration || sportData.pace">
        <view class="sport-data-title">{{ selectedDate }} 运动数据</view>
        <view class="sport-data-list">
          <view class="sport-data-item">
            <view class="sport-data-value">{{ sportData.distance || '--' }}</view>
            <view class="sport-data-label">公里数(KM)</view>
          </view>
          <view class="sport-data-item">
            <view class="sport-data-value">{{ sportData.duration || '--' }}</view>
            <view class="sport-data-label">时间</view>
          </view>
          <view class="sport-data-item">
            <view class="sport-data-value">{{ sportData.pace || '--' }}</view>
            <view class="sport-data-label">配速</view>
          </view>
        </view>
      </view>

      <!-- 任务模块 -->
      <view class="task-section">
        <view class="task-title">赚得跑币</view>
        <view class="task-list">
          <view class="task-item">
            <view class="task-icon-wrapper">
              <image
                class="task-icon"
                :src="taskList[0].icon"
                mode="aspectFill"
              ></image>
            </view>
            <view class="task-content">
              <view class="task-coming-soon">全速体育即将推出的打卡送跑币功能，敬请期待</view>
            </view>
            <view class="task-reward">
              <image
                class="reward-icon"
                src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-coin-check-in@2x.png"
                mode="aspectFill"
              ></image>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { staticBaseUrl } from "@/utils/config";
import request from "@/utils/request.js";
import dayjs from "dayjs";

// 日历相关
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

// 格式化月份显示
const formatMonth = (month) => {
  return monthNames[month];
};

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

// 打卡记录数据（示例数据，实际应从API获取）
const checkInRecords = ref([]);

// 计算日历天数
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // 获取当月第一天是星期几（0=周日，1=周一...）
  const firstDay = new Date(year, month, 1).getDay();

  // 获取当月有多少天
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 获取上个月有多少天
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  // 添加上个月的日期
  const prevMonthDate =
    month === 0 ? new Date(year - 1, 11, 1) : new Date(year, month - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;

  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    days.push({
      date: dayNum,
      otherMonth: true,
      hasCheckin: false,
      isToday: false,
      fullDate: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(
        dayNum
      ).padStart(2, "0")}`,
    });
  }

  // 添加当月的日期
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      i
    ).padStart(2, "0")}`;
    const hasCheckin = checkInRecords.value.some(
      (record) => record.date === dateStr
    );
    days.push({
      date: i,
      otherMonth: false,
      hasCheckin: hasCheckin,
      isToday: dateStr === todayStr,
      fullDate: dateStr,
    });
  }

  // 添加下个月的日期（补齐42个格子，6行×7列）
  const remainingDays = 42 - days.length;
  const nextMonthDate =
    month === 11 ? new Date(year + 1, 0, 1) : new Date(year, month + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth() + 1;

  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      otherMonth: true,
      hasCheckin: false,
      isToday: false,
      fullDate: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`,
    });
  }

  return days;
});

// 切换月份
const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
  loadCheckInData();
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
  loadCheckInData();
};

// 选中的日期
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));

// 点击日期
const handleDayClick = (day) => {
  if (day.otherMonth) return;

  selectedDate.value = day.fullDate;
  loadSportDataByDate(day.fullDate);
};

// 加载打卡数据
const loadCheckInData = async () => {
  try {
    const res = await request.get(`/sport-api/api/manual/getRecordByMonth`, {
      month: `${currentYear.value}-${String(currentMonth.value + 1).padStart(
        2,
        "0"
      )}`,
    });
    const normalizedRecords = Array.isArray(res)
      ? res
          .map((item) => ({
            id: item.id,
            date: dayjs(item.created_at).format("YYYY-MM-DD"),
          }))
          .filter((item) => !!item.date)
      : [];

    checkInRecords.value = normalizedRecords;

    console.log("checkInRecords======>", res, checkInRecords.value);
  } catch (error) {
    console.error("加载打卡数据失败:", error);
  }
};

// 任务列表
const taskList = ref([
  {
    name: "每日任务",
    progress: "12.42m",
    description: "跑步达3km以上(有效次数1次)",
    reward: 100,
    icon: `${staticBaseUrl}/images/task@2x.png `,
  },
]);

// 加载任务列表
const loadTaskList = async () => {
  try {
  } catch (error) {
    console.error("加载任务列表失败:", error);
  }
};

const sportId = ref(null);

// 运动数据
const sportData = ref({
  distance: '',
  duration: '',
  pace: ''
});

// 根据日期加载运动数据
const loadSportDataByDate = async (date) => {
  uni.showLoading({
    title: "加载中...",
    mask: true,
  });

  try {
    const res = await request.get(`/sport-api/api/manual/getRecordByDate`, {
      date: date,
    });

    sportId.value = res?.length ? res[0]?.id : null;

    // 填充运动数据
    if (res?.length && res[0]) {
      const record = res[0];
      sportData.value.distance = record.km || '';
      sportData.value.duration = record.time || '';
      sportData.value.pace = record.speed || '';
    } else {
      sportData.value = { distance: '', duration: '', pace: '' };
    }

    console.log("sportId======>", sportId.value, res);
  } catch (error) {
    console.error("加载运动数据失败:", error);
    uni.$u.toast("加载数据失败");
  } finally {
    uni.hideLoading();
  }
};

// 加载运动数据（默认加载今天）
const loadSportData = () => {
  loadSportDataByDate(dayjs().format("YYYY-MM-DD"));
};

const goToSportDetail = (id) => {
  if (!id) {
    return;
  }
  uni.navigateTo({
    url: `/pagesSub/sport/show?id=${id}`,
  });
};

onMounted(() => {
  loadCheckInData();
  loadTaskList();
  loadSportData();
});
</script>

<style lang="scss" scoped>
.page {
  background: #fafafa;
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100vh;
}

.navbar-box {
  overflow: visible;
  .navbar-bg {
    width: 100%;
    background: linear-gradient(180deg, #ffe8cc 0%, #fafafa 100%);
  }
  .navbar-right {
    display: flex;
    align-items: center;
    padding-right: 34rpx;
  }
}

.content {
  padding: 34rpx;
}

// 日历模块
.calendar-section {
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 14rpx 26rpx;
  margin-bottom: 30rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.calendar-title {
  font-weight: bold;
  font-size: 32rpx;
  color: #111827;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.month-text {
  font-weight: bold;
  font-size: 28rpx;
  color: #111827;
  min-width: 160rpx;
  text-align: center;
}

.calendar-weekdays {
  display: flex;
  margin-bottom: 20rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #9ca3af;
  font-weight: 500;
}

.calendar-days {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.calendar-day {
  position: relative;
  width: calc(100% / 7 - 12rpx);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  box-sizing: border-box;
  cursor: pointer;

  .day-number {
    font-size: 28rpx;
    color: #000000;
    line-height: 1;
  }

  .checkin-dot {
    position: absolute;
    bottom: 8rpx;
    width: 8rpx;
    height: 8rpx;
    background: #ff8c00;
    border-radius: 50%;
  }

  &.other-month {
    .day-number {
      color: #cccccc;
    }
  }

  &.has-checkin {
    background: #fff5e6;
    border-radius: 8rpx;

    .day-number {
      color: #ff8c00;
      font-weight: bold;
    }

    .checkin-dot {
      background: #ff8c00;
    }
  }

  &.today {
    .day-number {
      color: #ff8c00;
      font-weight: bold;
    }
  }

  &.selected {
    border: 4rpx solid #ff8c00;
    border-radius: 50%;

    .day-number {
      color: #ff8c00;
      font-weight: bold;
    }
  }

  // 选中 + 有打卡记录
  &.selected.has-checkin {
    background: #fff5e6;
    border: 4rpx solid #ff8c00;
    border-radius: 50%;
  }
}

// 今日运动数据模块
.sport-data-section {
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 30rpx 26rpx;
  margin-bottom: 30rpx;
}

.sport-data-title {
  font-weight: bold;
  font-size: 32rpx;
  color: #111827;
  margin-bottom: 30rpx;
}

.sport-data-list {
  display: flex;
  justify-content: space-between;
}

.sport-data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sport-data-value {
  font-weight: bold;
  font-size: 40rpx;
  color: #ff8c00;
  margin-bottom: 12rpx;
}

.sport-data-label {
  font-size: 24rpx;
  color: #999999;
}

// 任务模块
.task-section {
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 30rpx 16rpx;
}

.task-title {
  font-weight: bold;
  font-size: 34rpx;
  color: #000000;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx 0;
}

.task-item {
  display: flex;
  align-items: center;
  background: #fafafa;
  border-radius: 20rpx;
  padding: 20rpx 18rpx;
  gap: 20rpx;
}

.task-icon-wrapper {
  width: 112rpx;
  height: 112rpx;
  background: #f2f1f0;
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.task-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  align-items: baseline;
  gap: 20rpx;
}

.task-name {
  font-weight: bold;
  font-size: 30rpx;
  color: #000000;
  line-height: 48rpx;
}

.task-progress {
  font-weight: bold;
  font-size: 28rpx;
  color: #000000;
}

.task-desc {
  font-weight: bold;
  font-size: 20rpx;
  color: #b0b0b0;
  line-height: 48rpx;
}

.task-coming-soon {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.reward-amount {
  font-weight: bold;
  font-size: 28rpx;
  color: #efa742;
}

.reward-icon {
  width: 49rpx;
  height: 49rpx;
}
</style>
