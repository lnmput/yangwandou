import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { Layout } from './layout'
import { PETAL_PALETTES } from './theme'
import { LetterName } from './LetterName'
import { LetterSeven } from './LetterSeven'
import { LetterAlbum } from './LetterAlbum'
import { getAgeInfo } from './age'
import { Artbook } from './Artbook'
import { ArtbookUpload } from './ArtbookUpload'
import { ArtbookLogin } from './ArtbookLogin'
import { ARTBOOK_PREFIX, CloudflareBindings, getNextArtworkNumber, loadArtbook } from './artbook-data'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', Layout)

const uploadCookie = 'yangwandou_upload_session'
const uploadSessionSeconds = 7 * 24 * 60 * 60
const encoder = new TextEncoder()

const toBase64Url = (bytes: Uint8Array) => {
  let value = ''
  bytes.forEach((byte) => { value += String.fromCharCode(byte) })
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const signUploadSession = async (password: string, expires: number) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(expires)))
  return `${expires}.${toBase64Url(new Uint8Array(signature))}`
}

const safeEqual = (left: string, right: string) => {
  const length = Math.max(left.length, right.length)
  let difference = left.length ^ right.length
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }
  return difference === 0
}

const hasValidUploadSession = async (token: string | undefined, password: string) => {
  if (!token) return false
  const [expiresValue, signature, ...rest] = token.split('.')
  const expires = Number(expiresValue)
  if (rest.length || !signature || !Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false
  return safeEqual(token, await signUploadSession(password, expires))
}

const requireUploadAccess = async (c: any, next: () => Promise<void>) => {
  const url = new URL(c.req.url)
  if (url.pathname === '/artbook/upload/login' || url.pathname === '/artbook/upload/logout') return next()

  const password = c.env.UPLOAD_PASSWORD?.trim()
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (!password) {
    if (isLocal) return next()
    return c.text('Upload password is not configured.', 503)
  }

  if (await hasValidUploadSession(getCookie(c, uploadCookie), password)) return next()
  if (url.pathname.startsWith('/artbook/upload/api/')) return c.json({ error: '登录已过期，请重新验证密码。' }, 401)
  return c.redirect('/artbook/upload/login')
}

app.use('/artbook/upload', requireUploadAccess)
app.use('/artbook/upload/*', requireUploadAccess)

app.get('/artbook/upload/login', (c) => c.render(<ArtbookLogin />))

app.post('/artbook/upload/login', async (c) => {
  const configuredPassword = c.env.UPLOAD_PASSWORD?.trim()
  if (!configuredPassword) return c.render(<ArtbookLogin error="上传密码尚未配置。" />, 503)

  const body = await c.req.parseBody()
  const submittedPassword = String(body.password ?? '')
  if (!safeEqual(submittedPassword, configuredPassword)) {
    return c.render(<ArtbookLogin error="密码不正确，请重新输入。" />, 401)
  }

  const expires = Math.floor(Date.now() / 1000) + uploadSessionSeconds
  setCookie(c, uploadCookie, await signUploadSession(configuredPassword, expires), {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Strict',
    path: '/artbook/upload',
    maxAge: uploadSessionSeconds,
  })
  return c.redirect('/artbook/upload', 303)
})

app.post('/artbook/upload/logout', (c) => {
  deleteCookie(c, uploadCookie, { path: '/artbook/upload' })
  return c.redirect('/artbook/upload/login', 303)
})

app.get('/', (c) => {
  const palette = PETAL_PALETTES.powder;
  const ageInfo = getAgeInfo();

  const Wrap = ({ children }: any) => (
    <div class="scale-wrap" style={{ overflow: "hidden" }}>
      <div class="scale-inner" style={{
        width: "1440px", height: "900px",
        transformOrigin: "top left"
      }}>
        {children}
      </div>
    </div>
  );

  return c.render(
    <div class="stack">
      <div class="letter-frame">
        <Wrap><LetterName palette={palette} ageInfo={ageInfo} /></Wrap>
      </div>
      <div class="pagemark">
        <span>letter № 01</span>
        <span class="glyph">❀</span>
        <span>letter № 02</span>
      </div>
      <div class="letter-frame">
        <Wrap><LetterSeven palette={palette} ageInfo={ageInfo} /></Wrap>
      </div>
      <div class="pagemark">
        <span>letter № 02</span>
        <span class="glyph">❀</span>
        <span>letter № 03</span>
      </div>
      {/*
      <div class="letter-frame">
        <Wrap><LetterAlbum palette={palette} ageInfo={ageInfo} /></Wrap>
      </div>
      */}
      <div class="pagemark" style={{ paddingBottom: "60px" }}>
        <span>— end of letters —</span>
        <span class="glyph">❀</span>
        <span>yangwandou.com</span>
      </div>
    </div>
  )
})

app.get('/artbook', async (c) => {
  const artbook = await loadArtbook(c.env.ARTBOOK_BUCKET)
  return c.render(<Artbook artbook={artbook} />)
})

app.get('/artbook/upload', (c) => c.render(<ArtbookUpload />))

app.get('/artbook/upload/api/status', async (c) => {
  const bucket = c.env.ARTBOOK_BUCKET
  if (!bucket) return c.json({ error: 'R2 bucket binding is unavailable.' }, 503)
  return c.json({ nextNumber: await getNextArtworkNumber(bucket) })
})

const uploadContentTypes: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const safeFilenamePart = (value: string, maxLength: number) => value
  .trim()
  .replace(/__/g, '—')
  .replace(/[\\/\0<>:"|?*]/g, '-')
  .replace(/\s+/g, ' ')
  .slice(0, maxLength)

app.post('/artbook/upload/api/images', async (c) => {
  const bucket = c.env.ARTBOOK_BUCKET
  if (!bucket) return c.json({ error: 'R2 bucket binding is unavailable.' }, 503)

  const body = await c.req.formData()
  const file = body.get('file')
  if (!(file instanceof File)) return c.json({ error: '请选择一张图片。' }, 400)
  if (file.size === 0 || file.size > 30 * 1024 * 1024) return c.json({ error: '图片必须小于 30MB。' }, 400)

  const extension = uploadContentTypes[file.type]
  if (!extension) return c.json({ error: '仅支持 JPG、PNG、WebP、AVIF 和 GIF。' }, 415)

  const title = safeFilenamePart(String(body.get('title') ?? ''), 60)
  const age = safeFilenamePart(String(body.get('age') ?? ''), 12)
  const dateInput = String(body.get('date') ?? '')
  const date = /^\d{4}-\d{2}$/.test(dateInput) ? dateInput.replace('-', '.') : ''
  if (title && (!date || !age)) return c.json({ error: '填写标题时，也需要填写创作月份和年龄。' }, 400)

  const nextNumber = await getNextArtworkNumber(bucket)
  const order = String(nextNumber).padStart(3, '0')
  const filename = title
    ? `${order}__${date}__${age}__${title}.${extension}`
    : `${order}-${crypto.randomUUID().slice(0, 8)}.${extension}`
  const key = `${ARTBOOK_PREFIX}${filename}`

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      originalName: safeFilenamePart(file.name, 80),
      ...(title ? { title, date, age } : {}),
    },
  })

  return c.json({
    ok: true,
    no: order,
    key,
    url: `/artbook/media/${encodeURIComponent(filename)}`,
  })
})

app.get('/artbook/media/*', async (c) => {
  const bucket = c.env.ARTBOOK_BUCKET
  if (!bucket) return c.notFound()

  const encodedPath = new URL(c.req.url).pathname.slice('/artbook/media/'.length)
  let relativeKey: string

  try {
    relativeKey = encodedPath.split('/').map(decodeURIComponent).join('/')
  } catch {
    return c.text('Invalid media path', 400)
  }

  if (!relativeKey || relativeKey.split('/').includes('..')) return c.notFound()

  const object = await bucket.get(`${ARTBOOK_PREFIX}${relativeKey}`)
  if (!object?.body) return c.notFound()

  const headers = new Headers()
  if (object.httpMetadata?.contentType) headers.set('content-type', object.httpMetadata.contentType)
  if (object.httpMetadata?.cacheControl) headers.set('cache-control', object.httpMetadata.cacheControl)
  headers.set('etag', object.httpEtag)
  if (!headers.has('content-type')) {
    const extension = relativeKey.split('.').pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      avif: 'image/avif',
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }
    headers.set('content-type', contentTypes[extension ?? ''] ?? 'application/octet-stream')
  }
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=3600, stale-while-revalidate=86400')
  if (c.req.header('if-none-match') === object.httpEtag) return new Response(null, { status: 304, headers })

  return new Response(object.body, { headers })
})

export default app
