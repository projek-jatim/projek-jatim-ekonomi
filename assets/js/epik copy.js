/* =========================
   EPIK - JS
   Dependencies:
   - jQuery
   - Select2
   - Chart.js (umd)
   ========================= */

(function () {
    "use strict";

    // ---------- Helpers ----------
    const rupiah = (n) => {
        const v = Number(n);
        if (Number.isNaN(v)) return "0";
        return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const kg = (n) => {
        const v = Number(n);
        if (Number.isNaN(v)) return "0";
        return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const fmtTanggalID = (iso) => {
        // "2026-01-22" -> "22 Januari 2026"
        if (!iso) return "-";
        const [y, m, d] = iso.split("-").map(Number);
        const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${d} ${bulan[(m || 1) - 1]} ${y}`;
    };

    // ---------- Dummy Data (struktur siap diganti API) ----------
    // prices[date][region] -> array komoditas
    const prices = {
        "2026-01-22": {
            JATIM: [{
                    key: "BERAS",
                    name: "Beras JATIM CETTAR",
                    prod: 13900,
                    cons: 14900
                },
                {
                    key: "CABAI_MERAH",
                    name: "Cabai Merah Besar",
                    prod: 22000,
                    cons: 24375
                },
                {
                    key: "CABAI_RAWIT",
                    name: "Cabai Rawit",
                    prod: 37500,
                    cons: 39644
                },
                {
                    key: "DAGING_AYAM",
                    name: "Daging Ayam Ras",
                    prod: 33000,
                    cons: 35875
                },
                {
                    key: "TELUR",
                    name: "Telur Ayam Ras",
                    prod: 26500,
                    cons: 27563
                },
            ],
            SURABAYA: [{
                    key: "BERAS",
                    name: "Beras Premium",
                    prod: 14200,
                    cons: 15250
                },
                {
                    key: "CABAI_MERAH",
                    name: "Cabai Merah Besar",
                    prod: 23500,
                    cons: 25800
                },
                {
                    key: "CABAI_RAWIT",
                    name: "Cabai Rawit",
                    prod: 39800,
                    cons: 42000
                },
                {
                    key: "DAGING_AYAM",
                    name: "Daging Ayam Ras",
                    prod: 34500,
                    cons: 37200
                },
                {
                    key: "TELUR",
                    name: "Telur Ayam Ras",
                    prod: 27000,
                    cons: 28200
                },
            ],
            MALANG: [{
                    key: "BERAS",
                    name: "Beras Medium",
                    prod: 13500,
                    cons: 14650
                },
                {
                    key: "CABAI_MERAH",
                    name: "Cabai Merah Besar",
                    prod: 21000,
                    cons: 23200
                },
                {
                    key: "CABAI_RAWIT",
                    name: "Cabai Rawit",
                    prod: 36000,
                    cons: 38200
                },
                {
                    key: "DAGING_AYAM",
                    name: "Daging Ayam Ras",
                    prod: 32500,
                    cons: 35200
                },
                {
                    key: "TELUR",
                    name: "Telur Ayam Ras",
                    prod: 26000,
                    cons: 27200
                },
            ],
        }
    };

    // stock[date][region] -> items per korporasi
    const stock = {
        "2026-01-22": {
            JATIM: [{
                    corp: "C",
                    name: "Telur Ayam Ras",
                    value: 18000
                },
                {
                    corp: "C",
                    name: "Daging Ayam Ras",
                    value: 15000
                },
                {
                    corp: "B",
                    name: "Cabai Rawit",
                    value: 9000
                },
                {
                    corp: "B",
                    name: "Cabai Merah Besar",
                    value: 6500
                },
                {
                    corp: "A",
                    name: "Beras JATIM CETTAR",
                    value: 22000
                },
            ],
            SURABAYA: [{
                    corp: "C",
                    name: "Telur Ayam Ras",
                    value: 9000
                },
                {
                    corp: "B",
                    name: "Cabai Rawit",
                    value: 5200
                },
                {
                    corp: "A",
                    name: "Beras Premium",
                    value: 14000
                },
            ],
            MALANG: [{
                    corp: "C",
                    name: "Daging Ayam Ras",
                    value: 8200
                },
                {
                    corp: "B",
                    name: "Cabai Merah Besar",
                    value: 4100
                },
                {
                    corp: "A",
                    name: "Beras Medium",
                    value: 12000
                },
            ]
        }
    };

    const locations = [{
            name: "EPIK Reguler Surabaya",
            sub: "Jl. Pahlawan No.110 • 08.00–12.00"
        },
        {
            name: "EPIK Reguler Malang",
            sub: "Jl. Ijen • 08.00–12.00"
        },
        {
            name: "EPIK Reguler Kediri",
            sub: "Alun-alun • 08.00–12.00"
        },
        {
            name: "EPIK Reguler Jember",
            sub: "Kawasan kota • 08.00–12.00"
        },
    ];

    const schedule = [{
            date: "2026-01-23",
            loc: "Kota Surabaya",
            focus: "Beras, Cabai"
        },
        {
            date: "2026-01-24",
            loc: "Kota Malang",
            focus: "Telur, Ayam"
        },
        {
            date: "2026-01-25",
            loc: "Kab. Jember",
            focus: "Cabai, Bawang"
        },
        {
            date: "2026-01-26",
            loc: "Kab. Gresik",
            focus: "Beras, Minyak"
        },
    ];

    // ---------- Chart (Harga) ----------
    let cHarga = null;

    const valueLabelPlugin = {
        id: "valueLabelPlugin",
        afterDatasetsDraw(chart) {
            const {
                ctx
            } = chart;
            ctx.save();
            ctx.font = "700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
            ctx.fillStyle = "rgba(255,255,255,.85)";

            chart.data.datasets.forEach((ds, di) => {
                const meta = chart.getDatasetMeta(di);
                meta.data.forEach((bar, i) => {
                    const val = ds.data[i];
                    if (val == null) return;

                    // pos di ujung bar
                    const x = bar.x + 8;
                    const y = bar.y + 4;

                    ctx.fillText(rupiah(val), x, y);
                });
            });

            ctx.restore();
        }
    };

    function destroyChart(ch) {
        if (ch && typeof ch.destroy === "function") ch.destroy();
    }

    function makeHargaChart(ctx, labels, prod, cons) {
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                        label: "Harga Produsen",
                        data: prod,
                        borderWidth: 0,
                        borderRadius: 10,
                        backgroundColor: "rgba(255, 215, 120, .95)"
                    },
                    {
                        label: "Harga Konsumen",
                        data: cons,
                        borderWidth: 0,
                        borderRadius: 10,
                        backgroundColor: "rgba(220, 220, 255, .90)"
                    }
                ]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: "rgba(255,255,255,.78)",
                            font: {
                                weight: "800"
                            },
                            usePointStyle: true,
                            pointStyle: "circle"
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (t) => ` ${t.dataset.label}: Rp ${rupiah(t.parsed.x)}/Kg`
                        }
                    }
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
                        }
                    },
                    y: {
                        ticks: {
                            color: "rgba(255,255,255,.70)",
                            font: {
                                weight: "800"
                            }
                        },
                        grid: {
                            color: "rgba(255,255,255,.08)"
                        }
                    }
                }
            },
            plugins: [valueLabelPlugin]
        });
    }

    // ---------- Treemap (custom DOM) ----------
    function renderTreemap(container, items, corpFilter) {
        container.innerHTML = "";

        let filtered = Array.isArray(items) ? items.slice() : [];
        if (corpFilter && corpFilter !== "ALL") {
            filtered = filtered.filter(x => x.corp === corpFilter);
        }

        // group by corp
        const byCorp = {
            A: [],
            B: [],
            C: []
        };
        filtered.forEach(it => {
            if (byCorp[it.corp]) byCorp[it.corp].push(it);
        });

        // total per corp -> width prop
        const corpTotals = ["C", "B", "A"].map(c => ({
            corp: c,
            total: byCorp[c].reduce((s, x) => s + (x.value || 0), 0)
        }));
        const grand = corpTotals.reduce((s, x) => s + x.total, 0) || 1;

        corpTotals.forEach(({
            corp,
            total
        }) => {
            if (total <= 0) return;

            const col = document.createElement("div");
            col.className = "tm-col";
            col.style.flex = String(Math.max(0.6, total / grand * 3)); // biar proporsional tapi tidak terlalu kecil

            const head = document.createElement("div");
            head.className = "tm-col-head";
            head.textContent = `Korporasi ${corp}`;
            col.appendChild(head);

            const stack = document.createElement("div");
            stack.className = "tm-stack";
            stack.style.flexDirection = "column";

            // layout: kalau >2 item, buat baris pertama 2 item (side-by-side), sisanya stack
            const list = byCorp[corp].slice().sort((a, b) => (b.value || 0) - (a.value || 0));
            if (list.length >= 2) {
                const row = document.createElement("div");
                row.className = "tm-stack";
                row.style.flexDirection = "row";
                row.style.flex = "1";

                const a = list[0],
                    b = list[1];
                row.appendChild(makeTMBox(corp, a, a.value));
                row.appendChild(makeTMBox(corp, b, b.value));
                stack.appendChild(row);

                // sisanya vertikal
                for (let i = 2; i < list.length; i++) {
                    stack.appendChild(makeTMBox(corp, list[i], list[i].value));
                }
            } else if (list.length === 1) {
                stack.appendChild(makeTMBox(corp, list[0], list[0].value));
            }

            // set flex-grow per box sesuai value (biar “treemap feel”)
            const allBoxes = stack.querySelectorAll(".tm-box");
            allBoxes.forEach((box) => {
                const v = Number(box.getAttribute("data-val") || 1);
                box.style.flex = String(Math.max(0.6, v / total * 6));
            });

            col.appendChild(stack);
            container.appendChild(col);
        });

        // jika kosong
        if (!container.children.length) {
            const empty = document.createElement("div");
            empty.className = "tm-box corp-c";
            empty.style.width = "100%";
            empty.style.height = "100%";
            empty.innerHTML = `<div class="tm-name">(data stok kosong)</div>`;
            container.appendChild(empty);
        }
    }

    function makeTMBox(corp, item, val) {
        const box = document.createElement("div");
        box.className = `tm-box corp-${corp.toLowerCase()}`;
        box.setAttribute("data-val", String(val || 1));

        const name = document.createElement("div");
        name.className = "tm-name";
        name.textContent = item.name || "-";

        const v = document.createElement("div");
        v.className = "tm-val";
        v.textContent = `${kg(val)} Kg`;

        box.appendChild(name);
        box.appendChild(v);
        return box;
    }

    // ---------- State ----------
    function getState() {
        const tanggal = String($("#fTanggal").val() || "2026-01-22");
        const wilayah = String($("#fWilayah").val() || "JATIM");
        const korp = String($("#fKorporasi").val() || "ALL");
        const kom = String($("#fKomoditas").val() || "ALL");
        return {
            tanggal,
            wilayah,
            korp,
            kom
        };
    }

    // ---------- Render ----------
    function renderLocations() {
        const wrap = document.getElementById("locList");
        wrap.innerHTML = "";
        locations.forEach((x) => {
            const div = document.createElement("div");
            div.className = "loc-item";
            div.innerHTML = `<div class="loc-name">${x.name}</div><div class="loc-sub">${x.sub}</div>`;
            wrap.appendChild(div);
        });
    }

    function renderSchedule() {
        const body = document.getElementById("schedBody");
        body.innerHTML = "";
        schedule.forEach((x) => {
            const row = document.createElement("div");
            row.className = "sched-row";
            row.innerHTML = `
        <div>${fmtTanggalID(x.date)}</div>
        <div>${x.loc}</div>
        <div>${x.focus}</div>
      `;
            body.appendChild(row);
        });
    }

    function renderAll() {
        const s = getState();

        // update text
        $("#txtUpdate").text(fmtTanggalID(s.tanggal));
        $("#chipHarga").text(`${s.wilayah} • ${fmtTanggalID(s.tanggal)}`);
        $("#chipStok").text(s.wilayah);

        // ---- Harga data
        const day = prices[s.tanggal] || prices["2026-01-22"];
        const list = (day && day[s.wilayah]) ? day[s.wilayah] : (day ? day["JATIM"] : []);

        let view = Array.isArray(list) ? list.slice() : [];
        if (s.kom !== "ALL") view = view.filter(x => x.key === s.kom);

        // fallback kalau kosong
        if (!view.length) view = (day && day["JATIM"]) ? day["JATIM"].slice() : [];

        const labels = view.map(x => x.name);
        const prod = view.map(x => x.prod);
        const cons = view.map(x => x.cons);

        // KPI avg harga
        const avgP = prod.reduce((a, b) => a + b, 0) / (prod.length || 1);
        const avgC = cons.reduce((a, b) => a + b, 0) / (cons.length || 1);
        $("#kpiAvgProd").text(rupiah(avgP));
        $("#kpiAvgCons").text(rupiah(avgC));

        // chart harga
        destroyChart(cHarga);
        cHarga = makeHargaChart(document.getElementById("chartHarga"), labels, prod, cons);

        // ---- Stok data
        const dayS = stock[s.tanggal] || stock["2026-01-22"];
        let items = (dayS && dayS[s.wilayah]) ? dayS[s.wilayah] : (dayS ? dayS["JATIM"] : []);
        if (!Array.isArray(items)) items = [];

        // filter komoditas (jika dipilih)
        if (s.kom !== "ALL") {
            const mapKeyToName = {
                BERAS: /beras/i,
                CABAI_RAWIT: /rawit/i,
                CABAI_MERAH: /merah/i,
                DAGING_AYAM: /ayam/i,
                TELUR: /telur/i
            };
            const re = mapKeyToName[s.kom];
            if (re) items = items.filter(x => re.test(x.name || ""));
        }

        // KPI total stok (setelah filter komoditas, sebelum filter korporasi biar feel “wilayah”)
        const totalStock = items.reduce((a, b) => a + (b.value || 0), 0);
        $("#kpiStock").text(kg(totalStock));

        // treemap (filter korporasi)
        renderTreemap(document.getElementById("stockTreemap"), items, s.korp);
    }

    // ---------- Select2 init ----------
    function initSelects() {
        $("#fKorporasi, #fKomoditas").select2({
            minimumResultsForSearch: Infinity,
            width: "100%",
            dropdownAutoWidth: false
        });

        $("#fWilayah").select2({
            placeholder: "Pilih Wilayah",
            allowClear: false,
            minimumResultsForSearch: 0,
            width: "100%",
            dropdownAutoWidth: false
        });

        $("#fWilayah").on("select2:open", function () {
            const searchField = document.querySelector(".select2-container--open .select2-search__field");
            if (searchField) searchField.setAttribute("placeholder", "Cari wilayah...");
        });
    }

    function bindEvents() {
        $("#fTanggal, #fWilayah, #fKorporasi, #fKomoditas").on("change", renderAll);
    }

    // ---------- Boot ----------
    $(function () {
        if (typeof Chart === "undefined") {
            console.error("Chart.js belum ter-load. Pastikan CDN Chart.js ada di halaman.");
            return;
        }

        initSelects();
        bindEvents();
        renderLocations();
        renderSchedule();
        renderAll();
    });

})();
