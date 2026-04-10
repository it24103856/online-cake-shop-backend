import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Driver from "../models/Driver.js";

export const protect = async (req, res, next) => {
    let token;
    
    // Check whether Authorization header exists and starts with "Bearer "
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Extract token value
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            console.log("Decoded token:", decoded);
            
            // Check if this is a driver or user login
            if (decoded.role === "driver") {
                // It's a driver login
                req.user = await Driver.findById(decoded.id).select("-password");
                console.log("Driver found:", req.user);
            } else {
                // It's a user login
                req.user = await User.findById(decoded.id).select("-password");
                console.log("User found:", req.user);
            }
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User/Driver not found" });
            }
            
            next();
        } catch (error) {
            console.error("Token verification error:", error.message);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Not authorized as an admin" });
    }
};