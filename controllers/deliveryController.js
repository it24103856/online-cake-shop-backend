import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";

// 1. Assign Delivery
export const assignDelivery = async (req, res) => {
    try {
        const { orderID, deliveryPerson, vehicleNumber, estimatedDeliveryTime } = req.body;

        const existingDelivery = await Delivery.findOne({ orderID });
        if (existingDelivery) {
            return res.status(400).json({ 
                success: false, 
                message: "A driver has already been assigned to this order." 
            });
        }

        const newDelivery = new Delivery({
            orderID,
            deliveryPerson,
            vehicleNumber,
            estimatedDeliveryTime
        });

        const savedDelivery = await newDelivery.save();
        await Order.findByIdAndUpdate(orderID, { status: 'shipped' });

        res.status(201).json({ success: true, message: "Delivery assigned successfully", data: savedDelivery });
    } catch (error) {
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

        if (status === 'Delivered') {
            updateData.actualDeliveryTime = new Date();
            const delivery = await Delivery.findById(id);
            if (delivery) {
                await Order.findByIdAndUpdate(delivery.orderID, { status: 'delivered' });
            }
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
        // 1. Get the logged-in user's email (from token)
        const currentUserEmail = req.user.email; 

        // 2. Fetch all deliveries from the database
        const allDeliveries = await Delivery.find()
            .populate({
                path: 'orderID',
                // Include details including customer email
                select: 'customer items totalPrice status createdAt' 
            })
            .populate('deliveryPerson', 'name phone')
            .sort({ createdAt: -1 })
            .lean();

        // 3. Return all deliveries with current user's email in the response
        res.status(200).json({
            success: true,
            currentUserEmail: currentUserEmail, // Needed for comparison on frontend
            data: allDeliveries
        });

    } catch (error) {
        console.error("Fetch Deliveries Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while fetching data." 
        });
    }
};