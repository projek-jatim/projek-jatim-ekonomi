/* =========================
   EPIK - JS (FULL REPLACEMENT)
   Dependencies:
   - jQuery
   - Select2
   - Chart.js (umd)
   ========================= */

(function () {
    "use strict";

    // ---------- Helpers ----------
    function rupiah(n) {
        var v = Number(n);
        if (Number.isNaN(v)) return "0";
        return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function kg(n) {
        var v = Number(n);
        if (Number.isNaN(v)) return "0";
        return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function fmtTanggalID(iso) {
        if (!iso) return "-";
        var parts = String(iso).split("-");
        if (parts.length !== 3) return String(iso);

        var y = Number(parts[0]);
        var m = Number(parts[1]);
        var d = Number(parts[2]);
        var bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        var bi = (m || 1) - 1;
        if (bi < 0) bi = 0;
        if (bi > 11) bi = 11;
        return d + " " + bulan[bi] + " " + y;
    }

    function uniq(arr) {
        var out = [];
        var seen = {};
        for (var i = 0; i < arr.length; i++) {
            var k = String(arr[i]);
            if (!seen[k]) {
                seen[k] = true;
                out.push(arr[i]);
            }
        }
        return out;
    }

    // ---------- Dummy Data (struktur siap diganti API) ----------
    // prices[date][region] -> array komoditas
    var prices = {
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
                }
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
                }
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
                }
            ]
        }
    };

    // stock[date][region] -> items (corp + komoditas)
    var stock = {
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
                }
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
                }
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
                }
            ]
        }
    };

    var locations = [{
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
        }
    ];

    var schedule = [{
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
        }
    ];

    // ---------- Chart (Harga) ----------
    var cHarga = null;
    var cStock = null;

    var valueLabelPlugin = {
        id: "valueLabelPlugin",
        afterDatasetsDraw: function (chart) {
            var ctx = chart.ctx;
            ctx.save();
            ctx.font = "700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
            ctx.fillStyle = "rgba(255,255,255,.85)";

            for (var di = 0; di < chart.data.datasets.length; di++) {
                var ds = chart.data.datasets[di];
                var meta = chart.getDatasetMeta(di);
                for (var i = 0; i < meta.data.length; i++) {
                    var bar = meta.data[i];
                    var val = ds.data[i];
                    if (val == null) continue;

                    var x = bar.x + 8;
                    var y = bar.y + 4;
                    ctx.fillText(rupiah(val), x, y);
                }
            }

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
                labels: labels,
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
                            label: function (t) {
                                return " " + t.dataset.label + ": Rp " + rupiah(t.parsed.x) + "/Kg";
                            }
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

    // ---------- Stok: View Mode ----------
    // "highlight" = treemap DOM (yang sekarang)
    // "analytic"  = stacked bar chart (skalabel)
    var stockViewMode = "highlight";

    function hasEl(id) {
        return !!document.getElementById(id);
    }

    function setStockView(mode) {
        stockViewMode = mode === "analytic" ? "analytic" : "highlight";

        // tombol (jika ada)
        var btnH = document.getElementById("btnStockHighlight");
        var btnA = document.getElementById("btnStockAnalytic");
        if (btnH && btnA) {
            if (stockViewMode === "analytic") {
                btnH.classList.remove("is-active");
                btnA.classList.add("is-active");
            } else {
                btnA.classList.remove("is-active");
                btnH.classList.add("is-active");
            }
        }

        // panel (jika ada)
        var viewH = document.getElementById("stockViewHighlight");
        var viewA = document.getElementById("stockViewAnalytic");
        if (viewH && viewA) {
            if (stockViewMode === "analytic") {
                viewH.style.display = "none";
                viewA.style.display = "block";
            } else {
                viewA.style.display = "none";
                viewH.style.display = "block";
            }
        }

        renderAll();
    }

    function bindStockToggleIfExists() {
        var btnH = document.getElementById("btnStockHighlight");
        var btnA = document.getElementById("btnStockAnalytic");
        if (btnH && btnA) {
            btnH.addEventListener("click", function () {
                setStockView("highlight");
            });
            btnA.addEventListener("click", function () {
                setStockView("analytic");
            });
        }
    }

    // ---------- Treemap (custom DOM) ----------
    function renderTreemap(container, items, corpFilter) {
        container.innerHTML = "";

        var filtered = Array.isArray(items) ? items.slice() : [];
        if (corpFilter && corpFilter !== "ALL") {
            filtered = filtered.filter(function (x) {
                return x.corp === corpFilter;
            });
        }

        // group by corp (dinamis, bukan cuma A/B/C)
        var byCorp = {};
        for (var i = 0; i < filtered.length; i++) {
            var c = String(filtered[i].corp || "UNK");
            if (!byCorp[c]) byCorp[c] = [];
            byCorp[c].push(filtered[i]);
        }

        var corpKeys = Object.keys(byCorp);
        // urutkan biar stabil: A, B, C, ... lalu lainnya
        corpKeys.sort(function (a, b) {
            if (a === "A") return -1;
            if (b === "A") return 1;
            if (a === "B") return -1;
            if (b === "B") return 1;
            if (a === "C") return -1;
            if (b === "C") return 1;
            return a.localeCompare(b);
        });

        // total per corp
        var corpTotals = [];
        var grand = 0;
        for (var k = 0; k < corpKeys.length; k++) {
            var key = corpKeys[k];
            var tot = 0;
            for (var j = 0; j < byCorp[key].length; j++) {
                tot += Number(byCorp[key][j].value || 0);
            }
            corpTotals.push({
                corp: key,
                total: tot
            });
            grand += tot;
        }
        if (grand <= 0) grand = 1;

        // render columns
        for (var ci = 0; ci < corpTotals.length; ci++) {
            var corp = corpTotals[ci].corp;
            var total = corpTotals[ci].total;
            if (total <= 0) continue;

            var col = document.createElement("div");
            col.className = "tm-col";
            col.style.flex = String(Math.max(0.6, (total / grand) * 3));

            var head = document.createElement("div");
            head.className = "tm-col-head";
            head.textContent = "Korporasi " + corp;
            col.appendChild(head);

            var stack = document.createElement("div");
            stack.className = "tm-stack";
            stack.style.flexDirection = "column";

            var list = byCorp[corp].slice().sort(function (a, b) {
                return (Number(b.value || 0) - Number(a.value || 0));
            });

            if (list.length >= 2) {
                var row = document.createElement("div");
                row.className = "tm-stack";
                row.style.flexDirection = "row";
                row.style.flex = "1";

                var a = list[0];
                var b = list[1];
                row.appendChild(makeTMBox(corp, a, a.value));
                row.appendChild(makeTMBox(corp, b, b.value));
                stack.appendChild(row);

                for (var t = 2; t < list.length; t++) {
                    stack.appendChild(makeTMBox(corp, list[t], list[t].value));
                }
            } else if (list.length === 1) {
                stack.appendChild(makeTMBox(corp, list[0], list[0].value));
            }

            // flex per box
            var allBoxes = stack.querySelectorAll(".tm-box");
            for (var bi = 0; bi < allBoxes.length; bi++) {
                var box = allBoxes[bi];
                var v = Number(box.getAttribute("data-val") || 1);
                box.style.flex = String(Math.max(0.6, (v / total) * 6));
            }

            col.appendChild(stack);
            container.appendChild(col);
        }

        if (!container.children.length) {
            var empty = document.createElement("div");
            empty.className = "tm-box corp-c";
            empty.style.width = "100%";
            empty.style.height = "100%";
            empty.innerHTML = '<div class="tm-name">(data stok kosong)</div>';
            container.appendChild(empty);
        }
    }

    function makeTMBox(corp, item, val) {
        var box = document.createElement("div");
        var corpClass = "corp-" + String(corp).toLowerCase();
        box.className = "tm-box " + corpClass;
        box.setAttribute("data-val", String(val || 1));

        var name = document.createElement("div");
        name.className = "tm-name";
        name.textContent = item.name || "-";

        var v = document.createElement("div");
        v.className = "tm-val";
        v.textContent = kg(val) + " Kg";

        box.appendChild(name);
        box.appendChild(v);
        return box;
    }

    // ---------- Stock Chart: Stacked Horizontal Bar ----------
    function buildStockMatrix(items, corpFilter) {
        // items: [{corp, name, value}]
        var rows = Array.isArray(items) ? items.slice() : [];

        // filter korp (kalau corpFilter bukan ALL)
        if (corpFilter && corpFilter !== "ALL") {
            rows = rows.filter(function (x) {
                return String(x.corp) === String(corpFilter);
            });
        }

        // labels = unique commodity names
        var names = [];
        for (var i = 0; i < rows.length; i++) names.push(rows[i].name || "-");
        var labels = uniq(names);

        // corps = unique corp keys
        var corps = [];
        for (var j = 0; j < rows.length; j++) corps.push(String(rows[j].corp || "UNK"));
        corps = uniq(corps);
        corps.sort(function (a, b) {
            // stable order A,B,C lalu lainnya
            if (a === "A") return -1;
            if (b === "A") return 1;
            if (a === "B") return -1;
            if (b === "B") return 1;
            if (a === "C") return -1;
            if (b === "C") return 1;
            return a.localeCompare(b);
        });

        // make lookup: corp -> name -> value
        var map = {};
        for (var r = 0; r < rows.length; r++) {
            var c = String(rows[r].corp || "UNK");
            var nm = String(rows[r].name || "-");
            var val = Number(rows[r].value || 0);
            if (!map[c]) map[c] = {};
            map[c][nm] = (map[c][nm] || 0) + val;
        }

        // datasets per corp
        var palettes = [
            "rgba(190,120,255,.92)",
            "rgba(255,190,120,.92)",
            "rgba(180,255,120,.88)",
            "rgba(120,220,255,.90)",
            "rgba(255,120,200,.88)",
            "rgba(200,200,255,.90)",
            "rgba(255,255,140,.85)",
            "rgba(140,255,220,.85)"
        ];

        var datasets = [];
        for (var ci = 0; ci < corps.length; ci++) {
            var corp = corps[ci];
            var data = [];
            for (var li = 0; li < labels.length; li++) {
                var nm2 = labels[li];
                var v2 = (map[corp] && map[corp][nm2]) ? map[corp][nm2] : 0;
                data.push(v2);
            }
            datasets.push({
                label: "Korporasi " + corp,
                data: data,
                borderWidth: 0,
                borderRadius: 10,
                backgroundColor: palettes[ci % palettes.length]
            });
        }

        // sort labels by total desc supaya enak dibaca
        var totals = [];
        for (var li2 = 0; li2 < labels.length; li2++) {
            var sum = 0;
            for (var ds = 0; ds < datasets.length; ds++) sum += Number(datasets[ds].data[li2] || 0);
            totals.push({
                name: labels[li2],
                total: sum,
                idx: li2
            });
        }
        totals.sort(function (a, b) {
            return b.total - a.total;
        });

        var labelsSorted = [];
        var datasetsSorted = [];
        for (var dsi = 0; dsi < datasets.length; dsi++) {
            datasetsSorted.push({
                label: datasets[dsi].label,
                data: [],
                borderWidth: 0,
                borderRadius: datasets[dsi].borderRadius,
                backgroundColor: datasets[dsi].backgroundColor
            });
        }
        for (var ti = 0; ti < totals.length; ti++) {
            labelsSorted.push(totals[ti].name);
            for (var dsi2 = 0; dsi2 < datasets.length; dsi2++) {
                datasetsSorted[dsi2].data.push(datasets[dsi2].data[totals[ti].idx]);
            }
        }

        return {
            labels: labelsSorted,
            datasets: datasetsSorted
        };
    }

    function makeStockStackedChart(ctx, labels, datasets) {
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: datasets
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
                            label: function (t) {
                                return " " + t.dataset.label + ": " + kg(t.parsed.x) + " Kg";
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
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
                        stacked: true,
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
            }
        });
    }

    // ---------- State ----------
    function getState() {
        var tanggal = String($("#fTanggal").val() || "2026-01-22");
        var wilayah = String($("#fWilayah").val() || "JATIM");
        var korp = String($("#fKorporasi").val() || "ALL");
        var kom = String($("#fKomoditas").val() || "ALL");
        return {
            tanggal: tanggal,
            wilayah: wilayah,
            korp: korp,
            kom: kom
        };
    }

    // ---------- Render ----------
    function renderLocations() {
        var wrap = document.getElementById("locList");
        if (!wrap) return;
        wrap.innerHTML = "";
        for (var i = 0; i < locations.length; i++) {
            var x = locations[i];
            var div = document.createElement("div");
            div.className = "loc-item";
            div.innerHTML = '<div class="loc-name">' + x.name + '</div><div class="loc-sub">' + x.sub + "</div>";
            wrap.appendChild(div);
        }
    }

    function renderSchedule() {
        var body = document.getElementById("schedBody");
        if (!body) return;
        body.innerHTML = "";
        for (var i = 0; i < schedule.length; i++) {
            var x = schedule[i];
            var row = document.createElement("div");
            row.className = "sched-row";
            row.innerHTML =
                "<div>" + fmtTanggalID(x.date) + "</div>" +
                "<div>" + x.loc + "</div>" +
                "<div>" + x.focus + "</div>";
            body.appendChild(row);
        }
    }

    function renderAll() {
        var s = getState();

        // update chips/text (jika ada)
        if (hasEl("txtUpdate")) $("#txtUpdate").text(fmtTanggalID(s.tanggal));
        if (hasEl("chipHarga")) $("#chipHarga").text(s.wilayah + " • " + fmtTanggalID(s.tanggal));
        if (hasEl("chipStok")) $("#chipStok").text(s.wilayah);

        // ---- Harga data
        var day = prices[s.tanggal] || prices["2026-01-22"];
        var list = [];
        if (day && day[s.wilayah]) list = day[s.wilayah];
        else if (day && day["JATIM"]) list = day["JATIM"];

        var view = Array.isArray(list) ? list.slice() : [];
        if (s.kom !== "ALL") view = view.filter(function (x) {
            return x.key === s.kom;
        });

        if (!view.length && day && day["JATIM"]) view = day["JATIM"].slice();

        var labels = view.map(function (x) {
            return x.name;
        });
        var prod = view.map(function (x) {
            return x.prod;
        });
        var cons = view.map(function (x) {
            return x.cons;
        });

        var avgP = 0,
            avgC = 0;
        for (var i = 0; i < prod.length; i++) avgP += Number(prod[i] || 0);
        for (var j = 0; j < cons.length; j++) avgC += Number(cons[j] || 0);
        avgP = avgP / (prod.length || 1);
        avgC = avgC / (cons.length || 1);

        if (hasEl("kpiAvgProd")) $("#kpiAvgProd").text(rupiah(avgP));
        if (hasEl("kpiAvgCons")) $("#kpiAvgCons").text(rupiah(avgC));

        // chart harga
        if (hasEl("chartHarga")) {
            destroyChart(cHarga);
            cHarga = makeHargaChart(document.getElementById("chartHarga"), labels, prod, cons);
        }

        // ---- Stok data
        var dayS = stock[s.tanggal] || stock["2026-01-22"];
        var items = [];
        if (dayS && dayS[s.wilayah]) items = dayS[s.wilayah];
        else if (dayS && dayS["JATIM"]) items = dayS["JATIM"];
        if (!Array.isArray(items)) items = [];

        // filter komoditas (kalau dipilih)
        if (s.kom !== "ALL") {
            var mapKeyToName = {
                BERAS: /beras/i,
                CABAI_RAWIT: /rawit/i,
                CABAI_MERAH: /merah/i,
                DAGING_AYAM: /ayam/i,
                TELUR: /telur/i
            };
            var re = mapKeyToName[s.kom];
            if (re) items = items.filter(function (x) {
                return re.test(String(x.name || ""));
            });
        }

        // KPI total stok
        var totalStock = 0;
        for (var si = 0; si < items.length; si++) totalStock += Number(items[si].value || 0);
        if (hasEl("kpiStock")) $("#kpiStock").text(kg(totalStock));

        // Render stok sesuai mode
        if (stockViewMode === "analytic") {
            // stacked chart
            if (hasEl("chartStockStacked")) {
                var mat = buildStockMatrix(items, s.korp);
                destroyChart(cStock);
                cStock = makeStockStackedChart(document.getElementById("chartStockStacked"), mat.labels, mat.datasets);
            }
            // optional: kalau highlight container ada, tidak masalah—display diatur oleh CSS/HTML
        } else {
            // treemap highlight
            if (hasEl("stockTreemap")) {
                renderTreemap(document.getElementById("stockTreemap"), items, s.korp);
            }
        }
    }

    // ---------- Select2 init ----------
    function initSelects() {
        // korporasi & komoditas tanpa search
        $("#fKorporasi, #fKomoditas").select2({
            minimumResultsForSearch: Infinity,
            width: "100%",
            dropdownAutoWidth: false
        });

        // wilayah pakai search
        $("#fWilayah").select2({
            placeholder: "Pilih Wilayah",
            allowClear: false,
            minimumResultsForSearch: 0,
            width: "100%",
            dropdownAutoWidth: false
        });

        $("#fWilayah").on("select2:open", function () {
            var searchField = document.querySelector(".select2-container--open .select2-search__field");
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
        bindStockToggleIfExists();

        renderLocations();
        renderSchedule();
        renderAll();
    });

})();