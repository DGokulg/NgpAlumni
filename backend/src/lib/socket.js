import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Add this route to check if server is running
app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "*"], // Include all your frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io/" // Default path, but specified explicitly
});

// Used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    // Store user connection
    userSocketMap[userId] = socket.id;
    console.log("User connected:", userId, "Socket ID:", socket.id);
    console.log("Current online users:", Object.keys(userSocketMap));
    
    // Broadcast online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
  
  // Handle direct requests for online users
  socket.on("getOnlineUsers", () => {
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  
  // IMPROVED: Better message handling
  socket.on("message", (data) => {
    console.log("Message received:", data);
    
    // Ensure message has all required fields
    if (!data || !data.receiverId) {
      console.error("Invalid message format:", data);
      return;
    }
    
    // Ensure message format is consistent
    const formattedMessage = {
      ...data,
      text: data.text || data.message || "",
      message: data.message || data.text || ""
    };
    
    // Log the formatted message
    console.log("Formatted message:", formattedMessage);
    
    // Forward the message to intended recipient
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    if (receiverSocketId) {
      console.log("Forwarding message to receiver", data.receiverId, "socket:", receiverSocketId);
      io.to(receiverSocketId).emit("newMessage", formattedMessage);
    } else {
      console.log("Receiver not online:", data.receiverId);
    }
    
    // IMPORTANT: Also confirm back to sender that message was processed
    // This helps with real-time updates even if the receiver is offline
    socket.emit("messageSent", {
      success: true,
      message: formattedMessage
    });
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    // Find and remove the disconnected user
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
        console.log("User disconnected:", key);
        break;
      }
    }
    
    // Broadcast updated online users list
    console.log("Updated online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Make sure the server is listening on the correct port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

export { io, app, server };