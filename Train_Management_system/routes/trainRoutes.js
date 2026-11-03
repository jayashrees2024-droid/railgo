
const express = require("express");
const router = express.Router();
const Train = require("../models/Train");

// GET ALL TRAINS
router.get("/", async function (req, res) {
    try {
        const trains = await Train.find().sort({ trainNumber: 1 });
        res.json(trains);
    } catch (error) {
        console.log("Load trains error:", error);
        res.status(500).json({ message: "Unable to load trains" });
    }
});

// GET ONE TRAIN
router.get("/:id", async function (req, res) {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.json(train);
    } catch (error) {
        res.status(400).json({ message: "Invalid train ID or unable to load train" });
    }
});

// ADD TRAIN
router.post("/", async function (req, res) {
    try {
        const {
            trainNumber,
            trainName,
            trainType,
            source,
            destination,
            totalSeats,
            fare,
            departureTime,
            arrivalTime
        } = req.body;

        if (
            !trainNumber || !trainName || !trainType ||
            !source || !destination ||
            totalSeats === undefined || totalSeats === "" ||
            fare === undefined || fare === "" ||
            !departureTime || !arrivalTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all train details"
            });
        }

        const seats = Number(totalSeats);
        const ticketFare = Number(fare);

        if (
            !Number.isInteger(seats) || seats < 1 ||
            !Number.isFinite(ticketFare) || ticketFare < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid seats and fare"
            });
        }

        const number = String(trainNumber).trim();

        const existingTrain = await Train.findOne({ trainNumber: number });

        if (existingTrain) {
            return res.status(400).json({
                success: false,
                message: "Train number already exists"
            });
        }

        const train = new Train({
            trainNumber: number,
            trainName: String(trainName).trim(),
            trainType: trainType,
            source: String(source).trim(),
            destination: String(destination).trim(),
            totalSeats: seats,
            availableSeats: seats,
            fare: ticketFare,
            departureTime: departureTime,
            arrivalTime: arrivalTime
        });

        await train.save();

        res.status(201).json({
            success: true,
            message: "Train added successfully",
            train: train
        });

    } catch (error) {
        console.log("Add train error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Train number already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to add train"
        });
    }
});

// UPDATE TRAIN
router.put("/:id", async function (req, res) {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: "Train not found"
            });
        }

        const {
            trainNumber,
            trainName,
            trainType,
            source,
            destination,
            totalSeats,
            fare,
            departureTime,
            arrivalTime
        } = req.body;

        if (
            !trainNumber || !trainName || !trainType ||
            !source || !destination ||
            totalSeats === undefined || totalSeats === "" ||
            fare === undefined || fare === "" ||
            !departureTime || !arrivalTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all train details"
            });
        }

        const seats = Number(totalSeats);
        const ticketFare = Number(fare);

        if (
            !Number.isInteger(seats) || seats < 1 ||
            !Number.isFinite(ticketFare) || ticketFare < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid seats and fare"
            });
        }

        const number = String(trainNumber).trim();

        const duplicate = await Train.findOne({
            trainNumber: number,
            _id: { $ne: train._id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Train number already exists"
            });
        }

        // Preserve the number of seats already booked.
        const oldTotal = Number(train.totalSeats);
        const oldAvailable = Number(train.availableSeats);

        if (
            !Number.isFinite(oldTotal) ||
            !Number.isFinite(oldAvailable) ||
            oldTotal < 1 ||
            oldAvailable < 0 ||
            oldAvailable > oldTotal
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid existing seat data. Check the train's seat records."
            });
        }

        const bookedSeats = oldTotal - oldAvailable;

        if (seats < bookedSeats) {
            return res.status(400).json({
                success: false,
                message: "Total seats cannot be less than booked seats: " + bookedSeats
            });
        }

        train.trainNumber = number;
        train.trainName = String(trainName).trim();
        train.trainType = trainType;
        train.source = String(source).trim();
        train.destination = String(destination).trim();
        train.totalSeats = seats;
        train.availableSeats = seats - bookedSeats;
        train.fare = ticketFare;
        train.departureTime = departureTime;
        train.arrivalTime = arrivalTime;

        await train.save();

        res.json({
            success: true,
            message: "Train updated successfully",
            train: train
        });

    } catch (error) {
        console.log("Train update error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update train"
        });
    }
});

// DELETE TRAIN
router.delete("/:id", async function (req, res) {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: "Train not found"
            });
        }

        // Avoid deleting a train that still has booked seats.
        const total = Number(train.totalSeats);
        const available = Number(train.availableSeats);

        if (
            Number.isFinite(total) &&
            Number.isFinite(available) &&
            total > available
        ) {
            return res.status(400).json({
                success: false,
                message: "This train has booked seats and cannot be deleted."
            });
        }

        await Train.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Train deleted successfully"
        });

    } catch (error) {
        console.log("Delete train error:", error);

        res.status(400).json({
            success: false,
            message: "Unable to delete train. Check the train ID."
        });
    }
});

module.exports = router;
