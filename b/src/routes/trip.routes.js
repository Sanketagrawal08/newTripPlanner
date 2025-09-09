import express from "express"
import {  generateTripOverviewController, getTripListController, saveTripController } from "../controllers/tripController.js";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js"

router.post("/overview", generateTripOverviewController);
router.post("/save-trip", authMiddleware , saveTripController)
router.get("/get-trip-lists", authMiddleware , getTripListController)

export default router;