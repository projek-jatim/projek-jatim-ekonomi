/* =========================
   Inflasi (Public) - JS
   Dependencies:
   - jQuery
   - Select2
   - Chart.js (umd)
   ========================= */

(function () {
    "use strict";

    // function getMainData(tahun, mode) {
    //     const byYear = mainSeries[tahun] || mainSeries["2024"];
    //     return byYear[mode] || byYear["mtm"];
    // }

    function getMainData(tahun, mode) {
        const y = mainSeries[String(tahun)] || mainSeries["2024"];
        if (!y) return Array(12).fill(0);

        let arr;
        if (mode === "yoy") arr = y.yoy;
        else if (mode === "ytd") arr = y.ytd;
        else arr = y.mtm; // default mtm

        // pastikan selalu 12 bulan
        arr = Array.isArray(arr) ? arr.slice(0, 12) : [];
        while (arr.length < 12) arr.push(0);
        return arr;
    }


    // ---------- Helpers ----------
    const fmtID = (n, digits = 2) => {
        // format 1.23 -> "1,23"
        const v = Number(n);
        if (Number.isNaN(v)) return "0,00";
        return v.toFixed(digits).replace(".", ",");
    };

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    // ---------- Dummy data ----------
    // main inflation: 12 bulan
    const mainSeries = {
        "2022": {
            mtm: [0.30, 0.25, 0.10, 0.55, 0.40, 0.22, 0.18, 0.35, 0.12, 0.09, 0.21, 0.32],
            yoy: [5.20, 5.10, 4.85, 4.60, 4.10, 3.85, 3.55, 3.40, 3.10, 2.95, 2.80, 2.75],
            ytd: [0.30, 0.45, 0.55, 1.10, 1.50, 1.72, 1.90, 2.25, 2.38, 2.47, 2.68, 3.05],
        },
        "2023": {
            mtm: [0.15, 0.12, 0.08, 0.40, 0.32, 0.18, 0.15, 0.27, 0.10, 0.06, 0.14, 0.22],
            yoy: [4.85, 4.60, 4.20, 3.90, 3.60, 3.30, 3.10, 2.95, 2.70, 2.60, 2.55, 2.50],
            ytd: [0.28, 0.40, 0.48, 0.88, 1.20, 1.38, 1.53, 1.80, 1.90, 1.96, 2.10, 2.35],
        },
        "2024": {
            mtm: [0.21, 0.10, 0.05, 0.38, 0.29, 0.16, 0.12, 0.24, 0.08, 0.04, 0.11, 0.19],
            yoy: [3.10, 3.00, 2.90, 2.80, 2.70, 2.60, 2.55, 2.50, 2.45, 2.40, 2.38, 2.35],
            ytd: [0.22, 0.32, 0.37, 0.75, 1.04, 1.20, 1.32, 1.56, 1.64, 1.68, 1.79, 1.98],
        },
    };

    // komoditas inflasi/deflasi
    // struktur: byRegion[type][year][month][region] -> {labels:[], values:[]}
    const commodities = {
        inflasi: {},
        deflasi: {},
    };

    function seedCommodity(type, year, month, region, labels, values) {
        if (!commodities[type]) commodities[type] = {};
        if (!commodities[type][year]) commodities[type][year] = {};
        if (!commodities[type][year][month]) commodities[type][year][month] = {};

        commodities[type][year][month][region] = {
            labels,
            values
        };
    }

    // Seed sample: 2024 Des (12) beberapa wilayah
    const sampleLabelsInfl = ["Beras", "Cabai Rawit", "Telur Ayam", "Daging Ayam", "Bawang Merah", "Tarif Listrik", "Emas Perhiasan"];
    const sampleLabelsDef = ["Cabai Merah", "Tomat", "Bawang Putih", "Ikan Segar", "Bensin", "Angkutan Udara", "Gula Pasir"];

    const regions = ["JATIM", "SURABAYA", "MALANG", "KEDIRI", "MADIUN", "JEMBER"];

    regions.forEach((r, i) => {
        // inflasi
        seedCommodity(
            "inflasi",
            "2024",
            12,
            r,
            sampleLabelsInfl,
            [0.18, 0.12, 0.10, 0.09, 0.08, 0.06, 0.05].map(v => +(v * (1 + i * 0.08)).toFixed(3))
        );
        // deflasi (nilai negatif)
        seedCommodity(
            "deflasi",
            "2024",
            12,
            r,
            sampleLabelsDef,
            [-0.16, -0.11, -0.09, -0.07, -0.06, -0.05, -0.04].map(v => +(v * (1 + i * 0.06)).toFixed(3))
        );
    });

    // Jatim default (kalau wilayah kosong)
    seedCommodity("inflasi", "2024", 12, "DEFAULT", sampleLabelsInfl, [0.20, 0.14, 0.11, 0.10, 0.09, 0.07, 0.06]);
    seedCommodity("deflasi", "2024", 12, "DEFAULT", sampleLabelsDef, [-0.18, -0.12, -0.10, -0.08, -0.07, -0.06, -0.05]);

    // ---------- Charts ----------
    let cMain, cInflW, cInflJ, cDefW, cDefJ;

    function destroyChart(ch) {
        if (ch && typeof ch.destroy === "function") ch.destroy();
    }

    function makeLineChart(ctx, labels, data) {
        return new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Inflasi",
                    data,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderWidth: 3,
                    fill: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (t) => ` ${fmtID(t.parsed.y)}%`,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: "rgba(255,255,255,.70)",
                            font: {
                                weight: "600"
                            }
                        },
                        grid: {
                            color: "rgba(255,255,255,.08)"
                        },
                    },
                    y: {
                        ticks: {
                            color: "rgba(255,255,255,.70)",
                            callback: (v) => `${v}%`,
                        },
                        grid: {
                            color: "rgba(255,255,255,.08)"
                        },
                    },
                },
            },
        });
    }

    function makeBarChart(ctx, labels, data, isNegative = false) {
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Kontribusi",
                    data,
                    borderWidth: 0,
                    borderRadius: 10,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (t) => ` ${fmtID(t.parsed.y, 3)}${isNegative ? "" : ""}`,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: "rgba(255,255,255,.70)",
                            font: {
                                weight: "700"
                            }
                        },
                        grid: {
                            color: "rgba(255,255,255,.08)"
                        },
                    },
                    y: {
                        ticks: {
                            color: "rgba(255,255,255,.70)",
                            callback: (v) => fmtID(v, 2),
                        },
                        grid: {
                            color: "rgba(255,255,255,.08)"
                        },
                    },
                },
            },
        });
    }

    // ---------- Select2 init ----------
    function initSelects() {
        // Tahun, Bulan, Mode: no search
        $("#fTahun, #fBulan, #fMode").select2({
            minimumResultsForSearch: Infinity,
            width: "100%",
            dropdownAutoWidth: false,
        });

        // Wilayah: searchable
        $("#fWilayah").select2({
            placeholder: "Pilih Wilayah",
            allowClear: false,
            minimumResultsForSearch: 0,
            width: "100%",
            dropdownAutoWidth: false,
        });

        // set search placeholder on open (biar rapi)
        $("#fWilayah").on("select2:open", function () {
            const searchField = document.querySelector(".select2-container--open .select2-search__field");
            if (searchField) searchField.setAttribute("placeholder", "Cari wilayah...");
        });
    }

    // ---------- Data getters ----------
    function getState() {
        const tahun = String($("#fTahun").val() || "2024");
        const bulan = Number($("#fBulan").val() || 12);
        const mode = String($("#fMode").val() || "mtm");
        const wilayah = String($("#fWilayah").val() || "").trim(); // bisa kosong
        return {
            tahun,
            bulan,
            mode,
            wilayah
        };
    }

    function getCommodity(type, tahun, bulan, wilayah) {
        const typeObj = commodities[type];
        if (!typeObj) return {
            labels: ["(data kosong)"],
            values: [0]
        };

        const y = typeObj[tahun];
        if (!y) return {
            labels: ["(data kosong)"],
            values: [0]
        };

        const m = y[bulan];
        if (!m) return {
            labels: ["(data kosong)"],
            values: [0]
        };

        // prioritas: wilayah terpilih -> DEFAULT
        if (wilayah && m[wilayah]) return m[wilayah];
        if (m["DEFAULT"]) return m["DEFAULT"];

        return {
            labels: ["(data kosong)"],
            values: [0]
        };
    }


    // ---------- Render / Update ----------
    function updateKPI(state) {
        const series = getMainData(state.tahun, state.mode);
        const idx = Math.max(0, Math.min(11, state.bulan - 1));
        const val = series[idx];

        // dummy IHK: base 100 + akumulasi kecil
        const ihk = 100 + (idx * 0.25) + (state.tahun === "2024" ? 1.2 : state.tahun === "2023" ? 0.8 : 0.4);

        $("#kpiInflasi").text(fmtID(val, 2));
        $("#kpiIHK").text(fmtID(ihk, 1));
        $("#kpiWilayah").text(state.wilayah ? state.wilayah : "JATIM");
        $("#mainChip").text(`${state.wilayah} • ${state.tahun} • ${state.mode.toUpperCase()}`);
    }

    function renderAll() {
        const state = getState();
        updateKPI(state);

        // MAIN CHART
        const mainData = getMainData(state.tahun, state.mode);
        destroyChart(cMain);
        cMain = makeLineChart(document.getElementById("chartMainInflasi"), monthLabels, mainData);

        // Commodity charts
        const regionKey = state.wilayah ? state.wilayah : "DEFAULT";

        const inflW = getCommodity("inflasi", state.tahun, state.bulan, state.wilayah);
        const inflJ = getCommodity("inflasi", state.tahun, state.bulan, "JATIM"); // kanan: jatim
        const defW = getCommodity("deflasi", state.tahun, state.bulan, state.wilayah);
        const defJ = getCommodity("deflasi", state.tahun, state.bulan, "JATIM");

        $("#chipInflasiWilayah").text(state.wilayah ? state.wilayah : "Wilayah (fallback Jatim)");
        $("#chipDeflasiWilayah").text(state.wilayah ? state.wilayah : "Wilayah (fallback Jatim)");

        destroyChart(cInflW);
        destroyChart(cInflJ);
        destroyChart(cDefW);
        destroyChart(cDefJ);

        cInflW = makeBarChart(document.getElementById("chartInflasiWilayah"), inflW.labels, inflW.values, false);
        cInflJ = makeBarChart(document.getElementById("chartInflasiJatim"), inflJ.labels, inflJ.values, false);

        cDefW = makeBarChart(document.getElementById("chartDeflasiWilayah"), defW.labels, defW.values, true);
        cDefJ = makeBarChart(document.getElementById("chartDeflasiJatim"), defJ.labels, defJ.values, true);
    }

    function bindEvents() {
        $("#fTahun, #fBulan, #fWilayah, #fMode").on("change", function () {
            renderAll();
        });
    }

    // ---------- Boot ----------
    $(function () {
        // Safe guard if Chart not loaded
        if (typeof Chart === "undefined") {
            console.error("Chart.js belum ter-load. Pastikan CDN Chart.js ada di halaman.");
            return;
        }

        initSelects();
        bindEvents();
        renderAll();
    });

})();