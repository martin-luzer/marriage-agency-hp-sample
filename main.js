// ことほぎ 専用の動き。金の輪 → 2本の線が近づいて結ばれる → ご縁の糸がページを縫い、最後に水引が結ばれる
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const loader = $('.loader');

  // ご縁の糸：ページの高さに合わせて、左右にゆるく揺れる1本の線をつくる
  const thread = $('.thread'), path = thread.querySelector('path'), main = $('main');
  const drawThread = () => {
    const w = main.clientWidth, h = main.scrollHeight;
    thread.setAttribute('viewBox', `0 0 ${w} ${h}`);
    thread.style.height = `${h}px`;
    const step = 520, amp = Math.min(w * 0.36, 420), cx = w / 2;
    let d = `M ${cx} ${innerHeight * 0.9}`;
    for (let y = innerHeight * 0.9, i = 0; y < h - 200; y += step, i++) {
      const side = i % 2 ? -1 : 1;
      d += ` C ${cx + side * amp} ${y + step * 0.25}, ${cx + side * amp} ${y + step * 0.75}, ${cx} ${y + step}`;
    }
    path.setAttribute('d', d);
  };
  drawThread();

  if (!window.gsap || !window.ScrollTrigger || reduced) {
    document.documentElement.classList.remove('js'); loader && loader.remove(); return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.075 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.6 });
    }));
  }

  const header = $('.header');
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 90px', onEnter: () => header.classList.add('is-solid'), onLeaveBack: () => header.classList.remove('is-solid') });
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 70%', endTrigger: '.contact', end: 'top bottom', onToggle: (s) => $('.spBar').classList.toggle('is-on', s.isActive) });

  // 線を描く準備（pathLength=1 なので 0→1 で描ける）
  const ready = (els) => gsap.set(els, { strokeDasharray: 1, strokeDashoffset: 1 });
  ready(['.loader_ring circle', '.th', '.hero_knot path', '.knot path', path]);

  // ---------- 開くとき ----------
  const open = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  open.to('.loader_ring circle', { strokeDashoffset: 0, duration: 1.1 })
    .fromTo('.loader_star', { scale: 0, rotate: -90, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(3)' }, 0.85)
    .fromTo('.loader_word', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.9)
    .to('.loader', { opacity: 0, duration: 0.7, onComplete: () => loader.remove() }, 1.9)
    // 写真がアーチの中にゆっくり現れる
    .fromTo('.hero_photo', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 0 0)', duration: 1.6, ease: 'power3.inOut' }, 2.0)
    .fromTo('.hero_photo img', { scale: 1.15 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 2.0)
    // 左右から2本の線が近づいて、まん中で結ばれる
    .to('.th', { strokeDashoffset: 0, duration: 1.6, stagger: 0.1 }, 2.5)
    .to('.hero_knot path', { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, 3.8)
    .fromTo('.hero_knot', { scale: 0.7, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, 3.8)
    .fromTo('[data-open]', { opacity: 0, y: 22, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.16 }, 2.9)
    .to('.header', { opacity: 1, duration: 0.8 }, 3.2);

  // ---------- ご縁の糸：スクロールに合わせてページを縫う ----------
  gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });

  // 見出しの水引：見えたら結ばれていく
  $$('.knot--head').forEach((k) => gsap.to(k.querySelectorAll('path'), { strokeDashoffset: 0, duration: 1.4, stagger: 0.2, ease: 'power1.inOut', scrollTrigger: { trigger: k, start: 'top 85%', once: true } }));

  // 成婚：最後のステップで水引がしっかり結ばれ、ふわっと光る
  const fk = $('.knot--flow');
  gsap.timeline({ scrollTrigger: { trigger: fk, start: 'top 75%', once: true } })
    .to(fk.querySelectorAll('path'), { strokeDashoffset: 0, duration: 1.6, stagger: 0.25, ease: 'power1.inOut' })
    .fromTo(fk, { filter: 'drop-shadow(0 0 0 rgba(194,165,111,0))' }, { filter: 'drop-shadow(0 0 10px rgba(194,165,111,.8))', duration: 0.6, yoyo: true, repeat: 1 }, '-=0.3');

  // 文章：やわらかく、ぼかしから現れる
  const soft = (els) => gsap.fromTo(els, { opacity: 0, y: 18, filter: 'blur(3px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.12, overwrite: true });
  $$('[data-each]').forEach((g) => ScrollTrigger.create({ trigger: g, start: 'top 85%', once: true, onEnter: () => soft(g.querySelectorAll(':scope > [data-up]')) }));
  $$('[data-up]').forEach((el) => { if (!el.parentElement.hasAttribute('data-each')) ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => soft(el) }); });

  // 招待状のカード：封筒のふたが開く
  $$('.pCard').forEach((c, i) => ScrollTrigger.create({ trigger: c, start: 'top 80%', once: true, onEnter: () => gsap.fromTo(c.querySelector('.env'), { rotateX: 0 }, { rotateX: 180, duration: 1, delay: 0.3 + i * 0.15, ease: 'power2.inOut' }) }));

  // 写真：アーチの形で、下から現れる
  $$('[data-reveal]').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power3.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 80%', once: true } }));
  $$('[data-parallax]').forEach((el) => gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  addEventListener('load', () => { drawThread(); ScrollTrigger.refresh(); });
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { drawThread(); ScrollTrigger.refresh(); }, 200); });
})();
