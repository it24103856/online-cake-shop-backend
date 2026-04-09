import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

// 1. Process Payment (Saves automatically)
export const processPayment = async (req, res) => {
    try {
        const { orderID, paymentMethod, amount, receiptImage, referenceNumber } = req.body;

        const newPayment = new Payment({
            userId: req.user.id,  // Automatically add userId from authenticated user
            orderID,
            paymentMethod,
            amount,
            receiptImage,
            referenceNumber
        });

        if (paymentMethod === 'Cash on Delivery') {
            newPayment.status = 'Pending';
        }

        const savedPayment = await newPayment.save();

        res.status(201).json({ 
            success: true, 
            message: "Payment record created successfully", 
            data: savedPayment 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Admin Manual Approval
export const adminVerifyPayment = async (req, res) => {
    try {
        const { paymentId, status } = req.body; 

        const updatedPayment = await Payment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        );

        if (status === 'Completed' || status === 'Verified') {
            await Order.findByIdAndUpdate(updatedPayment.orderID, { paymentStatus: "Paid" });
        } else if (status === 'Failed' || status === 'Rejected') {
            await Order.findByIdAndUpdate(updatedPayment.orderID, { paymentStatus: "Pending" });
        }

        res.status(200).json({ success: true, message: `Payment marked as ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get All Payments (For Admin Dashboard)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('orderID').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Payment Record
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPayment = await Payment.findByIdAndDelete(id);

        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        res.status(200).json({ success: true, message: "Payment record deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyPayments = async (req, res) => {
    try {
        // req.user.id is provided via the protect middleware
        let payments = await Payment.find({ userId: req.user.id })
            .populate('orderID')
            .sort({ createdAt: -1 });

        // If no payments found by userId, try to find by orders belonging to user (fallback for legacy payments)
        if (payments.length === 0) {
            const userOrders = await Order.find({ userId: req.user.id }, '_id');
            const orderIds = userOrders.map(o => o._id);
            payments = await Payment.find({ orderID: { $in: orderIds } })
                .populate('orderID')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};