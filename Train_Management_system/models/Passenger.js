
const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
    passengerName: {
        type: String,
        required: [true, "Passenger name is required"],
        trim: true
    },

    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [1, "Age must be at least 1"],
        max: [120, "Age cannot exceed 120"]
    },

    gender: {
        type: String,
        required: [true, "Please select gender"],
        enum: ["Male", "Female", "Other"]
    },

    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true
    },

    trainNumber: {
        type: String,
        required: [true, "Train number is required"],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Passenger", passengerSchema);
