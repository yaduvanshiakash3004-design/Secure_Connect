// ======================================================
// SecureConnect
// JWT Authentication Middleware
// Developed By : Akash Yadav
// ======================================================

const jwt = require("jsonwebtoken");

// ======================================================
// PROTECT ROUTES
// ======================================================

const protect = (req, res, next) => {

    try {

        // ==================================================
        // GET AUTHORIZATION HEADER
        // ==================================================

        const authHeader = req.headers.authorization;

        // ==================================================
        // CHECK TOKEN
        // Expected format:
        // Authorization: Bearer <token>
        // ==================================================

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        // ==================================================
        // EXTRACT TOKEN
        // ==================================================

        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });

        }

        // ==================================================
        // VERIFY JWT TOKEN
        // ==================================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ==================================================
        // ATTACH USER DATA TO REQUEST
        // ==================================================
        // JWT contains:
        // {
        //     userId: user._id
        // }
        // ==================================================

        req.user = {
            userId: decoded.userId
        };

        // ==================================================
        // CONTINUE TO CONTROLLER
        // ==================================================

        next();

    } catch (error) {

        console.error(
            "Authentication Error:",
            error.message
        );

        // ==================================================
        // INVALID / EXPIRED TOKEN
        // ==================================================

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });

    }

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    protect
};