import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

/**
 * 分享功能 Composable
 *
 * 统一封装微信小程序分享逻辑，支持分享给好友和分享到朋友圈
 *
 * @param {Object|Function} config - 分享配置对象或返回配置的函数
 * @param {string} config.title - 分享标题
 * @param {string} config.path - 分享路径（带参数，如 /pagesSub/xxx?id=123）
 * @param {string} [config.imageUrl] - 分享图片 URL（可选）
 *
 * @example
 * // 静态配置
 * useShare({
 *   title: '页面标题',
 *   path: '/pages/xxx'
 * });
 *
 * @example
 * // 动态配置（传入函数）
 * useShare(() => ({
 *   title: detail.value.name || '默认标题',
 *   path: `/pagesSub/xxx?id=${id}`,
 *   imageUrl: detail.value.image
 * }));
 */
export function useShare(config) {
	// #ifdef MP-WEIXIN
	// 启用分享菜单（分享给好友 + 分享到朋友圈）
	wx.showShareMenu({
		withShareTicket: true,
		menus: ['shareAppMessage', 'shareTimeline']
	});
	// #endif

	/**
	 * 获取分享配置（支持静态配置和动态函数）
	 */
	const getConfig = () => {
		return typeof config === 'function' ? config() : config;
	};

	/**
	 * 从 path 中提取 query 字符串（用于朋友圈分享）
	 * /pagesSub/xxx?id=123&name=test => id=123&name=test
	 */
	const extractQuery = (path) => {
		if (!path) return '';
		const queryIndex = path.indexOf('?');
		return queryIndex > -1 ? path.substring(queryIndex + 1) : '';
	};

	// 分享给好友
	onShareAppMessage(() => {
		const { title, path, imageUrl } = getConfig();
		return {
			title: title || '全速俱乐部',
			path: path || '/pages/index',
			imageUrl: imageUrl || ''
		};
	});

	// 分享到朋友圈
	onShareTimeline(() => {
		const { title, path, imageUrl } = getConfig();
		return {
			title: title || '全速俱乐部',
			query: extractQuery(path),
			imageUrl: imageUrl || ''
		};
	});
}

/**
 * 构建带参数的路径
 * 自动过滤空值参数
 *
 * @param {string} basePath - 基础路径
 * @param {Object} params - 参数对象
 * @returns {string} 完整路径
 *
 * @example
 * buildPath('/pagesSub/eventDetail', { id: '123', fsc_id: '' })
 * // => '/pagesSub/eventDetail?id=123'
 */
export function buildPath(basePath, params = {}) {
	const filteredParams = Object.entries(params)
		.filter(([_, value]) => value !== null && value !== undefined && value !== '')
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join('&');

	return filteredParams ? `${basePath}?${filteredParams}` : basePath;
}
