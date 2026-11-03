const express = require("express");
const router = express.Router();

const Schedule = require("../models/Schedule");

// ADD SCHEDULE
router.post("/", async function(req, res) {
    try {
        const {
            trainNumber,
            trainName,
            source,
            destination,
            journeyDate,
            departureTime,
            arrivalTime,
            status,
            scheduleStatus
        } = req.body;

        if (
            !trainNumber ||
            !trainName ||
            !source ||
            !destination ||
            !journeyDate ||
            !departureTime ||
            !arrivalTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required schedule details."
            });
        }

        const schedule = new Schedule({
            trainNumber: String(trainNumber).trim(),
            trainName: String(trainName).trim(),
            source: String(source).trim(),
            destination: String(destination).trim(),
            journeyDate,
            departureTime,
            arrivalTime,
            scheduleStatus: scheduleStatus || status || "Scheduled"
        });

        await schedule.save();

        return res.status(201).json({
            success: true,
            message: "Schedule added successfully.",
            schedule
        });

    } catch (error) {
        console.error("Add schedule error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// GET ALL SCHEDULES
router.get("/", async function(req, res) {
    try {
        const schedules = await Schedule.find().sort({
            journeyDate: 1
        });

        return res.json({
            success: true,
            schedules
        });

    } catch (error) {
        console.error("Get schedules error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load schedules."
        });
    }
});


// GET ONE SCHEDULE
router.get("/:id", async function(req, res) {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found."
            });
        }

        return res.json({
            success: true,
            schedule
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid schedule ID."
        });
    }
});


// UPDATE SCHEDULE
router.put("/:id", async function(req, res) {
    try {
        const {
            trainNumber,
            trainName,
            source,
            destination,
            journeyDate,
            departureTime,
            arrivalTime,
            status,
            scheduleStatus
        } = req.body;

        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            {
                trainNumber,
                trainName,
                source,
                destination,
                journeyDate,
                departureTime,
                arrivalTime,
                scheduleStatus: scheduleStatus || status || "Scheduled"
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found."
            });
        }

        return res.json({
            success: true,
            message: "Schedule updated successfully.",
            schedule
        });

    } catch (error) {
        console.error("Update schedule error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// DELETE SCHEDULE
router.delete("/:id", async function(req, res) {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found."
            });
        }

        return res.json({
            success: true,
            message: "Schedule deleted successfully."
        });

    } catch (error) {
        console.error("Delete schedule error:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to delete schedule."
        });
    }
});

module.exports = router;