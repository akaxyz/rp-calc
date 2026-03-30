let nextStationId = 0;
let stations = [];

function addStation() {
    stations.push({
        id: nextStationId++,
        tier: "1",
        count: 1,
        items: [],
        circuitDelay: 4,
        cap: 0,
        rps: 0
    });

    renderStations();
}

function renderStations() {
    const container = document.getElementById("stations");
    container.innerHTML = "";

    stations.forEach((s, i) => {
        const template = document.getElementById("station-template");
        const stationEl = template.content.cloneNode(true);

        /* TIER */
        
        const tierSelect = stationEl.querySelector(".tier");
        ["1","2","3","4","SDC"].forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            if (t === s.tier) opt.selected = true;
            tierSelect.appendChild(opt);
        });
        tierSelect.addEventListener("change", () => {
            s.tier = tierSelect.value;
            adjustItemsForTier(s);
            renderStations();
            recalcAll();
        });

        /* COUNT */

        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.value = s.count;
            
        countInput.addEventListener("input", () => {
            s.count = Number(countInput.value);
            recalcAll();
        });

        /* ITEMS */
        
        const itemsContainer = stationEl.querySelector(".items");
        itemsContainer.innerHTML = ""; // clear old options
        
        s.items.forEach((itemValue, idx) => {
            const itemLabel = document.createElement("label");
            itemLabel.textContent = `Item ${idx+1}: `;
        
            const itemSelect = document.createElement("select");
        
            // sort dynamically
            const sortedItems = Object.values(items).sort((a,b) => a.rp - b.rp); // example sort by rp
        
            sortedItems.forEach(it => {
                const opt = document.createElement("option");
                opt.value = it.name;
                opt.textContent = it.name;
                if (it.name === itemValue) opt.selected = true;
        
                // optional: add icon inside option (some browsers support emoji or unicode, images usually need custom UI)
                opt.dataset.icon = it.icon;
        
                itemSelect.appendChild(opt);
            });
        
            itemSelect.addEventListener("change", () => {
                s.items[idx] = itemSelect.value;
                recalcAll();
            });
        
            itemLabel.appendChild(itemSelect);
            itemsContainer.appendChild(itemLabel);
        });



        // item 1 for everything except tier 1
        if (s.tier !== "1") {
            createItemSelect(container, s, 0);
        }
        
        // item 2 only for tier 3 and 4
        if (s.tier === "3" || s.tier === "4") {
            createItemSelect(container, s, 1);
        }
        
        // circuit delay only for tier 4
        if (s.tier === "4") {
            const input = document.createElement("input");
            input.type = "number";
            input.value = s.circuitDelay || 0;
        
            input.addEventListener("input", () => {
                s.circuitDelay = Number(input.value);
                recalcAll();
            });
        
            container.appendChild(input);
        }

        
        const circuitLabel = stationEl.querySelector(".circuit");
        circuitLabel.style.display = (s.tier === "4") ? "inline-block" : "none";


        
        container.appendChild(stationEl);
    });
}

function recalc() {
    let total = 0;
    for (let s of stations) {
        total += s.count * s.tier;
    }
    document.getElementById("totals").innerText =
        "RP/s: " + total;
}
