import express from "express"
import {  generateTripOverviewController, saveTripController } from "../controllers/tripController.js";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js"

router.post("/overview", generateTripOverviewController);
router.post("/save-trip", authMiddleware , saveTripController)
export default router;