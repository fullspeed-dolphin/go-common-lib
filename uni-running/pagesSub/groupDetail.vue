<template>
  <view>
    <Navbar :title="pageTitle" :bgHeight="370" />

    <mescroll-empty
      v-if="isEmpty"
      mode="data"
      :option="{
        btnText: '创建跑团',
      }"
      @emptyclick="$u.route(`pagesSub/groupForm?from=mine`)"
    />

    <block v-if="!isEmpty">
      <section class="section-card flex-col-center">
        <image
          class="img"
          :src="
            detail.avatar_url ||
            'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
          "
          mode="aspectFill"
        ></image>
        <view class="name ellipsis2">{{ detail.name }}</view>
        <view class="flex-between-center c9 b">
          <view class="cell-item">{{ detail.establish_time }} 成立</view>
          <view class="cell-item">跑团ID {{ detail.group_id }}</view>
        </view>
        <view class="cell-item flex-row c9 b">
          <u-icon name="map" size="12" color="#999"></u-icon>
          <view class="flex-1">
            {{ detail.establish_location }}
          </view>
        </view>
      </section>

      <section class="section-summary panel flex-row">
        <view class="flex-1 flex-col-center">
          <view class="number">
            {{ detail.total_members }}
          </view>
          成员人数
        </view>
        <view class="divider"></view>
        <view class="flex-1 flex-col-center">
          <view class="number">
            {{ detail.gender_ratio }}
          </view>
          男女比例
        </view>
        <view class="divider"></view>
        <view class="flex-1 flex-col-center">
          <view class="number">
            {{ detail.total_members }}
          </view>
          上月总跑量
        </view>
        <view class="divider"></view>
        <view class="flex-1 flex-col-center">
          <view class="number">
            {{ detail.total_members }}
          </view>
          周人均跑量
        </view>
      </section>

      <section class="section-intro panel">
        <view class="h4">跑团介绍</view>
        <view style="font-weight: 500; line-height: 34rpx">
          {{ detail.introduction }}
        </view>
      </section>

      <section class="panel">
        <view class="h4">跑团管理</view>
        <view class="bar flex-start">团长</view>
        <view class="flex-between-center">
          <view class="leader-item flex-start">
            <view class="img-box">
              <image
                class="img"
                :src="
                  memberLeader.avatar_url ||
                  'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
                "
                mode="aspectFill"
              ></image>
            </view>
            <view class="">
              <view class="mb10 ellipsis mt10" style="width: 320rpx">{{
                memberLeader.nickname || "成员"
              }}</view>
              <!-- {{memberLeader.user_phone}} -->
            </view>
          </view>
          <view style="width: 120rpx">
            <u-button
              type="primary"
              color="#FF8C00"
              size="mini"
              style="width: 120rpx"
              shape="circle"
              @click="callPhone(memberLeader.user_phone)"
            >
              联系Ta
            </u-button>
          </view>
        </view>

        <view class="bar flex-between-center">
          成员
          <view
            v-if="memberList.length >= 8"
            class="flex-center"
            style="font-size: 20rpx"
            @click="viewMoreMembers()"
          >
            <text style="color: #ff8c00; margin-right: 5rpx">查看更多</text>
            <u-icon name="arrow-right" color="#FF8C00" size="10"></u-icon>
          </view>
        </view>

        <view class="flex-row flex-wrap">
          <view
            class="member-item flex-col-center"
            v-for="(item, index) in memberList"
            :key="index"
          >
            <view class="img-box">
              <image
                class="img"
                :src="
                  item.avatar_url ||
                  'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
                "
                mode="aspectFill"
              ></image>
            </view>
            <view class="">
              <view class="mb10 ellipsis tac mt10" style="width: 120rpx">{{
                item.nickname || "成员"
              }}</view>
            </view>
          </view>
        </view>

        <mescroll-empty
          v-if="!memberList.length"
          :option="{ tip: '暂无跑团成员~' }"
        />
      </section>

      <section class="section-intro panel">
        <view class="h4"
          >成员跑量排行榜<image
            src="https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/icon-top5@2x.png"
            style="width: 77rpx; height: 23rpx"
            mode="aspectFill"
          ></image
        ></view>
        <view style="font-weight: 500; line-height: 34rpx">
          <view class="flex-col">
            <view
              class="member-item flex-row-center"
              v-for="(item, index) in memberList"
              :key="index"
            >
              <view class="flex-row-center">
                <view class="number">{{ index + 1 }}</view>
                <view class="img-box">
                  <image
                    class="img"
                    :src="
                      item.avatar_url ||
                      'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/run.png'
                    "
                    mode="aspectFill"
                  ></image>
                </view>
                <view class="ellipsis name" style="width: 120rpx">{{
                  item.nickname || "成员"
                }}</view>
              </view>
              <view class="score"> 100km </view>
            </view>
          </view>
        </view>
      </section>

      <view class="" style="height: 120rpx"></view>
      <!-- 未加入跑团，才可加入跑团 -->
      <section
        v-if="!userInfo.running_group && detail.user_role === 'guest'"
        class="section-bottom"
      >
        <view style="padding: 56rpx 54rpx 40rpx">
          <u-button
            type="primary"
            color="#FF8C00"
            shape="circle"
            customStyle="height: 80rpx;"
            @click="joinGroup()"
            >加入跑团</u-button
          >
        </view>
      </section>

      <!-- 团长才可修改 -->
      <section v-if="detail.user_role === 'creator'" class="section-bottom">
        <view style="padding: 0rpx 30rpx 40rpx" class="flex-between-center">
          <u-button
            type="primary"
            color="#f2f2f2"
            shape="circle"
            customStyle="height: 80rpx;width: 320rpx;color: #FF8C00;"
            @click="deleteGroup()"
            >删除跑团</u-button
          >
          <u-button
            type="primary"
            color="#FF8C00"
            shape="circle"
            customStyle="height: 80rpx;width: 320rpx;color: #FF8C00;"
            @click="updateGroup()"
            >更新跑团</u-button
          >
        </view>
      </section>

      <section v-if="detail.user_role === 'member'" class="section-bottom">
        <view style="padding: 56rpx 54rpx 40rpx">
          <u-button
            type="primary"
            color="#FF8C00"
            shape="circle"
            customStyle="height: 80rpx; color: #FF8C00;"
            @click="leaveGroup()"
            >退出跑团</u-button
          >
        </view>
      </section>
    </block>

    <UserLogin ref="refUserLogin" />
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onLoad, onUnload, onShow } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";
import UserLogin from "@/components/UserLogin.vue";
import Navbar from "@/components/navbar.vue";

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 使用store
const store = useStore();

// 模板引用
const refUserLogin = ref(null);

// 响应式数据
const isEmpty = ref(false);
const detail = ref({});
const routeParams = ref({});
const memberList = ref([]);
const memberLeader = ref({});

// 计算属性
const pageTitle = computed(() => {
  return routeParams.value.from === "mine" ? "我的跑团" : "跑团详情";
});

const userInfo = computed(() => store.state.userInfo);

// 页面加载
onLoad((options) => {
  console.log("option", options);
  routeParams.value = options;

  if (!options.group_id || options.group_id === "null") {
    isEmpty.value = true;
    return;
  }

  getDetail();

  // #ifdef MP-WEIXIN
  wx.showShareMenu();
  // #endif
});

// 页面卸载
onUnload(() => {
  uni.removeStorageSync("groupDetail");
});

// 页面显示
onShow(() => {
  // 移除全局自定义事件监听器
  uni.$off("updateList");

  // 监听全局的自定义事件
  uni.$once("updateList", (data) => {
    // 判断从我的跑团创建，返回没有跑团 ID，页面空白的问题
    if (data.from === "mine" && data.group_id) {
      routeParams.value.group_id = data.group_id;
      getDetail();
    }
  });
});

// 方法定义
const viewMoreMembers = () => {
  uni.$u.route(
    `pagesSub/groupMemberList?group_id=${routeParams.value.group_id}`
  );
};

const getDetail = (page) => {
  const groupDetail = uni.getStorageSync("groupDetail");
  if (groupDetail) {
    detail.value = groupDetail;
  }

  uni.showLoading({ mask: true });

  proxy.$axios
    .get(
      `/running-group/api/v1/groups/info?group_id=${routeParams.value.group_id}`
    )
    .then((res) => {
      res.establish_time = res.establish_time.slice(0, 10);
      detail.value = res;

      getMemberList();
    });
};

const getMemberList = () => {
  const data = {
    pageIndex: 0,
    pageSize: 9,
    groupId: Number(detail.value.group_id),
  };
  proxy.$axios
    .post(`/running-group/api/v1/groups/members`, data)
    .then((res) => {
      memberLeader.value =
        (res.memberships || []).find((i) => i.role === "creator") || {};
      memberList.value = (res.memberships || []).filter(
        (i) => i.role !== "creator"
      );
    });
};

const joinGroup = () => {
  if (!store.state.userInfo.id) {
    return refUserLogin.value.open();
  }
  uni.showModal({
    title: "提示",
    content: "是否确认加入该跑团？",
    success: (res) => {
      if (res.confirm) {
        const data = {
          running_group: Number(detail.value.group_id),
        };

        uni.showLoading({ mask: true });
        proxy.$axios
          .post(`/user-api/user/joinRunningGroup`, data)
          .then((res) => {
            uni.hideLoading();
            getDetail();
            proxy.$toast("加入成功！");
          });
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const updateGroup = () => {
  uni.$u.route(`pagesSub/groupForm?group_id=${detail.value.group_id}`);
};

const deleteGroup = () => {
  uni.showModal({
    title: "提示",
    content: "是否确认删除该跑团？",
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ mask: true });
        proxy.$axios
          .delete(
            `/running-group/api/v1/groups?group_id=${detail.value.group_id}`
          )
          .then((res) => {
            proxy.$toast("删除成功！");

            // 调用用户数据，检查参加或创建跑团标记
            store.dispatch("getUserInfo");

            setTimeout(() => {
              uni.navigateBack();
            }, 300);
          });
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const leaveGroup = () => {
  uni.showModal({
    title: "提示",
    content: "是否确认退出该跑团？",
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ mask: true });
        proxy.$axios.post(`/user-api/user/quitRunningGroup`).then((res) => {
          proxy.$toast("操作成功！");

          // 调用用户数据，检查参加或创建跑团标记
          store.dispatch("getUserInfo");

          getDetail();
        });
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const callPhone = (phoneNumber) => {
  uni.makePhoneCall({
    phoneNumber,
  });
};
</script>

<style lang="less" scoped>
.section-summary {
  height: 126rpx;
  font-weight: bold;
  font-size: 20rpx;
  color: #999999;
  .number {
    font-size: 30rpx;
    color: #000000;
    line-height: 50rpx;
    margin-bottom: 10rpx;
  }
  .divider {
    width: 1rpx;
    height: 58rpx;
    background-color: #f3f3f3;
    align-self: center;
  }
}
.bar {
  height: 48rpx;
  padding: 0 14rpx;
  background: #f3f3f3;
  font-size: 28rpx;
  color: #000;
  font-weight: bold;
  border-radius: 8rpx 8rpx 8rpx 8rpx;
}
.h4 {
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: relative;
  font-weight: 800;
  font-size: 28rpx;
  color: #000000;
  line-height: 38rpx;
  padding-left: 20rpx;
  margin-bottom: 28rpx;
  &:before {
    position: absolute;
    content: "";
    width: 8rpx;
    left: 0;
    height: 38rpx;
    background: #ff8c00;
    border-radius: 4rpx 4rpx 4rpx 4rpx;
  }
}
.section-intro {
  font-weight: bold;
  font-size: 24rpx;
  color: #999999;
  padding-bottom: 40rpx;
}
.cell-item {
  min-width: 120rpx;
  padding: 6rpx 10rpx 10rpx 0;
  font-size: 24rpx;
}
.leader-item {
  padding: 16rpx 0 28rpx;
  font-weight: bold;
  font-size: 26rpx;
  color: #000000;
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    margin-right: 12rpx;
    overflow: hidden;
  }
  .img {
    display: block;
    width: 70rpx;
    height: 70rpx;
    background: #f5f5f5;
  }
}
.member-item {
  padding: 20rpx;
  color: #000;
  font-size: 24rpx;
  .number {
    font-weight: bold;
    font-size: 30rpx;
    color: #707070;
    margin-right: 20rpx;
  }
  .name {
    text-align: left;
    margin-left: 30rpx;
  }
  .score {
    font-weight: bold;
    font-size: 24rpx;
    color: #000000;
  }
  .img-box {
    border-radius: 999px;
    background: #ffffff;
    margin-right: 12rpx;
    overflow: hidden;
    border: 1rpx solid #f5f5f5;
  }
  .img {
    display: block;
    width: 70rpx;
    height: 70rpx;
    background: #f5f5f5;
  }
}
.section-card {
  padding: 34rpx 34rpx 0;
  // background: linear-gradient( 180deg, #FFF5E8 0%, #FFFFFF 100%);
  .img {
    display: block;
    width: 142rpx;
    height: 142rpx;
    background: #f5f5f5;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
  }
  .name {
    font-weight: 800;
    font-size: 36rpx;
    color: #000000;
    line-height: 50rpx;
    margin-top: 16rpx;
    margin-bottom: 18rpx;
  }
  .text {
    font-weight: 500;
    font-size: 24rpx;
    line-height: 32rpx;
  }
}

.h2 {
  font-size: 32rpx;
  font-weight: 600;
}

.cell {
  line-height: 47rpx;
  .label {
    width: 174rpx;
    color: #66768a;
  }
  .value {
    color: #212121;
    line-height: 36rpx;
    width: 450rpx;
  }
}

.section-bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
}
.u-border-left {
  border-color: #f3f3f3;
}
</style>
