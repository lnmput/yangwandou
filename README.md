# ❀ Yangwandou · 杨豌豆

> “你的名字是一粒小小的种子。有一天会发芽，会爬藤，会结出饱满的小豆荚。” 🫛

基于 Hono、Vite 和 Cloudflare Pages 的成长信件与画册网站。

- `/`：成长信件首页
- `/artbook`：交互式画册
- 画册图片：存储在 Cloudflare R2，由页面自动读取

## 技术栈

- Hono
- Vite
- StPageFlip
- Cloudflare Pages Functions
- Cloudflare R2
- pnpm

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm run dev
```

生产构建检查：

```bash
pnpm run build
```

## R2 画册配置

项目默认使用以下 R2 配置：

```text
Bucket：yangwandou-artbook
Binding：ARTBOOK_BUCKET
目录前缀：artbook/
```

对应配置位于 `wrangler.jsonc`：

```json
{
  "r2_buckets": [
    {
      "binding": "ARTBOOK_BUCKET",
      "bucket_name": "yangwandou-artbook"
    }
  ]
}
```

Cloudflare Pages 项目中也应确认已添加绑定：

```text
Settings → Bindings → Add binding → R2 bucket
Variable name：ARTBOOK_BUCKET
R2 bucket：yangwandou-artbook
```

建议同时为 Production 和 Preview 环境添加绑定。R2 不需要开启 Public Access，图片由 Pages Function 通过 `/artbook/media/*` 返回。

## 上传画册图片

所有画册文件必须放在 bucket 的 `artbook/` 目录：

```text
artbook/
├── cover.jpg
├── 001__2020.03__2岁__春天的第一颗种子.jpg
├── 002__2021.04__3岁__会走路的小风.jpg
└── manifest.json
```

### 文件规则

- `cover.jpg`、`cover.png` 等 `cover.*` 文件自动作为封面。
- 支持 JPG、JPEG、PNG、WebP、AVIF 和 GIF。
- 作品按文件名自然排序，因此序号建议补零：`001`、`002`、`003`。
- 说明文字格式为：`序号__日期__年龄__标题.扩展名`。
- 只有符合上述格式的文件才显示标题、日期和年龄。
- 不符合格式的文件只显示图片和页码。
- `manifest.json` 为可选项，用于自定义画册文案和作品顺序，详细格式见 `ARTBOOK_R2.md`。

可以直接在 Cloudflare Dashboard 中进入 R2 bucket 的 `artbook/` 目录拖拽上传，也可以使用 Wrangler。

上传到线上 R2：

```bash
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/cover.jpg" --file ./cover.jpg --remote
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/001__2020.03__2岁__春天的第一颗种子.jpg" --file ./001.jpg --remote
```

线上文件列表请在 Cloudflare Dashboard 的 R2 bucket 页面查看。当前 Wrangler 版本提供对象的 `get`、`put` 和 `delete`，不提供 `r2 object list` 子命令。

## 部署到 Cloudflare Pages

首次部署前登录 Cloudflare：

```bash
pnpm exec wrangler login
```

执行构建和部署：

```bash
pnpm run deploy
```

该命令会依次执行：

```bash
pnpm run build
wrangler pages deploy
```

部署完成后检查：

```text
https://你的域名/artbook
```

如果页面提示没有作品，请依次检查：

1. 图片是否位于 `artbook/` 目录，而不是 bucket 根目录。
2. Pages binding 是否准确命名为 `ARTBOOK_BUCKET`。
3. binding 是否指向 `yangwandou-artbook`。
4. Production 和 Preview 环境是否绑定正确。
5. 添加或修改 binding 后是否重新部署。

## 日常修改说明

### 仅新增图片

将图片上传到 R2 的 `artbook/` 目录，刷新 `/artbook` 即可，不需要重新构建或部署网站。

### 修改图片顺序或说明

修改对象文件名中的序号、日期、年龄或标题。R2 没有直接重命名操作时，可以用新名称重新上传，再删除旧对象。

例如：

```text
003__2022.05__4岁__雨后的彩色.jpg
```

### 替换现有图片

可以覆盖相同对象名，但图片响应带有缓存。希望修改立即生效时，推荐使用新文件名上传；否则最多等待约一小时或清理 Cloudflare 缓存。

### 修改封面

上传新的 `artbook/cover.*`。为了避免旧缓存，推荐修改扩展名或对象名，并在 `manifest.json` 中指定新的封面文件。

### 修改页面样式或功能

修改 `src/` 或 `public/static/style.css` 后执行：

```bash
pnpm run build
pnpm run deploy
```

### 修改 bucket 或 binding

同步修改 `wrangler.jsonc` 和 Cloudflare Pages 项目的 binding，然后重新部署。

## 本地 R2 测试

Wrangler 本地 R2 与线上 bucket 相互独立。本地上传必须使用 `--local`：

```bash
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/cover.jpg" --file ./cover.jpg --local
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/001__2020.03__2岁__春天的第一颗种子.jpg" --file ./001.jpg --local
pnpm run dev
```

本地 R2 数据保存在 `.wrangler/`，不会提交到 Git。

## 相关文件

- `src/Artbook.tsx`：画册页面与翻页交互
- `src/artbook-data.ts`：R2 文件读取、排序和文件名解析
- `src/index.tsx`：页面路由与 R2 图片代理
- `public/static/style.css`：画册样式
- `wrangler.jsonc`：Cloudflare Pages 与 R2 binding
- `ARTBOOK_R2.md`：R2 目录和 manifest 详细说明
