// powered by Israel-GPT

let nextStationId = 0;
let stations = [];

document.addEventListener("DOMContentLoaded", () => {
    renderStations();
    recalcAll();
});

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

function renderStations() {
    const container = document.getElementById("stations");
    container.innerHTML = "";

    // single document click listener for closing dropdowns
    document.onclick = (e) => {
        document.querySelectorAll(".options").forEach(opt => {
            if (!opt.parentElement.contains(e.target)) {
                opt.classList.remove("show");
            }
        });
    }

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
            if (t === "SDC") {
                opt.textContent = "SDC";
            } else {
                opt.textContent = "Tier " + t;
            }
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
        
            // label above dropdown
            const label = document.createElement("label");
            label.textContent = "Item " + (idx + 1);
            dropdown.appendChild(label);
        
            // selected div
            const selectedDiv = document.createElement("div");
            selectedDiv.className = "selected";
            dropdown.appendChild(selectedDiv);
        
            // options container
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "options";
            dropdown.appendChild(optionsDiv);
        
            // (None) option always at top
            const noneOpt = document.createElement("div");
            noneOpt.className = "option";
            noneOpt.innerHTML = `<div class="optionLeft"><span class="name">(None)</span></div><div class="optionRight"></div>`;
            noneOpt.onclick = () => {
                s.items[idx] = null;
                renderStations();
                recalcAll();
            };
            optionsDiv.appendChild(noneOpt);
        
            // populate items
            Object.entries(items)
                .sort((a, b) => a[1].rp - b[1].rp)
                .forEach(([itemName, data]) => {
                    const opt = document.createElement("div");
                    opt.className = "option";
        
                    const left = document.createElement("div");
                    left.className = "optionLeft";
                    const img = document.createElement("img");
                    img.src = data.icon;
                    img.className = "icon";
                    const name = document.createElement("span");
                    name.textContent = itemName;
                    left.appendChild(img);
                    left.appendChild(name);
        
                    const right = document.createElement("div");
                    right.className = "optionRight";
                    const rp = document.createElement("span");
                    rp.className = "rp";
                    rp.textContent = data.rp;
                    const money = document.createElement("span");
                    money.className = "money";
                    money.textContent = "$" + data.money;
                    right.appendChild(rp);
                    right.appendChild(money);
        
                    opt.appendChild(left);
                    opt.appendChild(right);
        
                    opt.onclick = () => {
                        s.items[idx] = itemName;
                        renderStations();
                        recalcAll();
                    };
        
                    optionsDiv.appendChild(opt);
                });
        
            // show selected item
            if (itemValue && items[itemValue]) {
                selectedDiv.innerHTML = `
                    <img src="${items[itemValue].icon}" class="icon">
                    ${itemValue}
                `;
            } else {
                selectedDiv.textContent = "(None)";
            }
        
            // toggle options
            selectedDiv.onclick = (e) => {
                e.stopPropagation();
                optionsDiv.classList.toggle("show");
            };
        
            itemsContainer.appendChild(dropdown);
        });
        
        // close dropdown if clicked outside
        document.addEventListener("click", (e) => {
            document.querySelectorAll(".options").forEach(opt => {
                if (!opt.parentElement.contains(e.target)) {
                    opt.classList.remove("show");
                }
            });
        });

        // CIRCUIT
        const circuitDiv = stationEl.querySelector(".circuit");
        const circuitInput = stationEl.querySelector(".circuitDelay");

        if (s.tier === "4") {
            circuitDiv.style.display = "block";
            circuitInput.value = s.circuitDelay;
            circuitInput.oninput = () => {
                s.circuitDelay = Number(circuitInput.value);
                recalcAll();
            };
        } else {
            circuitDiv.style.display = "none";
        }

        // REMOVE BUTTON
        const removeBtn = stationEl.querySelector(".remove");
        removeBtn.onclick = () => {
            stations = stations.filter(st => st.id !== s.id);
            renderStations();
            recalcAll();
        }

        container.appendChild(stationEl);
    });

    renderResults();
}

function recalcAll() {
    // aggregate stations by tier
    const tierData = {
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "SDC": []
    };

    stations.forEach(s => {
        tierData[s.tier].push(s);
    });

    // compute sums and apply formulas
    const results = {};
    for (let tier in tierData) {
        const tierStations = tierData[tier];
        let rpSum = 0;
        let capFactorSum = 0;

        tierStations.forEach(s => {
            const itemRPSum = getStationItemRPSum(s);
            const capFactor = getStationCapFactor(s);

            rpSum += s.count * itemRPSum;
            capFactorSum += s.count * capFactor;
        });

        if (stationFormula[tier]) {
            const { rps, cap } = stationFormula[tier]([rpSum, capFactorSum]);
            results[tier] = { rps, cap };
        } else {
            results[tier] = { rps: 0, cap: 0 };
        }
    }

    // display totals
    const container = document.getElementById("tierResults");
    container.innerHTML = "";

    let totalRPS = 0;
    for (let tier in results) {
        const { rps, cap } = results[tier];
        totalRPS += rps;

        const el = document.createElement("div");
        el.textContent = `Tier ${tier}: RP/s = ${rps.toFixed(2)}, Cap = ${cap.toFixed(2)}`;
        container.appendChild(el);
    }

    // optional: show total RP/s
    const totalEl = document.getElementById("totals");
    if (totalEl) {
        totalEl.textContent = "Total RP/s: " + totalRPS.toFixed(2);
    }

        const currentRP = Number(document.getElementById("currentRP").value) || 0;
    const targetRP = Number(document.getElementById("targetRP").value) || 0;
    
    const timeDiv = document.getElementById("timeToTarget");
    if(totalRPS > 0) {
        const timeSeconds = Math.max(0, (targetRP - currentRP) / totalRPS);
        timeDiv.textContent = "Time to reach target: " + timeSeconds.toFixed(2) + "s";
    } else {
        timeDiv.textContent = "Time to reach target: ∞";
    }
}

function renderResults() {
    const data = computeAllTiers();
    const container = document.getElementById("tierResults");
    container.innerHTML = "";

    for (let tier in data) {
        const { rps, cap } = data[tier];
        const el = document.createElement("div");
        el.textContent = `Tier ${tier}: RP/s = ${rps.toFixed(2)}, Cap = ${cap.toFixed(2)}`;
        container.appendChild(el);
    }
}
