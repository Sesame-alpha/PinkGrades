console.log("🔥 app.js is connected");
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
  console.log("ADD CLICKED");

  const module = document.getElementById("module").value;
  const marks = document.getElementById("marks").value;
  const year = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;

  if (!module || !marks) {
    alert("Fill in all fields");
    return;
  }

  data.push({
    module: module.trim(),
    marks: Number(marks),
    year: Number(year),
    semester: Number(semester)
  });

  saveData();
  renderAll();

  document.getElementById("module").value = "";
  document.getElementById("marks").value = "";
}

// ==============================
// FILTER DATA (YEAR + SEMESTER)
// ==============================
function getFilteredData() {
  const year = document.getElementById("filterYear")?.value || "all";
  const semester = document.getElementById("filterSemester")?.value || "all";

  return data.filter(d => {
    const yearMatch = year === "all" || String(d.year) === year;
    const semMatch = semester === "all" || String(d.semester) === semester;

    return yearMatch && semMatch;
  });
}

// ==============================
// GROUP DATA FOR CHARTS
// ==============================
function groupData() {
  const filtered = getFilteredData();

  const grouped = {};

  filtered.forEach(d => {
    const key = d.module;

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
  const filtered = getFilteredData();

  let zones = { super: 0, good: 0, pass: 0, danger: 0 };

  filtered.forEach(d => {
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
  const filtered = getFilteredData();

  if (filtered.length === 0) {
    document.getElementById("progressBar").style.width = "0%";
    return;
  }

  const avg =
    filtered.reduce((sum, d) => sum + Number(d.marks), 0) / filtered.length;

  const target = 70;

  const percent = Math.min((avg / target) * 100, 100);

  document.getElementById("progressBar").style.width = percent + "%";
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

  const best = [...filtered].sort((a, b) => b.marks - a.marks)[0];
  const worst = [...filtered].sort((a, b) => a.marks - b.marks)[0];

  document.getElementById("best").innerText = best.module;
  document.getElementById("avgModule").innerText = worst.module;
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
        backgroundColor: "#ff8ccf",
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
        backgroundColor: [
          "#ff0a78",
          "#ff4fa3",
          "#ff8ccf",
          "#ffd1e8"
        ]
      }]
    }
  });
}

// ==============================
// MAIN RENDER
// ==============================
function renderAll() {
  try {
    renderCharts();
    updateGoal();
    updateStats();
  } catch (e) {
    console.log("Render error:", e);
  }
}

// ==============================
// FILTER EVENT LISTENERS
// ==============================
document.getElementById("filterYear")?.addEventListener("change", renderAll);
document.getElementById("filterSemester")?.addEventListener("change", renderAll);

// ==============================
// INIT
// ==============================
loadData();
renderAll();
