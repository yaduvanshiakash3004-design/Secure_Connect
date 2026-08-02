// ======================================================
// SecureConnect Dashboard
// Developed By : Akash Yadav
// ======================================================

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "../styles/Dashboard.css";

import socket from "../socket";

import {
  FaSearch,
  FaBell,
  FaCog,
  FaUserCircle,
  FaShieldAlt,
  FaPaperclip,
  FaTimes,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";

// ======================================================
// BACKEND
// ======================================================

const API_URL = "http://localhost:5000";

// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const navigate = useNavigate();

  // ====================================================
  // CURRENT USER
  // ====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("secureconnect_user")
  );

  const currentUser = storedUser || {
    id: "",
    _id: "",
    name: "User",
    email: "",
  };

  const currentUserId =
    currentUser._id ||
    currentUser.id ||
    "";

  const token = localStorage.getItem(
    "secureconnect_token"
  );

  // ====================================================
  // BACKEND STATUS
  // ====================================================

  const [
    backendStatus,
    setBackendStatus,
  ] = useState("");

  // ====================================================
  // CONTACT STATES
  // ====================================================

  const [
    contacts,
    setContacts,
  ] = useState([]);

  const [
    contactsLoading,
    setContactsLoading,
  ] = useState(true);

  const [
    contactsError,
    setContactsError,
  ] = useState("");

  const [
    contactSearch,
    setContactSearch,
  ] = useState("");

  const [
    onlineUsers,
    setOnlineUsers,
  ] = useState([]);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);
 // ====================================================
  // PRIVATE UNREAD MESSAGE COUNTS
  // ====================================================

  const [
    privateUnreadCounts,
    setPrivateUnreadCounts,
  ] = useState({});
  // ====================================================
  // PRIVATE CHAT
  // ====================================================

  const [
    privateMessage,
    setPrivateMessage,
  ] = useState("");

  const [
    privateMessages,
    setPrivateMessages,
  ] = useState([]);

  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);

  const [
    messageError,
    setMessageError,
  ] = useState("");

  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false);

  // ====================================================
  // PRIVATE TYPING INDICATOR
  // ====================================================

  const [
    privateTypingUser,
    setPrivateTypingUser,
  ] = useState(null);

  const privateTypingTimeoutRef =
    useRef(null);

  // ====================================================
  // PRIVATE FILE
  // ====================================================

  const [
    privateFile,
    setPrivateFile,
  ] = useState(null);

  const [
    privateFilePreview,
    setPrivateFilePreview,
  ] = useState("");

  const privateFileInputRef =
    useRef(null);

  // ====================================================
  // GROUP STATES
  // ====================================================

  const [
    groups,
    setGroups,
  ] = useState([]);

  const [
    groupsLoading,
    setGroupsLoading,
  ] = useState(true);

  const [
    groupsError,
    setGroupsError,
  ] = useState("");

  const [
    groupSearch,
    setGroupSearch,
  ] = useState("");

  const [
  selectedGroup,
  setSelectedGroup,
] = useState(null);

// ====================================================
// ADD GROUP MEMBER
// ====================================================

const [
  showAddMember,
  setShowAddMember,
] = useState(false);

const [
  addingMember,
  setAddingMember,
] = useState(false);

const [
  addMemberError,
  setAddMemberError,
] = useState("");

const [
  addMemberSuccess,
  setAddMemberSuccess,
] = useState("");

const [
  groupMessage,
  setGroupMessage,
] = useState("");

const [
  groupMessages,
  setGroupMessages,
] = useState([]);

const [
  groupMessagesLoading,
  setGroupMessagesLoading,
] = useState(false);

const [
  groupMessageError,
  setGroupMessageError,
] = useState("");

const [
  sendingGroupMessage,
  setSendingGroupMessage,
] = useState(false);

// ====================================================
// GROUP TYPING INDICATOR
// ==========================================================================================

  const [
    groupTypingUsers,
    setGroupTypingUsers,
  ] = useState({});

  const groupTypingTimeoutRef =
    useRef(null);

  // ====================================================
  // GROUP FILE
  // ====================================================

  const [
    groupFile,
    setGroupFile,
  ] = useState(null);

  const [
    groupFilePreview,
    setGroupFilePreview,
  ] = useState("");

  const groupFileInputRef =
    useRef(null);

  // ====================================================
  // TIME
  // ====================================================

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ====================================================
  // MESSAGE PREVIEW
  // ====================================================

  const getMessagePreview = (message) => {
    if (!message) {
      return "";
    }

    if (
      message.message &&
      message.message.trim()
    ) {
      return message.message;
    }

    if (message.messageType === "image") {
      return "📷 Image";
    }

    if (message.messageType === "file") {
      return `📎 ${
        message.fileName || "File"
      }`;
    }

    return "Message";
  };

  // ====================================================
  // BACKEND TEST
  // ====================================================

  useEffect(() => {
    fetch(`${API_URL}/api/test`)
      .then((response) => response.json())
      .then((data) => {
        console.log(
          "Backend Response:",
          data
        );

        setBackendStatus(data.message);
      })
      .catch((error) => {
        console.error(
          "Backend Connection Error:",
          error
        );
      });
  }, []);

  // ====================================================
  // CONTACTS
  // ====================================================

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setContactsLoading(true);
        setContactsError("");

        if (!token) {
          setContactsError(
            "Authentication token not found."
          );
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load contacts"
          );
        }

        const formattedContacts = (
          data.users || []
        ).map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,

          status: "offline",

          lastMessage:
            "Start a conversation",

          time: "",
        }));

       setContacts(
  (previousContacts) =>
    formattedContacts.map(
      (person) => {
        const previousPerson =
          previousContacts.find(
            (oldPerson) =>
              String(oldPerson.id) ===
              String(person.id)
          );

        return {
          ...person,

          status:
            previousPerson?.status ===
            "online"
              ? "online"
              : person.status,
        };
      }
    )
);

       if (formattedContacts.length > 0) {
  setSelectedUser(
    (previousSelected) => {
      if (previousSelected) {
        const existing =
          formattedContacts.find(
            (person) =>
              String(person.id) ===
              String(
                previousSelected.id
              )
          );

        if (existing) {
          return {
            ...existing,

            status:
              previousSelected.status ||
              existing.status,
          };
        }
      }

      return formattedContacts[0];
    }
  );
} else {
  setSelectedUser(null);
}
      } catch (error) {
        console.error(
          "Contacts Fetch Error:",
          error
        );

        setContactsError(
          error.message ||
            "Unable to load contacts"
        );
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, [token]);
    // ====================================================
  // PRIVATE UNREAD MESSAGE COUNTS
  // ====================================================

  useEffect(() => {
    const fetchPrivateUnreadCounts =
      async () => {
        try {
          if (!token) {
            return;
          }

          const response = await fetch(
            `${API_URL}/api/messages/unread/counts`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load unread counts"
            );
          }

          console.log(
            "Private unread counts:",
            data
          );

          setPrivateUnreadCounts(
            data.unreadCounts || {}
          );
        } catch (error) {
          console.error(
            "Private Unread Counts Error:",
            error
          );
        }
      };

    fetchPrivateUnreadCounts();
  }, [token]);
// ====================================================
// MARK PRIVATE CONVERSATION AS READ
// ====================================================

const markPrivateConversationAsRead =
  async (userId) => {
    if (!userId || !token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/messages/${userId}/read`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to mark messages as read"
        );
      }

      console.log(
        "Conversation marked as read:",
        data
      );

      // ----------------------------------------------
      // UPDATE RECEIVER SIDE LOCALLY
      // ----------------------------------------------

      setPrivateMessages(
        (previousMessages) =>
          previousMessages.map(
            (message) =>
              message.sender === "other"
                ? {
                    ...message,
                    isRead: true,
                  }
                : message
          )
      );

      // ----------------------------------------------
      // SEND READ RECEIPT TO ORIGINAL SENDER
      // ----------------------------------------------

      if (
        data.senderId &&
        Array.isArray(
          data.readMessageIds
        ) &&
        data.readMessageIds.length > 0
      ) {
        socket.emit(
          "private-messages-read",
          {
            senderId:
              data.senderId,

            readMessageIds:
              data.readMessageIds,
          }
        );

        console.log(
          "Read receipt sent:",
          data.readMessageIds
        );
      }
    } catch (error) {
      console.error(
        "Mark private conversation read error:",
        error
      );
    }
  };
  // ====================================================
  // GROUPS
  // ====================================================

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setGroupsLoading(true);
        setGroupsError("");

        if (!token) {
          setGroupsError(
            "Authentication token not found."
          );
          return;
        }

        const response = await fetch(
          `${API_URL}/api/groups`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load groups"
          );
        }

        const backendGroups =
          data.groups ||
          data.data ||
          [];

        const formattedGroups =
          backendGroups.map((group) => ({
            id: group._id,
            _id: group._id,

            name:
              group.name ||
              "Unnamed Group",

            description:
              group.description || "",

            admin: group.admin,

            members: Array.isArray(
              group.members
            )
              ? group.members
              : [],

            memberCount: Array.isArray(
              group.members
            )
              ? group.members.length
              : 0,

            avatar: group.avatar || "",

            lastMessage:
              group.lastMessage ||
              "Start group conversation",

            lastMessageAt:
              group.lastMessageAt,

            time: group.lastMessageAt
              ? formatTime(
                  group.lastMessageAt
                )
              : "",

            unread: 0,
          }));

        setGroups(formattedGroups);

        if (formattedGroups.length > 0) {
          setSelectedGroup(
            (previousSelected) => {
              if (previousSelected) {
                const existing =
                  formattedGroups.find(
                    (group) =>
                      group.id ===
                      previousSelected.id
                  );

                if (existing) {
                  return existing;
                }
              }

              return formattedGroups[0];
            }
          );
        } else {
          setSelectedGroup(null);
        }
      } catch (error) {
        console.error(
          "Groups Fetch Error:",
          error
        );

        setGroupsError(
          error.message ||
            "Unable to load groups"
        );
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, [token]);

  // ====================================================
  // SOCKET.IO
  // ====================================================

  useEffect(() => {
    if (!currentUserId) {
      console.log(
        "Socket not connected: User ID missing"
      );

      return;
    }

    // ==================================================
    // CONNECT
    // ==================================================
const handleConnect = () => {
  console.log(
    "Socket connected:",
    socket.id
  );

  console.log(
    "CURRENT USER ONLINE ID:",
    currentUserId
  );

  socket.emit(
    "user-online",
    currentUserId
  );
};

    // ==================================================
    // ONLINE USERS
    // ==================================================

  const handleOnlineUsers = (
  userIds
) => {
  console.log(
    "ONLINE USERS RECEIVED:",
    userIds
  );
console.log(
  "SELECTED USER ID:",
  selectedUser?.id
);

console.log(
  "CURRENT USER ID:",
  currentUserId
);
  const normalizedUserIds = (
    userIds || []
  ).map((id) =>
    String(id)
  );

  console.log(
    "NORMALIZED ONLINE USERS:",
    normalizedUserIds
  );

// SAVE ONLINE USERS IN STATE
setOnlineUsers(
  normalizedUserIds
);

  setContacts(
    (previousContacts) =>
      previousContacts.map(
        (person) => ({
          ...person,

          status:
            normalizedUserIds.includes(
              String(person.id)
            )
              ? "online"
              : "offline",
        })
      )
  );

  setSelectedUser(
    (previousSelected) => {
      if (!previousSelected) {
        return null;
      }

      return {
        ...previousSelected,

        status:
          normalizedUserIds.includes(
            String(
              previousSelected.id
            )
          )
            ? "online"
            : "offline",
      };
    }
  );
};
// ======================================================
// PRIVATE MESSAGE READ RECEIPT
// ======================================================

const handlePrivateReadReceipt = (data) => {
  console.log(
    "Private read receipt received:",
    data
  );

  if (
    !data ||
    !Array.isArray(data.readMessageIds)
  ) {
    return;
  }

  const readIds = new Set(
    data.readMessageIds.map((id) =>
      String(id)
    )
  );
  setPrivateMessages(
    (previousMessages) => {
      return previousMessages.map(
        (message) => {
          const messageId =
            message._id ||
            message.id;

          if (
            messageId &&
            readIds.has(
              String(messageId)
            )
          ) {
            return {
              ...message,
              isRead: true,
            };
          }

          return message;
        }
      );
    }
  );
};
    // ==================================================
    // PRIVATE TYPING RECEIVE
    // ==================================================

    const handlePrivateTyping = (
      data
    ) => {
      if (!data || !data.userId) {
        return;
      }

      if (data.isTyping) {
        setPrivateTypingUser({
          userId: data.userId,
        });
      } else {
        setPrivateTypingUser(
          (previousTypingUser) => {
            if (
              previousTypingUser?.userId ===
              data.userId
            ) {
              return null;
            }

            return previousTypingUser;
          }
        );
      }
    };

    // ==================================================
    // GROUP TYPING RECEIVE
    // ==================================================

    const handleGroupTyping = (
      data
    ) => {
      if (
        !data ||
        !data.groupId ||
        !data.userId
      ) {
        return;
      }

      setGroupTypingUsers(
  (previousTypingUsers) => {

    const updated = {
      ...previousTypingUsers,
    };

    if (!updated[data.groupId]) {
      updated[data.groupId] = {};
    } else {
      updated[data.groupId] = {
        ...updated[data.groupId],
      };
    }

    if (data.isTyping) {
      updated[data.groupId][
        data.userId
      ] =
        data.userName ||
        "User";
    } else {
      delete updated[data.groupId][
        data.userId
      ];

      if (
        Object.keys(
          updated[data.groupId]
        ).length === 0
      ) {
        delete updated[
          data.groupId
        ];
      }
    }

    

    return updated;
  }
);
// CLOSE handleGroupTyping
};
    // ==================================================
    // PRIVATE MESSAGE
    // ==================================================

    const handlePrivateMessage = (
      savedMessage
    ) => {
      if (!savedMessage) {
        return;
      }

      console.log(
        "Real-time private message:",
        savedMessage
      );

      const senderId =
        typeof savedMessage.sender ===
        "object"
          ? savedMessage.sender._id
          : savedMessage.sender;

      const receiverId =
        typeof savedMessage.receiver ===
        "object"
          ? savedMessage.receiver._id
          : savedMessage.receiver;

      if (
        receiverId !== currentUserId
      ) {
        return;
      }

      // Stop typing indicator as soon as
      // the actual message arrives.
      setPrivateTypingUser(
        (previousTypingUser) =>
          previousTypingUser?.userId ===
          senderId
            ? null
            : previousTypingUser
      );

      const formattedMessage = {
        id:
          savedMessage._id ||
          Date.now(),

        sender: "other",

        text:
          savedMessage.message || "",

        messageType:
          savedMessage.messageType ||
          "text",

        fileUrl:
          savedMessage.fileUrl || "",

        fileName:
          savedMessage.fileName || "",

        fileType:
          savedMessage.fileType || "",

        fileSize:
          savedMessage.fileSize || 0,

        time: savedMessage.createdAt
          ? formatTime(
              savedMessage.createdAt
            )
          : getCurrentTime(),

        isRead:
          savedMessage.isRead || false,
      };

      setSelectedUser(
  (currentSelectedUser) => {
    if (
      currentSelectedUser &&
      String(currentSelectedUser.id) ===
        String(senderId)
    ) {
      // ==============================================
      // ADD REAL-TIME MESSAGE TO OPEN CHAT
      // ==============================================

      setPrivateMessages(
        (previousMessages) => {
          const exists =
            previousMessages.some(
              (message) =>
                String(message.id) ===
                String(
                  formattedMessage.id
                )
            );

          if (exists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            formattedMessage,
          ];
        }
      );

      // ==============================================
      // MARK NEW MESSAGE AS READ
      // ==============================================

      setTimeout(() => {
        markPrivateConversationAsRead(
          senderId
        );
      }, 0);
    }

    return currentSelectedUser;
  }
);
            setContacts(
        (previousContacts) =>
          previousContacts.map(
            (person) => {
              if (
                person.id !== senderId
              ) {
                return person;
              }

              return {
                ...person,

                lastMessage:
                  getMessagePreview(
                    savedMessage
                  ),

                time:
                  savedMessage.createdAt
                    ? formatTime(
                        savedMessage.createdAt
                      )
                    : getCurrentTime(),
              };
            }
          )
      );

      // ==================================================
      // UPDATE PRIVATE UNREAD COUNT
      // ==================================================

      setSelectedUser(
        (currentSelectedUser) => {
          const isChatOpen =
            currentSelectedUser &&
            String(
              currentSelectedUser.id
            ) === String(senderId);

          // Increase unread only when
          // sender's chat is NOT currently open.
          if (!isChatOpen) {
            setPrivateUnreadCounts(
              (previousCounts) => ({
                ...previousCounts,

                [senderId]:
                  (previousCounts[
                    senderId
                  ] || 0) + 1,
              })
            );
          }

          return currentSelectedUser;
        }
      );
    };

    // ==================================================
    // GROUP MESSAGE
    // ==================================================

    const handleGroupMessage = (
      savedMessage
    ) => {
      if (!savedMessage) {
        return;
      }

      console.log(
        "Real-time group message:",
        savedMessage
      );

      const incomingGroupId =
        typeof savedMessage.group ===
        "object"
          ? savedMessage.group._id
          : savedMessage.group;

      const senderId =
        typeof savedMessage.sender ===
        "object"
          ? savedMessage.sender._id
          : savedMessage.sender;

      const senderName =
        typeof savedMessage.sender ===
        "object"
          ? savedMessage.sender.name
          : "User";

      // Remove sender from typing indicator.
      setGroupTypingUsers(
        (previousTypingUsers) => {
          if (
            !previousTypingUsers[
              incomingGroupId
            ]
          ) {
            return previousTypingUsers;
          }

          const updated = {
            ...previousTypingUsers,
          };

          updated[incomingGroupId] = {
            ...updated[incomingGroupId],
          };

          delete updated[
            incomingGroupId
          ][senderId];

          if (
            Object.keys(
              updated[incomingGroupId]
            ).length === 0
          ) {
            delete updated[
              incomingGroupId
            ];
          }

          return updated;
        }
      );

      const formattedMessage = {
        id:
          savedMessage._id ||
          Date.now(),

        sender: senderName,

        senderId,

        type:
          senderId === currentUserId
            ? "me"
            : "other",

        text:
          savedMessage.message || "",

        messageType:
          savedMessage.messageType ||
          "text",

        fileUrl:
          savedMessage.fileUrl || "",

        fileName:
          savedMessage.fileName || "",

        fileType:
          savedMessage.fileType || "",

        fileSize:
          savedMessage.fileSize || 0,

        time:
          savedMessage.createdAt
            ? formatTime(
                savedMessage.createdAt
              )
            : getCurrentTime(),
      };

      setSelectedGroup(
        (currentSelectedGroup) => {
          if (
            currentSelectedGroup &&
            currentSelectedGroup.id ===
              incomingGroupId
          ) {
            setGroupMessages(
              (previousMessages) => {
                const exists =
                  previousMessages.some(
                    (message) =>
                      message.id ===
                      formattedMessage.id
                  );

                if (exists) {
                  return previousMessages;
                }

                return [
                  ...previousMessages,
                  formattedMessage,
                ];
              }
            );
          }

          return currentSelectedGroup;
        }
      );

      setGroups(
        (previousGroups) =>
          previousGroups.map(
            (group) =>
              group.id ===
              incomingGroupId
                ? {
                    ...group,

                    lastMessage:
                      getMessagePreview(
                        savedMessage
                      ),

                    time:
                      savedMessage.createdAt
                        ? formatTime(
                            savedMessage.createdAt
                          )
                        : getCurrentTime(),
                  }
                : group
          )
      );
    };

    // ==================================================
    // REGISTER SOCKET EVENTS
    // ==================================================

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "online-users",
      handleOnlineUsers
    );

    socket.on(
      "receive-private-message",
      handlePrivateMessage
    );

    socket.on(
  "receive-group-message",
  handleGroupMessage
);

// ==============================================
// PRIVATE MESSAGE READ RECEIPT
// ==============================================

socket.on(
  "private-messages-read-receipt",
  handlePrivateReadReceipt
);

socket.on(
  "private-typing",
  handlePrivateTyping
);

    socket.on(
      "group-typing",
      handleGroupTyping
    );

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit(
        "user-online",
        currentUserId
      );
    }

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
  socket.off(
    "connect",
    handleConnect
  );

  socket.off(
    "online-users",
    handleOnlineUsers
  );

  socket.off(
    "receive-private-message",
    handlePrivateMessage
  );

  socket.off(
    "receive-group-message",
    handleGroupMessage
  );

  // ==============================================
  // PRIVATE READ RECEIPT CLEANUP
  // ==============================================

  socket.off(
    "private-messages-read-receipt",
    handlePrivateReadReceipt
  );

  socket.off(
    "private-typing",
    handlePrivateTyping
  );

  socket.off(
    "group-typing",
    handleGroupTyping
  );

  socket.disconnect();
};
}, [currentUserId]);
    // ====================================================
  // PRIVATE MESSAGES
  // ====================================================

  useEffect(() => {
    if (!selectedUser || !token) {
      setPrivateMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        setMessageError("");

        const response = await fetch(
          `${API_URL}/api/messages/${selectedUser.id}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load messages"
          );
        }

        const formattedMessages = (
          data.messages || []
        ).map((message) => {
          const senderId =
            typeof message.sender ===
            "object"
              ? message.sender._id
              : message.sender;

          return {
            id: message._id,

            sender:
              senderId === currentUserId
                ? "me"
                : "other",

            text:
              message.message || "",

            messageType:
              message.messageType ||
              "text",

            fileUrl:
              message.fileUrl || "",

            fileName:
              message.fileName || "",

            fileType:
              message.fileType || "",

            fileSize:
              message.fileSize || 0,

            time: formatTime(
              message.createdAt
            ),

            isRead:
              message.isRead,
          };
        });

       setPrivateMessages(
  formattedMessages
);

// ==================================================
// SEND READ RECEIPT FOR MESSAGES MARKED READ BY GET
// ==================================================

if (
  data.senderId &&
  Array.isArray(data.readMessageIds) &&
  data.readMessageIds.length > 0
) {
  socket.emit(
    "private-messages-read",
    {
      senderId: data.senderId,
      readMessageIds:
        data.readMessageIds,
    }
  );

  console.log(
    "Read receipt sent from GET:",
    {
      senderId: data.senderId,
      readMessageIds:
        data.readMessageIds,
    }
  );
}

if (
  data.messages &&
  data.messages.length > 0
) {
  const lastMessage =
    data.messages[
      data.messages.length - 1
    ];

  setContacts(
    (previousContacts) =>
      previousContacts.map(
        (person) =>
          person.id ===
          selectedUser.id
            ? {
                ...person,

                lastMessage:
                  getMessagePreview(
                    lastMessage
                  ),

                time: formatTime(
                  lastMessage.createdAt
                ),
              }
            : person
      )
  );
}
      } catch (error) {
        console.error(
          "Messages Fetch Error:",
          error
        );

        setMessageError(
          error.message ||
            "Unable to load messages"
        );
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [
    selectedUser?.id,
    token,
    currentUserId,
  ]);

  // ====================================================
  // GROUP ROOM + GROUP MESSAGES
  // ====================================================

  useEffect(() => {
    if (
      !selectedGroup ||
      !selectedGroup.id ||
      !token
    ) {
      setGroupMessages([]);
      return;
    }

    const groupId =
      selectedGroup.id;

    // ==================================================
    // JOIN SOCKET GROUP ROOM
    // ==================================================

    socket.emit(
      "join-group",
      groupId
    );

    const fetchGroupMessages =
      async () => {
        try {
          setGroupMessagesLoading(true);

          setGroupMessageError("");

          const response = await fetch(
            `${API_URL}/api/groups/${groupId}/messages`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load group messages"
            );
          }

          const formattedMessages = (
            data.messages || []
          ).map((message) => {
            const senderId =
              typeof message.sender ===
              "object"
                ? message.sender._id
                : message.sender;

            const senderName =
              typeof message.sender ===
              "object"
                ? message.sender.name
                : "User";

            return {
              id: message._id,

              sender:
                senderName,

              senderId,

              type:
                senderId ===
                currentUserId
                  ? "me"
                  : "other",

              text:
                message.message ||
                "",

              messageType:
                message.messageType ||
                "text",

              fileUrl:
                message.fileUrl ||
                "",

              fileName:
                message.fileName ||
                "",

              fileType:
                message.fileType ||
                "",

              fileSize:
                message.fileSize ||
                0,

              time:
                formatTime(
                  message.createdAt
                ),
            };
          });

          setGroupMessages(
            formattedMessages
          );
        } catch (error) {
          console.error(
            "Group Messages Fetch Error:",
            error
          );

          setGroupMessageError(
            error.message ||
              "Unable to load group messages"
          );
        } finally {
          setGroupMessagesLoading(
            false
          );
        }
      };

    fetchGroupMessages();

    // ==================================================
    // CLEANUP GROUP ROOM
    // ==================================================

    return () => {
      socket.emit(
        "leave-group",
        groupId
      );
    };
  }, [
    selectedGroup?.id,
    token,
    currentUserId,
  ]);

  // ====================================================
  // CLEAR PRIVATE TYPING WHEN CONTACT CHANGES
  // ====================================================

  useEffect(() => {
    setPrivateTypingUser(null);

    if (
      privateTypingTimeoutRef.current
    ) {
      clearTimeout(
        privateTypingTimeoutRef.current
      );
    }
  }, [selectedUser?.id]);

  // ====================================================
  // CLEAR LOCAL GROUP TYPING TIMER
  // WHEN GROUP CHANGES
  // ====================================================

  useEffect(() => {
    if (
      groupTypingTimeoutRef.current
    ) {
      clearTimeout(
        groupTypingTimeoutRef.current
      );
    }
  }, [selectedGroup?.id]);

  // ====================================================
  // CLEANUP TYPING TIMERS
  // ====================================================

  useEffect(() => {
    return () => {
      if (
        privateTypingTimeoutRef.current
      ) {
        clearTimeout(
          privateTypingTimeoutRef.current
        );
      }

      if (
        groupTypingTimeoutRef.current
      ) {
        clearTimeout(
          groupTypingTimeoutRef.current
        );
      }
    };
  }, []);

  // ====================================================
  // FILTER CONTACTS
  // ====================================================

  const filteredContacts =
    contacts.filter((person) => {
      const searchValue =
        contactSearch
          .toLowerCase()
          .trim();

      return (
        person.name
          .toLowerCase()
          .includes(searchValue) ||
        person.email
          .toLowerCase()
          .includes(searchValue)
      );
    });
 
  // ====================================================
  // FILTER GROUPS
  // ====================================================

  const filteredGroups =
    groups.filter((group) => {
      const searchValue =
        groupSearch
          .toLowerCase()
          .trim();

      return group.name
        .toLowerCase()
        .includes(searchValue);
    });

  // ====================================================
  // PRIVATE FILE SELECT
  // ====================================================

  const handlePrivateFileSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setMessageError(
        "File size cannot exceed 10 MB."
      );

      event.target.value = "";

      return;
    }

    setMessageError("");

    if (privateFilePreview) {
      URL.revokeObjectURL(
        privateFilePreview
      );
    }

    setPrivateFile(file);

    if (
      file.type.startsWith(
        "image/"
      )
    ) {
      setPrivateFilePreview(
        URL.createObjectURL(file)
      );
    } else {
      setPrivateFilePreview("");
    }
  };

  // ====================================================
  // REMOVE PRIVATE FILE
  // ====================================================

  const removePrivateFile = () => {
    if (privateFilePreview) {
      URL.revokeObjectURL(
        privateFilePreview
      );
    }

    setPrivateFile(null);

    setPrivateFilePreview("");

    if (
      privateFileInputRef.current
    ) {
      privateFileInputRef.current.value =
        "";
    }
  };

  // ====================================================
  // GROUP FILE SELECT
  // ====================================================

  const handleGroupFileSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setGroupMessageError(
        "File size cannot exceed 10 MB."
      );

      event.target.value = "";

      return;
    }

    setGroupMessageError("");

    if (groupFilePreview) {
      URL.revokeObjectURL(
        groupFilePreview
      );
    }

    setGroupFile(file);

    if (
      file.type.startsWith(
        "image/"
      )
    ) {
      setGroupFilePreview(
        URL.createObjectURL(file)
      );
    } else {
      setGroupFilePreview("");
    }
  };

  // ====================================================
  // REMOVE GROUP FILE
  // ====================================================

  const removeGroupFile = () => {
    if (groupFilePreview) {
      URL.revokeObjectURL(
        groupFilePreview
      );
    }

    setGroupFile(null);

    setGroupFilePreview("");

    if (
      groupFileInputRef.current
    ) {
      groupFileInputRef.current.value =
        "";
    }
  };

  // ====================================================
  // PRIVATE TYPING
  // ====================================================

  const stopPrivateTyping = () => {
    if (
      !selectedUser ||
      !selectedUser.id
    ) {
      return;
    }

    socket.emit(
      "private-typing",
      {
        receiverId:
          selectedUser.id,

        isTyping: false,
      }
    );

    if (
      privateTypingTimeoutRef.current
    ) {
      clearTimeout(
        privateTypingTimeoutRef.current
      );

      privateTypingTimeoutRef.current =
        null;
    }
  };

  const handlePrivateTypingChange = (
    event
  ) => {
    const value =
      event.target.value;

    setPrivateMessage(value);

    if (
      !selectedUser ||
      !selectedUser.id
    ) {
      return;
    }

    // Empty input = immediately stop typing.

    if (!value.trim()) {
      stopPrivateTyping();
      return;
    }

    // Tell receiver that current user
    // is typing.

    socket.emit(
      "private-typing",
      {
        receiverId:
          selectedUser.id,

        isTyping: true,
      }
    );

    // Reset previous timeout.

    if (
      privateTypingTimeoutRef.current
    ) {
      clearTimeout(
        privateTypingTimeoutRef.current
      );
    }

    // Automatically stop typing after
    // user pauses for 1.2 seconds.

    privateTypingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "private-typing",
          {
            receiverId:
              selectedUser.id,

            isTyping: false,
          }
        );

        privateTypingTimeoutRef.current =
          null;
      }, 1200);
  };

  // ====================================================
  // GROUP TYPING
  // ====================================================

  const stopGroupTyping = () => {
    if (
      !selectedGroup ||
      !selectedGroup.id
    ) {
      return;
    }

    socket.emit(
      "group-typing",
      {
        groupId:
          selectedGroup.id,

        userId:
          currentUserId,

        userName:
          currentUser.name,

        isTyping: false,
      }
    );

    if (
      groupTypingTimeoutRef.current
    ) {
      clearTimeout(
        groupTypingTimeoutRef.current
      );

      groupTypingTimeoutRef.current =
        null;
    }
  };

  const handleGroupTypingChange = (
    event
  ) => {
    const value =
      event.target.value;

    setGroupMessage(value);

    if (
      !selectedGroup ||
      !selectedGroup.id
    ) {
      return;
    }

    if (!value.trim()) {
      stopGroupTyping();
      return;
    }

  console.log(
  "SENDING GROUP TYPING TRUE"
);

socket.emit(
  "group-typing",
  {
    groupId:
      selectedGroup.id,

    userId:
      currentUserId,

    userName:
      currentUser.name,

    isTyping: true,
  }
);
    if (
      groupTypingTimeoutRef.current
    ) {
      clearTimeout(
        groupTypingTimeoutRef.current
      );
    }

    groupTypingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "group-typing",
          {
            groupId:
              selectedGroup.id,

            userId:
              currentUserId,

            userName:
              currentUser.name,

            isTyping: false,
          }
        );

        groupTypingTimeoutRef.current =
          null;
      }, 1200);
  };

  // ====================================================
  // SEND PRIVATE MESSAGE
  // ====================================================

  const sendPrivateMessage =
    async () => {
      const hasText =
        privateMessage
          .trim()
          .length > 0;

      const hasFile =
        privateFile !== null;

      if (
        !hasText &&
        !hasFile
      ) {
        return;
      }

      if (!selectedUser) {
        return;
      }

      if (!token) {
        setMessageError(
          "Authentication token not found."
        );

        return;
      }

      // Stop typing immediately when
      // Send is clicked.

      stopPrivateTyping();

      try {
        setSendingMessage(true);

        setMessageError("");

        const formData =
          new FormData();

        formData.append(
          "receiverId",
          selectedUser.id
        );

        if (hasText) {
          formData.append(
            "message",
            privateMessage.trim()
          );
        }

        if (hasFile) {
          formData.append(
            "file",
            privateFile
          );
        }

        const response = await fetch(
          `${API_URL}/api/messages`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              formData,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to send message"
          );
        }

        const savedMessage =
          data.data;

        // ==================================================
        // REAL-TIME PRIVATE MESSAGE
        // ==================================================

        socket.emit(
          "private-message",
          {
            receiverId:
              selectedUser.id,

            message:
              savedMessage,
          }
        );

        const newMessage = {
          id:
            savedMessage._id,

          sender: "me",

          text:
            savedMessage.message ||
            "",

          messageType:
            savedMessage.messageType ||
            "text",

          fileUrl:
            savedMessage.fileUrl ||
            "",

          fileName:
            savedMessage.fileName ||
            "",

          fileType:
            savedMessage.fileType ||
            "",

          fileSize:
            savedMessage.fileSize ||
            0,

          time:
            formatTime(
              savedMessage.createdAt
            ),

          isRead:
            savedMessage.isRead,
        };

        setPrivateMessages(
          (previousMessages) => {
            const exists =
              previousMessages.some(
                (message) =>
                  message.id ===
                  newMessage.id
              );

            if (exists) {
              return previousMessages;
            }

            return [
              ...previousMessages,
              newMessage,
            ];
          }
        );

        setContacts(
          (previousContacts) =>
            previousContacts.map(
              (person) =>
                person.id ===
                selectedUser.id
                  ? {
                      ...person,

                      lastMessage:
                        getMessagePreview(
                          savedMessage
                        ),

                      time:
                        getCurrentTime(),
                    }
                  : person
            )
        );

        setPrivateMessage("");

        removePrivateFile();
      } catch (error) {
        console.error(
          "Send Message Error:",
          error
        );

        setMessageError(
          error.message ||
            "Unable to send message"
        );
      } finally {
        setSendingMessage(false);
      }
    };

  // ====================================================
  // SEND GROUP MESSAGE
  // ====================================================

 // ====================================================
// ADD GROUP MEMBER
// ====================================================

const handleAddGroupMember =
  async (person) => {
    if (
      !selectedGroup?.id ||
      !person?.id
    ) {
      return;
    }

    if (!token) {
      setAddMemberError(
        "Authentication token not found."
      );
      return;
    }

    try {
      setAddingMember(true);
      setAddMemberError("");
      setAddMemberSuccess("");

      const response = await fetch(
        `${API_URL}/api/groups/${selectedGroup.id}/members`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId: person.id,
          }),
        }
      );

     const data =
  await response.json();

if (!response.ok) {
  throw new Error(
    data.message ||
      "Unable to add member"
  );
}

const updatedGroup =
  data.group;
      // Update selected group member count
      setSelectedGroup(
        (previousGroup) => ({
          ...previousGroup,

          memberCount:
            updatedGroup.members
              ?.length || 0,

          members:
            updatedGroup.members ||
            previousGroup.members,
        })
      );

      // Update group in sidebar
      setGroups(
        (previousGroups) =>
          previousGroups.map(
            (group) =>
              String(group.id) ===
              String(selectedGroup.id)
                ? {
                    ...group,

                    memberCount:
                      updatedGroup
                        .members
                        ?.length || 0,

                    members:
                      updatedGroup
                        .members ||
                      group.members,
                  }
                : group
          )
      );

      setAddMemberSuccess(
        `${person.name} added successfully`
      );

      //setShowAddMember(false);

    } catch (error) {
      console.error(
        "Add Group Member Error:",
        error
      );

      setAddMemberError(
        error.message ||
          "Unable to add member"
      );
    } finally {
      setAddingMember(false);
    }
  };
   const sendGroupMessage =
    async () => {
      const hasText =
        groupMessage
          .trim()
          .length > 0;

      const hasFile =
        groupFile !== null;

      if (
        !hasText &&
        !hasFile
      ) {
        return;
      }

      if (!selectedGroup) {
        setGroupMessageError(
          "Select a group first."
        );

        return;
      }

      if (!token) {
        setGroupMessageError(
          "Authentication token not found."
        );

        return;
      }

      // Stop group typing immediately
      // when Send is clicked.

      stopGroupTyping();

      try {
        setSendingGroupMessage(
          true
        );

        setGroupMessageError("");

        const formData =
          new FormData();

        if (hasText) {
          formData.append(
            "message",
            groupMessage.trim()
          );
        }

        if (hasFile) {
          formData.append(
            "file",
            groupFile
          );
        }

        

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to send group message"
          );
        }

        const savedMessage =
          data.data;

        // ==================================================
        // REAL-TIME GROUP MESSAGE
        // ==================================================

        socket.emit(
          "group-message",
          {
            groupId:
              selectedGroup.id,

            message:
              savedMessage,
          }
        );

        const senderId =
          typeof savedMessage.sender ===
          "object"
            ? savedMessage.sender._id
            : savedMessage.sender;

        const senderName =
          typeof savedMessage.sender ===
          "object"
            ? savedMessage.sender.name
            : currentUser.name;

        const newMessage = {
          id:
            savedMessage._id,

          sender:
            senderName,

          senderId,

          type: "me",

          text:
            savedMessage.message ||
            "",

          messageType:
            savedMessage.messageType ||
            "text",

          fileUrl:
            savedMessage.fileUrl ||
            "",

          fileName:
            savedMessage.fileName ||
            "",

          fileType:
            savedMessage.fileType ||
            "",

          fileSize:
            savedMessage.fileSize ||
            0,

          time:
            formatTime(
              savedMessage.createdAt
            ),
        };

        setGroupMessages(
          (previousMessages) => {
            const exists =
              previousMessages.some(
                (message) =>
                  message.id ===
                  newMessage.id
              );

            if (exists) {
              return previousMessages;
            }

            return [
              ...previousMessages,
              newMessage,
            ];
          }
        );
setGroups(
  (previousGroups) =>
    previousGroups.map(
      (group) => {
        if (
          String(group.id) !==
           String(selectedGroup.id)
        ) {
          return group;
        }

       const isGroupOpen = true;

        return {
          ...group,

          lastMessage:
            getMessagePreview(
              savedMessage
            ),

          time:
            savedMessage.createdAt
              ? formatTime(
                  savedMessage.createdAt
                )
              : getCurrentTime(),

          unread:
            isGroupOpen
              ? 0
              : (group.unread || 0) + 1,
        };
      }
    )
);

        setGroupMessage("");

        removeGroupFile();
      } catch (error) {
        console.error(
          "Send Group Message Error:",
          error
        );

        setGroupMessageError(
          error.message ||
            "Unable to send group message"
        );
      } finally {
        setSendingGroupMessage(
          false
        );
      }
    };

  // ====================================================
  // KEYBOARD
  // ====================================================

  const handlePrivateKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !sendingMessage
    ) {
      sendPrivateMessage();
    }
  };

  const handleGroupKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !sendingGroupMessage
    ) {
      sendGroupMessage();
    }
  };

  // ====================================================
  // PRIVATE TYPING TEXT
  // ====================================================

  const privateTypingText = (() => {
    if (
      !privateTypingUser ||
      !selectedUser
    ) {
      return "";
    }

    if (
      privateTypingUser.userId !==
      selectedUser.id
    ) {
      return "";
    }

    return `${selectedUser.name} is typing...`;
  })();

  // ====================================================
  // GROUP TYPING TEXT
  // ====================================================

 const groupTypingText = (() => {
  if (!selectedGroup?.id) {
    return "";
  }

  const typingUsers =
    groupTypingUsers[
      String(selectedGroup.id)
    ] || {};

  const names =
    Object.values(
      typingUsers
    );

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return `${names[0]} is typing...`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing...`;
  }

  return `${names[0]}, ${names[1]} and ${
    names.length - 2
  } others are typing...`;
})();
  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    stopPrivateTyping();

    stopGroupTyping();

    if (socket.connected) {
      socket.disconnect();
    }

    localStorage.removeItem(
      "secureconnect_token"
    );

    localStorage.removeItem(
      "secureconnect_user"
    );

    navigate("/");
  };

  // ====================================================
  // MESSAGE FILE CONTENT
  // ====================================================

  const renderFileContent = (
    message,
    textClass
  ) => (
    <>
      {/* IMAGE */}

      {message.messageType ===
        "image" &&
        message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
            }}
          >
            <img
              src={message.fileUrl}
              alt={
                message.fileName ||
                "SecureConnect upload"
              }
              style={{
                width: "100%",

                maxWidth:
                  "260px",

                maxHeight:
                  "260px",

                objectFit:
                  "cover",

                borderRadius:
                  "10px",

                marginBottom:
                  message.text
                    ? "8px"
                    : "0",

                cursor:
                  "pointer",
              }}
            />
          </a>
        )}

      {/* FILE */}

      {message.messageType ===
        "file" &&
        message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: "8px",

              padding: "10px",

              marginBottom:
                message.text
                  ? "8px"
                  : "0",

              borderRadius:
                "8px",

              background:
                "rgba(255,255,255,0.12)",

              color: "inherit",

              textDecoration:
                "none",

              wordBreak:
                "break-word",
            }}
          >
            <FaFileAlt />

            <span>
              {message.fileName ||
                "Open file"}
            </span>
          </a>
        )}

      {/* TEXT */}

      {message.text && (
        <div className={textClass}>
          {message.text}
        </div>
      )}
    </>
  );
    // ====================================================
  // UI
  // ====================================================

  return (
    <div className="dashboard">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="header">

        <div className="logo">

          <FaShieldAlt
            className="logo-icon"
          />

          <h2>
            SecureConnect
          </h2>

        </div>

        <div className="header-right">

          <FaSearch
            className="header-icon"
          />

          <FaBell
            className="header-icon"
          />

         <FaCog
  className="header-icon"
/>

<FaSignOutAlt
  className="header-icon"
  title="Logout"
  onClick={handleLogout}
  style={{
    cursor: "pointer",
  }}
/>

          <div className="profile">

            <FaUserCircle
              className="profile-icon"
            />

            <span>
              {currentUser.name}
            </span>

          </div>

        </div>

      </header>

      {/* ==================================================
          DASHBOARD CONTENT
      ================================================== */}

      <div className="dashboard-content">

        {/* ==================================================
            CONTACT LIST
        ================================================== */}

        <div className="contacts">

          <h2>
            Contacts
          </h2>

          <input
            type="text"
            placeholder="Search contacts..."
            className="search-box"
            value={contactSearch}
            onChange={(event) =>
              setContactSearch(
                event.target.value
              )
            }
          />

          {contactsLoading && (
            <p>
              Loading contacts...
            </p>
          )}

          {!contactsLoading &&
            contactsError && (
              <p>
                {contactsError}
              </p>
            )}

          {!contactsLoading &&
            !contactsError &&
            filteredContacts.length ===
              0 && (
              <p>
                No contacts found.
              </p>
            )}

          {!contactsLoading &&
            !contactsError &&
            filteredContacts.map(
              (person) => (

                <div
                  key={person.id}
                  className={`contact-card ${
                    selectedUser?.id ===
                    person.id
                      ? "active"
                      : ""
                  }`}
                 onClick={() => {

  // Stop typing to old user
  // before switching contact.

  if (
    selectedUser &&
    selectedUser.id !==
      person.id
  ) {
    stopPrivateTyping();
  }

  // ==============================================
  // SELECT CONTACT
  // ==============================================

  setSelectedUser(
    person
  );

  // ==============================================
  // CLEAR PRIVATE UNREAD COUNT
  // ==============================================

  setPrivateUnreadCounts(
    (previousCounts) => ({
      ...previousCounts,

      [person.id]: 0,
    })
  );

  removePrivateFile();

  setMessageError("");

  setPrivateTypingUser(
    null
  );

}}
                >

                  <div
                    className={`avatar ${person.status}`}
                  >
                    {person.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="contact-info">

                    <div className="contact-name-row">

                      <h3>
                        {person.name}
                      </h3>

                      {person.time && (
                        <span className="contact-time">
                          {person.time}
                        </span>
                      )}

                    </div>

                    <div className="contact-preview-row">

  <p>
    {person.lastMessage}
  </p>

  {privateUnreadCounts[
    person.id
  ] > 0 && (
    <span className="unread-badge">
      {privateUnreadCounts[
        person.id
      ]}
    </span>
  )}

</div>

                  </div>

                </div>

              )
            )}

        </div>

        {/* ==================================================
            PRIVATE CHAT
        ================================================== */}

        <div className="private-chat">

          {selectedUser ? (
            <>

              {/* ============================================
                  PRIVATE CHAT HEADER
              ============================================ */}

              <div className="chat-header">

                <div className="chat-user">

  <div
    className={`avatar ${
      onlineUsers.includes(
        String(selectedUser.id)
      )
        ? "online"
        : "offline"
    }`}
  >
    {selectedUser.name
      .charAt(0)
      .toUpperCase()}
  </div>

  <div>

    <h3>
      {selectedUser.name}
    </h3>

    <p>
  {onlineUsers.includes(
    String(selectedUser.id)
  )
    ? "online"
    : "offline"}
</p>

                    {/* ======================================
                        PRIVATE TYPING INDICATOR
                    ====================================== */}

                    {privateTypingText && (

                      <div
                        style={{
                          fontSize:
                            "12px",

                          marginTop:
                            "2px",

                          fontStyle:
                            "italic",

                          opacity:
                            "0.85",
                        }}
                      >
                        {privateTypingText}
                      </div>

                    )}

                  </div>

                </div>

              </div>

              {/* ============================================
                  PRIVATE MESSAGES
              ============================================ */}

              <div className="chat-body">

                {messagesLoading && (
                  <p>
                    Loading messages...
                  </p>
                )}

                {!messagesLoading &&
                  messageError && (
                    <p
                      style={{
                        color:
                          "#ff6b6b",
                      }}
                    >
                      {messageError}
                    </p>
                  )}

                {!messagesLoading &&
                  !messageError &&
                  privateMessages.length ===
                    0 && (
                    <p>
                      No messages yet.
                      Start the conversation.
                    </p>
                  )}

                {!messagesLoading &&
                  privateMessages.map(
                    (message) => (

                      <div
                        key={message.id}
                        className={`message ${
                          message.sender ===
                          "me"
                            ? "sent"
                            : "received"
                        }`}
                      >

                        {renderFileContent(
                          message,
                          "message-text"
                        )}

                        <div className="message-meta">

                          <span>
                            {message.time}
                          </span>

                          {message.sender ===
                            "me" && (
                            <span className="message-tick">

                              {message.isRead
                                ? "✓✓"
                                : "✓"}

                            </span>
                          )}

                        </div>

                      </div>

                    )
                  )}

              </div>

              {/* ============================================
                  PRIVATE FILE PREVIEW
              ============================================ */}

              {privateFile && (

                <div
                  style={{
                    margin:
                      "8px 12px",

                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      "rgba(255,255,255,0.08)",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "10px",
                  }}
                >

                  {privateFilePreview ? (

                    <img
                      src={
                        privateFilePreview
                      }
                      alt="Preview"
                      style={{
                        width:
                          "70px",

                        height:
                          "70px",

                        objectFit:
                          "cover",

                        borderRadius:
                          "8px",
                      }}
                    />

                  ) : (

                    <FaFileAlt
                      style={{
                        fontSize:
                          "28px",
                      }}
                    />

                  )}

                  <div
                    style={{
                      overflow:
                        "hidden",

                      flex:
                        1,
                    }}
                  >

                    <div
                      style={{
                        overflow:
                          "hidden",

                        textOverflow:
                          "ellipsis",

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {privateFile.name}
                    </div>

                    <small>

                      {(
                        privateFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB

                    </small>

                  </div>

                  <button
                    type="button"
                    onClick={
                      removePrivateFile
                    }
                    title="Remove file"
                    style={{
                      border:
                        "none",

                      background:
                        "transparent",

                      cursor:
                        "pointer",

                      fontSize:
                        "18px",
                    }}
                  >
                    <FaTimes />
                  </button>

                </div>

              )}

              {/* ============================================
                  PRIVATE INPUT
              ============================================ */}

              <div className="chat-input">

                {/* HIDDEN FILE INPUT */}

                <input
                  ref={
                    privateFileInputRef
                  }
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={
                    handlePrivateFileSelect
                  }
                  style={{
                    display:
                      "none",
                  }}
                />

                {/* ATTACH BUTTON */}

                <button
                  type="button"
                  title="Attach image or file"
                  disabled={
                    sendingMessage
                  }
                  onClick={() =>
                    privateFileInputRef
                      .current
                      ?.click()
                  }
                  style={{
                    minWidth:
                      "44px",

                    padding:
                      "10px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",
                  }}
                >
                  <FaPaperclip />
                </button>

                {/* MESSAGE INPUT */}

                <input
                  type="text"
                  placeholder={`Message ${selectedUser.name}...`}
                  value={
                    privateMessage
                  }
                  disabled={
                    sendingMessage
                  }

                  // IMPORTANT:
                  // Typing handler replaces normal
                  // setPrivateMessage onChange.

                  onChange={
                    handlePrivateTypingChange
                  }

                  onKeyDown={
                    handlePrivateKeyDown
                  }

                  onBlur={() => {
                    stopPrivateTyping();
                  }}
                />

                {/* SEND */}

                <button
                  onClick={
                    sendPrivateMessage
                  }
                  disabled={
                    sendingMessage ||
                    (
                      !privateMessage.trim() &&
                      !privateFile
                    )
                  }
                >

                  {sendingMessage
                    ? "Sending..."
                    : "Send"}

                </button>

              </div>

            </>
          ) : (

            <div className="chat-body">

              <p>
                Select a contact to
                start chatting.
              </p>

            </div>

          )}

        </div>

        {/* ==================================================
            GROUP LIST
        ================================================== */}

        <div className="group-list-panel">

          <div className="group-list-header">

            <h2>
              Groups
            </h2>

            <span>
              {groups.length}
            </span>

          </div>

          <input
            type="text"
            placeholder="Search groups..."
            className="group-search"
            value={groupSearch}
            onChange={(event) =>
              setGroupSearch(
                event.target.value
              )
            }
          />

          <div className="group-list">

            {groupsLoading && (
              <p>
                Loading groups...
              </p>
            )}

            {!groupsLoading &&
              groupsError && (
                <p>
                  {groupsError}
                </p>
              )}

            {!groupsLoading &&
              !groupsError &&
              filteredGroups.length ===
                0 && (
                <p>
                  No groups found.
                </p>
              )}

            {!groupsLoading &&
              !groupsError &&
              filteredGroups.map(
                (group) => (

                  <div
                    key={group.id}
                    className={`group-card ${
                      selectedGroup?.id ===
                      group.id
                        ? "group-active"
                        : ""
                    }`}
                    onClick={() => {

  // Stop typing in old group
  // before switching.

  if (
    selectedGroup &&
    selectedGroup.id !==
      group.id
  ) {
    stopGroupTyping();
  }

  setSelectedGroup(
    group
  );

  // ==============================================
  // CLEAR GROUP UNREAD COUNT
  // ==============================================

  setGroups(
    (previousGroups) =>
      previousGroups.map(
        (currentGroup) =>
          String(currentGroup.id) ===
          String(group.id)
            ? {
                ...currentGroup,
                unread: 0,
              }
            : currentGroup
      )
  );

  removeGroupFile();

  setGroupMessageError(
    ""
  );

}}
                  >

                    <div className="group-avatar">

                      {group.name
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="group-card-info">

                      <div className="group-name-row">

                        <h3>
                          {group.name}
                        </h3>

                        {group.time && (

                          <span className="group-time">
                            {group.time}
                          </span>

                        )}

                      </div>

                      <div className="group-preview-row">

                        <p>
                          {group.lastMessage}
                        </p>

                        {group.unread >
                          0 && (

                          <span className="unread-badge">
                            {group.unread}
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

          </div>

        </div>

        {/* ==================================================
            GROUP CHAT
        ================================================== */}

        <div className="group-chat">

          {selectedGroup ? (
            <>

              {/* ============================================
                  GROUP HEADER
              ============================================ */}

              <div className="group-header">

                <div className="group-header-avatar">

                  {selectedGroup.name
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <h2>
                    {selectedGroup.name}
                  </h2>

                  <p>
                    {
                      selectedGroup.memberCount
                    }{" "}
                    Members
                  </p>
<button
  type="button"
  onClick={() => {
    setAddMemberError("");
    setAddMemberSuccess("");

    setShowAddMember(
      (previous) => !previous
    );
  }}
>
  + Add Member
</button>
{showAddMember && (
  <div
  style={{
    marginTop: "10px",
    padding: "10px",
    border: "1px solid #444",
    borderRadius: "8px",

    maxHeight: "220px",
    overflowY: "auto",

    minWidth: "220px",

    background: "#111827",
    position: "absolute",
    zIndex: 1000,
  }}
  >
    <p
      style={{
        marginBottom: "8px",
        fontWeight: "bold",
      }}
    >
      Select User
    </p>

   {contacts.map((person) => {
  const isAlreadyMember =
    selectedGroup?.members?.some(
      (member) =>
        String(
          member?._id ||
          member?.id ||
          member
        ) === String(person.id)
    );

  return (
    <div
      key={person.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: "10px",
        marginBottom: "6px",
      }}
    >
      <span>
        {person.name}
      </span>

      {isAlreadyMember ? (
        <span
          style={{
            fontSize: "12px",
            opacity: "0.7",
          }}
        >
          Already Member
        </span>
      ) : (
        <button
          type="button"
          disabled={addingMember}
          onClick={() =>
            handleAddGroupMember(
              person
            )
          }
        >
          {addingMember
            ? "Adding..."
            : "Add"}
        </button>
      )}
    </div>
  );
})}

    {addMemberError && (
      <p
        style={{
          color: "#ff6b6b",
          fontSize: "12px",
        }}
      >
        {addMemberError}
      </p>
    )}
  </div>
)}
{addMemberSuccess && (
  <p
    style={{
      color: "#22c55e",
      fontSize: "12px",
      marginTop: "5px",
    }}
  >
    {addMemberSuccess}
  </p>
)}
                  {/* ======================================
                      GROUP TYPING INDICATOR
                  ====================================== */}

                  {groupTypingText && (

                    <div
                      style={{
                        fontSize:
                          "12px",

                        marginTop:
                          "2px",

                        fontStyle:
                          "italic",

                        opacity:
                          "0.85",
                      }}
                    >
                      {groupTypingText}
                    </div>

                  )}

                </div>

              </div>

              {/* ============================================
                  GROUP MESSAGES
              ============================================ */}

              <div className="group-body">

                {groupMessagesLoading && (

                  <p>
                    Loading group messages...
                  </p>

                )}

                {!groupMessagesLoading &&
                  groupMessageError && (

                    <p
                      style={{
                        color:
                          "#ff6b6b",
                      }}
                    >
                      {groupMessageError}
                    </p>

                  )}

                {!groupMessagesLoading &&
                  !groupMessageError &&
                  groupMessages.length ===
                    0 && (

                    <p>
                      No group messages yet.
                      Start the conversation.
                    </p>

                  )}

                {!groupMessagesLoading &&
                  groupMessages.map(
                    (message) => (

                      <div
                        key={message.id}
                        className={`group-message ${
                          message.type ===
                          "me"
                            ? "group-sent"
                            : "group-received"
                        }`}
                      >

                        {/* SENDER NAME */}

                        {message.type !==
                          "me" && (

                          <div className="group-sender">
                            {message.sender}
                          </div>

                        )}

                        {/* IMAGE / FILE / TEXT */}

                        {renderFileContent(
                          message,
                          "group-message-text"
                        )}

                        {/* META */}

                        <div className="group-message-meta">

                          <span>
                            {message.time}
                          </span>

                          {message.type ===
                            "me" && (

                            <span className="message-tick">
                              ✓✓
                            </span>

                          )}

                        </div>

                      </div>

                    )
                  )}

              </div>

              {/* ============================================
                  GROUP FILE PREVIEW
              ============================================ */}

              {groupFile && (

                <div
                  style={{
                    margin:
                      "8px 12px",

                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      "rgba(255,255,255,0.08)",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "10px",
                  }}
                >

                  {groupFilePreview ? (

                    <img
                      src={
                        groupFilePreview
                      }
                      alt="Group Preview"
                      style={{
                        width:
                          "70px",

                        height:
                          "70px",

                        objectFit:
                          "cover",

                        borderRadius:
                          "8px",
                      }}
                    />

                  ) : (

                    <FaFileAlt
                      style={{
                        fontSize:
                          "28px",
                      }}
                    />

                  )}

                  <div
                    style={{
                      overflow:
                        "hidden",

                      flex:
                        1,
                    }}
                  >

                    <div
                      style={{
                        overflow:
                          "hidden",

                        textOverflow:
                          "ellipsis",

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {groupFile.name}
                    </div>

                    <small>

                      {(
                        groupFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB

                    </small>

                  </div>

                  <button
                    type="button"
                    onClick={
                      removeGroupFile
                    }
                    title="Remove group file"
                    style={{
                      border:
                        "none",

                      background:
                        "transparent",

                      cursor:
                        "pointer",

                      fontSize:
                        "18px",
                    }}
                  >
                    <FaTimes />
                  </button>

                </div>

              )}

              {/* ============================================
                  GROUP INPUT
              ============================================ */}

              <div className="group-input">

                {/* HIDDEN GROUP FILE INPUT */}

                <input
                  ref={
                    groupFileInputRef
                  }
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={
                    handleGroupFileSelect
                  }
                  style={{
                    display:
                      "none",
                  }}
                />

                {/* ATTACH */}

                <button
                  type="button"
                  title="Attach image or file"
                  disabled={
                    sendingGroupMessage
                  }
                  onClick={() =>
                    groupFileInputRef
                      .current
                      ?.click()
                  }
                  style={{
                    minWidth:
                      "44px",

                    padding:
                      "10px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",
                  }}
                >
                  <FaPaperclip />
                </button>

                {/* GROUP TEXT INPUT */}

                <input
                  type="text"
                  placeholder={`Message ${selectedGroup.name}...`}
                  value={
                    groupMessage
                  }
                  disabled={
                    sendingGroupMessage
                  }

                  // IMPORTANT:
                  // Group typing handler.

                  onChange={
                    handleGroupTypingChange
                  }

                  onKeyDown={
                    handleGroupKeyDown
                  }

                  onBlur={() => {
                    stopGroupTyping();
                  }}
                />

                {/* SEND */}

                <button
                  onClick={
                    sendGroupMessage
                  }
                  disabled={
                    sendingGroupMessage ||
                    (
                      !groupMessage.trim() &&
                      !groupFile
                    )
                  }
                >

                  {sendingGroupMessage
                    ? "Sending..."
                    : "Send"}

                </button>

              </div>

            </>
          ) : (

            <div className="group-body">

              {groupsLoading ? (

                <p>
                  Loading groups...
                </p>

              ) : (

                <p>
                  Select a group to
                  start group chatting.
                </p>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

// ======================================================
// EXPORT
// ======================================================

export default Dashboard;