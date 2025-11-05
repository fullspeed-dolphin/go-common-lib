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
            <view v-if="index < 3" class="medal-wrapper">
              <image
                :class="['medal-icon', `medal-${index + 1}`]"
                :src="getMedalIcon(index + 1)"
                mode="aspectFit"
              ></image>
            </view>
            <text v-if="index >= 3" class="rank-text">{{ index + 1 }}</text>
          </view>
          <!-- 头像和奖牌 -->
          <view class="avatar-wrapper">
            <image
              class="avatar"
              :src="
                item.avatar ||
                'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
              "
              mode="aspectFill"
            ></image>
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
        <GroupItem
          v-for="(item, index) in dataList"
          :key="item.id || item.group_id || index"
          :item="item"
          variant="detail"
          :rankIcon="index < 3 ? getMedalIcon(index + 1, true) : ''"
        />
      </view>
    </mescroll-uni>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";
import Navbar from "@/components/navbar.vue";
import GroupItem from "@/components/GroupItem.vue";

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

// 方法定义（viewTeamDetail 已由 GroupItem 组件内部处理，无需单独定义）

// 格式化距离（米转公里，保留2位小数）
const formatDistance = (distance) => {
  if (!distance) return "0.00";
  // 如果已经是公里，直接返回；如果是米，转换为公里
  const km = distance > 10000 ? distance / 1000 : distance;
  return parseFloat(km).toFixed(2);
};

// 获取奖牌图标
const getMedalIcon = (rank, isTeam = false) => {
  // 这里可以使用实际的奖牌图标路径
  // 1: 金牌, 2: 银牌, 3: 铜牌
  const medalMap = {
    1: isTeam
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top1@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top1@2x.png", // 金牌，可以用实际路径替换
    2: isTeam
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top2@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top2@2x.png", // 银牌
    3: isTeam
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top3@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top3@2x.png", // 铜牌
  };
  return (
    medalMap[rank] ||
    (isTeam
      ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-group-top3@2x.png"
      : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top3@2x.png")
  );
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
      avatar:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png",
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
      image: "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png",
      group_image:
        "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png",
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
    position: relative;
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 16rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    padding: 10rpx 26rpx;
    margin-bottom: 20rpx;

    .ranking-number {
      width: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .rank-text {
        font-weight: bold;
        font-size: 30rpx;
        color: #707070;
      }
      .medal-wrapper {
        position: absolute;
        top: 0;
        width: 50rpx;
        height: 50rpx;
        z-index: 2;

        .medal-icon {
          width: 38rpx;
          height: 51rpx;
        }
      }
    }

    .avatar-wrapper {
      position: relative;
      margin-left: 20rpx;
      margin-right: 24rpx;
      flex-shrink: 0;

      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 2rpx solid rgba(0, 0, 0, 0.06);
      }
    }

    .name {
      flex: 1;
      font-weight: bold;
      font-size: 28rpx;
      color: #000000;
      margin-right: 20rpx;
    }

    .distance {
      font-weight: bold;
      font-size: 24rpx;
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

  :deep(.group-item) {
    margin-bottom: 20rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.06);
  }
}
</style>
