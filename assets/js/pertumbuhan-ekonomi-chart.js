(() => {
    const el = document.getElementById('growthYoyChart');
    if (!el || !window.Chart) return;

    // Contoh data (silakan ganti sesuai angka kamu)
    const labels = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const yoy = [6.08, 5.86, 5.44, 5.57, 5.45, 5.50, 5.52, -2.33, 3.57, 5.34, 4.95, 4.93];

    const ctx = el.getContext('2d');

    // fill gradient halus (opsional)
    const grad = ctx.createLinearGradient(0, 0, 0, el.height || 140);
    grad.addColorStop(0, 'rgba(170,120,255,.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'YoY',
                data: yoy,
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

            // bikin hover enak
            interaction: {
                mode: 'nearest',
                intersect: false
            },

            // 1) FONT GLOBAL (ngaruh ke default semua teks di chart)
            font: {
                family: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                size: 13, // base size
                weight: '600'
            },

            plugins: {
                legend: {
                    display: false
                },

                // 2) TITLE CHART (kalau kamu pakai plugin title)
                title: {
                    display: false, // set true kalau mau judul di dalam chart
                    text: 'Pertumbuhan Ekonomi (yoy) - %',
                    color: 'rgba(255,255,255,.92)',
                    padding: {
                        top: 6,
                        bottom: 10
                    },
                    font: {
                        size: 16,
                        weight: '700'
                    }
                },

                // 3) TOOLTIP (hover)
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    backgroundColor: 'rgba(0,0,0,.78)',
                    borderColor: 'rgba(255,255,255,.12)',
                    borderWidth: 1,
                    padding: 12,

                    titleColor: 'rgba(255,255,255,.95)',
                    bodyColor: 'rgba(255,255,255,.92)',

                    // ukuran font tooltip
                    titleFont: {
                        size: 14,
                        weight: '700'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '600'
                    },

                    callbacks: {
                        title: (items) => `Tahun ${items[0].label}`,
                        label: (item) => `YoY: ${Number(item.raw).toFixed(2)}%`
                    }
                }
            },

            // 4) AXIS (x/y) label & ticks
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,.08)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,.70)',
                        font: {
                            size: 17,
                            weight: '350'
                        } // X angka tahun
                    },
                    title: {
                        display: false, // set true kalau mau label "Tahun"
                        text: 'Tahun',
                        color: 'rgba(255,255,255,.72)',
                        font: {
                            size: 13,
                            weight: '700'
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,.08)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,.70)',
                        font: {
                            size: 17,
                            weight: '350'
                        },
                        callback: (v) => `${v}%`
                    },
                    title: {
                        display: false, // set true kalau mau label "% YoY"
                        text: '% YoY',
                        color: 'rgba(255,255,255,.72)',
                        font: {
                            size: 13,
                            weight: '700'
                        }
                    }
                }
            }
        }

    });
})();