import { Hono } from 'hono'
import { Layout } from './layout'
import { PETAL_PALETTES } from './theme'
import { LetterName } from './LetterName'
import { LetterSeven } from './LetterSeven'
import { LetterAlbum } from './LetterAlbum'
import { getAgeInfo } from './age'
import { Artbook } from './Artbook'
import { ARTBOOK_PREFIX, CloudflareBindings, loadArtbook } from './artbook-data'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', Layout)

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
      <a class="home-artbook-link" href="/artbook">打开画册 <span>→</span></a>
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
