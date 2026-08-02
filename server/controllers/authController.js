// ======================================================
// SecureConnect
// Authentication Controller
// Developed By : Akash Yadav
// ======================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {

    try {

        // Get data from frontend
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });

        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });

        }

        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send successful response
        return res.status(201).json({

            success: true,

            message: "Registration successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }

        });

    } catch (error) {

        console.error(
            "Registration Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });

    }

};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {

    try {

        // Get email and password
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please enter email and password"
            });

        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Compare password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send response
        return res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });

    }

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    registerUser,
    loginUser
};