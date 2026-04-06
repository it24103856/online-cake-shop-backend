import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // orderID is unnecessary since MongoDB provides an auto-generated _id
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
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
                refPath: 'items.itemType' // Links to Cake or Accessories model
            },
            itemType: {
                type: String,
                required: true,
                enum: ['Cake', 'Accessories'] // Indicates the product category
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            flavor: { type: String }, // Optional, mainly used for cakes
            weight: { type: String }, // Optional, mainly used for cakes
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