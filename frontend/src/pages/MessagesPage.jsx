import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";



const MessagesPage = () => {
    const { userId } = useParams();
    const { users, getUsers, setSelectedUser, selectedUser } = useChatStore();
  
    // Fetch all users when component mounts
    useEffect(() => {
      getUsers();
    }, [getUsers]);
  
    // Set selected user based on URL param
    useEffect(() => {
      console.log("URL userId param:", userId, "type:", typeof userId);
      console.log("Available users:", users.map(u => ({id: u._id, type: typeof u._id})));
      console.log("Currently selected user:", selectedUser);
      
      if (userId && users.length > 0) {
        // Try both exact and string comparison
        const user = users.find(user => user._id === userId || user._id.toString() === userId);
        console.log("Found user:", user);
        if (user) {
          setSelectedUser(user);
        } else {
          console.error("No matching user found for ID:", userId);
        }
      }
    }, [userId, users, setSelectedUser]);
  
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