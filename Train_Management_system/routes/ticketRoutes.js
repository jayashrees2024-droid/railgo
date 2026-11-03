
const express = require("express");
const router = express.Router();

const Ticket = require("../models/Ticket");
const UserTicket = require("../models/UserTicket");
const Train = require("../models/Train");

// ================= BOOK ADMIN TICKET =================

router.post("/", async (req, res) => {
    try {
        const {
            passengerName,
            trainNumber,
            source,
            destination,
            journeyDate,
            seatNumber,
            ticketClass,
            fare
        } = req.body;

        const train = await Train.findOne({
            trainNumber: trainNumber
        });

        if (!train) {
            return res.status(404).json({
                message: "Train not found"
            });
        }

        if (train.availableSeats <= 0) {
            return res.status(400).json({
                message: "No tickets available"
            });
        }

        train.availableSeats -= 1;
        await train.save();

        const ticket = new Ticket({
            passengerName,
            trainNumber,
            source,
            destination,
            journeyDate,
            seatNumber,
            ticketClass,
            fare,
            status: "Booked"
        });

        await ticket.save();

        return res.status(201).json({
            success: true,
            message: "Ticket booked successfully",
            ticket,
            availableSeats: train.availableSeats
        });

    } catch (error) {
        console.error("Admin ticket booking error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ================= GET ALL TICKETS =================
// Reads passenger bookings from UserTicket.
// Converts fields for the existing admin Tickets table.

router.get("/", async (req, res) => {
    try {
        const passengerTickets = await UserTicket.find()
            .sort({ _id: -1 })
            .lean();

        const adminTickets = await Ticket.find()
            .sort({ _id: -1 })
            .lean();

        const formattedPassengerTickets = passengerTickets.map(ticket => ({
            ...ticket,
            passengerName: ticket.passengerName,
            trainNumber: ticket.trainNumber,
            source: ticket.source,
            destination: ticket.destination,
            journeyDate: ticket.journeyDate,
            seatNumber: ticket.seatNumber || ticket.seats || "-",
            fare: ticket.fare,
            status: ticket.status || "Confirmed"
        }));

        const formattedAdminTickets = adminTickets.map(ticket => ({
            ...ticket,
            seatNumber: ticket.seatNumber || "-",
            status: ticket.status || "Booked"
        }));

        const tickets = [
            ...formattedPassengerTickets,
            ...formattedAdminTickets
        ];

        return res.json(tickets);

    } catch (error) {
        console.error("Load all tickets error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ================= CANCEL ADMIN TICKET =================

router.delete("/:id", async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        if (ticket.status === "Cancelled") {
            return res.status(400).json({
                message: "Ticket already cancelled"
            });
        }

        const train = await Train.findOne({
            trainNumber: ticket.trainNumber
        });

        if (train) {
            train.availableSeats += 1;
            await train.save();
        }

        ticket.status = "Cancelled";
        await ticket.save();

        return res.json({
            success: true,
            message: "Ticket cancelled successfully",
            availableSeats: train ? train.availableSeats : null
        });

    } catch (error) {
        console.error("Cancel admin ticket error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;