import express from 'express';
import * as geoController from '../controllers/geoController.js';

const router = express.Router();

router.get('/', (req, res) => res.render('login'));

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@gmail.com' && password === '1234') {
        res.redirect('/dashboard');
    } else {
        res.status(401).send('Hatalı giriş! <a href="/">Geri Dön</a>');
    }
});

router.get('/api/map-data', geoController.getMapData); 
router.get('/vaka-analiz/:id', geoController.getVakaAnaliz);

export default router;
