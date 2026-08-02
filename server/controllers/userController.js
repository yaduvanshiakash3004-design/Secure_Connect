// ======================================================
// SecureConnect
// User Controller
// Developed By : Akash Yadav
// ======================================================

const User = require("../models/User");

// ======================================================
// GET ALL USERS / CONTACTS
// ======================================================
// Purpose:
// Get all registered users except the currently logged-in user
//
// Route:
// GET /api/users
//
// Protected:
// Yes - JWT required
// ======================================================

const getUsers = async (req, res) => {

    try {

        // ==================================================
        // GET CURRENT LOGGED-IN USER ID
        // ==================================================

        const currentUserId = req.user.userId;

        // ==================================================
        // GET ALL USERS EXCEPT CURRENT USER
        // ==================================================
        // Password is excluded for security
        // ==================================================

        const users = await User.find({
            _id: {
                $ne: currentUserId
            }
        })
        .select("-password")
        .sort({
            name: 1
        });

        // ==================================================
        // SEND RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            count: users.length,

            users

        });

    } catch (error) {

        console.error(
            "Get Users Error:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message: "Server error while fetching users"

        });

    }

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getUsers
};