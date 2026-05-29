let data = [];

let lineChart, barChart, pieChart;

// ==============================
// LOAD
// ==============================
function loadData() {
  data = JSON.parse(localStorage.getItem("grades")) || [];
}

// ==============================
// NORMALIZE
// ==============================
function normalizeModule(name) {
  return name.toUpperCase().replace(/\s+/g, "").trim();
}

// ==============================
// SAVE
// ==============================
function saveGrade(module, marks) {
  loadData();

  const map = new Map();

  data.forEach(d => {
    map.set(normalizeModule(d.module), {
      module: normalizeModule(d.module),
      marks: Number(d.marks)
    });
  });

  map.set(normalizeModule(module), {
    module: normalizeModule(module),
    marks: Number(marks)
  });

  const updated = [...map.values()];

  localStorage.setItem("grades", JSON.stringify(updated));

  data = updated;

  renderAll();
}

// ==============================
// GROUP
// ==============================
function groupData() {
  const grouped = {};

  data.forEach(d => {
    const key = normalizeModule(d.module);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(Number(d.marks));
  });

  const labels = Object.keys(grouped);

  const marks = labels.map(m =>
    grouped[m].reduce((a, b) => a + b, 0) / grouped[m].length
  );

  return { labels, marks };
}

// ==============================
// ZONES
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
// CHARTS
// ==============================
function renderCharts() {
  const { labels, marks } = groupData();
  const zones = getZones();

  if (lineChart) lineChart.destroy();
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ data: marks, borderColor: "#ff0a78" }]
    }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: marks, backgroundColor: "#ff4fa3" }]
    }
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(zones),
      datasets: [{ data: Object.values(zones) }]
    }
  });
}

// ==============================
// ADD GRADE
// ==============================
function addGrade() {
  const module = document.getElementById("module").value;
  const marks = document.getElementById("marks").value;

  if (!module || !marks) return;

  saveGrade(module, marks);

  document.getElementById("module").value = "";
  document.getElementById("marks").value = "";
}

// ==============================
// RENDER ALL
// ==============================
function renderAll() {
  renderCharts();
}

// ==============================
// INIT
// ==============================
loadData();
renderAll();
