// ======================================================
// SecureConnect
// Message Model
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");

// ======================================================
// MESSAGE SCHEMA
// ======================================================

const messageSchema = new mongoose.Schema(
    {
        // ==================================================
        // SENDER
        // ==================================================

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // RECEIVER
        // ==================================================

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // MESSAGE TYPE
        // text | image | file
        // ==================================================

        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "file"
            ],
            default: "text"
        },

        // ==================================================
        // TEXT MESSAGE
        // ==================================================

        message: {
            type: String,
            default: "",
            trim: true
        },

        // ==================================================
        // FILE / IMAGE URL
        // ==================================================

        fileUrl: {
            type: String,
            default: ""
        },

        // ==================================================
        // ORIGINAL FILE NAME
        // ==================================================

        fileName: {
            type: String,
            default: ""
        },

        // ==================================================
        // MIME TYPE
        // Example:
        // image/png
        // image/jpeg
        // application/pdf
        // ==================================================

        fileType: {
            type: String,
            default: ""
        },

        // ==================================================
        // FILE SIZE IN BYTES
        // ==================================================

        fileSize: {
            type: Number,
            default: 0
        },

        // ==================================================
        // READ / UNREAD STATUS
        // ==================================================

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// ======================================================
// VALIDATE MESSAGE CONTENT
// ======================================================
//
// A message must contain either:
//
// 1. Text
// OR
// 2. File / Image
//
// ======================================================

messageSchema.pre(
    "validate",
    function () {

        const hasText =
            this.message &&
            this.message.trim().length > 0;

        const hasFile =
            this.fileUrl &&
            this.fileUrl.trim().length > 0;

        if (!hasText && !hasFile) {

            this.invalidate(
                "message",
                "Message or file is required"
            );

        }

    }
);

// ======================================================
// INDEX FOR PRIVATE CHAT
// ======================================================

messageSchema.index({
    sender: 1,
    receiver: 1,
    createdAt: 1
});

// ======================================================
// INDEX FOR RECENT MESSAGES
// ======================================================

messageSchema.index({
    receiver: 1,
    isRead: 1
});

// ======================================================
// CREATE MODEL
// ======================================================

const Message = mongoose.model(
    "Message",
    messageSchema
);

// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = Message;