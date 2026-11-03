const express = require("express");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");

const router = express.Router();


// ==============================
// REGISTER ADMIN
// ==============================

router.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingAdmin = await Admin.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const admin = new Admin({
            username: username,
            email: email,
            password: hashedPassword
        });

        await admin.save();

        res.json({
            success: true,
            message: "Admin registered successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==============================
// LOGIN
// ==============================

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Please enter username and password"
            });
        }

        const admin = await Admin.findOne({
            username: username
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            username: admin.username
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==============================
// FORGOT USERNAME
// ==============================

router.post("/forgot-username", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please enter your registered email"
            });
        }

        const admin = await Admin.findOne({
            email: email
        });

        if (!admin) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        res.json({
            success: true,
            username: admin.username,
            message: "Username found successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==============================
// FORGOT PASSWORD
// ==============================

router.post("/forgot-password", async (req, res) => {

    try {

        const {
            username,
            email,
            newPassword
        } = req.body;

        if (!username || !email || !newPassword) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const admin = await Admin.findOne({
            username: username,
            email: email
        });

        if (!admin) {
            return res.status(404).json({
                message: "Username and email do not match"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        admin.password = hashedPassword;

        await admin.save();

        res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==============================
// EXPORT ROUTER
// ==============================

module.exports = router;