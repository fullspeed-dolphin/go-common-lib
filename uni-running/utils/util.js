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
	return envVersion === 'trial' || envVersion === 'release' || envVersion === 'develop';
}

// utils/html.js
export function formatRichText(html) {
  // 匹配所有 <img> 标签，并添加 style
  let newHtml = html.replace(/<img[^>]*>/g, (match) => {
    // 如果已存在 style，先提取
    if (match.includes(' style=')) {
      // 在原有 style 后追加 max-width（更安全）
      return match.replace(/style\s*=\s*["']([^"']*)["']/, (styleMatch, styleContent) => {
        const newStyle = styleContent + ';max-width:100%;height:auto;display:block;';
        return `style="${newStyle}"`;
      });
    } else {
      // 无 style，直接添加
      return match.replace(/<img/i, '<img style="max-width:100%;height:auto;display:block;"');
    }
  });
  return newHtml;
}