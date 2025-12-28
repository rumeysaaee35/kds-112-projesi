import db from '../config/db.js';

// Harita Üzerindeki Isı ve Marker Verisi
export const getMapData = (req, res) => {
    const query = `
        SELECT m.Mahalle_Adi, m.Ilce_Adi, m.Enlem, m.Boylam,
            COUNT(k.Kayit_No) as Toplam_Vaka,
            AVG(k.Ulasim_Suresi_DK) as Ortalama_Sure,
            (SUM(CASE WHEN k.Ulasim_Suresi_DK > 10 THEN 1 ELSE 0 END) / COUNT(k.Kayit_No)) * 100 as Gecikme_Yuzdesi
        FROM Mahalle_Verileri m
        LEFT JOIN Kaza_Kayitlari k ON m.Mahalle_ID = k.Mahalle_ID
        GROUP BY m.Mahalle_ID, m.Mahalle_Adi, m.Ilce_Adi, m.Enlem, m.Boylam
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
};

// Tekil Vaka KDS Analizi (Radar Grafik İçin)
export const getVakaAnaliz = (req, res) => {
    const vakaId = req.params.id;
    const query = `
        SELECT k.*, m.Nufus FROM Kaza_Kayitlari k 
        LEFT JOIN Mahalle_Verileri m ON k.Mahalle_ID = m.Mahalle_ID 
        WHERE k.Kayit_No = ?`;

    db.query(query, [vakaId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Vaka bulunamadı." });
        const vaka = results[0];
        const analiz = {
            labels: ['Hız', 'Hava', 'Yoğunluk', 'Güzergah', 'Ekip'],
            data: [ vaka.Ulasim_Suresi_DK < 12 ? 95 : 60, vaka.Hava_Durumu === 'Açık' ? 100 : 45, vaka.Nufus > 30000 ? 40 : 85, 75, 80 ],
            oneri: vaka.Ulasim_Suresi_DK > 10 
                ? `KRİTİK: ${vaka.Hava_Durumu} hava şartları ve yüksek nüfus yoğunluğu ulaşımı geciktirdi.`
                : "OPTIMAL: Mevcut müdahale süresi standartlara uygundur."
        };
        res.json(analiz);
    });
};