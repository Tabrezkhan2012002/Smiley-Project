import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Image,
  Smile,
  ArrowLeft,
  MessageCircle,
  Paperclip,
  CheckCheck,
} from "lucide-react";

import { socket } from "./socket";

function Chat() {
  // Users from MongoDB
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");

  // Selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Socket connection
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const messagesEndRef = useRef(null);

  // =====================================
  // 1. SOCKET CONNECTION
  // =====================================

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected:", socket.id);
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.log("Connection error:", error.message);
      setSocketConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      // Keep shared socket connected.
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/testuser/all-users",
          {
            withCredentials: true,
          },
        );

        if (data.success) {
          setUsers(data.users);
        }
        console.log(users);
      } catch (error) {
        console.error(
          "Fetch users error:",
          error.response?.status,
          error.response?.data || error.message,
        );
        setUserError(error.response?.data?.message || "Unable to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =====================================
  // 4. SELECT USER
  // =====================================

  const handleSelectUser = (user) => {
    setSelectedUser(user);

    // Temporary empty messages.
    // Conversation loading will be implemented next.
    setMessages([]);

    console.log("Selected User ID:", user._id);
    console.log("Selected User:", user);
  };

  // =====================================
  // 5. SEND LOCAL MESSAGE
  // =====================================

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedUser) return;

    const newMessage = {
      _id: Date.now().toString(),
      sender: "me",
      text: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setMessage("");
  };

  // =====================================
  // 6. FILTER USERS
  // =====================================

  const filteredUsers = users.filter((user) =>
    `${user.username} ${user.fullName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // =====================================
  // 7. UI
  // =====================================

  return (
    <div className="h-screen bg-[#f5f6fa] flex items-center justify-center md:p-5">
      <div className="w-full h-full md:h-[90vh] max-w-7xl bg-white md:rounded-2xl shadow-xl overflow-hidden flex border border-gray-200">
        {/* ================================= */}
        {/* SIDEBAR */}
        {/* ================================= */}

        <div
          className={`w-full md:w-[360px] border-r border-gray-200 flex flex-col ${
            selectedUser ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}

          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

                <p className="text-xs text-gray-500 mt-1">
                  Connect with your friends
                </p>
              </div>

              <MessageCircle className="text-indigo-600" size={26} />
            </div>

            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Online status */}

          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              CONNECTION STATUS
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <span className="text-xs text-gray-500">
                {socketConnected
                  ? "Connected to Smiley"
                  : "Connecting to server..."}
              </span>
            </div>
          </div>

          {/* Users */}

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-500">
                PEOPLE ON SMILEY
              </p>
            </div>

            {loadingUsers ? (
              <div className="text-center py-10 text-gray-400">
                Loading users...
              </div>
            ) : userError ? (
              <div className="text-center py-10 text-red-500 text-sm">
                {userError}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full px-5 py-4 flex items-center gap-3 text-left transition ${
                    selectedUser?._id === user._id
                      ? "bg-indigo-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        user.profilePicture || "https://via.placeholder.com/150"
                      }
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {user.username}
                    </h3>

                    <p className="text-xs text-gray-500 truncate mt-1">
                      {user.fullName}
                    </p>
                  </div>

                  <span className="text-xs text-indigo-500">Message</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ================================= */}
        {/* CHAT WINDOW */}
        {/* ================================= */}

        <div
          className={`flex-1 flex flex-col min-w-0 ${
            selectedUser ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedUser ? (
            <>
              {/* Chat Header */}

              <div className="h-[76px] px-4 md:px-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden text-gray-500"
                  >
                    <ArrowLeft />
                  </button>

                  <img
                    src={
                      selectedUser.profilePicture ||
                      "https://via.placeholder.com/150"
                    }
                    alt={selectedUser.username}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">
                      {selectedUser.username}
                    </h2>

                    <p className="text-xs text-gray-500">
                      {selectedUser.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-500">
                  <button title="Audio call">
                    <Phone size={19} />
                  </button>

                  <button title="Video call">
                    <Video size={20} />
                  </button>

                  <button title="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}

              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 bg-[#fafbff]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <img
                      src={
                        selectedUser.profilePicture ||
                        "https://via.placeholder.com/150"
                      }
                      alt={selectedUser.username}
                      className="w-24 h-24 rounded-full object-cover mb-4"
                    />

                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedUser.username}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Start your conversation with {selectedUser.fullName}
                    </p>

                    <p className="text-xs text-indigo-500 mt-4">
                      Welcome to Smiley 💜
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[80%] md:max-w-[65%]">
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-6 break-words ${
                            msg.sender === "me"
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {msg.sender === "me" && (
                            <CheckCheck size={13} className="text-indigo-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}

              <form
                onSubmit={handleSendMessage}
                className="p-4 md:px-6 border-t border-gray-100 bg-white"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <Paperclip size={21} />
                  </button>

                  <button
                    type="button"
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <Image size={21} />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message..."
                      className="w-full bg-gray-100 rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <button
                      type="button"
                      className="absolute right-4 top-3 text-gray-400 hover:text-indigo-600"
                    >
                      <Smile size={20} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-full transition"
                  >
                    <Send size={19} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty State */

            <div className="flex-1 flex flex-col items-center justify-center bg-[#fafbff]">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-5">
                <MessageCircle size={38} className="text-indigo-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Your Messages
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Select someone to start chatting.
              </p>

              <p className="text-xs text-indigo-500 mt-5">
                Welcome to Smiley 💜
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
