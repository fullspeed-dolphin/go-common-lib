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