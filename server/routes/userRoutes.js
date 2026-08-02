// ======================================================
// SecureConnect
// User Routes
// Developed By : Akash Yadav
// ======================================================

const express = require("express");

const {
    getUsers
} = require("../controllers/userController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// GET ALL USERS / CONTACTS
// GET /api/users
// Protected Route
// ======================================================

router.get(
    "/",
    protect,
    getUsers
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;