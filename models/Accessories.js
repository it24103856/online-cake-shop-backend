import mongoose from "mongoose";

const AccessoriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: [String], required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['Candles', 'Toppers', 'Cards', 'Balloons', 'Other'] 
    },
    quantity: { type: Number, required: true, default: 0 },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Accessories", AccessoriesSchema);