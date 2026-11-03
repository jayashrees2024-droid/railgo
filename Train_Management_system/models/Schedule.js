
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: true
    },
    trainName: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    journeyDate: {
        type: String,
        required: true
    },
    scheduleStatus: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
