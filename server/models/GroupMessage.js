// ======================================================
// SecureConnect
// Group Message Model
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");

// ======================================================
// GROUP MESSAGE SCHEMA
// ======================================================

const groupMessageSchema = new mongoose.Schema(
    {

        // ==================================================
        // USER WHO SENT THE MESSAGE
        // ==================================================

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // GROUP WHERE MESSAGE WAS SENT
        // ==================================================

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        // ==================================================
        // MESSAGE TYPE
        //
        // text
        // image
        // file
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
            trim: true,
            maxlength: 5000
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
        //
        // Examples:
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
        // USERS WHO HAVE READ THE MESSAGE
        // ==================================================

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]

    },
    {
        timestamps: true
    }
);

// ======================================================
// VALIDATE GROUP MESSAGE
// ======================================================
//
// Group message must contain:
//
// 1. Text
//
// OR
//
// 2. Image / File
//
// ======================================================

groupMessageSchema.pre(
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
// INDEX FOR FASTER GROUP MESSAGE QUERIES
// ======================================================

groupMessageSchema.index({
    group: 1,
    createdAt: 1
});

// ======================================================
// INDEX FOR SENDER QUERIES
// ======================================================

groupMessageSchema.index({
    sender: 1,
    createdAt: -1
});

// ======================================================
// INDEX FOR MESSAGE TYPE
// ======================================================

groupMessageSchema.index({
    group: 1,
    messageType: 1,
    createdAt: -1
});

// ======================================================
// CREATE MODEL
// ======================================================

const GroupMessage = mongoose.model(
    "GroupMessage",
    groupMessageSchema
);

// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = GroupMessage;