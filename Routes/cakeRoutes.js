import express from "express";
import { 
    createCake, 
    getAllCakes, 
    getCakeById, 
    updateCake, 
    deleteCake 
} from "../Controllers/cakeController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createCake);          // Create
router.get("/", getAllCakes);          // Read All
router.get("/:id", getCakeById);       // Read One
router.put("/:id", protect, isAdmin, updateCake);        // Update
router.delete("/:id", protect, isAdmin, deleteCake);     // Delete

export default router;