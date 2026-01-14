<template>
  <view class="u-pt-20">
    <u-navbar title="我的跑币" placeholder />

    <view class="col content">
      <image
        class="bg1"
        src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/bg-run-coin@2x.png"
        mode="aspectFill"
      ></image>
      <image
        class="bg2"
        src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-coin-lg@2x.png"
        mode="aspectFill"
      ></image>
      <view class="row">
        <view class="col balance">
          <view class="title">跑币余额</view>
          <view class="money">0.00</view>
          <view class="description">100个跑币=1元</view>
        </view>
      </view>
      <view class="col">
        <view class="section checkin">
          <view class="section-header" style="border: none">
            <view class="section-header-title">
              <view>每日运动签到</view>
              <view class="section-header-title-description">
                已连续签到
                <text class="section-header-title-description-number">1</text>
                天
              </view>
            </view>
            <view class="section-header-checkbox"
              >签到提醒
              <u-switch
                label="开"
                activeColor="#FF8C00"
                v-model="isRemind"
                size="14"
              />
            </view>
          </view>
          <view class="section-content">
            <view v-for="checkIn in checkIns" :key="checkIn.date">
              <view
                :class="['check-in-item', `check-in-item--${checkIn.status}`]"
              >
                <view class="check-in-item-content">
                  <view class="check-in-item-reward">{{
                    checkIn.status === "checked" ? `+${checkIn.reward}` : "-"
                  }}</view>
                  <image
                    class="check-in-item-icon"
                    src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-coin-check-in@2x.png"
                    mode="aspectFill"
                  ></image>
                </view>
                <view class="check-in-item-date">
                  {{ checkIn.status === "checked" ? "已签" : checkIn.date }}
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="section checkin">
          <view class="section-header">
            <view class="section-header-title"> 做任务去赚跑币 </view>
          </view>
          <view class="section-content">
            <view class="task-item">
              <view class="task-item-left">
                <image
                  class="task-item-icon"
                  src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-coin-check-in@2x.png"
                  mode="aspectFill"
                ></image>
                <view class="task-item-content">
                  <view class="task-item-title">
                    <view class="task-item-title-text">每日任务</view>
                    <view class="task-item-title-reward">
                      <text>+100</text>
                      <image
                        class="task-item-title-reward-icon"
                        src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-coin-check-in@2x.png"
                        mode="aspectFill"
                      ></image>
                      <text>封顶</text>
                    </view>
                  </view>
                  <view class="task-item-description"
                    >跑步达3km以上(有效次数1次)</view
                  >
                </view>
              </view>
              <u-button
                type="primary"
                size="small"
                color="#FF8C00"
                shape="circle"
                customStyle="width:124rpx;height:60rpx;margin:0"
              >
                去跑步
              </u-button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <view class="footer-title">
        <text class="footer-title-text">跑币规则</text>
        <u-icon name="arrow-right" size="12" color="#FF8C00"></u-icon>
      </view>
      <view class="footer-description"
        >备注：每日发放十万跑币，运动有效打卡赠100跑币/人封顶，当日发放即止。</view
      >
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

// 使用store
const store = useStore();

// 计算属性
const userInfo = computed(() => store.state.userInfo);

const isRemind = ref(true);

// status: checked active inactive
const checkIns = ref([
  {
    date: "01-01",
    reward: 100,
    status: "checked",
  },
  {
    date: "01-02",
    reward: 100,
    status: "active",
  },
  {
    date: "01-03",
    reward: 100,
    status: "inactive",
  },
  {
    date: "01-04",
    reward: 100,
    status: "inactive",
  },
  {
    date: "01-05",
    reward: 100,
    status: "inactive",
  },
  {
    date: "01-06",
    status: "inactive",
    reward: 100,
  },
  {
    date: "01-07",
    status: "inactive",
    reward: 100,
  },
]);
</script>

<style lang="less" scoped>
.content {
  position: relative;
  padding: 0 34rpx;
  .bg1 {
    position: absolute;
    top: 32rpx;
    right: -90rpx;
    width: 520rpx;
    height: 342rpx;
    z-index: -1;
  }
  .bg2 {
    position: absolute;
    top: -84rpx;
    right: -10rpx;
    width: 398rpx;
    height: 364rpx;
    z-index: -1;
  }
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20rpx;
  flex-shrink: 1;
  flex-grow: 1;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  flex-grow: 1;
  flex-shrink: 1;
  height: auto;
}
.balance {
  color: #ffffff;
  gap: 0;
  padding: 0 16rpx;
  .title {
    font-size: 24rpx;
    font-weight: bold;
  }
  .money {
    font-size: 64rpx;
    font-weight: 800;
    margin-top: 22rpx;
  }
  .description {
    font-size: 24rpx;
    font-weight: 500;
    margin-top: 32rpx;
  }
}
.section {
  background: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  padding: 30rpx 24rpx;
  width: 100%;
  height: 100%;
  flex-shrink: 1;
  flex-grow: 1;
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 26rpx;
    margin-bottom: 16rpx;
    border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
  }
  .section-header-title {
    display: flex;
    align-items: center;
    gap: 20rpx;
    font-weight: bold;
    font-size: 34rpx;
    color: #000000;
  }
  .section-header-title-description {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-weight: 500;
    font-size: 24rpx;
    color: #b0b0b0;
  }
  .section-header-title-description-number {
    font-weight: 800;
    color: #ff8c00;
  }
  .section-header-checkbox {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-weight: 500;
    font-size: 24rpx;
    color: #b0b0b0;
  }
  .section-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-content-left {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }
  .section-content-title {
    display: flex;
    align-items: center;
    gap: 20rpx;
    font-weight: bold;
    font-size: 30rpx;
    color: #000000;
  }
  .section-content-title-icon {
    width: 68rpx;
    height: 68rpx;
    background: #ff8c00;
    border-radius: 16rpx;
    padding: 10rpx;
    box-sizing: border-box;
  }
  .section-content-description {
    font-weight: 500;
    font-size: 24rpx;
    color: #999999;
  }
  .section-content-icon {
    width: 53rpx;
    height: 68rpx;
  }
}
.check-in-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  .check-in-item-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    width: 77rpx;
    height: 130rpx;
    background: #feefdc;
    border-radius: 73rpx 73rpx 73rpx 73rpx;
    color: #efa742;
    font-weight: bold;
    font-size: 24rpx;
  }
  .check-in-item-date {
    font-size: 20rpx;
    color: #000000;
  }
  &--checked {
    .check-in-item-date {
      color: #b0b0b0;
    }
  }
  &--active {
    .check-in-item-content {
      background: #ffca42;
      color: #fff;
    }
  }
  &--inactive {
    .check-in-item-content {
      background: #fafafa;
    }
  }
  .check-in-item-icon {
    width: 40rpx;
    height: 40rpx;
  }
}
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 151rpx;
  padding: 20rpx 18rpx;
  box-sizing: border-box;
  background: #fafafa;
  border-radius: 20rpx 20rpx 20rpx 20rpx;
  .task-item-left {
    display: flex;
    gap: 10rpx;
    .task-item-icon {
      width: 112rpx;
      height: 112rpx;
      background: #f2f1f0;
      border-radius: 34rpx 34rpx 34rpx 34rpx;
    }
    .task-item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8rpx;
      .task-item-title {
        display: flex;
        align-items: center;
        gap: 20rpx;
      }
      .task-item-title-text {
        font-weight: bold;
        font-size: 30rpx;
        color: #000000;
      }
      .task-item-title-reward {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-size: 24rpx;
        color: #ff8c00;
        .task-item-title-reward-icon {
          width: 40rpx;
          height: 40rpx;
        }
      }
      .task-item-description {
        font-weight: bold;
        font-size: 20rpx;
        color: #b0b0b0;
      }
    }
  }
}
.footer {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom) + 48rpx);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30rpx;
  .footer-title {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-weight: bold;
    font-size: 24rpx;
    color: #ff8c00;
    &:active {
      opacity: 0.8;
    }
  }
  .footer-description {
    padding: 0 34rpx;
    font-weight: bold;
    font-size: 20rpx;
    color: rgba(0, 0, 0, 0.5);
  }
}
</style>
