import Driver from "../models/Driver.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. Add a new driver (Admin only)
export const addDriver = async (req, res) => {
    try {
        const { name, email, phoneNumber, vehicleNumber, address, licenseNumber, password } = req.body;

        // Validation
        if (!name || !email || !phoneNumber || !vehicleNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone number, vehicle number, and password are required",
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        // Check if driver already exists
        const existingDriver = await Driver.findOne({
            $or: [{ email }, { phoneNumber }, { vehicleNumber }],
        });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: "A driver with this email, phone number, or vehicle number already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new driver
        const newDriver = new Driver({
            name,
            email,
            phoneNumber,
            vehicleNumber,
            address: address || "",
            licenseNumber: licenseNumber || "",
            password: hashedPassword,
        });

        const savedDriver = await newDriver.save();

        res.status(201).json({
            success: true,
            message: "Driver added successfully",
            data: savedDriver,
        });
    } catch (error) {
        console.error("Add Driver Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 2. Get all drivers (Admin only)
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ dateOfJoining: -1 });

        res.status(200).json({
            success: true,
            data: drivers,
            count: drivers.length,
        });
    } catch (error) {
        console.error("Get All Drivers Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 3. Get active drivers (for dropdown selection)
export const getActiveDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: drivers,
            count: drivers.length,
        });
    } catch (error) {
        console.error("Get Active Drivers Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 4. Get driver by ID
export const getDriverById = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            success: true,
            data: driver,
        });
    } catch (error) {
        console.error("Get Driver By ID Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 5. Update driver details (Admin only)
export const updateDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { name, email, phoneNumber, vehicleNumber, isActive, address, licenseNumber, password } = req.body;

        // Check if driver exists
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        // Check for duplicate email, phone, or vehicle number (excluding current driver)
        const duplicateCheck = await Driver.findOne({
            $and: [
                {
                    $or: [
                        { email: email || driver.email },
                        { phoneNumber: phoneNumber || driver.phoneNumber },
                        { vehicleNumber: vehicleNumber || driver.vehicleNumber },
                    ],
                },
                { _id: { $ne: driverId } },
            ],
        });

        if (duplicateCheck) {
            return res.status(400).json({
                success: false,
                message: "Email, phone number, or vehicle number already exists for another driver",
            });
        }

        // Prepare update data
        const updateData = {
            name: name || driver.name,
            email: email || driver.email,
            phoneNumber: phoneNumber || driver.phoneNumber,
            vehicleNumber: vehicleNumber || driver.vehicleNumber,
            isActive: isActive !== undefined ? isActive : driver.isActive,
            address: address !== undefined ? address : driver.address,
            licenseNumber: licenseNumber !== undefined ? licenseNumber : driver.licenseNumber,
        };

        // Handle password update if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long",
                });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Update driver
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Driver updated successfully",
            data: updatedDriver,
        });
    } catch (error) {
        console.error("Update Driver Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 6. Delete driver (Admin only)
export const deleteDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findByIdAndDelete(driverId);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Driver deleted successfully",
            data: driver,
        });
    } catch (error) {
        console.error("Delete Driver Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 7. Toggle driver active status
export const toggleDriverStatus = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        driver.isActive = !driver.isActive;
        await driver.save();

        res.status(200).json({
            success: true,
            message: `Driver status updated to ${driver.isActive ? "active" : "inactive"}`,
            data: driver,
        });
    } catch (error) {
        console.error("Toggle Driver Status Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 8. Driver Login
export const driverLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find driver with password field (which is normally hidden)
        const driver = await Driver.findOne({ email }).select("+password");

        if (!driver) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check if driver is active
        if (!driver.isActive) {
            return res.status(401).json({
                success: false,
                message: "Your account is inactive. Please contact admin.",
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, driver.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: driver._id,
                email: driver.email,
                role: "driver",
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                role: "driver",
            },
        });
    } catch (error) {
        console.error("Driver Login Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
