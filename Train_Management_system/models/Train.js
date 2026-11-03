
const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    trainName: {
        type: String,
        required: true,
        trim: true
    },
    trainType: {
        type: String,
        default: "Express"
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    totalSeats: {
        type: Number,
        required: true,
        min: 0
    },
    availableSeats: {
        type: Number,
        required: true,
        min: 0
    },
    fare: {
        type: Number,
        required: true,
        min: 0
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Train", trainSchema);
