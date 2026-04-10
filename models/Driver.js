import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^[0-9\s\-\+\(\)]{10,}$/.test(v);
                },
                message: "Please provide a valid phone number",
            },
        },
        vehicleNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        address: {
            type: String,
            default: "",
        },
        licenseNumber: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        dateOfJoining: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
