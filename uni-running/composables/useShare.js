import { getCurrentInstance } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
/**
 * 分享功能 Composable
 *
 * 统一封装微信小程序分享逻辑，支持分享给好友和分享到朋友圈
 *
 * 注意：由于 uni-app Vue3 Composition API 的限制，onShareAppMessage 在 Composable 中不生效
 * 因此改用全局 mixin 方案，通过设置 $shareConfig 来传递分享配置
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
	// wx.showShareMenu({
	// 	withShareTicket: true,
	// 	menus: ['shareAppMessage', 'shareTimeline']
	// });
	// #endif

	// 获取当前组件实例，设置 $shareConfig 供全局 mixin 读取
	const instance = getCurrentInstance();
	// console.log('设置分享配置======:', instance);
	if (instance && instance.proxy) {
		instance.proxy.$shareConfig = config;
	}
	onShareAppMessage(() => {
		// console.log('onShareAppMessage called, shareConfig:========222', instance);
		if (instance.proxy.$shareConfig) {
			// console.log('onShareAppMessage called, shareConfig22:', instance.proxy);
			const currentConfig = typeof instance.proxy.$shareConfig === 'function'
					? instance.proxy.$shareConfig()
					: instance.proxy.$shareConfig;
			return {
				title: currentConfig.title || '全速运动',
				path: currentConfig.path || '/pages/index',
				imageUrl: currentConfig.imageUrl || ''
			};
		} 
		return {
			title: '全速运动',
			query: '',
			imageUrl: ''
		};
			
	})
	onShareTimeline(() => {
		// console.log('onShareAppMessage called, shareConfig:========333', instance);
		if (instance.proxy.$shareConfig) {
			const currentConfig = typeof instance.proxy.$shareConfig === 'function'
				? instance.proxy.$shareConfig()
				: instance.proxy.$shareConfig;
			// 从 path 中提取 query
			const path = currentConfig.path || '';
			const queryIndex = path.indexOf('?');
			const query = queryIndex > -1 ? path.substring(queryIndex + 1) : '';
			return {
				title: currentConfig.title || '全速运动',
				query: query,
				imageUrl: currentConfig.imageUrl || ''
			};
		}
		// 默认分享配置
		return {
			title: '全速运动',
			query: '',
			imageUrl: ''
		};
	})
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
