import express from "express";
import { 
    createAccessory, 
    getAllAccessories, 
    getAccessoryById, 
    updateAccessory, 
    deleteAccessory 
} from "../controllers/accessoriesController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createAccessory);
router.get("/", getAllAccessories);
router.get("/:id", getAccessoryById);
router.put("/:id", protect, isAdmin, updateAccessory);
router.delete("/:id", protect, isAdmin, deleteAccessory);

export default router;