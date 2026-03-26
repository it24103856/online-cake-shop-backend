import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // MongoDB auto-generated _id එක පාවිච්චි කරන නිසා orderID අවශ්‍ය නැත.
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    },
    items: [
        {            productID: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true,
                refPath: 'items.itemType' // Cake හෝ Accessories model එකට link වේ
            },
            itemType: {
                type: String,
                required: true,
                enum: ['Cake', 'Accessories'] // කුමන වර්ගයේ භාණ්ඩයක්ද යන්න
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            flavor: { type: String }, // Cake සඳහා පමණක් අවශ්‍ය නම්
            weight: { type: String }, // Cake සඳහා පමණක් අවශ්‍ය නම්
        }
    ],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Crypto', 'Bank Transfer', 'Online Transfer']
    },
    paymentStatus: {
        type: String,
        default: "Unpaid"
    },
    notes: { type: String, default: "" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;