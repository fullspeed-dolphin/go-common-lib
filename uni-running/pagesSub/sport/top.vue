<template>
  <view class="page">
    <Navbar title="排行榜" :bgHeight="370" />
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
      <!-- 个人跑量列表 -->
      <view v-if="tab.active === 0" class="ranking-list">
        <view
          class="ranking-item"
          v-for="(item, index) in dataList"
          :key="item.id || index"
        >
          <!-- 排名 -->
          <view class="ranking-number">
            <text v-if="index >= 3" class="rank-text">{{ index + 1 }}</text>
          </view>
          <!-- 头像和奖牌 -->
          <view class="avatar-wrapper">
            <image
              class="avatar"
              :src="item.avatar || '/static/run.png'"
              mode="aspectFill"
            ></image>
            <view v-if="index < 3" class="medal-wrapper">
              <image
                :class="['medal-icon', `medal-${index + 1}`]"
                :src="getMedalIcon(index + 1)"
                mode="aspectFit"
              ></image>
            </view>
          </view>
          <!-- 名称 -->
          <view class="name">{{ item.name || item.user_name || "用户" }}</view>
          <!-- 跑量 -->
          <view class="distance"
            >{{
              formatDistance(item.distance || item.run_distance || 0)
            }}km</view
          >
        </view>
      </view>

      <!-- 团队跑量列表 -->
      <view v-if="tab.active === 1" class="team-list">
        <view
          class="team-item"
          v-for="(item, index) in dataList"
          :key="item.id || item.group_id || index"
          @click="viewTeamDetail(item)"
        >
          <view class="team-item-content">
            <!-- 团队图片 -->
            <image
              class="team-image"
              :src="item.image || item.group_image || '/static/run.png'"
              mode="aspectFill"
            ></image>
            <!-- 团队信息 -->
            <view class="team-info">
              <!-- 团队名称 -->
              <view class="team-name">{{
                item.name || item.group_name || "跑团"
              }}</view>
              <!-- 团长 -->
              <view class="team-leader">
                <text class="label">团长</text>
                <text class="value">{{
                  item.leader_name || item.captain || "--"
                }}</text>
              </view>
              <!-- 成员数量 -->
              <view class="team-member-count">
                <text class="label">成员数量</text>
                <text class="value highlight"
                  >{{ item.member_count || item.members || 0 }}人</text
                >
              </view>
              <!-- 上月总跑量 -->
              <view class="team-total-distance">
                <text class="label">上月总跑量</text>
                <text class="value highlight"
                  >{{
                    formatDistance(
                      item.last_month_distance || item.total_distance || 0
                    )
                  }}km</text
                >
              </view>
              <!-- 周人均跑量 -->
              <view class="team-avg-distance">
                <text class="label">周人均跑</text>
                <text class="value highlight"
                  >{{
                    formatDistance(
                      item.weekly_avg_distance || item.avg_distance || 0
                    )
                  }}km</text
                >
              </view>
              <!-- 地址 -->
              <view class="team-address">{{
                item.address || item.location || "--"
              }}</view>
            </view>
            <!-- 奖牌图标 -->
            <view class="team-medal">
              <image
                v-if="index < 3"
                :class="['team-medal-icon', `team-medal-${index + 1}`]"
                :src="getMedalIcon(index + 1)"
                mode="aspectFit"
              ></image>
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

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 使用store
const store = useStore();

// 模板引用
const mescrollRef = ref(null);

// 响应式数据
const tab = ref({
  active: 0,
  items: [
    { label: "个人跑量", value: "personal" },
    { label: "团队跑量", value: "team" },
  ],
});

const dataList = ref([]);

// 计算属性
const userInfo = computed(() => store.state.userInfo);

// mescroll相关
let mescroll = null;

const mescrollInit = (mescrollInstance) => {
  mescroll = mescrollInstance;
};

// tab切换
const changeTab = (detail) => {
  tab.value.active = detail.index;
  refreshList();
};

// 方法定义
const viewTeamDetail = (item) => {
  if (item.group_id) {
    uni.$u.route(`pagesSub/groupDetail?group_id=${item.group_id}`);
  }
};

// 格式化距离（米转公里，保留2位小数）
const formatDistance = (distance) => {
  if (!distance) return "0.00";
  // 如果已经是公里，直接返回；如果是米，转换为公里
  const km = distance > 10000 ? distance / 1000 : distance;
  return parseFloat(km).toFixed(2);
};

// 获取奖牌图标
const getMedalIcon = (rank) => {
  // 这里可以使用实际的奖牌图标路径
  // 1: 金牌, 2: 银牌, 3: 铜牌
  const medalMap = {
    1: "/static/images/icon-top5@2x.png", // 金牌，可以用实际路径替换
    2: "/static/images/icon-top5@2x.png", // 银牌
    3: "/static/images/icon-top5@2x.png", // 铜牌
  };
  return medalMap[rank] || "/static/images/icon-top5@2x.png";
};

const refreshList = () => {
  nextTick(() => {
    if (mescroll) {
      mescroll.resetUpScroll(); // 重置列表数据为第一页
      mescroll.scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
    }
  });
};

const getList = (page) => {
  uni.showLoading({ mask: true });

  const data = {
    pageIndex: page.num - 1,
    pageSize: 10,
  };

  // 根据当前tab选择不同的API
  const apiUrl =
    tab.value.active === 0
      ? `/sport-api/ranking/personal` // 个人跑量排行榜API
      : `/sport-api/ranking/team`; // 团队跑量排行榜API

  proxy.$axios
    .get(apiUrl, data)
    .then((res) => {
      uni.hideLoading();

      // 处理返回数据
      let list = [];
      if (tab.value.active === 0) {
        // 个人跑量
        list = res.data || res.list || res || [];
      } else {
        // 团队跑量
        list = res.data || res.list || res || [];
      }

      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      mescroll.endBySize(list.length, res.total || list.length);

      //如果是第一页需手动制空列表
      if (page.num == 1) {
        dataList.value = [];
      }

      dataList.value = dataList.value.concat(list); //追加新数据
    })
    .catch((error) => {
      uni.hideLoading();
      console.error("获取排行榜数据失败:", error);
      // 如果API失败，使用模拟数据
      if (page.num == 1) {
        dataList.value = getMockData();
      }
      mescroll.endSuccess(dataList.value.length);
    });
};

// 获取模拟数据（用于测试）
const getMockData = () => {
  if (tab.value.active === 0) {
    // 个人跑量模拟数据
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: "嘉王府",
      user_name: "嘉王府",
      avatar: "/static/run.png",
      distance: 21.84 - i * 0.5,
      run_distance: 21.84 - i * 0.5,
    }));
  } else {
    // 团队跑量模拟数据
    return Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      group_id: i + 1,
      name: "广州凤凰悦跑团",
      group_name: "广州凤凰悦跑团",
      image: "/static/run.png",
      group_image: "/static/run.png",
      leader_name: "阿雄",
      captain: "阿雄",
      member_count: 316 - i * 10,
      members: 316 - i * 10,
      last_month_distance: 17426.14 - i * 1000,
      total_distance: 17426.14 - i * 1000,
      weekly_avg_distance: 37.7 - i * 2,
      avg_distance: 37.7 - i * 2,
      address: "广东省广州市增城区永宁街道汽车城大道71号",
      location: "广东省广州市增城区永宁街道汽车城大道71号",
    }));
  }
};

const downCallback = (mescroll) => {
  // 下拉刷新的回调
  mescroll.resetUpScroll();
};
</script>

<style lang="scss" scoped>
.page {
  background: #fafafa;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-container {
  width: 500rpx;
  margin: 32rpx auto;
}

// 个人跑量列表样式
.ranking-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0 34rpx;

  .ranking-item {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 16rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    padding: 32rpx 24rpx;
    margin-bottom: 20rpx;

    .ranking-number {
      width: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .rank-text {
        font-weight: bold;
        font-size: 32rpx;
        color: #000000;
      }
    }

    .avatar-wrapper {
      position: relative;
      margin-left: 20rpx;
      margin-right: 24rpx;
      flex-shrink: 0;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        border: 2rpx solid rgba(0, 0, 0, 0.06);
      }

      .medal-wrapper {
        position: absolute;
        top: -15rpx;
        left: -15rpx;
        width: 50rpx;
        height: 50rpx;
        z-index: 2;

        .medal-icon {
          width: 50rpx;
          height: 50rpx;
        }
      }
    }

    .name {
      flex: 1;
      font-weight: 500;
      font-size: 30rpx;
      color: #000000;
      margin-right: 20rpx;
    }

    .distance {
      font-weight: bold;
      font-size: 30rpx;
      color: #000000;
      flex-shrink: 0;
    }
  }
}

// 团队跑量列表样式
.team-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0 34rpx;

  .team-item {
    margin-bottom: 20rpx;

    .team-item-content {
      position: relative;
      background: #ffffff;
      border-radius: 16rpx;
      border: 2rpx solid rgba(0, 0, 0, 0.06);
      padding: 32rpx;
      display: flex;
      gap: 24rpx;

      .team-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 16rpx;
        flex-shrink: 0;
        border: 2rpx solid rgba(0, 0, 0, 0.06);
      }

      .team-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12rpx;

        .team-name {
          font-weight: bold;
          font-size: 32rpx;
          color: #000000;
          margin-bottom: 8rpx;
        }

        .team-leader,
        .team-member-count,
        .team-total-distance,
        .team-avg-distance {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #666666;

          .label {
            margin-right: 12rpx;
          }

          .value {
            color: #000000;

            &.highlight {
              color: #ff8c00;
              font-weight: 500;
            }
          }
        }

        .team-address {
          font-size: 24rpx;
          color: #999999;
          margin-top: 8rpx;
          line-height: 1.5;
        }
      }

      .team-medal {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .team-medal-icon {
          width: 60rpx;
          height: 60rpx;
        }
      }
    }
  }
}
</style>
