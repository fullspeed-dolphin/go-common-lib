<template>
  <view class="page-container">
    <u-navbar title="活动详情" autoBack placeholder>
      <!-- <template #right>
        <u-icon name="more-dot-fill" size="20" color="#1A1A1A" @click="showMore"></u-icon>
      </template> -->
    </u-navbar>

    <!-- 封面图轮播 -->
    <view class="banner">
      <swiper class="banner-swiper" :indicator-dots="coverImages.length > 1" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FFFFFF">
        <swiper-item v-for="(img, idx) in coverImages" :key="idx">
          <image class="banner-img" :src="img + '?x-oss-process=image/resize,w_750'" mode="aspectFill" @click="previewImage(idx)" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- 活动标题 -->
      <text class="event-title">{{ detail.name }}</text>

      <!-- 信息区 -->
      <view class="info-card">
        <view class="info-row" v-if="fscInfo">
          <text class="info-label">跑团</text>
          <text class="info-value info-value-link" @click="$u.route(`pagesSub/runningTeam/teamDetail?group_id=${detail.fsc_id}`)">{{ fscInfo.name }} ›</text>
        </view>
        <view class="info-row" v-if="detail.contact">
          <text class="info-label">发起</text>
          <view class="info-value-row">
            <image class="info-avatar" src="/static/images/user.png" mode="aspectFill" />
            <text class="info-value">{{ detail.contact }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">类型</text>
          <view class="info-value-row">
            <view class="type-tag tag-fsc">跑团活动</view>
            <view class="type-tag" :class="Number(detail.is_free) === 1 ? 'tag-free' : 'tag-paid'">
              {{ Number(detail.is_free) === 1 ? '免费' : '付费' }}
            </view>
          </view>
        </view>
        <view class="info-row" v-if="detail.event_time">
          <text class="info-label">时间</text>
          <text class="info-value">{{ detail.event_time }}</text>
        </view>
        <view class="info-row" v-if="detail.event_location">
          <text class="info-label">地点</text>
          <text class="info-value info-value-link" @click="copyText(detail.event_location)">{{ detail.event_location }}</text>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="divider"></view>

      <!-- Tab 切换 -->
      <view class="tab-row">
        <view class="tab-item" :class="{ 'tab-active': activeTab === 'intro' }" @click="activeTab = 'intro'">
          <text class="tab-text">活动介绍</text>
          <view class="tab-bar" v-if="activeTab === 'intro'"></view>
        </view>
        <view class="tab-item" :class="{ 'tab-active': activeTab === 'members' }" @click="activeTab = 'members'">
          <text class="tab-text">参与成员 ({{ memberList.length }})</text>
          <view class="tab-bar" v-if="activeTab === 'members'"></view>
        </view>
      </view>

      <!-- 活动介绍 -->
      <view v-if="activeTab === 'intro'" class="desc-section">
        <view class="desc-box" v-if="detail.description">
          <text class="desc-text">{{ detail.description }}</text>
        </view>
        <rich-text v-if="detail.text" :nodes="detail.text" class="rich-text-content"></rich-text>
      </view>

      <!-- 参与成员 -->
      <view v-if="activeTab === 'members'" class="members-section">
        <view v-if="memberList.length > 0" class="member-list">
          <view class="member-item" v-for="(m, idx) in memberList" :key="idx">
            <image class="member-avatar" :src="m.avatar_url ? m.avatar_url + '?x-oss-process=image/resize,w_110,h_110,m_fill' : '/static/images/user.png'" mode="aspectFill" />
            <view class="member-info">
              <text class="member-name">{{ m.nickname || m.real_name || '匿名用户' }}</text>
              <text class="member-time">{{ formatMemberTime(m.created_at) }}</text>
            </view>
          </view>
        </view>
        <text v-else class="empty-text">暂无参与成员</text>
      </view>
    </view>

    <!-- 悬浮分享按钮 -->
    <view v-if="detail.status === 'ACT'" class="float-share-btn" @click="showShareBtn">
      <u-icon name="share" color="#fff" size="18"></u-icon>
    </view>

    <ShareSheet ref="refShare" />

    <!-- 底部按钮 -->
    <view class="section-bottom">
      <view class="btn-action" :class="{ 'btn-disabled': ['REJ','EXP'].includes(detail.status) || getIsOutDated() || isRegistered || isFull || !isRegistrationOpen }" @click="onActionClick()">
        <text class="btn-action-text">
          <text v-if="getIsOutDated()">
            已过期
          </text>
          <block v-else>
            <block v-if="isRegistered">已报名</block>
            <block v-else-if="isFull">报名已满</block>
            <block v-else-if="!isRegistrationOpen">报名未开放</block>
            <block v-else-if="detail.status === 'ACT'">立即报名</block>
            <block v-else-if="detail.status === 'PND'">审核中</block>
            <block v-else-if="detail.status === 'EXP'">已过期</block>
            <block v-else-if="detail.status === 'REJ'">修改活动信息并重新提交</block>
          </block>
        </text>
      </view>
    </view>

    <!-- 证件信息弹窗 -->
    <u-popup :show="showCertPopup" mode="center" round="16" @close="showCertPopup = false">
      <view class="cert-popup">
        <text class="cert-popup-title">填写证件信息</text>
        <text class="cert-popup-desc">本活动需要运动保险，请填写证件信息</text>
        <view class="cert-form">
          <view class="cert-row" v-if="isInsurance">
            <text class="cert-label">证件类型</text>
            <view class="cert-radios">
              <view class="cert-radio" :class="{ active: certForm.cert_type === 'CN_ID' }" @click="certForm.cert_type = 'CN_ID'">
                <text>身份证</text>
              </view>
              <view class="cert-radio" :class="{ active: certForm.cert_type === 'HK_MA_PASS' }" @click="certForm.cert_type = 'HK_MA_PASS'">
                <text>回乡证</text>
              </view>
            </view>
          </view>
          <view class="cert-row">
            <text class="cert-label">真实姓名</text>
            <input class="cert-input" :class="{ 'cert-input-error': nameError }" v-model="certForm.real_name" placeholder="请输入真实姓名" @blur="validateName" />
            <text class="cert-error-text" v-if="nameError">{{ nameError }}</text>
          </view>
          <view class="cert-row" v-if="isInsurance">
            <text class="cert-label">证件号码</text>
            <input class="cert-input" v-model="certForm.cert_number" :placeholder="certForm.cert_type === 'HK_MA_PASS' ? '请输入回乡证号码' : '请输入身份证号码'" />
          </view>
          <view class="cert-row">
            <text class="cert-label">手机号</text>
            <!-- <text class="cert-hint">{{ certForm.cert_type === 'HK_MA_PASS' ? '请输入港澳手机号码' : '请输入大陆手机号码（不带区号）' }}</text> -->
            <text class="cert-hint">请输入手机号码</text>
            <view class="cert-phone-wrap">
              <!-- <text class="cert-phone-prefix">{{ certForm.contact_number.length !== 11 ? '+852' : '+86' }}</text> -->
              <input
                class="cert-input cert-phone-input"
                v-model="certForm.contact_number"
                type="number"
                placeholder="请输入手机号码"
                />
                <!-- :placeholder="certForm.contact_number.length !== 11 ? '8位港澳手机号' : '11位大陆手机号'" -->
              </view>
          </view>
        </view>
        <view class="cert-actions">
          <view class="cert-btn cert-btn-cancel" @click="showCertPopup = false">
            <text>取消</text>
          </view>
          <view class="cert-btn cert-btn-confirm" @click="submitRegistrationWithCert">
            <text>确认报名</text>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 自动入团成功弹窗 -->
    <u-popup :show="showJoinGroupModal" mode="center" round="16" :closeOnClickOverlay="false">
      <view class="join-group-modal">
        <view class="join-group-icon">
          <u-icon name="checkmark-circle-fill" color="#22C55E" size="48"></u-icon>
        </view>
        <text class="join-group-title">报名成功</text>
        <view class="join-group-info" v-if="joinedGroupInfo">
          <image
            class="join-group-avatar"
            :src="joinedGroupInfo.avatar_url ? joinedGroupInfo.avatar_url + '?x-oss-process=image/resize,w_120,h_120,m_fill' : '/static/images/user.png'"
            mode="aspectFill"
          />
          <text class="join-group-text">已自动加入跑团</text>
          <text class="join-group-name">{{ joinedGroupInfo.name }}</text>
        </view>
        <view class="join-group-btn" @click="showJoinGroupModal = false">
          <text class="join-group-btn-text">我知道了</text>
        </view>
      </view>
    </u-popup>

    <PhoneLogin ref="refPhoneLogin" />
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { onLoad, onUnload, onShow,onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { useShare, buildPath } from "@/composables/useShare.js";
import { useStore } from "vuex";
import PhoneLogin from "@/components/common/PhoneLogin.vue";
import ShareSheet from "@/components/common/ShareSheet.vue";
import dayjs from "dayjs";
import request from "@/utils/request.js";

const store = useStore();
const refPhoneLogin = ref(null);
const detail = ref({});
const rawDetail = ref({}); // 未格式化的原始数据，用于边界检查
const fscInfo = ref(null);
const routerParams = ref({});
const activeTab = ref('intro');
const isRegistered = ref(false);
const isFull = ref(false);
const showCertPopup = ref(false);
const certForm = ref({ real_name: '', cert_type: 'CN_ID', cert_number: '', contact_number: '' });
const nameError = ref('');
// 姓名校验：2-12个中文，允许间隔号·（新疆等少数民族姓名）
const validateChineseName = (name) => {
  if (!name) return '请输入真实姓名';
  if (!/^[\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF\u00b7]+$/.test(name)) return '姓名仅支持中文和间隔号·';
  if (/^\u00b7|\u00b7$/.test(name)) return '间隔号不能在姓名首尾';
  if (/\u00b7{2}/.test(name)) return '间隔号不能连续使用';
  const chineseCount = name.replace(/\u00b7/g, '').length;
  if (chineseCount < 2) return '姓名至少2个中文字';
  if (chineseCount > 12) return '姓名不能超过12个中文字';
  return '';
};
const validateName = () => {
  const name = certForm.value.real_name.trim();
  if (!name) { nameError.value = ''; return; }
  nameError.value = validateChineseName(name);
};
const memberList = ref([]);
const showJoinGroupModal = ref(false);
const joinedGroupInfo = ref(null);

const userInfo = computed(() => store.state.userInfo);

// 切换证件类型时清空手机号
watch(() => certForm.value.cert_type, () => {
  certForm.value.contact_number = '';
});

// 封面图（兼容单URL和JSON数组）
const coverImages = computed(() => {
  const url = detail.value.background_image_url;
  if (!url) return [];
  if (url.startsWith('[')) {
    try {
      return JSON.parse(url).filter(Boolean);
    } catch (e) {
      return [url];
    }
  }
  return [url];
});

// 分享配置
useShare(() => ({
  title: detail.value.name || '跑团活动详情',
  path: buildPath('/pagesSub/runningTeam/teamEventDetail', { id: routerParams.value.id }),
  imageUrl: coverImages.value[0] || ''
}));

onLoad((options) => {
  routerParams.value = options;

  if (options.status === 'REJ' && options.status_message) {
    uni.showModal({
      title: '审核未通过',
      content: decodeURIComponent(options.status_message),
      showCancel: false,
      confirmText: '我知道了'
    });
  }

  uni.showLoading({ mask: true });
  Promise.all([
    getDetail(),
    checkMyRegistration(),
    getRegistrationList(),
  ]).finally(() => {
    uni.hideLoading();
  });
});

onShow(() => {
  if (routerParams.value.id) {
    Promise.all([
      getDetail(),
      checkMyRegistration(),
      getRegistrationList(),
    ]);
  }
});

onUnload(() => {
  uni.removeStorageSync("eventDetail");
});

const tempEventTime = ref('');

function getIsOutDated() {
  const t = dayjs(tempEventTime.value);
  return t.isBefore(dayjs());
};

const getDetail = () => {
  return request.get(`/event-api/fsc_events/${routerParams.value.id}`)
    .then((res) => {
      // 长图
      if (res.long_image_url) {
        res.text = `<img src="${res.long_image_url}?x-oss-process=image/resize,w_500" style="max-width:100%;" />`;
      } else {
        res.text = '';
      }

      // 时间格式化
      const time = isNaN(res.event_time) ? res.event_time : Number(res.event_time);
      const t = dayjs(time);
      tempEventTime.value = time;
      res.event_time = t.year() !== dayjs().year() ? t.format('YYYY/M/DD HH:mm') : t.format('M/DD HH:mm');

      // 报名时间
      try {
        const list = JSON.parse(res.registration_time);
        res.registration_time = `${dayjs(list[0]).format('M/DD HH:mm')} - ${dayjs(list[1]).format('M/DD HH:mm')}`;
      } catch (e) {}

      detail.value = res;
      rawDetail.value = { ...res, event_time: isNaN(res.event_time) ? res.event_time : Number(res.event_time), registration_time: res.registration_time };

      // 获取跑团信息
      if (res.fsc_id) {
        getFscInfo(res.fsc_id);
      }
    });
};

const getFscInfo = (fscId) => {
  request.get(`/running-group/api/v1/groups/info?group_id=${fscId}`)
    .then((res) => {
      fscInfo.value = res;
    }).catch(() => {});
};

const previewImage = (idx) => {
  uni.previewImage({
    current: idx,
    urls: coverImages.value,
  });
};

// 获取报名成员列表
const getRegistrationList = () => {
  return request.get(`/booking-api/fsc_events/registration/list?event_id=${routerParams.value.id}`)
    .then((res) => {
      memberList.value = res?.registrations || [];
      // 检查是否已满
      const capacity = rawDetail.value.capacity;
      if (capacity && capacity > 0 && memberList.value.length >= capacity) {
        isFull.value = true;
      }
    }).catch(() => {});
};

const formatMemberTime = (time) => {
  if (!time) return '';
  return dayjs(time).format('M/DD HH:mm') + ' 报名';
};

// 查询我的报名状态
const checkMyRegistration = () => {
  if (!userInfo.value.id) return Promise.resolve();
  return request.get(`/booking-api/fsc_events/registration/my?event_id=${routerParams.value.id}`)
    .then((res) => {
      isRegistered.value = res?.registered === true;
    }).catch(() => {});
};

// 检查报名时间窗口
const isRegistrationOpen = computed(() => {
  try {
    const raw = rawDetail.value.registration_time;
    if (!raw) return true; // 没有设置报名时间则默认开放
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length < 2) return true;
    const now = dayjs();
    return now.isAfter(dayjs(list[0])) && now.isBefore(dayjs(list[1]));
  } catch (e) {
    return true;
  }
});

// 底部按钮点击
const isInsurance = ref(false);
const onActionClick = () => {
  if (isRegistered.value) return;

  if (!userInfo.value.id) {
    return refPhoneLogin.value.open();
  }

  if (detail.value.status === 'REJ') {
    uni.$u.route("pagesSub/runningTeam/teamEventForm?event_id=" + routerParams.value.id);
    return;
  }

  if (detail.value.status !== 'ACT') return;

  // 检查报名是否已满
  if (isFull.value) {
    uni.$u.toast('报名人数已满');
    return;
  }

  // 检查报名时间窗口
  if (!isRegistrationOpen.value) {
    uni.$u.toast('不在报名时间范围内');
    return;
  }

  // 需要保险 → 弹窗输入证件；20260427需求变更为不管是否需要保险，都弹出报名
  
  showCertPopup.value = true;
  if (detail.value.need_insurance && Number(detail.value.need_insurance) === 1) {
    // showCertPopup.value = true;
    isInsurance.value = true;
  } else {
    isInsurance.value = false;
  }

  // 不需要保险 → 直接报名
  // submitRegistration();
};

// 直接报名（不需要证件）
const submitRegistration = () => {
  uni.showLoading({ mask: true, title: '报名中...' });
  request.post('/booking-api/fsc_events/registration', {
    event_id: routerParams.value.id,
  }).then((res) => {
    uni.hideLoading();
    isRegistered.value = true;
    getRegistrationList();
    if (res.auto_joined_group) {
      joinedGroupInfo.value = res.auto_joined_group;
      showJoinGroupModal.value = true;
      store.dispatch("getUserInfo");
    } else {
      uni.$u.toast('报名成功');
    }
  }).catch((e) => {
    uni.hideLoading();
    const msg = e.msg || e.message || '报名失败';
    uni.$u.toast(msg);
  });
};

// 带证件信息报名
const submitRegistrationWithCert = () => {
  certForm.value.real_name = certForm.value.real_name.trim();
  const nameErr = validateChineseName(certForm.value.real_name);
  if (nameErr) {
    uni.$u.toast(nameErr);
    return;
  }
  if(isInsurance.value) { // 有保险的情况下才需要填写证件号码
    if (!certForm.value.cert_number) {
      uni.$u.toast('请输入证件号码');
      return;
    }
  }
  if (!certForm.value.contact_number) {
    uni.$u.toast('请输入手机号');
    return;
  }
  console.log('contact_number', certForm.value.contact_number.length);
  if(certForm.value.contact_number.length == 8 || certForm.value.contact_number.length == 11) {
    if(certForm.value.contact_number.length == 8 && !/^[4-9]\d{7}$/.test(certForm.value.contact_number)) {
      uni.$u.toast('请输入正确的港澳手机号');
      return;
    }
    if(certForm.value.contact_number.length == 11 && !/^1[3-9]\d{9}$/.test(certForm.value.contact_number)) {
      uni.$u.toast('请输入正确的大陆手机号');
      return;
    }
  } else {
    uni.$u.toast('请输入正确的手机号');
    return;
  }
  // if (certForm.value.cert_type === 'CN_ID' && !/^1[3-9]\d{9}$/.test(certForm.value.contact_number)) {
  //   uni.$u.toast('请输入正确的大陆手机号');
  //   return;
  // }
  // if (certForm.value.cert_type === 'HK_MA_PASS' && !/^[4-9]\d{7}$/.test(certForm.value.contact_number)) {
  //   uni.$u.toast('请输入正确的港澳手机号');
  //   return;
  // }
  uni.showLoading({ mask: true, title: '报名中...' });
  request.post('/booking-api/fsc_events/registration', {
    event_id: routerParams.value.id,
    real_name: certForm.value.real_name,
    cert_type: certForm.value.cert_type,
    cert_number: certForm.value.cert_number,
    contact_number: certForm.value.contact_number,
  }).then((res) => {
    uni.hideLoading();
    showCertPopup.value = false;
    isRegistered.value = true;
    getRegistrationList();
    if (res.auto_joined_group) {
      joinedGroupInfo.value = res.auto_joined_group;
      showJoinGroupModal.value = true;
      store.dispatch("getUserInfo");
    } else {
      uni.$u.toast('报名成功');
    }
  }).catch((e) => {
    uni.hideLoading();
    const msg = e.msg || e.message || '报名失败';
    uni.$u.toast(msg);
  });
};

const showMore = () => {
  uni.showActionSheet({
    itemList: ['复制活动链接'],
    success: (res) => {
      if (res.tapIndex === 0 && detail.value.event_detail_url) {
        copyText(detail.value.event_detail_url);
      }
    }
  });
};

const copyText = (txt) => {
  uni.setClipboardData({ data: String(txt) });
};

const refShare = ref(null);
const showShareBtn = () => {
  refShare.value.open(
    {
      avatar_url: coverImages.value[0] || '',
      name: detail.value.name,
      establish_time: detail.value.event_time
    },
    `pagesSub/runningTeam/teamEventDetail?id=${routerParams.value.id}`
  );
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: 180rpx;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.nav-share-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;
  display: flex;
  align-items: center;

  &::after {
    display: none;
  }
}

.banner {
  width: 100%;
  height: 440rpx;
}

.banner-swiper {
  width: 100%;
  height: 440rpx;
}

.banner-img {
  width: 100%;
  height: 440rpx;
}

.content {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.event-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1.3;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.info-label {
  font-size: 28rpx;
  color: #9CA3AF;
  font-weight: 500;
  width: 80rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #1A1A1A;
}

.info-value-link {
  color: #3B82F6;
}

.info-value-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.info-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
}

.type-tag {
  font-size: 26rpx;
  font-weight: 600;
  padding: 8rpx 24rpx;
  border-radius: 10rpx;
  color: #FFFFFF;
}

.tag-fsc {
  background: #22C55E;
}

.tag-free {
  background: #10B981;
}

.tag-paid {
  background: #EF4444;
}

.divider {
  height: 1rpx;
  background: #F3F4F6;
}

.tab-row {
  display: flex;
  gap: 32rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tab-text {
  font-size: 30rpx;
  color: #9CA3AF;
}

.tab-active .tab-text {
  color: #FF8C00;
  font-weight: 700;
}

.tab-bar {
  width: 40rpx;
  height: 6rpx;
  background: #FF8C00;
  border-radius: 3rpx;
}

.desc-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.desc-box {
  background: #F9FAFB;
  border-radius: 16rpx;
  padding: 24rpx;
}

.desc-text {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
}

.rich-text-content {
  width: 100%;
}

.members-section {
  padding: 20rpx 0;
}

.member-list {
  display: flex;
  flex-direction: column;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.member-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.member-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.member-time {
  font-size: 22rpx;
  color: #9CA3AF;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
  text-align: center;
  padding: 60rpx 0;
}

.float-share-btn {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #FF8C00;
  color: #fff;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 140, 0, 0.4);
  border: none;
  padding: 0;
  margin: 0;

  &::after {
    display: none;
  }
}

.section-bottom {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  z-index: 10;
  padding: 0 30rpx 20rpx;
}

.btn-action {
  width: 100%;
  height: 84rpx;
  background: #FF8C00;
  border-radius: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action.btn-disabled {
  background: #D1D5DB;
}

.btn-action-text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}

.cert-popup {
  width: 600rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.cert-popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A1A;
  text-align: center;
}

.cert-popup-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  text-align: center;
}

.cert-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  overflow: visible;
}

.cert-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  overflow: visible;
}

.cert-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.cert-radios {
  display: flex;
  gap: 16rpx;
  padding-bottom: 2rpx;
  overflow: visible;
}

.cert-radio {
  padding: 12rpx 32rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: #F6F7F8;
  border: 1rpx solid #E5E7EB;

  &.active {
    background: #FFF5EB;
    color: #FF8C00;
    border-color: #FF8C00;
    font-weight: 500;
  }
}

.cert-hint {
  font-size: 22rpx;
  color: #FF8C00;
}

.cert-phone-wrap {
  display: flex;
  align-items: center;
  background: #F6F7F8;
  border-radius: 16rpx;
  height: 80rpx;
  padding: 0 24rpx;
  gap: 12rpx;
}

.cert-phone-prefix {
  font-size: 28rpx;
  color: #9CA3AF;
  font-weight: 500;
  flex-shrink: 0;
}

.cert-phone-input {
  flex: 1;
  background: transparent !important;
  padding: 0 !important;
  height: 100% !important;
  border-radius: 0 !important;
}

.cert-input {
  height: 80rpx;
  background: #F6F7F8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1A1A1A;
}

.cert-input-error {
  border: 1rpx solid #EF4444;
}

.cert-error-text {
  font-size: 22rpx;
  color: #EF4444;
  margin-top: 4rpx;
}

.cert-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 8rpx;
}

.cert-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.cert-btn-cancel {
  background: #F6F7F8;
  color: #6B7280;
}

.cert-btn-confirm {
  background: #FF8C00;
  color: #FFFFFF;
}

.join-group-modal {
  width: 560rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.join-group-icon {
  margin-bottom: 8rpx;
}

.join-group-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.join-group-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin: 16rpx 0;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  width: 100%;
}

.join-group-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.join-group-text {
  font-size: 26rpx;
  color: #9CA3AF;
}

.join-group-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.join-group-btn {
  width: 100%;
  height: 80rpx;
  background: #FF8C00;
  border-radius: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}

.join-group-btn-text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
