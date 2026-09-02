import { jsx } from 'hono/jsx'
import { LetterShell, WaxSeal, Signoff, SpecimenCard } from './components'
import { paraS, paraEnS } from './theme'

export const LetterName = ({ palette, ageInfo }: any) => (
  <LetterShell palette={palette} headerR="letter № 01 · spring, MMXIX" footer="on the day we named you">
    <div style={{ position: "absolute", left: "110px", top: "130px", width: "720px" }}>
      <div style={{
        fontFamily: "var(--f-en-hand)",
        fontSize: "78px", fontStyle: "normal",
        color: palette.ink, lineHeight: "1.05", marginBottom: "8px",
      }}>
        Dear
        <span style={{
          fontFamily: "var(--f-cn-hand)", fontStyle: "normal",
          fontSize: "36px", margin: "0 18px",
          verticalAlign: "middle", color: palette.accent,
        }}>亲爱的</span>
        <span style={{
          fontFamily: "var(--f-cn-hand)", fontStyle: "normal",
          color: palette.ink, fontSize: "78px",
        }}>豌豆,</span>
      </div>

      <p style={paraS(palette)}>
        你的名字是一粒小小的种子。<br />
        奶奶说,豌豆开花的时候,
        <br />田垄上像落了一群浅紫色的蝴蝶。
      </p>
      <p style={{ ...paraEnS(palette), fontFamily: "var(--f-en-hand)", fontStyle: "normal" }}>
        Your name is a tiny seed. When pea blossoms open in spring,
        the furrows look as if a hundred lavender butterflies have just landed.
      </p>

      <p style={paraS(palette)}>
        我们给你这个名字,是希望你像豌豆一样 ——<br />
        圆圆的,甜甜的,藏在小小的房子里,<br />
        会发芽,会开花,也会结出饱满的小小豌豆。
      </p>

      <Signoff palette={palette} top="永远爱你的 ——" name="爸爸 & 妈妈" />
    </div>

    <SpecimenCard palette={palette} title="Pisum sativum" sub="杨豌豆 · garden pea" img="/static/1.png" href="/artbook"
      rows={[["collected", String(ageInfo.birthYear)], ["now", `${ageInfo.cnAge}岁 · ${ageInfo.age}`], ["height", "still growing ↑"]]} />

    <WaxSeal palette={palette} x={60} y={162} rot={-8} />
  </LetterShell>
);
