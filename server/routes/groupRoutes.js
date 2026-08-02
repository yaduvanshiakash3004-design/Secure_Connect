// ======================================================
// SecureConnect
// Group Routes
// Developed By : Akash Yadav
// ======================================================

const express = require("express");

// ======================================================
// CONTROLLERS
// ======================================================

const {
    createGroup,
    getMyGroups,
    getGroupById,
    addGroupMember,
    sendGroupMessage,
    getGroupMessages
} = require("../controllers/groupController");

// ======================================================
// AUTH MIDDLEWARE
// ======================================================

const {
    protect
} = require("../middleware/authMiddleware");

// ======================================================
// FILE UPLOAD MIDDLEWARE
// ======================================================

const upload = require(
    "../middleware/uploadMiddleware"
);

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// ALL GROUP ROUTES ARE PROTECTED
// ======================================================

router.use(protect);

// ======================================================
// CREATE GROUP
// POST /api/groups
// ======================================================

router.post(
    "/",
    createGroup
);

// ======================================================
// GET LOGGED-IN USER GROUPS
// GET /api/groups
// ======================================================

router.get(
    "/",
    getMyGroups
);

// ======================================================
// ADD MEMBER TO GROUP
// POST /api/groups/:groupId/members
// ======================================================

router.post(
    "/:groupId/members",
    addGroupMember
);

// ======================================================
// SEND GROUP MESSAGE
//
// POST /api/groups/:groupId/messages
//
// Supports:
//
// Text
// Image
// PDF
// Word
// Excel
// PowerPoint
//
// FormData file field name:
//
// file
//
// ======================================================

router.post(
    "/:groupId/messages",

    upload.single(
        "file"
    ),

    sendGroupMessage
);

// ======================================================
// GET GROUP MESSAGES
// GET /api/groups/:groupId/messages
// ======================================================

router.get(
    "/:groupId/messages",
    getGroupMessages
);

// ======================================================
// GET SINGLE GROUP
// GET /api/groups/:groupId
//
// IMPORTANT:
// Keep this route after the more specific routes above.
// ======================================================

router.get(
    "/:groupId",
    getGroupById
);

// ======================================================
// MULTER / FILE UPLOAD ERROR HANDLER
// ======================================================

router.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Group Upload Error:",
            error.message
        );

        // ==================================================
        // FILE TOO LARGE
        // ==================================================

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

        // ==================================================
        // UNSUPPORTED FILE TYPE
        // ==================================================

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

        // ==================================================
        // OTHER UPLOAD ERROR
        // ==================================================

        return res
            .status(500)
            .json({

                success: false,

                message:
                    "Group file upload failed"

            });

    }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;