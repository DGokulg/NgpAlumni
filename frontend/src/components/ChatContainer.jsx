import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
      
      // Subscribe to new messages
      subscribeToMessages();
      
      // Cleanup subscription when component unmounts or user changes
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    // Scroll to the latest message whenever messages change
    if (messageEndRef.current && messages && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Toggle debug mode with key combination (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Helper function to compare MongoDB ObjectIds safely
  const isSameId = (id1, id2) => {
    // Convert potential ObjectIds to strings for comparison
    const str1 = id1?.toString ? id1.toString() : id1;
    const str2 = id2?.toString ? id2.toString() : id2;
    return str1 === str2;
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {debugMode && (
          <div className="bg-yellow-100 p-2 rounded text-xs">
            <p>Debug mode: {messages.length} messages</p>
            <p>Auth user ID: {authUser._id?.toString()}</p>
            <p>Selected user ID: {selectedUser._id?.toString()}</p>
          </div>
        )}
        
        {messages.map((message, index) => {
          const isCurrentUser = isSameId(message.senderId, authUser._id);
          
          return (
            <div
              key={message._id || index}
              className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isCurrentUser
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                
                {message.text ? (
                  <p>{message.text}</p>
                ) : (
                  debugMode && <p className="text-red-500 text-xs">[No text content]</p>
                )}
                
                {debugMode && (
                  <div className="text-xs mt-1 text-gray-500">
                    <p>ID: {message._id?.toString()}</p>
                    <p>Sender: {message.senderId?.toString()}</p>
                    <p>IsMine: {isCurrentUser ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <div ref={messages.length === 0 ? messageEndRef : null} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;