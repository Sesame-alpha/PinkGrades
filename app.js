console.log("🌸 PinkGrades loaded");

let data = [];
let lineChart, barChart, pieChart;

// ==============================
// LOAD / SAVE
// ==============================
function loadData() {
  try {
    data = JSON.parse(localStorage.getItem("pinkgrades")) || [];
  } catch {
    data = [];
  }
}

function saveData() {
  localStorage.setItem("pinkgrades", JSON.stringify(data));
}

// ==============================
// ADD GRADE
// ==============================
function addGrade() {
  const module   = document.getElementById("module").value.trim();
  const marks    = document.getElementById("marks").value;
  const year     = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;

  if (!module || marks === "") {
    alert("Please fill in the module name and marks.");
    return;
  }

  const numMarks = Number(marks);
  if (numMarks < 0 || numMarks > 100) {
    alert("Marks must be between 0 and 100.");
    return;
  }

  data.push({
    module,
    marks: numMarks,
    year: String(year),
    semester: String(semester)
  });

  saveData();
  renderAll();

  document.getElementById("module").value = "";
  document.getElementById("marks").value  = "";
}

// ==============================
// FILTER
// ==============================
function getFilteredData() {
  const year     = document.getElementById("filterYear")?.value     || "all";
  const semester = document.getElementById("filterSemester")?.value || "all";

  return data.filter(d => {
    const yearMatch = year     === "all" || d.year     === year;
    const semMatch  = semester === "all" || d.semester === semester;
    return yearMatch && semMatch;
  });
}

// ==============================
// GROUP DATA (avg per module)
// ==============================
function groupData() {
  const filtered = getFilteredData();
  const grouped  = {};

  filtered.forEach(d => {
    if (!grouped[d.module]) grouped[d.module] = [];
    grouped[d.module].push(Number(d.marks));
  });

  const labels = Object.keys(grouped);
  const marks  = labels.map(l =>
    grouped[l].reduce((a, b) => a + b, 0) / grouped[l].length
  );

  return { labels, marks };
}

// ==============================
// GRADE ZONES
// ==============================
function getZones() {
  const filtered = getFilteredData();
  const zones    = { "85–100 (Super)": 0, "75–84 (Good)": 0, "70–74 (Pass)": 0, "Below 70 (Danger)": 0 };

  filtered.forEach(d => {
    const m = Number(d.marks);
    if      (m >= 85) zones["85–100 (Super)"]++;
    else if (m >= 75) zones["75–84 (Good)"]++;
    else if (m >= 70) zones["70–74 (Pass)"]++;
    else              zones["Below 70 (Danger)"]++;
  });

  return zones;
}

// ==============================
// STATS
// ==============================
function updateStats() {
  const filtered = getFilteredData();

  if (filtered.length === 0) {
    document.getElementById("avg").innerText       = "—";
    document.getElementById("best").innerText      = "—";
    document.getElementById("avgModule").innerText = "—";
    return;
  }

  const avg = filtered.reduce((sum, d) => sum + Number(d.marks), 0) / filtered.length;
  document.getElementById("avg").innerText = avg.toFixed(1);

  const sorted = [...filtered].sort((a, b) => b.marks - a.marks);
  document.getElementById("best").innerText      = sorted[0].module;
  document.getElementById("avgModule").innerText = sorted[sorted.length - 1].module;
}

// ==============================
// INSIGHTS
// ==============================
function updateInsights() {
  const filtered = getFilteredData();
  const el       = document.getElementById("insightText");

  if (filtered.length === 0) {
    el.innerText = "Add grades to see insights.";
    return;
  }

  const avg    = filtered.reduce((s, d) => s + Number(d.marks), 0) / filtered.length;
  const sorted = [...filtered].sort((a, b) => b.marks - a.marks);
  const best   = sorted[0];
  const worst  = sorted[sorted.length - 1];
  const danger = filtered.filter(d => Number(d.marks) < 70).length;

  let msg = `Your overall average is ${avg.toFixed(1)}. `;
  msg += `Top performer: ${best.module} (${best.marks}%). `;

  if (danger > 0) {
    msg += `⚠️ ${danger} grade${danger > 1 ? "s" : ""} below 70 — focus on ${worst.module} (${worst.marks}%).`;
  } else {
    msg += `✅ All grades are at pass level or above — great work!`;
  }

  el.innerText = msg;
}

// ==============================
// GOAL PROGRESS
// ==============================
function updateGoal() {
  const filtered = getFilteredData();
  const bar      = document.getElementById("progressBar");
  const label    = document.getElementById("progressLabel");

  if (filtered.length === 0) {
    bar.style.width = "0%";
    if (label) label.innerText = "No data yet";
    return;
  }

  const avg     = filtered.reduce((s, d) => s + Number(d.marks), 0) / filtered.length;
  const percent = Math.min((avg / 70) * 100, 100);

  bar.style.width = percent + "%";

  if (label) {
    label.innerText = percent >= 100
      ? `🎉 Goal reached! Average: ${avg.toFixed(1)}`
      : `${avg.toFixed(1)} / 70 (${percent.toFixed(0)}%)`;
  }
}

// ==============================
// CHARTS
// ==============================
const CHART_COLORS = {
  hot:  "#ff0a78",
  mid:  "#ff4fa3",
  soft: "#ff8ccf",
  pale: "#ffd1e8"
};

const BASE_CHART_OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      labels: { font: { family: "'DM Sans', sans-serif", size: 12 }, color: "#1a0a10" }
    }
  }
};

function renderCharts() {
  const { labels, marks } = groupData();
  const zones             = getZones();

  if (lineChart) lineChart.destroy();
  if (barChart)  barChart.destroy();
  if (pieChart)  pieChart.destroy();

  const lineCtx = document.getElementById("lineChart");
  const barCtx  = document.getElementById("barChart");
  const pieCtx  = document.getElementById("pieChart");

  if (!lineCtx || !barCtx || !pieCtx) return;

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Performance",
        data: marks,
        borderColor: CHART_COLORS.hot,
        backgroundColor: "rgba(255,10,120,.12)",
        pointBackgroundColor: CHART_COLORS.hot,
        pointRadius: 5,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      ...BASE_CHART_OPTIONS,
      scales: {
        y: { min: 0, max: 100, ticks: { color: "#b37a92" }, grid: { color: "#ffe0ef" } },
        x: { ticks: { color: "#b37a92" }, grid: { color: "#ffe0ef" } }
      }
    }
  });

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Average Marks",
        data: marks,
        backgroundColor: marks.map(m =>
          m >= 85 ? CHART_COLORS.hot :
          m >= 75 ? CHART_COLORS.mid :
          m >= 70 ? CHART_COLORS.soft :
                    CHART_COLORS.pale
        ),
        borderRadius: 8
      }]
    },
    options: {
      ...BASE_CHART_OPTIONS,
      scales: {
        y: { min: 0, max: 100, ticks: { color: "#b37a92" }, grid: { color: "#ffe0ef" } },
        x: { ticks: { color: "#b37a92" }, grid: { display: false } }
      }
    }
  });

  const zoneLabels = Object.keys(zones).filter(k => zones[k] > 0);
  const zoneValues = zoneLabels.map(k => zones[k]);

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: zoneLabels,
      datasets: [{
        data: zoneValues,
        backgroundColor: [CHART_COLORS.hot, CHART_COLORS.mid, CHART_COLORS.soft, CHART_COLORS.pale],
        borderWidth: 2,
        borderColor: "#fff"
      }]
    },
    options: {
      ...BASE_CHART_OPTIONS,
      plugins: {
        ...BASE_CHART_OPTIONS.plugins,
        legend: { position: "bottom", ...BASE_CHART_OPTIONS.plugins.legend }
      }
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
  updateInsights();
}

// ==============================
// FILTER EVENTS
// ==============================
document.getElementById("filterYear")?.addEventListener("change", renderAll);
document.getElementById("filterSemester")?.addEventListener("change", renderAll);

["module","marks"].forEach(id => {
  document.getElementById(id)?.addEventListener("keydown", e => {
    if (e.key === "Enter") addGrade();
  });
});

// ==============================
// INIT
// ==============================
loadData();
renderAll();
