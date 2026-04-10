import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";
import mongoose from "mongoose"; // මෙය අනිවාර්යයෙන්ම අවශ්‍යයි
// 1. Assign Delivery
export const assignDelivery = async (req, res) => {
    try {
        const { orderID, driverId, estimatedDeliveryTime } = req.body;

        // Validation
        if (!orderID || !driverId) {
            return res.status(400).json({ success: false, message: "Order ID and Driver ID are required" });
        }

        const existingDelivery = await Delivery.findOne({ orderID });
        if (existingDelivery) {
            return res.status(400).json({ 
                success: false, 
                message: "A driver has already been assigned to this order." 
            });
        }

        // Get the order to retrieve userId
        const order = await Order.findById(orderID);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Get driver details
        const Driver = (await import("../models/Driver.js")).default;
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        const newDelivery = new Delivery({
            userId: order.userId,
            orderID,
            driverId,
            // Populate legacy fields for backward compatibility
            deliveryPerson: {
                name: driver.name,
                phone: driver.phoneNumber
            },
            vehicleNumber: driver.vehicleNumber,
            estimatedDeliveryTime
        });

        const savedDelivery = await newDelivery.save();
        
        // Update order status
        await Order.findByIdAndUpdate(orderID, { status: 'shipped' });

        res.status(201).json({ success: true, message: "Delivery assigned successfully", data: savedDelivery });
    } catch (error) {
        console.error("Assign Delivery Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Update Delivery Status (Admin/General Update)
// Updated to allow imageUrl updates as well
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, imageUrl } = req.body; // Reads imageUrl too if frontend sends it

        const updateData = { deliveryStatus: status };
        
        // Add image to update payload if provided
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        // Get the delivery first to check if userId is set
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" });
        }

        // If userId is not set, get it from the order
        if (!delivery.userId && delivery.orderID) {
            const order = await Order.findById(delivery.orderID);
            if (order && order.userId) {
                updateData.userId = order.userId;
            }
        }

        if (status === 'Delivered') {
            updateData.actualDeliveryTime = new Date();
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

// 5. Driver Status Update with Image (Proof of Delivery)
export const updateDeliveryByDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body; // Only image is sent, not status

        const updateData = { 
            image: imageUrl,
            // Status is not set to 'Delivered' at this stage.
            // If needed, a temporary status like 'Proof Uploaded' can be used.
        };

        const updated = await Delivery.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true }
        );

        res.status(200).json({ success: true, message: "Photo uploaded successfully. Please wait for admin confirmation.", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 6. Get Single Delivery
export const getSingleDelivery = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Delivery ID" });
        }

        const delivery = await Delivery.findOne({ orderID: id }).populate("orderID");

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" });
        }

        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Get Driver Tasks
export const getDriverTasks = async (req, res) => {
    try {
        // සියලුම deliveries ලබා ගන්න (Filter නොකර)
        const tasks = await Delivery.find().populate('orderID').sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: tasks,
            driverPhone: req.user.phone // Frontend එකේදී check කරගන්න ඩ්‍රයිවර්ගේ phone එකත් යවනවා
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};  

export const getUserDeliveries = async (req, res) => {
    try {
        const userId = req.user.id;

        // First, try to fetch deliveries by userId (new way)
        let userDeliveries = await Delivery.find({ userId })
            .populate({
                path: 'orderID',
                select: 'customer items totalPrice status createdAt' 
            })
            .populate('deliveryPerson', 'name phone')
            .sort({ createdAt: -1 });

        // If no deliveries found by userId, find user's orders and fetch their deliveries (fallback for legacy deliveries)
        if (userDeliveries.length === 0) {
            const userOrders = await Order.find({ userId }, '_id');
            const orderIds = userOrders.map(o => o._id);
            userDeliveries = await Delivery.find({ orderID: { $in: orderIds } })
                .populate({
                    path: 'orderID',
                    select: 'customer items totalPrice status createdAt' 
                })
                .populate('deliveryPerson', 'name phone')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            data: userDeliveries
        });

    } catch (error) {
        console.error("Fetch Deliveries Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while fetching data." 
        });
    }
};

// Get Driver's Assigned Deliveries
export const getMyDeliveryTasks = async (req, res) => {
    try {
        console.log("Fetching driver tasks...");
        console.log("req.user:", req.user);
        
        const driverId = req.user?._id; // Driver ID from JWT token (MongoDB uses _id not id)

        if (!driverId) {
            console.log("No driver ID found in token");
            return res.status(401).json({
                success: false,
                message: "Driver ID not found in token"
            });
        }

        console.log("Looking for deliveries with driverId:", driverId);

        // Get all deliveries assigned to this driver
        const driverDeliveries = await Delivery.find({ driverId: driverId })
            .populate('orderID')
            .sort({ createdAt: -1 });

        console.log("Found " + driverDeliveries.length + " deliveries");

        // If no deliveries yet, return empty array
        if (!driverDeliveries || driverDeliveries.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No deliveries assigned yet"
            });
        }

        // Format response with customer details
        const tasks = driverDeliveries.map(delivery => {
            try {
                return {
                    _id: delivery._id,
                    orderID: delivery.orderID?._id,
                    customerName: delivery.orderID?.customer?.name || "Unknown",
                    customerPhone: delivery.orderID?.customer?.phone || "N/A",
                    customerAddress: delivery.orderID?.customer?.address || "N/A",
                    deliveryStatus: delivery.deliveryStatus,
                    estimatedDeliveryTime: delivery.estimatedDeliveryTime,
                    image: delivery.image,
                    createdAt: delivery.createdAt
                };
            } catch (mapError) {
                console.error("Error mapping delivery:", mapError);
                return null;
            }
        }).filter(task => task !== null);

        res.status(200).json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error("Fetch Driver Tasks Error:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message || "An error occurred while fetching driver tasks."
        });
    }
};