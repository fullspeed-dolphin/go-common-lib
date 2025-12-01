# Repository Guidelines

## 项目结构与模块组织
- 根目录：`static/` 存放对外静态资源，`upload.js` 负责上传到 OSS，依赖 `.env` 配置。
- `uni-running/` 是 uni-app 前端（Vue 3 + Vuex）。关键目录：`pages/`（首页/运动/我的），`pagesSub/`（登录、订单、赛事、地址等子包），`components/`（通用业务组件），`store/`（全局状态），`utils/`（请求封装与环境配置），`uni_modules/`（第三方如 uview-plus），`static/` 与 `assets/`（图片、字体），`unpackage/`（构建产物）。
- 资源路径示例：接口基础地址见 `utils/config.js` 的 `baseLink`，静态资源基准为 `staticBaseUrl`。

## 构建、测试与开发命令
- 环境准备：根目录 `npm install` 安装上传脚本依赖；`uni-running/` 如需重装请按已有 `package-lock.json` 执行 `npm install`，保持与 HBuilderX 生成的版本一致。
- 本地运行：推荐用 HBuilderX 打开 `uni-running/`，直接“运行到小程序模拟器/浏览器”或“发行”，自动走 Vite/uni-app 流程。
- 静态资源上传：在根目录配置 `.env`（`OSS_ENDPOINT`、`OSS_BUCKET`、`OSS_REGION`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET` 等），执行 `npm run upload` 将 `static/` 推送到 OSS 前缀 `weapp-static`。
- 代理调试：H5 调试时 Vite 代理 `^/dev-api` 指向 `https://speexpay.com/`（见 `vite.config.js`）。

## 代码风格与命名约定
- 全局使用 ES Module 与 `type: module`，保持 2 空格或现有缩进；优先 `const/let`，避免混用。
- Vue 组件文件名保持与现有风格一致（如 `runMap.vue`、`orderDetail.vue`），逻辑复用可抽到 `mixins.js` 或 `utils/`。
- 网络请求统一走 `utils/request.js`，接口路径用相对路径（如 `/user-api/...`），环境常量集中在 `config.js`。
- 样式优先复用 `uni.scss`、`uview-plus` 变量，减少散落的硬编码颜色与尺寸。

## 测试指引
- 当前无自动化测试；提交前至少在微信/浏览器端手动验证登录、下单/退款、运动轨迹、消息列表等关键流程。
- 新增接口请关注 `request.js` 的日志输出，确认返回码 200，异常提示友好。
- 涉及静态资源或轨迹展示的改动，确认 `staticBaseUrl` 与 OSS 上传路径一致，避免 404。

## 提交与 Pull Request
- Git 历史常见 `feat:`、`fix:` 前缀或简短中文描述，建议沿用：`feat: ` 新功能，`fix: ` 修复，`chore:` 其他；一句话概括变更。
- PR 描述需包含：变更背景/功能点、影响范围、验证方式（设备/平台）、截图或录屏（尤其是 UI、轨迹页面）、关联 Issue/需求链接（若有）。
- 避免提交 `unpackage/`、敏感 `.env` 等私密或生成文件；如需保留 `node_modules/` 变更，请说明原因。
