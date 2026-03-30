import Cake from "../models/Cake.js";

// 1. Create Cake
export const createCake = async (req, res) => {
    try {
        const newCake = new Cake(req.body);
        const savedCake = await newCake.save();
        res.status(201).json({ success: true, message: "Cake created successfully", data: savedCake });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Cakes
export const getAllCakes = async (req, res) => {
    try {
        const cakes = await Cake.find().sort({ createdAt: -1 }); // Newest items first
        res.status(200).json({ 
            success: true, 
            data: cakes // Frontend expects the list inside "data"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Single Cake by ID
export const getCakeById = async (req, res) => {
    try {
        const cake = await Cake.findById(req.params.id);
        if (!cake) return res.status(404).json({ success: false, message: "Cake not found" });
        res.status(200).json({ success: true, data: cake });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Cake
export const updateCake = async (req, res) => {
    try {
        const updatedCake = await Cake.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json({ success: true, message: "Cake updated successfully", data: updatedCake });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete Cake
export const deleteCake = async (req, res) => {
    try {
        await Cake.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Cake deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};