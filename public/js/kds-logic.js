/* public/js/kds-logic.js
   Browser script — export yok, req/res/db yok.
*/

let currentStatusChart = null;
let simResultChart = null;
let hastaneDolulukChart = null;
let top3Chart = null;
let dynamicChart = null;

function destroyChartById(canvasId) {
  const ch = Chart.getChart(canvasId);
  if (ch) ch.destroy();
}

function el(id) {
  return document.getElementById(id);
}

/* -----------------------
   1) API: /api/graphs -> 4 ana grafik
----------------------- */
async function loadAndDrawApiGraphs() {
  try {
    const resp = await fetch("/api/graphs");
    if (!resp.ok) {
      console.error("GET /api/graphs hata:", resp.status, resp.statusText);
      return;
    }
    const r = await resp.json();

    const optCommon = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    };

    // Pandemi (bar)
    if (el("pandemiChart") && Array.isArray(r.pandemi)) {
      destroyChartById("pandemiChart");
      new Chart(el("pandemiChart"), {
        type: "bar",
        data: {
          labels: r.pandemi.map(x => x.etiket),
          datasets: [{ data: r.pandemi.map(x => Number(x.deger)) }]
        },
        options: optCommon
      });
    }

    // Hava (line)
    if (el("weatherChart") && Array.isArray(r.hava)) {
      destroyChartById("weatherChart");
      new Chart(el("weatherChart"), {
        type: "line",
        data: {
          labels: r.hava.map(x => x.etiket),
          datasets: [{ data: r.hava.map(x => Number(x.deger)), tension: 0.35 }]
        },
        options: optCommon
      });
    }

    // Vaka tipi (doughnut)
    if (el("typeChart") && Array.isArray(r.vakaTipi)) {
      destroyChartById("typeChart");
      new Chart(el("typeChart"), {
        type: "doughnut",
        data: {
          labels: r.vakaTipi.map(x => x.etiket),
          datasets: [{ data: r.vakaTipi.map(x => Number(x.deger)) }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Hastane türü erişim (bar daha okunur)
    if (el("hospitalChart") && Array.isArray(r.hastane)) {
      destroyChartById("hospitalChart");
      new Chart(el("hospitalChart"), {
        type: "bar",
        data: {
          labels: r.hastane.map(x => x.etiket),
          datasets: [{ data: r.hastane.map(x => Number(x.deger)) }]
        },
        options: optCommon
      });
    }

    console.log("✅ /api/graphs çizildi");
  } catch (e) {
    console.error("loadAndDrawApiGraphs hata:", e);
  }
}

/* -----------------------
   2) API: /api/hastane-doluluk -> hastaneDolulukChart
----------------------- */
async function loadAndDrawHospitalCapacity() {
  try {
    const canvas = el("hastaneDolulukChart");
    if (!canvas) return;

    const resp = await fetch("/api/hastane-doluluk");
    if (!resp.ok) {
      console.error("GET /api/hastane-doluluk hata:", resp.status, resp.statusText);
      return;
    }
    const rows = await resp.json();
    if (!Array.isArray(rows)) return;

    destroyChartById("hastaneDolulukChart");

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: rows.map(x => x.Hastane_Adi),
        datasets: [{ data: rows.map(x => Number(x.Acil_Yogunluk_Yuzde)) }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });

    console.log("✅ hastaneDolulukChart çizildi");
  } catch (e) {
    console.error("loadAndDrawHospitalCapacity hata:", e);
  }
}

/* -----------------------
   3) Dashboard demo grafikleri (Cost + Bubble)
----------------------- */
function initCostAnalysis() {
  const canvas = el("costEfficiencyChart");
  const insight = el("costInsight");
  if (!canvas) return;

  destroyChartById("costEfficiencyChart");

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Konak", "Buca", "Bornova", "Çiğli"],
      datasets: [{ data: [450, 520, 480, 600] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  if (insight) {
    insight.innerHTML =
      "<b>KDS Analizi:</b> Çiğli bölgesinde lojistik maliyetler %15 daha yüksek. İstasyon lokasyon optimizasyonu ile yakıt tasarrufu öngörülüyor.";
  }
}

function initTeamBubble() {
  const canvas = el("teamBubbleChart");
  if (!canvas) return;

  destroyChartById("teamBubbleChart");

  new Chart(canvas, {
    type: "bubble",
    data: {
      datasets: [
        { label: "Bornova", data: [{ x: 25, y: 18, r: 15 }] },
        { label: "Buca", data: [{ x: 12, y: 10, r: 10 }] },
        { label: "Konak", data: [{ x: 20, y: 14, r: 12 }] }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "Vaka Sayısı" } },
        y: { title: { display: true, text: "Süre (dk)" } }
      }
    }
  });
}

/* -----------------------
   4) Veri Merkezi 4'lü grafik (Data page)
----------------------- */
function initDataCenterExtraCharts() {
  const opt = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  if (el("shiftDelayChart")) {
    destroyChartById("shiftDelayChart");
    new Chart(el("shiftDelayChart"), {
      type: "bar",
      data: { labels: ["Sabah", "Akşam", "Gece"], datasets: [{ data: [12, 28, 15] }] },
      options: opt
    });
  }

  if (el("fuelEfficiencyChart")) {
    destroyChartById("fuelEfficiencyChart");
    new Chart(el("fuelEfficiencyChart"), {
      type: "line",
      data: { labels: ["Pzt", "Sal", "Çar", "Per", "Cum"], datasets: [{ data: [85, 78, 82, 90, 70], tension: 0.35 }] },
      options: opt
    });
  }

  if (el("staffStressChart")) {
    destroyChartById("staffStressChart");
    new Chart(el("staffStressChart"), {
      type: "radar",
      data: {
        labels: ["Yorgunluk", "Vaka", "Mola", "Moral", "Fiziksel"],
        datasets: [{ data: [80, 95, 40, 60, 85] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  if (el("roadConditionChart")) {
    destroyChartById("roadConditionChart");
    new Chart(el("roadConditionChart"), {
      type: "doughnut",
      data: {
        labels: ["Trafik", "Yol Çalışması", "Dar Sokak"],
        datasets: [{ data: [60, 25, 15] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

/* -----------------------
   5) Top3 yıllık analiz (Data page)
----------------------- */
const yearlyData = {
  "2020": [{ i: "Konak", v: 28 }, { i: "Bornova", v: 22 }, { i: "Buca", v: 20 }, { i: "Balçova", v: 15 }],
  "2021": [{ i: "Konak", v: 32 }, { i: "Karşıyaka", v: 25 }, { i: "Buca", v: 24 }, { i: "Çiğli", v: 18 }],
  "2022": [{ i: "Buca", v: 30 }, { i: "Konak", v: 28 }, { i: "Bornova", v: 25 }, { i: "Bayraklı", v: 20 }],
  "2023": [{ i: "Buca", v: 35 }, { i: "Bornova", v: 32 }, { i: "Konak", v: 30 }, { i: "Karabağlar", v: 22 }],
  "2024": [{ i: "Bornova", v: 40 }, { i: "Buca", v: 38 }, { i: "Konak", v: 34 }, { i: "Gaziemir", v: 25 }],
  "2025": [{ i: "Bornova", v: 45 }, { i: "Karabağlar", v: 38 }, { i: "Buca", v: 35 }, { i: "Konak", v: 32 }]
};

function updateYearlyAnalysis() {
  const yearSelect = el("yearSelect");
  const canvas = el("top3DistrictsChart");
  const insight = el("yearInsight");
  if (!yearSelect || !canvas || !insight) return;

  const year = yearSelect.value;
  const data = (yearlyData[year] || []).slice().sort((a, b) => b.v - a.v).slice(0, 3);

  if (top3Chart) top3Chart.destroy();
  top3Chart = new Chart(canvas, {
    type: "polarArea",
    data: { labels: data.map(x => x.i), datasets: [{ data: data.map(x => x.v) }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  insight.innerHTML = `<b>${year}</b> yılı verilerine göre en riskli ilçe: <b>${data[0]?.i ?? "-"}</b>.`;
}

/* -----------------------
   6) Smart analysis (dashboard)
----------------------- */
function runSmartAnalysis() {
  const districtEl = el("analysisDistrict");
  const resultArea = el("smartAnalysisResult");
  const summaryEl = el("analysisSummary");
  const chartCanvas = el("dynamicComparisonChart");

  if (!districtEl || !resultArea || !summaryEl || !chartCanvas) return;

  const district = districtEl.value;
  resultArea.style.display = "block";

  const riskScore = Math.floor(Math.random() * 40 + 60);
  summaryEl.innerHTML = `<i class="fas fa-brain"></i> <b>KDS Analizi:</b> ${district} için verimlilik %${riskScore}.`;

  if (dynamicChart) dynamicChart.destroy();
  dynamicChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: ["Mevcut Hız", "Hedef Hız", "Personel Verimi", "Araç Uygunluğu"],
      datasets: [{ data: [Math.random() * 100, 90, Math.random() * 100, 85] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* -----------------------
   7) Admin simülasyon butonu (geo updateAnalysis ile)
----------------------- */
async function handleUpdate() {
  const threshold = Number(el("thresholdInput")?.value || 10);
  const improvement = Number(el("improvementRange")?.value || 22);

  // geo-logic.js içindeki updateAnalysis çalışırsa haritayı günceller
  if (typeof updateAnalysis === "function") {
    await updateAnalysis(threshold);
  }

  const simArea = el("simulationArea");
  if (simArea) simArea.style.display = "block";

  const currentAvg = 12.0;
  const simulatedAvg = Number((currentAvg * (1 - improvement / 100)).toFixed(1));

  if (el("currentTimeVal")) el("currentTimeVal").innerText = `${currentAvg} dk`;
  if (el("simTimeVal")) el("simTimeVal").innerText = `${simulatedAvg} dk`;

  const c1 = el("currentStatusChart");
  const c2 = el("simResultChart");

  if (c1) {
    if (currentStatusChart) currentStatusChart.destroy();
    currentStatusChart = new Chart(c1, {
      type: "bar",
      data: { labels: ["Ulaşım Süresi"], datasets: [{ data: [currentAvg] }] },
      options: { indexAxis: "y", responsive: true, plugins: { legend: { display: false } } }
    });
  }

  if (c2) {
    if (simResultChart) simResultChart.destroy();
    simResultChart = new Chart(c2, {
      type: "bar",
      data: { labels: ["Ulaşım Süresi"], datasets: [{ data: [simulatedAvg] }] },
      options: { indexAxis: "y", responsive: true, plugins: { legend: { display: false } } }
    });
  }
}

/* -----------------------
   8) KDS sağlık endeksi (sidebar)
----------------------- */
function updateKDSHealthIndex() {
  const sideCritical = el("sideCritical");
  const scoreEl = el("kdsIndexScore");
  const barEl = el("kdsIndexBar");
  const riskEl = el("sideRiskStatus");
  if (!sideCritical || !scoreEl || !barEl || !riskEl) return;

  const criticalCount = parseInt(sideCritical.innerText || "0", 10);
  let score = 95 - criticalCount * 3;
  score = Math.max(0, Math.min(100, score));

  scoreEl.innerText = `%${score.toFixed(0)}`;
  barEl.style.width = `${score}%`;

  if (score > 80) {
    riskEl.innerText = "DÜŞÜK";
  } else if (score > 60) {
    riskEl.innerText = "ORTA";
  } else {
    riskEl.innerText = "YÜKSEK";
  }
}

/* -----------------------
   9) Başlat
----------------------- */
window.addEventListener("load", () => {
  // API grafikleri
  loadAndDrawApiGraphs();
  loadAndDrawHospitalCapacity();

  // statik/demo grafikler
  initCostAnalysis();
  initTeamBubble();
  initDataCenterExtraCharts();

  // yıllık analiz
  updateYearlyAnalysis();

  // sağlık endeksi
  updateKDSHealthIndex();

  // select change event (yıl)
  const yearSelect = el("yearSelect");
  if (yearSelect) yearSelect.addEventListener("change", updateYearlyAnalysis);

  // smart analysis button/select değişince çalışsın
  const district = el("analysisDistrict");
  if (district) district.addEventListener("change", runSmartAnalysis);
});

/* Global fonksiyonları HTML onclick'ler için window'a aç */
window.runSmartAnalysis = runSmartAnalysis;
window.handleUpdate = handleUpdate;
