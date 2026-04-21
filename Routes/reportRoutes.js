import express from "express";
import { getFullReport } from "../controllers/reportController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to fetch full report data (admin only)
router.get("/full-report", protect, isAdmin, getFullReport);

export default router;
