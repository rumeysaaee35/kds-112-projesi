import db from '../config/db.js';
export const getDashboardPage = (req, res) => {
    res.render('dashboard'); 
};
export const getGeoAnalysisPage = (req, res) => {
    res.render('geo-analysis');
};
export const getSettingsPage = (req, res) => {
    res.render('settings');
};

export const getDataRecordsPage = (req, res) => {
    const query = `
        SELECT k.Kayit_No, m.Mahalle_Adi, k.Kaza_Tipi, k.Ulasim_Suresi_DK, k.Kaza_Tarihi_Saati 
        FROM Kaza_Kayitlari k
        JOIN Mahalle_Verileri m ON k.Mahalle_ID = m.Mahalle_ID
        ORDER BY k.Kaza_Tarihi_Saati DESC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Veritabanı hatası:", err);
            return res.status(500).send("Veritabanı verisi çekilirken bir hata oluştu.");
        }
        res.render('data-records', { 
            data: results,
            totalRecords: results.length,
            criticalCount: results.filter(r => r.Ulasim_Suresi_DK > 10).length
        }); 
    });
};
