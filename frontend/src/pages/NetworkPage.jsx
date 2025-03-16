import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, Search, User } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";

const NetworkPage = () => {
  const { authUser, onlineUsers, socket } = useAuthStore();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Fetch all users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/messages/users");
        
        if (Array.isArray(res.data)) {
          setAllUsers(res.data);
          setFilteredUsers(res.data);
        } else {
          console.error("API returned non-array data:", res.data);
          setError("Invalid data format received from server");
          setAllUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) fetchUsers();
  }, [authUser]);

  // Listen for online users updates
  useEffect(() => {
    if (socket) {
      const handleOnlineUsers = (userIds) => {
        console.log("Received online users update:", userIds);
      };

      socket.on("getOnlineUsers", handleOnlineUsers);
      socket.emit("getOnlineUsers");

      return () => {
        socket.off("getOnlineUsers", handleOnlineUsers);
      };
    }
  }, [socket]);

  // Simple, direct search without debouncing
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Direct filtering without delay
    if (term.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const searchLower = term.toLowerCase();
      const results = allUsers.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
        (user.currentJobTitle && user.currentJobTitle.toLowerCase().includes(searchLower)) ||
        (user.program && user.program.toLowerCase().includes(searchLower)) ||
        (user.companyName && user.companyName.toLowerCase().includes(searchLower))
      );
      setFilteredUsers(results);
    }
  };

  // Check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredUsers(allUsers);
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-6">
      <h1 className="text-2xl font-bold mb-6">Network</h1>
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">
          {onlineUsers.length} users online
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by name, job title, or program..."
          className="input input-bordered pl-10 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-error">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {searchTerm ? `No users match "${searchTerm}"` : "No users found"}
          </p>
          {searchTerm && (
            <button 
              onClick={clearSearch} 
              className="btn btn-sm btn-outline mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user._id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-6 text-primary" />
                      </div>
                    )}
                    {isUserOnline(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-base-100"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {user.fullName}
                      {isUserOnline(user._id) && (
                        <span className="ml-2 badge badge-success badge-sm">Online</span>
                      )}
                    </h3>
                    {user.userType && (
                      <p className="text-sm text-muted-foreground capitalize mb-1">
                        {user.userType}
                        {user.program && ` • ${user.program}`}
                      </p>
                    )}
                    {user.currentJobTitle && (
                      <p className="text-sm">
                        {user.currentJobTitle}
                        {user.companyName && ` at ${user.companyName}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="card-actions justify-end mt-2">
                  <Link
                    to={`/messages/${user._id}`}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <MessageSquare className="size-4" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkPage;