import { createStore } from 'vuex'
import axios from "@/utils/request.js"
import { clearUserInfo } from "@/utils/util.js"

const store = createStore({
    state() {
        return {
            userInfo: uni.getStorageSync('userInfo') || {},
            globalToken: ''
        }
    },
    mutations: {
        set(state, payload) {
            console.log('payload======>', payload)
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
                const res = await axios.get('/user-api/user')
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

export default store