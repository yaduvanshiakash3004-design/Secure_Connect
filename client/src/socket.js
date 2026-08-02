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
    "http://localhost:5000",
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