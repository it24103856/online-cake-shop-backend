import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Cake from "../models/Cake.js";

export const createReview = async (req, res) => {
    try {
        const { orderId, cakeId, rating, comment } = req.body;
        const userId = req.user.id; 

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Verify user owns this order
        if (order.userId && order.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only review your own orders." });
        }
        
        // Verify cake exists
        const cake = await Cake.findById(cakeId);
        if (!cake) {
            return res.status(404).json({ success: false, message: "Cake not found." });
        }

        // Verify order is delivered
        if (order.status !== "delivered") {
            return res.status(400).json({ success: false, message: "You can only review after your order has been delivered." });
        }

        // Check if review already exists for this order and cake
        const alreadyReviewed = await Review.findOne({ orderId, cakeId });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "You have already reviewed this item." });
        }

        // Create review
        const newReview = new Review({
            orderId,
            userId,
            cakeId,
            rating,
            comment
        });

        await newReview.save();

        // Update cake rating (simple average)
        const allReviews = await Review.find({ cakeId });
        const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
        await Cake.findByIdAndUpdate(cakeId, { rating: Math.round(avgRating * 10) / 10 });

        res.status(201).json({ success: true, message: "Thank you! Your review has been submitted successfully." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCakeReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ cakeId: req.params.cakeId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ userId })
            .populate("cakeId", "name")
            .populate("orderId", "totalPrice")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Check if user owns the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
        }

        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Check if user already marked as helpful
        const alreadyHelpful = review.helpfulBy.includes(userId);
        if (alreadyHelpful) {
            // Remove from helpful
            review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId);
            review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
        } else {
            // Add to helpful
            review.helpfulBy.push(userId);
            review.helpfulVotes += 1;
        }

        await review.save();
        res.status(200).json({ success: true, data: review, message: alreadyHelpful ? "Removed from helpful" : "Marked as helpful" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};