<template>
  <view class="form-page">
    <up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">
      <view class="card-section logo-card">
        <view class="flex-center">
          <up-form-item :label="null" prop="poster">
            <FileUpload v-model="form.poster" @change="validateField('poster')" />
          </up-form-item>
        </view>
        <view class="logo-hint" style="color:#64748B">点击上方设置团队专属头像</view>
      </view>

      <!-- 基本信息分组 -->
      <view class="card-section">
        <view class="section-content">
          <up-form-item label="团队名称" prop="name" required>
            <view class="flex-start" style="
height: 100rpx;
background: #F5F8FB;
padding-left: 30rpx;
border-radius: 16rpx 16rpx 16rpx 16rpx;
border: 2rpx solid #E2E8F0;">
              <div style="width: 606rpx;">
								<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="给你的战队起个响亮的名字吧~" />
							</div>
            </view>
          </up-form-item>
          <up-form-item label="选择组别" prop="categoryType" required>
            <view class="flex-between-center u-pt-5">
              <view class="category-item flex-col-center" v-for="(item,index) in  packageList" :key="index" :class="{active: form.categoryType === item.target_km}" 
							@click="form.categoryType = (item.target_km)">
                <view class="iconfont icon-xunhuan1-M" v-if="index==0" style="color:#2B7FFF;"></view>
                <view class="iconfont icon-aixin" v-else style="color:#F6339A;"></view>
                <view class="target">{{item.target_km}}公里</view>
                <view class="txt">{{ item.description }}</view>
              </view>
            </view>
          </up-form-item>
          <view class="textarea-cell">
            <up-form-item label="团队介绍" prop="description" required>
              <view class="u-pt-5" style="position: relative;">
                <textarea v-model="form.description" class="u-input" @input="validateField('description')" :height="110" placeholder-style="color: #64748B;" maxlength="150" placeholder="写一段话激励你的队友..." count></textarea>
                <view class="" style="position: absolute;right:10rpx;bottom:10rpx;font-size: 24rpx;color: #999;">
                  {{form.description.length}}/150
                </view>
              </view>
            </up-form-item>
          </view>
        </view>
      </view>
    </up-form>

    <view class="submit-wrapper">
      <u-button type="primary" color="linear-gradient(64deg, #C70036 0%, #D2003C 20%, #DD0043 40%, #E90249 60%, #F41450 80%, #FF2056 100%)" shape="circle" customStyle="width: 686rpx;height: 96rpx;border-radius: 32rpx;"
        @click="submitForm()">
        立即创建战队
      </u-button>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import FileUpload from "@/components/common/FileUpload.vue";
import PickerMap from "@/components/common/PickerMap.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import request from "@/utils/request.js";

const uForm = ref(null);
const activetyId = ref(""); // 活动ID
const packageList = ref({}); // 组别

const form = ref({
  poster: "",
  name: "",
  categoryType: '',
  description: "",
});

function validateField(propName) {
  uForm.value.validateField(propName, () => {}, "change");
}

const rules = ref({
  poster: [
    {
      required: true,
      message: "请点击上传图片",
      trigger: ["blur", "change"],
    },
  ],
  name: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  description: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
});

// 页面加载
onLoad((options) => {
  console.log("option", options);
  activetyId.value = options.id;
  getPackageData();
});

const submitForm = () => {
  uForm.value.validate().then((res) => {
    const data = {
			"event_id": activetyId.value,
			"team_avatar_url": form.value.poster,
			"team_goal_km": form.value.categoryType,
			"team_introduction": form.value.description,
			"team_name": form.value.name
    };
		
    uni.showLoading({
      mask: true,
    });

    let url = "/event-api/online_events_team/create";

    request
      .post(url, data)
      .then((res) => {
        console.log(res);

        // 跳转回上一级页面，返回上一页并传递参数
        uni.$emit("updateList", {
          isChange: true,
        });

        if (!activetyId.value) {
          uni.showModal({
            title: "提示",
            content: "你的俱乐部正在审批中，审批完成之后将在此显示",
            showCancel: false,
            confirmText: "我知道了",
            success: () => {
              uni.navigateBack();
            },
          });
        } else {
          // 更新俱乐部时直接提示并返回
          uni.$u.toast("更新成功");
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        }
      })
      .catch((e) => {
        uni.hideLoading();
        uni.showModal({
          title: "提示",
          content: e.msg,
          showCancel: false, // 如果不需要“取消”按钮
          confirmText: "我知道了",
        });
      });
  });
};
// 获取组别
const getPackageData = () => {
  request.get("/event-api/online_events/" + activetyId.value).then((res) => {
    packageList.value = res?.group_config?.groups || {};

		form.value.categoryType = packageList.value[0]?.target_km || '';

		console.log("packageList.value", form.categoryType);
  });
};
</script>

<style lang="less" scoped>
.category-item {
  width: 310rpx;
  height: 266rpx;
  background: #ffffff;
  border-radius: 36rpx 36rpx 36rpx 36rpx;
  border: 3rpx solid #e2e8f0;
  color: #64748b;
  .iconfont {
    font-size: 42rpx;
  }
  .target {
    font-size: 40rpx;
    margin: 40rpx 0;
  }
  &.active {
    background: #eff6ff;
    // border: 2rpx solid #bedbff;
    outline: 4rpx solid #d1d0f2;
    .target {
      color: #155dfc;
    }
    .txt {
      color: #568afd;
    }
  }

  .txt {
    color: #929dae;
  }
}
// 页面整体样式
.form-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  box-sizing: border-box;
}

// 卡片通用样式
.card-section {
  margin-bottom: 24rpx;
  overflow: hidden;
}

// Logo 卡片特殊样式
.logo-card {
  padding: 40rpx 20rpx 30rpx;
  text-align: center;
}

.logo-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

// 分组标题
.section-header {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

// 表单内容区
.section-content {
  padding: 0 24rpx;
}

// 提交按钮
.submit-wrapper {
  padding: 60rpx 8rpx 30rpx;
}

::v-deep {
  .textarea-cell {
    .u-input {
      width: 100%;
      height: 200rpx;
      border: 1px solid #ebedf0;
      border-radius: 16rpx;
      padding: 16rpx;
      box-sizing: border-box;
      text-align: left;
      background: #f5f8fb;
    }
  }

  .u-form-item__body__left__content__required {
    top: 0;
    font-size: 14px;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    order: 1 !important;
    margin-left: 4rpx !important;
  }
  .u-form-item__body__left__content__label {
    flex: none;
  }

  .u-FileUploader {
    .u-upload__wrap {
      display: flex;
      justify-content: center;

      .u-upload__button {
        background: #fafafa;
        border-radius: 16rpx;
      }
    }
  }
}
</style>