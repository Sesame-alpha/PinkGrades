console.log("🔥 app.js loaded");

let data = [];

let lineChart, barChart, pieChart;

// ==============================
// LOAD
// ==============================
function loadData() {
  data = JSON.parse(localStorage.getItem("grades")) || [];
}

// ==============================
// SAVE
// ==============================
function saveData() {
  localStorage.setItem("grades", JSON.stringify(data));
}

// ==============================
// ADD GRADE
// ==============================
function addGrade() {
  const module = document.getElementById("module").value;
  const marks = document.getElementById("marks").value;
  const year = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;

  if (!module || !marks) {
    alert("Please fill all fields");
    return;
  }

  data.push({
    module: module.trim(),
    marks: Number(marks),
    year: String(year),
    semester: String(semester)
  });

  saveData();
  renderAll();

  document.getElementById("module").value = "";
  document.getElementById("marks").value = "";
}

// ==============================
// FILTER
// ==============================
function getFilteredData() {
  const year = document.getElementById("filterYear")?.value || "all";
  const semester = document.getElementById("filterSemester")?.value || "all";

  return data.filter(d => {
    const yearMatch = year === "all" || d.year === year;
    const semMatch = semester === "all" || d.semester === semester;
    return yearMatch && semMatch;
  });
}

// ==============================
// GROUP DATA
// ==============================
function groupData() {
  const filtered = getFilteredData();

  const grouped = {};

  filtered.forEach(d => {
    if (!grouped[d.module]) grouped[d.module] = [];
    grouped[d.module].push(Number(d.marks));
  });

  const labels = Object.keys(grouped);

  const marks = labels.map(l =>
    grouped[l].reduce((a, b) => a + b, 0) / grouped[l].length
  );

  return { labels, marks };
}

// ==============================
// ZONES
// ==============================
function getZones() {
  const filtered = getFilteredData();

  const zones = { super: 0, good: 0, pass: 0, danger: 0 };

  filtered.forEach(d => {
    const m = Number(d.marks);

    if (m >= 85) zones.super++;
    else if (m >= 75) zones.good++;
    else if (m >= 70) zones.pass++;
    else zones.danger++;
  });

  return zones;
}

// ==============================
// STATS
// ==============================
function updateStats() {
  const filtered = getFilteredData();

  if (filtered.length === 0) return;

  const avg =
    filtered.reduce((sum, d) => sum + Number(d.marks), 0) / filtered.length;

  document.getElementById("avg").innerText = avg.toFixed(1);

  const sorted = [...filtered].sort((a, b) => b.marks - a.marks);

  document.getElementById("best").innerText = sorted[0].module;
  document.getElementById("avgModule").innerText = sorted[sorted.length - 1].module;
}

// ==============================
// GOAL
// ==============================
function updateGoal() {
  const filtered = getFilteredData();

  if (filtered.length === 0) {
    document.getElementById("progressBar").style.width = "0%";
    return;
  }

  const avg =
    filtered.reduce((sum, d) => sum + Number(d.marks), 0) / filtered.length;

  const percent = Math.min((avg / 70) * 100, 100);

  document.getElementById("progressBar").style.width = percent + "%";
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

  const lineCtx = document.getElementById("lineChart");
  const barCtx = document.getElementById("barChart");
  const pieCtx = document.getElementById("pieChart");

  if (!lineCtx || !barCtx || !pieCtx) return;

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Performance",
        data: marks,
        borderColor: "#ff0a78",
        backgroundColor: "#ff8ccf",
        fill: false
      }]
    }
  });

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Average Marks",
        data: marks,
        backgroundColor: "#ff4fa3"
      }]
    }
  });

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(zones),
      datasets: [{
        data: Object.values(zones),
        backgroundColor: ["#ff0a78", "#ff4fa3", "#ff8ccf", "#ffd1e8"]
      }]
    }
  });
}

// ==============================
// MAIN RENDER
// ==============================
function renderAll() {
  renderCharts();
  updateStats();
  updateGoal();
}

// ==============================
// FILTER EVENTS
// ==============================
document.getElementById("filterYear")?.addEventListener("change", renderAll);
document.getElementById("filterSemester")?.addEventListener("change", renderAll);

// ==============================
// INIT
// ==============================
loadData();
renderAll();
