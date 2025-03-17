import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  notificationsEnabled: true, // Default to enabled
  notificationSound: null,
  unreadMessages: {}, // Track unread messages by userId

  // Initialize notification sound
  initNotificationSound: () => {
    if (!get().notificationSound) {
      set({ notificationSound: new Audio("/notification.mp3") });
    }
  },

  // Toggle notifications on/off
  toggleNotifications: () => {
    set(state => ({ notificationsEnabled: !state.notificationsEnabled }));
    const status = get().notificationsEnabled;
    toast.success(`Notifications ${status ? 'enabled' : 'disabled'}`);
  },

  // Play notification sound if enabled
  playNotification: () => {
    const { notificationsEnabled, notificationSound } = get();
    if (notificationsEnabled && notificationSound) {
      notificationSound.play().catch(err => console.error("Error playing notification:", err));
    }
  },

  // Request browser notification permission
  requestNotificationPermission: () => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  },

  // Check if the message should trigger a notification
  shouldNotify: (message) => {
    const { selectedUser, notificationsEnabled } = get();
    const authUser = useAuthStore.getState().authUser;
    
    // Only notify if:
    // 1. Notifications are enabled
    // 2. The message is from someone other than the current user
    // 3. Either no chat is selected OR the message is not from the currently selected user
    return (
      notificationsEnabled && 
      message.senderId !== authUser?._id &&
      (!selectedUser || message.senderId !== selectedUser?._id)
    );
  },

  // Mark messages as read for a specific user
  markMessagesAsRead: (userId) => {
    set(state => {
      const unreadMessages = { ...state.unreadMessages };
      if (unreadMessages[userId]) {
        unreadMessages[userId] = 0;
      }
      return { unreadMessages };
    });
  },

  // Get unread message count for a specific user
  getUnreadCount: (userId) => {
    return get().unreadMessages[userId] || 0;
  },

  // Get total unread message count
  getTotalUnreadCount: () => {
    const { unreadMessages } = get();
    return Object.values(unreadMessages).reduce((total, count) => total + count, 0);
  },

  // Add a new message and handle notifications
  addMessage: (message) => {
    const { messages, shouldNotify, playNotification } = get();
    const authUser = useAuthStore.getState().authUser;
    
    // Only add if it's not already in the messages array
    const messageExists = messages.some(msg => msg._id === message._id);
    
    if (!messageExists) {
      set({ messages: [...messages, message] });
      
      // Handle notifications for messages from other users
      if (message.senderId !== authUser?._id) {
        // Update unread message count
        set(state => {
          const unreadMessages = { ...state.unreadMessages };
          const userId = message.senderId;
          unreadMessages[userId] = (unreadMessages[userId] || 0) + 1;
          return { unreadMessages };
        });
        
        // Check if notification should be shown
        if (shouldNotify(message)) {
          // Find the sender's name
          const sender = get().users.find(user => user._id === message.senderId);
          const senderName = sender?.name || "Someone";
          
          // Toast notification
          toast.success(`New message from ${senderName}`, {
            duration: 4000,
            position: "top-right",
            icon: "📨",
          });
          
          // Play sound notification
          playNotification();
          
          // Browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`New message from ${senderName}`, {
              body: message.message?.substring(0, 60) || "New message",
              icon: "/app-icon.png" 
            });
          }
        }
      }
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      
      // Initialize notification sound
      get().initNotificationSound();
      
      // Request notification permission
      get().requestNotificationPermission();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      // Format messages to ensure they have consistent properties
      const formattedMessages = res.data.map(msg => ({
        ...msg,
        text: msg.text || msg.message || "",
        message: msg.message || msg.text || ""
      }));
      
      set({ messages: formattedMessages });
      
      // Mark messages as read when fetching
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    
    if (!selectedUser || !selectedUser._id) {
      toast.error("No user selected");
      return;
    }
    
    try {
      // The server expects a "message" field - let's match this in our payload
      const payload = {
        message: messageData.text || messageData.message || "",
        ...(messageData.image && { image: messageData.image })
      };
      
      console.log(`Sending message to ${selectedUser._id}:`, payload);
      const res = await axiosInstance.post(`/messages/${selectedUser._id}`, payload);
      console.log("Response:", res.data);
      
      // Format the message based on the server response
      const formattedMessage = {
        ...res.data,
        // Make sure both properties exist for compatibility
        text: res.data.text || res.data.message || payload.message,
        message: res.data.message || res.data.text || payload.message
      };
      
      console.log("Formatted message added to state:", formattedMessage);
      set({ messages: [...messages, formattedMessage] });
      return formattedMessage;
    } catch (error) {
      console.error("Error details:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(error.response.data.error || error.response.data.message || "Failed to send message");
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.error("Error:", error.message);
        toast.error("Error setting up request");
      }
      return null;
    }
  },

 subscribeToMessages: () => {
  const { selectedUser } = get();
  const socket = useAuthStore.getState().socket;
  
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  // Unsubscribe first to prevent duplicate listeners
  socket.off("newMessage");

  socket.on("newMessage", (newMessage) => {
    console.log("Received new message via socket:", newMessage);
    
    // Format the message consistently
    const formattedMessage = {
      ...newMessage,
      // Ensure both text and message properties exist
      text: newMessage.text || newMessage.message || "",
      message: newMessage.message || newMessage.text || ""
    };

    console.log("Formatted message for state:", formattedMessage);
    
    // Add the message to our state
    get().addMessage(formattedMessage);
    
    // If currently viewing this conversation, mark as read
    if (newMessage.senderId === selectedUser?._id && selectedUser) {
      get().markMessagesAsRead(selectedUser._id);
    }
  });
},
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    
    // When selecting a user, mark their messages as read
    if (selectedUser) {
      get().markMessagesAsRead(selectedUser._id);
    }
  },
}));