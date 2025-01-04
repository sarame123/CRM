import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import NoChatSelected from "./NoChatSelected";
import "./Messages.css";
import "font-awesome/css/font-awesome.min.css";
import { Users } from "lucide-react";

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(
    JSON.parse(localStorage.getItem("activeUser")) || null
  );
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null); 
  const chatWindowRef = useRef(null);


  const userId = localStorage.getItem("userId");
  const adminId = "109";
  // const activu = localStorage.getItem("activeUser");
  const role = localStorage.getItem("role");
  const isAdmin = localStorage.getItem("role") === "admin";

  const getUsers = async () => {
    if (isAdmin) {
      try {
        const response = await fetch(
          "http://localhost/backend/fetch_users.php"
        );
        const data = await response.json();
        const filterUser = data.filter((user) => user.id !== adminId);
        setUsers(filterUser);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };


  const fetchMessages = async (activeUserId) => {
    if (activeUserId) {
      try {
        const response = await fetch(
          `http://localhost/backend/Chat/get_messages.php?user_id=${activeUserId}`
        );
        const data = await response.json();
        // console.log("11");
        
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.message_id !== messageId)
      );
      const response = await fetch(`
        http://localhost/backend/Chat/delete_message.php?message_id=${messageId}`,
        { method: "DELETE" }
      );
  
      const data = await response.json();
  
      if (!data.success) {
        console.error("Failed to delete message:", data.message);
        fetchMessages(activeUser?.id);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Send  message

  
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      console.error("Message cannot be empty.");
      return;
    }

    const senderId = userId;
    const receiverId = isAdmin ? activeUser?.id : adminId;

    if (!senderId || !receiverId) {
      console.error("Sender or receiver ID is missing.");
      return;
    }

    const newMessageObject = {
      sender_id: senderId,
      receiver_id: receiverId,
      message: newMessage,
      created_at: new Date().toISOString(),
      message_id: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage("");
    scrollToBottom();

    try {
      const response = await fetch(
        "http://localhost/backend/Chat/send_message.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_id: senderId,
            receiver_id: receiverId,
            message: newMessage,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        console.log("Message sent successfully.");
        fetchMessages(activeUser?.id);
      } else {
        console.error("Failed to send message:", data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };


  const handleUserSelection = (user) => {

    setActiveUser(user);
    localStorage.setItem("activeUser", JSON.stringify(user));
    fetchMessages(user.id);
  };


  const clearActiveUser = () => {
    setActiveUser(null);
    localStorage.removeItem("activeUser");
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    scrollToBottom();
    getUsers();
    if (role === "user") {
      fetchMessages(userId);
    }
    if (activeUser) {
      fetchMessages(activeUser.id);
    }

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const handleBeforeUnload = () => {
      localStorage.clear();
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      // setActiveUser(activu);
      localStorage.setItem("activeUser", userId );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, activeUser]);


  const isNoChatSelected =
    !activeUser || !activeUser.id || activeUser.id === adminId;

  return (
    <div className="messages-container">
      {isAdmin && (
        <div className="message-list">
          <h3>Conversations</h3>
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className={`message-item ${
                  activeUser?.id === user.id ? "active" : ""
                }`}
                onClick={() => handleUserSelection(user)}
              >
                <i className="fa fa-user-circle user-avatar"></i>

                <div className="">
                  <h4>{user.name}</h4>
                  <p>User ID: {user.id}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-users">No users available</p>
          )}
        </div>
      )}

      <div className="chat-window">
        {isNoChatSelected && isAdmin ? (
          <NoChatSelected />
        ) : (
          <>
            <div className="chat-header">
              <h4>
              Chat with {activeUser?.name || "Admin"}
              </h4>
              <span>Today, {moment().format("MMM D")}</span>
            </div>
            <div className="chat-messages" ref={chatWindowRef}>
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isUserMessage =
                    msg.sender_id.toString() === userId.toString();
                  return (
                    <div
                      key={msg.message_id}
                      className={`message-bubble  ${
                        isUserMessage ? "message-right" : "message-left"
                      } ${msg.is_deleted ? "message-deleted" : ""}`}
                    >
                      <p >{msg.is_deleted ? "message deleted" : msg.message}</p>
                      {msg.file && (
                        <a
                          href={`http://localhost/uploads/${msg.file}`}
                          target="_blank"
                        >
                          Download Attachment
                        </a>
                      )}
                     <div className="delete-box d-flex justify-content-between align-items-center">
                     <span className="message-time ">
                        {moment(msg.created_at).format("MMM D, h:mm A")}
                      </span>
                      {!msg.is_deleted && isUserMessage && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteMessage(msg.message_id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                   
                      )}
                        </div>
                    </div>
                  );
                })
              ) : (
                <p>No messages yet</p>
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              {/* <input type="file" onChange={handleFileChange} /> */}
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;


 
