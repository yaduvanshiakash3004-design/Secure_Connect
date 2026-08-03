// ======================================================
// SecureConnect Backend Server
// Developed By : Akash Yadav
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const http = require("http");
const path = require("path");

const { Server } = require("socket.io");

// ======================================================
// DATABASE
// ======================================================

const connectDB = require("./config/db");

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");

// ======================================================
// GOOGLE DNS FOR MONGODB ATLAS
// ======================================================

dns.setServers([
    "8.8.8.8"
]);

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// CONNECT MONGODB
// ======================================================

connectDB();

// ======================================================
// CREATE EXPRESS APP
// ======================================================

const app = express();

// ======================================================
// CREATE HTTP SERVER
// ======================================================

const server = http.createServer(app);

// ======================================================
// ALLOWED FRONTEND ORIGINS
// ======================================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "https://secure-connect-eta.vercel.app"
];

// ======================================================
// SOCKET.IO SERVER
// ======================================================

const io = new Server(
    server,
    {

        cors: {

            origin: allowedOrigins,

            methods: [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ],

            credentials: true

        }

    }
);

// ======================================================
// EXPRESS MIDDLEWARE
// ======================================================

app.use(
    cors({

        origin: allowedOrigins,

        credentials: true

    })
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

// ======================================================
// STATIC FILE UPLOADS
// ======================================================
//
// Uploaded files are stored inside:
//
// server/uploads/
//
// They will be accessible through:
//
// http://localhost:5000/uploads/FILENAME
//
// ======================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

// ======================================================
// MAKE SOCKET.IO AVAILABLE IN CONTROLLERS
// ======================================================

app.set(
    "io",
    io
);

// ======================================================
// API ROUTES
// ======================================================

// ======================================================
// AUTHENTICATION
//
// POST /api/auth/register
// POST /api/auth/login
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

// ======================================================
// USERS / CONTACTS
//
// GET /api/users
// ======================================================

app.use(
    "/api/users",
    userRoutes
);

// ======================================================
// PRIVATE MESSAGES
//
// POST  /api/messages
// GET   /api/messages/unread/counts
// PATCH /api/messages/:userId/read
// GET   /api/messages/:userId
//
// POST supports:
// - Text
// - Image
// - File
// ======================================================

app.use(
    "/api/messages",
    messageRoutes
);

// ======================================================
// GROUPS
//
// POST /api/groups
// GET  /api/groups
// GET  /api/groups/:groupId
//
// POST /api/groups/:groupId/members
//
// POST /api/groups/:groupId/messages
// GET  /api/groups/:groupId/messages
// ======================================================

app.use(
    "/api/groups",
    groupRoutes
);

// ======================================================
// ROOT TEST ROUTE
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "SecureConnect Backend is Running 🚀"

        });

    }
);

// ======================================================
// FRONTEND INTEGRATION TEST
// ======================================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "React successfully connected with SecureConnect Backend!"

        });

    }
);

// ======================================================
// ONLINE USERS
// ======================================================
//
// Map structure:
//
// userId -> Set(socketId)
//
// A Set is used because one user may have
// multiple SecureConnect tabs/devices open.
//
// ======================================================

const onlineUsers =
    new Map();

// ======================================================
// GET ONLINE USER IDS
// ======================================================

const getOnlineUserIds = () => {

    return Array.from(
        onlineUsers.keys()
    );

};

// ======================================================
// SOCKET.IO CONNECTION
// ======================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            `Socket connected: ${socket.id}`
        );

        // ==================================================
        // USER ONLINE
        // ==================================================

        socket.on(
            "user-online",
            (userId) => {

                if (!userId) {

                    return;

                }

                const normalizedUserId =
                    userId.toString();

                // ==========================================
                // LEAVE OLD USER ROOM IF NECESSARY
                // ==========================================

                if (
                    socket.userId &&
                    socket.userId !==
                    normalizedUserId
                ) {

                    socket.leave(
                        socket.userId
                    );

                }

                // ==========================================
                // JOIN PERSONAL ROOM
                // ==========================================

                socket.join(
                    normalizedUserId
                );

                // ==========================================
                // GET USER'S EXISTING SOCKETS
                // ==========================================

                let userSockets =
                    onlineUsers.get(
                        normalizedUserId
                    );

                if (!userSockets) {

                    userSockets =
                        new Set();

                    onlineUsers.set(
                        normalizedUserId,
                        userSockets
                    );

                }

                // ==========================================
                // ADD CURRENT SOCKET
                // ==========================================

                userSockets.add(
                    socket.id
                );

                // ==========================================
                // SAVE USER ID ON SOCKET
                // ==========================================

                socket.userId =
                    normalizedUserId;

                console.log(
                    `User online: ${normalizedUserId}`
                );

                // ==========================================
                // SEND ONLINE USERS TO EVERYBODY
                // ==========================================

                io.emit(
                    "online-users",
                    getOnlineUserIds()
                );

            }
        );

        // ==================================================
        // REAL-TIME PRIVATE MESSAGE
        // ==================================================

        socket.on(
            "private-message",
            (data) => {

                if (!data) {

                    return;

                }

                const {
                    receiverId,
                    message
                } = data;

                if (
                    !receiverId ||
                    !message
                ) {

                    return;

                }

                const receiverRoom =
                    receiverId.toString();

                // ==========================================
                // SEND TO RECEIVER'S PERSONAL ROOM
                // ==========================================

                io.to(
                    receiverRoom
                ).emit(
                    "receive-private-message",
                    message
                );

                console.log(
                    `Private message delivered to user: ${receiverRoom}`
                );

            }
        );

        // ==================================================
        // PRIVATE MESSAGE READ RECEIPT
        // ==================================================
        //
        // Receiver:
        //
        // socket.emit(
        //     "private-messages-read",
        //     {
        //         senderId,
        //         readMessageIds
        //     }
        // );
        //
        // Server sends:
        //
        // "private-messages-read-receipt"
        //
        // to the original sender.
        //
        // ==================================================

        socket.on(
            "private-messages-read",
            (data) => {

                if (!data) {

                    return;

                }

                const {
                    senderId,
                    readMessageIds
                } = data;

                // ==========================================
                // VALIDATE ORIGINAL SENDER
                // ==========================================

                if (!senderId) {

                    return;

                }

                // ==========================================
                // CURRENT USER = PERSON WHO READ MESSAGES
                // ==========================================

                if (!socket.userId) {

                    return;

                }

                const normalizedSenderId =
                    senderId.toString();

                const readerId =
                    socket.userId.toString();

                // ==========================================
                // PREVENT INVALID SELF RECEIPT
                // ==========================================

                if (
                    normalizedSenderId ===
                    readerId
                ) {

                    return;

                }

                // ==========================================
                // NORMALIZE READ MESSAGE IDS
                // ==========================================

                const normalizedMessageIds =
                    Array.isArray(
                        readMessageIds
                    )
                        ? readMessageIds
                            .filter(
                                (messageId) =>
                                    messageId
                            )
                            .map(
                                (messageId) =>
                                    messageId.toString()
                            )
                        : [];

                // ==========================================
                // SEND READ RECEIPT TO ORIGINAL SENDER
                // ==========================================

                io.to(
                    normalizedSenderId
                ).emit(
                    "private-messages-read-receipt",
                    {

                        readByUserId:
                            readerId,

                        readMessageIds:
                            normalizedMessageIds

                    }
                );

                console.log(
                    `Private messages read by ${readerId}; receipt delivered to ${normalizedSenderId}`
                );

            }
        );

        // ==================================================
        // JOIN GROUP ROOM
        // ==================================================

        socket.on(
            "join-group",
            (groupId) => {

                if (!groupId) {

                    return;

                }

                const normalizedGroupId =
                    groupId.toString();

                const groupRoom =
                    `group:${normalizedGroupId}`;

                socket.join(
                    groupRoom
                );

                console.log(
                    `Socket ${socket.id} joined group: ${normalizedGroupId}`
                );

            }
        );

        // ==================================================
        // LEAVE GROUP ROOM
        // ==================================================

        socket.on(
            "leave-group",
            (groupId) => {

                if (!groupId) {

                    return;

                }

                const normalizedGroupId =
                    groupId.toString();

                const groupRoom =
                    `group:${normalizedGroupId}`;

                socket.leave(
                    groupRoom
                );

                console.log(
                    `Socket ${socket.id} left group: ${normalizedGroupId}`
                );

            }
        );

        // ==================================================
        // REAL-TIME GROUP MESSAGE
        // ==================================================

        socket.on(
            "group-message",
            (data) => {

                if (!data) {

                    return;

                }

                const {
                    groupId,
                    message
                } = data;

                if (
                    !groupId ||
                    !message
                ) {

                    return;

                }

                const normalizedGroupId =
                    groupId.toString();

                const groupRoom =
                    `group:${normalizedGroupId}`;

                socket
                    .to(groupRoom)
                    .emit(
                        "receive-group-message",
                        message
                    );

                console.log(
                    `Group message delivered to group: ${normalizedGroupId}`
                );

            }
        );

        // ==================================================
        // TYPING INDICATOR - PRIVATE CHAT
        // ==================================================

        socket.on(
            "private-typing",
            (data) => {

                if (!data) {

                    return;

                }

                const {
                    receiverId,
                    isTyping
                } = data;

                if (!receiverId) {

                    return;

                }

                if (!socket.userId) {

                    return;

                }

                socket
                    .to(
                        receiverId.toString()
                    )
                    .emit(
                        "private-typing",
                        {

                            userId:
                                socket.userId,

                            isTyping:
                                Boolean(
                                    isTyping
                                )

                        }
                    );

            }
        );

        // ==================================================
        // TYPING INDICATOR - GROUP CHAT
        // ==================================================

        socket.on(
            "group-typing",
            (data) => {

                if (!data) {

                    return;

                }

                const {
                    groupId,
                    isTyping,
                    userName
                } = data;

                if (!groupId) {

                    return;

                }

                if (!socket.userId) {

                    return;

                }

                const groupRoom =
                    `group:${groupId.toString()}`;

                socket
                    .to(groupRoom)
                    .emit(
                        "group-typing",
                        {

                            groupId:
                                groupId.toString(),

                            userId:
                                socket.userId,

                            userName:
                                userName || "User",

                            isTyping:
                                Boolean(
                                    isTyping
                                )

                        }
                    );

            }
        );

        // ==================================================
        // DISCONNECT
        // ==================================================

        socket.on(
            "disconnect",
            () => {

                console.log(
                    `Socket disconnected: ${socket.id}`
                );

                const userId =
                    socket.userId;

                if (!userId) {

                    return;

                }

                const userSockets =
                    onlineUsers.get(
                        userId
                    );

                if (!userSockets) {

                    return;

                }

                // ==========================================
                // REMOVE THIS SOCKET
                // ==========================================

                userSockets.delete(
                    socket.id
                );

                // ==========================================
                // USER OFFLINE ONLY WHEN ALL CONNECTIONS
                // ARE CLOSED
                // ==========================================

                if (
                    userSockets.size === 0
                ) {

                    onlineUsers.delete(
                        userId
                    );

                    console.log(
                        `User offline: ${userId}`
                    );

                }

                // ==========================================
                // UPDATE EVERY CONNECTED CLIENT
                // ==========================================

                io.emit(
                    "online-users",
                    getOnlineUserIds()
                );

            }
        );

    }
);

// ======================================================
// PORT
// ======================================================

const PORT =
    process.env.PORT || 5000;

// ======================================================
// START SERVER
// ======================================================

server.listen(
    PORT,
    () => {

        console.log(
            `SecureConnect Server running on port ${PORT}`
        );

        console.log(
            "Socket.IO Server ready"
        );

        console.log(
            "Private messaging ready"
        );

        console.log(
            "Private read receipts ready"
        );

        console.log(
            "Real-time group messaging ready"
        );

        console.log(
            "File/Image sharing ready"
        );

    }
);