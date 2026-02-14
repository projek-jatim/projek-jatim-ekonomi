(() => {
    const root = document.querySelector('[data-slider]');
    if (!root) return;

    const track = root.querySelector('[data-track]');
    const pages = Array.from(root.querySelectorAll('[data-page]'));
    const dotsWrap = root.querySelector('[data-dots]');
    const btnPrev = root.querySelector('[data-prev]');
    const btnNext = root.querySelector('[data-next]');

    if (!track || !pages.length || !dotsWrap || !btnPrev || !btnNext) return;

    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

    // ====== AUTOPLAY CONFIG ======
    // 0 = off, contoh 4500 = 4.5 detik
    const AUTOPLAY_MS = 45000;

    let timer = null;
    let paused = false;

    // Build dots
    dotsWrap.innerHTML = '';
    const dots = pages.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'news-dot';
        b.setAttribute('aria-label', `Halaman ${i + 1}`);
        b.addEventListener('click', () => {
            scrollToIndex(i);
            resetAutoplay();
        });
        dotsWrap.appendChild(b);
        return b;
    });

    const pageWidth = () => track.clientWidth || 1;

    const indexFromScroll = () => {
        const w = pageWidth();
        const i = Math.round(track.scrollLeft / w);
        return clamp(i, 0, pages.length - 1);
    };

    const setActive = (i) => {
        dots.forEach((d, k) => d.classList.toggle('is-active', k === i));

        const atStart = i === 0;
        const atEnd = i === pages.length - 1;

        btnPrev.disabled = atStart;
        btnNext.disabled = atEnd;

        btnPrev.style.opacity = atStart ? 0.25 : 0.85;
        btnNext.style.opacity = atEnd ? 0.25 : 0.85;

        btnPrev.style.pointerEvents = atStart ? 'none' : 'auto';
        btnNext.style.pointerEvents = atEnd ? 'none' : 'auto';
    };

    const scrollToIndex = (i, behavior = 'smooth') => {
        const idx = clamp(i, 0, pages.length - 1);
        track.scrollTo({
            left: idx * pageWidth(),
            behavior
        });
        setActive(idx);
    };

    const nextIndex = () => {
        const i = indexFromScroll();
        return (i + 1) % pages.length; // loop
    };

    const prevIndex = () => {
        const i = indexFromScroll();
        return clamp(i - 1, 0, pages.length - 1);
    };

    // Prev/Next
    btnPrev.addEventListener('click', () => {
        scrollToIndex(prevIndex());
        resetAutoplay();
    });

    btnNext.addEventListener('click', () => {
        scrollToIndex(nextIndex());
        resetAutoplay();
    });

    // Update active dot on scroll (throttled)
    let raf = 0;
    track.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            setActive(indexFromScroll());
        });
    });

    // ====== AUTOPLAY ======
    const stopAutoplay = () => {
        if (timer) clearInterval(timer);
        timer = null;
    };

    const startAutoplay = () => {
        if (!AUTOPLAY_MS) return;
        stopAutoplay();
        timer = setInterval(() => {
            if (paused) return;
            scrollToIndex(nextIndex());
        }, AUTOPLAY_MS);
    };

    const resetAutoplay = () => {
        if (!AUTOPLAY_MS) return;
        stopAutoplay();
        startAutoplay();
    };

    // Pause on hover / focus / touch
    root.addEventListener('mouseenter', () => {
        paused = true;
    });
    root.addEventListener('mouseleave', () => {
        paused = false;
    });

    root.addEventListener('focusin', () => {
        paused = true;
    });
    root.addEventListener('focusout', () => {
        paused = false;
    });

    root.addEventListener('touchstart', () => {
        paused = true;
    }, {
        passive: true
    });
    root.addEventListener('touchend', () => {
        paused = false;
        resetAutoplay();
    }, {
        passive: true
    });

    // Init
    track.scrollLeft = 0;
    setActive(0);
    startAutoplay();

    // Re-sync on resize
    window.addEventListener('resize', () => {
        const i = indexFromScroll();
        scrollToIndex(i, 'auto');
    });
})();