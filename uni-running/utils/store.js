import { createStore } from 'vuex'
import request from "@/utils/request.js"

export default createStore({
    state() {
        return {
            userInfo: uni.getStorageSync('userInfo') || {},
            globalToken: ''
        }
    },
    mutations: {
        set(state, payload) {
            state[payload.type] = payload.data
            uni.setStorageSync(payload.type, payload.data)
        }
    },
    getters: {
        userInfo: state => state.userInfo
    },
    actions: {
        async getUserInfo({commit}) {
            if (!uni.getStorageSync('token')) return {}
            try {
                const res = await request.get('/user-api/user')
                uni.setStorageSync('userInfo', res)
                commit('set', {
                    type: 'userInfo',
                    data: res
                })
                return res
            } catch (error) {
                throw error
            }
        }
    }
})