// 测试版本
let baseUrl = 'https://teststudent.api.stybwl.com';
let envVersion = 'release';

// 微信小程序版本
// #ifdef MP-WEIXIN
	envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
	baseUrl = 'https://student.api.xcczy.com'
// #endif

// 生产版本
if (['release'].includes(envVersion)) {
	baseUrl = 'https://student.api.xcczy.com'
}


export const baseLink = baseUrl
export const isRelease =['release'].includes(envVersion);


export function toast(txt) {
    uni.showToast({
        icon: "none",
        title: txt || ''
    })
}

import store from "@/store/index.js"
export function clearUserInfo() {
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')
	
	store.commit('set', {
		type: 'userInfo',
		data: {}
	})
}