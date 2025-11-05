import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// 获取 __dirname 的 ESM 等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 .env 配置文件
dotenv.config();

// 从环境变量解析配置
let endpoint = process.env.OSS_ENDPOINT;
let bucket = process.env.OSS_BUCKET;
let region = process.env.OSS_REGION;
let endpointContainsBucket = false; // 标记 endpoint 是否包含 bucket

// 如果只配置了 endpoint，尝试从中提取 bucket 和 region
if (endpoint && !bucket && !region) {
  // 移除协议前缀
  const originalEndpoint = endpoint;
  const endpointWithoutProtocol = endpoint.replace(/^https?:\/\//, '');
  
  // 尝试从 endpoint 中提取信息
  // 格式可能是: bucket.oss-cn-xxx.aliyuncs.com 或 oss-cn-xxx.aliyuncs.com
  const parts = endpointWithoutProtocol.split('.');
  
  // 检查是否是标准 OSS endpoint 格式
  if (endpointWithoutProtocol.includes('.oss-') && endpointWithoutProtocol.includes('.aliyuncs.com')) {
    // 查找 oss- 开头的部分（region）
    const ossIndex = parts.findIndex(part => part.startsWith('oss-'));
    if (ossIndex > 0) {
      // 如果 oss- 前面有部分，可能是 bucket
      bucket = parts.slice(0, ossIndex).join('.');
      region = parts[ossIndex];
      endpointContainsBucket = true; // endpoint 包含 bucket，后续不需要再设置 endpoint
      console.log(`📝 从 endpoint 中提取信息:`);
      console.log(`   endpoint: ${originalEndpoint}`);
      console.log(`   bucket: ${bucket}`);
      console.log(`   region: ${region}`);
      console.log(`   注意: endpoint 包含 bucket，将使用 region 和 bucket 配置`);
      console.log('');
    } else if (ossIndex === 0) {
      // 如果 oss- 是第一个，说明没有 bucket 在 endpoint 中
      region = parts[0];
      endpoint = endpointWithoutProtocol; // 保存清理后的 endpoint
      console.log(`📝 从 endpoint 中提取信息:`);
      console.log(`   endpoint: ${originalEndpoint}`);
      console.log(`   region: ${region}`);
      console.log(`   ⚠️  未找到 bucket，请配置 OSS_BUCKET`);
      console.log('');
    }
  } else {
    // 自定义域名或其他格式
    endpoint = endpointWithoutProtocol;
    console.log(`📝 endpoint 格式: ${originalEndpoint}`);
    console.log(`   ⚠️  无法从 endpoint 中提取 bucket 和 region`);
    console.log(`   如果使用自定义域名，请设置 OSS_CNAME=true 并配置 OSS_BUCKET`);
    console.log('');
  }
} else if (endpoint) {
  // 如果同时配置了 endpoint 和其他参数，清理 endpoint
  endpoint = endpoint.replace(/^https?:\/\//, '');
}

// 构建 OSS 配置
const ossConfig = {
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  secure: true, // 强制使用 HTTPS
  timeout: 120000, // 120秒超时（增加超时时间）
  // 使用内部 endpoint（如果在内网环境）
  internal: process.env.OSS_INTERNAL === 'true',
  // 如果使用自定义域名
  cname: process.env.OSS_CNAME === 'true',
};

// 如果 endpoint 包含 bucket，则只设置 region 和 bucket，不设置 endpoint
// 这样可以避免 SDK 重复拼接 bucket 名称
if (endpointContainsBucket) {
  // endpoint 包含 bucket，只设置 region 和 bucket
  ossConfig.region = region;
  ossConfig.bucket = bucket;
} else {
  // endpoint 不包含 bucket，设置 endpoint 和 bucket
  if (endpoint) {
    ossConfig.endpoint = endpoint;
  }
  if (region) {
    ossConfig.region = region;
  }
  if (bucket) {
    ossConfig.bucket = bucket;
  }
}

// 创建 OSS 客户端
let client;
try {
  client = new OSS(ossConfig);
  console.log(`📦 OSS 配置信息:`);
  if (ossConfig.region) {
    console.log(`   region: ${ossConfig.region}`);
  }
  if (ossConfig.bucket) {
    console.log(`   bucket: ${ossConfig.bucket}`);
  }
  if (ossConfig.endpoint) {
    console.log(`   endpoint: ${ossConfig.endpoint}`);
  }
  if (ossConfig.internal) {
    console.log(`   使用内部 endpoint`);
  }
  if (ossConfig.cname) {
    console.log(`   使用自定义域名 (CNAME)`);
  }
  console.log('');
} catch (error) {
  console.error('❌ OSS 客户端初始化失败:', error.message);
  console.error('\n💡 配置建议:');
  console.error('   方式1（推荐）: 只配置 OSS_ENDPOINT');
  console.error('      OSS_ENDPOINT=bucket.oss-cn-guangzhou.aliyuncs.com');
  console.error('      # 或');
  console.error('      OSS_ENDPOINT=oss-cn-guangzhou.aliyuncs.com');
  console.error('      OSS_BUCKET=your-bucket-name');
  console.error('');
  console.error('   方式2: 配置 OSS_REGION 和 OSS_BUCKET');
  console.error('      OSS_REGION=oss-cn-guangzhou');
  console.error('      OSS_BUCKET=your-bucket-name');
  console.error('');
  console.error('   必需配置:');
  console.error('      OSS_ACCESS_KEY_ID=your_access_key_id');
  console.error('      OSS_ACCESS_KEY_SECRET=your_access_key_secret\n');
  process.exit(1);
}

// 静态文件目录
const STATIC_DIR = path.join(__dirname, 'static');
// OSS 目录前缀
const OSS_PREFIX = 'weapp-static';

/**
 * 递归获取目录下所有文件
 * @param {string} dir 目录路径
 * @param {string} baseDir 基础目录路径
 * @returns {Array} 文件路径数组
 */
function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // 递归读取子目录
      results = results.concat(getAllFiles(filePath, baseDir));
    } else {
      // 计算相对路径
      const relativePath = path.relative(baseDir, filePath);
      results.push({
        localPath: filePath,
        relativePath: relativePath,
      });
    }
  });

  return results;
}

/**
 * 上传单个文件到 OSS（带重试机制）
 * @param {string} localPath 本地文件路径
 * @param {string} relativePath 相对路径
 * @param {number} retries 重试次数
 * @returns {Promise}
 */
async function uploadFile(localPath, relativePath, retries = 3) {
  // 构建 OSS 对象键（key），使用正斜杠作为路径分隔符
  const ossKey = path.join(OSS_PREFIX, relativePath).replace(/\\/g, '/');
  
  // 获取文件大小
  const stats = fs.statSync(localPath);
  const fileSize = stats.size;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let result;
      
      // 对于大文件（>10MB），使用流式上传；小文件使用路径上传
      if (fileSize > 10 * 1024 * 1024) {
        // 大文件使用文件流
        const fileStream = fs.createReadStream(localPath);
        result = await client.putStream(ossKey, fileStream, {
          timeout: 300000, // 大文件使用更长的超时时间（5分钟）
          headers: {
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } else {
        // 小文件直接使用文件路径上传（SDK 会自动处理）
        result = await client.put(ossKey, localPath, {
          timeout: 120000, // 2分钟超时
          headers: {
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }
      
      console.log(`✅ 上传成功: ${relativePath} (${fileSizeMB}MB) -> ${result.url}`);
      return result;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const errorMsg = error.message || error.toString();
      
      // 检查是否是网络相关错误
      const isNetworkError = 
        errorMsg.includes('socket hang up') ||
        errorMsg.includes('ECONNRESET') ||
        errorMsg.includes('ETIMEDOUT') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('TLS connection') ||
        errorMsg.includes('disconnected before secure');
      
      if (isLastAttempt) {
        console.error(`❌ 上传失败 (尝试 ${attempt}/${retries}): ${relativePath} (${fileSizeMB}MB)`);
        console.error(`   错误信息: ${errorMsg.substring(0, 200)}`);
        throw error;
      } else {
        // 网络错误使用指数退避策略
        const delay = isNetworkError ? 2000 * Math.pow(2, attempt - 1) : 1000 * attempt;
        console.warn(`⚠️  上传失败 (尝试 ${attempt}/${retries}): ${relativePath}，${delay / 1000}秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

/**
 * 批量上传文件
 */
async function uploadAllFiles() {
  console.log('开始扫描 static 目录...');
  
  // 检查 static 目录是否存在
  if (!fs.existsSync(STATIC_DIR)) {
    console.error(`❌ 目录不存在: ${STATIC_DIR}`);
    process.exit(1);
  }

  // 获取所有文件
  const files = getAllFiles(STATIC_DIR);
  console.log(`找到 ${files.length} 个文件\n`);

  if (files.length === 0) {
    console.log('没有文件需要上传');
    return;
  }

  // 依次上传文件（添加延迟避免并发过高）
  let successCount = 0;
  let failCount = 0;
  const failedFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = `[${i + 1}/${files.length}]`;
    
    try {
      await uploadFile(file.localPath, file.relativePath);
      successCount++;
      
      // 每上传一个文件后稍作延迟，避免请求过快
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      failCount++;
      failedFiles.push(file.relativePath);
      console.error(`   ${progress} 失败文件: ${file.relativePath}`);
    }
  }
  
  // 如果有失败的文件，显示列表
  if (failedFiles.length > 0) {
    console.log(`\n❌ 失败的文件列表 (共 ${failedFiles.length} 个):`);
    failedFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }

  console.log(`\n📊 上传完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
}

// 验证必要的环境变量（使用提取后的配置）
function validateEnv() {
  const requiredVars = ['OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n请检查 .env 文件配置');
    process.exit(1);
  }

  // 检查配置是否完整（使用提取后的值）
  const hasEndpoint = !!process.env.OSS_ENDPOINT;
  const hasBucket = !!bucket || !!process.env.OSS_BUCKET;
  const hasRegion = !!region || !!process.env.OSS_REGION;
  const isCname = process.env.OSS_CNAME === 'true';

  // 验证配置方式
  if (!hasEndpoint && (!hasBucket || !hasRegion)) {
    console.error('❌ 配置不完整:');
    console.error('   方式1: 配置 OSS_ENDPOINT（可自动提取 bucket 和 region）');
    console.error('   方式2: 配置 OSS_BUCKET 和 OSS_REGION');
    console.error('\n请检查 .env 文件配置');
    process.exit(1);
  }

  // 验证 bucket（必需，除非使用 CNAME）
  if (!hasBucket && !isCname) {
    console.error('❌ 缺少 bucket 配置:');
    console.error('   如果 endpoint 格式为: bucket.oss-cn-xxx.aliyuncs.com，会自动提取');
    console.error('   否则需要单独配置 OSS_BUCKET');
    console.error('   如果使用自定义域名，请设置 OSS_CNAME=true 并配置 OSS_BUCKET');
    process.exit(1);
  }
}

/**
 * 测试 OSS 连接
 */
async function testConnection() {
  try {
    console.log('🔍 测试 OSS 连接...');
    // 尝试列出 bucket（限制为 1 个对象，仅用于测试连接）
    const result = await client.list({
      'max-keys': 1,
      timeout: 10000,
    });
    console.log('✅ OSS 连接测试成功\n');
    return true;
  } catch (error) {
    console.error('❌ OSS 连接测试失败:', error.message);
    console.error('   请检查网络连接和 OSS 配置是否正确\n');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始上传文件到阿里云 OSS...\n');
  
  // 验证环境变量
  validateEnv();

  // 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.error('⚠️  连接测试失败，但将继续尝试上传...\n');
  }

  // 执行上传
  try {
    await uploadAllFiles();
    console.log('\n✨ 所有操作完成');
  } catch (error) {
    console.error('\n❌ 上传过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
