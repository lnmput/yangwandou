import { jsx } from 'hono/jsx'

const scatteredPetals = (n: number, palette: any) => {
  const seed = (i: number) => {
    const x = Math.sin(i * 7321 + 12347) * 233280;
    return x - Math.floor(x);
  };
  return Array.from({ length: n }, (_, i) => ({
    left: seed(i) * 100,
    top: seed(i + 100) * 100,
    rot: seed(i + 200) * 360,
    size: 6 + seed(i + 300) * 10,
    op: 0.15 + seed(i + 400) * 0.25,
  }));
};

export const Petals = ({ palette, count = 18 }: { palette: any; count?: number }) => (
  <>
    {scatteredPetals(count, palette).map((p, i) => (
      <svg
        key={i}
        width={p.size}
        height={p.size * 1.4}
        viewBox="0 0 10 14"
        style={{
          position: "absolute",
          left: p.left + "%",
          top: p.top + "%",
          transform: `rotate(${p.rot}deg)`,
          opacity: p.op,
          pointerEvents: "none",
        }}
      >
        <path d="M5 0 C 8 4, 9 8, 5 14 C 1 8, 2 4, 5 0 Z" fill={palette.petal} />
      </svg>
    ))}
  </>
);

export const LetterShell = ({ palette, headerR, children, footer = "a small letter, kept forever" }: any) => {
  return (
    <div style={{
      position: "relative",
      width: "1440px", height: "900px",
      overflow: "hidden",
      background: palette.bg,
      color: palette.inkSoft,
      fontFamily: "var(--f-en-serif)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 4px)," +
          "repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 6px)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", inset: "24px", border: `1px solid ${palette.inkLineSoft}`, pointerEvents: "none" }} />

      <Petals palette={palette} />

      <div style={{
        position: "absolute",
        left: "56px", right: "56px", top: "50px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--f-en-mono)",
        fontSize: "11px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: palette.inkSubtle,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: palette.petal, fontSize: "16px" }}>❀</span>
          <span>yangwandou.com</span>
        </div>
        <div style={{
          fontFamily: "var(--f-en-serif)",
          fontStyle: "italic",
          fontSize: "13px",
          textTransform: "none",
          letterSpacing: "0.1em",
        }}>{headerR}</div>
      </div>

      {children}

      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: "50px",
        textAlign: "center",
        fontFamily: "var(--f-en-serif)",
        fontStyle: "italic",
        fontSize: "13px",
        color: palette.inkSubtle,
        letterSpacing: "0.1em",
      }}>
        — &nbsp; {footer} &nbsp; —
      </div>
    </div>
  );
};

export const WaxSeal = ({ palette, text = "豌\n豆", x = 180, y = 110, rot = -8 }: any) => {
  const [c1, c2, c3] = palette.seal;
  return (
    <div style={{
      position: "absolute",
      right: `${x}px`, bottom: `${y}px`,
      width: "88px", height: "88px",
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 30%, ${c1} 0%, ${c2} 70%, ${c3} 100%)`,
      boxShadow: `0 8px 16px -4px ${c3}80, inset -4px -4px 8px rgba(0,0,0,0.25)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: `rotate(${rot}deg)`,
    }}>
      <div style={{
        width: "70px", height: "70px", borderRadius: "50%",
        border: "1px dashed rgba(254,243,231,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "var(--f-cn-serif)",
          color: "#fef3e7",
          fontSize: "18px",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: "1.05",
          letterSpacing: "0.05em",
          whiteSpace: "pre-line",
        }}>{text}</div>
      </div>
    </div>
  );
};

export const Signoff = ({ palette, top, name }: any) => (
  <div style={{ marginTop: "40px", fontFamily: "var(--f-cn-hand)" }}>
    <div style={{ fontSize: "18px", color: palette.accent, letterSpacing: "0.06em" }}>{top}</div>
    <div style={{
      marginTop: "8px", fontSize: "30px", color: palette.ink,
      fontFamily: "var(--f-cn-hand)",
      transform: "rotate(-2deg)",
      transformOrigin: "left",
      display: "inline-block",
    }}>{name}</div>
  </div>
);

export const SpecimenCard = ({ palette, title, sub, rows, img }: any) => (
  <div style={{
    position: "absolute", right: "90px", top: "150px", width: "320px",
    background: palette.paperWhite,
    border: `1px solid ${palette.inkLine}`,
    padding: "18px",
    transform: "rotate(2.5deg)",
    boxShadow: "0 30px 60px -30px rgba(0,0,0,0.25), 0 8px 20px -10px rgba(0,0,0,0.15)",
  }}>
    {img ? (
      <img src={img} alt="photo" style={{ width: "100%", height: "360px", objectFit: "cover", display: "block" }} />
    ) : (
      <div class="photo-slot" style={{ width: "100%", height: "360px", color: palette.accent }}>
        <span class="photo-label">photo · 豌豆</span>
      </div>
    )}
    <div style={{ paddingTop: "14px" }}>
      <div style={{ fontFamily: "var(--f-en-serif)", fontSize: "22px", color: palette.ink, fontStyle: "italic" }}>
        <em>{title}</em>
      </div>
      <div style={{ fontFamily: "var(--f-cn-serif)", fontSize: "13px", color: palette.inkSoft, letterSpacing: "0.15em", marginTop: "4px" }}>
        {sub}
      </div>
      <div style={{ height: "1px", background: palette.inkLine, margin: "12px 0" }} />
      {rows.map(([k, v]: string[], i: number) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontFamily: "var(--f-en-mono)", fontSize: "10px",
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: palette.inkSoft, padding: "4px 0",
        }}>
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
    </div>
  </div>
);
