
const express = require("express");
const router = express.Router();

const Train = require("../models/Train");
const UserTicket = require("../models/UserTicket");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ============================================================
// PASSENGER REGISTRATION
// ============================================================
router.post("/register", async function (req, res) {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: username.trim() },
                { email: email.trim().toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name: name.trim(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "Passenger registered successfully."
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

// ============================================================
// PASSENGER LOGIN
// ============================================================
router.post("/login", async function (req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter username and password."
            });
        }

        const user = await User.findOne({
            username: username.trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        return res.json({
            success: true,
            message: "Login successful.",
            username: user.username,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error("Passenger login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

// ============================================================
// SEARCH TRAINS
// ============================================================
router.get("/search-trains", async function (req, res) {
    try {
        const { source, destination, journeyDate, seats } = req.query;
        const numberOfSeats = Number(seats || 1);

        if (
            !source ||
            !destination ||
            !journeyDate ||
            !Number.isInteger(numberOfSeats) ||
            numberOfSeats < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter source, destination, date and valid seat count."
            });
        }

        const trains = await Train.find({
            source: {
                $regex: "^" + source.trim() + "$",
                $options: "i"
            },
            destination: {
                $regex: "^" + destination.trim() + "$",
                $options: "i"
            }
        });

        const availableTrains = trains.map(function (train) {
            return {
                _id: train._id,
                trainNumber: train.trainNumber,
                trainName: train.trainName,
                source: train.source,
                destination: train.destination,
                departureTime: train.departureTime,
                arrivalTime: train.arrivalTime,
                fare: Number(train.fare),
                availableSeats: Number(train.availableSeats),
                journeyDate: journeyDate,
                isAvailable:
                    Number(train.availableSeats) >= numberOfSeats
            };
        });

        return res.json({
            success: true,
            trains: availableTrains
        });

    } catch (error) {
        console.error("Train search error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to search trains."
        });
    }
});

// ============================================================
// BOOK TICKET AND GENERATE PNR
// ============================================================
router.post("/book-ticket", async function (req, res) {
    let train = null;
    let numberOfSeats = 0;
    let seatsReserved = false;

    try {
        const {
            username,
            passengerName,
            trainNumber,
            source,
            destination,
            journeyDate,
            seats
        } = req.body;

        numberOfSeats = Number(seats);

        if (
            !username ||
            !passengerName ||
            !trainNumber ||
            !source ||
            !destination ||
            !journeyDate ||
            !Number.isInteger(numberOfSeats) ||
            numberOfSeats < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all booking details correctly."
            });
        }

        train = await Train.findOneAndUpdate(
            {
                trainNumber: String(trainNumber).trim(),
                source: {
                    $regex: "^" + source.trim() + "$",
                    $options: "i"
                },
                destination: {
                    $regex: "^" + destination.trim() + "$",
                    $options: "i"
                },
                availableSeats: {
                    $gte: numberOfSeats
                }
            },
            {
                $inc: {
                    availableSeats: -numberOfSeats
                }
            },
            {
                new: true
            }
        );

        if (!train) {
            const matchingTrain = await Train.findOne({
                trainNumber: String(trainNumber).trim()
            });

            if (!matchingTrain) {
                return res.status(404).json({
                    success: false,
                    message: "Train not found."
                });
            }

            return res.status(409).json({
                success: false,
                message: "Not available. Please check the route and available seats."
            });
        }

        seatsReserved = true;

        const farePerSeat = Number(train.fare);

        if (!Number.isFinite(farePerSeat) || farePerSeat < 0) {
            throw new Error("Train fare is invalid.");
        }

        const totalFare = farePerSeat * numberOfSeats;

        let pnr;
        let existingTicket;

        do {
            pnr = "PNR" + Date.now().toString() +
                Math.floor(100 + Math.random() * 900);

            existingTicket = await UserTicket.findOne({ pnr: pnr });
        } while (existingTicket);

        const ticket = await UserTicket.create({
            pnr: pnr,
            username: String(username).trim(),
            passengerName: String(passengerName).trim(),
            trainName: train.trainName,
            trainNumber: train.trainNumber,
            source: train.source,
            destination: train.destination,
            journeyDate: String(journeyDate),
            seats: numberOfSeats,
            fare: totalFare,
            status: "Confirmed",
            paymentStatus: "Pending"
        });

        return res.status(201).json({
            success: true,
            message: "Ticket booked successfully!",
            pnr: ticket.pnr,
            ticket: ticket,
            availableSeats: train.availableSeats
        });

    } catch (error) {
        console.error("Booking error:", error);

        if (seatsReserved && train) {
            try {
                await Train.updateOne(
                    { _id: train._id },
                    {
                        $inc: {
                            availableSeats: numberOfSeats
                        }
                    }
                );
            } catch (rollbackError) {
                console.error("Seat restoration error:", rollbackError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Booking failed. Please try again."
        });
    }
});

// ============================================================
// GET ALL TICKETS FOR A USER
// ============================================================
router.get("/bookings/:username", async function (req, res) {
    try {
        const username = String(req.params.username || "").trim();

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required."
            });
        }

        const escapedUsername = username.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const tickets = await UserTicket.find({
            username: {
                $regex: "^" + escapedUsername + "$",
                $options: "i"
            }
        }).sort({ _id: -1 });

        return res.json(tickets);

    } catch (error) {
        console.error("Load user tickets error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load user tickets."
        });
    }
});

// ============================================================
// DEMO PAYMENT
// POST /api/users/payment/:ticketId
// ============================================================
router.post("/payment/:ticketId", async function (req, res) {
    try {
        const ticketId = String(req.params.ticketId || "").trim();
        const paymentMethod = String(
            req.body.paymentMethod || "DEMO"
        ).trim().toUpperCase();

        if (!/^[a-fA-F0-9]{24}$/.test(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID."
            });
        }

        if (paymentMethod !== "DEMO") {
            return res.status(400).json({
                success: false,
                message: "Only demo payment is supported."
            });
        }

        const ticket = await UserTicket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found."
            });
        }

        if (ticket.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled tickets cannot be paid for."
            });
        }

        if (ticket.status !== "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed tickets can be paid for."
            });
        }

        if (ticket.paymentStatus === "Paid") {
            return res.status(409).json({
                success: false,
                message: "This ticket has already been paid.",
                transactionId: ticket.transactionId
            });
        }

        const transactionId =
            "RGDEMO-" +
            Date.now().toString() +
            "-" +
            Math.floor(1000 + Math.random() * 9000);

        ticket.paymentStatus = "Paid";
        ticket.paymentMethod = "DEMO";
        ticket.transactionId = transactionId;
        ticket.paymentDate = new Date();

        await ticket.save();

        return res.json({
            success: true,
            message: "Demo payment completed successfully.",
            transactionId: ticket.transactionId,
            payment: {
                status: ticket.paymentStatus,
                method: ticket.paymentMethod,
                transactionId: ticket.transactionId,
                paymentDate: ticket.paymentDate,
                amount: ticket.fare
            },
            ticket: ticket
        });

    } catch (error) {
        console.error("Demo payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment could not be completed."
        });
    }
});

// ============================================================
// CHECK PNR STATUS
// ============================================================
router.get("/pnr/:pnr", async function (req, res) {
    try {
        const pnr = String(req.params.pnr || "")
            .trim()
            .toUpperCase();

        const ticket = await UserTicket.findOne({ pnr: pnr });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "PNR not found. Check the number or book a new ticket."
            });
        }

        return res.json({
            success: true,
            message: "PNR details found.",
            ticket: ticket
        });

    } catch (error) {
        console.error("PNR lookup error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to check PNR status."
        });
    }
});

// ============================================================
// TEST USER ROUTES
// ============================================================
router.get("/test", function (req, res) {
    res.json({
        success: true,
        message: "User routes are working"
    });
});

// ============================================================
// UPDATE TICKET STATUS
// ============================================================
router.put("/ticket-status/:pnr", async function (req, res) {
    try {
        const pnr = String(req.params.pnr || "")
            .trim()
            .toUpperCase();

        const status = String(req.body.status || "").trim();

        if (!["Confirmed", "Waiting", "Cancelled"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Confirmed, Waiting, or Cancelled."
            });
        }

        const ticket = await UserTicket.findOne({ pnr: pnr });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found."
            });
        }

        if (ticket.status === "Cancelled" && status !== "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "A cancelled ticket cannot be reactivated here."
            });
        }

        ticket.status = status;
        await ticket.save();

        return res.json({
            success: true,
            message: "Ticket status updated successfully.",
            ticket: ticket
        });

    } catch (error) {
        console.error("Status update error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update ticket status."
        });
    }
});

// ============================================================
// CANCEL TICKET - NO 4-HOUR RESTRICTION
// ============================================================
router.post("/cancel-ticket/:pnr", async function (req, res) {
    try {
        const pnr = String(req.params.pnr || "")
            .trim()
            .toUpperCase();

        const reason = String(req.body.reason || "").trim();

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide a reason for cancellation."
            });
        }

        const ticket = await UserTicket.findOne({ pnr: pnr });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found."
            });
        }

        if (ticket.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "This ticket is already cancelled."
            });
        }

        if (ticket.status !== "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed tickets can be cancelled."
            });
        }

        const totalFare = Number(ticket.fare);
        const seatsToRestore = Number(ticket.seats);

        if (
            !Number.isFinite(totalFare) ||
            totalFare < 0 ||
            !Number.isInteger(seatsToRestore) ||
            seatsToRestore < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Ticket fare or seat count is invalid."
            });
        }

        const train = await Train.findOne({
            trainNumber: ticket.trainNumber
        });

        if (!train) {
            return res.status(404).json({
                success: false,
                message: "Train not found."
            });
        }

        const fee = Math.round(totalFare * 0.10 * 100) / 100;
        const refund = Math.round((totalFare - fee) * 100) / 100;
        const cancellationDate = new Date();

        const cancelledTicket = await UserTicket.findOneAndUpdate(
            {
                _id: ticket._id,
                status: "Confirmed"
            },
            {
                $set: {
                    status: "Cancelled",
                    cancellationReason: reason,
                    cancelledAt: cancellationDate,
                    cancellationFee: fee,
                    refundAmount: refund,
                    paymentStatus:
                        ticket.paymentStatus === "Paid"
                            ? "Refunded"
                            : ticket.paymentStatus
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!cancelledTicket) {
            return res.status(409).json({
                success: false,
                message: "Ticket status changed. Please check the PNR again."
            });
        }

        const updatedTrain = await Train.findOneAndUpdate(
            {
                _id: train._id,
                $expr: {
                    $lte: [
                        {
                            $add: [
                                { $ifNull: ["$availableSeats", 0] },
                                seatsToRestore
                            ]
                        },
                        { $ifNull: ["$totalSeats", 0] }
                    ]
                }
            },
            {
                $inc: {
                    availableSeats: seatsToRestore
                }
            },
            {
                new: true
            }
        );

        if (!updatedTrain) {
            await UserTicket.updateOne(
                {
                    _id: ticket._id,
                    status: "Cancelled"
                },
                {
                    $set: {
                        status: "Confirmed",
                        paymentStatus: ticket.paymentStatus
                    },
                    $unset: {
                        cancellationReason: 1,
                        cancelledAt: 1,
                        cancellationFee: 1,
                        refundAmount: 1
                    }
                }
            );

            return res.status(409).json({
                success: false,
                message: "Could not restore seats. Cancellation was not completed."
            });
        }

        return res.json({
            success: true,
            message: "Ticket cancelled successfully!",
            ticket: cancelledTicket,
            pnr: cancelledTicket.pnr,
            status: cancelledTicket.status,
            cancellationReason: cancelledTicket.cancellationReason,
            cancelledAt: cancelledTicket.cancelledAt,
            cancellationFee: cancelledTicket.cancellationFee,
            refundAmount: cancelledTicket.refundAmount,
            availableSeats: updatedTrain.availableSeats
        });

    } catch (error) {
        console.error("Ticket cancellation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel ticket. Please try again."
        });
    }
});

// ============================================================
// GET ALL USER BOOKINGS - ADMIN PASSENGER DIRECTORY
// ============================================================
router.get("/all-bookings", async function (req, res) {
    try {
        const bookings = await UserTicket.find()
            .sort({ _id: -1 })
            .lean();

        return res.json({
            success: true,
            bookings: bookings
        });

    } catch (error) {
        console.error("Load all bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load passenger bookings."
        });
    }
});

module.exports = router;
