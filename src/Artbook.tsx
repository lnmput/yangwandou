import { jsx } from 'hono/jsx'
import type { ArtbookData, Artwork } from './artbook-data'

const TitlePage = ({ artbook }: { artbook: ArtbookData }) => (
  <div class="title-leaf">
    <div class="title-icons" aria-hidden="true">🎨　✏️　🌱</div>
    <div class="title-eyebrow">我的第一本</div>
    <h1>{artbook.title}</h1>
    <div class="title-rule" />
    <div class="title-years">{artbook.years}</div>
    <p>{artbook.description}</p>
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

        pageFlip.on('init', (event) => syncControls(event.data.page));
        pageFlip.on('changeState', (event) => {
          if (event.data !== 'flipping') return;
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
