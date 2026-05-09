import { jsx } from 'hono/jsx'
import { LetterShell, WaxSeal, Signoff } from './components'
import { paraS, paraEnS } from './theme'

export const LetterSeven = ({ palette }: any) => (
  <LetterShell palette={palette} headerR="letter № 02 · seven, MMXXVI" footer="for your seventh spring">
    <div style={{ position: "absolute", left: "110px", top: "130px", width: "720px" }}>
      <div style={{
        fontFamily: "var(--f-en-display)",
        fontSize: "64px", fontStyle: "italic",
        color: palette.ink, lineHeight: "1.1", marginBottom: "6px",
      }}>
        On your <em style={{ color: palette.accent }}>seventh</em> spring,
      </div>
      <div style={{
        fontFamily: "var(--f-cn-hand)",
        fontSize: "42px", color: palette.ink, marginBottom: "10px",
      }}>
        给七岁的豌豆 ——
      </div>

      <p style={paraS(palette)}>
        七年前,我们把一颗豌豆种进了心里。<br />
        现在,她长成了一个会笑的小人 ——<br />
        会跑、会跳、会画画、会自己系鞋带,<br />
        还会突然抱住我们说「我爱你」。
      </p>
      <p style={paraEnS(palette)}>
        Seven springs ago we planted a single pea. Today she runs, draws,
        ties her own shoelaces, and sometimes — without warning — wraps
        her arms around us and says <em>I love you</em>.
      </p>

      <p style={paraS(palette)}>
        愿你永远像今年春天这样 ——<br />
        眼睛亮,笑声响,藤蔓往着光的方向爬。
      </p>

      <Signoff palette={palette} top="爱你 · 像第一天那样 ——" name="爸爸 & 妈妈" />
    </div>

    <div style={{
      position: "absolute", right: "90px", top: "150px", width: "320px",
      background: palette.paperWhite,
      border: `1px solid ${palette.inkLine}`,
      padding: "18px",
      transform: "rotate(-1.5deg)",
      boxShadow: "0 30px 60px -30px rgba(0,0,0,0.25), 0 8px 20px -10px rgba(0,0,0,0.12)",
    }}>
      <div style={{
        fontFamily: "var(--f-en-display)",
        fontSize: "22px", color: palette.ink, fontStyle: "italic",
      }}>Growth Chart</div>
      <div style={{
        fontFamily: "var(--f-cn-serif)", fontSize: "13px",
        color: palette.inkSoft, letterSpacing: "0.15em", marginTop: "4px",
      }}>身高 记录 · age 0—7</div>

      <div style={{ height: "1px", background: palette.inkLine, margin: "12px 0" }} />

      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "220px", paddingTop: "10px" }}>
        {[
          { y: "0", h: 28 },
          { y: "1", h: 50 },
          { y: "2", h: 78 },
          { y: "3", h: 100 },
          { y: "4", h: 130 },
          { y: "5", h: 156 },
          { y: "6", h: 178 },
          { y: "7", h: 200, accent: true },
        ].map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: "100%",
              height: `${b.h}px`,
              background: b.accent ? palette.accent : palette.petal,
              opacity: b.accent ? 1 : 0.55,
            }} />
            <div style={{
              fontFamily: "var(--f-en-mono)",
              fontSize: "9px",
              color: palette.inkSubtle,
              marginTop: "6px",
              letterSpacing: "0.1em",
            }}>{b.y}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "14px",
        fontFamily: "var(--f-cn-hand)",
        fontSize: "14px",
        color: palette.ink,
        textAlign: "center",
        fontStyle: "italic",
      }}>
        ↑ 还在长 · still growing
      </div>
    </div>

    <WaxSeal palette={palette} text={"七\n岁"} x={180} y={110} rot={6} />
  </LetterShell>
);
