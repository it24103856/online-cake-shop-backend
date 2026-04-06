import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            userId: req.user.id  // Automatically add userId from authenticated user
        });
        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, message: "Order created successfully", data: savedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await Order.find({ "customer.email": email }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        let orders = await Order.find({ userId }).sort({ createdAt: -1 });
        
        // If no orders found by userId, try to find by customer email (for legacy orders)
        if (orders.length === 0 && req.user.email) {
            orders = await Order.find({ "customer.email": req.user.email }).sort({ createdAt: -1 });
        }
        
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order updated successfully", data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
