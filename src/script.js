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
