// ======================================================
// SecureConnect
// Authentication Routes
// Developed By : Akash Yadav
// ======================================================

const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

// ======================================================
// REGISTER ROUTE
// POST /api/auth/register
// ======================================================

router.post("/register", registerUser);

// ======================================================
// LOGIN ROUTE
// POST /api/auth/login
// ======================================================

router.post("/login", loginUser);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;