import { Hono } from 'hono'
import { Layout } from './layout'
import { PETAL_PALETTES } from './theme'
import { LetterName } from './LetterName'
import { LetterSeven } from './LetterSeven'
import { LetterAlbum } from './LetterAlbum'
import { getAgeInfo } from './age'

const app = new Hono()

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

export default app
