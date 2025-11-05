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

console.log(envVersion, baseUrl, 'envVersion, baseUrl');
export const baseLink = baseUrl

export const isRelease =['release'].includes(envVersion);

// 静态资源基础 URL（OSS）
export const staticBaseUrl = 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static';