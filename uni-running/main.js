import {
	createSSRApp
} from 'vue'
import App from './App'
import store from '@/utils/store.js'

// 引入全局uView
import uviewPlus from '@/uni_modules/uview-plus/index.js'

// 全局分享 mixin - 解决 Composition API 中 onShareAppMessage 不生效的问题
const globalShareMixin = {
	onShareAppMessage() {
		// 优先使用页面设置的分享配置
		if (this.$shareConfig) {
			const config = typeof this.$shareConfig === 'function'
				? this.$shareConfig()
				: this.$shareConfig;
			return {
				title: config.title || '全速运动',
				path: config.path || '/pages/index',
				imageUrl: config.imageUrl || ''
			};
		}
		// 默认分享配置
		return {
			title: '全速运动',
			path: '/pages/index',
			imageUrl: ''
		};
	},
	onShareTimeline() {
		// 优先使用页面设置的分享配置
		if (this.$shareConfig) {
			const config = typeof this.$shareConfig === 'function'
				? this.$shareConfig()
				: this.$shareConfig;
			// 从 path 中提取 query
			const path = config.path || '';
			const queryIndex = path.indexOf('?');
			const query = queryIndex > -1 ? path.substring(queryIndex + 1) : '';
			return {
				title: config.title || '全速运动',
				query: query,
				imageUrl: config.imageUrl || ''
			};
		}
		// 默认分享配置
		return {
			title: '全速运动',
			query: '',
			imageUrl: ''
		};
	}
};

export function createApp() {
	const app = createSSRApp(App)
	app.use(store)

	// 注册全局分享 mixin
	// app.mixin(globalShareMixin)

	app.use(uviewPlus, () => {
		return {
			options: {
				config: {
					// 只加载一次字体图标
					loadFontOnce: true
				}
			}
		}
	})

	// console.log(uni.$u)

	// 获取用户信息
	store.dispatch('getUserInfo')

	return {
		app
	}
}