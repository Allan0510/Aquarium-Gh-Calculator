let tanks = JSON.parse(localStorage.getItem("tanks")) || {};
let currentTank = null;
let chart = null;

const tankSelect = document.getElementById("tankSelect");
const result = document.getElementById("result");

/* ---------- Helpers ---------- */

function saveTanks() {
  localStorage.setItem("tanks", JSON.stringify(tanks));
}

function resetInputs(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ---------- Tank Management ---------- */

function refreshTankList() {
  tankSelect.innerHTML = "<option value=''>Select tank</option>";

  Object.keys(tanks).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    tankSelect.appendChild(option);
  });
}

function addTank() {
  const name = document.getElementById("tankName").value.trim();
  if (!name) return;

  if (!tanks[name]) {
    tanks[name] = [];
    saveTanks();
    refreshTankList();
  }

  tankSelect.value = name;
  loadTank();

  // ✅ auto reset tank name input
  resetInputs(["tankName"]);
}

function deleteTank() {
  if (!currentTank) return;
  if (!confirm(`Delete tank "${currentTank}" and all its data?`)) return;

  delete tanks[currentTank];
  currentTank = null;
  saveTanks();
  refreshTankList();
  clearChart();
  result.textContent = "";
}

/* ---------- Load Tank ---------- */

function loadTank() {
  currentTank = tankSelect.value;
  if (!currentTank) return;

  renderChart();
}

/* ---------- GH Calculation ---------- */

function calculateGH() {
  if (!currentTank) {
    result.textContent = "Select or create a tank first.";
    return;
  }

  const tds = parseFloat(document.getElementById("tds").value);
  const kh = parseFloat(document.getElementById("kh").value);

  if (isNaN(tds) || isNaN(kh) || tds < 0 || kh < 0) {
    result.textContent = "Enter valid TDS and KH values.";
    return;
  }

  const gh = (tds - kh * 25) / 25;

  if (gh < 0) {
    result.textContent = "Calculated GH is negative. Check inputs.";
    return;
  }

  tanks[currentTank].push({
    date: new Date().toLocaleDateString(),
    gh: Number(gh.toFixed(2))
  });

  saveTanks();
  renderChart();

  result.textContent = `Estimated GH: ${gh.toFixed(2)} dGH`;

  // ✅ auto reset TDS & KH inputs
  resetInputs(["tds", "kh"]);
}

/* ---------- Chart ---------- */

function renderChart() {
  const data = tanks[currentTank] || [];

  const labels = data.map(d => d.date);
  const values = data.map(d => d.gh);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("ghChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "GH (dGH)",
        data: values,
        borderWidth: 2,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function clearChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

function clearHistory() {
  if (!currentTank) return;

  tanks[currentTank] = [];
  saveTanks();
  clearChart();
  result.textContent = "";
}

/* ---------- Init ---------- */

refreshTankList();

