console.log("✅ coğrafi analiz js dosyası yüklendi");


/* public/js/geo-logic.js */

// Global Değişkenler (Eğer app-main.js'de tanımlıysa burada tekrar 'let' kullanmıyoruz)
var heatLayer, suggestionMarker;
var markers = [];

// 1. ANA HARİTA ANALİZ FONKSİYONU
async function updateAnalysis(threshold = 10) {
    // Harita nesnesi (map) başlatılmamışsa işlem yapma
    if (!map) {
        console.warn("Harita henüz başlatılmadı.");
        return;
    }

    // Mevcut katmanları temizle
    markers.forEach(m => map.removeLayer(m));
    if (heatLayer) map.removeLayer(heatLayer);
    if (suggestionMarker) map.removeLayer(suggestionMarker);
    markers = [];

    try {
        const res = await fetch('/api/map-data');
        if (!res.ok) throw new Error("Harita verisi alınamadı.");
        
        const data = await res.json();
        if (!data || !Array.isArray(data)) return;

        let heatPoints = [], riskPoints = [], criticalCount = 0;

        data.forEach(item => {
            const lat = parseFloat(item.Enlem);
            const lng = parseFloat(item.Boylam);
            if (isNaN(lat) || isNaN(lng)) return;

            const yuzde = parseFloat(item.Gecikme_Yuzdesi) || 0;
            const isCritical = yuzde >= threshold;
            const color = isCritical ? '#fd5d93' : '#1d8cf8';

            heatPoints.push([lat, lng, Math.min(yuzde / 100, 1)]);

            const m = L.circleMarker([lat, lng], { 
                radius: isCritical ? 9 : 5, 
                color: color, 
                fillOpacity: 0.7 
            }).addTo(map);

            m.bindPopup(`
                <div style="background: #1a1a2e; color: white; padding: 10px; border-radius: 10px; min-width: 180px;">
                    <b style="color: #00f2c3;">${item.Mahalle_Adi}</b><br>
                    Gecikme Oranı: <b style="color: ${color};">%${yuzde.toFixed(1)}</b>
                </div>
            `);
            markers.push(m);

            if (isCritical) { 
                criticalCount++; 
                riskPoints.push({lat, lng}); 
            }
        });

        // Heatmap katmanını oluştur (Kütüphane yüklüyse)
        if (heatPoints.length > 0 && typeof L.heatLayer === "function") {
            heatLayer = L.heatLayer(heatPoints, {radius: 25, blur: 15, max: 0.8}).addTo(map);
        }

        // KDS Ağırlık Merkezi (AI Önerisi)
        const aiBox = document.getElementById('aiSuggestionBox');
        if (riskPoints.length > 0) {
            const aLat = riskPoints.reduce((s, p) => s + p.lat, 0) / riskPoints.length;
            const aLng = riskPoints.reduce((s, p) => s + p.lng, 0) / riskPoints.length;
            suggestionMarker = L.circle([aLat, aLng], { radius: 800, color: '#00f2c3', fillOpacity: 0.3 }).addTo(map);
            
            if(aiBox) {
                aiBox.style.display = 'block';
                const aiText = document.getElementById('aiSuggestionText');
                if (aiText) {
                    aiText.innerHTML = `Kritik bölge merkezine yeni bir mobil istasyon kurulması süreyi <b>%22</b> iyileştirecektir.`;
                }
            }
        }

        // UI Sayacı Güncelle
        const sideCrit = document.getElementById('sideCritical');
        if (sideCrit) sideCrit.innerText = criticalCount;

    } catch (e) { 
        console.error("Harita verisi işlenirken hata:", e); 
    }
}

// 2. COĞRAFİ EK GRAFİKLER
function initGeoExtraCharts() {
    const commonOpt = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    };

    const ctxPerf = document.getElementById('geoPerformanceChart');
    if (ctxPerf) {
        new Chart(ctxPerf, {
            type: 'bar',
            data: {
                labels: ['Konak', 'Buca', 'Bornova', 'Çiğli'],
                datasets: [{ data: [11, 14, 12, 16], backgroundColor: ['#1d8cf8', '#ba54f5', '#00f2c3', '#fd5d93'] }]
            },
            options: commonOpt
        });
    }

    const ctxCat = document.getElementById('geoCategoryChart');
    if (ctxCat) {
        new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: ['Kaza', 'Hastalık', 'Yangın', 'Diğer'],
                datasets: [{ data: [40, 35, 15, 10], backgroundColor: ['#1d8cf8', '#ba54f5', '#fd5d93', '#00f2c3'] }]
            },
            options: { ...commonOpt, cutout: '70%' }
        });
    }
}

// 3. KAYNAK RADAR GRAFİĞİ
function loadResourceRadar() {
    const ctx = document.getElementById('resourceRadarChart');
    if (!ctx) return;
    
    if (window.myRadarChart) window.myRadarChart.destroy();
    
    window.myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Personel', 'Araç', 'Yoğunluk', 'Hız', 'Donanım'],
            datasets: [
                { label: 'Bornova', data: [65, 80, 95, 55, 70], borderColor: '#fd5d93', backgroundColor: 'rgba(253, 93, 147, 0.2)' },
                { label: 'Güzelbahçe', data: [90, 85, 40, 90, 95], borderColor: '#00f2c3', backgroundColor: 'rgba(0, 242, 195, 0.2)' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}



