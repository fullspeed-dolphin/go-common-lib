// 测试版本
let baseUrl = 'https://speexpay.com';
let envVersion = 'release';

// 微信小程序版本
// #ifdef MP-WEIXIN
	envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
	baseUrl = 'https://speexpay.com'
// #endif

// 生产版本
if (['release'].includes(envVersion)) {
	baseUrl = 'https://speexpay.com'
}


export const baseLink = baseUrl
export const isRelease =['release'].includes(envVersion);