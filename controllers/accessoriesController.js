import Accessories from "../models/Accessories.js";

// 1. Add New Accessory
export const createAccessory = async (req, res) => {
    try {
        const newAccessory = new Accessories(req.body);
        const saved = await newAccessory.save();
        res.status(201).json({ 
            success: true, 
            message: "Item added successfully", 
            data: saved 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Accessories
export const getAllAccessories = async (req, res) => {
    try {
        // අලුතින්ම එකතු කරන අයිතම මුලින්ම පෙන්වීමට sort භාවිතා කළා
        const items = await Accessories.find().sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            count: items.length,
            data: items 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Single Accessory by ID
export const getAccessoryById = async (req, res) => {
    try {
        const item = await Accessories.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Accessory
export const updateAccessory = async (req, res) => {
    try {
        const updated = await Accessories.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json({ success: true, message: "Item updated", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete Accessory
export const deleteAccessory = async (req, res) => {
    try {
        await Accessories.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};