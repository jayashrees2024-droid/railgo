
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================
// SERVE FRONTEND FILES
// =====================================

app.use(express.static(path.join(__dirname, "public")));


// =====================================
// MONGODB CONNECTION
// =====================================

mongoose.connect("mongodb://127.0.0.1:27017/train_management")
    .then(function () {
        console.log("MongoDB Connected");
    })
    .catch(function (error) {
        console.log("MongoDB Connection Error:", error.message);
    });


// =====================================
// IMPORT ROUTES
// =====================================

const trainRoutes = require("./routes/trainRoutes");
const stationRoutes = require("./routes/stationRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// =====================================
// API ROUTES
// =====================================

app.use("/api/trains", trainRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/auth", authRoutes);

// User registration, login, booking and PNR routes
app.use("/api/users", userRoutes);


// =====================================
// TEST API
// =====================================

app.get("/api/test-pnr", function (req, res) {
    res.json({
        success: true,
        message: "API is working"
    });
});


// =====================================
// START SERVER
// =====================================

const PORT = 3000;

app.listen(PORT, function () {
    console.log("Server running at http://localhost:" + PORT);
});
