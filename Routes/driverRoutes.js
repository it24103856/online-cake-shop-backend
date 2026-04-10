import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
    addDriver,
    getAllDrivers,
    getActiveDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    toggleDriverStatus,
    driverLogin,
} from "../controllers/driverController.js";

const router = express.Router();

// Public route
router.post("/login", driverLogin);

// Admin routes (CRUD operations)
router.post("/add", protect, isAdmin, addDriver);
router.get("/all", protect, isAdmin, getAllDrivers);
router.get("/active", getActiveDrivers); // Public endpoint for dropdown
router.get("/:driverId", getDriverById);
router.put("/update/:driverId", protect, isAdmin, updateDriver);
router.delete("/delete/:driverId", protect, isAdmin, deleteDriver);
router.patch("/toggle-status/:driverId", protect, isAdmin, toggleDriverStatus);

export default router;
