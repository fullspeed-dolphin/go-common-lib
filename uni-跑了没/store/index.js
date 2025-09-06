import Vue from 'vue'
import Vuex from 'vuex'
import axios from "@/utils/request.js";
import { clearUserInfo } from "@/utils/util.js"

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		shopInfo: uni.getStorageSync('shopInfo') || {},
		userInfo: uni.getStorageSync('userInfo') || {},
		shopCartData: uni.getStorageSync('shopCartData') || [],
	},
	mutations: {
		set(state, payload) {
			state[payload.type] = payload.data;
			
			uni.setStorageSync(payload.type, payload.data);
		},
	},
	getters: {
		shopInfo: state => state.shopInfo,
		userInfo: state => state.userInfo,
	},
	actions: {
		changeShopCart({commit, state}, payload) {
			const shopCartData = JSON.parse(JSON.stringify(state.shopCartData))
			const data = [];
			
			if (payload.type === 'add') {
				const curGoods = shopCartData.find(i => i.ID === payload.data.ID);
				if (!curGoods?.ID) {
					shopCartData.push({
						...payload.data,
						number: 1
					})
				} else {
					curGoods.number ++
				}
			} else {
				const curGoods = shopCartData.find(i => i.ID === payload.data.ID);
				if (curGoods?.ID) {
					curGoods.number --
					if (!curGoods.number) {
						const index = shopCartData.findIndex(i => i.ID === payload.data.ID);
						shopCartData.splice(index, 1)
					}
				}
			}
			
			// console.log("shopCartData=====>", shopCartData)
			
			commit('set', {
				type: 'shopCartData',
				data: shopCartData,
			})
		},
		getUserInfo({commit}, payload) {
			// if (!uni.getStorageSync('token')) return{};
			return new Promise((resolve, reject) => {
				axios.get('/api/store/account/info').then(res => {
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