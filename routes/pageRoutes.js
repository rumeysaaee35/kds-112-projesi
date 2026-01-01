import express from 'express';
import { 
    getDashboardPage, 
    getGeoAnalysisPage, 
    getSettingsPage, 
    getDataRecordsPage 
} from '../controllers/pageController.js';

const router = express.Router();

router.get('/dashboard', getDashboardPage);
router.get('/geo-analysis', getGeoAnalysisPage);
router.get('/settings', getSettingsPage);
router.get('/data-records', getDataRecordsPage);
router.get('/', (req, res) => res.render('login'));

export default router;
