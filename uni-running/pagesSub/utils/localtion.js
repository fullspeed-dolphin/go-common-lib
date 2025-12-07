import amapFile from "./amap-wx.130.js"


// latitude纬度，long经度 根据转换成省市区 
export const getAddress = async () => {
	const { latitude, longitude } = await getLocation();
	console.log("经纬度", latitude, longitude);
	
	if (!latitude) {
		return false;
	}
	
	const myAmapFun = new amapFile.AMapWX({
		key: "86473c6f37b174b14803c2c118c4ab62"
	});
	
	myAmapFun.getRegeo({
		location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
		success: (data) => {
			console.log("转换成省市", data);
			const regeocodeData = data[0].regeocodeData
			let {
				province,
				city,
			} = regeocodeData.addressComponent;
			
			city = (city || city.length > 0) ? city : "";
	
			console.log("省市区=====>", province + city)
			const cityCode = regeocodeData.aois[0].adcode || "";
			
			const payload = {
				latitude, 
				longitude,
				province,
				city,
				cityCode: regeocodeData.aois[0].adcode + "00000000",
			}
			
			store.dispatch('setUserLocation', payload);
		},
		fail: function(info) {
			console.log(info)
		}
	})
}

function getLocation() {
	return new Promise((resolve) => {
		uni.getLocation({
			type: 'gcj02',
			isHighAccuracy: true,
			success: (res) => {
				resolve(res)
			}
		})
	})
}