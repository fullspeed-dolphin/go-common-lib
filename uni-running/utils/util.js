import store from "@/store/index.js"
export function clearUserInfo() {
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')
	
	store.commit('set', {
		type: 'userInfo',
		data: {}
	})
}

export async function asyncAlls(jobs) {
	try {
		// 循环执行
		const results = jobs.map(async job => await job)
		const res = []
		// 组合数组
		for (const result of results) {
			res.push(await result)
		}
		return res
	} catch (error) {
		throw new Error(error)
	}
}