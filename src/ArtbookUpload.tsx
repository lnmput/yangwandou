import { jsx } from 'hono/jsx'

export const ArtbookUpload = () => (
  <main class="upload-page">
    <div class="upload-grain" aria-hidden="true" />
    <header class="upload-header">
      <a href="/artbook">← 返回画册</a>
      <div class="upload-header-actions">
        <span>PRIVATE UPLOAD · R2</span>
        <form method="post" action="/artbook/upload/logout"><button type="submit">退出</button></form>
      </div>
    </header>

    <section class="upload-shell">
      <div class="upload-intro">
        <span class="upload-step">01 / ADD TO THE ARTBOOK</span>
        <h1>把今天的画<br />放进画册里</h1>
        <p>从手机相册选择照片，补充说明，然后直接存入 R2。</p>
        <div class="upload-vine" aria-hidden="true"><i /><i /><i /></div>
      </div>

      <div class="upload-workspace">
        <label class="photo-picker" for="artwork-files">
          <span class="picker-mark">＋</span>
          <strong>选择画作照片</strong>
          <small>支持手机相册与多选 · 大图会自动优化</small>
          <input id="artwork-files" type="file" accept="image/*,.heic,.heif" multiple />
        </label>

        <div class="upload-batch-options">
          <label><input id="optimize-images" type="checkbox" checked /> 压缩过大的照片，保留清晰度</label>
        </div>

        <div id="upload-list" class="upload-list" aria-live="polite" />

        <div class="upload-actions">
          <p id="upload-summary">尚未选择照片</p>
          <button id="upload-submit" type="button" disabled>上传到画册 <span>→</span></button>
        </div>
      </div>
    </section>

    <template id="upload-item-template">
      <article class="upload-item">
        <div class="upload-preview"><img alt="待上传画作预览" /></div>
        <div class="upload-fields">
          <div class="upload-fileline"><strong class="upload-filename" /><span class="upload-state">等待上传</span></div>
          <label>作品标题 <input class="upload-title" type="text" maxlength="60" placeholder="可以留空，不显示说明" /></label>
          <div class="upload-meta-fields">
            <label>创作月份 <input class="upload-date" type="month" /></label>
            <label>当时年龄 <input class="upload-age" type="text" maxlength="12" placeholder="例如：6岁" /></label>
          </div>
          <div class="upload-progress"><i /></div>
          <p class="upload-error" role="alert" />
          <button class="upload-remove" type="button">移除</button>
        </div>
      </article>
    </template>

    <script src="/static/artbook-upload.js"></script>
  </main>
)
