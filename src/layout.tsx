import { jsxRenderer } from 'hono/jsx-renderer'

export const Layout = jsxRenderer(({ children }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <title>杨豌豆 · 画册</title>
        <meta name="description" content="杨豌豆的成长信件录" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%23a89cc4%22>❀</text></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/static/style.css" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Italiana&family=Noto+Serif+SC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&family=Patrick+Hand&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css" rel="stylesheet" />

        <style>{`
          :root {
            --c-night-deep: #1a0b2e;
            --c-night: #2d1748;
            --c-plum: #4a1f5c;
            --c-mauve: #6b1a4c;
            --c-lavender: #c9a9dd;
            --c-lavender-soft: #e8d5f2;
            --c-pink: #f8c9dc;
            --c-pink-soft: #ffe5f1;
            --c-cream: #fef3e7;
            --c-paper: #f5ecdc;
            --c-paper-warm: #efe2cf;
            --c-gold: #c9a35a;
            --c-gold-soft: #e8c16f;
            --c-ink: #2a1f3d;
            --c-ink-soft: #4d3d68;

            --f-child: Patrick Hand, ZCOOL KuaiLe, LXGW WenKai, Kaiti SC, STKaiti, cursive;
            --f-cn-serif: var(--f-child);
            --f-cn-hand: var(--f-child);
            --f-en-hand: var(--f-child);
            --f-en-display: var(--f-child);
            --f-en-serif: var(--f-child);
            --f-en-mono: var(--f-child);
            --f-en-sans: var(--f-child);
          }

          html, body {
            margin: 0; padding: 0;
            background:
              radial-gradient(ellipse at 28% 22%, #fdf6f0 0%, transparent 58%),
              radial-gradient(ellipse at 78% 82%, #c8c8e0 0%, transparent 60%),
              linear-gradient(180deg, #ece8e8 0%, #cfc8d8 100%);
            color: #2c2a52;
            font-family: var(--f-en-sans);
            min-height: 100vh;
          }
          * { box-sizing: border-box; }
          button, input, textarea, select { font-family: inherit; }

          .photo-slot {
            position: relative;
            background-image: repeating-linear-gradient(
              135deg,
              rgba(0,0,0,0.04) 0 1px,
              transparent 1px 8px
            );
            background-color: rgba(255,255,255,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .photo-slot::before {
            content: "";
            position: absolute; inset: 0;
            border: 1px dashed currentColor;
            opacity: 0.35;
            pointer-events: none;
          }
          .photo-slot .photo-label {
            font-family: var(--f-en-mono);
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.55;
            padding: 4px 8px;
            background: rgba(255,255,255,0.4);
            border-radius: 2px;
          }

          .stack {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
            padding: 0;
          }
          .letter-frame {
            transform-origin: top center;
          }
          .pagemark {
            font-family: var(--f-en-mono);
            font-size: 11px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(44,42,82,0.5);
            text-align: center;
            padding: 28px 0;
          }
          .pagemark .glyph {
            color: #5a3a7a;
            margin: 0 10px;
          }
        `}</style>
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          function computeScale() {
            const target = 1440;
            const w = Math.min(window.innerWidth, 1600);
            const s = Math.min(1, w / target);
            document.querySelectorAll('.scale-wrap').forEach(function(el) {
              el.style.width = (1440 * s) + 'px';
              el.style.height = (900 * s) + 'px';
            });
            document.querySelectorAll('.scale-inner').forEach(function(el) {
              el.style.transform = 'scale(' + s + ')';
            });
          }
          window.addEventListener("resize", computeScale);
          computeScale();
        `}} />
      </body>
    </html>
  )
})
