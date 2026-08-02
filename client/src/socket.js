// ======================================================
// SecureConnect
// Socket.IO Client
// Developed By : Akash Yadav
// ======================================================

import { io } from "socket.io-client";

// ======================================================
// SOCKET CONNECTION
// ======================================================

const socket = io(
    "https://secure-connect-6e84.onrender.com",
    {
        autoConnect: false,

        transports: [
            "websocket",
            "polling"
        ]
    }
);

// ======================================================
// EXPORT
// ======================================================

export default socket;