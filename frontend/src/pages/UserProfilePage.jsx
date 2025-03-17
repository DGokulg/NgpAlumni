import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios.js";
import { Building, Calendar, Link as LinkIcon, Mail, MapPin, Phone, User, Users, Briefcase, GraduationCap, MessageSquare, ArrowLeft } from "lucide-react";

const UserProfilePage = () => {
  const { userId } = useParams();
  const { authUser, onlineUsers } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In UserProfilePage.jsx, modify the fetchUserProfile function
const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, fetch all users
      const res = await axiosInstance.get("/messages/users");
      
      // Find the specific user by ID
      if (Array.isArray(res.data)) {
        const user = res.data.find(u => u._id === userId);
        if (user) {
          setUserProfile(user);
        } else {
          setError("User not found");
        }
      } else {
        console.error("API returned non-array data:", res.data);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.response?.data?.message || "Failed to fetch user profile");
    } finally {
      setIsLoading(false);
    }
  };
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Check if user is online
  const isUserOnline = () => {
    return userProfile && onlineUsers.includes(userProfile._id);
  };

  return (
    <div className="h-full pt-20 pb-12">
      <div className="max-w-3xl mx-auto p-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error">{error}</p>
            <Link to="/network" className="btn btn-outline mt-4">
              <ArrowLeft className="size-4 mr-2" />
              Back to Network
            </Link>
          </div>
        ) : userProfile ? (
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="flex justify-between items-center">
              <div className="text-left flex items-center gap-3">
                <Link to="/network" className="btn btn-circle btn-ghost">
                  <ArrowLeft className="size-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold">{userProfile.fullName}'s Profile</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${userProfile.userType === 'alumni' ? 'badge-primary' : 'badge-secondary'}`}>
                      {userProfile.userType === 'alumni' ? 'Alumni' : 'Student'}
                    </span>
                    {isUserOnline() && (
                      <span className="badge badge-success badge-sm">Online</span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/messages/${userProfile._id}`}
                className="btn btn-primary"
              >
                <MessageSquare className="size-4 mr-2" />
                Message
              </Link>
            </div>

            {/* Profile image */}
            <div className="flex flex-col items-center gap-4">
              {userProfile.profilePic ? (
                <img
                  src={userProfile.profilePic}
                  alt={userProfile.fullName}
                  className="size-32 rounded-full object-cover border-4"
                />
              ) : (
                <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center border-4">
                  <User className="size-12 text-primary" />
                </div>
              )}
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-sm text-zinc-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.fullName}</p>
                </div>

                {userProfile.email && (
                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.email}</p>
                  </div>
                )}

                {userProfile.phoneNumber && (
                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                      {userProfile.phoneNumber}
                    </p>
                  </div>
                )}

                {userProfile.program && (
                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Program
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.program}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student specific section */}
            {userProfile.userType === "student" && userProfile.regNo && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Student Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Registration Number
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.regNo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alumni specific section */}
            {userProfile.userType === "alumni" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Alumni Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.graduationYear && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Graduation Year
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.graduationYear}</p>
                    </div>
                  )}

                  {userProfile.currentJobTitle && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Current Job Title
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.currentJobTitle}</p>
                    </div>
                  )}

                  {userProfile.companyName && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company Name
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.companyName}</p>
                    </div>
                  )}

                  {userProfile.industry && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Industry
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.industry}</p>
                    </div>
                  )}

                  {userProfile.workExperience && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Work Experience
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                        {userProfile.workExperience} years
                      </p>
                    </div>
                  )}

                  {userProfile.location && (
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{userProfile.location}</p>
                    </div>
                  )}

                  {userProfile.linkedInProfile && (
                    <div className="space-y-1.5 col-span-2">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        LinkedIn Profile
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                        <a 
                          href={userProfile.linkedInProfile} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {userProfile.linkedInProfile}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="mt-6 bg-base-200 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                {userProfile.createdAt && (
                  <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                    <span>Member Since</span>
                    <span>{userProfile.createdAt.split("T")[0]}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Account Type</span>
                  <span className="capitalize">{userProfile.userType || "User"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">
                    {isUserOnline() ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p>User not found</p>
            <Link to="/network" className="btn btn-outline mt-4">
              <ArrowLeft className="size-4 mr-2" />
              Back to Network
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;