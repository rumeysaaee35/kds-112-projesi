import express from "express";
import {
  getEkipPerformans,
  getHastaneDoluluk,
  getGraphStats,
  getSimulationData,
  getRecords,
  
} from "../controllers/kdsController.js";

const router = express.Router();

router.get("/ekip-performans", getEkipPerformans);
router.get("/hastane-doluluk", getHastaneDoluluk);
router.get("/graphs", getGraphStats);
router.get("/simulation", getSimulationData);

// yeni eklediklerimiz
router.get("/records", getRecords);


export default router;
