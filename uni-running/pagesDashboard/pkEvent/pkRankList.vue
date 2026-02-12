<template>
  <view class="">
    <section class="honor-rank">
      <view class="title">荣誉榜单</view>
      <view class="subtitle">实时排名</view>

      <view class="rank-container">
        <!-- NO.2 -->
        <view class="rank-item-top flex-col-center rank-2" v-if="topList[1]" @click="currentIndex !== 0 && goTeamDetail(topList[1].id)">
          <image :src="currentIndex === 0 ? topList[1].avatar_url : topList[1].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.2</text>
          <text class="name">{{ currentIndex === 0 ? topList[1].real_name : topList[1].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? topList[1].total_distance_km : topList[1].team_goal_km }}km</text>
        </view>

        <!-- NO.1 -->
        <view class="rank-item-top flex-col-center rank-1" v-if="topList[0]" @click="currentIndex !== 0 && goTeamDetail(topList[0].id)">
          <image :src="currentIndex === 0 ? topList[0].avatar_url : topList[0].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.1</text>
          <text class="name">{{ currentIndex === 0 ? topList[0].real_name : topList[0].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? topList[0].total_distance_km : topList[0].team_goal_km }}km</text>
        </view>

        <!-- NO.3 -->
        <view class="rank-item-top flex-col-center rank-3" v-if="topList[2]" @click="currentIndex !== 0 && goTeamDetail(topList[2].id)">
          <image :src="currentIndex === 0 ? topList[2].avatar_url : topList[2].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.3</text>
          <text class="name">{{ currentIndex === 0 ? topList[2].real_name : topList[2].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? topList[2].total_distance_km : topList[2].team_goal_km }}km</text>
        </view>
      </view>
    </section>

    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view class="tag-slider" :style="sliderStyle" :class="sliderAnimClass"></view>
          <view v-for="(item, index) in tabList" :key="item.value" :id="'tab-' + index" class="tag-item" :class="{ active: currentIndex === index }" @click="handleTabChange(item, index)">
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <view class="rank-list" @touchstart="onTouchStart" @touchend="handleTouchEnd">
      <!-- 个人排行榜 -->
      <template v-if="currentIndex === 0">
        <view v-for="(item, index) in rankList" :key="item.wechat_openid" class="rank-item">
          <view class="rank-number flex-center">
            {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
          </view>
          <image :src="item.avatar_url" class="user-avatar" />
          <view class="user-info">
            <view class="user-name">{{ item.real_name }}</view>
            <view class="user-detail u-flex-y-center">
              {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.team_name }}</view>
            </view>
            <view class="user-time">{{ item.total_sessions }}次</view>
          </view>
          <view class="progress">
            <text class="progress-percent"><text style="font-size:36rpx;">{{ item.total_distance_km }}</text>km</text>
          </view>
        </view>
      </template>
      <!-- 战队排行榜 -->
      <template v-else>
        <view v-for="(item, index) in rankList" :key="item.id" class="rank-item" @click="goTeamDetail(item.id)">
          <view class="rank-number flex-center">
            {{ index === 0 ? 'NO.1' : index === 1 ? 'NO.2' : index === 2 ? 'NO.3' : index + 1 }}
          </view>
          <image :src="item.team_avatar_url" class="user-avatar" />
          <view class="user-info">
            <view class="user-name">{{ item.team_name }}</view>
            <view class="user-detail u-flex-y-center">
              组别 {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.current_members }}人</view>
            </view>
            <view class="user-time">完成率 {{ item.team_completion_rate }}%</view>
          </view>
          <view class="progress">
            <text class="progress-percent"><text style="font-size:36rpx;">{{ item.team_goal_km }}</text>km</text>
          </view>
        </view>
      </template>
      <view v-if="!rankList.length">
        <u-empty mode="data" text="暂无数据"></u-empty>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useTabAnimation } from "@/composables/useTabAnimation.js";
import request from "@/utils/request.js"
const activetyId = ref('')

// top3 从 rankList 中取
const topList = computed(() => rankList.value.slice(0, 3));

// Tab 配置
const tabList = ref([
  {
    label: "个人排行榜",
    value: "",
  },
  {
    label: "战队排行榜",
    value: "SUCC",
  },
]);

// 使用 Tab 动画 composable
const {
  currentIndex,
  sliderStyle,
  sliderAnimClass,
  listAnimClass,
  changeTab,
  initTabRects,
  onTouchStart,
  onTouchEnd,
} = useTabAnimation({
  tabCount: tabList.value.length,
  loop: true,
});

onLoad((options) => {
  activetyId.value = options.id
  initTabRects();
  getRankList(0,options.id)
});

// 当前选中的 tab
const curTab = computed(() => tabList.value[currentIndex.value]);

const goTeamDetail = (teamId) => {
  uni.$u.route('pagesDashboard/pkEvent/teamDetail', { teamId, id: activetyId.value });
};

// Tab 切换处理
const handleTabChange = (item, index) => {
  if (currentIndex.value === index) return;
  changeTab(index);
};

// 排行榜数据
const rankList = ref([]);
let rankRequestId = 0;

watch(currentIndex, (val) => {
  getRankList(val, activetyId.value);
});

// 手势切换处理
const handleTouchEnd = (e) => {
  onTouchEnd(e, tabList.value);
};
// 排行榜type 0个人 1战队,id是event_id
const getRankList = (type, id) => {
  rankList.value = [];
  const reqId = ++rankRequestId;
  let url = !type ? '/event-api/ranking/personal?event_id=' : '/event-api/ranking/team?event_id='
  request.get(url + activetyId.value).then(res => {
    if (reqId !== rankRequestId) return;
    rankList.value = res || []
  })
}
</script>

<style lang="scss" scoped>
.honor-rank {
  background: linear-gradient(180deg, #e83265, #ca2754);
  color: white;
  height: 550rpx;
  border-radius: 0rpx 0rpx 80rpx 80rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  .title {
    font-size: 48rpx;
    line-height: 72rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .subtitle {
    line-height: 42rpx;
    font-size: 28rpx;
    color: #ffe4e6;
    margin-bottom: 40rpx;
  }

  .rank-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    gap: 40rpx;
  }

  .rank-item-top {
    width: 200rpx;
    text-align: center;
    position: relative;
  }

  .rank-item-top .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx 12rpx 12rpx 12rpx;
    border: 3rpx solid #e2e8f0;
  }

  .rank-label {
    position: relative;
    top: -16rpx;
    width: 80rpx;
    font-size: 24rpx;
    color: white;
    border-radius: 20rpx;
    background-color: #333;
    text-align: center;
  }

  .rank-1 {
    .rank-label {
      background-color: #ffd700;
      width: 144rpx;
      height: 48rpx;
      background: #fdc700;
      border-radius: 14rpx 14rpx 14rpx 14rpx;
      border: 4rpx solid #ffffff;
      font-weight: bold;
      font-size: 24rpx;
      color: #733e0a;
    }
    .avatar {
      width: 144rpx;
      height: 144rpx;
      border-radius: 12rpx 12rpx 12rpx 12rpx;
      border: 6rpx solid #ffdf20;
      box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.4);
    }
    .name {
      font-size: 32rpx;
    }
    .distance {
      font-size: 24rpx;
      line-height: 42rpx;
      color: #fff085;
    }
  }

  .rank-3 {
    .rank-label {
      width: 84rpx;
      height: 34rpx;
      background: #ff8904;
      border-radius: 14rpx 14rpx 14rpx 14rpx;
      border: 2rpx solid #ffffff;
    }
    .avatar {
      border: 4rpx solid #fff;
    }
  }

  .rank-2 {
    .avatar {
      border: 4rpx solid #fff;
    }
    .rank-label {
      width: 84rpx;
      height: 34rpx;
      background: #90a1b9;
      border-radius: 14rpx 14rpx 14rpx 14rpx;
      border: 2rpx solid #ffffff;
    }
  }

  .name {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .distance {
    font-size: 24rpx;
    color: #ffe4e6;
    line-height: 36rpx;
  }
}

.tab-container {
  display: flex;
  justify-content: center;
  margin: 20rpx 30rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  border-bottom: 2rpx solid transparent;
}

.tab-item.active {
  color: #e12a48;
  border-bottom: 2rpx solid #e12a48;
}

.rank-list {
  margin: 0 30rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  margin: 10rpx 0;
  width: 686rpx;
  height: 144rpx;
  background: #ffffff;
  box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0, 0, 0, 0.01);
  border-radius: 32rpx 32rpx 32rpx 32rpx;

  &:nth-child(1) {
    .rank-number {
      color: #fdc700;
    }
  }

  &:nth-child(2) {
    .rank-number {
      color: #90a1b9;
    }
  }

  &:nth-child(3) {
    .rank-number {
      color: #ff8904;
    }
  }
  .group-tag {
    font-weight: 500;
    font-size: 16rpx;
    color: #155dfc;
    height: 32rpx;
		padding: 0 10rpx;
		margin-left: 10rpx;
    background: #eff6ff;
    border-radius: 12rpx 12rpx 12rpx 12rpx;
  }
  .rank-number {
    width: 96rpx;
    font-family: Inter, Inter;
    font-size: 24rpx;
    font-weight: bold;
    color: #acacac;
    text-align: center;
  }

  .user-avatar {
    margin-right: 26rpx;
    width: 96rpx;
    height: 96rpx;
    border-radius: 14rpx 14rpx 14rpx 14rpx;
    background: #f5f5f5;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    line-height: 42rpx;
    font-weight: bold;
    font-size: 28rpx;
    color: #1e2939;
  }

  .user-detail {
    font-size: 24rpx;
    color: #5c626f;
    margin-bottom: 8rpx;
  }

  .user-time {
    font-size: 20rpx;
    color: #e11d48;
  }

  .progress {
    font-size: 28rpx;
    color: #e12a48;
    font-weight: bold;
    margin-left: 20rpx;
    padding-right: 20rpx;
  }
}

.category-tags {
  .tags-inner {
    display: inline-flex;
    position: relative;
    gap: 12rpx;
    padding: 6rpx;
    background: #fff;
    border-radius: 999rpx;
  }

  .tag-slider {
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    height: calc(100% - 12rpx);
    background: #f3f4f6;
    border-radius: 999rpx;
    transition: transform 0.3s ease-out, width 0.3s ease-out;
    z-index: 0;

    &.no-transition {
      transition: none !important;
    }

    &.slider-hidden {
      opacity: 0;
    }
  }

  .tag-item {
    position: relative;
    z-index: 1;
    padding: 12rpx 24rpx;
    font-size: 28rpx;
    color: #e11d48;
    line-height: 40rpx;
    width: 336rpx;
    white-space: nowrap;
    transition: color 0.3s ease;
    font-weight: bold;
    text-align: center;

    &.active {
      color: #e11d48;
    }
  }
}
</style>