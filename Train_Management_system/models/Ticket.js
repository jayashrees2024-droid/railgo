const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({

    passengerName: {
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

    seatNumber: {
        type: String,
        required: true
    },

    ticketClass: {
        type: String,
        required: true
    },

    fare: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Booked"
    }

});

module.exports = mongoose.model("Ticket", ticketSchema);