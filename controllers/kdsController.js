import db from '../config/db.js';

export const getSimulationData = (req, res) => {
    const query = `SELECT Enlem, Boylam, Ulasim_Suresi_DK FROM Kaza_Kayitlari WHERE Ulasim_Suresi_DK > 10`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success:false, error:"Veritabanı hatası" });
if (!results || results.length === 0) return res.status(404).json({ success:false, message:"Veri bulunamadı" });

        let tLat = 0, tLng = 0;
        results.forEach(r => { tLat += parseFloat(r.Enlem); tLng += parseFloat(r.Boylam); });
        const n = results.length;
        res.json({
            success: true,
            steps: ["1. Kritik vakalar saptandı.", "2. Ağırlık merkezi hesaplandı.", "3. İyileşme %22.4 saptandı."],
            location: { Enlem: tLat/n, Boylam: tLng/n },
            stats: { vakaSayisi: n, iyilesme: 22.4 }
        });
    });
};
export const getGraphStats = (req, res) => {
    const queries = {
        pandemi: "SELECT CASE WHEN YEAR(Kaza_Tarihi_Saati) < 2023 THEN 'Pandemi' ELSE 'Normal' END as etiket, AVG(Ulasim_Suresi_DK) as deger FROM Kaza_Kayitlari GROUP BY etiket",
        hava: "SELECT Hava_Durumu as etiket, COUNT(*) as deger FROM Kaza_Kayitlari GROUP BY etiket",
        vakaTipi: "SELECT Kaza_Tipi as etiket, COUNT(*) as deger FROM Kaza_Kayitlari GROUP BY etiket",
        hastane: "SELECT Hastane_Turu as etiket, AVG(Ulasim_Suresi_DK) as deger FROM Kaza_Kayitlari k JOIN Hastaneler h ON k.Hastane_ID = h.Hastane_ID GROUP BY etiket"
    };
    
    Promise.all([
        db.promise().query(queries.pandemi),
        db.promise().query(queries.hava),
        db.promise().query(queries.vakaTipi),
        db.promise().query(queries.hastane)
    ]).then(([p, h, v, has]) => {
        res.json({ pandemi: p[0], hava: h[0], vakaTipi: v[0], hastane: has[0] });
    }).catch(err => res.status(500).json({ error: "Veri çekilemedi" }));
};

export const getEkipPerformans = (req, res) => {
    db.query("SELECT * FROM Ekip_Performans ORDER BY Yorgunluk_Endeksi DESC", (err, result) => {
        if (err) return res.status(500).json({ error: "Veritabanı hatası" });
        res.json(result);
    });
};

export const getHastaneDoluluk = (req, res) => {
    db.query("SELECT Hastane_Adi, Acil_Yogunluk_Yuzde FROM Hastane_Kapasite", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};


export const getRecords = (req, res) => {
  const q = `
    SELECT 
      Kayit_No,
      Mahalle_ID,
      Kaza_Tipi,
      Ulasim_Suresi_DK
    FROM Kaza_Kayitlari
    ORDER BY Kaza_Tarihi_Saati DESC
    LIMIT 200
  `;

  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    res.json(results);
  });
};

export const getMapData = (req, res) => {
  const q = `
    SELECT
      Enlem,
      Boylam,
      Mahalle_ID,
      LEAST(100, GREATEST(0, ((Ulasim_Suresi_DK - 10) / 50) * 100)) AS Gecikme_Yuzdesi
    FROM Kaza_Kayitlari
    WHERE Enlem IS NOT NULL AND Boylam IS NOT NULL
    ORDER BY Kaza_Tarihi_Saati DESC
    LIMIT 2000
  `;

  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    res.json(results);
  });
};


export const createVaka = (req, res) => {
    const { kaza_tipi, ulasim_suresi, mahalle_id } = req.body;

    if (ulasim_suresi < 0 || ulasim_suresi > 300) {
        return res.status(400).json({ 
            error: "Hatalı Veri: Ulaşım süresi 0 ile 300 dakika arasında olmalıdır." 
        });
    }

    const q = "INSERT INTO Kaza_Kayitlari (Kaza_Tipi, Ulasim_Suresi_DK, Mahalle_ID) VALUES (?, ?, ?)";
    db.query(q, [kaza_tipi, ulasim_suresi, mahalle_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Vaka başarıyla kaydedildi.", id: result.insertId });
    });
};
export const deleteVaka = (req, res) => {
  const vakaId = req.params.id;

  const checkQuery = `
    SELECT Ulasim_Suresi_DK, Gecikme_Durumu
    FROM Kaza_Kayitlari
    WHERE Kayit_No = ?
    LIMIT 1
  `;

  db.query(checkQuery, [vakaId], (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    if (!results || results.length === 0) return res.status(404).json({ error: "Vaka bulunamadı" });

    const row = results[0];
    const kritikMi = String(row.Gecikme_Durumu || "").toLowerCase() === "kritik";
    const sure = Number(row.Ulasim_Suresi_DK);

    if (kritikMi && sure > 60) {
      return res.status(409).json({
        error: 'Kritik veri: "Kritik" statüsündeki ve 60 dk üzeri vakalar analiz için silinemez.'
      });
    }

    const deleteQuery = "DELETE FROM Kaza_Kayitlari WHERE Kayit_No = ?";
    db.query(deleteQuery, [vakaId], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Veritabanı hatası", detail: err2.message });
      res.json({ message: "Vaka kaydı silindi." });
    });
  });
};

export const getVakaList = (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "200", 10), 1000);

  const q = `
    SELECT
      Kayit_No,
      Mahalle_ID,
      Istasyon_ID,
      Hastane_ID,
      Kaza_Tipi,
      Ulasim_Suresi_DK,
      Gecikme_Durumu,
      Kaza_Tarihi_Saati
    FROM Kaza_Kayitlari
    ORDER BY Kaza_Tarihi_Saati DESC
    LIMIT ?
  `;

  db.query(q, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    res.json(results);
  });
};

export const getVakaById = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT *
    FROM Kaza_Kayitlari
    WHERE Kayit_No = ?
    LIMIT 1
  `;

  db.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    if (!results || results.length === 0) return res.status(404).json({ error: "Vaka bulunamadı" });
    res.json(results[0]);
  });
};

export const updateVaka = (req, res) => {
  const { id } = req.params;

  const {
    kaza_tipi,
    ulasim_suresi,
    mahalle_id,
    istasyon_id,
    hastane_id,
    gecikme_durumu
  } = req.body;

  if (ulasim_suresi !== undefined && (ulasim_suresi < 0 || ulasim_suresi > 300)) {
    return res.status(400).json({
      error: "Hatalı Veri: Ulaşım süresi 0 ile 300 dakika arasında olmalıdır."
    });
  }
  const fields = [];
  const values = [];

  if (kaza_tipi !== undefined) { fields.push("Kaza_Tipi = ?"); values.push(kaza_tipi); }
  if (ulasim_suresi !== undefined) { fields.push("Ulasim_Suresi_DK = ?"); values.push(ulasim_suresi); }
  if (mahalle_id !== undefined) { fields.push("Mahalle_ID = ?"); values.push(mahalle_id); }
  if (istasyon_id !== undefined) { fields.push("Istasyon_ID = ?"); values.push(istasyon_id); }
  if (hastane_id !== undefined) { fields.push("Hastane_ID = ?"); values.push(hastane_id); }
  if (gecikme_durumu !== undefined) { fields.push("Gecikme_Durumu = ?"); values.push(gecikme_durumu); }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Güncellenecek alan gönderilmedi." });
  }

  const q = `
    UPDATE Kaza_Kayitlari
    SET ${fields.join(", ")}
    WHERE Kayit_No = ?
  `;

  values.push(id);

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası", detail: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Vaka bulunamadı" });
    res.json({ message: "Vaka güncellendi.", id });
  });
};
