<template>
  <view class="page1" style="padding-top:30rpx;">
    <BackHome />
    <view class="panel p0">
      <van-cell :title="$t('手机号') + '(+65)'" title-width="80px" center>
        <uni-easyinput v-model="phone" :inputBorder="false" :trim="true" :clearable="false" maxlength="10" placeholder="请输入" />
      </van-cell>

      <van-cell class="verify-cell" :title="$t('验证码')" title-width="80px" center>
        <uni-easyinput v-model="verifyCode" type="number" :inputBorder="false" :trim="true" :clearable="false" maxlength="50" placeholder="请输入" />
        <template #right-icon>
          <van-button :disabled="isSendCode" type="default" @click="getCode">
        </template>
          <view class="flex-start" style="color: #323232" v-if="isSendCode">
            <van-count-down :time="seconds * 1000" format="ss" @finish="finishTime" /> s
          </view>
          <block v-else>{{$t('获取验证码')}}</block>
        </van-button>
      </van-cell>

      <van-cell :title="$t('新密码')" title-width="80px" center>
        <uni-easyinput v-model="password" type="password" :inputBorder="false" :trim="true" :clearable="false" maxlength="20" placeholder="请输入" />
      </van-cell>
      <van-cell :title="$t('确认密码')" title-width="80px" center>
        <uni-easyinput v-model="password1" type="password" :inputBorder="false" :trim="true" :clearable="false" placeholder="请输入" maxlength="30" />
      </van-cell>
    </view>
    <view style="padding:45rpx 60rpx;">
      <van-button type="primary" round block class="submit-btn" @click="submit">{{$t('提交')}}</van-button>
      <!-- <van-button v-if="pageIndex===2" type="primary" round block class="submit-btn" @click="submit">下一步</van-button> -->
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      pageIndex: 1,
      checked: true,
      curAreaCode: '+65',

      phone: '',
      verifyCode: '',
      password: '',
      password1: '',

      isShowCodePop: false,

      isSendCode: false,
      seconds: 60,
      smsPhone: '',
      smsCode: '',
      actions: [
        {
          name: '+86'
        },
        {
          name: '+65'
        }
      ]
    }
  },
  onLoad() {
    // const phone = this.$route.query.phone
    // if (phone) {
    // 	this.parentPhone = phone
    // }
  },
  methods: {
    onSelectCode({ detail }) {
      console.log(detail)
      this.curAreaCode = detail.name
    },
    changeCheckBox({ detail }) {
      this.checked = detail
    },
    finishTime() {
      this.isSendCode = false
    },
    onChangeInput({ currentTarget, detail }) {
      this[currentTarget.dataset.type] = detail.trim()
    },
    getCode() {
      const { isSendCode, phone } = this
      if (isSendCode) return

      if (!phone.length) {
        return this.$toast(this.$t('请输入手机号'))
      }
      // if (!(/^1[3456789]\d{9}$/.test(phone))) {
      //   return this.$toast('手机号码格式有误')
      // }
      const data = {
        phone
      }

      this.$axios({ url: `api/index/get_login_yzm`, data }).then(res => {
        this.smsCode = res.code
        this.$toast(this.$t('短信验证码已经发送'))
        this.isSendCode = true
        this.seconds = 60
      })
    },
    async submit() {
      const { phone, verifyCode, password, password1 } = this

      if (!phone.length) {
        return this.$toast(this.$t('请输入手机号'))
      }

      // if (!(/^1[3456789]\d{9}$/.test(phone))) {
      //   return this.$toast('手机号码格式有误')
      // }

      if (!verifyCode.length) {
        return this.$toast(this.$t('请输入验证码'))
      }
      if (!password.length) {
        return this.$toast(this.$t('请输入新密码'))
      }
      if (password.length < 6) {
        return this.$toast(this.$t('密码长度应该为6位'))
      }

      if (!password1.length) {
        return this.$toast(this.$t('请输入确认密码'))
      }

      const data = {
        phone: this.phone,
        yzm: this.verifyCode,
        password: this.password
      }

      this.$axios({ url: 'api/index/forget_password', data }).then(res => {
        this.$toast(this.$t('重置成功，请重新登录'))
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login'
          })
        }, 300)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  padding-top: 44rpx;
  background: #fff;
}
.c0 {
  color: rgba(51, 51, 51, 1);
}
.panel {
  padding-right: 62rpx;
  padding-left: 30rpx;
}
::v-deep {
  .van-cell__title {
    font-size: 28rpx;
    color: rgba(51, 51, 51, 1);
  }
  .verify-cell {
    .van-button {
      border: 0;
      color: #097980;
      font-size: 28rpx;
      padding-right: 0;
      padding: 0 !important;
      height: auto;
      &:before {
        display: none;
      }
      &:after {
        display: none;
      }
    }
  }
  .van-cell {
    background: transparent;
    &:after {
      left: 16px;
    }
  }
}

.page {
  padding: 0px 40rpx;
  min-height: 100vh;
  line-height: 1.4;
  --count-down-text-color: #fff;
}
</style>
