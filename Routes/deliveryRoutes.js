import express from "express";
import { 
    assignDelivery, 
    updateDeliveryStatus, 
    getAllDeliveries, 
    deleteDelivery 
} from "../controllers/deliveryController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assign", protect, isAdmin, assignDelivery);       // Admin assigns a driver
router.put("/update/:id", protect, isAdmin, updateDeliveryStatus); // Driver/Admin updates status
router.get("/", protect, isAdmin, getAllDeliveries);            // Admin views all delivery tasks
router.delete("/:id", protect, isAdmin, deleteDelivery);        // Delete delivery task

export default router;