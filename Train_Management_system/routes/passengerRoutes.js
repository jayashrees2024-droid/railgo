const express = require("express");
const router = express.Router();
const Passenger = require("../models/Passenger");

// ADD PASSENGER
router.post("/", async function(req, res) {
    try {
        const passenger = new Passenger({
            passengerName: req.body.passengerName,
            age: req.body.age,
            gender: req.body.gender,
            phone: req.body.phone,
            email: req.body.email,
            trainNumber: req.body.trainNumber
        });

        await passenger.save();

        res.status(201).json({
            success: true,
            message: "Passenger added successfully",
            passenger: passenger
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// GET ALL PASSENGERS
router.get("/", async function(req, res) {
    try {
        const passengers = await Passenger.find().sort({
            createdAt: -1
        });

        res.json(passengers);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load passengers",
            error: error.message
        });
    }
});

// GET ONE PASSENGER
router.get("/:id", async function(req, res) {
    try {
        const passenger = await Passenger.findById(req.params.id);

        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: "Passenger not found"
            });
        }

        res.json({
            success: true,
            passenger: passenger
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid passenger ID"
        });
    }
});

// UPDATE PASSENGER
router.put("/:id", async function(req, res) {
    try {
        const passenger = await Passenger.findByIdAndUpdate(
            req.params.id,
            {
                passengerName: req.body.passengerName,
                age: req.body.age,
                gender: req.body.gender,
                phone: req.body.phone,
                email: req.body.email,
                trainNumber: req.body.trainNumber
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: "Passenger not found"
            });
        }

        res.json({
            success: true,
            message: "Passenger updated successfully",
            passenger: passenger
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE PASSENGER
router.delete("/:id", async function(req, res) {
    try {
        const passenger = await Passenger.findByIdAndDelete(
            req.params.id
        );

        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: "Passenger not found"
            });
        }

        res.json({
            success: true,
            message: "Passenger deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete passenger",
            error: error.message
        });
    }
});

module.exports = router;
