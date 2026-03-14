<template>
  <view class="">
    <mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="loadRankList">
    <section class="honor-rank">
      <view class="title">荣誉榜单</view>
      <view class="subtitle">实时排名</view>

      <view class="rank-container">
        <!-- NO.2 -->
        <view class="rank-item-top flex-col-center rank-2" v-if="topList[1]" @click="currentIndex !== 0 && goTeamDetail(topList[1].id)">
          <image :src="currentIndex === 0 ? topList[1].avatar_url : topList[1].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.2</text>
          <text class="name">{{ currentIndex === 0 ? topList[1].real_name : topList[1].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? personalRankValue(topList[1]) : teamRankValue(topList[1]) }}</text>
          <text v-if="currentIndex === 0 && personalSortBy === 'completion'" class="distance" style="font-size:20rpx;">{{ topList[1].total_distance_km }}km</text>
        </view>

        <!-- NO.1 -->
        <view class="rank-item-top flex-col-center rank-1" v-if="topList[0]" @click="currentIndex !== 0 && goTeamDetail(topList[0].id)">
          <image :src="currentIndex === 0 ? topList[0].avatar_url : topList[0].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.1</text>
          <text class="name">{{ currentIndex === 0 ? topList[0].real_name : topList[0].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? personalRankValue(topList[0]) : teamRankValue(topList[0]) }}</text>
          <text v-if="currentIndex === 0 && personalSortBy === 'completion'" class="distance" style="font-size:20rpx;">{{ topList[0].total_distance_km }}km</text>
        </view>

        <!-- NO.3 -->
        <view class="rank-item-top flex-col-center rank-3" v-if="topList[2]" @click="currentIndex !== 0 && goTeamDetail(topList[2].id)">
          <image :src="currentIndex === 0 ? topList[2].avatar_url : topList[2].team_avatar_url" class="avatar" />
          <text class="rank-label flex-center">NO.3</text>
          <text class="name">{{ currentIndex === 0 ? topList[2].real_name : topList[2].team_name }}</text>
          <text class="distance">{{ currentIndex === 0 ? personalRankValue(topList[2]) : teamRankValue(topList[2]) }}</text>
          <text v-if="currentIndex === 0 && personalSortBy === 'completion'" class="distance" style="font-size:20rpx;">{{ topList[2].total_distance_km }}km</text>
        </view>
      </view>
    </section>

    <view class="tab-container">
      <view class="category-tags">
        <view class="tags-inner">
          <view v-for="(item, index) in tabList" :key="item.value" class="tag-item" :class="{ active: currentIndex === index }" @click="handleTabChange(index)">
            {{ item.label }}
          </view>
        </view>
      </view>
      <view v-if="currentIndex === 0" class="sort-switch">
        <view class="sort-btn" :class="{ active: personalSortBy === 'distance' }" @click="switchPersonalSort('distance')">跑量排行</view>
        <view class="sort-btn" :class="{ active: personalSortBy === 'completion' }" @click="switchPersonalSort('completion')">完赛率排行</view>
      </view>
      <view v-if="currentIndex === 1" class="sort-switch">
        <view class="sort-btn" :class="{ active: teamSortBy === 'members' }" @click="switchTeamSort('members')">人数排行</view>
        <view class="sort-btn" :class="{ active: teamSortBy === 'distance' }" @click="switchTeamSort('distance')">跑量排行</view>
        <view class="sort-btn" :class="{ active: teamSortBy === 'completion' }" @click="switchTeamSort('completion')">完成率排行</view>
      </view>
    </view>

    <view class="rank-list">
      <!-- 个人排行榜 -->
      <template v-if="currentIndex === 0">
        <view v-for="(item, index) in rankList" :key="item.wechat_openid" class="rank-item">
          <view class="rank-number flex-center">
            {{ item.rank <= 3 ? 'NO.' + item.rank : item.rank }}
          </view>
          <div class="user-avatar">
            <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
              (item.avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
            " mode="aspectFill" errorImg="/static/images/user.png" />
          </div>
          <view class="user-info">
            <view class="user-name">{{ item.real_name }}</view>
            <view class="user-detail u-flex-y-center">
              {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.team_name }}</view>
            </view>
            <!-- <view class="user-time">{{ item.total_sessions }}次</view> -->
          </view>
          <view class="progress">
            <text class="progress-percent">
              <text style="font-size:36rpx;">{{ personalRankValue(item) }}</text>
            </text>
            <text v-if="personalSortBy === 'completion'" style="font-size:20rpx;color:#999;font-weight:normal;">{{ item.total_distance_km }}km</text>
          </view>
        </view>
      </template>
      <!-- 战队排行榜 -->
      <template v-else>
        <view v-for="(item, index) in rankList" :key="item.id" class="rank-item" @click="goTeamDetail(item.id)">
          <view class="rank-number flex-center">
            {{ item.rank <= 3 ? 'NO.' + item.rank : item.rank }}
          </view>
          <div class="user-avatar">
            <up-lazy-load height="110" borderRadius="14" :is-effect="false" :image="
              (item.team_avatar_url)  + '?x-oss-process=image/resize,w_110,h_110,m_fill'
            " mode="aspectFill" />
          </div>
          <view class="user-info">
            <view class="user-name">{{ item.team_name }}</view>
            <view class="user-detail u-flex-y-center">
              组别 {{ item.team_goal_km }}KM
              <view class="flex-center group-tag">{{ item.current_members }}人</view>
            </view>
            <view class="user-time">完成率 {{ item.team_completion_rate }}%</view>
          </view>
          <view class="progress">
            <text class="progress-percent"><text style="font-size:36rpx;">{{ teamRankValue(item) }}</text></text>
          </view>
        </view>
      </template>
      <view v-if="!rankList.length">
        <u-empty mode="data" text="暂无数据"></u-empty>
      </view>
    </view>
    </mescroll-body>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
import request from "@/utils/request.js";

const PAGE_SIZE = 100;
const activetyId = ref("");
const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

// top3 从 rankList 中取
const topList = computed(() => rankList.value.slice(0, 3));

// Tab 配置
const tabList = ref([
  { label: "个人排行榜", value: "" },
  { label: "战队排行榜", value: "SUCC" },
]);
const currentIndex = ref(0);
const teamSortBy = ref('members');
const personalSortBy = ref('distance');

onLoad((options) => {
  activetyId.value = options.id;
});

const goTeamDetail = (teamId) => {
  uni.$u.route("pagesDashboard/pkEvent/teamDetail", { teamId, id: activetyId.value });
};

// Tab 切换处理
const handleTabChange = (index) => {
  currentIndex.value = index;
  getMescroll().resetUpScroll();
};

// 个人排序切换
const switchPersonalSort = (sort) => {
  if (personalSortBy.value === sort) return;
  personalSortBy.value = sort;
  getMescroll().resetUpScroll();
};

// 战队排序切换
const switchTeamSort = (sort) => {
  if (teamSortBy.value === sort) return;
  teamSortBy.value = sort;
  getMescroll().resetUpScroll();
};

// 个人排行榜显示值：按跑量排显示跑量，按完赛率排显示完赛率
const personalRankValue = (item) => {
  return personalSortBy.value === 'completion'
    ? (item.required_checkins ? Math.round(item.total_qualified_sessions / item.required_checkins * 100) : 0) + '%'
    : item.total_distance_km + 'km';
};

// 战队排行榜显示值：按人数排显示人数，按跑量排显示跑量
const teamRankValue = (item) => {
  if (teamSortBy.value === 'distance') return item.total_distance_km + 'km';
  if (teamSortBy.value === 'completion') return item.team_completion_rate + '%';
  return item.current_members + '人';
};

// 排行榜数据
const rankList = ref([]);

const loadRankList = (mescroll) => {
  let url = currentIndex.value === 0
    ? "/event-api/ranking/personal?event_id="
    : "/event-api/ranking/team?event_id=";
  url += activetyId.value + `&page_index=${mescroll.num - 1}&page_size=${PAGE_SIZE}`;
  if (currentIndex.value === 0) {
    url += `&sort_by=${personalSortBy.value}`;
  }
  if (currentIndex.value === 1) {
    url += `&sort_by=${teamSortBy.value}`;
  }

  request.get(url).then((res) => {
    const list = res?.list || [];
    mescroll.endSuccess(list.length, list.length >= PAGE_SIZE);

    if (mescroll.num === 1) {
      rankList.value = list;
    } else {
      rankList.value = rankList.value.concat(list);
    }
  }).catch(() => {
    mescroll.endErr();
  });
};
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
  flex-direction: column;
  align-items: center;
  margin: 20rpx 30rpx;
}

.sort-switch {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 0 0 16rpx;

  .sort-btn {
    padding: 10rpx 32rpx;
    font-size: 24rpx;
    color: #999;
    background: #f5f5f5;
    border-radius: 999rpx;

    &.active {
      color: #fff;
      background: #ff5c5c;
    }
  }
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
  color: #ff5c5c;
  border-bottom: 2rpx solid #ff5c5c;
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
    color: #ff5c5c;
  }

  .progress {
    font-size: 28rpx;
    color: #ff5c5c;
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
    color: #999;
    background: #f5f5f5;
    line-height: 40rpx;
    width: 336rpx;
    white-space: nowrap;
    font-weight: bold;
    text-align: center;
    border-radius: 999rpx;
    &.active {
      color: #fff;
      background: #ff5c5c;
    }
  }
}
</style>