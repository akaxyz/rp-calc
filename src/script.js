// powered by Israel-GPT

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
        
            const label = document.createElement("div");
            label.textContent = "Item " + (idx + 1);
            itemsContainer.appendChild(label);
        
            const dropdown = document.createElement("div");
            dropdown.className = "itemDropdown";
            
            const selected = document.createElement("div");
            selected.className = "selected";
            dropdown.appendChild(selected);
            
            const options = document.createElement("div");
            options.className = "options";
            dropdown.appendChild(options);
        
            Object.entries(items)
                .sort((a, b) => a[1].rp - b[1].rp)
                .forEach(([name, data]) => {
                    const opt = document.createElement("div");
                    opt.className = "option";
                
                    const img = document.createElement("img");
                    img.src = data.icon;
                    img.className = "icon";
                
                    const text = document.createElement("span");
                    text.textContent = `${name} (RP:${data.rp} $${data.money})`;
                
                    opt.appendChild(img);
                    opt.appendChild(text);
                
                    opt.addEventListener("click", () => {
                        s.items[idx] = name;
                        renderStations();
                        recalcAll();
                    });
                
                    options.appendChild(opt);
                });
        
            if (itemValue && items[itemValue]) {
                selected.innerHTML = `
                    <img src="${items[itemValue].icon}" class="icon">
                    ${itemValue} (RP:${items[itemValue].rp} $${items[itemValue].money})
                `;
            } else {
                selected.textContent = "Select item";
            }
        
            selected.addEventListener("click", () => {
                options.classList.toggle("show");
            });
        
            itemsContainer.appendChild(dropdown);
        });

        document.addEventListener("click", (e) => {
            document.querySelectorAll(".options").forEach(opt => {
                if (!opt.parentElement.contains(e.target)) {
                    opt.classList.remove("show");
                }
            });
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
