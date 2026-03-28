let baseUrl = 'https://speexpay.com';
let envVersion = 'release';

// 微信小程序版本
// #ifdef MP-WEIXIN
	envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
// #endif

// 生产版本
if (['trial'].includes(envVersion)) {
	baseUrl = 'https://uat.speexpay.com'
	envVersion = 'trial'
}

export const baseLink = baseUrl

export const isRelease =['release'].includes(envVersion);

// 静态资源基础 URL（OSS）
export const staticBaseUrl = 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static';

export const uploadToken = '9c029c96952e5298efb5c09b081fa0a7';