// ことほぎ 専用の動き
// 主役：金の輪（初回だけ・1秒未満）→ 2本の線が近づいて水引に結ばれる。あとは「ご縁の糸」と見出しの水引が静かに結ばれるだけ。
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // 読み込み画面：同じタブで2回目以降は出さない
  const loader = $('.loader');
  let seen = false;
  try { seen = sessionStorage.getItem('kotohogi-seen') === '1'; sessionStorage.setItem('kotohogi-seen', '1'); } catch (e) {}
  if (seen && loader) loader.remove();

  // ご縁の糸：PCの左の余白の中だけを、ゆるく揺れながら下りていく（文章の上は通らない）
  const thread = $('.thread'), tpath = thread && $('path', thread), main = $('main');
  const drawThread = () => {
    if (!thread) return false;
    const w = main.clientWidth, h = main.scrollHeight, margin = (w - 1120) / 2;
    if (margin < 120) { thread.style.display = 'none'; return false; }
    thread.style.display = '';
    thread.setAttribute('viewBox', `0 0 ${w} ${h}`); thread.style.height = `${h}px`;
    const cx = margin / 2, amp = Math.min(margin / 2 - 28, 56), step = 420, y0 = innerHeight * 0.85;
    let d = `M ${cx} ${y0}`;
    for (let y = y0, i = 0; y < h - 260; y += step, i++) {
      const s = i % 2 ? -1 : 1;
      d += ` C ${cx + s * amp} ${y + step * 0.3}, ${cx + s * amp} ${y + step * 0.7}, ${cx} ${y + step}`;
    }
    tpath.setAttribute('d', d);
    return true;
  };
  const hasThread = drawThread();

  if (!window.gsap || !window.ScrollTrigger || reduced) {
    document.documentElement.classList.remove('js'); loader && loader.remove(); return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const header = $('.header');
  const top = $('.hero, .sub');
  ScrollTrigger.create({ trigger: top, start: 'bottom 90px', onEnter: () => header.classList.add('is-solid'), onLeaveBack: () => header.classList.remove('is-solid') });
  const bar = $('.spBar'), end = $('.contact') || $('.line') || $('.footer');
  ScrollTrigger.create({ trigger: top, start: 'bottom 70%', endTrigger: end, end: 'top bottom', onToggle: (s) => bar.classList.toggle('is-on', s.isActive) });

  // 線を描く準備（pathLength=1 の線は 1→0 で描ける）
  const ready = (els) => gsap.set(els, { strokeDasharray: 1, strokeDashoffset: 1 });
  ready(['.loader_ring circle', '.th', '.hero_knot path', '.knot path']);

  // ---------- 開くとき ----------
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  let t = 0;
  if (loader && !seen) {
    tl.to('.loader_ring circle', { strokeDashoffset: 0, duration: 0.55 })
      .fromTo('.loader_star', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 0.4)
      .fromTo('.loader_word', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.35)
      .to('.loader', { opacity: 0, duration: 0.25, onComplete: () => loader.remove() }, 0.7);
    t = 0.75;
  } else if (loader) loader.remove();

  if ($('.hero')) {
    // 写真がアーチの中に現れ、左右から2本の線が近づいて、まん中で結ばれる
    tl.fromTo('.hero_photo', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 0 0)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' }, t)
      .fromTo('.hero_photo img', { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, t)
      .fromTo('[data-open]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, t + 0.25)
      .to('.th', { strokeDashoffset: 0, duration: 1.2, stagger: 0.08 }, t + 0.5)
      .to('.hero_knot', { opacity: 1, duration: 0.3 }, t + 1.55)
      .to('.hero_knot path', { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, t + 1.55);
  } else {
    // 下層ページ：アーチの写真が下から現れ、見出しの下の水引が結ばれる
    tl.fromTo('.sub_photo', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 0 0)', duration: 1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
      .fromTo('[data-open]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.15)
      .to('.knot--sub path', { strokeDashoffset: 0, duration: 1, stagger: 0.15, ease: 'power1.inOut' }, 0.5);
  }

  // ---------- ご縁の糸：スクロールに合わせて下りていく ----------
  if (hasThread) {
    const L = tpath.getTotalLength();
    gsap.set(tpath, { strokeDasharray: L, strokeDashoffset: L });
    gsap.to(tpath, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  }

  // 見出しの水引：見えたら結ばれていく
  $$('.knot--head').forEach((k) => gsap.to($$('path', k), { strokeDashoffset: 0, duration: 1.2, stagger: 0.2, ease: 'power1.inOut', scrollTrigger: { trigger: k, start: 'top 88%', once: true } }));

  // 成婚：最後のステップで水引が結ばれる
  $$('.knot--flow').forEach((k) => gsap.to($$('path', k), { strokeDashoffset: 0, duration: 1.4, stagger: 0.25, ease: 'power1.inOut', scrollTrigger: { trigger: k, start: 'top 80%', once: true } }));
  // ながれの縦線は、読んだところまで伸びる
  $$('.flow_line').forEach((l) => gsap.fromTo(l, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: l.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } }));

  // 文章：やわらかく現れる
  const soft = (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true });
  $$('[data-each]').forEach((g) => ScrollTrigger.create({ trigger: g, start: 'top 88%', once: true, onEnter: () => soft($$(':scope > [data-up], :scope > * > [data-up]', g)) }));
  $$('[data-up]').forEach((el) => { if (!el.closest('[data-each]')) ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => soft(el) }); });

  // 招待状のカード：封筒のふたが開く
  $$('.pCard').forEach((c, i) => ScrollTrigger.create({ trigger: c, start: 'top 82%', once: true, onEnter: () => gsap.fromTo($('.env', c), { rotateX: 0 }, { rotateX: 180, duration: 0.9, delay: 0.25 + i * 0.12, ease: 'power2.inOut' }) }));

  // 写真：アーチの形で、下から現れる
  $$('[data-reveal]').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 82%', once: true } }));
  $$('[data-parallax]').forEach((el) => gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // 質問を開いたら高さが変わるので、下の出現位置を測り直す
  $$('details').forEach((d) => d.addEventListener('toggle', () => ScrollTrigger.refresh()));

  const redraw = () => { if (drawThread()) { const L = tpath.getTotalLength(); gsap.set(tpath, { strokeDasharray: L }); } ScrollTrigger.refresh(); };
  addEventListener('load', redraw);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redraw, 200); });
})();
