import { clearUserInfo} from "@/utils/util.js"
import { baseLink } from "@/utils/config.js"

function fetch(options) {
	return new Promise((resolve, reject) => {
		let url = options.url;
		// #ifdef MP-WEIXIN
			url = baseLink + url
		// #endif
		
		// #ifndef MP-WEIXIN
			if (process.env.NODE_ENV == "development") {
				url = location.origin + '/dev-api' + url
			}
		//  #endif
		
		var requestTask = uni.request({
			url: url,
			sslVerify: false,
			header: {
				Authorization: uni.getStorageSync('token'),
				'content-type': 'application/json',
			},
			method: options.method || 'post',
			data: options.data || {},
			success(res) {
				uni.hideLoading();
				
				// 请求省市区接口，直接返回数据
				if (options.url.includes('.json')) {
					return resolve(res.data)
				}
				
				const response = res?.data;
				
				// #ifdef MP-WEIXIN
					console.log('\n')
					console.log("接口 url======>", options.url, " ", options.data)
					console.log("接口 res======>", response)
				// #endif
				
				// 登录过期
				if (response?.code != 200) {
					if (response?.code !== 400 && options.showError !== false) {
						uni.showToast({
							icon: 'error',
							title: response.msg || '请求失败'
						})
					}
					
					// 没有权限，清除 token，重定向登录页
					if (response?.code == 401 || res.statusCode == 401) {
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
				
				if (response?.code == 200) {
					// 向后兼容：默认只返回 data
					// 如需完整响应（含 msg），调用时传入 includeResponse: true
					if (options.includeResponse) {
						resolve({
							data: response.data,
							msg: response.msg
						})
					} else {
						resolve(response.data)
					}
				}
			},
			fail(err) {
				console.error(err)
				reject(err)
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
	post(url, data, options = {}) {
		return fetch({
			method: "post",
			data,
			url,
			...options
		})
	},
}