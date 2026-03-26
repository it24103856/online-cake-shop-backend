import express from "express";
import { 
    createOrder, 
    getAllOrders, 
    getUserOrders, 
    updateOrderStatus, 
    deleteOrder 
} from "../Controllers/orderController.js";
import { isAdmin,protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createOrder);
router.get("/", protect, isAdmin, getAllOrders);
router.get("/user/:email", protect, isAdmin, getUserOrders);
router.put("/:id", protect, isAdmin, updateOrderStatus);
router.delete("/:id", protect, isAdmin, deleteOrder);

export default router;