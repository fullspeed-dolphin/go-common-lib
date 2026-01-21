import { createStore } from 'vuex'
import request from "@/utils/request.js"

export default createStore({
	state() {
		return {
			userInfo: uni.getStorageSync('userInfo') || {},
			globalToken: '',
			// 相册数据
			album_pageIndex: 0,
			album_pageSize: 60,
			album_data: [],
			album_total: 0,
			album_info: {}
		}
	},
	mutations: {
		set(state, payload) {
			state[payload.type] = payload.data
		}
	},
	getters: {
		userInfo: state => state.userInfo
	},
	actions: {
		async getAlbumData({commit, state}, params) {
			try {
				const res = await request.get(`/image-service/${params.displayType === 'photo' ? 'oss' : 'videos'}`, params)
				let list = res.urls || []
				
				if (params.pageIndex !== 0) {
					list = state.album_data.concat(list)
				}
				
				commit('set', {
					type: 'album_data',
					data: list
				})
				
				commit('set', {
					type: 'album_total',
					data: res.total
				})
				
				return res.urls || []
			} catch (error) {
				throw error
			}
		},
		async getUserInfo({commit}) {
			if (!uni.getStorageSync('token')) return {}

			try {
				const res = await request.get('/user-api/user')
				
				commit('set', {
					type: 'userInfo',
					data: res
				})
				
				uni.setStorageSync('userInfo', res)
				return res
			} catch (error) {
				throw error
			}
		},
		
	}
})