(() => {
    const dd = document.querySelector('[data-pill-dd]');
    if (!dd) return;

    const btn = dd.querySelector('[data-pill-btn]');
    const menu = dd.querySelector('[data-pill-menu]');
    const labelEl = dd.querySelector('[data-pill-label]');
    const tbody = document.querySelector('.pdrb-table tbody');
    if (!btn || !menu || !labelEl || !tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const ALL_VALUE = 'ALL';

    // ===== Build options =====
    const cats = Array.from(
        new Set(rows.map(r => (r.dataset.lap || '').trim()).filter(Boolean))
    );

    const options = [{
            value: ALL_VALUE,
            text: 'Semua Lapangan Usaha'
        }]
        .concat(cats.map(c => ({
            value: c,
            text: c
        })));

    // Render options
    menu.innerHTML = '';
    const optButtons = options.map((opt, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pill-opt';
        b.setAttribute('role', 'option');
        b.dataset.value = opt.value;
        b.textContent = opt.text;
        b.addEventListener('click', () => select(opt.value));
        menu.appendChild(b);
        if (idx === 0) b.classList.add('is-active');
        return b;
    });

    // ===== PORTAL: pindahkan menu ke <body> biar gak ke-clip overflow =====
    menu.classList.add('is-portal');
    document.body.appendChild(menu);

    const placeMenu = () => {
        const r = btn.getBoundingClientRect();
        const gap = 10;

        // default pos: bawah kiri tombol
        let left = r.left;
        let top = r.bottom + gap;

        // batasi biar tidak keluar kanan layar
        const menuWidth = Math.max(menu.offsetWidth, 320);
        const maxLeft = window.innerWidth - menuWidth - 12;
        left = Math.min(left, maxLeft);
        left = Math.max(12, left);

        // kalau bawahnya kepotong, taruh ke atas
        const menuHeight = menu.offsetHeight || 240;
        const maxTop = window.innerHeight - menuHeight - 12;
        if (top > maxTop) top = Math.max(12, r.top - gap - menuHeight);

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.minWidth = `${Math.max(r.width, 320)}px`;
    };

    const open = () => {
        dd.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');

        // tampilkan dulu supaya offsetHeight kebaca
        menu.style.display = 'block';
        placeMenu();
        menu.focus({
            preventScroll: true
        });
    };

    const close = () => {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        menu.style.display = 'none';
    };

    const select = (value) => {
        // set active option
        optButtons.forEach(b => b.classList.toggle('is-active', b.dataset.value === value));

        // set label
        const chosen = options.find(o => o.value === value);
        labelEl.textContent = chosen ? chosen.text : 'Semua Lapangan Usaha';

        // filter rows
        rows.forEach(r => {
            const lap = (r.dataset.lap || '').trim();
            const show = (value === ALL_VALUE) || (lap === value);
            r.style.display = show ? '' : 'none';
        });

        close();
        btn.focus({
            preventScroll: true
        });
    };

    // Toggle click
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        dd.classList.contains('is-open') ? close() : open();
    });

    // Close on outside click (gunakan capture supaya menang walau ada overlay lain)
    document.addEventListener('click', (e) => {
        if (btn.contains(e.target)) return;
        if (menu.contains(e.target)) return;
        close();
    }, true);

    // Keyboard
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            open();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        }
    });

    menu.addEventListener('keydown', (e) => {
        const activeIdx = optButtons.findIndex(b => b.classList.contains('is-active'));
        const nextIdx = (i) => Math.max(0, Math.min(optButtons.length - 1, i));

        if (e.key === 'Escape') {
            e.preventDefault();
            close();
            btn.focus();
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            optButtons[nextIdx(activeIdx + 1)].click();
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            optButtons[nextIdx(activeIdx - 1)].click();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            (optButtons[activeIdx] || optButtons[0]).click();
        }
    });

    // Reposition saat scroll/resize (dropdown terbuka)
    window.addEventListener('resize', () => dd.classList.contains('is-open') && placeMenu());
    window.addEventListener('scroll', () => dd.classList.contains('is-open') && placeMenu(), true);

    // Init
    select(ALL_VALUE);
})();