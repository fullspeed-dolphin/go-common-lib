import { clearUserInfo} from "@/utils/util.js"
import { baseLink } from "@/utils/config.js"

import store from "@/store/index.js"

function fetch(options) {
	return new Promise((resolve, reject) => {
		let {
			url,
			data: reqParams,
			method = 'post',
			isShowLoading = false
		} = options
		
		// 临时 token 用来处理用户完善信息，防止用户没有完善信息进行登陆
		let requestHeader = {
			'Authorization': `Bearer ${uni.getStorageSync('token')}`,
			'content-type': 'application/json',
		}
		
		// #ifdef MP-WEIXIN
			url = baseLink + url
		// #endif
		
		// #ifndef MP-WEIXIN
		if (process.env.NODE_ENV == "development") {
			url = location.origin + '/dev-api' + url
		} else {
			url = window.$appLink + url
		}
		let token;
		// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOiIxNzQ0MDM0OTEzIiwiZXhwIjoxNzQ2NjI2OTEzLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjA4ZGQ3NTEwLTY5NmMtYzE2MC01MjU0LTAwZmFlZGM2MDAwMCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJNZW1iZXIiLCJpc3MiOiJmb3JlaWduX3RyYWRlX2NybS5jb20iLCJhdWQiOiJmb3JlaWduX3RyYWRlX2NybS5jb20ifQ.aVztzCpVoM_QA35ax9tHx0WXIJo8P69RFzDYKnebdbc"
		// uni.setStorageSync("token", token);
		//  #endif
		 
		 setTimeout(() => {
			 resolve({List: [{}, {}, {}, {}]});
		 }, 1000)
		return
		var requestTask = uni.request({
			url,
			sslVerify: false,
			header: requestHeader,
			method,
			data: reqParams,
			success(res) {
				// return resolve()
				// uni.hideLoading()
				if (process.env.NODE_ENV !== "development") {
					console.log("接口 url======>", options.url)
					console.log("接口 reqParams======>", reqParams)
					console.log("接口 res======>", res)
				}
				
				let response = res.data;
				
				// 登录过期
				if (response?.Code != 200 || res.statusCode != 200) {
					uni.showToast({
						icon: 'error',
						title: response.Msg || '请求失败'
					})
					
					uni.hideLoading()
					
					if (response?.Code == 401 || res.statusCode == 401 || (url.includes('store/account/info') && res.statusCode != 200)) {
						clearUserInfo();
						
						// setTimeout(() => {
						// 	uni.redirectTo({
						// 		url: '/pagesSub/login'
						// 	})
						// }, 300)
						
						return false;
					}
					return reject(response)
				}
		
				if (response?.Code == 200) {
					uni.hideLoading();
					resolve(response.Data)
				}
			},
			fail(err) {
				console.error(err)
				// reject(err)
				setTimeout(() => {
					resolve()
				}, 100)
			}
		});
	})
}

export default {
	get(url, data) {
		return fetch({
			method: "get",
			data,
			url
		})
	},
	delete(url, data) {
		return fetch({
			method: "delete",
			data,
			url
		})
	},
	put(url, data) {
		return fetch({
			method: "put",
			data,
			url
		})
	},
	post(url, data) {
		return fetch({
			method: "post",
			data,
			url
		})
	},
}