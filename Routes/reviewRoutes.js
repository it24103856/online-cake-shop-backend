import express from "express";
import { 
    createReview, 
    getCakeReviews, 
    getUserReviews,
    deleteReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/cake/:cakeId", getCakeReviews);
router.get("/user/:userId", getUserReviews);
router.delete("/:reviewId", protect, deleteReview);

export default router;