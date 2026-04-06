import express from "express";
import { 
    createReview, 
    getCakeReviews, 
    getUserReviews,
    deleteReview,
    markHelpful
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/cake/:cakeId", getCakeReviews);
router.get("/user/:userId", getUserReviews);
router.delete("/:reviewId", protect, deleteReview);
router.put("/:reviewId/helpful", protect, markHelpful);

export default router;