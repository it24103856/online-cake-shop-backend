import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";

// 1. Assign Delivery (Admin creates a delivery record)
export const assignDelivery = async (req, res) => {
    try {
        const { orderID, deliveryPerson, vehicleNumber, estimatedDeliveryTime } = req.body;

        const newDelivery = new Delivery({
            orderID,
            deliveryPerson,
            vehicleNumber,
            estimatedDeliveryTime
        });

        const savedDelivery = await newDelivery.save();

        // Update main Order status to 'shipped' automatically
        await Order.findByIdAndUpdate(orderID, { status: 'shipped' });

        res.status(201).json({ success: true, message: "Delivery assigned successfully", data: savedDelivery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Update Delivery Status (Driver/Admin updates status)
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = { deliveryStatus: status };
        if (status === 'Delivered') {
            updateData.actualDeliveryTime = new Date();
            // Update main Order status to 'delivered' when delivery is complete
            const delivery = await Delivery.findById(id);
            await Order.findByIdAndUpdate(delivery.orderID, { status: 'delivered' });
        }

        const updated = await Delivery.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get All Deliveries
export const getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find().populate('orderID');
        res.status(200).json({ success: true, data: deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Delivery Record
export const deleteDelivery = async (req, res) => {
    try {
        await Delivery.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Delivery record deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};