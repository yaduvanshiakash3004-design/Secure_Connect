// ======================================================
// SecureConnect
// Message Controller
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");

const Message = require("../models/Message");
const User = require("../models/User");

// ======================================================
// SEND PRIVATE MESSAGE
// POST /api/messages
//
// Supports:
// 1. Text message
// 2. Image message
// 3. File message
// ======================================================

const sendMessage = async (req, res) => {

    try {

        // ==================================================
        // CURRENT LOGGED-IN USER
        // ==================================================

        const senderId =
            req.user.userId;

        // ==================================================
        // REQUEST DATA
        // ==================================================

        const {
            receiverId,
            message
        } = req.body;

        // ==================================================
        // UPLOADED FILE
        // ==================================================

        const uploadedFile =
            req.file || null;

        // ==================================================
        // VALIDATE RECEIVER
        // ==================================================

        if (!receiverId) {

            return res.status(400).json({

                success: false,

                message:
                    "Receiver is required"

            });

        }

        // ==================================================
        // MESSAGE MUST CONTAIN TEXT OR FILE
        // ==================================================

        const hasText =
            message &&
            message.trim().length > 0;

        const hasFile =
            uploadedFile !== null;

        if (!hasText && !hasFile) {

            return res.status(400).json({

                success: false,

                message:
                    "Message or file is required"

            });

        }

        // ==================================================
        // VALIDATE RECEIVER ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                receiverId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid receiver ID"

            });

        }

        // ==================================================
        // PREVENT MESSAGE TO SELF
        // ==================================================

        if (
            senderId.toString() ===
            receiverId.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot send a message to yourself"

            });

        }

        // ==================================================
        // CHECK RECEIVER EXISTS
        // ==================================================

        const receiver =
            await User.findById(
                receiverId
            );

        if (!receiver) {

            return res.status(404).json({

                success: false,

                message:
                    "Receiver not found"

            });

        }

        // ==================================================
        // MESSAGE TYPE
        // ==================================================

        let messageType =
            "text";

        let fileUrl = "";
        let fileName = "";
        let fileType = "";
        let fileSize = 0;

        // ==================================================
        // PROCESS UPLOADED FILE
        // ==================================================

        if (uploadedFile) {

            fileName =
                uploadedFile.originalname;

            fileType =
                uploadedFile.mimetype;

            fileSize =
                uploadedFile.size;

            // ==================================================
            // FILE URL
            // ==================================================

            fileUrl =
               `https://secure-connect-6e84.onrender.com/uploads/${uploadedFile.filename}`;
            // ==================================================
            // IMAGE OR NORMAL FILE
            // ==================================================

            if (
                uploadedFile.mimetype &&
                uploadedFile.mimetype.startsWith(
                    "image/"
                )
            ) {

                messageType =
                    "image";

            } else {

                messageType =
                    "file";

            }

        }

        // ==================================================
        // CREATE MESSAGE
        // ==================================================

        const newMessage =
            await Message.create({

                sender:
                    senderId,

                receiver:
                    receiverId,

                message:
                    hasText
                        ? message.trim()
                        : "",

                messageType,

                fileUrl,

                fileName,

                fileType,

                fileSize,

                // New messages always begin unread.
                isRead: false

            });

        // ==================================================
        // POPULATE USER INFORMATION
        // ==================================================

        const populatedMessage =
            await Message.findById(
                newMessage._id
            )
            .populate(
                "sender",
                "name email avatar status"
            )
            .populate(
                "receiver",
                "name email avatar status"
            );

        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                uploadedFile
                    ? "File sent successfully"
                    : "Message sent successfully",

            data:
                populatedMessage

        });

    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while sending message"

        });

    }

};

// ======================================================
// GET PRIVATE CONVERSATION
// GET /api/messages/:userId
//
// Also:
// Marks all messages received from this user as read.
// Returns IDs of messages that became read.
// ======================================================

const getMessages = async (
    req,
    res
) => {

    try {

        // ==================================================
        // CURRENT LOGGED-IN USER
        // ==================================================

        const currentUserId =
            req.user.userId;

        // ==================================================
        // OTHER USER
        // ==================================================

        const otherUserId =
            req.params.userId;

        // ==================================================
        // VALIDATE USER ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                otherUserId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID"

            });

        }

        // ==================================================
        // CHECK OTHER USER EXISTS
        // ==================================================

        const otherUser =
            await User.findById(
                otherUserId
            );

        if (!otherUser) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }

        // ==================================================
        // FIND CURRENTLY UNREAD RECEIVED MESSAGES
        //
        // We save their IDs before updating them so the
        // frontend can tell the original sender exactly
        // which messages have now been read.
        // ==================================================

        const unreadMessages =
            await Message.find({

                sender:
                    otherUserId,

                receiver:
                    currentUserId,

                isRead:
                    false

            }).select("_id");

        const readMessageIds =
            unreadMessages.map(
                (message) =>
                    message._id.toString()
            );

        // ==================================================
        // MARK RECEIVED MESSAGES AS READ
        // ==================================================

        if (
            readMessageIds.length > 0
        ) {

            await Message.updateMany(
                {
                    _id: {
                        $in:
                            readMessageIds
                    }
                },
                {
                    $set: {
                        isRead:
                            true
                    }
                }
            );

        }

        // ==================================================
        // GET CONVERSATION
        // AFTER READ STATUS UPDATE
        //
        // Important:
        // Fetching after update means returned messages
        // contain the latest isRead value.
        // ==================================================

        const messages =
            await Message.find({

                $or: [

                    {
                        sender:
                            currentUserId,

                        receiver:
                            otherUserId
                    },

                    {
                        sender:
                            otherUserId,

                        receiver:
                            currentUserId
                    }

                ]

            })
            .sort({
                createdAt: 1
            })
            .populate(
                "sender",
                "name email avatar status"
            )
            .populate(
                "receiver",
                "name email avatar status"
            );

        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            count:
                messages.length,

            messages,

            // IDs that changed from unread -> read
            // during this request.
            readMessageIds,

            readCount:
                readMessageIds.length,

            readByUserId:
                currentUserId,

            senderId:
                otherUserId

        });

    } catch (error) {

        console.error(
            "Get Messages Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while loading messages"

        });

    }

};

// ======================================================
// GET PRIVATE UNREAD COUNTS
// GET /api/messages/unread/counts
//
// Returns unread message count grouped by sender.
//
// Example:
// {
//     "6a6...": 3,
//     "7b7...": 1
// }
// ======================================================

const getUnreadCounts = async (
    req,
    res
) => {

    try {

        const currentUserId =
            req.user.userId;

        // ==================================================
        // AGGREGATE UNREAD MESSAGES BY SENDER
        // ==================================================

        const unreadData =
            await Message.aggregate([

                {
                    $match: {

                        receiver:
                            new mongoose.Types.ObjectId(
                                currentUserId
                            ),

                        isRead:
                            false

                    }
                },

                {
                    $group: {

                        _id:
                            "$sender",

                        count: {
                            $sum: 1
                        }

                    }
                }

            ]);

        // ==================================================
        // CONVERT ARRAY INTO OBJECT
        // ==================================================

        const unreadCounts = {};

        unreadData.forEach(
            (item) => {

                unreadCounts[
                    item._id.toString()
                ] =
                    item.count;

            }
        );

        // ==================================================
        // TOTAL UNREAD
        // ==================================================

        const totalUnread =
            unreadData.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.count,
                0
            );

        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            totalUnread,

            unreadCounts

        });

    } catch (error) {

        console.error(
            "Unread Count Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while loading unread messages"

        });

    }

};

// ======================================================
// MARK CONVERSATION AS READ
// PATCH /api/messages/:userId/read
//
// Useful when the chat is already open and a new message
// arrives in real time.
// ======================================================

const markConversationAsRead =
    async (
        req,
        res
    ) => {

        try {

            const currentUserId =
                req.user.userId;

            const otherUserId =
                req.params.userId;

            // ==================================================
            // VALIDATE USER ID
            // ==================================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    otherUserId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid user ID"

                });

            }

            // ==================================================
            // FIND UNREAD MESSAGES FIRST
            // ==================================================

            const unreadMessages =
                await Message.find({

                    sender:
                        otherUserId,

                    receiver:
                        currentUserId,

                    isRead:
                        false

                }).select("_id");

            const readMessageIds =
                unreadMessages.map(
                    (message) =>
                        message._id.toString()
                );

            // ==================================================
            // UPDATE DATABASE
            // ==================================================

            if (
                readMessageIds.length > 0
            ) {

                await Message.updateMany(
                    {
                        _id: {
                            $in:
                                readMessageIds
                        }
                    },
                    {
                        $set: {
                            isRead:
                                true
                        }
                    }
                );

            }

            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                success: true,

                message:
                    "Conversation marked as read",

                readCount:
                    readMessageIds.length,

                readMessageIds,

                readByUserId:
                    currentUserId,

                senderId:
                    otherUserId

            });

        } catch (error) {

            console.error(
                "Mark Conversation Read Error:",
                error
            );

            return res.status(500).json({

                success:
                    false,

                message:
                    "Server error while marking messages as read"

            });

        }

    };

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    sendMessage,

    getMessages,

    getUnreadCounts,

    markConversationAsRead

};