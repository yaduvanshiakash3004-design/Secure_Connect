// ======================================================
// SecureConnect
// Group Controller
// Developed By : Akash Yadav
// ======================================================

const mongoose = require("mongoose");

const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");
const User = require("../models/User");

// ======================================================
// HELPER - GET LOGGED-IN USER ID
// ======================================================

const getLoggedInUserId = (req) => {

    if (!req.user) {
        return null;
    }

    return (
        req.user.userId ||
        req.user._id ||
        req.user.id ||
        null
    );

};

// ======================================================
// CREATE GROUP
// POST /api/groups
// PROTECTED
// ======================================================

const createGroup = async (req, res) => {

    try {

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const {
            name,
            description,
            members
        } = req.body;

        // ==================================================
        // VALIDATE GROUP NAME
        // ==================================================

        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Group name is required"
            });

        }

        // ==================================================
        // PREPARE MEMBERS
        // ==================================================

        let groupMembers =
            Array.isArray(members)
                ? members.map(
                    (member) =>
                        member.toString()
                )
                : [];

        // Creator must always be member
        groupMembers.push(
            currentUserId.toString()
        );

        // Remove duplicate IDs
        groupMembers = [
            ...new Set(groupMembers)
        ];

        // ==================================================
        // VALIDATE MEMBER IDS
        // ==================================================

        const validObjectIds =
            groupMembers.filter(
                (memberId) =>
                    mongoose.Types.ObjectId.isValid(
                        memberId
                    )
            );

        // ==================================================
        // VALIDATE USERS
        // ==================================================

        const validUsers =
            await User.find({
                _id: {
                    $in: validObjectIds
                }
            }).select("_id");

        const validMemberIds =
            validUsers.map(
                (user) =>
                    user._id
            );

        // ==================================================
        // MAKE SURE CREATOR EXISTS
        // ==================================================

        const creatorExists =
            validUsers.some(
                (user) =>
                    user._id.toString() ===
                    currentUserId.toString()
            );

        if (!creatorExists) {

            return res.status(404).json({
                success: false,
                message: "Logged-in user not found"
            });

        }

        // ==================================================
        // CREATE GROUP
        // ==================================================

        const group =
            await Group.create({

                name:
                    name.trim(),

                description:
                    description
                        ? description.trim()
                        : "",

                admin:
                    currentUserId,

                members:
                    validMemberIds

            });

        // ==================================================
        // POPULATE GROUP
        // ==================================================

        const populatedGroup =
            await Group.findById(
                group._id
            )
                .populate(
                    "admin",
                    "name email avatar status"
                )
                .populate(
                    "members",
                    "name email avatar status"
                );

        return res.status(201).json({

            success: true,

            message:
                "Group created successfully",

            group:
                populatedGroup

        });

    } catch (error) {

        console.error(
            "Create Group Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to create group"

        });

    }

};

// ======================================================
// GET LOGGED-IN USER GROUPS
// GET /api/groups
// PROTECTED
// ======================================================

const getMyGroups = async (req, res) => {

    try {

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const groups =
            await Group.find({

                members:
                    currentUserId

            })
                .populate(
                    "admin",
                    "name email avatar status"
                )
                .populate(
                    "members",
                    "name email avatar status"
                )
                .sort({
                    lastMessageAt: -1,
                    updatedAt: -1
                });

        return res.status(200).json({

            success: true,

            count:
                groups.length,

            groups

        });

    } catch (error) {

        console.error(
            "Get Groups Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load groups"

        });

    }

};

// ======================================================
// GET SINGLE GROUP
// GET /api/groups/:groupId
// PROTECTED
// ======================================================

const getGroupById = async (
    req,
    res
) => {

    try {

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const groupId =
            req.params.groupId;

        // ==================================================
        // VALIDATE GROUP ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                groupId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid group ID"

            });

        }

        const group =
            await Group.findById(
                groupId
            )
                .populate(
                    "admin",
                    "name email avatar status"
                )
                .populate(
                    "members",
                    "name email avatar status"
                );

        if (!group) {

            return res.status(404).json({

                success: false,

                message:
                    "Group not found"

            });

        }

        // ==================================================
        // CHECK MEMBERSHIP
        // ==================================================

        const isMember =
            group.members.some(
                (member) =>
                    member._id.toString() ===
                    currentUserId.toString()
            );

        if (!isMember) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not a member of this group"

            });

        }

        return res.status(200).json({

            success: true,

            group

        });

    } catch (error) {

        console.error(
            "Get Group Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load group"

        });

    }

};

// ======================================================
// ADD MEMBER TO GROUP
// POST /api/groups/:groupId/members
// PROTECTED - ADMIN ONLY
// ======================================================

const addGroupMember = async (
    req,
    res
) => {

    try {

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const {
            userId
        } = req.body;

        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required"

            });

        }

        // ==================================================
        // VALIDATE USER ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID"

            });

        }

        // ==================================================
        // VALIDATE GROUP ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.groupId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid group ID"

            });

        }

        const group =
            await Group.findById(
                req.params.groupId
            );

        if (!group) {

            return res.status(404).json({

                success: false,

                message:
                    "Group not found"

            });

        }

        // ==================================================
        // ADMIN CHECK
        // ==================================================

        if (
            group.admin.toString() !==
            currentUserId.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only group admin can add members"

            });

        }

        // ==================================================
        // CHECK USER
        // ==================================================

        const user =
            await User.findById(
                userId
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }

        // ==================================================
        // CHECK EXISTING MEMBER
        // ==================================================

        const alreadyMember =
            group.members.some(
                (member) =>
                    member.toString() ===
                    user._id.toString()
            );

        if (alreadyMember) {

            return res.status(400).json({

                success: false,

                message:
                    "User is already a group member"

            });

        }

        // ==================================================
        // ADD MEMBER
        // ==================================================

        group.members.push(
            user._id
        );

        await group.save();

        // ==================================================
        // RETURN UPDATED GROUP
        // ==================================================

        const updatedGroup =
            await Group.findById(
                group._id
            )
                .populate(
                    "admin",
                    "name email avatar status"
                )
                .populate(
                    "members",
                    "name email avatar status"
                );

        return res.status(200).json({

            success: true,

            message:
                "Member added successfully",

            group:
                updatedGroup

        });

    } catch (error) {

        console.error(
            "Add Group Member Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to add group member"

        });

    }

};

// ======================================================
// SEND GROUP MESSAGE
// POST /api/groups/:groupId/messages
//
// SUPPORTS:
// - TEXT
// - IMAGE
// - FILE
// - TEXT + FILE
//
// PROTECTED
// ======================================================

const sendGroupMessage = async (
    req,
    res
) => {

    try {

        // ==================================================
        // CURRENT USER
        // ==================================================

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }

        // ==================================================
        // GROUP ID
        // ==================================================

        const groupId =
            req.params.groupId;

        if (
            !mongoose.Types.ObjectId.isValid(
                groupId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid group ID"

            });

        }

        // ==================================================
        // REQUEST MESSAGE
        // ==================================================

        const {
            message
        } = req.body;

        // ==================================================
        // UPLOADED FILE
        // ==================================================

        const uploadedFile =
            req.file || null;

        // ==================================================
        // CHECK TEXT / FILE
        // ==================================================

        const hasText =
            typeof message === "string" &&
            message.trim().length > 0;

        const hasFile =
            uploadedFile !== null;

        if (
            !hasText &&
            !hasFile
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message or file is required"

            });

        }

        // ==================================================
        // FIND GROUP
        // ==================================================

        const group =
            await Group.findById(
                groupId
            );

        if (!group) {

            return res.status(404).json({

                success: false,

                message:
                    "Group not found"

            });

        }

        // ==================================================
        // CHECK MEMBERSHIP
        // ==================================================

        const isMember =
            group.members.some(
                (member) =>
                    member.toString() ===
                    currentUserId.toString()
            );

        if (!isMember) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not a member of this group"

            });

        }

        // ==================================================
        // DEFAULT FILE VALUES
        // ==================================================

        let messageType =
            "text";

        let fileUrl =
            "";

        let fileName =
            "";

        let fileType =
            "";

        let fileSize =
            0;

        // ==================================================
        // PROCESS FILE
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
            // IMAGE OR DOCUMENT
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
        // CREATE GROUP MESSAGE
        // ==================================================

        const groupMessage =
            await GroupMessage.create({

                sender:
                    currentUserId,

                group:
                    group._id,

                message:
                    hasText
                        ? message.trim()
                        : "",

                messageType,

                fileUrl,

                fileName,

                fileType,

                fileSize,

                readBy: [
                    currentUserId
                ]

            });

        // ==================================================
        // GROUP LAST MESSAGE PREVIEW
        // ==================================================

        let lastMessagePreview =
            "";

        if (hasText) {

            lastMessagePreview =
                message.trim();

        } else if (
            messageType ===
            "image"
        ) {

            lastMessagePreview =
                "📷 Image";

        } else if (
            messageType ===
            "file"
        ) {

            lastMessagePreview =
                `📎 ${fileName || "File"}`;

        }

        // ==================================================
        // UPDATE GROUP PREVIEW
        // ==================================================

        group.lastMessage =
            lastMessagePreview;

        group.lastMessageAt =
            groupMessage.createdAt;

        await group.save();

        // ==================================================
        // POPULATE MESSAGE
        // ==================================================

        const populatedMessage =
            await GroupMessage.findById(
                groupMessage._id
            )
                .populate(
                    "sender",
                    "name email avatar status"
                );

        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                uploadedFile
                    ? "Group file sent successfully"
                    : "Group message sent successfully",

            data:
                populatedMessage

        });

    } catch (error) {

        console.error(
            "Send Group Message Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to send group message"

        });

    }

};

// ======================================================
// GET GROUP MESSAGES
// GET /api/groups/:groupId/messages
// PROTECTED
// ======================================================

const getGroupMessages = async (
    req,
    res
) => {

    try {

        const currentUserId =
            getLoggedInUserId(req);

        if (!currentUserId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }

        const groupId =
            req.params.groupId;

        // ==================================================
        // VALIDATE GROUP ID
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                groupId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid group ID"

            });

        }

        const group =
            await Group.findById(
                groupId
            );

        if (!group) {

            return res.status(404).json({

                success: false,

                message:
                    "Group not found"

            });

        }

        // ==================================================
        // CHECK MEMBERSHIP
        // ==================================================

        const isMember =
            group.members.some(
                (member) =>
                    member.toString() ===
                    currentUserId.toString()
            );

        if (!isMember) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not a member of this group"

            });

        }

        // ==================================================
        // FETCH GROUP MESSAGES
        // ==================================================

        const messages =
            await GroupMessage.find({

                group:
                    group._id

            })
                .populate(
                    "sender",
                    "name email avatar status"
                )
                .sort({
                    createdAt: 1
                });

        // ==================================================
        // MARK MESSAGES READ
        // ==================================================

        await GroupMessage.updateMany(
            {
                group:
                    group._id,

                sender: {
                    $ne:
                        currentUserId
                },

                readBy: {
                    $ne:
                        currentUserId
                }
            },
            {
                $addToSet: {
                    readBy:
                        currentUserId
                }
            }
        );

        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(200).json({

            success: true,

            count:
                messages.length,

            messages

        });

    } catch (error) {

        console.error(
            "Get Group Messages Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load group messages"

        });

    }

};

// ======================================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================================

module.exports = {

    createGroup,

    getMyGroups,

    getGroupById,

    addGroupMember,

    sendGroupMessage,

    getGroupMessages

};