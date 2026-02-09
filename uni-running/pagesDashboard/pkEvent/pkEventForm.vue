<template>
  <view class="form-page">
    <up-form :model="form" ref="uForm" :rules="rules" labelPosition="top" labelWidth="auto">

      <view class="card-section">
				<up-form-item label="真实姓名" prop="name" required>
					<view class="flex-start input-wrap">
						<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的真实姓名" />
					</view>
				</up-form-item>
				<up-form-item label="联系电话" prop="phone" required class="last-item">
					<view class="flex-start input-wrap">
						<input v-model="form.phone" class="u-input" @input="validateField('phone')" maxlength="11" placeholder-style="color: #64748B;" placeholder="请输入您的联系电话" />
					</view>
				</up-form-item>
				<up-form-item label="收货地址" prop="name" required>
					<view class="flex-start input-wrap">
						<input v-model="form.name" class="u-input" @input="validateField('name')" maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的收货地址" />
					</view>
				</up-form-item>
				<up-form-item label="选择套餐" prop="categoryType" required>
					<view class="u-pt-5">
						<view class="category-item u-flex-row" :class="{active: form.categoryType === 1}" @click="form.categoryType = 1">
							<view class="iconfont flex-center icon-shoppingbaggouwudai"></view>
							<view>
								<view class="name">A套餐 - 基础约定</view>
								<view class="target">52元约定金</view>
								<view class="txt">报名参加活动达成月度打卡任务即可退还约定金</view>
							</view>
						</view>
						<view class="category-item u-flex-row " :class="{active: form.categoryType === 2}" @click="form.categoryType = 2">
							<view class="iconfont flex-center icon-shoppingbaggouwudai"></view>
							<view>
								<view class="name">B套餐 - 悦跑礼包</view>
								<view class="target">52元约定金 + 99元</view>
								<view class="txt">让爱意随脚步延伸</view>
							</view>
						</view>
					</view>
				</up-form-item>
      </view>
    </up-form>

    <view class="submit-wrapper flex-between-center bgf" style="padding: 34rpx 32rpx;">
      <view class="" style="font-size: 24rpx;color: #6A7282;">
        应付金额
        <view class="u-mt-10" style="font-weight: bold;font-size: 40rpx;color: #E11D48;">
          ￥151.00
        </view>
      </view>
      <u-button type="primary" color="#E11D48" shape="circle" customStyle="width: 196rpx;height: 72rpx;margin:0;border-radius: 32rpx;" @click="submitForm()">
        立即支付
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
const activetyId = ref("");

const group_id = ref("");
const form = ref({
  poster: "",
  name: "",
  categoryType: 1,
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
  group_id.value = options.group_id;
  activetyId.value = options.id;
  // form.value = options.from;
  getDetail();
  // 套餐列表
  getComboList();
});

// 方法定义
const getDetail = (page) => {
  if (!group_id.value) return;
  request
    .get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
    .then((res) => {
      form.value = {
        ...res,
        poster: res.avatar_url,
        name: res.name,
      };
    });
};

const submitForm = () => {
  uForm.value.validate().then((res) => {
    if (!isAgree.value) return uni.$u.toast("请勾选同意协议");

    const data = {
      avatar_url: form.value.poster,
      name: form.value.name,
      club_type: form.value.club_type,
      establish_location: form.value.establish_location,
      creator_real_name: form.value.fullName,
      introduction: form.value.description,
      creator_phone: form.value.phone,
    };
    uni.showLoading({
      mask: true,
    });

    let url = "/running-group/api/v1/groups";

    // 更新跑团
    if (group_id.value) {
      url = "/running-group/api/v1/groups/update";
    }
    request
      .post(url, data)
      .then(async (res) => {
        console.log(res);

        // 跳转回上一级页面，返回上一页并传递参数
        uni.$emit("updateList", {
          isChange: true,
          from: from.value,
          group_id: res1.running_group,
        });

        // 创建俱乐部时显示审批提示弹窗
        if (!group_id.value) {
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
// 获取套餐列表
const getComboList = (type,id) => {
  // let url = !type ? '/ranking/personal?activity_id=' + id : '/ranking/team?activity_id='+ id
  request.get(`/online_activity_package?activity_id=${activetyId.value}`).then(res => {
    if (res.code === 200) {
      rankList.value = res.data
    }
  })
}
</script>

<style lang="less" scoped>
	.input-wrap{
		height: 100rpx;
		padding-left: 30rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid #E2E8F0;
	}
.category-item {
  width: 686rpx;
  height: 222rpx;
  padding: 42rpx 20rpx 0 34rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx solid #e2e8f0;
  margin-bottom: 20rpx;

  .iconfont {
    width: 80rpx;
    height: 80rpx;
    background: #f3f4f6;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
    margin-right: 26rpx;
    font-size: 40rpx;
    font-weight: 500;
  }

  .name {
    font-weight: 500;
    line-height: 48rpx;
    font-size: 32rpx;
    color: #101828;
  }

  .target {
    line-height: 48rpx;
    font-size: 32rpx;
    color: #e11d48;
		font-weight: 500;
    margin-bottom: 10rpx;
  }

  &.active {
    background: #fff1f2;
    border: 2rpx solid #e11d48;

    .iconfont {
      background: #fff;
      color: #e11d48;
    }
  }

  .txt {
    color: #929dae;
    font-size: 24rpx;
    line-height: 1.2;
  }
}

// 卡片通用样式
.card-section {
	padding: 0 32rpx;
  margin-bottom: 24rpx;
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
  padding: 0 32rpx;
}

// 提交按钮
.submit-wrapper {
  padding: 60rpx 8rpx 30rpx;
}

::v-deep {
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