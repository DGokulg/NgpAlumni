import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";

const HomePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main content area - this will be below the navbar but not overlapping */}
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left content area - text and buttons */}
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
            Stay Connected, Stay Inspired!
            </h1>
            
            <p className="text-lg text-neutral-600">
            Welcome to our interactive alumni-student community! This is your space to connect, network, and share experiences with fellow students and alumni. Whether you’re seeking career advice, mentorship, or just looking to reconnect with old friends, our platform makes communication seamless and engaging. Build meaningful relationships, exchange insights, and grow together as part of a vibrant, ever-evolving network. Start a conversation today and be a part of something bigger!
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to={authUser ? "/network" : "/signup"} 
                className="btn btn-primary btn-lg gap-2"
              >
                <Users className="size-5" />
                {authUser ? "Explore Profiles" : "Get Started"}
              </Link>
              
              <Link 
                to="/messages" 
                className="btn btn-outline btn-lg"
              >
                Chat
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-base-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Join the Community</h3>
                
                </div>
              </div>
            </div>
          </div>
          
          {/* Right content area - image */}
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-lg h-96 md:h-[500px]">
              <img 
                src="/api/placeholder/800/600" 
                alt="Alumni gathering event" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;