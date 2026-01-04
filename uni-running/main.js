import {
	createSSRApp
} from 'vue'
import App from './App'
import store from './utils/store'

// 引入全局uView
import uviewPlus from '@/uni_modules/uview-plus/index.js'

export function createApp() {
	const app = createSSRApp(App)
	app.use(store)

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