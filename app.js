let data = [];

let lineChart, barChart, pieChart;

// ==============================
// LOAD DATA
// ==============================
function loadData() {
  data = JSON.parse(localStorage.getItem("grades")) || [];
}

// ==============================
// SAVE DATA
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

  if (!module || !marks) return;

  data.push({
    module: module.trim(),
    marks: Number(marks),
    year: year,
    semester: semester
  });

  saveData();
  renderAll();

  document.getElementById("module").value = "";
  document.getElementById("marks").value = "";
}

// ==============================
// GROUP DATA (FOR CHARTS)
// ==============================
function groupData() {
  const grouped = {};

  data.forEach(d => {
    const key = d.module.trim();

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
// ZONES (PIE CHART)
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
// GOAL TRACKER
// ==============================
function updateGoal() {
  if (data.length === 0) {
    document.getElementById("progressBar").style.width = "0%";
    return;
  }

  const avg =
    data.reduce((sum, d) => sum + Number(d.marks), 0) / data.length;

  const target = 70;

  const percent = Math.min((avg / target) * 100, 100);

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

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Module Performance",
        data: marks,
        borderColor: "#ff0a78",
        fill: false
      }]
    }
  });

  barChart = new Chart(document.getElementById("barChart"), {
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

  pieChart = new Chart(document.getElementById("pieChart"), {
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
// STATS (OPTIONAL UI FIX)
// ==============================
function updateStats() {
  if (data.length === 0) return;

  const avg =
    data.reduce((sum, d) => sum + Number(d.marks), 0) / data.length;

  document.getElementById("avg").innerText = avg.toFixed(1);

  const best = [...data].sort((a, b) => b.marks - a.marks)[0];
  const worst = [...data].sort((a, b) => a.marks - b.marks)[0];

  document.getElementById("best").innerText = best.module;
  document.getElementById("avgModule").innerText = worst.module;
}

// ==============================
// MAIN RENDER
// ==============================
function renderAll() {
  renderCharts();
  updateGoal();
  updateStats();
}

// ==============================
// INIT
// ==============================
loadData();
renderAll();
