// powered by Israel-GPT

let nextStationId = 0;
let stations = [];
let sortField = 'rp';
let sortDir = 'asc';

document.addEventListener("DOMContentLoaded", () => {
    renderStations();
    recalcAll();

    document.getElementById("currentRP").oninput = recalcAll;
    document.getElementById("targetRP").oninput = recalcAll;

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".sort-wrap")) {
            document.querySelectorAll(".sort-dropdown").forEach(d => d.classList.remove("show"));
        }
        document.querySelectorAll(".options").forEach(opt => {
            if (!opt.parentElement.contains(e.target)) {
                opt.classList.remove("show");
            }
        });
    });
});

// ── Sort controls ──────────────────────────────────────────────

function toggleSortDropdown(id) {
    const all = ["sortDrop", "dirDrop"];
    all.forEach(d => {
        if (d !== id) document.getElementById(d).classList.remove("show");
    });
    document.getElementById(id).classList.toggle("show");
}

function setSortField(val, el) {
    sortField = val;
    el.closest(".sort-dropdown").querySelectorAll(".sort-opt").forEach(o => {
        o.querySelector(".check").textContent = " ";
        o.classList.remove("selected");
    });
    el.querySelector(".check").textContent = "✓";
    el.classList.add("selected");
    const labels = { rp: "RP", money: "Money", name: "Name" };
    document.getElementById("sortFieldBtn").textContent = "Sort: " + labels[val] + " ▾";
    document.getElementById("sortDrop").classList.remove("show");
    renderStations();
}

function setSortDir(val, el) {
    sortDir = val;
    el.closest(".sort-dropdown").querySelectorAll(".sort-opt").forEach(o => {
        o.querySelector(".check").textContent = " ";
        o.classList.remove("selected");
    });
    el.querySelector(".check").textContent = "✓";
    el.classList.add("selected");
    const labels = { asc: "↑ ASC", desc: "↓ DESC" };
    document.getElementById("sortDirBtn").textContent = labels[val] + " ▾";
    document.getElementById("dirDrop").classList.remove("show");
    renderStations();
}

function getSortedItems() {
    const entries = Object.entries(items);
    entries.sort((a, b) => {
        let av, bv;
        if (sortField === "rp")         { av = a[1].rp;    bv = b[1].rp; }
        else if (sortField === "money") { av = a[1].money; bv = b[1].money; }
        else                            { av = a[0];       bv = b[0]; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ?  1 : -1;
        return 0;
    });
    return entries;
}

// ── Station management ─────────────────────────────────────────

function addStation() {
    stations.push({
        id: nextStationId++,
        tier: "4",
        count: 1,
        items: [],
        circuitDelay: 4
    });
    renderStations();
    recalcAll();
}

function adjustItemsForTier(s) {
    if (s.tier === "1") {
        s.items = [];
    } else if (s.tier === "2" || s.tier === "SDC") {
        s.items = [s.items[0] || null];
    } else if (s.tier === "3" || s.tier === "4") {
        s.items = [
            s.items[0] || null,
            s.items[1] || null
        ];
    }
}

// ── Render stations ────────────────────────────────────────────

function renderStations() {
    const container = document.getElementById("stations");
    container.innerHTML = "";

    stations.forEach((s) => {
        adjustItemsForTier(s);

        const template = document.getElementById("station-template");
        const stationEl = template.content.cloneNode(true);

        // TIER
        const tierSelect = stationEl.querySelector(".tier");
        tierSelect.innerHTML = "";
        ["1","2","3","4","SDC"].forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t === "SDC" ? "SDC" : "Tier " + t;
            if (t === s.tier) opt.selected = true;
            tierSelect.appendChild(opt);
        });
        tierSelect.onchange = () => {
            s.tier = tierSelect.value;
            renderStations();
            recalcAll();
        };

        // COUNT
        const countInput = stationEl.querySelector(".count");
        countInput.value = s.count;
        countInput.oninput = () => {
            s.count = Number(countInput.value);
            recalcAll();
        };

        // ITEMS
        const itemsContainer = stationEl.querySelector(".items");
        itemsContainer.innerHTML = "";

        s.items.forEach((itemValue, idx) => {
            const dropdown = document.createElement("div");
            dropdown.className = "itemDropdown";

            const label = document.createElement("label");
            label.className = "field-label";
            label.textContent = "Item " + (idx + 1);
            dropdown.appendChild(label);

            const selectedDiv = document.createElement("div");
            selectedDiv.className = "selected";
            dropdown.appendChild(selectedDiv);

            const optionsDiv = document.createElement("div");
            optionsDiv.className = "options";
            dropdown.appendChild(optionsDiv);

            // (None) option
            const noneOpt = document.createElement("div");
            noneOpt.className = "option";
            noneOpt.innerHTML = `<div class="optionLeft"><span>(None)</span></div><div class="optionRight"></div>`;
            noneOpt.onclick = (e) => {
                e.stopPropagation();
                s.items[idx] = null;
                renderStations();
                recalcAll();
            };
            optionsDiv.appendChild(noneOpt);

            // item options sorted by current sort settings
            getSortedItems().forEach(([itemName, data]) => {
                const opt = document.createElement("div");
                opt.className = "option";

                const left = document.createElement("div");
                left.className = "optionLeft";
                const img = document.createElement("img");
                img.src = data.icon !== "undefined" ? data.icon : "";
                img.className = "icon";
                const name = document.createElement("span");
                name.textContent = itemName;
                left.appendChild(img);
                left.appendChild(name);

                const right = document.createElement("div");
                right.className = "optionRight";
                const rp = document.createElement("span");
                rp.className = "rp";
                rp.textContent = data.rp + "rp";
                const money = document.createElement("span");
                money.className = "money";
                money.textContent = "$" + formatMoney(data.money);
                right.appendChild(rp);
                right.appendChild(money);

                opt.appendChild(left);
                opt.appendChild(right);

                opt.onclick = (e) => {
                    e.stopPropagation();
                    s.items[idx] = itemName;
                    renderStations();
                    recalcAll();
                };

                optionsDiv.appendChild(opt);
            });

            // show selected item
            if (itemValue && items[itemValue]) {
                const d = items[itemValue];
                const icon = d.icon !== "undefined" ? `<img src="${d.icon}" class="icon">` : "";
                selectedDiv.innerHTML = `
                    ${icon}
                    <span class="item-name">${itemValue}</span>
                    <div class="item-vals">
                        <span class="rp">${d.rp}rp</span>
                        <span class="money">$${formatMoney(d.money)}</span>
                    </div>
                `;
            } else {
                selectedDiv.innerHTML = `<span class="item-name" style="color:#3a5060">(None)</span>`;
            }

            selectedDiv.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll(".options").forEach(o => {
                    if (o !== optionsDiv) o.classList.remove("show");
                });
                optionsDiv.classList.toggle("show");
            };

            itemsContainer.appendChild(dropdown);
        });

        // CIRCUIT
        const circuitDiv = stationEl.querySelector(".circuit");
        const circuitInput = stationEl.querySelector(".circuitDelay");

        if (s.tier === "4") {
            circuitDiv.style.display = "flex";
            circuitInput.value = s.circuitDelay;
            circuitInput.oninput = () => {
                s.circuitDelay = Number(circuitInput.value);
                recalcAll();
            };
        } else {
            circuitDiv.style.display = "none";
        }

        // REMOVE
        const removeBtn = stationEl.querySelector(".remove");
        removeBtn.onclick = () => {
            stations = stations.filter(st => st.id !== s.id);
            renderStations();
            recalcAll();
        };

        container.appendChild(stationEl);
    });

    recalcAll();
}

// ── Recalc ─────────────────────────────────────────────────────

function recalcAll() {
    const tierData = { "1": [], "2": [], "3": [], "4": [], "SDC": [] };
    stations.forEach(s => tierData[s.tier].push(s));

    const results = {};

    // compute non-SDC tiers normally
    for (let tier of ["1", "2", "3", "4"]) {
        const { rpSum, capFactorSum } = computeTier(tierData[tier]);
        const { rps, cap } = stationFormula[tier]([rpSum, capFactorSum]);
        results[tier] = { rps, cap };
    }

    // SDC: multiplier applied to total base RP/s
    const sdcStations = tierData["SDC"];
    const sdcRPSum = sdcStations.reduce((acc, s) => acc + s.count * getStationItemRPSum(s), 0);
    const sdcMult = calcSDCMultiplier(sdcStations);
    const sdcCount = sdcStations.reduce((acc, s) => acc + s.count, 0);
    results["SDC"] = { isSDC: true, mult: sdcMult, sdcRPSum, sdcCount };

    renderTierResults(results);

    // total base RPS from T1–T4
    let baseRPS = 0;
    for (let tier of ["1", "2", "3", "4"]) baseRPS += results[tier].rps;

    // apply SDC multiplier (only meaningful if there are SDC stations)
    const totalRPS = sdcCount > 0 ? baseRPS * sdcMult : baseRPS;

    document.getElementById("totalRPS").textContent = totalRPS.toFixed(2);

    // satellite dish info
    const minDishes = minDishesFor100(sdcRPSum);
    const satInfoEl = document.getElementById("satDishInfo");
    if (sdcCount > 0) {
        const satPower = minDishes * powerPerStation["SAT"];
        satInfoEl.textContent = `Sat dishes for 100% efficiency: ${minDishes} (${formatMF(satPower)}/s)`;
    } else {
        satInfoEl.textContent = "";
    }

    // power consumption
    let totalPowerMF = 0;
    for (let tier in tierData) {
        const count = tierData[tier].reduce((acc, s) => acc + s.count, 0);
        totalPowerMF += count * (powerPerStation[tier] || 0);
    }
    if (sdcCount > 0) totalPowerMF += minDishes * powerPerStation["SAT"];
    document.getElementById("totalPower").textContent = formatMF(totalPowerMF) + "/s";

    // time to target
    const currentRP = Number(document.getElementById("currentRP").value) || 0;
    const targetRP  = Number(document.getElementById("targetRP").value)  || 0;
    const timeDiv   = document.getElementById("timeToTarget");

    if (totalRPS > 0) {
        const timeSeconds = Math.max(0, (targetRP - currentRP) / totalRPS);
        timeDiv.textContent = "Time to reach target: " + formatTime(timeSeconds);
    } else {
        timeDiv.textContent = "Time to reach target: ∞";
    }
}

function renderTierResults(results) {
    const container = document.getElementById("tierResults");
    container.innerHTML = "";

    const tierLabels = { "1": "T1", "2": "T2", "3": "T3", "4": "T4", "SDC": "SDC" };

    for (let tier in results) {
        const row = document.createElement("div");
        row.className = "tier-row";

        if (results[tier].isSDC) {
            const mult = results[tier].mult.toFixed(2);
            row.innerHTML = `
                <span class="tier-badge">SDC</span>
                <span class="col stat-mult">×${mult}</span>
                <span class="col stat-none">—</span>
            `;
        } else {
            const { rps, cap } = results[tier];
            row.innerHTML = `
                <span class="tier-badge">${tierLabels[tier]}</span>
                <span class="col stat-rps">${rps.toFixed(2)}</span>
                <span class="col stat-cap">${formatLargeNum(cap)}</span>
            `;
        }

        container.appendChild(row);
    }
}

// ── Helpers ────────────────────────────────────────────────────

function formatMoney(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (val >= 1000)    return (val / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return val;
}

function formatMF(val) {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1).replace(/\.0$/, "") + "G";
    if (val >= 1000000)    return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (val >= 1000)       return (val / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return val.toFixed(0);
}

function formatLargeNum(val) {
    if (val === null || val === undefined) return "—";
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (val >= 1000)    return (val / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return val.toFixed(0);
}

function formatTime(seconds) {
    if (seconds < 60)   return seconds.toFixed(2) + "s";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m " + Math.floor(seconds % 60) + "s";
    return Math.floor(seconds / 3600) + "h " + Math.floor((seconds % 3600) / 60) + "m";
}
