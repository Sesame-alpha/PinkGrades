let data = JSON.parse(localStorage.getItem("grades")) || [];

let lineChart, barChart, pieChart;

function save() {
  localStorage.setItem("grades", JSON.stringify(data));
}

function getZone(m) {
  if (m >= 85) return "super";
  if (m >= 75) return "good";
  if (m >= 70) return "pass";
  return "danger";
}

function addGrade() {

  const module = document.getElementById("module").value;
  const marks = Number(document.getElementById("marks").value);
  const year = Number(document.getElementById("year").value);
  const semester = Number(document.getElementById("semester").value);

  if (!module || isNaN(marks)) return;

  data.push({ module, marks, year, semester });

  save();
  update();
}

function calculate() {

  if (data.length === 0) return;

  const valid = data.filter(d => d.marks !== null);

  const avg = valid.reduce((a,b)=>a+b.marks,0)/valid.length;

  document.getElementById("avg").innerText = avg.toFixed(2);

  const best = valid.reduce((a,b)=>a.marks>b.marks?a:b);
  const worst = valid.reduce((a,b)=>a.marks<b.marks?a:b);

  document.getElementById("best").innerText = best.module;
  document.getElementById("worst").innerText = worst.module;

  // GOAL PROGRESS
  let progress = (avg / 80) * 100;
  document.getElementById("progressBar").style.width = progress + "%";

  // AI INSIGHTS
  let weak = valid.filter(d => d.marks < 70).length;

  document.getElementById("insightText").innerText =
    `Weak modules: ${weak}. Focus improvement needed.`;

  // SEMESTER COMPARISON
  let sem1 = valid.filter(d => d.semester == 1);
  let sem2 = valid.filter(d => d.semester == 2);

  let avg1 = sem1.length ? sem1.reduce((a,b)=>a+b.marks,0)/sem1.length : 0;
  let avg2 = sem2.length ? sem2.reduce((a,b)=>a+b.marks,0)/sem2.length : 0;

  document.getElementById("comparison").innerText =
    `Sem 1: ${avg1.toFixed(1)} | Sem 2: ${avg2.toFixed(1)}`;

  // ACHIEVEMENTS
  let ach = [];

  if (valid.filter(d=>d.marks>=85).length >= 1)
    ach.push("🏆 High Performer");

  if (valid.filter(d=>d.marks<70).length === 0)
    ach.push("🌸 No Danger Modules");

  document.getElementById("achievementsBox").innerHTML =
    ach.map(a=>`<div class="card">${a}</div>`).join("");

}

function charts() {

  const valid = data.filter(d=>d.marks!==null);

  const labels = valid.map(d=>d.module);
  const marks = valid.map(d=>d.marks);

  if (lineChart) lineChart.destroy();
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: { labels, datasets: [{ data: marks, borderColor: "#ff4fa3" }] }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: [{ data: marks, backgroundColor: "#ff85c2" }] }
  });

  let zones = {super:0,good:0,pass:0,danger:0};

  valid.forEach(d=>{
    zones[getZone(d.marks)]++;
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels:["Super","Good","Pass","Danger"],
      datasets:[{ data:Object.values(zones) }]
    }
  });

}

function update() {
  calculate();
  charts();
}

update();
