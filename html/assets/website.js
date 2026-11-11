/* =========================================================
   The Sun Hospital — public site
   Lenis smooth scroll + GSAP ScrollTrigger motion system.

   Design rule for every section timeline: all children share ONE
   start time and ONE duration, differing only by a small stagger.
   A section therefore resolves as a single coordinated move rather
   than a queue of independent fades.
   ========================================================= */
(() => {
    'use strict';

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    gsap.registerPlugin(ScrollTrigger);

    /* =====================================================
       1. SMOOTH SCROLL — one clock for Lenis and ScrollTrigger
       ===================================================== */
    let lenis = null;

    if (!REDUCED) {
        lenis = new Lenis({
            lerp: 0.09,
            wheelMultiplier: 0.9,
            smoothWheel: true
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    const scrollToEl = (target) => {
        if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.1 });
        else target.scrollIntoView({ behavior: 'smooth' });
    };

    /* =====================================================
       2. SHARED MOTION HELPERS
       ===================================================== */
    const DUR = 0.9;
    const EASE = 'power3.out';

    /* One ScrollTrigger config, so every section fires at the same
       viewport position — this is what makes the page read as synced. */
    const trigger = (el, extra = {}) => ({
        trigger: el,
        start: 'top 78%',
        once: true,
        ...extra
    });

    /* Requested "stretch" reveal: image enters vertically stretched and
       horizontally squeezed behind a clipped window, then settles. */
    const imgStretch = (scope, tl, position = 0) => {
        const imgs = $$('.img-stretch > img', scope);
        if (!imgs.length) return;
        tl.fromTo(imgs,
            { scaleY: 1.18, scaleX: 0.94, clipPath: 'inset(12% 0% 12% 0%)', opacity: 0 },
            {
                scaleY: 1, scaleX: 1, clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
                duration: DUR + 0.25, ease: EASE, stagger: 0.06
            },
            position);
    };

    /* Every section gets a timeline built from this so starts align. */
    const sectionTL = (el, extra) => gsap.timeline({ scrollTrigger: trigger(el, extra) });

    const fadeUp = (targets, tl, position = 0, y = 44) => {
        if (!targets || !targets.length) return;
        tl.fromTo(targets,
            { y, opacity: 0 },
            { y: 0, opacity: 1, duration: DUR, ease: EASE, stagger: 0.06 },
            position);
    };

    /* =====================================================
       3. FLOATING MEDICAL ELEMENTS
       Injected per-section so markup stays clean; each depth
       tier drifts at its own rate for the parallax feel.
       ===================================================== */
    const FLOAT_ICONS = {
        stethoscope: '<path d="M18 4v14a14 14 0 0 0 28 0V4M32 46v8a14 14 0 0 0 28 0v-6" /><circle cx="60" cy="34" r="8" />',
        heartbeat: '<path d="M2 32h14l6-16 10 32 8-22 6 10h16" />',
        cross: '<path d="M24 4h16v20h20v16H40v20H24V40H4V24h20z" />',
        capsule: '<rect x="6" y="22" width="52" height="20" rx="10" /><path d="M32 22v20" />',
        syringe: '<path d="M40 8l16 16M50 14 26 38l-8 12-4-4 12-8 24-24M18 44l-8 8" />',
        dna: '<path d="M18 4c0 16 28 16 28 32S18 52 18 60M46 4c0 16-28 16-28 32s28 12 28 20M20 18h24M20 46h24" />',
        pulse: '<circle cx="32" cy="32" r="26" /><path d="M16 32h8l5-10 7 20 5-10h7" />',
        flask: '<path d="M26 4v18L10 52a6 6 0 0 0 5 8h34a6 6 0 0 0 5-8L38 22V4M22 4h20" />'
    };

    const FLOAT_TINTS = ['', 'floater--crimson', 'floater--magenta', 'floater--navy'];

    /* deterministic scatter — no Math.random so layout is stable on reload */
    const FLOAT_SPOTS = [
        { top: '12%', left: '4%', depth: 2, icon: 'stethoscope' },
        { top: '68%', left: '8%', depth: 1, icon: 'capsule' },
        { top: '22%', left: '88%', depth: 3, icon: 'heartbeat' },
        { top: '78%', left: '80%', depth: 2, icon: 'cross' },
        { top: '46%', left: '94%', depth: 1, icon: 'dna' },
        { top: '8%', left: '58%', depth: 1, icon: 'syringe' },
        { top: '86%', left: '42%', depth: 2, icon: 'flask' },
        { top: '38%', left: '2%', depth: 3, icon: 'pulse' }
    ];

    const buildFloaters = () => {
        $$('[data-floaters]').forEach((section, sIdx) => {
            const count = parseInt(section.dataset.floaters, 10) || 4;
            const onDark = section.hasAttribute('data-floaters-dark');
            const layer = document.createElement('div');
            layer.className = 'floaters';

            for (let i = 0; i < count; i++) {
                const spot = FLOAT_SPOTS[(sIdx * 3 + i) % FLOAT_SPOTS.length];
                const el = document.createElement('span');
                el.className = `floater ${onDark ? 'floater--onDark' : FLOAT_TINTS[(sIdx + i) % FLOAT_TINTS.length]}`;
                el.dataset.depth = spot.depth;
                el.style.top = spot.top;
                el.style.left = spot.left;
                el.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor"
                    stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${FLOAT_ICONS[spot.icon]}</svg>`;
                layer.appendChild(el);
            }
            section.prepend(layer);

            if (REDUCED) return;

            /* depth tiers move at different rates → parallax */
            $$('.floater', layer).forEach((f) => {
                const depth = parseInt(f.dataset.depth, 10);
                gsap.to(f, {
                    yPercent: -18 * depth * 2.4,
                    rotate: depth % 2 ? 22 : -18,
                    ease: 'none',
                    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
                });
            });
        });
    };

    /* =====================================================
       4. HEADER — brand rail wipe + nav hide/reveal
       ===================================================== */
    const navShell = $('#navShell');
    const brandRail = $('#brandRail');
    const burger = $('#navBurger');
    const mobileMenu = $('#mobileMenu');

    const initHeader = () => {
        let last = 0;

        const onScroll = (y) => {
            /* compact state once past the hero fold */
            navShell.classList.toggle('is-compact', y > 90);
            /* home-page logo mirrors it: inline white over the hero, white
               pill once scrolled (no-op on pages without the is-home styles) */
            if (brandRail) brandRail.classList.toggle('is-compact', y > 90);
            /* direction: down hides, up reveals */
            const down = y > last && y > 220;
            const locked = document.body.classList.contains('menu-open') ||
                document.body.classList.contains('search-open');
            navShell.classList.toggle('is-hidden', down && !locked);
            last = y;
        };

        if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
        else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

        /* mobile menu */
        const closeMenu = () => {
            document.body.classList.remove('menu-open');
            if (lenis) lenis.start();
            gsap.to(mobileMenu, {
                clipPath: 'circle(0% at calc(100% - 46px) 46px)',
                duration: 0.5, ease: 'power3.in'
            });
        };

        burger.addEventListener('click', () => {
            const open = !document.body.classList.contains('menu-open');
            if (!open) return closeMenu();

            document.body.classList.add('menu-open');
            if (lenis) lenis.stop();
            gsap.timeline()
                .to(mobileMenu, {
                    clipPath: 'circle(150% at calc(100% - 46px) 46px)',
                    duration: 0.6, ease: 'power3.out'
                })
                .fromTo($$('a', mobileMenu),
                    { y: 26, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: EASE, stagger: 0.05 }, 0.15);
        });

        $$('a', mobileMenu).forEach((a) => a.addEventListener('click', closeMenu));
    };

    /* =====================================================
       5. LEFT GLASS DOCK
       Stretch the pill open first; only when that completes do the
       icons pop in.
       ===================================================== */
    const initDock = () => {
        const dock = $('#dock');
        if (!dock) return;
        /* the dock is retired (hidden via CSS) — don't spend a GSAP
           timeline animating something nobody can see */
        if (getComputedStyle(dock).display === 'none') return;
        const icons = $$('.dock__btn', dock);

        if (REDUCED) {
            gsap.set(dock, { scaleY: 1, opacity: 1 });
            gsap.set(icons, { scale: 1, opacity: 1 });
            return;
        }

        gsap.set(dock, { scaleY: 0, opacity: 0 });
        gsap.set(icons, { scale: 0.4, opacity: 0 });

        gsap.timeline({ delay: 1.05 })
            .to(dock, { opacity: 1, duration: 0.2 })
            /* the stretch */
            .to(dock, { scaleY: 1.06, duration: 0.55, ease: 'power4.out' })
            .to(dock, { scaleY: 1, duration: 0.28, ease: 'power2.inOut' })
            /* … and only now the icons */
            .to(icons, {
                scale: 1, opacity: 1, duration: 0.5,
                ease: 'back.out(2)', stagger: 0.07
            });
    };

    /* =====================================================
       6. RIGHT SCROLL-SPY RAIL
       Built from [data-section] so it can never drift out of sync
       with the markup.
       ===================================================== */
    const initSpy = () => {
        const spy = $('#spy');
        const sections = $$('[data-section]');
        if (!spy || !sections.length) return;

        const dots = sections.map((sec) => {
            const dot = document.createElement('button');
            dot.className = 'spy__dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', sec.dataset.section);
            dot.innerHTML = `<span class="spy__label">${sec.dataset.section}</span>`;
            dot.addEventListener('click', () => scrollToEl(sec));
            spy.appendChild(dot);
            return dot;
        });

        const setActive = (i) => dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
        setActive(0);

        sections.forEach((sec, i) => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top 50%',
                end: 'bottom 50%',
                onToggle: (self) => self.isActive && setActive(i)
            });
        });

        /* visible only while actually scrolling */
        let idle;
        const wake = () => {
            spy.classList.add('is-visible');
            clearTimeout(idle);
            idle = setTimeout(() => spy.classList.remove('is-visible'), 1500);
        };
        if (lenis) lenis.on('scroll', wake);
        else window.addEventListener('scroll', wake, { passive: true });
        spy.addEventListener('mouseenter', () => { clearTimeout(idle); spy.classList.add('is-visible'); });
        spy.addEventListener('mouseleave', wake);
    };

    /* =====================================================
       7. HERO — intro, Ken Burns crossfade, scroll parallax
       ===================================================== */
    const initHero = () => {
        const hero = $('#hero');
        if (!hero) return;

        const card = $('.hero__card', hero);
        const leadKids = $$('.hero__lead > *', hero);
        const pills = $$('.hero__pill', hero);
        const strip = $('.hero__strip', hero);

        if (REDUCED) {
            /* hold the background video on a still frame for reduced-motion users */
            const vid = $('.hero__photo', hero);
            if (vid && typeof vid.pause === 'function') { vid.removeAttribute('autoplay'); vid.pause(); }
            gsap.set([card, strip, ...leadKids, ...pills].filter(Boolean), { clearProps: 'all' });
            return;
        }

        /* Page intro. The brand rail wipes itself open from CSS, so it is not
           on this timeline. navShell only gets opacity — its transform belongs
           to the .is-hidden scroll state, and an inline GSAP transform would
           outrank that rule and break the hide/reveal. */
        const intro = gsap.timeline({ defaults: { ease: EASE } });
        intro
            .fromTo(navShell, { opacity: 0 }, { opacity: 1, duration: 0.7 }, 0.25)
            /* clearProps drops the leftover inline transform: a transformed
               .nav-bar becomes the containing block for position:fixed
               descendants, which would strand the mobile search sheet inside
               the pill instead of spanning the viewport */
            .fromTo([$('.nav-topbar', navShell), $('.nav-bar', navShell)],
                { y: -26, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, clearProps: 'transform' }, 0.25)
            .fromTo($$('.nav-link, .nav-emergency, .nav-burger', navShell),
                { y: -14, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 }, 0.4)
            /* the card settles in from a slight over-scale, then the copy rises
               word-block by word-block, the speciality pills deal in, and the
               footer strip fades up last */
            .fromTo(card,
                { scale: 1.04, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.0 }, 0.3)
            .fromTo(leadKids,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0.5)
            .fromTo(pills,
                { y: 16, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 }, 0.95)
            .fromTo(strip,
                { opacity: 0 },
                { opacity: 1, duration: 0.6 }, 1.0);

        /* gentle parallax: the photo drifts up inside its clipped card while the
           copy column eases up and dims as the hero leaves */
        gsap.to('.hero__photo', {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero__content', {
            yPercent: -4, opacity: 0.6, ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
    };

    /* =====================================================
       7b. SCROLL-REVEAL STATEMENT ("shadow text")
       The copy is split into per-word spans; a scrubbed, staggered
       tween drives each word's --rt-p from 0 (dim grey) to 1 (ink)
       so the sentence "fills in" left-to-right as it scrolls past.
       ===================================================== */
    /* The shared TEXT animation: every [data-reveal-copy] fills word-by-word
       from dim to ink as it scrolls through. Used by the About heading, its
       lead paragraph and the mission statement — one consistent text reveal. */
    const initRevealText = () => {
        $$('[data-reveal-copy]').forEach((copy) => {
            const spans = [];
            /* Wrap each word of the top-level text in its own span, but leave
               inline elements (e.g. an <em> accent) untouched so they keep
               their own styling. Spaces are preserved as plain text nodes. */
            [...copy.childNodes].forEach((child) => {
                if (child.nodeType !== Node.TEXT_NODE) return;
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach((tok) => {
                    if (tok === '') return;
                    if (/^\s+$/.test(tok)) {
                        frag.appendChild(document.createTextNode(tok));
                        return;
                    }
                    const span = document.createElement('span');
                    span.className = 'rt-word';
                    span.textContent = tok;
                    spans.push(span);
                    frag.appendChild(span);
                });
                child.replaceWith(frag);
            });

            if (!spans.length) return;

            if (REDUCED) {
                gsap.set(spans, { '--rt-p': 1 });
                return;
            }

            gsap.to(spans, {
                '--rt-p': 1,
                ease: 'none',
                stagger: 0.5,
                scrollTrigger: {
                    trigger: copy,
                    start: 'top 82%',
                    end: 'bottom 55%',
                    scrub: 0.6
                }
            });
        });
    };

    /* =====================================================
       8. PER-SECTION TIMELINES
       Each section uses a different technique, but all share the
       same trigger point and duration so the page feels of a piece.
       ===================================================== */
    const initSections = () => {
        if (REDUCED) {
            gsap.set('[data-anim]', { clearProps: 'all' });
            return;
        }

        /* --- Services: two cards per row. The left card stamps in from the
               left, the right card from the right; each row fires on scroll. --- */
        const svc = $('#services');
        if (svc) {
            fadeUp($$('.svc__head > *', svc), sectionTL(svc, { start: 'top 82%' }), 0);

            $$('.svc__row', svc).forEach((row) => {
                const left = $('.svc__card--left', row);
                const right = $('.svc__card--right', row);
                const tl = gsap.timeline({ scrollTrigger: trigger(row, { start: 'top 84%' }) });
                /* the "stamp": slide in from the side, overshoot-settle to scale 1 */
                if (left) tl.fromTo(left,
                    { x: -110, opacity: 0, scale: 0.84, rotate: -2.5 },
                    { x: 0, opacity: 1, scale: 1, rotate: 0, duration: DUR, ease: 'back.out(1.5)' }, 0);
                if (right) tl.fromTo(right,
                    { x: 110, opacity: 0, scale: 0.84, rotate: 2.5 },
                    { x: 0, opacity: 1, scale: 1, rotate: 0, duration: DUR, ease: 'back.out(1.5)' }, 0);
            });
        }

        /* --- About: split-scroll, the two columns drift at different rates --- */
        const about = $('#about');
        if (about) {
            const tl = sectionTL(about);
            /* title + description use the word-by-word reveal (initRevealText);
               the rest of the column fades up as before */
            fadeUp($$('.about__content > .eyebrow, .about__content > .about__features, .about__content > .about__cta-row', about), tl, 0);
            imgStretch(about, tl, 0.05);
            tl.fromTo($$('.about__play', about),
                { scale: 0.6, opacity: 0 },
                { scale: 1, opacity: 1, duration: DUR, ease: 'back.out(1.8)' }, 0.3);

            gsap.to('.about__content', {
                yPercent: -7, ease: 'none',
                scrollTrigger: { trigger: about, start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
            gsap.to('.about__visuals', {
                yPercent: 7, ease: 'none',
                scrollTrigger: { trigger: about, start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
        }

        /* --- Specialities: index rows clip-reveal from the left edge, the
               feature stage scales up, conditions pop in as a chip cloud --- */
        const spec = $('#specialities');
        if (spec) {
            const tl = sectionTL(spec);
            fadeUp($$('.spec__header > *', spec), tl, 0);
            tl.fromTo($$('.spec__list li', spec),
                { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
                { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: DUR * 0.8, ease: EASE, stagger: 0.04 }, 0.1)
                .fromTo($('.spec__card', spec),
                    { opacity: 0, scale: 0.94, y: 30 },
                    { opacity: 1, scale: 1, y: 0, duration: DUR, ease: EASE }, 0.15)
                .fromTo($$('.spec__conditions li', spec),
                    { opacity: 0, y: 14, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: DUR * 0.7, ease: 'back.out(1.5)', stagger: 0.02 }, 0.3);
        }

        /* --- Services reveal: wide cards pop in as a filmstrip, then the
               strip drifts sideways on scroll while the video counter-pans --- */
        const reveal = $('#care');
        if (reveal) {
            const tl = sectionTL(reveal, { start: 'top 62%' });
            fadeUp($$('.reveal__content .section-head > *', reveal), tl, 0);
            tl.fromTo($$('.reveal__card', reveal),
                { y: 60, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: DUR, ease: 'back.out(1.3)', stagger: 0.06, clearProps: 'transform' }, 0.08)
                .fromTo($$('.reveal__foot > *', reveal),
                    { y: 24, opacity: 0 },
                    { y: 0, opacity: 1, duration: DUR * 0.8, ease: EASE, stagger: 0.08 }, 0.3);

            /* horizontal scrub — drive the strip's own scrollLeft from section
               progress so nothing can overflow the page */
            const strip = $('.reveal__strip', reveal);
            if (strip) {
                ScrollTrigger.create({
                    trigger: reveal, start: 'top bottom', end: 'bottom top', scrub: true,
                    onUpdate: (self) => {
                        const max = strip.scrollWidth - strip.clientWidth;
                        if (max > 4) strip.scrollLeft = max * gsap.utils.clamp(0, 1, (self.progress - 0.14) / 0.72);
                    }
                });
            }

            gsap.fromTo('.reveal__vid',
                { scale: 1.2, yPercent: -4 },
                {
                    scale: 1, yPercent: 4, ease: 'none',
                    scrollTrigger: { trigger: reveal, start: 'top bottom', end: 'bottom top', scrub: true }
                });
        }

        /* --- Track record: badge pills pop, the spotlight quote scales in,
               the image strip clip-reveals, and the rating counts up --- */
        const track = $('#testimonials');
        if (track) {
            const tl = sectionTL(track);
            fadeUp($$('.track__header > *', track), tl, 0);
            tl.fromTo($$('.track__badges .track__item', track),
                { y: 30, opacity: 0, scale: 0.92 },
                { y: 0, opacity: 1, scale: 1, duration: DUR, ease: 'back.out(1.4)', stagger: 0.1 }, 0.05)
                .fromTo($('.track__quote', track),
                    { y: 44, opacity: 0, scale: 0.96 },
                    { y: 0, opacity: 1, scale: 1, duration: DUR + 0.1, ease: EASE }, 0.15)
                .fromTo($$('.track__moments .track__item', track),
                    { clipPath: 'inset(0 0 100% 0)', y: 24 },
                    { clipPath: 'inset(0 0 0% 0)', y: 0, duration: DUR, ease: EASE, stagger: 0.1 }, 0.3);

            /* rating counts up to 4.9 once, when the section is in view */
            const ratingEl = $('#tRatingNum', track);
            if (ratingEl) {
                const obj = { v: 0 };
                ScrollTrigger.create({
                    trigger: track, start: 'top 70%', once: true,
                    onEnter: () => gsap.to(obj, {
                        v: 4.9, duration: 1.4, ease: 'power2.out',
                        onUpdate: () => { ratingEl.textContent = obj.v.toFixed(1); }
                    })
                });
            }

            gsap.to('.track__spring', {
                rotate: 180, yPercent: -40, ease: 'none',
                scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
        }

        /* --- Why choose: numbered rows slide in from alternating sides, the
               index number pops, and an accent rule wipes across each row --- */
        const why = $('#why');
        if (why) {
            fadeUp($$('.why__header > *', why), sectionTL(why), 0);
            $$('.why__row', why).forEach((row, idx) => {
                const fromX = idx % 2 === 0 ? -64 : 64;
                gsap.timeline({ scrollTrigger: trigger(row, { start: 'top 82%' }) })
                    .fromTo(row, { x: fromX, opacity: 0 }, { x: 0, opacity: 1, duration: DUR, ease: EASE }, 0)
                    .fromTo($('.why__num', row),
                        { scale: 0.4, opacity: 0 },
                        { scale: 1, opacity: 1, duration: DUR, ease: 'back.out(1.9)' }, 0.1)
                    .fromTo($('.why__star', row),
                        { scale: 0.5, rotate: -40, opacity: 0 },
                        { scale: 1, rotate: 0, opacity: 1, duration: DUR, ease: 'back.out(1.4)' }, 0.12)
                    .fromTo(row, { '--rule': 0 }, { '--rule': 1, duration: DUR + 0.2, ease: EASE }, 0.25);
            });
        }

        /* --- Lab: heading masks open, banner stretches, award pill drops in,
               then the test cards ride in on a horizontal conveyor --- */
        const lab = $('#lab');
        if (lab) {
            const tl = sectionTL(lab);
            fadeUp($$('.lab__intro > .eyebrow', lab), tl, 0);
            tl.fromTo($('.lab__intro h2', lab),
                { clipPath: 'inset(0 0 100% 0)', y: 22 },
                { clipPath: 'inset(0 0 0% 0)', y: 0, duration: DUR, ease: EASE }, 0.05);
            imgStretch(lab, tl, 0.05);
            tl.fromTo($('.lab__pill', lab),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: DUR, ease: 'back.out(1.4)' }, 0.3)
                .fromTo($$('.lab__card', lab),
                    { x: 80, opacity: 0, scale: 0.9 },
                    { x: 0, opacity: 1, scale: 1, duration: DUR, ease: EASE, stagger: 0.09, clearProps: 'transform' }, 0.12);
        }

        /* --- Doctors: portrait cards fan in from a stacked, tilted centre --- */
        const doc = $('#doctors');
        if (doc) {
            const tl = sectionTL(doc);
            fadeUp($$('.doc__header > *, .doc__tab', doc), tl, 0);
            tl.fromTo($$('.doc__card', doc),
                { y: 54, opacity: 0, rotate: -5, scale: 0.9, transformOrigin: 'bottom center' },
                { y: 0, opacity: 1, rotate: 0, scale: 1, duration: DUR, ease: 'back.out(1.3)', stagger: 0.08, clearProps: 'transform' }, 0.06);
        }

        /* --- FAQ: header fades, the aside image stretches in, then the
               accordion tiles stagger up (open/close tint is CSS-driven) --- */
        const faq = $('#faq');
        if (faq) {
            const tl = sectionTL(faq);
            fadeUp($$('.faq__head > *', faq), tl, 0);
            imgStretch(faq, tl, 0.05);
            tl.fromTo($$('.faq__item', faq),
                { y: 28, opacity: 0 },
                { y: 0, opacity: 1, duration: DUR * 0.8, ease: EASE, stagger: 0.07 }, 0.12);
        }

        /* --- Blog: feature image clip-expands, its body fades up, the row
               cards slide in from the right, and the category pills pop --- */
        const blog = $('#blog');
        if (blog) {
            const tl = sectionTL(blog);
            fadeUp($$('.blog__header > *', blog), tl, 0);
            imgStretch(blog, tl, 0.05);
            fadeUp($$('.blog__card--feature .blog__body > *', blog), tl, 0.12);
            tl.fromTo($$('.blog__cat', blog),
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06 }, 0.3);
            fadeUp($$('.blog__footer', blog), tl, 0.4);

            /* the right-hand article list stays hidden until the whole column
               is on screen, then every row reveals together in a quick stagger */
            const list = $('.blog__list', blog);
            const rows = $$('.blog__row', blog);
            if (list && rows.length) {
                gsap.set(rows, { opacity: 0, y: 26 });
                ScrollTrigger.create({
                    trigger: list, start: 'bottom 90%', once: true,
                    onEnter: () => gsap.to(rows, {
                        opacity: 1, y: 0, duration: DUR * 0.8, ease: EASE,
                        stagger: 0.08, clearProps: 'transform'
                    })
                });
            }
        }

        /* --- Pre-footer: the marquee ribbon fades in as a whole (the
               sideways motion is the continuous CSS marquee itself) --- */
        const prefooter = $('#prefooter');
        if (prefooter) {
            sectionTL(prefooter, { start: 'top 90%' }).fromTo(prefooter,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: DUR, ease: EASE }, 0);
        }

        /* --- Footer: columns rise, ECG line draws across the top --- */
        const footer = $('#contact');
        if (footer) {
            const tl = sectionTL(footer, { start: 'top 85%' });
            const ecg = $('#footerEcg path');
            if (ecg) {
                const len = ecg.getTotalLength();
                gsap.set(ecg, { strokeDasharray: len, strokeDashoffset: len });
                tl.to(ecg, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
            }
            fadeUp($$('.ft__col', footer), tl, 0.1);
            tl.fromTo($$('.ft__social a', footer),
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06, clearProps: 'transform' }, 0.4);
        }
    };

    /* =====================================================
       9. SPECIALITIES TAB CONTENT
       ===================================================== */
    /* assigned in initSpecialities; used by the site search */
    let selectSpecialty = null;

    const SPECIALTIES = {
        cardiac: {
            title: 'Cardiac Sciences',
            img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=800&auto=format&fit=crop',
            desc: 'Our Cardiac Sciences department is at the forefront of cardiac care, offering advanced diagnostics, minimally invasive interventions and a 24/7 catheterisation lab staffed by senior interventional cardiologists.',
            procedures: ['Angioplasty', 'Bypass Surgery', 'Valve Replacement', 'Pacemaker Implant'],
            conditions: ['Cardiomyopathy', 'Cardiac Arrest', 'Cardioversion', 'Cardiac Arrhythmia', 'Hypertrophic Cardiomyopathy', 'Cardiac dysrhythmias', 'Sudden Cardiac Arrest', 'Robotic Cardiac Surgery', 'Angioplasty']
        },
        oncology: {
            title: 'Oncology',
            img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop',
            desc: 'A multidisciplinary tumour board reviews every case, combining medical, surgical and radiation oncology to build a treatment plan around the patient rather than the protocol.',
            procedures: ['Chemotherapy', 'Immunotherapy', 'Tumour Resection', 'Radiation Therapy'],
            conditions: ['Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Leukaemia', 'Lymphoma', 'Prostate Cancer', 'Bone Marrow Transplant', 'Palliative Care']
        },
        neurology: {
            title: 'Neurology',
            img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop',
            desc: 'From stroke thrombolysis within the golden hour to long-term epilepsy management, our neurosciences unit pairs advanced imaging with round-the-clock neurointensive care.',
            procedures: ['Craniotomy', 'Deep Brain Stimulation', 'Spine Surgery', 'Thrombolysis'],
            conditions: ['Stroke', 'Epilepsy', 'Parkinson\'s Disease', 'Multiple Sclerosis', 'Migraine', 'Brain Tumour', 'Neuropathy', 'Alzheimer\'s Disease']
        },
        nephrology: {
            title: 'Nephrology',
            img: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=800&auto=format&fit=crop',
            desc: 'Comprehensive renal care spanning dialysis, transplant workup and post-transplant follow-up, supported by an in-house dialysis unit running three shifts a day.',
            procedures: ['Haemodialysis', 'Peritoneal Dialysis', 'Kidney Transplant', 'Renal Biopsy'],
            conditions: ['Chronic Kidney Disease', 'Acute Kidney Injury', 'Kidney Stones', 'Glomerulonephritis', 'Polycystic Kidney Disease', 'Nephrotic Syndrome', 'Hypertension']
        },
        gastro: {
            title: 'Gastroenterology & Hepatology',
            img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop',
            desc: 'Endoscopic and hepatobiliary services covering the full digestive tract, with therapeutic ERCP and a dedicated liver clinic for chronic hepatitis and cirrhosis.',
            procedures: ['Endoscopy', 'Colonoscopy', 'ERCP', 'Liver Biopsy'],
            conditions: ['Fatty Liver Disease', 'Hepatitis B & C', 'Cirrhosis', 'IBS', 'Crohn\'s Disease', 'Ulcerative Colitis', 'GERD', 'Pancreatitis']
        },
        gynaecology: {
            title: 'Gynaecology',
            img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800&auto=format&fit=crop',
            desc: 'Women\'s health across every life stage — from routine screening and fertility support to high-risk obstetrics with a level-III neonatal intensive care unit on the same floor.',
            procedures: ['Abdominal Hysterectomy', 'Laparoscopy', 'C-Section', 'Fertility Treatment'],
            conditions: ['PCOS', 'Endometriosis', 'Uterine Fibroids', 'High-Risk Pregnancy', 'Infertility', 'Menopause Care', 'Cervical Screening']
        },
        pulmonology: {
            title: 'Pulmonology',
            img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
            desc: 'Respiratory care from allergy testing and pulmonary function labs through to bronchoscopic intervention, with a sleep study unit for suspected apnoea.',
            procedures: ['Bronchoscopy', 'Pleural Tap', 'Pulmonary Function Test', 'Sleep Study'],
            conditions: ['Asthma', 'COPD', 'Pneumonia', 'Tuberculosis', 'Interstitial Lung Disease', 'Sleep Apnoea', 'Pleural Effusion', 'Bronchiectasis', 'Pulmonary Hypertension']
        },
        orthopaedics: {
            title: 'Orthopaedics',
            img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
            desc: 'Joint replacement, arthroscopy and trauma surgery backed by an on-site physiotherapy gym, so rehabilitation starts on the same day as the procedure.',
            procedures: ['Knee Replacement', 'Hip Replacement', 'Arthroscopy', 'Fracture Fixation'],
            conditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Slipped Disc', 'Frozen Shoulder', 'ACL Tear', 'Sports Injury', 'Osteoporosis', 'Spinal Stenosis']
        },
        urology: {
            title: 'Urology',
            img: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=800&auto=format&fit=crop',
            desc: 'Endourology and reconstructive services covering stone disease, prostate care and uro-oncology, with laser lithotripsy available round the clock.',
            procedures: ['Laser Lithotripsy', 'TURP', 'Ureteroscopy', 'Prostate Biopsy'],
            conditions: ['Kidney Stones', 'Enlarged Prostate', 'Urinary Tract Infection', 'Bladder Cancer', 'Incontinence', 'Male Infertility', 'Hydronephrosis']
        },
        paediatrics: {
            title: 'Paediatrics & Neonatology',
            img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
            desc: 'A level-III neonatal intensive care unit alongside general paediatrics, immunisation and growth clinics run by consultants who see children only.',
            procedures: ['Neonatal Ventilation', 'Phototherapy', 'Immunisation', 'Growth Assessment'],
            conditions: ['Preterm Birth', 'Neonatal Jaundice', 'Childhood Asthma', 'Congenital Heart Defects', 'Nutritional Deficiency', 'Developmental Delay', 'Recurrent Infections']
        },
        ent: {
            title: 'ENT & Head-Neck Surgery',
            img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800&auto=format&fit=crop',
            desc: 'Micro-ear surgery, endoscopic sinus procedures and head-neck oncology, supported by an audiology suite for hearing assessment and implant workup.',
            procedures: ['Tonsillectomy', 'Septoplasty', 'Tympanoplasty', 'Endoscopic Sinus Surgery'],
            conditions: ['Chronic Sinusitis', 'Deviated Septum', 'Hearing Loss', 'Tonsillitis', 'Vertigo', 'Nasal Polyps', 'Thyroid Swelling', 'Snoring']
        },
        dermatology: {
            title: 'Dermatology',
            img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop',
            desc: 'Medical and procedural dermatology under one roof — chronic skin disease management, dermatosurgery and laser therapy with biopsy reporting in-house.',
            procedures: ['Skin Biopsy', 'Laser Therapy', 'Cryotherapy', 'Chemical Peel'],
            conditions: ['Psoriasis', 'Eczema', 'Acne', 'Vitiligo', 'Fungal Infection', 'Hair Loss', 'Urticaria', 'Skin Allergy']
        }
    };

    const initSpecialities = () => {
        const list = $('#specialtyList');
        if (!list) return;

        const els = {
            img: $('#featImage'),
            title: $('#featTitle'),
            desc: $('#featDesc'),
            procs: $('#featProcedures'),
            btn: $('#featBtn'),
            conds: $('#conditionsList')
        };

        const render = (key) => {
            const data = SPECIALTIES[key];
            if (!data) return;

            const swap = () => {
                els.img.src = data.img;
                els.img.alt = data.title;
                els.title.textContent = data.title;
                els.desc.textContent = data.desc;
                els.procs.innerHTML = data.procedures
                    .map((p) => `<span class="spec__proc-tag">${p}</span>`).join('');
                els.btn.innerHTML =
                    `Meet Our ${data.title} Experts <i class="fa-solid fa-arrow-right"></i>`;
                els.conds.innerHTML = data.conditions.map((c) => `<li>${c}</li>`).join('');
            };

            if (REDUCED) return swap();

            gsap.timeline()
                .to('.spec__card, .spec__conditions', { opacity: 0, y: 14, duration: 0.22, ease: 'power2.in' })
                .add(swap)
                .fromTo('.spec__card, .spec__conditions',
                    { opacity: 0, y: -14 },
                    { opacity: 1, y: 0, duration: 0.4, ease: EASE })
                .fromTo('.spec__conditions li',
                    { x: 18, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.35, ease: EASE, stagger: 0.025 }, '<');
        };

        const items = $$('li', list);

        /* single highlight bar that glides to sit behind the active row */
        const hl = $('.spec__hl', list);
        const moveHl = (li, animate = true) => {
            if (!hl || !li) return;
            const top = li.offsetTop, height = li.offsetHeight;
            if (REDUCED || !animate) gsap.set(hl, { top, height, opacity: 1 });
            else gsap.to(hl, { top, height, opacity: 1, duration: 0.42, ease: EASE, overwrite: true });
        };

        /* the menu scrolls once the specialities outgrow the card — keep the
           row that was just picked (or reached by keyboard) visible */
        const reveal = (li) => {
            const box = list.parentElement;
            if (!box || box.scrollHeight <= box.clientHeight) return;
            const r = li.getBoundingClientRect(), b = box.getBoundingClientRect();
            const behavior = REDUCED ? 'auto' : 'smooth';
            if (r.top < b.top) box.scrollBy({ top: r.top - b.top - 6, behavior });
            else if (r.bottom > b.bottom) box.scrollBy({ top: r.bottom - b.bottom + 6, behavior });
        };

        const select = (li, { scroll = true } = {}) => {
            items.forEach((n) => {
                const on = n === li;
                n.classList.toggle('is-active', on);
                n.setAttribute('aria-selected', String(on));
                n.tabIndex = on ? 0 : -1;
            });
            if (scroll) reveal(li);
            moveHl(li);
            render(li.dataset.target);
        };

        items.forEach((li, i) => {
            li.addEventListener('click', () => select(li));

            li.addEventListener('keydown', (e) => {
                const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
                if (step) {
                    e.preventDefault();
                    const next = items[(i + step + items.length) % items.length];
                    next.focus();
                    select(next);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    select(li);
                }
            });
        });

        /* the search panel needs to be able to open a specific tab */
        selectSpecialty = (key) => {
            const li = $(`li[data-target="${key}"]`, list);
            if (li && !li.classList.contains('is-active')) select(li);
        };

        render('cardiac');

        /* seat the highlight behind the initially-active row, and keep it
           aligned when the layout reflows (resize / font load) */
        const seatHl = () => moveHl(items.find((n) => n.classList.contains('is-active')) || items[0], false);
        requestAnimationFrame(seatHl);
        window.addEventListener('load', seatHl);
        let hlRz;
        window.addEventListener('resize', () => {
            clearTimeout(hlRz);
            hlRz = setTimeout(seatHl, 120);
        }, { passive: true });
    };

    /* =====================================================
       10. FAQ ACCORDION
       ===================================================== */
    const initFaq = () => {
        $$('.faq__q').forEach((q) => {
            q.addEventListener('click', () => {
                const open = q.classList.contains('is-open');
                /* strict accordion — one panel at a time */
                $$('.faq__q').forEach((other) => {
                    other.classList.remove('is-open');
                    other.setAttribute('aria-expanded', 'false');
                    other.nextElementSibling.style.maxHeight = null;
                });
                if (!open) {
                    q.classList.add('is-open');
                    q.setAttribute('aria-expanded', 'true');
                    q.nextElementSibling.style.maxHeight = `${q.nextElementSibling.scrollHeight}px`;
                }
                ScrollTrigger.refresh();
            });
        });
    };

    /* =====================================================
       11. DOCTORS — filter tabs + carousel
       ===================================================== */
    const initDoctors = () => {
        const track = $('#docTrack');
        if (!track) return;

        const cards = $$('.doc__card', track);
        let index = 0;

        const perView = () => (window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 4);

        const visible = () => cards.filter((c) => c.style.display !== 'none');

        const move = () => {
            const shown = visible();
            const max = Math.max(0, shown.length - perView());
            index = gsap.utils.clamp(0, max, index);
            const card = shown[0];
            if (!card) return;
            const step = card.offsetWidth + parseFloat(getComputedStyle(track).gap || 0);
            gsap.to(track, { x: -index * step, duration: 0.7, ease: EASE });
        };

        $('#docPrev').addEventListener('click', () => { index--; move(); });
        $('#docNext').addEventListener('click', () => { index++; move(); });

        $$('.doc__tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                $$('.doc__tab').forEach((t) => t.classList.toggle('is-active', t === tab));
                const filter = tab.dataset.filter;
                cards.forEach((c) => {
                    const match = filter === 'all' || c.dataset.specialty === filter;
                    c.style.display = match ? '' : 'none';
                });
                index = 0;
                gsap.set(track, { x: 0 });
                gsap.fromTo(visible(),
                    { y: 28, opacity: 0, scale: 0.92 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.3)', stagger: 0.06, clearProps: 'transform' });
            });
        });

        window.addEventListener('resize', move);
    };

    /* =====================================================
       12. LAB SLIDER — auto-advance with progress bar
       ===================================================== */
    const initLabSlider = () => {
        const track = $('#labSlider');
        const bar = $('#labProgressBar');
        if (!track || !bar) return;

        const cards = $$('.lab__card', track);
        let index = 0;

        const perView = () => (window.innerWidth <= 640 ? 1 : 2);

        const move = () => {
            const max = Math.max(0, cards.length - perView());
            if (index > max) index = 0;
            const step = cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 0);
            track.style.transform = `translateX(${-index * step}px)`;
            bar.style.width = `${((index + perView()) / cards.length) * 100}%`;
        };

        move();
        setInterval(() => { index++; move(); }, 3800);
        window.addEventListener('resize', move);
    };

    /* =====================================================
       13. SITE SEARCH
       One index built from every [data-section] block, plus the
       speciality data that only lives in JS. Opening the field
       collapses the rest of the nav pill.
       ===================================================== */
    const initSearch = () => {
        const bar = $('.nav-bar');
        const box = $('#navSearch');
        const input = $('#navSearchInput');
        const panel = $('#navSearchResults');
        const openBtn = $('#navSearchBtn');
        const closeBtn = $('#navSearchClose');
        if (!bar || !box || !input || !panel || !openBtn) return;

        /* ---------- placeholder ----------
           The desktop placeholder is a full sentence; in the phone sheet it
           truncates mid-word, so swap in a short one and keep it in step with
           the width (the field survives rotation without a reload). */
        const phFull = input.getAttribute('placeholder') || '';
        const phShort = 'Search doctors, departments, tests…';
        const phMq = window.matchMedia('(max-width: 640px)');
        const syncPlaceholder = () => {
            input.placeholder = phMq.matches ? phShort : phFull;
        };
        syncPlaceholder();
        phMq.addEventListener('change', syncPlaceholder);

        /* ---------- index ---------- */
        const PICK = 'h1, h2, h3, h4, p, li, .spec__proc-tag, .blog__cat, .lab__price';
        /* the speciality card is rendered one tab at a time — indexed from data instead */
        const SKIP = '.floaters, .spec__stage, .spec__conditions';

        const index = [];
        const seen = new Set();

        const add = (label, text, el, spec) => {
            const clean = (text || '').replace(/\s+/g, ' ').trim();
            if (clean.length < 3 || !el) return;
            const key = `${label}|${clean.toLowerCase()}`;
            if (seen.has(key)) return;
            seen.add(key);
            index.push({ label, text: clean, lower: clean.toLowerCase(), el, spec });
        };

        $$('[data-section]').forEach((sec) => {
            const label = sec.dataset.section;
            $$(PICK, sec).forEach((el) => {
                if (el.closest(SKIP)) return;
                add(label, el.textContent, el);
            });
        });

        const specSection = $('#specialities');
        Object.entries(SPECIALTIES).forEach(([key, d]) => {
            add('Specialities', `${d.title} — ${d.desc}`, specSection, key);
            [...d.procedures, ...d.conditions].forEach((t) =>
                add(`Specialities · ${d.title}`, t, specSection, key));
        });

        /* ---------- query ---------- */
        const esc = (s) => s.replace(/[&<>"]/g,
            (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

        /* highlight the match, trimming long paragraphs so it stays visible */
        const highlight = (text, q) => {
            const i = text.toLowerCase().indexOf(q);
            if (i < 0) return esc(text);
            const from = Math.max(0, i - 40);
            const slice = text.slice(from);
            const j = i - from;
            return (from ? '… ' : '') + esc(slice.slice(0, j)) +
                `<mark>${esc(slice.slice(j, j + q.length))}</mark>` +
                esc(slice.slice(j + q.length));
        };

        const lookup = (q) => index
            .map((e) => {
                const i = e.lower.indexOf(q);
                /* earlier match wins; shorter entries break the tie */
                return i < 0 ? null : { e, score: i + e.text.length / 400 };
            })
            .filter(Boolean)
            .sort((a, b) => a.score - b.score)
            .slice(0, 10)
            .map((r) => r.e);

        let hits = [];
        let cursor = -1;

        const paint = () => {
            const raw = input.value.trim();
            const q = raw.toLowerCase();
            if (q.length < 2) {
                hits = []; cursor = -1;
                panel.innerHTML = '';
                panel.classList.remove('is-open');
                return;
            }
            hits = lookup(q);
            cursor = -1;
            panel.innerHTML = hits.length
                ? hits.map((h, i) => `
                    <button type="button" class="nav-search__hit" role="option" data-i="${i}">
                        <span class="nav-search__hit-label">${esc(h.label)}</span>
                        <span class="nav-search__hit-text">${highlight(h.text, q)}</span>
                    </button>`).join('')
                : `<p class="nav-search__note">Nothing matches &ldquo;${esc(raw)}&rdquo;.</p>`;
            panel.classList.add('is-open');
        };

        const close = () => {
            bar.classList.remove('is-searching');
            document.body.classList.remove('search-open');
            openBtn.setAttribute('aria-expanded', 'false');
            panel.classList.remove('is-open');
            panel.innerHTML = '';
            hits = []; cursor = -1;
            input.blur();
        };

        const open = () => {
            bar.classList.add('is-searching');
            document.body.classList.add('search-open');
            openBtn.setAttribute('aria-expanded', 'true');
            input.value = '';
            panel.innerHTML = '';
            panel.classList.remove('is-open');
            requestAnimationFrame(() => input.focus());
        };

        const go = (hit) => {
            if (!hit) return;
            close();
            if (hit.spec && selectSpecialty) selectSpecialty(hit.spec);

            const target = hit.el;
            if (lenis) lenis.scrollTo(target, { offset: -150, duration: 1.15 });
            else target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            target.classList.remove('search-hit');
            void target.offsetWidth;          /* restart the flash */
            target.classList.add('search-hit');
            setTimeout(() => target.classList.remove('search-hit'), 2200);
        };

        /* ---------- wiring ---------- */
        openBtn.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        input.addEventListener('input', paint);

        panel.addEventListener('click', (e) => {
            const btn = e.target.closest('.nav-search__hit');
            if (btn) go(hits[+btn.dataset.i]);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') return close();
            if (!hits.length) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
                const nodes = $$('.nav-search__hit', panel);
                nodes.forEach((n, i) => n.classList.toggle('is-cursor', i === cursor));
                nodes[cursor]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                go(hits[cursor < 0 ? 0 : cursor]);
            }
        });

        document.addEventListener('click', (e) => {
            if (!bar.classList.contains('is-searching')) return;
            if (box.contains(e.target) || openBtn.contains(e.target)) return;
            close();
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                open();
            }
        });
    };

    /* =====================================================
       14. TESTIMONIALS — auto-advancing quote card
       ===================================================== */
    const TESTIMONIALS = [
        {
            quote: 'I had a great experience at this hospital. I was seen quickly, and the doctor was able to diagnose and treat my condition very patiently.',
            name: 'JANE RONAN',
            role: 'Cardio Patient',
            img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop'
        },
        {
            quote: 'My father was admitted at midnight and the emergency team had him stable within the hour. The nursing staff kept us informed at every single step.',
            name: 'ARINDAM BOSE',
            role: 'Attendant, Emergency Care',
            img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
        },
        {
            quote: 'The lab reports came back the same afternoon and my consultant had already reviewed them before I walked in. That kind of coordination is rare.',
            name: 'PRIYA SEN',
            role: 'Lab Diagnostics',
            img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop'
        },
        {
            quote: 'Knee replacement at 68 sounded frightening. The orthopaedic team walked me through every stage and I was climbing stairs in three weeks.',
            name: 'MOHAN GUPTA',
            role: 'Orthopedic Patient',
            img: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=150&auto=format&fit=crop'
        },
        {
            quote: 'From the first scan to delivery, the maternity unit felt calm and unhurried. My daughter and I were never treated as just another case file.',
            name: 'RITUPARNA DAS',
            role: 'Maternity Patient',
            img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=150&auto=format&fit=crop'
        }
    ];

    const initTestimonials = () => {
        const card = $('#testimonialCard');
        const dotWrap = $('#tDots');
        if (!card || !dotWrap) return;

        const quote = $('#tQuote');
        const name = $('#tName');
        const role = $('#tRole');
        const avatar = $('#tAvatar');
        let i = 0;
        let timer = null;

        dotWrap.innerHTML = TESTIMONIALS.map((t, k) =>
            `<button type="button" class="track__dot${k ? '' : ' is-active'}" data-i="${k}"
                 role="tab" aria-label="Testimonial ${k + 1}: ${t.name}"></button>`).join('');
        const dots = $$('.track__dot', dotWrap);

        const render = (dir) => {
            const t = TESTIMONIALS[i];
            const swap = () => {
                quote.textContent = `"${t.quote}"`;
                name.textContent = t.name;
                role.textContent = t.role;
                avatar.src = t.img;
                avatar.alt = t.name;
                dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
            };

            if (REDUCED) return swap();

            gsap.timeline()
                .to([quote, name, role, avatar],
                    { opacity: 0, x: -20 * dir, duration: 0.24, ease: 'power2.in' })
                .add(swap)
                .fromTo([quote, name, role, avatar],
                    { opacity: 0, x: 20 * dir },
                    { opacity: 1, x: 0, duration: 0.45, ease: EASE, stagger: 0.04 });
        };

        const stop = () => { clearInterval(timer); timer = null; };
        const start = () => { stop(); timer = setInterval(() => step(1), 6000); };
        const step = (dir) => {
            i = (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length;
            render(dir);
        };

        $('#tNext').addEventListener('click', () => { step(1); start(); });
        $('#tPrev').addEventListener('click', () => { step(-1); start(); });

        dots.forEach((d) => d.addEventListener('click', () => {
            const k = +d.dataset.i;
            if (k === i) return;
            const dir = k > i ? 1 : -1;
            i = k;
            render(dir);
            start();
        }));

        /* pause while the visitor is reading it */
        card.addEventListener('mouseenter', stop);
        card.addEventListener('mouseleave', start);
        card.addEventListener('focusin', stop);
        card.addEventListener('focusout', start);

        /* …and only run at all while the section is on screen */
        ScrollTrigger.create({
            trigger: '#testimonials',
            start: 'top bottom',
            end: 'bottom top',
            onEnter: start,
            onEnterBack: start,
            onLeave: stop,
            onLeaveBack: stop
        });
    };

    /* =====================================================
       14b. PRE-FOOTER MARQUEE
       Wrap the statement cards in a track and clone them once so the
       CSS marquee loops seamlessly. Shared across every page, so it
       runs wherever a .prefooter exists. Reduced motion keeps a single
       set and the CSS turns the ribbon into a swipeable strip.
       ===================================================== */
    const initPrefooter = () => {
        const pf = $('.prefooter');
        if (!pf || pf.dataset.marquee) return;
        const cards = $$('.prefooter__card', pf);
        if (!cards.length) return;

        const track = document.createElement('div');
        track.className = 'prefooter__track';
        cards.forEach((c) => track.appendChild(c));

        /* the duplicate set is what makes translateX(-50%) seamless */
        if (!REDUCED) {
            cards.forEach((c) => {
                const clone = c.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.tabIndex = -1;
                track.appendChild(clone);
            });
        }

        pf.appendChild(track);
        pf.dataset.marquee = '1';
    };

    /* =====================================================
       15. BACK TO TOP + anchor links
       ===================================================== */
    /* =====================================================
       15b. FLOATING ACTIONS + APPOINTMENT MODAL
       Built here (not in the 22 page templates) so the WhatsApp
       button, the QR/booking button and the modal land on every
       page from one place. The modal form validates and confirms
       locally — same no-backend contract as the contact page.
       ===================================================== */
    const WA_NUMBER = '913423254567';

    /* absolute, so the QR a visitor scans resolves on their phone
       (becomes the real domain once deployed) */
    const BOOK_URL = new URL('book.html', location.href).href;

    const DEPT_OPTS = [
        ['cardiology', 'Cardiology'], ['neuro-surgery', 'Neuro Surgery'],
        ['nephrology', 'Medicine &amp; Nephrology'], ['orthopedics', 'Orthopedic Surgery'],
        ['dental-care', 'Dental Care'], ['prenatal-care', 'Prenatal Care'],
        ['nutrition', 'Food &amp; Nutrition'], ['ophthalmology', 'Ophthalmology'],
        ['general-surgery', 'General Surgery'], ['pediatric-surgery', 'Pediatric Surgery'],
        ['lab-diagnostics', 'Lab Diagnostics'], ['other', 'Not sure / other']
    ];

    const buildFab = () => {
        if ($('#siteFab')) return;

        /* ---- the two round buttons ---- */
        const fab = document.createElement('div');
        fab.className = 'fab';
        fab.id = 'siteFab';
        fab.innerHTML = `
            <button type="button" class="fab__btn fab__btn--scan" id="fabScan"
                aria-haspopup="dialog" aria-controls="apptModal" aria-expanded="false"
                aria-label="Book an appointment">
                <i class="fa-solid fa-qrcode"></i>
                <span class="fab__tip">Book appointment</span>
            </button>
            <a class="fab__btn fab__btn--wa" href="https://wa.me/${WA_NUMBER}"
                target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="fab__tip">WhatsApp us</span>
            </a>`;
        document.body.appendChild(fab);

        /* fold the existing back-to-top button into the cluster as its last
           child, so it sits below the two action buttons (initMisc still
           wires its scroll/click by #toTop afterwards) */
        const toTop = document.getElementById('toTop');
        if (toTop) fab.appendChild(toTop);

        /* ---- the modal ---- */
        const depts = DEPT_OPTS
            .map(([v, l]) => `<option value="${v}">${l}</option>`).join('');

        const modal = document.createElement('div');
        modal.className = 'appt';
        modal.id = 'apptModal';
        modal.hidden = true;
        modal.innerHTML = `
            <div class="appt__scrim" data-appt-close></div>
            <div class="appt__card" role="dialog" aria-modal="true" aria-labelledby="apptTitle">
                <button type="button" class="appt__x" data-appt-close aria-label="Close">
                    <i class="fa-solid fa-xmark"></i></button>

                <div class="appt__head">
                    <span class="eyebrow">Appointments</span>
                    <h2 id="apptTitle">Request an <strong>Appointment</strong></h2>
                    <p>Send this and the front desk will call you back to confirm a slot &mdash; usually within the hour.</p>
                </div>

                <form id="fabBookForm" class="appt__form" novalidate>
                    <div class="appt__field">
                        <label for="fabName">Full name</label>
                        <input type="text" id="fabName" name="name" required autocomplete="name">
                    </div>
                    <div class="appt__field">
                        <label for="fabPhone">Phone</label>
                        <input type="tel" id="fabPhone" name="phone" required autocomplete="tel">
                    </div>
                    <div class="appt__field appt__field--full">
                        <label for="fabDept">Department</label>
                        <select id="fabDept" name="department" required>
                            <option value="">Select a department</option>${depts}
                        </select>
                    </div>
                    <div class="appt__field">
                        <label for="fabDate">Preferred date</label>
                        <input type="date" id="fabDate" name="date">
                    </div>
                    <div class="appt__field">
                        <label for="fabTime">Preferred time</label>
                        <select id="fabTime" name="time">
                            <option value="morning">Morning (8 AM &ndash; 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM &ndash; 4 PM)</option>
                            <option value="evening">Evening (4 PM &ndash; 8 PM)</option>
                        </select>
                    </div>
                    <div class="appt__field appt__field--full">
                        <label for="fabMsg">What is the problem?</label>
                        <textarea id="fabMsg" name="message"
                            placeholder="Describe the symptom in your own words — no medical terms needed."></textarea>
                    </div>
                    <label class="appt__consent">
                        <input type="checkbox" name="consent" required>
                        <span>I agree to be contacted about this request. My details will not be
                            shared outside the hospital.</span>
                    </label>
                </form>

                <div class="appt__qr">
                    <h3>Scan to book</h3>
                    <p>Open this form on a phone, or hand it to someone else to fill in.</p>
                    <div class="appt__qrbox" id="fabQrBox">
                        <span class="appt__qrmsg">Generating…</span>
                    </div>
                    <a class="btn-ghost" href="${'book.html'}" target="_blank" rel="noopener">
                        <i class="fa-solid fa-up-right-from-square"></i> Open booking page</a>
                </div>

                <div class="appt__foot">
                    <button type="submit" form="fabBookForm" class="btn-primary">
                        <i class="fa-solid fa-arrow-right"></i> Request Appointment</button>
                    <button type="button" class="btn-ghost" id="fabQrBtn">
                        <i class="fa-solid fa-qrcode"></i> Show QR</button>
                    <span class="appt__note" id="fabNote">
                        <i class="fa-solid fa-circle-check"></i> Thank you — we'll call you shortly.</span>
                </div>
            </div>`;
        document.body.appendChild(modal);

        /* ---- wiring ---- */
        const scanBtn = $('#fabScan');
        const card = $('.appt__card', modal);
        const form = $('#fabBookForm');
        const note = $('#fabNote');
        const qrBtn = $('#fabQrBtn');
        let lastFocus = null;

        const open = () => {
            lastFocus = document.activeElement;
            modal.hidden = false;
            if (lenis) lenis.stop();
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => modal.classList.add('is-in'));
            scanBtn.setAttribute('aria-expanded', 'true');
            setTimeout(() => $('#fabName').focus(), 80);
            document.addEventListener('keydown', onKey);
        };

        const close = () => {
            modal.classList.remove('is-in');
            scanBtn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            setTimeout(() => {
                modal.hidden = true;
                showForm();            /* always reopen on the form face */
            }, 300);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        };

        /* keep Tab inside the card while it is open */
        const onKey = (e) => {
            if (e.key === 'Escape') { close(); return; }
            if (e.key !== 'Tab') return;
            const nodes = $$('a[href],button:not([disabled]),input,select,textarea', card)
                .filter((n) => n.offsetParent !== null);
            if (!nodes.length) return;
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };

        scanBtn.addEventListener('click', open);
        $$('[data-appt-close]', modal).forEach((el) => el.addEventListener('click', close));

        form.addEventListener('submit', (e) => {
            if (!form.reportValidity()) return;
            e.preventDefault();
            form.reset();
            note.classList.add('is-visible');
            setTimeout(() => note.classList.remove('is-visible'), 6000);
        });

        /* ---- QR face: lazy-load the generator on first reveal ---- */
        let qrReady = false;
        const renderQr = () => {
            const box = $('#fabQrBox');
            try {
                const qr = window.qrcode(0, 'M');
                qr.addData(BOOK_URL);
                qr.make();
                box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true });
                qrReady = true;
            } catch (err) {
                box.innerHTML = '<span class="appt__qrmsg">Could not draw the code — use the button below.</span>';
            }
        };
        const ensureQr = () => {
            if (qrReady) return;
            if (window.qrcode) { renderQr(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
            s.onload = renderQr;
            s.onerror = () => {
                $('#fabQrBox').innerHTML =
                    '<span class="appt__qrmsg">Could not load the QR code. Use the button below.</span>';
            };
            document.head.appendChild(s);
        };

        const showForm = () => {
            card.classList.remove('is-qr');
            qrBtn.innerHTML = '<i class="fa-solid fa-qrcode"></i> Show QR';
        };
        const showQr = () => {
            ensureQr();
            card.classList.add('is-qr');
            qrBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to form';
            card.scrollTop = 0;
        };
        qrBtn.addEventListener('click', () =>
            card.classList.contains('is-qr') ? showForm() : showQr());
    };

    /* =====================================================
       15c. FULL-WIDTH FOOTER
       Rebuilt from one definition so every page shares the same
       four-column, edge-to-edge footer. The existing <footer> and
       its bottom bar stay in the markup as a no-JS fallback; here
       we swap their contents in (keeping the element, so the
       homepage keeps its id="contact" scroll-spy anchor).
       ===================================================== */
    const FT_DEPTS = [
        ['cardiology.html', 'Cardiology'],
        ['neuro-surgery.html', 'Neuro Surgery'],
        ['orthopedics.html', 'Orthopedic Surgery'],
        ['prenatal-care.html', 'Prenatal Care'],
        ['ophthalmology.html', 'Ophthalmology'],
        ['lab-diagnostics.html', 'Lab Diagnostics']
    ];

    const FT_NEWS = [
        ['https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=240&auto=format&fit=crop',
            'A fourth modular theatre opens this year', '11 Jul 2026'],
        ['https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=240&auto=format&fit=crop',
            'Cath lab now under 60-minute door-to-balloon', '01 Aug 2026'],
        ['https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=240&auto=format&fit=crop',
            'Digital records go live across every unit', '20 Sep 2026']
    ];

    const buildFooter = () => {
        const footer = $('.site-footer');
        if (!footer) return;

        const depts = FT_DEPTS
            .map(([h, l]) => `<li><a href="${h}"><i class="fa-solid fa-plus"></i> ${l}</a></li>`)
            .join('');

        const news = FT_NEWS.map(([img, title, date]) => `
            <a class="ftx-post" href="blog-post.html">
                <img class="ftx-post__img" src="${img}" alt="" loading="lazy">
                <span class="ftx-post__body">
                    <span class="ftx-post__title">${title}</span>
                    <span class="ftx-post__date"><i class="fa-regular fa-calendar"></i> ${date}</span>
                </span>
            </a>`).join('');

        footer.innerHTML = `
            <div class="ftx">
                <div class="ftx-grid">
                    <div class="ftx-brand">
                        <a class="ftx-logo" href="website.html" aria-label="The Sun Hospital">
                            <img src="assets/logo-tsh.png" alt="The Sun Hospital" loading="lazy">
                        </a>
                        <p>The Sun has grown from forty beds in 1994 into a 210-bed, twenty-unit
                            hospital caring for Bardhaman and the districts around it.</p>
                        <p>Among the most trusted names in the region, with more than three decades
                            of training and experience behind every team.</p>
                        <div class="ftx-social">
                            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                            <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener"
                                aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        </div>
                    </div>

                    <div class="ftx-col">
                        <h4 class="ftx-head">Departments</h4>
                        <ul class="ftx-dept">${depts}</ul>
                    </div>

                    <div class="ftx-col">
                        <h4 class="ftx-head">Latest News</h4>
                        <div class="ftx-news">${news}</div>
                    </div>

                    <div class="ftx-col">
                        <h4 class="ftx-head">Contact Us</h4>
                        <ul class="ftx-contact">
                            <li>
                                <span class="ftx-cicon"><i class="fa-solid fa-location-dot"></i></span>
                                <span class="ftx-ctext"><small>Find us at</small>
                                    <strong>G.T. Road, Bardhaman, WB 713101</strong></span>
                            </li>
                            <li>
                                <span class="ftx-cicon"><i class="fa-solid fa-phone-volume"></i></span>
                                <span class="ftx-ctext"><small>Mon &ndash; Sat : 08:00 &ndash; 20:00</small>
                                    <a href="tel:+913423254567"><strong>+91 342 325 4567</strong></a></span>
                            </li>
                            <li>
                                <span class="ftx-cicon"><i class="fa-solid fa-envelope"></i></span>
                                <span class="ftx-ctext"><small>Do you have a question?</small>
                                    <a href="mailto:contact@thesunhospital.in"><strong>contact@thesunhospital.in</strong></a></span>
                            </li>
                            <li>
                                <span class="ftx-cicon"><i class="fa-regular fa-clock"></i></span>
                                <span class="ftx-ctext"><small>Mon &ndash; Sat 8:00 &ndash; 20:00</small>
                                    <strong>Sunday &mdash; Emergency only</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>`;

        let bottom = $('.ft__bottom');
        if (!bottom) {
            bottom = document.createElement('div');
            bottom.className = 'ft__bottom';
            footer.insertAdjacentElement('afterend', bottom);
        }
        bottom.innerHTML = `
            <p class="ft__bottom-copy">&copy; 2026 <strong>The Sun Hospital</strong>. All rights reserved.</p>
            <nav class="ftx-legal" aria-label="Legal">
                <a href="contact.html">Privacy Policy</a>
                <a href="contact.html">Terms</a>
                <a href="contact.html">Contact</a>
            </nav>
            <a class="ft__dev" href="https://promix.tech/" target="_blank" rel="noopener noreferrer"
                data-tip="Promix" aria-label="Developed by Promix">
                <span>Developed by</span>
                <img src="assets/promix-logo.png" alt="Promix" loading="lazy">
            </a>`;
    };

    const initMisc = () => {
        const btn = $('#toTop');
        const onScroll = (y) => btn.classList.toggle('is-visible', y > 600);

        if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
        else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

        btn.addEventListener('click', () => {
            if (lenis) lenis.scrollTo(0, { duration: 1.2 });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        /* in-page anchors route through Lenis so they don't fight it */
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                scrollToEl(target);
            });
        });
    };

    /* =====================================================
       16. THEME TOGGLE
       The inline <head> script already resolved and applied the
       theme before first paint; this only owns the switching.
       ===================================================== */
    const THEME_KEY = 'tsh-theme';

    const initTheme = () => {
        const btn = $('#themeBtn');
        if (!btn) return;

        const osDark = window.matchMedia('(prefers-color-scheme: dark)');

        const apply = (theme) => {
            document.documentElement.dataset.theme = theme;
            const dark = theme === 'dark';
            btn.setAttribute('aria-pressed', String(dark));
            btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        };

        apply(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

        btn.addEventListener('click', () => {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            apply(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
        });

        /* follow the OS only while the visitor hasn't made a choice */
        osDark.addEventListener('change', (e) => {
            let stored = null;
            try { stored = localStorage.getItem(THEME_KEY); } catch (err) { /* private mode */ }
            if (!stored) apply(e.matches ? 'dark' : 'light');
        });
    };

    /* =====================================================
       17. LANGUAGE — EN / BENGALI

       Translation is Google's website widget. It is deprecated
       (unsupported since 2018) but still live, and it is the only
       route that covers copy nobody has translated yet — a blog
       post published tomorrow is Bengali the moment it is read.

       The widget takes its target language from a `googtrans`
       cookie at init, which is also what carries the choice from
       page to page. So both directions are: write the cookie,
       reload, let the widget read it.

       A reload each way, rather than driving the widget's hidden
       .goog-te-combo select in place: going BACK to English that
       way is unreliable, and a control that works cleanly one
       direction and raggedly the other is worse than one that is
       consistently a page load.

       If the endpoint ever goes away, script.onerror clears the
       cookie — the failure mode is an English page, not a stuck one.
       ===================================================== */
    const LANG_COOKIE = 'googtrans';

    const currentLang = () => (/(^|;\s*)googtrans=[^;]*\/bn/.test(document.cookie) ? 'bn' : 'en');

    /* written twice: a host-only cookie, and a dot-domain one. Which of
       the two the widget reads depends on how the site is served, and
       setting both is cheaper than guessing. */
    const writeLangCookie = (lang) => {
        const value = lang === 'bn' ? '/en/bn' : '';
        const expiry = lang === 'bn' ? '' : ';expires=Thu, 01 Jan 1970 00:00:01 GMT';

        document.cookie = `${LANG_COOKIE}=${value};path=/${expiry}`;
        document.cookie = `${LANG_COOKIE}=${value};path=/;domain=${location.hostname}${expiry}`;
        document.cookie = `${LANG_COOKIE}=${value};path=/;domain=.${location.hostname}${expiry}`;
    };

    const initLang = () => {
        const box = $('#navLang');
        if (!box) return;

        const buttons = $$('button', box);
        const lang = currentLang();

        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.dataset.lang === currentLang()) return;
                box.classList.add('is-busy');
                writeLangCookie(btn.dataset.lang);
                location.reload();
            });
        });

        /* English needs no widget at all — no third-party request is made
           unless the visitor actually asked for Bengali */
        if (lang !== 'bn') return;

        /* Left alone, the widget rewrites +91 342 325 4567 into Bengali
           numerals, which is a number nobody can dial. Tag the links
           themselves rather than chasing each one through the generator, and
           only where the text is actually an address or a number — a plain
           "Email HR" label should still translate. */
        $$('a[href^="tel:"], a[href^="mailto:"]')
            .filter((a) => /[0-9@]/.test(a.textContent))
            .forEach((a) => a.setAttribute('translate', 'no'));

        const mount = document.createElement('div');
        mount.id = 'google_translate_element';
        document.body.appendChild(mount);

        window.tmhTranslateInit = () => {
            /* eslint-disable-next-line no-undef */
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'bn',
                autoDisplay: false,
            }, 'google_translate_element');
        };

        /* Bengali runs to a different length than English, so every scroll
           trigger measured at DOMContentLoaded is wrong once the swap lands.
           Google marks completion with a .translated-* class on <html>. */
        const done = new MutationObserver(() => {
            if (!/\btranslated-/.test(document.documentElement.className)) return;
            done.disconnect();
            setTimeout(() => window.ScrollTrigger?.refresh(), 300);
        });
        done.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=tmhTranslateInit';
        script.onerror = () => {
            writeLangCookie('en');
            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === 'en')));
            document.documentElement.lang = 'en';
            delete document.documentElement.dataset.lang;
        };
        document.body.appendChild(script);
    };

    /* =====================================================
       18. BOOT
       ===================================================== */
    const boot = () => {
        initTheme();
        initLang();
        buildFloaters();
        buildFooter();
        initPrefooter();
        initHeader();
        initHero();
        initRevealText();
        initSections();
        initDock();
        initSpy();
        initSpecialities();
        initFaq();
        initDoctors();
        initLabSlider();
        initTestimonials();
        initSearch();
        buildFab();
        initMisc();

        /* fonts and remote images change layout — resync trigger positions */
        if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
        window.addEventListener('load', () => ScrollTrigger.refresh());
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
