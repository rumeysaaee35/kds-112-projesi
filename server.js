import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import kdsRoutes from './routes/kdsRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');

// ÖNEMLİ: Statik dosyalar her şeyden önce gelmeli// server.js içinde bu satırı tam olarak böyle yaz:
// server.js içinde bu satırı tam olarak böyle güncelle:
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// --- ROTALARIN DOĞRU BAĞLANMASI ---

// Sayfalar (Login, Dashboard vb.) doğrudan ana dizinden çalışmalı
app.use('/', pageRoutes); 

// Giriş işlemleri
app.use('/', authRoutes);

// Sadece veri çeken API'ler /api altında kalabilir
app.use('/api', kdsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 112 AKILLI KDS Aktif: http://localhost:${PORT}`);
});