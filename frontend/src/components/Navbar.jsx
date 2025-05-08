import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Briefcase, Calendar, LogOut, MessageSquare, Settings, User, Users } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const isAdmin = authUser?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-base-100000 border-b border-base-200 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section with PNG logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1">
                <img 
                  src="/image.png" 
                  alt="NGP Alumni Logo" 
                  className="h-12 w-auto" 
                />
              </div>
              <span className="text-xl font-bold">NGP Alumni</span>
            </Link>
          </div>
            
          {/* Right section */}
          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link to="/network" className="btn btn-ghost btn-sm">
                  <Users className="size-5" />
                  <span className="hidden md:inline">Network</span>
                </Link>
                
                <Link to="/messages" className="btn btn-ghost btn-sm">
                  <MessageSquare className="size-5" />
                  <span className="hidden md:inline">Messages</span>
                </Link>
                
                <Link to="/jobs" className="btn btn-ghost btn-sm">
                  <Briefcase className="size-5" />
                  <span className="hidden md:inline">Jobs</span>
                </Link>
                
                <Link to="/events" className="btn btn-ghost btn-sm">
                  <Calendar className="size-5" />
                  <span className="hidden md:inline">Events</span>
                </Link>
                
                <Link to="/settings" className="btn btn-ghost btn-sm">
                  <Settings className="size-5" />
                  <span className="hidden md:inline">Settings</span>
                </Link>
                
                <Link to="/profile" className="btn btn-ghost btn-sm">
                  <User className="size-5" />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                
                <button onClick={logout} className="btn btn-ghost btn-sm">
                  <LogOut className="size-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}
            
            {!authUser && (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                <Link to="/admin-login" className="btn btn-secondary btn-sm">Admin Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;