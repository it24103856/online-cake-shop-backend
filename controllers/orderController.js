import Order from "../models/Order.js";
import Cake from "../models/Cake.js";
import Accessories from "../models/Accessories.js";
import User from "../models/User.js";

const MANAGED_ORDER_STATUSES = ["pending", "processing", "shipped"];

const updateLoyaltyStatus = async (userId) => {
    try {
        const orders = await Order.find({ userId, status: 'delivered' });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Define loyalty criteria: 5+ orders OR 5000+ total spending
        const isLoyal = totalOrders >= 5 || totalSpent >= 5000;

        await User.findByIdAndUpdate(userId, {
            totalOrders,
            totalSpent,
            isLoyal
        });
    } catch (error) {
        console.error("Error updating loyalty status:", error);
    }
};

export const createOrder = async (req, res) => {
    try {
        const session = await Order.startSession();
        let savedOrder = null;

        try {
            await session.withTransaction(async () => {
                const items = Array.isArray(req.body.items) ? req.body.items : [];

                if (items.length === 0) {
                    throw new Error("Cart is empty.");
                }

                for (const item of items) {
                    const requestedQuantity = Number(item.quantity);

                    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
                        throw new Error("Invalid item quantity.");
                    }

                    const productModel = item.itemType === 'Accessories' ? Accessories : Cake;
                    const reservedProduct = await productModel.findOneAndUpdate(
                        {
                            _id: item.productID,
                            quantity: { $gte: requestedQuantity }
                        },
                        { $inc: { quantity: -requestedQuantity } },
                        { new: true, session }
                    );

                    if (!reservedProduct) {
                        throw new Error(`Insufficient stock available for ${item.name}.`);
                    }
                }

                const newOrder = new Order({
                    ...req.body,
                    userId: req.user.id
                });

                savedOrder = await newOrder.save({ session });
            });
        } finally {
            await session.endSession();
        }

        res.status(201).json({ success: true, message: "Order created successfully", data: savedOrder });
    } catch (error) {
        const message = error.message === "Cart is empty." || error.message === "Invalid item quantity."
            ? error.message
            : error.message?.includes("Insufficient stock available")
                ? "Insufficient stock available."
                : error.message;

        res.status(400).json({ success: false, message });
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
        const { status } = req.body;

        if (!status || !MANAGED_ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Order status must be pending, processing, or shipped."
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (updatedOrder.status === 'delivered') {
            await updateLoyaltyStatus(updatedOrder.userId);
        }

        res.status(200).json({ success: true, message: "Order updated successfully", data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status === "shipped" || order.status === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Completed orders cannot be cancelled."
            });
        }

        if (order.status === "cancelled") {
            return res.status(200).json({
                success: true,
                message: "Order is already cancelled.",
                data: order
            });
        }

        order.status = "cancelled";
        await order.save();

        res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
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
