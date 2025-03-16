import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: "student",
    // Common fields
    regNo: "",
    program: "",
    phoneNumber: "",
    // Alumni specific fields
    graduationYear: "",
    currentJobTitle: "",
    companyName: "",
    industry: "",
    workExperience: "",
    location: "",
    linkedInProfile: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    
    // Validate user type specific required fields
    if (userType === "student" && !formData.regNo) return toast.error("Registration number is required");
    if (userType === "alumni" && !formData.graduationYear) return toast.error("Graduation year is required");
    if (!formData.program) return toast.error("Program is required");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup({...formData, userType});
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({...formData, userType: type});
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="tabs tabs-boxed w-full flex">
            <button 
              className={`tab flex-1 ${userType === "student" ? "tab-active" : ""}`}
              onClick={() => handleUserTypeChange("student")}
            >
              Student
            </button>
            <button 
              className={`tab flex-1 ${userType === "alumni" ? "tab-active" : ""}`}
              onClick={() => handleUserTypeChange("alumni")}
            >
              Alumni
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Program Dropdown (common for both) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Degree / Program</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              >
                <option value="">Select Program</option>
                {degreePrograms.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number (optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone Number (optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="size-5 text-base-content/40" />
                </div>
                <input
                  type="tel"
                  className="input input-bordered w-full pl-10"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Student specific fields */}
            {userType === "student" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Registration Number</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Registration Number"
                  value={formData.regNo}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                />
              </div>
            )}

            {/* Alumni specific fields */}
            {userType === "alumni" && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Graduation Year</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 14 }, (_, i) => 2011 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Current Job Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Job Title"
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
                    placeholder="Company"
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
                    placeholder="Years of experience"
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
                    placeholder="e.g., New York, USA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">LinkedIn Profile (Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedInProfile}
                    onChange={(e) => setFormData({ ...formData, linkedInProfile: e.target.value })}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;