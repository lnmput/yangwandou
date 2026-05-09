import { jsx } from 'hono/jsx'
import { LetterShell, Signoff } from './components'
import { paraS } from './theme'

export const LetterAlbum = ({ palette }: any) => (
  <LetterShell palette={palette} headerR="letter № 03 · pages from seven years" footer="seven years, seven moments">
    <div style={{ position: "absolute", left: "110px", top: "140px", width: "320px" }}>
      <div style={{
        fontFamily: "var(--f-en-display)",
        fontSize: "56px", fontStyle: "italic",
        color: palette.ink, lineHeight: "1.0", marginBottom: "8px",
      }}>
        Seven<br />moments,
      </div>
      <div style={{
        fontFamily: "var(--f-cn-hand)",
        fontSize: "34px", color: palette.ink,
      }}>
        七 个 春 天
      </div>

      <p style={{ ...paraS(palette), fontSize: "18px", marginTop: "30px" }}>
        每一张照片,<br />
        都是一个没说出口的<br />
        <span style={{ color: palette.accent, fontFamily: "var(--f-cn-serif)", fontWeight: 500 }}>「我爱你」</span>。
      </p>

      <div style={{
        marginTop: "30px",
        fontFamily: "var(--f-en-mono)",
        fontSize: "10px",
        color: palette.inkSubtle,
        letterSpacing: "0.2em",
        lineHeight: "2.2",
        textTransform: "uppercase",
      }}>
        a. 出生 · 2019<br />
        b. 第一步 · 2020<br />
        c. 第一句话 · 2021<br />
        d. 上幼儿园 · 2022<br />
        e. 第一颗牙 · 2024<br />
        f. 上小学 · 2025<br />
        g. 七岁的今天 · 2026
      </div>

      <Signoff palette={palette} top="永远翻给你看 ——" name="爸爸 & 妈妈" />
    </div>

    <div style={{
      position: "absolute", right: "70px", top: "130px", width: "700px", height: "640px",
    }}>
      {[
        { x: 0, y: 0, w: 200, h: 240, r: -3, label: "a · 出生" },
        { x: 230, y: 30, w: 180, h: 200, r: 2, label: "b · 第一步" },
        { x: 440, y: 0, w: 220, h: 270, r: -2, label: "c · 第一句话" },
        { x: 30, y: 290, w: 220, h: 180, r: 1.5, label: "d · 上幼儿园" },
        { x: 280, y: 270, w: 160, h: 200, r: -1, label: "e · 第一颗牙" },
        { x: 470, y: 310, w: 200, h: 230, r: 2.5, label: "f · 上小学" },
        { x: 130, y: 510, w: 240, h: 130, r: -1.5, label: "g · 七岁的今天", accent: true },
      ].map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}px`, top: `${p.y}px`,
          width: `${p.w}px`, height: `${p.h}px`,
          transform: `rotate(${p.r}deg)`,
          background: palette.paperWhite,
          padding: "8px",
          boxShadow: "0 12px 24px -12px rgba(0,0,0,0.3)",
          border: p.accent ? `1px solid ${palette.accent}` : `1px solid ${palette.inkLine}`,
        }}>
          <div class="photo-slot" style={{
            width: "100%", height: "calc(100% - 22px)",
            color: palette.accent,
          }}>
            <span class="photo-label">{p.label}</span>
          </div>
        </div>
      ))}
    </div>
  </LetterShell>
);
