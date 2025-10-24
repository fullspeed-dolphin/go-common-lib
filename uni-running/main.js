import { createSSRApp } from 'vue'
import App from './App'
import store from './store'
import { toast } from "@/utils/util.js"
import request from "@/utils/request.js"

// 引入全局uView
import uView from '@/uni_modules/uview-plus'

export function createApp() {
    const app = createSSRApp(App)
    
    app.use(store)
    app.use(uView)
    
    // 配置全局属性
    app.config.globalProperties.$toast = toast
    app.config.globalProperties.$axios = request
    
    // 获取用户信息
    store.dispatch('getUserInfo')
    
    return {
        app
    }
}