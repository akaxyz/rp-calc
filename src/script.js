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
    let div = document.getElementById("stations");
    div.innerHTML = "";

    stations.forEach((s, i) => {
        let html = `<div class="station">`;
        html += `Tier:
        <select onchange="stations[${i}].tier=this.value; renderStations(); recalcAll();">
            <option>"1"</option>
            <option>"2"</option>
            <option>"3"</option>
            <option>"4"</option>
            <option>"SDC"</option>
        </select>`;
    
        if (s.tier != "1") {
            html += `Item 1: <select>...</select>`;
        }
    
        if (s.tier == "3" || s.tier == "4") {
            html += `Item 2: <select>...</select>`;
        }
    
        if (s.tier == "4") {
            html += `Circuit: <input type="checkbox">`;
        }
    
        html += `</div>`;
    });

    recalc();
}

function recalc() {
    let total = 0;
    for (let s of stations) {
        total += s.count * s.tier;
    }
    document.getElementById("totals").innerText =
        "RP/s: " + total;
}
