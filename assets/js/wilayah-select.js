$(function () {
    function initFilterSelect2(selector, ph) {
        const $el = $(selector);

        $el.select2({
            placeholder: ph,
            allowClear: false,
            width: '100%',
            dropdownParent: $(document.body),
            minimumResultsForSearch: Infinity // default: search disembunyikan (untuk tahun/triwulan)
        });

        $el.on('select2:open', function () {
            setTimeout(function () {
                const s = document.querySelector('.select2-container--open .select2-search__field');
                if (s) s.focus();
            }, 0);
        });
    }

    // Tahun & Triwulan: tanpa search (rapi, tidak perlu search)
    initFilterSelect2('#tahunSelect', 'Pilih Tahun');
    initFilterSelect2('#triwulanSelect', 'Pilih Triwulan');

    // Wilayah: search aktif
    $('#wilayahSelect').select2({
        placeholder: 'Pilih Wilayah',
        allowClear: false,
        width: '100%',
        dropdownAutoWidth: false,
        dropdownParent: $(document.body),
        minimumResultsForSearch: 0 // selalu tampil search
    }).on('select2:open', function () {
        setTimeout(function () {
            const s = document.querySelector('.select2-container--open .select2-search__field');
            if (s) {
                s.setAttribute('placeholder', 'Ketik untuk mencari wilayah…');
                s.focus();
            }
        }, 0);
    });
});
// (() => {
//     const el = document.getElementById('wilayahSelect');
//     if (!el) return;

//     // kalau re-init
//     if (el.tomselect) el.tomselect.destroy();

//     const ts = new TomSelect(el, {
//         create: false,
//         placeholder: 'Pilih Wilayah',
//         allowEmptyOption: true,
//         closeAfterSelect: true,

//         // bikin dropdown keluar dari card (biar ga ketutup overflow/stacking)
//         dropdownParent: 'body',

//         // SEARCH input muncul di dropdown (model Select2)
//         plugins: ['dropdown_input'],

//         // UX: langsung fokus ke search saat dibuka
//         onDropdownOpen() {
//             // set lebar dropdown = lebar control
//             const control = ts.control;
//             const rect = control.getBoundingClientRect();
//             ts.dropdown.style.width = rect.width + 'px';

//             // posisi dropdown align ke control (kiri)
//             ts.dropdown.style.left = rect.left + 'px';

//             // top: di bawah control
//             ts.dropdown.style.top = (rect.bottom + 8) + 'px';

//             // fokus ke input search
//             const inp = ts.dropdown.querySelector('.ts-dropdown-input');
//             if (inp) {
//                 inp.placeholder = 'Ketik untuk mencari wilayah…';
//                 inp.focus();
//             }
//         },

//         onDropdownClose() {
//             // bersihin query saat tutup (opsional, tapi enak)
//             ts.setTextboxValue('');
//         }
//     });

//     // kalau user scroll page saat dropdown open, posisi ikut (opsional)
//     window.addEventListener('scroll', () => {
//         if (!ts.dropdown || ts.dropdown.style.display === 'none') return;
//         const rect = ts.control.getBoundingClientRect();
//         ts.dropdown.style.width = rect.width + 'px';
//         ts.dropdown.style.left = rect.left + 'px';
//         ts.dropdown.style.top = (rect.bottom + 8) + 'px';
//     }, {
//         passive: true
//     });
// })();