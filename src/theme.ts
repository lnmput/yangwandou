export const PETAL_PALETTES = {
  cream: {
    name: "奶油薰衣草 · Cream & Lilac",
    bg:
      "radial-gradient(ellipse at 30% 20%, #fff5e6 0%, transparent 60%)," +
      "radial-gradient(ellipse at 75% 80%, #f8d9e6 0%, transparent 60%)," +
      "linear-gradient(180deg, #f5ecdc 0%, #efe2cf 100%)",
    ink: "#3d2a5c",
    inkSoft: "rgba(77,61,104,0.7)",
    inkLine: "rgba(74,31,92,0.18)",
    inkLineSoft: "rgba(74,31,92,0.12)",
    inkSubtle: "rgba(77,61,104,0.6)",
    accent: "#6b3a5c",
    petal: "#d8a3bf",
    border: "rgba(201,138,171,0.5)",
    seal: ["#d96a8a", "#a83a5d", "#7d2545"],
    paperWhite: "rgba(255,253,247,0.6)",
  },
  rose: {
    name: "暮玫瑰 · Twilight Rose",
    bg:
      "radial-gradient(ellipse at 25% 20%, #ffe8e0 0%, transparent 60%)," +
      "radial-gradient(ellipse at 80% 85%, #e9b6c5 0%, transparent 60%)," +
      "linear-gradient(180deg, #f6e0d8 0%, #e8c4c8 100%)",
    ink: "#5a2838",
    inkSoft: "rgba(90,40,56,0.72)",
    inkLine: "rgba(90,40,56,0.22)",
    inkLineSoft: "rgba(90,40,56,0.14)",
    inkSubtle: "rgba(90,40,56,0.6)",
    accent: "#a04a64",
    petal: "#c97090",
    border: "rgba(160,74,100,0.45)",
    seal: ["#cf5a78", "#8b2c4a", "#5e1a30"],
    paperWhite: "rgba(255,250,246,0.65)",
  },
  sage: {
    name: "春田绿 · Spring Sage",
    bg:
      "radial-gradient(ellipse at 30% 20%, #fff8ea 0%, transparent 60%)," +
      "radial-gradient(ellipse at 78% 82%, #d4dcb8 0%, transparent 60%)," +
      "linear-gradient(180deg, #f3eed8 0%, #d8d8b8 100%)",
    ink: "#2e3a1e",
    inkSoft: "rgba(46,58,30,0.72)",
    inkLine: "rgba(46,58,30,0.2)",
    inkLineSoft: "rgba(46,58,30,0.12)",
    inkSubtle: "rgba(46,58,30,0.6)",
    accent: "#7a4a5c",
    petal: "#c89aa8",
    border: "rgba(122,74,92,0.4)",
    seal: ["#c45e7c", "#8a3656", "#5e2038"],
    paperWhite: "rgba(254,251,242,0.65)",
  },
  powder: {
    name: "霜粉蓝 · Powder Frost",
    bg:
      "radial-gradient(ellipse at 28% 22%, #fdf6f0 0%, transparent 58%)," +
      "radial-gradient(ellipse at 78% 82%, #c8c8e0 0%, transparent 60%)," +
      "linear-gradient(180deg, #ece8e8 0%, #cfc8d8 100%)",
    ink: "#2c2a52",
    inkSoft: "rgba(44,42,82,0.72)",
    inkLine: "rgba(44,42,82,0.2)",
    inkLineSoft: "rgba(44,42,82,0.12)",
    inkSubtle: "rgba(44,42,82,0.6)",
    accent: "#5a3a7a",
    petal: "#a89cc4",
    border: "rgba(90,58,122,0.45)",
    seal: ["#9876b0", "#5a3a7a", "#3a224a"],
    paperWhite: "rgba(255,253,250,0.65)",
  },
};

export const paraS = (p: any) => ({
  fontFamily: "var(--f-cn-hand)",
  fontSize: "21px",
  lineHeight: "1.95",
  color: p.ink,
  margin: "28px 0 0 0",
  letterSpacing: "0.04em",
});

export const paraEnS = (p: any) => ({
  fontFamily: "var(--f-en-serif)",
  fontStyle: "italic",
  fontSize: "16px",
  lineHeight: "1.7",
  color: p.inkSoft,
  margin: "10px 0 0 0",
  paddingLeft: "16px",
  borderLeft: `1px solid ${p.border}`,
});
