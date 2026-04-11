import express from "express";
import { 
    assignDelivery, 
    updateDeliveryStatus, 
    getAllDeliveries, 
    deleteDelivery ,
    updateDeliveryByDriver,
    getSingleDelivery,
    getDriverTasks,
    getUserDeliveries,
    getMyDeliveryTasks,
    markOrderAsReceivedByCustomer
} from "../controllers/deliveryController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific GET routes first
router.get("/my-tasks", protect, getMyDeliveryTasks);     // Driver gets their tasks
router.get("/my-orders", protect, getUserDeliveries);    // User gets their deliveries 
router.get("/track/:id", protect, getSingleDelivery);    // Track specific delivery

// POST and PUT routes
router.post("/assign", protect, isAdmin, assignDelivery);       // Admin assigns a driver
router.put("/update/:id", protect, isAdmin, updateDeliveryStatus); // Driver/Admin updates status
router.put("/driver-update/:id", protect, updateDeliveryByDriver); // Driver updates proof
router.patch("/order-received/:orderId", protect, markOrderAsReceivedByCustomer); // Customer confirms order received

// General routes
router.get("/", protect, isAdmin, getAllDeliveries);            // Admin views all delivery tasks
router.delete("/:id", protect, isAdmin, deleteDelivery);        // Delete delivery task
export default router;