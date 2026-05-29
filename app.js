let data = JSON.parse(localStorage.getItem("grades"));

/* FIX: prevent broken/duplicate seed */
if (!data || data.length === 0) {
  data = [
    { module: "BPA", marks: 76, year: 1, semester: 1 },
    { module: "CT", marks: 86, year: 1, semester: 1 },
    { module: "CMS", marks: 73, year: 1, semester: 1 },
    { module: "CSS", marks: 68, year: 1, semester: 1 }
  ];
}

let lineChart, barChart, pieChart;

function save() {
  localStorage.setItem("grades", JSON.stringify(data));
}

/* STOP DUPLICATES */
function isDuplicate(item) {
  return data.some(d =>
    d.module.toLowerCase() === item.module.toLowerCase() &&
    d.year === item.year &&
    d.semester === item.semester
  );
}

function addGrade() {

  const module = document.getElementById("module").value.trim();
  const marks = Number(document.getElementById("marks").value);
  const year = Number(document.getElementById("year").value);
  const semester = Number(document.getElementById("semester").value);

  if (!module || isNaN(marks)) return;

  const newItem = { module, marks, year, semester };

  if (isDuplicate(newItem)) {
    alert("Module already exists in this semester!");
    return;
  }

  data.push(newItem);
  save();
  update();
}

function calculate() {

  const avg = data.reduce((a,b)=>a+b.marks,0)/data.length;

  document.getElementById("avg").innerText = avg.toFixed(2);

  const best = data.reduce((a,b)=>a.marks>b.marks?a:b);
  const lowest = data.reduce((a,b)=>a.marks<b.marks?a:b);

  document.getElementById("best").innerText = best.module;
  document.getElementById("avgModule").innerText = lowest.module;

  let progress = (avg / 80) * 100;
  document.getElementById("progressBar").style.width = progress + "%";

  let weak = data.filter(d => d.marks < 70).length;

  document.getElementById("insightText").innerText =
    `Weak modules: ${weak}. Focus improvement needed.`;

}

function charts() {

  const labels = data.map(d=>d.module);
  const marks = data.map(d=>d.marks);

  if (lineChart) lineChart.destroy();
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: { labels, datasets: [{ data: marks, borderColor: "#ff4fa3" }] }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: [{ data: marks, backgroundColor: "#ff8ccf" }] }
  });

  let zones = {super:0,good:0,pass:0,danger:0};

  data.forEach(d=>{
    if(d.marks>=85) zones.super++;
    else if(d.marks>=75) zones.good++;
    else if(d.marks>=70) zones.pass++;
    else zones.danger++;
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
