<template>
  <view class="page-container">
    <u-navbar :title="clubTypeName + '活动列表'" autoBack placeholder></u-navbar>
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="getList" :top="0">
    <view class="event-list">
      <view class="event-card" v-for="(item, index) in eventList" :key="index">
        <image class="event-poster" :src="item.background_image_url" mode="aspectFill"></image>
        <view class="event-info">
          <view class="event-header">
            <text class="event-name">{{ item.name }}</text>
            <view class="event-status" :class="getStatusClass(item.status)">
              <text>{{ getStatusText(item.status) }}</text>
            </view>
          </view>
          <view class="event-meta">
            <view class="meta-item">
              <u-icon name="clock" size="24rpx" color="#999"></u-icon>
              <text class="meta-text">{{ item.event_time }}</text>
            </view>
            <view class="meta-item">
              <u-icon name="map" size="24rpx" color="#999"></u-icon>
              <text class="meta-text">{{ item.event_location }}</text>
            </view>
          </view>
          <view class="event-actions u-mt-10">
            <u-button v-if="!['EXP', 'ACT'].includes(item.status)" type="primary" size="small" shape="circle" color="#2979ff"
              customStyle="width: 120rpx;margin:0;"
              @click="editEvent(item)">更新</u-button>
            <u-button v-if="!['EXP', 'ACT'].includes(item.status)"  type="error" size="small" shape="circle" color="#fa3534"
              customStyle="width: 120rpx;margin:0;"
              @click="removeItem(item)">删除</u-button>
            <u-button type="primary" size="small" plain shape="circle" color="#FF8C00"
              customStyle="width: 120rpx;margin:0;"
              @click="viewEvent(item)">详情</u-button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <!-- <view class="empty-state" v-if="!loading && eventList.length === 0">
        <u-empty mode="data" text="暂无活动"></u-empty>
      </view> -->
    </view>
	</mescroll-body>

    <!-- 底部按钮 -->
    <view class="section-bottom">
      <u-button type="primary" color="#FF8C00" shape="circle"
        customStyle="height: 84rpx; width: 100%;"
        @click="createEvent()">创建活动</u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import request from "@/utils/request.js";
import dayjs from "dayjs";
import {
	onPageScroll,
	onReachBottom
} from "@dcloudio/uni-app";
import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
const {
	mescrollInit,
	downCallback,
	getMescroll
} = useMescroll(
	onPageScroll,
	onReachBottom
);


const group_id = ref("");
const eventList = ref([]);
const loading = ref(false);
const detail = ref({});

// 根据 club_type 返回对应文字：running=跑团，cycling=车队
const clubTypeName = computed(() => {
	return detail.value.club_type === 'cycling' ? '车队' : '跑团';
});

// 获取俱乐部详情
const getDetail = () => {
	request.get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
		.then((res) => {
			detail.value = res;
		});
};

// 获取活动列表
const getList = async (mescroll) => {
  if (!group_id.value) return;
  loading.value = true;
	
	const data = {
		pageIndex: mescroll.num - 1,
		pageSize: 10,
	};
	
	request.get(`/event-api/fsc_events?fsc_id=${group_id.value}`, data).then(res => {
		loading.value = false;
		res = (res.fsc_events || []).filter(i => i.status !== 'DELETED').map(item => ({
			...item,
			event_time: isNaN(item.event_time) ?dayjs(item.event_time).format('YYYY-MM-DD') : dayjs(Number(item.event_time)).format('YYYY-MM-DD')
		}));
		
		mescroll.endSuccess(res.length);
		
		//如果是第一页需手动制空列表
		if (mescroll.num == 1) {
			eventList.value = [];
		}
		
		eventList.value = eventList.value.concat(res); //追加新数据
	})
};

const refreshList = () => {
	getMescroll().resetUpScroll(); // 重置列表数据为第一页
	getMescroll().scrollTo(0, 0); // 重置列表数据为第一页时,建议把滚动条也重置到顶部,避免无法再次翻页的问题
};

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    'PND': 'status-pending',
    'ACT': 'status-active',
    'EXP': 'status-expired',
    'REJ': 'status-rejected'
  };
  return statusMap[status];
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PND': '审核中',
    'ACT': '进行中',
    'EXP': '已结束',
    'REJ': '审核未通过'
  };

  return statusMap[status];
};

const removeItem = (item) => {
	uni.showModal({
		title: "提示",
		content: "确定删除该活动吗？",
		success: (res) => {
			if (res.confirm) {
        const data = {
          event_id: item.id,
          status: 'DELETED' 
        }
				request.post(`/event-api/fsc_events/update`, data).then(res => {
					uni.$u.toast('操作成功')
					
					refreshList()
				})
			} else if (res.cancel) {
				console.log("用户点击取消");
			}
		},
	});
};
	
// 创建活动
const createEvent = () => {
  uni.$u.route(`pagesSub/runningTeam/teamEventForm?group_id=${group_id.value}`);
};

// 编辑活动
const editEvent = (item) => {
  uni.$u.route(`pagesSub/runningTeam/teamEventForm?id=${item.id}&group_id=${group_id.value}&status=${item.status}&status_message=${encodeURIComponent(item.status_message || '')}`);
};

// 查看活动详情
const viewEvent = (item) => {
  uni.$u.route(`pagesSub/runningTeam/teamEventDetail?id=${item.id}&status=${item.status}&status_message=${encodeURIComponent(item.status_message || '')}`);
};

onLoad((options) => {
  group_id.value = options.group_id;
  getDetail();
});

onShow(() => {
  // 移除全局自定义事件监听器
  uni.$off("updateList");

  // 监听全局的自定义事件
  uni.$once("updateList", (data) => {
    // 判断二级页面是否修改过数据，如果修改过，需要刷新首页，保持信息一致
    if (data.isChange) {
      refreshList();
    }
  });
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 24rpx 34rpx;
  padding-bottom: 140rpx;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.event-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;

  .event-poster {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  .event-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  .event-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
  }

  .event-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event-status {
    flex-shrink: 0;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-size: 22rpx;

    &.status-pending {
      background: rgba(255, 140, 0, 0.1);
      color: #FF8C00;
    }

    &.status-active {
      background: rgba(0, 200, 83, 0.1);
      color: #00C853;
    }

    &.status-expired {
      background: rgba(153, 153, 153, 0.1);
      color: #999;
    }

    &.status-rejected {
      background: rgba(255, 0, 0, 0.1);
      color: #FF0000;
    }

    &.status-upcoming {
      background: rgba(0, 200, 83, 0.1);
      color: #00C853;
    }
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin: 12rpx 0;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .meta-text {
    font-size: 24rpx;
    color: #999;
  }

  .event-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }
}

.empty-state {
  padding: 100rpx 0;
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}
</style>
