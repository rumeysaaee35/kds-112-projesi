/* public/js/app-main.js */

// Eğer backend başka porttaysa buraya yaz:
// const API_BASE = "http://localhost:8082";
const API_BASE = ""; // aynı origin ise boş kalsın

let map;

/* -----------------------
   URL builder (hatalı URL üretmesin)
----------------------- */
function api(path) {
  // path "/api/records" gibi gelmeli
  return `${API_BASE}${path}`;
}

/* -----------------------
   1) SAYFA GEÇİŞİ
----------------------- */
function switchPage(p, el) {
  const sections = document.querySelectorAll(".page-section");
  const links = document.querySelectorAll(".nav-link"); // <-- HATA BURADAYDI

  sections.forEach(s => s.classList.remove("active"));
  links.forEach(l => l.classList.remove("active"));

  const targetPage = document.getElementById("page-" + p);
  if (targetPage) {
    targetPage.classList.add("active");
    if (el) el.classList.add("active");

    if (p === "geo" && map) {
      setTimeout(() => map.invalidateSize(), 200);
    }
  }
}

/* -----------------------
   2) UYGULAMA BAŞLAT
----------------------- */
async function initApp() {
  console.log("Sistem modülleri yükleniyor...");

  // Harita
  const mapElement = document.getElementById("mapGeo");
  if (mapElement && window.L) {
    map = L.map("mapGeo").setView([38.42, 27.14], 11);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);
  }

  // Modüller (biri patlasa bile diğerleri çalışsın)
  try { await loadDashboardData(); } catch (e) { console.log("Dashboard verisi henüz hazır değil.", e); }
  try { await loadTableData(); } catch (e) { console.log("Tablo verisi henüz hazır değil.", e); }
  try { await loadKdsExtraData(); } catch (e) { console.log("Ekstra KDS verisi henüz hazır değil.", e); }
}

/* -----------------------
   3) TABLO
----------------------- */
async function loadTableData() {
  const tableBody = document.getElementById("tableBody");
  if (!tableBody) return;

  const resp = await fetch(api("/api/records"));

  if (!resp.ok) {
    console.error("Tablo endpoint hata:", resp.status, resp.statusText);
    return;
  }

  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await resp.text();
    console.error("Tablo JSON değil, gelen içerik:", text.slice(0, 200));
    return;
  }

  const data = await resp.json();
  if (!Array.isArray(data)) {
    console.error("records array değil:", data);
    return;
  }

  tableBody.innerHTML = data.slice(0, 10).map(rec => `
    <tr>
      <td>#${rec.Kayit_No ?? "-"}</td>
      <td>${rec.Mahalle_Adi ?? "-"}</td>
      <td>${rec.Kaza_Tipi ?? "-"}</td>
      <td>${rec.Ulasim_Suresi_DK ?? "-"} dk</td>
    </tr>
  `).join("");
}

/* -----------------------
   4) EKİP PERFORMANS
----------------------- */
async function loadKdsExtraData() {
  const ekipList = document.getElementById("ekipListesi");
  if (!ekipList) return;

  const resp = await fetch(api("/api/ekip-performans"));
  if (!resp.ok) return;

  const ekipler = await resp.json();
  if (!Array.isArray(ekipler)) return;

  ekipList.innerHTML = ekipler.map(e => {
    const y = Number(e.Yorgunluk_Endeksi ?? 0);
    const pct = Math.max(0, Math.min(1, y)) * 100;
    const barColor = y > 0.8 ? "red" : "green";

    return `
      <div class="ilce-item">
        <span>${e.Ekip_Ismi ?? "-"}</span>
        <div class="progress-bar" style="width:${pct}%; background:${barColor}"></div>
      </div>
    `;
  }).join("");
}

/* -----------------------
   5) GRAFİKLER
----------------------- */
async function loadDashboardData() {
  if (!window.Chart) {
    console.error("Chart.js yüklenmemiş (Chart undefined).");
    return;
  }

  const resp = await fetch(api("/api/graphs"));
  if (!resp.ok) {
    console.error("graphs endpoint hata:", resp.status, resp.statusText);
    return;
  }

  const data = await resp.json();

  const weatherEl = document.getElementById("weatherChart");
  if (weatherEl && data?.hava && Array.isArray(data.hava)) {
    new Chart(weatherEl, {
      type: "line",
      data: {
        labels: data.hava.map(x => x.etiket),
        datasets: [{ data: data.hava.map(x => x.deger) }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
}

/* -----------------------
   6) PANEL KAPAT
----------------------- */
function closeAnalizPanel() {
  const panel = document.getElementById("analizPanel");
  if (panel) panel.classList.remove("active");
}

window.addEventListener("load", initApp);
