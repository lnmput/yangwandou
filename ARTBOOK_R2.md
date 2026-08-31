# 画册 R2 目录约定

Cloudflare Pages 使用 `ARTBOOK_BUCKET` 绑定读取 R2 bucket `yangwandou-artbook`。

## 目录

所有文件统一放在 bucket 的 `artbook/` 前缀下：

```text
artbook/
├── cover.jpg
├── 001__2020.03__2岁__春天的第一颗种子.jpg
├── 002__2021.04__3岁__会走路的小风.jpg
└── manifest.json                 # 可选
```

- `cover.*` 自动作为封面，不进入作品页。
- 其他 JPG、PNG、WebP、AVIF、GIF 文件按文件名自然排序。
- 推荐作品文件名格式：`序号__日期__年龄__标题.扩展名`。
- 如果不使用推荐格式，画册只显示图片和页码，隐藏标题、日期与年龄。
- 新图片上传后不需要重新构建网站；刷新 `/artbook` 即可读取。

## 可选 manifest.json

只有需要自定义顺序或画册文案时才需要：

```json
{
  "title": "杨豌豆的画册",
  "years": "2020 — 2026",
  "description": "这里收藏了我画的每一幅画",
  "cover": "cover.jpg",
  "artworks": [
    {
      "file": "001.jpg",
      "title": "春天的第一颗种子",
      "date": "2020.03",
      "age": "2岁"
    }
  ]
}
```

## Cloudflare 设置

项目的 `wrangler.jsonc` 已包含：

```json
{
  "binding": "ARTBOOK_BUCKET",
  "bucket_name": "yangwandou-artbook"
}
```

如果实际 bucket 名不同，修改 `bucket_name`。也可以在 Cloudflare Dashboard 的 Pages 项目中添加同名 R2 binding；修改 binding 后需要重新部署一次。

首次创建和上传示例：

```bash
pnpm exec wrangler r2 bucket create yangwandou-artbook
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/cover.jpg" --file ./cover.jpg --remote
pnpm exec wrangler r2 object put "yangwandou-artbook/artbook/001__2020.03__2岁__春天的第一颗种子.jpg" --file ./001.jpg --remote
```
