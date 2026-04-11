import express from "express";
import { 
    createOrder, 
    getAllOrders, 
    getUserOrders, 
    getMyOrders,
    updateOrderStatus, 
    cancelOrder,
    deleteOrder 
} from "../Controllers/orderController.js";
import { isAdmin,protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, isAdmin, getAllOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/user/:email", protect, getUserOrders);
router.put("/:id", protect, isAdmin, updateOrderStatus);
router.put("/:id/cancel", protect, isAdmin, cancelOrder);
router.delete("/:id", protect, isAdmin, deleteOrder);

export default router;