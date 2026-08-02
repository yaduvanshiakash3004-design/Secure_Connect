// ======================================================
// SecureConnect
// Group Model
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");

// ======================================================
// GROUP SCHEMA
// ======================================================

const groupSchema = new mongoose.Schema(
    {

        // ==================================================
        // GROUP NAME
        // ==================================================

        name: {
            type: String,
            required: [
                true,
                "Group name is required"
            ],
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        // ==================================================
        // GROUP DESCRIPTION
        // ==================================================

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },

        // ==================================================
        // GROUP ADMIN / CREATOR
        // ==================================================

        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // GROUP MEMBERS
        // ==================================================

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        // ==================================================
        // GROUP AVATAR
        // ==================================================

        avatar: {
            type: String,
            default: ""
        },

        // ==================================================
        // LAST MESSAGE
        // ==================================================

        lastMessage: {
            type: String,
            default: ""
        },

        // ==================================================
        // LAST MESSAGE TIME
        // ==================================================

        lastMessageAt: {
            type: Date,
            default: null
        }

    },
    {
        timestamps: true
    }
);

// ======================================================
// REMOVE DUPLICATE GROUP MEMBERS BEFORE SAVE
// ======================================================
//
// IMPORTANT:
//
// Do not use next() here.
// Modern Mongoose supports synchronous pre-save middleware.
// ======================================================

groupSchema.pre(
    "save",
    function () {

        if (
            this.members &&
            this.members.length > 0
        ) {

            const uniqueMemberIds = [
                ...new Set(
                    this.members.map(
                        (member) =>
                            member.toString()
                    )
                )
            ];

            this.members =
                uniqueMemberIds.map(
                    (memberId) =>
                        new mongoose.Types.ObjectId(
                            memberId
                        )
                );

        }

    }
);

// ======================================================
// INDEXES
// ======================================================

groupSchema.index({
    members: 1
});

groupSchema.index({
    admin: 1
});

groupSchema.index({
    lastMessageAt: -1
});

// ======================================================
// CREATE MODEL
// ======================================================

const Group = mongoose.model(
    "Group",
    groupSchema
);

// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = Group;