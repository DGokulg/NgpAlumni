import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Building, Calendar, Camera, Landmark, Link, Mail, MapPin, Phone, User, Users, Briefcase, GraduationCap } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    phoneNumber: authUser?.phoneNumber || "",
    // Student specific
    regNo: authUser?.regNo || "",
    // Alumni specific
    currentJobTitle: authUser?.currentJobTitle || "",
    companyName: authUser?.companyName || "",
    industry: authUser?.industry || "",
    workExperience: authUser?.workExperience || "",
    location: authUser?.location || "",
    linkedInProfile: authUser?.linkedInProfile || ""
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      // Handle profile picture upload separately from other form data
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Only update form data without including profile picture
    await updateProfile(formData);
    setIsEditing(false);
  };

  // Available degree programs
  const degreePrograms = [
    "Artificial Intelligence & Data Science",
    "Computer Science and Business Systems",
    "Biomedical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electrical and Electronics Engineering",
    "Electronics and Communications Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "Cyber Security",
    "Master of Business Administration(MBA)",
  ];

  // Industries for alumni
  const industries = [
    "Information Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Consulting",
    "Telecommunications",
    "Retail",
    "Media & Entertainment",
    "Others"
  ];

  return (
    <div className="h-full pt-20 pb-12">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-semibold">Profile</h1>
              <p className="mt-1">Your profile information</p>
            </div>
            {!isEditing && (
              <button 
                className="btn btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {isEditing ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone Number</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered w-full"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              {/* Student or Alumni specific fields */}
              {authUser?.userType === "student" ? (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Registration Number</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Current Job Title</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={formData.currentJobTitle}
                      onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Company Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Industry</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select Industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Work Experience (Years)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      min="0"
                      value={formData.workExperience}
                      onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Location (City, Country)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">LinkedIn Profile</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={formData.linkedInProfile}
                      onChange={(e) => setFormData({ ...formData, linkedInProfile: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 justify-end mt-6">
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // View mode (not editing) remains the same
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                      {authUser?.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Program
                    </div>
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.program || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Student specific section */}
              {authUser?.userType === "student" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Student Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Registration Number
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.regNo || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alumni specific section */}
              {authUser?.userType === "alumni" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Alumni Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Graduation Year
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.graduationYear || "Not provided"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Current Job Title
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.currentJobTitle || "Not provided"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company Name
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.companyName || "Not provided"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Landmark className="w-4 h-4" />
                        Industry
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.industry || "Not provided"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Work Experience
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                        {authUser?.workExperience ? `${authUser.workExperience} years` : "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.location || "Not provided"}</p>
                    </div>

                    {authUser?.linkedInProfile && (
                      <div className="space-y-1.5 col-span-2">
                        <div className="text-sm text-zinc-400 flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          LinkedIn Profile
                        </div>
                        <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                          <a 
                            href={authUser.linkedInProfile} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            {authUser.linkedInProfile}
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
                  <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                    <span>Member Since</span>
                    <span>{authUser?.createdAt?.split("T")[0]}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                    <span>Account Type</span>
                    <span className="capitalize">{authUser?.userType || "User"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Account Status</span>
                    <span className="text-green-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;