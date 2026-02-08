import store from "@/utils/store.js"
export function clearUserInfo() {
	uni.removeStorageSync('token')
	uni.removeStorageSync('tokenExpire')
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

// 计算 navbar 高度
export const getNavbarHeight = () => {
	const statusBarHeight = uni.getWindowInfo().statusBarHeight || 0;
	
	let navbarHeight = 0
	// #ifdef MP-WEIXIN
	const menuBtn = uni.getMenuButtonBoundingClientRect();
	if (menuBtn) {
		// 导航栏高度 = 胶囊底部 + (胶囊顶部 - 状态栏高度)
		const navHeight = menuBtn.bottom + (menuBtn.top - statusBarHeight);
		navbarHeight = navHeight;
	} else {
		navbarHeight = statusBarHeight + 44;
	}
	// #endif

	// #ifndef MP-WEIXIN
	navbarHeight = statusBarHeight + 44;
	// #endif
	
	return navbarHeight;
};

export function isReleaseVersion() {
	const envVersion = uni?.getAccountInfoSync?.().miniProgram.envVersion || 'develop';
	// release: 正式版（显示）
	// develop: 开发者工具（不显示）
	// trial: 体验版（不显示）
	// shouldShow = envVersion === 'release';
	return envVersion === 'release' || envVersion === 'develop';
}