import { jsx } from 'hono/jsx'

export const ArtbookLogin = ({ error = '' }: { error?: string }) => (
  <main class="upload-login-page">
    <section class="upload-login-card">
      <a class="upload-login-back" href="/artbook">← 返回画册</a>
      <span class="upload-login-kicker">PRIVATE ARTBOOK · ACCESS</span>
      <div class="upload-login-mark" aria-hidden="true">❀</div>
      <h1>进入画册上传</h1>
      <p>请输入管理密码，验证后即可添加新的画作。</p>

      <form class="upload-login-form" method="post" action="/artbook/upload/login">
        <label for="upload-password">管理密码</label>
        <input
          id="upload-password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          autofocus
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'upload-login-error' : undefined}
        />
        <p id="upload-login-error" class="upload-login-error" role="alert">{error}</p>
        <button type="submit">验证并进入 <span>→</span></button>
      </form>
    </section>
  </main>
)
