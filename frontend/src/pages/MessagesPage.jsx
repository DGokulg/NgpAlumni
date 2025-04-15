import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { 
    users, 
    getUsers, 
    getMessages, 
    setSelectedUser, 
    selectedUser,
    loading 
  } = useChatStore();

  // Fetch all users when component mounts
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Set selected user based on URL param and load messages
  useEffect(() => {
    if (userId && users.length > 0) {
      // Find the user either by direct ID match or string comparison
      const user = users.find(user => 
        user._id === userId || 
        (typeof user._id === 'object' && user._id.toString() === userId) ||
        (typeof user._id === 'string' && user._id === userId.toString())
      );
      
      if (user) {
        console.log("Setting selected user:", user.username || user.fullName);
        setSelectedUser(user);
        getMessages(user._id);
      } else {
        console.error("No matching user found for ID:", userId);
        // Redirect to the first user if available, or clear selection
        if (users.length > 0) {
          navigate(`/messages/${users[0]._id}`);
        } else {
          setSelectedUser(null);
        }
      }
    } else if (users.length > 0 && !userId) {
      // If no userId in URL but users exist, redirect to first user
      navigate(`/messages/${users[0]._id}`);
    }
  }, [userId, users, setSelectedUser, getMessages, navigate]);

  // Add a persistence helper for keeping selectedUser across refreshes
  useEffect(() => {
    if (selectedUser && !loading) {
      // Could optionally save to localStorage for additional persistence
      localStorage.setItem('lastSelectedUserId', selectedUser._id);
    }
  }, [selectedUser, loading]);

  // On initial load, try to restore from localStorage if no userId in URL
  useEffect(() => {
    if (!userId && users.length > 0) {
      const lastSelectedUserId = localStorage.getItem('lastSelectedUserId');
      if (lastSelectedUserId) {
        navigate(`/messages/${lastSelectedUserId}`);
      } else {
        navigate(`/messages/${users[0]._id}`);
      }
    }
  }, [userId, users, navigate]);

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r overflow-y-auto">
          <Sidebar />
        </div>

        {/* Chat container */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;