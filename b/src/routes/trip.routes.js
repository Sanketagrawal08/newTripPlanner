import express from "express"
import {  acceptInvite, generateTripOverviewController, getTripListController, rejectInvite, saveTripController, sendInviteFriends } from "../controllers/tripController.js";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js"

router.post("/overview", generateTripOverviewController);
router.post("/save-trip", authMiddleware , saveTripController)
router.get("/get-trip-lists", authMiddleware , getTripListController)
router.post("/:tripId/invite", authMiddleware, sendInviteFriends)
router.post("/:tripId/accept", authMiddleware, acceptInvite)
router.post("/:tripId/reject" , authMiddleware , rejectInvite)

export default router;