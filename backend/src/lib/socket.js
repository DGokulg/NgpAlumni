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