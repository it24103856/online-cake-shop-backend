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
                message: "මෙම ඇණවුමට දැනටමත් රියදුරෙකු පත් කර ඇත." 
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
// මෙහි imageUrl එකත් update කළ හැකි ලෙස වෙනස් කරන ලදී
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, imageUrl } = req.body; // Frontend එකෙන්imageUrl එකත් එවන්නේ නම් එය ලබා ගනී

        const updateData = { deliveryStatus: status };
        
        // පින්තූරයක් ඇත්නම් එයද updateData වලට එකතු කරයි
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
        const { imageUrl } = req.body; // Status එක එවන්නේ නැත, රූපය පමණි

        const updateData = { 
            image: imageUrl,
            // මෙතනදී status එක 'Delivered' කරන්නේ නැහැ. 
            // අවශ්‍ය නම් 'Proof Uploaded' වැනි තාවකාලික status එකක් දාන්නත් පුළුවන්.
        };

        const updated = await Delivery.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true }
        );

        res.status(200).json({ success: true, message: "ඡායාරූපය සාර්ථකව ලැබුණි. Admin තහවුරු කරන තෙක් රැඳී සිටින්න.", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 6. Get Single Delivery
export const getSingleDelivery = async (req, res) => {
    try {
        const { id } = req.params;

        // ID එක valid MongoDB ID එකක්දැයි බලන්න
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
        const driverPhone = req.user.phone; 
        const tasks = await Delivery.find({ 
            "deliveryPerson.phone": driverPhone,
            deliveryStatus: { $ne: "Delivered" } 
        }).populate('orderID');

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserDeliveries = async (req, res) => {
    try {
        // 1. ලොග් වී සිටින පරිශීලකයාගේ Email එක ලබා ගැනීම (Token එකෙන්)
        const currentUserEmail = req.user.email; 

        // 2. Database එකේ ඇති සියලුම Deliveries ලබා ගැනීම
        const allDeliveries = await Delivery.find()
            .populate({
                path: 'orderID',
                // පාරිභෝගිකයාගේ email එක ඇතුළු විස්තර ලබා ගැනීම
                select: 'customer items totalPrice status createdAt' 
            })
            .populate('deliveryPerson', 'name phone')
            .sort({ createdAt: -1 })
            .lean();

        // 3. සියලුම දත්ත සහ වත්මන් පරිශීලකයාගේ Email එක Response එක ලෙස යැවීම
        res.status(200).json({
            success: true,
            currentUserEmail: currentUserEmail, // Frontend එකේදී Compare කිරීමට මෙය අවශ්‍ය වේ
            data: allDeliveries
        });

    } catch (error) {
        console.error("Fetch Deliveries Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය." 
        });
    }
};