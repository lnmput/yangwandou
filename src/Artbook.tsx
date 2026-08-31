import { jsx } from 'hono/jsx'
import type { ArtbookData, Artwork } from './artbook-data'

const TitlePage = ({ artbook }: { artbook: ArtbookData }) => (
  <div class="title-leaf">
    <svg class="title-doodles" viewBox="0 0 540 675" preserveAspectRatio="none" aria-hidden="true">
      <g class="doodle-sun" transform="translate(455 76) rotate(-8)">
        <circle cx="0" cy="0" r="25" />
        <path d="M0-42V-56M0 42v14M-42 0h-14M42 0h14M-30-30l-10-10M30 30l10 10M30-30l10-10M-30 30l-10 10" />
      </g>
      <path class="doodle-cloud" d="M292 82c18-19 41-9 44 8 13-11 34-2 31 14 18 0 25 10 18 19H278c-10-13-2-34 14-41Z" />
      <path class="doodle-vine" d="M22 666c65-73 16-128 72-186 44-46 11-89 54-137 24-27 29-51 27-79" />
      <g class="doodle-leaves">
        <ellipse cx="59" cy="585" rx="28" ry="14" transform="rotate(-26 59 585)" />
        <ellipse cx="86" cy="532" rx="27" ry="13" transform="rotate(25 86 532)" />
        <ellipse cx="104" cy="459" rx="25" ry="12" transform="rotate(-27 104 459)" />
        <ellipse cx="137" cy="392" rx="23" ry="11" transform="rotate(30 137 392)" />
        <ellipse cx="151" cy="325" rx="21" ry="10" transform="rotate(-28 151 325)" />
      </g>
      <g class="doodle-peas" transform="translate(29 620) rotate(-26)">
        <path d="M0 0c26-21 70-19 93 3-29 26-70 27-93-3Z" />
        <circle cx="24" cy="1" r="7" /><circle cx="47" cy="0" r="7" /><circle cx="70" cy="1" r="7" />
      </g>
      <path class="doodle-squiggle" d="M355 580c18-17 25 18 43 1s26 18 44 0 27 17 45-2" />
      <path class="doodle-star" d="m462 320 6 14 15 2-12 10 4 15-13-8-13 8 4-15-12-10 15-2Z" />
    </svg>

    <div class="title-card">
      <div class="title-kicker"><span>01</span> MY LITTLE ART BOOK</div>
      <div class="title-eyebrow">我的第一本</div>
      <h1 aria-label={artbook.title}>
        {Array.from(artbook.title).map((character, index) => (
          <span key={`${character}-${index}`} aria-hidden="true">{character}</span>
        ))}
      </h1>
      <p>{artbook.description}</p>
      <i class="title-crayon-line" aria-hidden="true" />
    </div>

    <div class="title-year-stamp">
      <small>DRAWINGS FROM</small>
      <strong>{artbook.years}</strong>
    </div>
    <div class="title-signature">WANDOU · 画着长大</div>
  </div>
)

const ArtworkPage = ({ artwork, side }: { artwork: Artwork, side: 'left' | 'right' }) => {
  const metadata = [artwork.date, artwork.age].filter(Boolean).join(' · ')

  return (
    <figure class={`artwork-sheet artwork-${side}${artwork.showCaption ? ' has-caption' : ' without-caption'}`}>
      <div class="artwork-image">
        <img src={artwork.src} alt={`《${artwork.title}》`} loading="lazy" />
      </div>
      {artwork.showCaption && (
        <figcaption>
          <strong>《{artwork.title}》</strong>
          {metadata && <small>{metadata}</small>}
        </figcaption>
      )}
      <span class="folio">{artwork.no}</span>
    </figure>
  )
}

export const Artbook = ({ artbook }: { artbook: ArtbookData }) => {
  const contentPageCount = Math.max(1, artbook.artworks.length)
  const artworkSpreadCount = Math.max(1, Math.ceil(contentPageCount / 2))

  return (
    <main class="artbook-page">
    <div class="artbook-grain" aria-hidden="true" />
    <header class="artbook-topbar">
      <a class="artbook-brand" href="/">❀ <span>yangwandou.com</span></a>
      <span class="artbook-edition">THE ARTBOOK · {artbook.years}</span>
      <a class="artbook-back" href="/">返回信件 <span>↗</span></a>
    </header>

    <section class="artbook-stage" aria-label="杨豌豆的画册">
      <div class="artbook-engine" id="artbook-engine">
        <div class="book-page cover-page" data-density="hard">
          <img class="cover-art" src={artbook.coverSrc} alt="画册封面" />
          <span class="cover-edge" aria-hidden="true" />
        </div>

        <div class="book-page paper-page inside-cover-page" data-density="hard">
          <div class="inside-cover" aria-hidden="true" />
        </div>

        <div class="book-page paper-page title-page">
          <TitlePage artbook={artbook} />
        </div>

        {artbook.artworks.map((artwork, index) => (
          <div class="book-page paper-page artwork-page" data-artwork={artwork.no}>
            <ArtworkPage artwork={artwork} side={index % 2 === 0 ? 'left' : 'right'} />
          </div>
        ))}

        {artbook.artworks.length === 0 && (
          <div class="book-page paper-page empty-artbook-page">
            <span>新的画正在路上</span>
          </div>
        )}

        {contentPageCount % 2 === 1 && <div class="book-page paper-page blank-artwork-page" />}

        <div class="book-page paper-page back-cover-page" data-density="hard">
          <div class="back-cover-mark">杨豌豆 · {artbook.years}</div>
        </div>
      </div>

      <div class="artbook-controls" aria-label="画册导航">
        <button type="button" class="book-control" id="prev-page" aria-label="上一页">←</button>
        <div class="page-status"><span id="current-spread">封面</span><i /> <span>{String(artworkSpreadCount).padStart(2, '0')}</span></div>
        <button type="button" class="book-control" id="next-page" aria-label="下一页">→</button>
      </div>
      <p class="artbook-keyhint">点击页面翻页 · <button type="button" id="close-book">回到封面</button></p>
    </section>

    <script src="/static/vendor/page-flip.browser.js"></script>
    <script dangerouslySetInnerHTML={{ __html: `
      (() => {
        const root = document.getElementById('artbook-engine');
        if (!root || !window.St || !window.St.PageFlip) return;

        const status = document.getElementById('current-spread');
        const previous = document.getElementById('prev-page');
        const next = document.getElementById('next-page');
        const close = document.getElementById('close-book');
        const artworkSpreadCount = ${artworkSpreadCount};
        let closingToCover = false;
        const pageFlip = new window.St.PageFlip(root, {
          width: 540,
          height: 675,
          size: 'fixed',
          drawShadow: true,
          flippingTime: 920,
          usePortrait: false,
          startZIndex: 0,
          autoSize: true,
          maxShadowOpacity: 0.28,
          showCover: true,
          mobileScrollSupport: false,
          useMouseEvents: true,
          disableFlipByClick: false
        });

        const labelForPage = (page) => {
          if (page === 0) return '封面';
          if (page <= 2) return '扉页';
          return String(Math.min(artworkSpreadCount, Math.ceil((page - 2) / 2))).padStart(2, '0');
        };

        const syncControls = (page) => {
          status.textContent = labelForPage(page);
          previous.disabled = page === 0;
          next.disabled = page >= pageFlip.getPageCount() - 1;
          document.body.classList.toggle('artbook-is-open', page !== 0);
        };

        let audioCtx = null;
        let flipBuffer = null;
        let fallbackAudio = null;

        const getAudioContext = () => {
          if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
          }
          return audioCtx;
        };

        const loadFlipSound = async () => {
          try {
            const ctx = getAudioContext();
            if (ctx && !flipBuffer) {
              const res = await fetch('/static/audio/page-flip.mp3');
              if (res.ok) {
                const arr = await res.arrayBuffer();
                flipBuffer = await ctx.decodeAudioData(arr);
              }
            }
          } catch (e) {}
          if (!fallbackAudio) {
            fallbackAudio = new Audio('/static/audio/page-flip.mp3');
            fallbackAudio.preload = 'auto';
          }
        };

        const playFlipSound = () => {
          const ctx = getAudioContext();
          if (ctx) {
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            if (flipBuffer) {
              try {
                const src = ctx.createBufferSource();
                src.buffer = flipBuffer;
                const gain = ctx.createGain();
                gain.gain.value = 0.8;
                src.connect(gain);
                gain.connect(ctx.destination);
                src.start(0);
                return;
              } catch (e) {}
            }
          }
          try {
            const audio = (fallbackAudio && fallbackAudio.cloneNode()) || new Audio('/static/audio/page-flip.mp3');
            audio.volume = 0.8;
            audio.play().catch(() => {});
          } catch (e) {}
        };

        loadFlipSound();
        const unlock = () => {
          const ctx = getAudioContext();
          if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });

        pageFlip.on('init', (event) => syncControls(event.data.page));
        pageFlip.on('changeState', (event) => {
          if (event.data !== 'flipping') return;
          playFlipSound();
          const page = pageFlip.getCurrentPageIndex();
          const direction = pageFlip.getFlipController().getCalculation()?.getDirection();
          if (page === 0 && direction === 0) document.body.classList.add('artbook-is-open');
          if ((page <= 2 && direction === 1) || closingToCover) document.body.classList.remove('artbook-is-open');
        });
        pageFlip.on('flip', (event) => syncControls(event.data));
        pageFlip.loadFromHTML(root.querySelectorAll('.book-page'));

        previous.addEventListener('click', () => pageFlip.flipPrev('top'));
        next.addEventListener('click', () => pageFlip.flipNext('top'));
        close.addEventListener('click', () => {
          closingToCover = true;
          document.body.classList.remove('artbook-is-open');
          pageFlip.flip(0, 'top');
          window.setTimeout(() => { closingToCover = false; }, 1000);
        });

        document.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowRight') pageFlip.flipNext('top');
          if (event.key === 'ArrowLeft') pageFlip.flipPrev('top');
          if (event.key === 'Escape') close.click();
        });
      })();
    ` }} />
    </main>
  )
}
