import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      unreadMessages: {}, // Track unread messages by userId
      persistenceVersion: 1, // Add a version to help with migrations

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

      // Add a new message with improved duplicate checking
      addMessage: (message) => {
        const { messages } = get();
        const authUser = useAuthStore.getState().authUser;
        
        // Ensure message has consistent properties
        const formattedMessage = {
          ...message,
          text: message.text || message.message || "",
          message: message.message || message.text || "",
          // Generate a stable ID if none exists
          _id: message._id || `msg_${message.senderId}_${new Date(message.createdAt).getTime()}`
        };
        
        // Check for duplicates with more reliable criteria
        const isDuplicate = messages.some(msg => 
          (msg._id && formattedMessage._id && msg._id === formattedMessage._id) ||
          (msg.senderId === formattedMessage.senderId && 
           msg.text === formattedMessage.text && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(formattedMessage.createdAt).getTime()) < 2000)
        );
        
        if (!isDuplicate) {
          console.log("Adding new message to state:", formattedMessage);
          
          // Update messages and force persistence
          set(state => ({ 
            messages: [...state.messages, formattedMessage] 
          }));
          
          // Manually persist to localStorage
          const currentState = get();
          const persistedData = {
            state: {
              messages: currentState.messages,
              users: currentState.users,
              selectedUser: currentState.selectedUser,
              unreadMessages: currentState.unreadMessages,
              persistenceVersion: currentState.persistenceVersion
            },
            version: 1
          };
          
          try {
            localStorage.setItem("chat-storage", JSON.stringify(persistedData));
            console.log("Persisted state after adding message, message count:", currentState.messages.length);
          } catch (err) {
            console.error("Error persisting state:", err);
          }
          
          // Handle unread messages count for messages from other users
          if (formattedMessage.senderId !== authUser?._id) {
            // Update unread message count
            set(state => {
              const unreadMessages = { ...state.unreadMessages };
              const userId = formattedMessage.senderId;
              unreadMessages[userId] = (unreadMessages[userId] || 0) + 1;
              return { unreadMessages };
            });
          }
        } else {
          console.log("Message already exists, not adding duplicate");
        }
      },

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
          
          // Force persistence
          const currentState = get();
          try {
            localStorage.setItem("chat-storage", JSON.stringify({
              state: {
                messages: currentState.messages,
                users: res.data,
                selectedUser: currentState.selectedUser,
                unreadMessages: currentState.unreadMessages,
                persistenceVersion: currentState.persistenceVersion
              },
              version: 1
            }));
            console.log("Persisted users, count:", res.data.length);
          } catch (err) {
            console.error("Error persisting state:", err);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) {
          console.error("getMessages called without a userId");
          return;
        }
        
        set({ isMessagesLoading: true });
        
        try {
          console.log("Fetching messages for user:", userId);
          const res = await axiosInstance.get(`/messages/${userId}`);
          
          // Format messages to ensure they have consistent properties
          const formattedMessages = res.data.map(msg => ({
            ...msg,
            _id: msg._id || `msg_${msg.senderId}_${new Date(msg.createdAt).getTime()}`,
            text: msg.text || msg.message || "",
            message: msg.message || msg.text || "",
            createdAt: msg.createdAt || new Date().toISOString()
          }));
          
          console.log(`Fetched ${formattedMessages.length} messages`);
          
          // Update state and force immediate persistence
          set({ messages: formattedMessages, isMessagesLoading: false });
          
          // Force persistence to localStorage
          const currentState = get();
          const persistedData = {
            state: {
              messages: formattedMessages,
              users: currentState.users,
              selectedUser: currentState.selectedUser,
              unreadMessages: currentState.unreadMessages,
              persistenceVersion: currentState.persistenceVersion
            },
            version: 1
          };
          
          try {
            localStorage.setItem("chat-storage", JSON.stringify(persistedData));
            console.log("Saved messages to localStorage, count:", formattedMessages.length);
          } catch (err) {
            console.error("Error persisting state:", err);
          }
          
          // Mark messages as read when fetching
          get().markMessagesAsRead(userId);
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error(error.response?.data?.message || "Failed to fetch messages");
          set({ isMessagesLoading: false });
        }
      },
      
      // Enhanced send message function
      sendMessage: async (messageData) => {
        const { selectedUser } = get();
        
        if (!selectedUser || !selectedUser._id) {
          toast.error("No user selected");
          return;
        }
        
        try {
          // Ensure message has receiverId
          const payload = {
            message: messageData.text || messageData.message || "",
            receiverId: selectedUser._id,
            ...(messageData.image && { image: messageData.image })
          };
          
          console.log(`Sending message to ${selectedUser._id}:`, payload);
          const res = await axiosInstance.post(`/messages/${selectedUser._id}`, payload);
          
          // Format the message consistently
          const formattedMessage = {
            ...res.data,
            _id: res.data._id || `msg_${res.data.senderId}_${new Date().getTime()}`,
            text: res.data.text || res.data.message || payload.message,
            message: res.data.message || res.data.text || payload.message,
            receiverId: selectedUser._id,
            createdAt: res.data.createdAt || new Date().toISOString()
          };
          
          // Add to state using our addMessage function for consistency
          get().addMessage(formattedMessage);
          
          // Emit via socket for real-time communication
          const socket = useAuthStore.getState().socket;
          if (socket && socket.connected) {
            socket.emit("message", formattedMessage);
          } else {
            console.warn("Socket not available or not connected");
          }
          
          return formattedMessage;
        } catch (error) {
          console.error("Error sending message:", error);
          toast.error(error.response?.data?.message || "Failed to send message");
          return null;
        }
      },

      // Socket subscription with improved reliability
      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        
        if (!socket) {
          console.error("Socket not initialized");
          return;
        }

        // Unsubscribe first to prevent duplicate listeners
        socket.off("newMessage");
        socket.off("messageSent");

        console.log("Setting up socket subscription for messages");
        
        socket.on("newMessage", (newMessage) => {
          console.log("Received new message via socket:", newMessage);
          
          if (!newMessage || (!newMessage.text && !newMessage.message)) {
            console.error("Received invalid message format:", newMessage);
            return;
          }
          
          // Format the message consistently
          const formattedMessage = {
            ...newMessage,
            _id: newMessage._id || `msg_${newMessage.senderId}_${new Date().getTime()}`,
            text: newMessage.text || newMessage.message || "",
            message: newMessage.message || newMessage.text || "",
            createdAt: newMessage.createdAt || new Date().toISOString()
          };
          
          // Add the message to our state
          get().addMessage(formattedMessage);
          
          // If currently viewing this conversation, mark as read
          const { selectedUser } = get();
          if (selectedUser && formattedMessage.senderId === selectedUser._id) {
            get().markMessagesAsRead(selectedUser._id);
          }
        });
        
        // Also listen for message confirmations
        socket.on("messageSent", (data) => {
          console.log("Message sent confirmation:", data);
          // You can handle any confirmation logic here if needed
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.off("newMessage");
          socket.off("messageSent");
          console.log("Unsubscribed from message events");
        }
      },

      setSelectedUser: (selectedUser) => {
        console.log("Setting selected user:", selectedUser);
        set({ selectedUser });
        
        // When selecting a user, mark their messages as read
        if (selectedUser) {
          get().markMessagesAsRead(selectedUser._id);
        }
        
        // Also store in regular localStorage as a backup
        if (selectedUser && selectedUser._id) {
          localStorage.setItem('lastSelectedUserId', selectedUser._id);
        }
      },
      
      // Function to restore state from localStorage on component mount
      restoreState: () => {
        try {
          // Check if we have persisted state
          const storedData = localStorage.getItem("chat-storage");
          
          if (storedData) {
            const { state } = JSON.parse(storedData);
            console.log("Found persisted state:", state);
            
            // Only apply if we have data
            if (state) {
              if (state.messages && state.messages.length > 0) {
                console.log("Restoring messages from localStorage, count:", state.messages.length);
                set({ messages: state.messages });
              }
              
              if (state.selectedUser) {
                console.log("Restoring selected user from localStorage:", state.selectedUser.fullName || state.selectedUser.username);
                set({ selectedUser: state.selectedUser });
              }
            }
          }
        } catch (err) {
          console.error("Error restoring state from localStorage:", err);
        }
      }
    }),
    {
      name: "chat-storage", // Name for the storage
      storage: createJSONStorage(() => localStorage), // Explicitly use localStorage
      partialize: (state) => ({
        // Only persist these fields
        messages: state.messages,
        users: state.users,
        selectedUser: state.selectedUser,
        unreadMessages: state.unreadMessages,
        persistenceVersion: state.persistenceVersion
      })
    }
  )
);

// Export a hook for checking persistence on component mount
export const useRestoreChatState = () => {
  useEffect(() => {
    // Try to restore state on component mount
    console.log("Attempting to restore chat state from localStorage");
    useChatStore.getState().restoreState();
    
    // Set up socket subscription
    const socket = useAuthStore.getState().socket;
    if (socket) {
      useChatStore.getState().subscribeToMessages();
    }
    
    return () => {
      useChatStore.getState().unsubscribeFromMessages();
    };
  }, []);
};