<template>
  <view class="">
    <u-navbar autoBack placeholder title="运动截图打卡"></u-navbar>

    <block v-if="pageIndex === 0 || !ruleForm.picture">
      <section class="u-pl-30 u-pt-40" style="margin-bottom: 140rpx;">
        <view class="u-flex-y-center" style="font-weight: 800;font-size: 48rpx;">
          <view class="iconfont icon-pulse-fill" style="color:#FF8C00;font-size: 48rpx;margin-right: 18rpx;"></view>
          全速运动
        </view>
        <view class="u-mt-20" style="color: #6A7282;">记录每一次汗水，赢取跑币奖励</view>

        <div class="u-flex-row u-flex-wrap">
          <view class="event-item" :class="{ 'active': item.checked }" :style="item.checked && item.gradient ? { background: `linear-gradient(90deg, ${item.gradient[0]}, ${item.gradient[1]})`, borderColor: item.gradient[0], color: '#fff' } : item.gradient ? { borderColor: item.gradient[0], color: item.gradient[0] } : {}" @click="selectEvent(item)" v-for="(item,index) in options_events" :key="index">
            {{item.label}}
          </view>
        </div>
      </section>
    </block>

    <section class="flex-center" :style="isSuccess ? 'margin-top: 30rpx;' : 'margin-top: 80rpx;'" @click="checkBeforeUpload">
      <view :class="isSuccess ? 'upload-wrapper-confirm' : 'upload-wrapper'">
        <FileUpload v-model="ruleForm.picture" additional="ocr-checkin" isCustom :readonly="!hasCheckedEvent" :width="isSuccess ? 500 : 448" :height="isSuccess ? 750 : 600" @change="onImageUploaded">
          <template #trigger>
            <view class="section-upload flex-col-center" style="color: #99A1AF;line-height: 1.3;">
              <view class="iconfont flex-center icon-shangchuan"></view>
              <view style="font-size: 34rpx;font-weight: 500; color:#000;margin-bottom:20rpx;">上传运动截图</view>
              <view>支持主流运动</view>
              <view>APP截图自动</view>
              <view>识别数据</view>
            </view>
          </template>
        </FileUpload>
      </view>
    </section>

    <!-- 底部信息区 -->
    <view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="bottom-info-content">
      <view @click="$u.route('pagesSport/punchInRule?type=rule')" style="color:#777;font-size: 24rpx;position: fixed;right:0;top: 220rpx;background: #ddd;padding: 10rpx 20rpx; border-radius: 32rpx 0 0 32rpx;"
        class="rule-link flex-center">
        打卡规则
      </view>
      <view class="" style="font-size: 24rpx;color: #E53935;margin-top: 90rpx;padding-left:34rpx; line-height: 34rpx;text-align: left;">
        <view>1. 每日打卡即可获跑币，每日上限 100 个跑币(1km=10 跑币)。</view>
        <view>2. 截图需清晰显示时间+类型+数据(跑步/健走≥1km)。 </view>
        <view>3. 当日运动当日23:59前通过小程序上传，逾期无效。 </view>
        <view>4. 盗用/篡改截图将取消权益并记录违规。</view>
        <view>5. 不提供非技术原因补录历史数据的服务。</view>
      </view>
      <view class="tac" style="font-size: 16rpx;color: #99A1AF;margin-top: 40rpx;">
        <text style="color: #E53935;">安全提示：</text> 身体健康者参与，不适即停，风险自担； 选安全场地，避恶劣天气。
      </view>
    </view>

    <!-- 底部固定文字 -->
    <view v-if="pageIndex === 0 || !ruleForm.picture || !isSuccess" class="powered-by-fixed">由全速科技AI平台强势驱动</view>

    <section v-if="isSubmiting" class="section-loading flex-center">
      <view class="panel1 bgf flex-col-center">
        <view style="margin-bottom: 40rpx; ">
          <up-loading-icon mode="circle" color="#FF8C00" textSize="40"></up-loading-icon>
        </view>
        <view style="font-weight: 600;font-size: 34rpx;margin-bottom: 30rpx;">系统正在识别</view>
        <view style="color: #6C7484;">智能提取数据中，请不要离开页面...</view>
      </view>
    </section>

    <block v-if="pageIndex === 1 && ruleForm.picture && exerciseInfo.distance">
      <section class="form-fields-confirm">
        <view style="font-weight: 800;font-size: 32rpx;">
          <up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
          识别结果
        </view>
        <view class="u-flex-row">
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #EFF6FF;">
              <up-icon name="map" size="40rpx" color="#2B7FFF" />
            </view>
            <view class="value">{{exerciseInfo.distance || 0}}</view>
            <text class="label-text">距离(KM)</text>
          </view>
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #FFF7ED;">
              <view class="iconfont icon-jishiqi" style="color:#FF8C00"></view>
            </view>
            <view class="value">{{exerciseInfo.duration || 0}}</view>
            <text class="label-text">时长</text>
          </view>
          <view class="cell-item flex-col-center">
            <view class="label flex-center" style="background: #FAF5FF;">
              <view class="iconfont icon-shandianshandianfahuotuikuan" style="color:#AF4BFF"></view>
            </view>
            <view class="value">{{exerciseInfo.pace || 0}}</view>
            <text class="label-text">配速</text>
          </view>
        </view>
      </section>
      <view class="flex-center" style="color:#99A1AF;margin-top:30rpx;font-size: 24rpx;">
        请核对上方数据是否与截图一致
      </view>
      <view class="flex-center" style="position: fixed; bottom: 30rpx; width: 100%; padding: 0 30rpx;">
        <u-button type="primary" custom-style="width:642rpx;" color="#ff8c00" shape="circle" :loading="isChecking" :disabled="isChecking" @click="confirmToCheck()">提交数据</u-button>
      </view>
    </block>

    <view v-if="isSuccessCheck" class="check flex-center b" style="width: 344rpx;
			height: 96rpx; position: fixed; left: 50%;top: 50%; transform: translate(-50%, -50%);
			background: #404040; color: #fff;font-size: 32rpx;
			border-radius: 46rpx 46rpx 46rpx 46rpx;">
      <up-icon name="checkmark-circle" size="40rpx" color="#00C950" />
      <view class="u-ml-10">后台核验成功</view>
    </view>

    <SharePoster ref="refSharePoster" @close="onPosterClose" />

    <!-- 固定联系客服按钮 -->
    <button class="kefu-btn" open-type="contact">
      <view class="iconfont icon-kefu"></view>
      <view class="kefu-label">客服</view>
    </button>

    <up-modal :show="isShowModal" open-type="contact" :title="modalTitle" :content="modalErrorText" cancelText="联系客服" confirmText="知道了" contentTextAlign="center" cancelColor="rgb(41, 121, 255)" confirmColor="#ff8c00"
      @confirm="() => uni.navigateBack()" showCancelButton :asyncClose="true" />

    <UserLogin ref="refUserLogin" @success="onLoginSuccess" />
  </view>
</template>
<script setup>
import { ref, computed, nextTick } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import FileUpload from "@/components/common/FileUpload.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import UserLogin from "@/components/UserLogin.vue";
import AccessUser from "@/components/common/AccessUser.vue";
import SharePoster from "./SharePoster.vue";
import request from "../utils/request";
import { useShare } from "@/composables/useShare.js";
import dayjs from "dayjs";
import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const refUserLogin = ref(null);

// 授权登录后的回调，用户授权后的跳转
const loginCallBack = ref(null);
function onLoginSuccess() {
	setTimeout(() => {
		loginCallBack?.value?.();
	}, 500);
}

// 分享配置
useShare({
  title: "运动截图打卡",
  path: "/pagesSport/punchInUpload",
});

const refSharePoster = ref(null);

const routerParams = ref({});
const options_events = ref([]);
const myEvents = ref([]);
function getMyEvents() {
	if (!userInfo.value.id) {
		loginCallBack.value = getMyEvents;
    
		nextTick(() => {
			refUserLogin.value.open();
		})
		
		return
  }

  request.get("/event-api/online_events/my_events", {}, { showError: false }).then((res) => {
    const now = dayjs();
    let activeEvents = (res || []).filter((i) => {
      return now.isAfter(dayjs(i.start_time)) && now.isBefore(dayjs(i.end_time));
    });

    options_events.value = [
      ...activeEvents.map((i) => ({
        label: i.event_name,
        value: i.event_id,
        gradient: i.color_config?.gradient || null,
        checked: true,
      })),
      {
        label: "打卡送跑币",
        value: "default",
        checked: true,
      },
    ];

    console.log("options_events", options_events.value);
  });
}

function selectEvent(item) {
  item.checked = !item.checked;
}

const hasCheckedEvent = computed(() =>
  options_events.value.some((i) => i.checked)
);

function checkBeforeUpload() {
  if (!userInfo.value.id) {
		loginCallBack.value = getMyEvents;
    return refUserLogin.value.open();
  }
}

const pageIndex = ref(0);

const exerciseInfo = ref({
  distance: "",
  duration: "",
  pace: "",
});

const isSubmiting = ref(false);
const isSuccess = ref(false);
const isSuccessCheck = ref(false);
const isSubmitted = ref(false); // 标记用户是否已提交数据
const isChecking = ref(false); // 提交打卡中，防止重复点击

// 删除已上传的图片
const deleteUploadedImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    await request.post(
      "/basic-service/file/delete",
      {
        url: imageUrl,
      },
      { showError: false }
    );
    console.log("已删除上传的图片:", imageUrl);
  } catch (error) {
    console.error("删除图片失败:", error);
  }
};

onLoad((options) => {
  routerParams.value = options;
  getMyEvents();
});

// 页面卸载时检查是否需要删除图片
onUnload(() => {
  // 如果有上传的图片且用户没有提交数据，则删除图片
  if (ruleForm.value.picture && !isSubmitted.value) {
    deleteUploadedImage(ruleForm.value.picture);
  }
});

const isShowModal = ref(false);
const modalTitle = ref("");
const modalErrorText = ref("");
function showModal({ title, content }) {
  modalTitle.value = title || "提示";
  modalErrorText.value = content || "请稍后重试";
  isShowModal.value = true;
}

function onPosterClose() {
  uni.navigateBack();
}

// 图片上传成功后调用OCR识别
let verifyToken = "";
const onImageUploaded = async (imageUrl) => {
  if (!imageUrl) return;

  // 重置状态，确保加载时背景显示上传界面
  isSuccess.value = false;
  pageIndex.value = 0;

  try {
    isSubmiting.value = true;

    let res = await request.post(
      "/ocr-api/recognize",
      {
        image_url: imageUrl,
      },
      { showError: false, includeResponse: true }
    );

    const dataInfo = res?.data;
    // 校验返回数据是否有效（不为空、不为0）
    const isValidData =
      dataInfo &&
      dataInfo.km &&
      dataInfo.km !== "0" &&
      dataInfo.km !== "0.00" &&
      dataInfo.time &&
      dataInfo.time !== "00:00" &&
      dataInfo.time !== "00:00:00" &&
      dataInfo.speed;

    if (isValidData) {
      verifyToken = dataInfo.token;

      // 将识别结果填入
      exerciseInfo.value.distance = dataInfo.km;
      exerciseInfo.value.duration = dataInfo.time;
      exerciseInfo.value.pace = dataInfo.speed;

      isSuccess.value = true;
      // uni.showModal({
      // 	title: '打卡成功',
      // 	content: res?.msg || '打卡成功',
      // 	showCancel: false,
      // 	success: () => {
      // 		uni.redirectTo({
      // 			url: '/pagesSub/runCoin/myCoin'
      // 		});
      // 	}
      // });
    } else {
      // 识别失败，删除已上传的图片
      deleteUploadedImage(imageUrl);
      ruleForm.value.picture = "";
      isSuccess.value = false;
      showModal({
        title: "识别失败",
        content:
          res?.msg || "无法识别截图中的运动数据，请确保上传的是有效的运动截图",
      });
    }
  } catch (error) {
    isSuccess.value = false;
    // 识别失败，删除已上传的图片
    deleteUploadedImage(imageUrl);
    ruleForm.value.picture = "";

    uni.hideLoading();
    console.error("OCR识别失败:", error);
    showModal({
      title: "识别失败",
      content: error?.msg || error?.message || "识别服务异常，请稍后重试",
    });
  }

  isSubmiting.value = false;
  pageIndex.value = 1;
};

const ruleForm = ref({
  picture: "",
});

function confirmToCheck() {
  if (isChecking.value) return;
  isChecking.value = true;
  request
    .post(
      "/ocr-api/checkin",
      {
        token: verifyToken,
        event_ids: options_events.value
          .filter((i) => i.checked)
          .map((i) => i.value),
      },
      { showError: false, includeResponse: true }
    )
    .then((res) => {
      // 标记已提交，防止页面卸载时删除图片
      isSubmitted.value = true;
      // 显示"后台核验成功"弹窗
      isSuccessCheck.value = true;

      uni.setStorageSync("punchInUploadResult", res);

      function extractNumbers(str) {
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number)?.[0] : "";
      }

      // 从 events(.id) 和 results(.event_id) 合并打卡次数
      const checkinCounts = {};
      res.data.events?.forEach((e) => {
        if (e.checkin_count != null) checkinCounts[e.id] = e.checkin_count;
      });
      res.data.results?.forEach((r) => {
        if (r.checkin_count != null)
          checkinCounts[r.event_id] = r.checkin_count;
      });

      // 只为 results 中 success === true 的活动生成海报
      const successEventIds = (res.data.results || [])
        .filter((r) => r.success)
        .map((r) => r.event_id);

      if (successEventIds.length) {
        refSharePoster.value.open({
          ...userInfo.value,
          distance: parseFloat(res.data.km),
          duration: res.data.time,
          pace: res.data.speed,
          coinAmount: extractNumbers(res?.msg || ""),
          coinAmountMsg: res?.msg,
          checkinCounts,
          checkinTime: dayjs().format("YYYY年MM月DD日 HH:mm"),
          eventIds: successEventIds,
          events: res.data.events || [],
        });
      }

      // 2秒后隐藏弹窗并跳转
      // setTimeout(() => {
      // 	isSuccessCheck.value = false
      // 	uni.$u.route('pagesSport/recognizeSuccess', res)
      // }, 2000)
    })
    .catch((err) => {
      console.log("err======>", err);
      isChecking.value = false;
      showModal({
        title: "打卡失败",
        content: err?.msg || "请稍后重试",
      });
    });
}
</script>

<style lang="scss" scoped>
.event-item {
  padding: 15rpx 20rpx;
  border: 1px solid #ff8c00;
  border-radius: 32rpx;
  margin: 20rpx 20rpx 0 0;
  color: #ff8c00;
  font-size: 24rpx;
  &.active {
    background: #ff8c00;
    color: #fff;
  }
}
.section-loading {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  .panel1 {
    width: 606rpx;
    height: 404rpx;
    background: #ffffff;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
  }
}

.form-fields {
  width: 686rpx;
  height: 412rpx;
  padding: 50rpx;
  margin-top: 48rpx;
  margin: 48rpx auto 0;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx solid #f3f4f6;
}

.cell-item {
  font-weight: bold;
  margin-top: 40rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
  border-right: 2rpx solid #f3f4f6;
  &:last-child {
    border: 0;
  }
  .label {
    width: 80rpx;
    height: 80rpx;
    font-size: 40rpx;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
  }
  .label-text {
    font-size: 24rpx;
    color: #6a7282;
  }

  .value {
    width: 206rpx;
    height: 44rpx;
    margin-top: 30rpx;
    margin-bottom: 20rpx;
    font-weight: 800;
    font-size: 44rpx;
    text-align: center;
  }
}

/* 固定联系客服按钮 */
.kefu-btn {
  position: fixed;
  right: 24rpx;
  top: 1060rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: #18b566;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 10;
  box-shadow: 0 6rpx 18rpx rgba(24, 181, 102, 0.25);
  line-height: 1;
  .icon-kefu {
    font-size: 38rpx;
  }
  .kefu-label {
    font-size: 16rpx;
    color: #fff;
    margin-top: 6rpx;
  }
}

::v-deep {
  .sharePoster{
      .u-popup__content__close{
        left: 50rpx!important;
        top: 150rpx!important;
        right: auto!important;
      }
  }

  .uicon-arrow-right {
    color: #ff8c00 !important;
  }
  .upload-wrapper {
    .uicon-checkmark-circle {
      font-weight: 800;
    }
    .iconfont {
      width: 160rpx;
      height: 160rpx;
      color: #ff8c00;
      font-size: 52rpx;
      background: #f8eee0;
      margin-bottom: 40rpx;
      border-radius: 64rpx 64rpx 64rpx 64rpx;
    }
    .u-upload {
      width: 448rpx !important;
      height: 600rpx !important;
    }

    .u-upload__wrap {
      width: 448rpx !important;
      height: 600rpx !important;
    }

    .custom-preview {
      border: 2rpx solid #ff8c00;
      border-radius: 16rpx;
      background: #f5f5f5;
    }

    .u-upload__wrap__preview__image {
      width: 448rpx !important;
      height: 600rpx !important;
      border-radius: 16rpx;
      border: 2rpx solid #ff8c00;
    }
  }

  .upload-wrapper-confirm {
    .custom-preview {
      border: 2rpx solid #ff8c00;
      border-radius: 16rpx;
      background: #f5f5f5;
    }
  }

  .section-upload {
    width: 448rpx;
    height: 600rpx;
    border-radius: 36rpx;
    border: 10rpx dashed #d1d5dc;
    line-height: 40rpx;

    .icon {
      margin-bottom: 42rpx;
    }

    .u-icon__icon {
      color: #ff8c00;
    }
  }
}

.form-fields-confirm {
  width: 686rpx;
  padding: 20rpx 50rpx;
  margin: 20rpx auto 0;
  border-radius: 32rpx;
  border: 2rpx solid #f3f4f6;

  .cell-item {
    margin-top: 20rpx;
    .value {
      margin-top: 15rpx;
      margin-bottom: 10rpx;
    }
  }
}

.bottom-info-content {
  text-align: center;
  padding: 40rpx 0 30rpx;

  .rule-link {
    color: rgba(255, 140, 0, 0.75);
    font-size: 28rpx;
    line-height: 40rpx;
    padding: 10rpx 0;
  }
}

.powered-by-fixed {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 140, 0, 0.75);
  font-size: 28rpx;
}
</style>
