export function checkLocationPermission() {
  return new Promise((resolve, reject) => {
    // 1. 先检查授权状态（仅微信小程序支持）
    // #ifdef MP-WEIXIN
    uni.getSetting({
      success: (res) => {
        const authStatus = res.authSetting['scope.userLocation']
        if (authStatus === true) {
          // 已授权，直接获取位置
          getLocation(resolve, reject)
        } else if (authStatus === false) {
          // 明确拒绝过，需引导用户手动开启
          resolve({ status: 'denied', msg: '用户已拒绝定位权限' })
        } else {
          // 未申请过，尝试申请
          requestLocationPermission(resolve, reject)
        }
      },
      fail: (err) => {
        console.error('getSetting 失败', err)
        reject(err)
      }
    })
    // #endif

    // 2. 非微信平台（如 H5、App）直接尝试获取
    // #ifndef MP-WEIXIN
    getLocation(resolve, reject)
    // #endif
  })
}

// 尝试获取地理位置
function getLocation(resolve, reject) {
  uni.getLocation({
    isHighAccuracy: true,
    type: "gcj02",
    altitude: true,
    success: (res) => {
      resolve({ status: 'granted', location: res })
    },
    fail: (err) => {
			console.error('err getLocation ', err);
			// 手机系统定位被禁用
			if (err.errMsg.includes('permission denied')) {
				uni.showModal({
					title: '定位权限被禁用',
					content: '请到【设置】>【隐私】>【定位服务】中开启本应用的定位权限',
					showCancel: false,
					confirmText: '确定',
					success: () => {}
				})
				
				return resolve({ status: 'disabled', msg: '系统定位服务未开启' })
			}
      // 常见错误码：
      // - err.errMsg 包含 "auth deny" → 用户拒绝
      // - err.errCode === 0 → 系统未开启 GPS（安卓常见）
			// 软件定位被禁用
      if (err.errMsg.includes('auth deny') || err.errMsg.includes('unauthorized') ) {
				uni.showModal({
				  title: '定位权限被禁用',
				  content: '请到开启本应用的定位权限',
				  showCancel: true,
				  confirmText: '去设置',
				  success: (modalRes) => {
				    if (modalRes.confirm) {
				      // 跳转到设置页（仅部分平台支持）
				      // #ifdef MP-WEIXIN
				      uni.openSetting({
				        success: (settingRes) => {
				          if (settingRes.authSetting['scope.userLocation']) {
				            console.log('用户已开启定位')
				          }
				        }
				      })
				      // #endif
				    }
				  }
				})
				
        resolve({ status: 'denied', msg: '用户拒绝授权' })
      } else if (err.errCode === 0) {
				uni.showModal({
					title: '定位权限被禁用',
					content: '请到【设置】>【隐私】>【定位服务】中开启本应用的定位权限',
					showCancel: false,
					confirmText: '确定',
					success: () => {}
				})
				
        resolve({ status: 'disabled', msg: '系统定位服务未开启' })
      } else {
        reject(err)
      }
    }
  })
}

// 申请定位权限（微信）
function requestLocationPermission(resolve, reject) {
  uni.authorize({
    scope: 'scope.userLocation',
    success: () => {
      // 授权成功，获取位置
      getLocation(resolve, reject)
    },
    fail: () => {
      // 用户点击“拒绝”
      resolve({ status: 'denied', msg: '用户拒绝授权' })
    }
  })
}

/**
 * 计算两个经纬度之间的距离（单位：米）
 * @param {number} lat1 - 用户纬度
 * @param {number} lng1 - 用户经度
 * @param {number} lat2 - 地点纬度
 * @param {number} lng2 - 地点经度
 * @returns {number} 距离（米）
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径，单位：米
  const toRad = (deg) => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 返回距离（米）
}

/**
 * 判断用户是否在指定地点 500 米范围内
 * @param {number} userLat - 用户纬度
 * @param {number} userLng - 用户经度
 * @param {number} placeLat - 打卡地点纬度
 * @param {number} placeLng - 打卡地点经度
 * @param {number} radius - 半径（默认 500 米）
 * @returns {boolean}
 */
export function getUserAreaScope(userLat, userLng, placeLat, placeLng, radius = 500) {
  const distance = getDistance(userLat, userLng, placeLat, placeLng);
  return {
		isInRange: distance <= radius,
		distance: distance,
	};
}