let stations = [];

function addStation() {
    stations.push({
        tier: 1,
        count: 1
    });
    renderStations();
}

function renderStations() {
    let div = document.getElementById("stations");
    div.innerHTML = "";

    stations.forEach((s, i) => {
        div.innerHTML += `
        <div class="station">
            Tier:
            <select onchange="stations[${i}].tier=this.value; recalc()">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
            </select>

            Count:
            <input type="number" value="${s.count}"
            onchange="stations[${i}].count=this.value; recalc()">
        </div>
        `;
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
