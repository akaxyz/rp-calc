let nextStationId = 0;
let stations = [];

function addStation() {
    stations.push({
        id: nextStationId++,
        tier: "1",
        count: 1,
        items: [],
        circuitDelay: 0
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

    stations.forEach((s) => {
        adjustItemsForTier(s);

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
            renderStations();
            recalcAll();
        });

        /* COUNT */
        const countInput = stationEl.querySelector(".count");
        countInput.value = s.count;

        countInput.addEventListener("input", () => {
            s.count = Number(countInput.value);
            recalcAll();
        });

        /* ITEMS */
        const itemsContainer = stationEl.querySelector(".items");
        itemsContainer.innerHTML = "";

        s.items.forEach((itemValue, idx) => {
            const label = document.createElement("label");
            label.textContent = `Item ${idx + 1}: `;

            const select = document.createElement("select");

            const sortedItems = Object.entries(items)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => a.rp - b.rp); // change sorting if you want

            sortedItems.forEach(it => {
                const opt = document.createElement("option");
                opt.value = it.name;
                opt.textContent = `${it.name} (RP:${it.rp} $${it.money})`;
                if (it.name === itemValue) opt.selected = true;
                select.appendChild(opt);
            });

            select.addEventListener("change", () => {
                s.items[idx] = select.value;
                recalcAll();
            });

            label.appendChild(select);
            itemsContainer.appendChild(label);
        });

        /* CIRCUIT */
        const circuitDiv = stationEl.querySelector(".circuit");
        const circuitInput = stationEl.querySelector(".circuitDelay");

        if (s.tier === "4") {
            circuitDiv.style.display = "block";
            circuitInput.value = s.circuitDelay;

            circuitInput.addEventListener("input", () => {
                s.circuitDelay = Number(circuitInput.value);
                recalcAll();
            });
        } else {
            circuitDiv.style.display = "none";
        }

        /* REMOVE BUTTON */
        const removeBtn = stationEl.querySelector(".remove");
        removeBtn.addEventListener("click", () => {
            stations = stations.filter(st => st.id !== s.id);
            renderStations();
            recalcAll();
        });

        container.appendChild(stationEl);
    });
}

function recalcAll() {
    // placeholder
    let total = 0;

    stations.forEach(s => {
        total += s.count;
    });

    document.getElementById("totals").innerText =
        "Stations: " + total;
}
