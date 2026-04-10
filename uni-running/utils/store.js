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
			album_info: {},
			album_all_urls: [], // 全量 URL，仅供 uni.previewImage 查看全量图使用
			// 战队活动主题
			pkEventTheme: {},
			pkEventRule: null,
			pkEventStatus: ''
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
		// 一次性拉全量 URL，只用于 uni.previewImage 查看高清图
		async getAllAlbumUrls({commit}, params) {
			try {
				const res = await request.get(
					`/image-service/${params.displayType === 'photo' ? 'oss' : 'videos'}`,
					{
						event_id: params.event_id,
						pageIndex: 0,
						pageSize: 20000,
						displayType: params.displayType
					}
				)
				const urls = res.urls || []
				commit('set', { type: 'album_all_urls', data: urls })
				return urls
			} catch (error) {
				commit('set', { type: 'album_all_urls', data: [] })
				return []
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