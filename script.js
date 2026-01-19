const STORAGE_KEY = "ghAppData";
let chart;

const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  tanks: {},
  activeTank: null
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addTank() {
  const name = document.getElementById("tankName").value.trim();
  if (!name) return;

  if (!data.tanks[name]) {
    data.tanks[name] = [];
  }

  data.activeTank = name;
  saveData();
  populateTankSelect();
  loadTank();
}

function populateTankSelect() {
  const select = document.getElementById("tankSelect");
  select.innerHTML = "";

  Object.keys(data.tanks).forEach(tank => {
    const opt = document.createElement("option");
    opt.value = tank;
    opt.textContent = tank;
    select.appendChild(opt);
  });

  if (data.activeTank) {
    select.value = data.activeTank;
  }
}

function loadTank() {
  data.activeTank = document.getElementById("tankSelect").value;
  saveData();
  updateChart();
}

function calculateGH() {
  const tds = Number(document.getElementById("tds").value);
  const kh = Number(document.getElementById("kh").value);

  if (!data.activeTank || tds <= 0) return;

  const gh = (tds - (kh * 25)) / 25;
  const ghRounded = Math.max(0, gh.toFixed(2));

  const entry = {
    date: new Date().toLocaleDateString(),
    gh: ghRounded
  };

  data.tanks[data.activeTank].push(entry);
  saveData();

  document.getElementById("result").textContent =
    `GH: ${ghRounded} dGH`;

  updateChart();
}

function updateChart() {
  const tankData = data.tanks[data.activeTank] || [];

  const labels = tankData.map(e => e.date);
  const values = tankData.map(e => e.gh);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("ghChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "GH (dGH)",
        data: values,
        tension: 0.3
      }]
    }
  });
}

function clearGraph() {
  if (!data.activeTank) return;
  data.tanks[data.activeTank] = [];
  saveData();
  updateChart();
}

populateTankSelect();
if (data.activeTank) loadTank();
