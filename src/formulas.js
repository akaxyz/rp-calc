
function log(n,b) {
  let result = (math.log(n) / math.log(b))
  return result == -Infinity ? 0 : result;
};

const tiers = {
  "1": [],
  "2": [],
  "3": [],
  "4": [],
  "SDC": []
};

function getItemRP(name) {
  return name ? items[name].rp : 0;
}

function getItemMoney(name) {
  return name ? items[name].money : 0;
}

// data[0] is rp sum
// data[1] is cap factor sum
// for tier 1 & 2, data[1] is the number of research stations
const stationFormula = {
    "1": (data) => ({
        rps: data[1]**0.5,
        cap: 200 * log(data[1]+1, 2)
    }),
    "2": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 2000 * log(data[1]+1, 2)
    }),
    "3": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 1.1 * 15000 * (log(data[1]+1, 2) + data[1] ** 0.5)
    }),
    "4": (data) => ({
        rps: 2 * (data[0] ** 0.6),
        cap: 150000 * (log(data[1]+1, 2) + data[1] ** 0.9)
    })
};

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
  const avg = math.max(0, moneyValues.reduce((a,b) => a+b, 0)) / moneyValues.length / 600;
  let f = 0;
  
  if (s.tier == "3" || s.tier == "4") {
    f = ((avg >= 1) ? log(avg,4)+1 : log(avg+1,2));
    
    if (s.tier == "4" && s.circuitDelay > 0) {
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

    return {
        rpSum,
        capFactorSum
    };
}

function computeAllTiers() {
    const results = {};

    for (let tier in tiers) {
        const tierStations = tiers[tier];
        const { rpSum, capFactorSum } = computeTier(tierStations);

        if (stationFormula[tier]) {
            results[tier] = stationFormula[tier]([rpSum, capFactorSum]);
        } else {
            results[tier] = { rps: 0, cap: 0 }; // fallback for SDC for now
        }
    }

    return results;
}
