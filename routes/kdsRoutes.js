import express from "express";
import {
  getEkipPerformans,
  getHastaneDoluluk,
  getGraphStats,
  getSimulationData,
  getRecords,
  getMapData,

  createVaka,
  deleteVaka,
  getVakaList,
  getVakaById,
  updateVaka
} from "../controllers/kdsController.js";

const router = express.Router();

router.get("/ekip-performans", getEkipPerformans);
router.get("/hastane-doluluk", getHastaneDoluluk);
router.get("/graphs", getGraphStats);
router.get("/simulation", getSimulationData);

router.get("/records", getRecords);
router.get("/map-data", getMapData);

router.post("/vaka", createVaka);
router.get("/vaka", getVakaList);
router.get("/vaka/:id", getVakaById);
router.put("/vaka/:id", updateVaka);
router.delete("/vaka/:id", deleteVaka);

export default router;

