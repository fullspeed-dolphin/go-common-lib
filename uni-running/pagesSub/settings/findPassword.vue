<template>
  <view class="page1" style="padding-top:30rpx;">
    <view class="panel p0">
      <van-cell title="手机号" title-width="80px" center>
        <uni-easyinput v-model="phone" :inputBorder="false" :trim="true" :clearable="false" maxlength="11" placeholder="请输入" />
      </van-cell>

      <van-cell class="verify-cell" title="验证码" title-width="80px" center>
        <uni-easyinput v-model="verifyCode" type="number" :inputBorder="false" :trim="true" :clearable="false" maxlength="50" placeholder="请输入" />
        <template #right-icon>
          <van-button :disabled="isSendCode" type="default" @click="getCode">
        </template>
          <view class="flex-start" style="color: #323232" v-if="isSendCode">
            <van-count-down :time="seconds * 1000" format="ss" @finish="finishTime" /> s
          </view>
          <block v-else>获取验证码</block>
        </van-button>
      </van-cell>

      <van-cell title="新密码" title-width="80px" center>
        <uni-easyinput v-model="password" type="password" :inputBorder="false" :trim="true" :clearable="false" maxlength="20" placeholder="请输入" />
      </van-cell>
      <van-cell title="确认密码" title-width="80px" center>
        <uni-easyinput v-model="password1" type="password" :inputBorder="false" :trim="true" :clearable="false" placeholder="请输入" maxlength="30" />
      </van-cell>
    </view>
    <view style="padding:45rpx 60rpx;">
      <van-button type="primary" round block class="submit-btn" @click="submit">提交</van-button>
      <!-- <van-button v-if="pageIndex===2" type="primary" round block class="submit-btn" @click="submit">下一步</van-button> -->
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCurrentInstance } from 'vue'

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 响应式数据
const pageIndex = ref(1)
const checked = ref(true)
const curAreaCode = ref('+65')

const phone = ref('')
const verifyCode = ref('')
const password = ref('')
const password1 = ref('')

const isShowCodePop = ref(false)

const isSendCode = ref(false)
const seconds = ref(60)
const smsPhone = ref('')
const smsCode = ref('')
const actions = ref([
	{
		name: '+86'
	},
	{
		name: '+65'
	}
])

// 页面加载
onLoad(() => {
	// const phone = this.$route.query.phone
	// if (phone) {
	// 	this.parentPhone = phone
	// }
})

// 方法定义
const onSelectCode = ({ detail }) => {
	console.log(detail)
	curAreaCode.value = detail.name
}

const changeCheckBox = ({ detail }) => {
	checked.value = detail
}

const finishTime = () => {
	isSendCode.value = false
}

const onChangeInput = ({ currentTarget, detail }) => {
	// this[currentTarget.dataset.type] = detail.trim()
}

const getCode = () => {
	if (isSendCode.value) return

	if (!phone.value.length) {
		return uni.$u.toast('请输入手机号')
	}
	// if (!(/^1[3456789]\d{9}$/.test(phone))) {
	//   return uni.$u.toast('手机号码格式有误')
	// }
	const data = {
		telPhone: phone.value
	}
	proxy.$axios({ url: `api/user/sendCode`, data }).then(res => {
		uni.$u.toast('短信验证码已经发送')
		isSendCode.value = true
		seconds.value = 60
	})
}

const submit = async () => {
	if (!phone.value.length) {
		return uni.$u.toast('请输入手机号')
	}

	// if (!(/^1[3456789]\d{9}$/.test(phone))) {
	//   return uni.$u.toast('手机号码格式有误')
	// }

	if (!verifyCode.value.length) {
		return uni.$u.toast('请输入验证码')
	}
	if (!password.value.length) {
		return uni.$u.toast('请输入新密码')
	}
	// if (password.length < 6) {
	//   return uni.$u.toast('密码长度应该为6位')
	// }

	if (!password1.value.length) {
		return uni.$u.toast('请输入确认密码')
	}

	const data = {
		telPhone: phone.value,
		code: verifyCode.value,
		password1: password.value,
		password2: password1.value
	}

	proxy.$axios({ url: 'api/user/findPassword', data }).then(res => {
		uni.$u.toast('重置成功，请重新登录')
		setTimeout(() => {
			uni.redirectTo({
				url: '/pagesSub/login'
			})
		}, 300)
	})
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
