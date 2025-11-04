<template>
  <view class="page">
    <u-navbar autoBack placeholder title="创建跑团"></u-navbar>
    <view style="padding: 20rpx 34rpx">
      <u--form
        :model="form"
        ref="uForm"
        :rules="rules"
        labelPosition="top"
        labelWidth="auto"
      >
        <view class="u--FileUploader">
          <u-form-item :label="null" prop="poster">
            <FileUploader v-model="form.poster" />
          </u-form-item>
        </view>

        <u-form-item label="跑团名称" prop="name" required>
          <u-input v-model="form.name" placeholder="请输入名称" />
        </u-form-item>
        <view class="u--textarea">
          <u-form-item
            label="跑团详情"
            prop="description"
            labelPosition="top"
            required
          >
            <u--textarea
              v-model="form.description"
              :height="110"
              maxlength="150"
              placeholder="请填写跑团详情"
              count
            ></u--textarea>
          </u-form-item>
        </view>
        <!-- <u-form-item label="跑团地址" prop="location" required>
					<u-input v-model="form.location" placeholder="请选择地址" />
				</u-form-item> -->
        <u-form-item label="跑团地址" prop="location" required>
          <PickerMap
            :title="null"
            v-model="form.location"
            placeholder="请选择地址"
          />
        </u-form-item>
        <u-form-item label="成立时间" prop="establish_time">
          <PickerTime
            v-model="form.establish_time"
            placeholder="请输入成立时间"
          />
          <!-- <u-input v-model="form.establish_time" placeholder="请输入创建时间" /> -->
        </u-form-item>
        <!-- <u-form-item label="成员数量" prop="amount" required>
					<u-input v-model="form.amount" type="digit" placeholder="请输入成员数量" />
				</u-form-item> -->
        <u-form-item label="真实姓名" prop="fullName" required>
          <u-input v-model="form.fullName" placeholder="请输入您的真实姓名" />
        </u-form-item>
        <u-form-item label="联系电话" prop="phone" required>
          <u-input v-model="form.phone" placeholder="请输入您的联系电话" />
        </u-form-item>
      </u--form>

      <view class="txt flex-start mt30 pt20">
        <text @click="isAgree = !isAgree">
          <u-icon
            size="15"
            :color="isAgree ? '#FF8C00' : '#999'"
            :name="isAgree ? 'checkmark-circle-fill' : 'checkmark-circle'"
          ></u-icon>
          <text class="ml5">我已阅读并同意该</text>
        </text>
        <text
          style="color: #ff8c00"
          @click="$u.route('pagesSub/settings/agreement?type=privy')"
          >《用户隐私协议》</text
        >
      </view>
      <view class="" style="padding: 60rpx 8rpx 30rpx">
        <u-button type="primary" shape="circle" @click="submitForm()"
          >{{ group_id ? "更新跑团" : "创建跑团" }}
        </u-button>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";
import FileUploader from "@/components/common/fileUploader.vue";
import PickerMap from "@/components/common/PickerMap.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import dayjs from "dayjs";

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance();

// 使用store
const store = useStore();

// 模板引用
const uForm = ref(null);

// 响应式数据
const group_id = ref("");
const from = ref("");
const form = ref({
  poster: "",
  name: "",
  location: "",
  description: "",
  fullName: "",
  phone: "",
  // amount: '',
  establish_time: dayjs().valueOf(),
});
const isAgree = ref(false);
const rules = ref({
  poster: [
    {
      required: true,
      message: "请点击上传跑团 logo",
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
  location: [
    {
      required: true,
      message: "必填项",
      trigger: ["blur", "change"],
    },
  ],
  // amount: [{
  // 	required: true,
  // 	message: '必填项',
  // 	trigger: ['blur', 'change']
  // }],
  fullName: [
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
  phone: [
    {
      required: true,
      message: "请输入有效手机号",
      pattern:
        /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
      trigger: ["blur", "change"],
    },
  ],
});

// 页面加载
onLoad((options) => {
  console.log("option", options);
  group_id.value = options.group_id;

  from.value = options.from;
  getDetail();
});

// 方法定义
const getDetail = (page) => {
  form.value.phone = store.state.userInfo.phone;
  if (!group_id.value) return;
  proxy.$axios
    .get(`/running-group/api/v1/groups/info?group_id=${group_id.value}`)
    .then((res) => {
      form.value = {
        poster: res.avatar_url,
        name: res.name,
        location: res.establish_location,
        description: res.introduction,
        fullName: res.creator_real_name,
        phone: res.creator_phone,
        // amount: String(res.total_members),
        establish_time: dayjs(res.establish_time).valueOf(),
      };

      isAgree.value = true;
    });
};

const submitForm = () => {
  uForm.value.validate().then((res) => {
    const token = uni.getStorageSync("token");
    if (!token) {
      proxy.$toast("请先登录~");
      setTimeout(() => {
        proxy.$goUrl("/pagesSub/login");
      }, 1000);
      return;
    }

    if (!isAgree.value) return proxy.$toast("请勾选同意协议");

    const data = {
      avatar_url: form.value.poster,
      name: form.value.name,
      establish_location: form.value.location,
      creator_real_name: form.value.fullName,
      // "total_members": form.value.amount,
      introduction: form.value.description,
      creator_phone: form.value.phone,
      establish_time: form.value.establish_time,
    };
    uni.showLoading({
      mask: true,
    });

    let url = "/running-group/api/v1/groups";

    // 更新跑团
    if (group_id.value) {
      url = "/running-group/api/v1/groups/update";
    }
    proxy.$axios.post(url, data).then(async (res) => {
      console.log(res);

      proxy.$toast(group_id.value ? "更新成功" : "创建成功");

      const res1 = await store.dispatch("getUserInfo");

      // 跳转回上一级页面，返回上一页并传递参数
      uni.$emit("updateList", {
        isChange: true,
        from: from.value,
        group_id: res1.running_group,
      });

      setTimeout(() => {
        uni.navigateBack();
      }, 500);
    });
  });
};
</script>

<style scoped>
.submit-btn {
  width: 682rpx;
  height: 72rpx;
  margin: 48rpx auto;
  border-radius: 16rpx;
  font-weight: bold;
  font-size: 30rpx;
  color: #ff8c00;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep {
  .pickerTime {
    width: 100%;
    .u-cell {
      border: 0;
      min-height: 88rpx;
      background: rgba(255, 255, 255);
      border-radius: 16rpx;
      background: #ffffff;
      box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0, 0, 0, 0.16);
    }
    .u-cell__body {
      padding-right: 20rpx;
    }
  }
  .pickermap {
    width: 100%;
    overflow: hidden;
    .u-cell__body {
      padding-right: 20rpx;
    }
    .u-cell__body__content {
      flex: none;
    }
    .u-cell__value {
      flex: 1 !important;
      max-width: 100% !important;
    }
  }
  .u-form-item__body__left__content__label {
    flex: unset !important;
  }
  .u-textarea__count {
    right: 20rpx !important;
    bottom: 14rpx !important;
  }
  .u-cell__right-icon-wrap {
    margin-left: 0 !important;
  }

  .u-form-item__body__left__content__required {
    position: static !important;
    top: 0 !important;
  }
  .u-form-item__body__right__message {
    margin-left: 0 !important;
    margin-top: 6rpx;
  }
  .u-border,
  .u-input {
    border: 0;
  }
  .u-textarea {
    padding-bottom: 40rpx;
    // padding-left:0;
    // padding-right:0;
  }

  .pickermap,
  .u-textarea,
  .u-input {
    border: 0;
    min-height: 88rpx;
    background: rgba(255, 255, 255);
    border-radius: 16rpx;
    background: #ffffff;
    box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0, 0, 0, 0.16);
  }

  // .u-form-item__body{
  // 	border:0;
  // 	padding:10rpx 16rpx!important;
  // 	background: rgba(255,255,255);
  // 	border-radius: 16rpx;
  // 	background: #FFFFFF;
  // 	box-shadow: 0rpx 4rpx 10rpx 2rpx rgba(0,0,0,0.16);
  // }

  .u-form-item__body {
    padding: 10px 0 5px !important;
  }
  .u--FileUploader {
    .u-form-item__body {
      box-shadow: none;
    }
    .u-upload__wrap {
      display: flex;
      justify-content: center;
      .u-upload__button {
        width: 202rpx !important;
        height: 202rpx !important;
        border-radius: 16rpx;
        margin: 0;
      }
    }
  }
  .input-placeholder {
    font-size: 24rpx;
    color: rgb(192, 196, 204);
  }
}
</style>
