// ======================================================
// SecureConnect
// Message Routes
// Developed By : Akash Yadav
// ======================================================

const express = require("express");

const {
    sendMessage,
    getMessages,
    getUnreadCounts,
    markConversationAsRead
} = require("../controllers/messageController");

const {
    protect
} = require("../middleware/authMiddleware");

const upload = require(
    "../middleware/uploadMiddleware"
);

const router = express.Router();

// ======================================================
// SEND PRIVATE MESSAGE
// POST /api/messages
//
// Supports:
// - Text
// - Image
// - PDF
// - Word
// - Excel
// - PowerPoint
//
// FormData field name:
// file
// ======================================================

router.post(
    "/",
    protect,
    upload.single("file"),
    sendMessage
);

// ======================================================
// GET PRIVATE UNREAD COUNTS
// GET /api/messages/unread/counts
//
// IMPORTANT:
// Keep this route BEFORE /:userId
// ======================================================

router.get(
    "/unread/counts",
    protect,
    getUnreadCounts
);

// ======================================================
// MARK PRIVATE CONVERSATION AS READ
// PATCH /api/messages/:userId/read
// ======================================================

router.patch(
    "/:userId/read",
    protect,
    markConversationAsRead
);

// ======================================================
// GET PRIVATE CONVERSATION
// GET /api/messages/:userId
//
// IMPORTANT:
// Dynamic route stays after specific routes.
// ======================================================

router.get(
    "/:userId",
    protect,
    getMessages
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use(
    (error, req, res, next) => {

        console.error(
            "Upload Error:",
            error.message
        );

        // ==============================================
        // FILE TOO LARGE
        // ==============================================

        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "File size cannot exceed 10 MB"

                });

        }

        // ==============================================
        // UNSUPPORTED FILE
        // ==============================================

        if (
            error.message ===
            "Unsupported file type"
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Unsupported file type"

                });

        }

        // ==============================================
        // OTHER UPLOAD ERROR
        // ==============================================

        return res
            .status(500)
            .json({

                success: false,

                message:
                    "File upload failed"

            });

    }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;