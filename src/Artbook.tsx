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
      <div class="title-kicker"><span>01</span> THE ARTBOOK OF YANGWANDOU</div>
      <div class="title-eyebrow">我的第一本</div>
      <h1 aria-label={artbook.title}>
        {Array.from(artbook.title).map((character, index) => (
          <span key={`${character}-${index}`} aria-hidden="true">{character}</span>
        ))}
      </h1>
      <p>一个女孩眼里闪闪发光的世界</p>
      <i class="title-crayon-line" aria-hidden="true" />
    </div>

    <div class="title-year-stamp">
      <small>DRAWINGS FROM</small>
      <strong>{artbook.years}</strong>
    </div>
    <div class="title-signature">❀ 爸爸妈妈收集整理</div>
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

    {/* Desktop View (>= 769px): Original 3D PageFlip spread */}
    <div class="artbook-desktop-view">
      <div class="artbook-scale-wrap" id="artbook-scale-wrap">
        <div class="artbook-scale-inner" id="artbook-scale-inner">
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
            <p class="artbook-keyhint"><span class="desktop-hint">点击页面翻页 · </span><button type="button" id="close-book">回到封面</button></p>
          </section>
        </div>
      </div>
    </div>

    {/* Mobile View (<= 768px): Dedicated Full-card touch slider */}
    <div class="artbook-mobile-view">
      <section class="mobile-book-container" aria-label="杨豌豆画册移动版">
        <div class="mobile-slider-viewport" id="mobile-slider-viewport">
          <div class="mobile-slider-track" id="mobile-slider-track">
            {/* Slide 0: Cover */}
            <div class="mobile-slide">
              <div class="mobile-card mobile-cover-card">
                <img class="mobile-cover-art" src={artbook.coverSrc} alt="画册封面" />
                <span class="cover-edge" aria-hidden="true" />
              </div>
            </div>

            {/* Slide 1: Title Page */}
            <div class="mobile-slide">
              <div class="mobile-card mobile-paper-card mobile-title-card">
                <TitlePage artbook={artbook} />
              </div>
            </div>

            {/* Slide 2..N: Artworks */}
            {artbook.artworks.map((artwork) => (
              <div class="mobile-slide">
                <div class="mobile-card mobile-paper-card mobile-artwork-card">
                  <div class="m-artwork-image-box">
                    <img class="m-artwork-img" src={artwork.src} alt={artwork.title} loading="lazy" />
                  </div>
                  <div class="m-artwork-meta-box">
                    <strong class="m-artwork-title">《{artwork.title}》</strong>
                    <div class="m-artwork-sub">{artwork.date} · {artwork.age}</div>
                  </div>
                  <span class="m-artwork-folio">{artwork.no}</span>
                </div>
              </div>
            ))}

            {artbook.artworks.length === 0 && (
              <div class="mobile-slide">
                <div class="mobile-card mobile-paper-card mobile-back-card">
                  <div class="m-back-inner">
                    <p class="m-back-note">新的画正在路上</p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Last: Back Cover */}
            <div class="mobile-slide">
              <div class="mobile-card mobile-paper-card mobile-back-card">
                <div class="m-back-inner">
                  <div class="m-back-mark">杨豌豆 · {artbook.years}</div>
                  <p class="m-back-note">谢谢观看 ❀</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mobile-controls" aria-label="画册导航">
          <button type="button" class="mobile-control-btn" id="m-prev-btn" aria-label="上一页">←</button>
          <div class="mobile-page-status">
            <span id="m-current-label">封面</span>
            <i class="mobile-status-line" />
            <span id="m-total-label">{String(artbook.artworks.length).padStart(2, '0')}</span>
          </div>
          <button type="button" class="mobile-control-btn" id="m-next-btn" aria-label="下一页">→</button>
        </div>
        <p class="mobile-keyhint">轻触或左右轻扫翻页 · <button type="button" id="m-to-cover">回到封面</button></p>
      </section>
    </div>

    <script src="/static/vendor/page-flip.browser.js"></script>
    <script dangerouslySetInnerHTML={{ __html: `
      (() => {
        // Shared Audio Player
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

        // Desktop St.PageFlip Handler
        const root = document.getElementById('artbook-engine');
        const scaleWrap = document.getElementById('artbook-scale-wrap');
        const scaleInner = document.getElementById('artbook-scale-inner');

        if (root && window.St && window.St.PageFlip) {
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

          const computeScale = () => {
            if (!scaleWrap || !scaleInner) return;
            const targetW = 1140;
            const w = window.innerWidth;
            const s = Math.min(1, w / targetW);
            if (s < 0.999 && w >= 769) {
              scaleInner.style.transform = 'scale(' + s + ')';
              scaleWrap.style.height = Math.round(scaleInner.offsetHeight * s) + 'px';
            } else {
              scaleInner.style.transform = '';
              scaleWrap.style.height = '';
            }
          };

          const labelForPage = (page) => {
            if (page === 0) return '封面';
            if (page <= 2) return '扉页';
            return String(Math.min(artworkSpreadCount, Math.ceil((page - 2) / 2))).padStart(2, '0');
          };

          const syncControls = (page) => {
            if (status) status.textContent = labelForPage(page);
            if (previous) previous.disabled = page === 0;
            if (next) next.disabled = page >= pageFlip.getPageCount() - 1;
            document.body.classList.toggle('artbook-is-open', page !== 0);
            computeScale();
          };

          pageFlip.on('init', (event) => {
            syncControls(event.data.page);
            computeScale();
          });
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

          if (pageFlip.ui && pageFlip.ui.getMousePos) {
            pageFlip.ui.getMousePos = function(clientX, clientY) {
              const rect = this.distElement.getBoundingClientRect();
              const scale = rect.width / 1080;
              return {
                x: (clientX - rect.left) / (scale || 1),
                y: (clientY - rect.top) / (scale || 1)
              };
            };
          }

          window.addEventListener('resize', computeScale);
          computeScale();

          if (previous) previous.addEventListener('click', () => pageFlip.flipPrev('top'));
          if (next) next.addEventListener('click', () => pageFlip.flipNext('top'));
          if (close) {
            close.addEventListener('click', () => {
              closingToCover = true;
              document.body.classList.remove('artbook-is-open');
              pageFlip.flip(0, 'top');
              window.setTimeout(() => { closingToCover = false; }, 1000);
            });
          }

          document.addEventListener('keydown', (event) => {
            if (window.innerWidth <= 768) return;
            if (event.key === 'ArrowRight') pageFlip.flipNext('top');
            if (event.key === 'ArrowLeft') pageFlip.flipPrev('top');
            if (event.key === 'Escape' && close) close.click();
          });
        }

        // Mobile Slider Setup
        const mViewport = document.getElementById('mobile-slider-viewport');
        const mTrack = document.getElementById('mobile-slider-track');
        const mPrev = document.getElementById('m-prev-btn');
        const mNext = document.getElementById('m-next-btn');
        const mCurrent = document.getElementById('m-current-label');
        const mToCover = document.getElementById('m-to-cover');
        const totalArtworks = ${artbook.artworks.length};
        const totalSlides = totalArtworks + 3;
        let mIndex = 0;

        const updateMobileUI = () => {
          if (!mTrack || !mCurrent) return;
          mTrack.style.transform = 'translateX(-' + (mIndex * 100) + '%)';
          if (mIndex === 0) {
            mCurrent.textContent = '封面';
          } else if (mIndex === 1) {
            mCurrent.textContent = '扉页';
          } else if (mIndex <= totalArtworks + 1) {
            mCurrent.textContent = String(mIndex - 1).padStart(2, '0');
          } else {
            mCurrent.textContent = '封底';
          }
          if (mPrev) mPrev.disabled = mIndex === 0;
          if (mNext) mNext.disabled = mIndex >= totalSlides - 1;
        };

        const goMobileSlide = (idx) => {
          if (idx < 0 || idx >= totalSlides || idx === mIndex) return;
          mIndex = idx;
          playFlipSound();
          updateMobileUI();
        };

        if (mPrev) mPrev.addEventListener('click', () => goMobileSlide(mIndex - 1));
        if (mNext) mNext.addEventListener('click', () => goMobileSlide(mIndex + 1));
        if (mToCover) mToCover.addEventListener('click', () => goMobileSlide(0));

        if (mViewport) {
          let touchStartX = 0;
          let touchStartY = 0;
          let touchDeltaX = 0;
          let isSwiping = false;

          mViewport.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
              touchStartX = e.touches[0].clientX;
              touchStartY = e.touches[0].clientY;
              touchDeltaX = 0;
              isSwiping = true;
            }
          }, { passive: true });

          mViewport.addEventListener('touchmove', (e) => {
            if (!isSwiping || e.touches.length === 0) return;
            touchDeltaX = e.touches[0].clientX - touchStartX;
          }, { passive: true });

          mViewport.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            if (Math.abs(touchDeltaX) > 36) {
              if (touchDeltaX < 0) {
                goMobileSlide(mIndex + 1);
              } else {
                goMobileSlide(mIndex - 1);
              }
            }
          }, { passive: true });

          mViewport.addEventListener('click', (e) => {
            const rect = mViewport.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX > rect.width * 0.65) {
              goMobileSlide(mIndex + 1);
            } else if (clickX < rect.width * 0.35) {
              goMobileSlide(mIndex - 1);
            }
          });
        }
        updateMobileUI();
      })();
    ` }} />
    </main>
  )
}
