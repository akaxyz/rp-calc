function log(n, b) {
    let result = (Math.log(n) / Math.log(b));
    return result == -Infinity ? 0 : result;
}

// MF/s power consumption per station count
const powerPerStation = {
    "1":   2100,      // 2.1k MF/s
    "2":   17000,     // 17k MF/s
    "3":   600000,    // 600k MF/s
    "4":   5000000,   // 5M MF/s
    "SDC": 75000,     // 75k MF/s
    "SAT": 75000      // 75k MF/s (satellite dish)
};

// data[0] = rpSum, data[1] = capFactorSum
const stationFormula = {
    "1": (data) => ({
        rps: data[1] ** 0.5,
        cap: 200 * log(data[1] + 1, 2)
    }),
    "2": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 2000 * log(data[1] + 1, 2)
    }),
    "3": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 1.1 * 15000 * (log(data[1] + 1, 2) + data[1] ** 0.5)
    }),
    "4": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 150000 * (log(data[1] + 1, 2) + data[1] ** 0.9)
    })
};

// SDC bonus multiplier: 0.78 * log2(n + 1), where n = sum of item rp values across all SDC stations
// Returns the multiplier to apply to total RP/s (1.0 = no bonus, 1.78 = max etc.)
function calcSDCMultiplier(sdcStations) {
    let n = 0;
    sdcStations.forEach(s => {
        n += s.count * getStationItemRPSum(s);
    });
    return 1 + 0.78 * log(n + 1, 2);
}

// Satellite dish efficiency: 1 / (s + sqrt(n * s))
// where s = number of dishes, n = total SDC item rp sum
// Returns efficiency as a fraction 0..1
function satDishEfficiency(numDishes, sdcRPSum) {
    if (numDishes <= 0) return 0;
    return 1 / (numDishes + Math.sqrt(sdcRPSum * numDishes));
}

// Find minimum satellite dishes needed to reach 100% efficiency (within threshold)
// "100%" is defined as efficiency >= 0.999 (diminishing returns never truly hit 1.0)
function minDishesFor100(sdcRPSum) {
    if (sdcRPSum <= 0) return 0;
    for (let s = 1; s <= 100000; s++) {
        if (satDishEfficiency(s, sdcRPSum) >= 0.999) return s;
    }
    return 100000; // fallback
}

function getItemRP(name) {
    return name ? items[name].rp : 0;
}

function getItemMoney(name) {
    return name ? items[name].money : 0;
}

function getStationItemRPSum(s) {
    if (s.items.length === 0) return 0;

    var sum = getItemRP(s.items[0]);

    if (s.items.length === 2) {
        sum += getItemRP(s.items[1]);
        if (getItemRP(s.items[0]) === getItemRP(s.items[1])) {
            sum *= 0.7;
        }
    }

    return sum;
}

function getStationCapFactor(s) {
    if (s.tier === "1" || s.tier === "2") return s.count;

    const moneyValues = s.items.map(getItemMoney);
    const avg = Math.max(0, moneyValues.reduce((a, b) => a + b, 0)) / moneyValues.length / 600;
    let f = 0;

    if (s.tier === "3" || s.tier === "4") {
        f = ((avg >= 1) ? log(avg, 4) + 1 : log(avg + 1, 2));

        if (s.tier === "4" && s.circuitDelay > 0) {
            f *= 2;
        }
    }

    return f;
}

function computeTier(tierStations) {
    let rpSum = 0;
    let capFactorSum = 0;

    tierStations.forEach(s => {
        rpSum += s.count * getStationItemRPSum(s);
        capFactorSum += s.count * getStationCapFactor(s);
    });

    return { rpSum, capFactorSum };
}
