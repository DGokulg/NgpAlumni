import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const formattedData = {
        ...data,
        // Convert numeric fields to numbers
        workExperience: data.workExperience ? Number(data.workExperience) : undefined,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined
      };

      // Enhanced logging for debugging
      console.log("[SIGNUP] Sending data:", formattedData);
      
      const res = await axiosInstance.post("/auth/signup", formattedData);
      console.log("[SIGNUP] Received response:", res.data);
      
      // Merge response data with existing auth state
      set(state => ({ 
        authUser: { ...state.authUser, ...res.data } 
      }));
      
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("[SIGNUP] Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login response data:", res.data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formattedData = {
        ...data,
        workExperience: data.workExperience ? Number(data.workExperience) : undefined,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined
      };

      // If there's no profilePic in the data, don't send it
      // This prevents overwriting the existing profilePic when updating other fields
      if (!formattedData.profilePic) {
        delete formattedData.profilePic;
      }

      console.log("[PROFILE] Sending update:", formattedData);
      const res = await axiosInstance.put("/auth/update-profile", formattedData);
      
      // Deep merge with existing user data
      set(state => ({
        authUser: { ...state.authUser, ...res.data }
      }));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("[PROFILE] Update error:", error.response?.data);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Utility function to merge profile updates with existing user data
  updateUserField: (fieldData) => {
    set(state => ({
      authUser: state.authUser ? { ...state.authUser, ...fieldData } : null
    }));
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));