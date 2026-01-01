import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import kdsRoutes from './routes/kdsRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use('/', pageRoutes); 
app.use('/', authRoutes);
app.use('/api', kdsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(` 112 AKILLI KDS Aktif: http://localhost:${PORT}`);
});
