import Vue from 'vue'
import Vuex from 'vuex'
import axios from "@/utils/request.js";
import { clearUserInfo } from "@/utils/util.js"

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		userInfo: uni.getStorageSync('userInfo') || {},
	},
	mutations: {
		set(state, payload) {
			state[payload.type] = payload.data;
			
			uni.setStorageSync(payload.type, payload.data);
		},
	},
	getters: {
		userInfo: state => state.userInfo,
	},
	actions: {
		getUserInfo({commit}, payload) {
			if (!uni.getStorageSync('token')) return{};
			return new Promise((resolve, reject) => {
				axios.get('/user-api/user').then(res => {
					uni.setStorageSync('userInfo', res)

					commit('set', {
						type: 'userInfo',
						data: res,
					})
					
					// console.log("res", res)
					resolve(res)
				}).catch(error => {
					reject(error)
				})
			})
		}
	}
})