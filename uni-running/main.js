import {
	createSSRApp
} from 'vue'
import App from './App'
import store from './store'
import request from "@/utils/request.js"

// 引入全局uView
import uviewPlus from '@/uni_modules/uview-plus/index.js'

import { pageScrollMixin } from './mixins'

export function createApp() {
	const app = createSSRApp(App)
	app.mixin(pageScrollMixin)
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