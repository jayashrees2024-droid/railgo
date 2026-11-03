
const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({

    stationCode: {
        type: String,
        required: true,
        unique: true
    },

    stationName: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    platformCount: {
        type: Number,
        required: true
    },

    stationType: {
        type: String,
        required: true
    },

    contactNumber: {
        type: String,
        required: true
    },

    stationStatus: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model("Station", stationSchema);

