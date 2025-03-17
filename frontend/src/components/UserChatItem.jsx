import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const UserChatItem = ({ user }) => {
  const navigate = useNavigate();
  const { selectedUser, setSelectedUser, getUnreadCount } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(user._id);
  const isSelected = selectedUser?._id === user._id;
  const unreadCount = getUnreadCount(user._id);

  const handleSelectUser = () => {
    setSelectedUser(user);
    navigate(`/messages/${user._id}`);
  };

  return (
    <div
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 relative ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onClick={handleSelectUser}
    >
      <div className="relative mr-3">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-500 truncate">{user.username}</p>
      </div>
      
      {unreadCount > 0 && (
        <div className="bg-blue-500 text-white rounded-full h-6 min-w-6 flex items-center justify-center px-1 text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default UserChatItem;