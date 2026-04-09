# 线上活动小程序码处理指南

## 背景

打卡海报中的小程序码需要在圆形白底上展示。微信后台下载的小程序码原图是**正方形白底**，直接用 `borderRadius` 裁成圆形后，QR 码图案紧贴边缘，白色边框太窄，效果不佳。

对比 default 跑币海报中的 `/static/poster/打卡.png`（174×174 透明底 PNG），QR 码图案周围有充足留白，裁圆后白底更大更自然。

因此，新活动的小程序码**上传前需要加白色 padding**。

## 处理步骤

### 1. 准备原图

从微信公众平台/小程序后台下载活动对应的小程序码 PNG 文件。

小程序码的页面路径格式为：
```
pagesDashboard/pkEvent/pkEvent?id=<活动ID>
```

活动 ID 可从数据库查询：
```sql
SELECT id, event_name FROM online_events WHERE event_name LIKE '%关键词%';
```

### 2. ImageMagick 加 padding

使用 `magick` 命令给图片四周加 **20% 白色 padding**：

```bash
magick 原图.png -gravity center -background white -extent 120%x120% 输出图.png
```

参数说明：
- `-gravity center`：原图居中放置
- `-background white`：扩展区域填充白色
- `-extent 120%x120%`：画布扩展为原图的 120%（即四周各加 10% 的白色边距）

### 3. 上传到 OSS

使用上传脚本：

```bash
bash ~/work/fullspeed_tech/sh/postImage.sh 输出图.png
```

上传成功后会返回 OSS URL，格式如：
```
https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/2026/04/08/xxxxx.png
```

### 4. 更新数据库

将 OSS URL 写入 `online_events` 表的 `qrcode_url` 字段：

```sql
UPDATE online_events 
SET qrcode_url = 'https://ccrun.oss-cn-guangzhou.aliyuncs.com/images/xxxx/xx/xx/xxxxx.png' 
WHERE id = '<活动ID>';
```

### 5. 验证

重新打卡触发海报生成，确认小程序码：
- 显示为圆形白底
- 白色边框宽度与 default 跑币海报一致
- QR 码图案完整，中间 logo 不被裁切

## 完整示例（为爱奔跑520 第二期）

```bash
# 1. 加 padding
magick ~/Pictures/第二期小程序码.png \
  -gravity center -background white -extent 120%x120% \
  /tmp/第二期小程序码_padded.png

# 2. 上传 OSS
bash ~/work/fullspeed_tech/sh/postImage.sh /tmp/第二期小程序码_padded.png

# 3. 更新数据库
mysql -h 127.0.0.1 -P 3306 -u ccrun -p'Vhwwls123.' ccrun -e "
UPDATE online_events 
SET qrcode_url = '<上传返回的URL>' 
WHERE id = '01KM4JYTHJM4TPW5MXRWY6P0PZ';
"
```

## 前端渲染说明

海报渲染代码在 `uni-running/pagesSport/SharePoster.vue` 的 `renderPoster` 函数中：

```js
src: activityQrcodeUrl.value || "/static/poster/小程序码.png",
css: {
  width: "130rpx",
  height: "130rpx",
  borderRadius: "65rpx",  // 裁成正圆
}
```

- `activityQrcodeUrl` 从后端 `/ocr-api/checkin` 接口返回的 `events[].qrcode_url` 获取
- 无 `qrcode_url` 时 fallback 到本地 `/static/poster/小程序码.png`（小程序首页码）
- `borderRadius: 65rpx`（宽高的一半）将图片裁为正圆，加过 padding 的白底区域形成圆形白色背景

## 相关文件

| 文件 | 作用 |
|------|------|
| `uni-running/pagesSport/SharePoster.vue` | 海报渲染组件 |
| `uni-running/pagesSport/posterUtils.js` | 海报可见性判断，返回 `qrcodeUrl` |
| `uni-running/static/poster/小程序码.png` | fallback 小程序首页码 |
| `uni-running/static/poster/打卡.png` | default 跑币海报小程序码（不动） |
| `event-api/internal/model/online_events.go` | `QrcodeURL` 模型字段 |
