(() => {
    const el = document.getElementById('pdrbDonut');
    if (!el || !window.Chart) return;

    // === DATA (ganti sesuai kebutuhan) ===
    const labels = ['Industri', 'Perdagangan', 'Pertanian', 'Konstruksi', 'Lainnya'];
    const values = [30.85, 18.81, 10.66, 8.97, 30.71];

    // nuansa warna ungu -> pink -> krem
    const colors = [
        'rgba(190,120,255,.95)', // Industri
        'rgba(150,80,255,.90)', // Perdagangan
        'rgba(240,160,255,.85)', // Pertanian
        'rgba(220,120,255,.70)', // Konstruksi
        'rgba(255,255,200,.92)' // Lainnya
    ];

    const centerTitle = document.querySelector('.donut-center-title');
    const centerValue = document.querySelector('.donut-center-value');
    const centerSub = document.querySelector('.donut-center-sub');

    const fmt = (n) => Number(n).toFixed(2).replace('.', ',');

    const total = values.reduce((a, b) => a + b, 0);

    const chart = new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: 'rgba(0,0,0,.55)',
                borderWidth: 2,
                hoverOffset: 10,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            layout: {
                padding: 8
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    displayColors: true,
                    backgroundColor: 'rgba(0,0,0,.74)',
                    borderColor: 'rgba(255,255,255,.14)',
                    borderWidth: 1,
                    padding: 12,
                    titleColor: 'rgba(255,255,255,.92)',
                    bodyColor: 'rgba(255,255,255,.92)',
                    titleFont: {
                        size: 14,
                        weight: '700'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '600'
                    },
                    callbacks: {
                        title: (items) => (items && items[0] ? items[0].label : ''),
                        label: (item) => {
                            const v = Number(item.raw || 0);
                            const p = total ? (v / total) * 100 : 0;
                            return `${fmt(v)}%  (${fmt(p)}% dari total)`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: true
            }
        }
    });

    const setCenter = (idx) => {
        if (!centerTitle || !centerValue || !centerSub) return;

        if (idx == null) {
            centerTitle.textContent = 'Total';
            centerValue.textContent = '100%';
            centerSub.textContent = 'ADHB';
            return;
        }

        const v = values[idx];
        const p = total ? (v / total) * 100 : 0;
        centerTitle.textContent = labels[idx];
        centerValue.textContent = `${fmt(v)}%`;
        centerSub.textContent = `${fmt(p)}% dari total`;
    };

    setCenter(null);

    // Update label tengah saat hover pada canvas
    el.addEventListener('mousemove', () => {
        const active = i.getActiveElements();
        if (!active || active.length === 0) return setCenter(null);
        setCenter(active[0].index);
    });
    el.addEventListener('mouseleave', () => setCenter(null));

    // Hover via legenda: highlight slice + tooltip
    const legend = document.getElementById('pdrbDonutLegend');
    if (legend) {
        const canvasRect = () => el.getBoundingClientRect();
        const canvasCenterPoint = () => {
            const r = canvasRect();
            return {
                x: r.width / 2,
                y: r.height / 2
            };
        };

        legend.querySelectorAll('li[data-idx]').forEach(li => {
            const idx = Number(li.dataset.idx);

            li.addEventListener('mouseenter', () => {
                chart.setActiveElements([{
                    datasetIndex: 0,
                    index: idx
                }]);

                // pos tooltip di tengah donut biar konsisten
                const pt = canvasCenterPoint();
                chart.tooltip.setActiveElements([{
                    datasetIndex: 0,
                    index: idx
                }], pt);

                chart.update();
                setCenter(idx);
            });

            li.addEventListener('mouseleave', () => {
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], {
                    x: 0,
                    y: 0
                });
                chart.update();
                setCenter(null);
            });
        });
    }
})();