const express = require("express");
const router = express.Router();
const Station = require("../models/Station");

// ADD STATION
router.post("/", async function(req, res) {
    try {
        const {
            stationCode,
            stationName,
            city,
            state,
            platformCount,
            stationType,
            contactNumber,
            stationStatus
        } = req.body;

        const station = new Station({
            stationCode: stationCode,
            stationName: stationName,
            city: city,
            state: state,
            platformCount: Number(platformCount),
            stationType: stationType,
            contactNumber: contactNumber,
            stationStatus: stationStatus
        });

        await station.save();

        res.status(201).json({
            success: true,
            message: "Station added successfully",
            station: station
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// GET ALL STATIONS
router.get("/", async function(req, res) {
    try {
        const stations = await Station.find();

        res.json(stations);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE STATION
router.put("/:id", async function(req, res) {
    try {
        const station = await Station.findByIdAndUpdate(
            req.params.id,
            {
                stationCode: req.body.stationCode,
                stationName: req.body.stationName,
                city: req.body.city,
                state: req.body.state,
                platformCount: Number(req.body.platformCount),
                stationType: req.body.stationType,
                contactNumber: req.body.contactNumber,
                stationStatus: req.body.stationStatus
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }

        res.json({
            success: true,
            message: "Station updated successfully",
            station: station
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE STATION
router.delete("/:id", async function(req, res) {
    try {
        const station = await Station.findByIdAndDelete(
            req.params.id
        );

        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }

        res.json({
            success: true,
            message: "Station deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;