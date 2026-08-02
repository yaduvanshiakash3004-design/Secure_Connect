// ======================================================
// SecureConnect
// Test User Password Reset
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const dns = require("dns");

const User = require("./models/User");

// ======================================================
// ENVIRONMENT
// ======================================================

dotenv.config();

dns.setServers(["8.8.8.8"]);

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async () => {

    try {

        // Connect MongoDB
        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB Connected"
        );

        // Find Test User
        const user = await User.findOne({
            email: "testuser@secureconnect.com"
        });

        if (!user) {

            console.log(
                "Test User not found"
            );

            await mongoose.disconnect();

            return;

        }

        // New password
        const newPassword = "123456";

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        // Save new password
        user.password = hashedPassword;

        await user.save();

        console.log(
            "=================================="
        );

        console.log(
            "Password Reset Successful"
        );

        console.log(
            "Email: testuser@secureconnect.com"
        );

        console.log(
            "Password: 123456"
        );

        console.log(
            "=================================="
        );

        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "Password Reset Error:",
            error
        );

        await mongoose.disconnect();

        process.exit(1);

    }

};

// ======================================================
// RUN
// ======================================================

resetPassword();