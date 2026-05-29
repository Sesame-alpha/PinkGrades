// ==============================
// LOAD DATA (LOCALSTORAGE)
// ==============================
let data = JSON.parse(localStorage.getItem("grades")) || [];

// ==============================
// MODULE NORMALIZER (CRITICAL FIX)
// ==============================
function normalizeModule(name) {
  return name.toUpperCase().replace(/\s+/g, "").trim();
}

// ==============================
// SAVE GRADE (100% DUPLICATE SAFE)
// ==============================
function saveGrade(module, marks) {
  let current = JSON.parse(localStorage.getItem("grades")) || [];

  const map = new Map();

  current.forEach(d => {
    const key = normalizeModule(d.module);
    map.set(key, {
      module: d.module.trim(),
      marks: Number(d.marks)
    });
  });

  const newKey = normalizeModule(module);

  map.set(newKey, {
    module: module.trim(),
    marks: Number(marks)
  });

  const updated = [...map.values()];

  localStorage.setItem("grades", JSON.stringify(updated));
  data = updated;

  renderAll();
}

// ==============================
// GROUP DATA (AVERAGE PER MODULE)
// ==============================
function groupData() {
  const grouped = {};

  data.forEach(d => {
    const key = normalizeModule(d.module);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(Number(d.marks));
  });

  const labels = Object.keys(grouped);

  const marks = labels.map(m => {
    const arr = grouped[m];
    return arr.length
      ? arr.reduce((a, b) => a + b, 0) / arr.length
      : 0;
  });

  return { labels, marks };
}

// ==============================
// PIE CHART ZONES
// ==============================
function getZones() {
  let zones = { super: 0, good: 0, pass: 0, danger: 0 };

  data.forEach(d => {
    const mark = Number(d.marks);

    if (mark >= 85) zones.super++;
    else if (mark >= 75) zones.good++;
    else if (mark >= 70) zones.pass++;
    else zones.danger++;
  });

  return zones;
}

// ==============================
// RENDER BAR CHART
// ==============================
let chartInstance = null;

function renderChart() {
  const { labels, marks } = groupData();

  const ctx = document.getElementById("chart");
  if (!ctx) return;

  // destroy old chart (prevents stacking/duplication bugs)
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Module Average",
        data: marks,
        borderWidth: 1
      }]
    }
  });
}

// ==============================
// MAIN RENDER
// ==============================
function renderAll() {
  renderChart();
}

// ==============================
// INITIAL LOAD
// ==============================
renderAll();
