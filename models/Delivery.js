import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    deliveryPerson: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    vehicleNumber: { type: String, required: true },
    deliveryStatus: {
        type: String,
        enum: ['Pending', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    estimatedDeliveryTime: { type: String }, // e.g., "2026-03-27 4:00 PM"
    actualDeliveryTime: { type: Date },

    image: { type: String }, // URL to the delivery image  
    
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);