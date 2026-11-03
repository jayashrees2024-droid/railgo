
const mongoose = require("mongoose");

const userTicketSchema = new mongoose.Schema({
    pnr: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true
    },
    passengerName: {
        type: String,
        required: true
    },
    trainName: {
        type: String,
        required: true
    },
    trainNumber: {
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
    journeyDate: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    fare: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["Confirmed", "Waiting", "Cancelled"],
        default: "Confirmed"
    },

    // Payment information
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },
    paymentMethod: {
        type: String,
        default: ""
    },
    transactionId: {
        type: String,
        default: ""
    },
    paymentDate: {
        type: Date,
        default: null
    },

    // Cancellation information
    cancellationReason: {
        type: String,
        default: ""
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationFee: {
        type: Number,
        default: 0
    },
    refundAmount: {
        type: Number,
        default: 0
    },

    bookingDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("UserTicket", userTicketSchema);
