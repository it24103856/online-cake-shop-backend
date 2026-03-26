import express from "express";
import { 
    processPayment, 
    adminVerifyPayment, 
    getAllPayments, 
    deletePayment ,
    getMyPayments
} from "../controllers/paymentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/submit", protect, processPayment);

// Admin routes
router.get("/", protect, isAdmin, getAllPayments);          // Get all payments for the list
router.put("/verify", protect, isAdmin, adminVerifyPayment); // Approve or Reject
router.delete("/:id", protect, isAdmin, deletePayment);     // Delete a specific record
router.get("/my-payments", protect, getMyPayments);

export default router;