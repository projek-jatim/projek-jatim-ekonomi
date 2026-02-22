(() => {
    const canvas = document.getElementById('growthYoyChart');
    if (!canvas || !window.Chart) return;

    const titleEl = document.getElementById('growthChartTitle') || document.querySelector('.growth-chart-title');
    const periodeEl = document.getElementById('periodeSelect');

    const labels = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

    // Dummy data: ganti sesuai data real kamu
    const series = {
        yoy: [6.08, 5.86, 5.44, 5.57, 5.45, 5.50, 5.52, -2.33, 3.57, 5.34, 4.95, 4.93],
        qoq: [1.10, 1.02, 0.95, 1.00, 0.98, 1.01, 1.05, -4.10, 2.30, 1.40, 1.10, 1.05],
        ctc: [5.90, 5.70, 5.30, 5.40, 5.35, 5.45, 5.50, -2.20, 3.40, 5.10, 4.80, 4.70],
    };

    const meta = {
        yoy: {
            label: 'YoY',
            title: 'Pertumbuhan Ekonomi (yoy) - %',
            tip: 'YoY'
        },
        qoq: {
            label: 'QtQ',
            title: 'Pertumbuhan Ekonomi (qtq) - %',
            tip: 'QtQ'
        },
        ctc: {
            label: 'CtC',
            title: 'Pertumbuhan Ekonomi (ctc) - %',
            tip: 'CtC'
        },
    };

    function normalizeMode(v) {
        const s = String(v || '').toLowerCase().replace(/\s+/g, '');
        if (s === 'qoq' || s === 'qtq' || s === 'qtoq' || s === 'q2q') return 'qoq';
        if (s === 'ctc' || s === 'ctoc' || s === 'c2c') return 'ctc';
        if (s === 'yoy' || s === 'yony' || s === 'y2y') return 'yoy';
        return 'yoy';
    }

    // Gradient
    const ctx = canvas.getContext('2d');
    const h = canvas.height || 140;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(170,120,255,.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    // Hindari dobel init (kalau file keload 2x)
    if (window.__growthChart && window.__growthChart instanceof Chart) {
        try {
            window.__growthChart.destroy();
        } catch (_) {}
        window.__growthChart = null;
    }

    // Mode awal
    let mode = normalizeMode((periodeEl && periodeEl.value) || 'yoy');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: meta[mode].label,
                data: series[mode],
                tension: 0.35,
                borderWidth: 3,
                borderColor: 'rgba(190,120,255,.95)',
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(255,255,255,.92)',
                pointBorderColor: 'rgba(190,120,255,.95)',
                pointBorderWidth: 2,
                fill: true,
                backgroundColor: grad
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    backgroundColor: 'rgba(0,0,0,.78)',
                    borderColor: 'rgba(255,255,255,.12)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (items) => `Tahun ${items[0].label}`,
                        label: (item) => `${meta[mode].tip}: ${Number(item.raw).toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,.08)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,.70)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,.08)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,.70)',
                        callback: v => `${v}%`
                    }
                }
            }
        }
    });

    window.__growthChart = chart;

    function setTitle(m) {
        if (titleEl) titleEl.textContent = meta[m].title;
    }

    // Fungsi update global (bisa dipanggil dari mana saja)
    window.setGrowthPeriod = function (next) {
        const m = normalizeMode(next);
        if (!series[m]) return;

        mode = m; // penting untuk tooltip callback
        chart.data.datasets[0].label = meta[m].label;
        chart.data.datasets[0].data = series[m];

        setTitle(m);
        chart.update();
    };

    // Set judul awal
    setTitle(mode);

    // Listener native (jalan walau tanpa Select2)
    if (periodeEl) {
        periodeEl.addEventListener('change', () => window.setGrowthPeriod(periodeEl.value));
    }

    // Listener jQuery (kalau pakai Select2)
    if (window.jQuery && periodeEl) {
        window.jQuery(periodeEl).on('change', function () {
            window.setGrowthPeriod(this.value);
        });
    }
})();
// (() => {
//     const canvas = document.getElementById('growthYoyChart'); // biarkan id lama
//     if (!canvas || !window.Chart) return;

//     const titleEl = document.getElementById('growthChartTitle');

//     // Labels tetap sama (tahun)
//     const labels = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

//     // Data contoh (ganti dengan data real)
//     const series = {
//         yoy: [6.08, 5.86, 5.44, 5.57, 5.45, 5.50, 5.52, -2.33, 3.57, 5.34, 4.95, 4.93],
//         qoq: [1.20, 1.10, 0.95, 1.02, 0.98, 1.05, 1.00, -4.10, 2.30, 1.40, 1.10, 1.05],
//         ctc: [5.90, 5.70, 5.30, 5.40, 5.35, 5.45, 5.50, -2.20, 3.40, 5.10, 4.80, 4.70],
//     };

//     // Teks judul sesuai mode
//     const modeMeta = {
//         yoy: {
//             label: 'YoY',
//             title: 'Pertumbuhan Ekonomi (yoy) - %',
//             tooltipPrefix: 'YoY'
//         },
//         qoq: {
//             label: 'QtQ',
//             title: 'Pertumbuhan Ekonomi (qtq) - %',
//             tooltipPrefix: 'QtQ'
//         },
//         ctc: {
//             label: 'CtC',
//             title: 'Pertumbuhan Ekonomi (ctc) - %',
//             tooltipPrefix: 'CtC'
//         },
//     };

//     const ctx = canvas.getContext('2d');

//     // Gradient (pakai tinggi aktual canvas; kalau 0 fallback)
//     const h = canvas.height || 140;
//     const grad = ctx.createLinearGradient(0, 0, 0, h);
//     grad.addColorStop(0, 'rgba(170,120,255,.22)');
//     grad.addColorStop(1, 'rgba(0,0,0,0)');

//     // default mode dari select (kalau belum ada, default yoy)
//     const periodeSelect = document.getElementById('periodeSelect');
//     let mode = (periodeSelect && periodeSelect.value) ? periodeSelect.value : 'yoy';
//     if (!series[mode]) mode = 'yoy';

//     const chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels,
//             datasets: [{
//                 label: modeMeta[mode].label,
//                 data: series[mode],
//                 tension: 0.35,
//                 borderWidth: 3,
//                 borderColor: 'rgba(190,120,255,.95)',
//                 pointRadius: 4,
//                 pointHoverRadius: 6,
//                 pointBackgroundColor: 'rgba(255,255,255,.92)',
//                 pointBorderColor: 'rgba(190,120,255,.95)',
//                 pointBorderWidth: 2,
//                 fill: true,
//                 backgroundColor: grad
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             interaction: {
//                 mode: 'nearest',
//                 intersect: false
//             },

//             font: {
//                 family: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
//                 size: 13,
//                 weight: '600'
//             },

//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     enabled: true,
//                     displayColors: false,
//                     backgroundColor: 'rgba(0,0,0,.78)',
//                     borderColor: 'rgba(255,255,255,.12)',
//                     borderWidth: 1,
//                     padding: 12,
//                     titleColor: 'rgba(255,255,255,.95)',
//                     bodyColor: 'rgba(255,255,255,.92)',
//                     titleFont: {
//                         size: 14,
//                         weight: '700'
//                     },
//                     bodyFont: {
//                         size: 13,
//                         weight: '600'
//                     },
//                     callbacks: {
//                         title: (items) => `Tahun ${items[0].label}`,
//                         label: (item) => `${modeMeta[mode].tooltipPrefix}: ${Number(item.raw).toFixed(2)}%`
//                     }
//                 }
//             },

//             scales: {
//                 x: {
//                     grid: {
//                         color: 'rgba(255,255,255,.08)'
//                     },
//                     ticks: {
//                         color: 'rgba(255,255,255,.70)',
//                         font: {
//                             size: 17,
//                             weight: '350'
//                         }
//                     }
//                 },
//                 y: {
//                     grid: {
//                         color: 'rgba(255,255,255,.08)'
//                     },
//                     ticks: {
//                         color: 'rgba(255,255,255,.70)',
//                         font: {
//                             size: 17,
//                             weight: '350'
//                         },
//                         callback: (v) => `${v}%`
//                     }
//                 }
//             }
//         }
//     });

//     // Set judul awal
//     if (titleEl) titleEl.textContent = modeMeta[mode].title;

//     // Handler perubahan periode (meniru konsep "mode" seperti Inflasi)
//     function applyMode(nextMode) {
//         if (!series[nextMode]) return;
//         mode = nextMode;

//         // update dataset
//         chart.data.datasets[0].label = modeMeta[mode].label;
//         chart.data.datasets[0].data = series[mode];

//         // update title di card
//         if (titleEl) titleEl.textContent = modeMeta[mode].title;

//         chart.update();
//     }

//     if (periodeSelect) {
//         periodeSelect.addEventListener('change', () => applyMode(periodeSelect.value));
//     }
// })();