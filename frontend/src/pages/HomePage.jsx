import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Shield, MessageSquare, Zap, Briefcase, Calendar, Award, ChevronRight } from "lucide-react";

const HomePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left content area - text and buttons */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="w-24 h-1 bg-primary rounded-full mb-2"></div>
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 leading-tight">
              Stay Connected, <span className="text-primary">Stay Inspired!</span>
            </h1>
            
            <p className="text-lg text-neutral-600 leading-relaxed">
              Welcome to our interactive alumni-student community! This is your space to connect, network, and share experiences with fellow students and alumni. Whether you're seeking career advice, mentorship, or just looking to reconnect with old friends, our platform makes communication seamless and engaging.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-6">
              <Link 
                to={authUser ? "/network" : "/signup"} 
                className="btn btn-primary btn-lg gap-2 px-8 shadow-lg hover:shadow-xl transition-all"
              >
                <Users className="size-5" />
                {authUser ? "Explore Profiles" : "Get Started"}
              </Link>
              
              <Link 
                to="/messages" 
                className="btn bg-white text-neutral-800 border-neutral-200 btn-lg hover:bg-neutral-100 gap-2 px-8 shadow-sm hover:shadow-md transition-all"
              >
                <MessageSquare className="size-5" />
                Chat
              </Link>
            </div>
            
            <div className="mt-10 p-6 bg-white rounded-xl shadow-md border border-neutral-100 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Join the Community</h3>
                  <p className="text-neutral-600">Connect with thousands of professionals in your field</p>
                </div>
                <ChevronRight className="ml-auto size-5 text-neutral-400" />
              </div>
            </div>
          </div>
          
          {/* Right content area - image with stats overlay */}
          <div className="w-full md:w-1/2 relative mt-12 md:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-xl h-96 md:h-[500px]">
              <img 
                src="/Dr-NGP.jpg" 
                alt="Alumni gathering event" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Stats overlay */}
            <div className="absolute -bottom-6 left-4 right-4 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div className="text-center px-4">
                  <p className="text-3xl font-bold text-primary">More</p>
                  <p className="text-neutral-600">Alumni</p>
                </div>
                <div className="h-12 w-px bg-neutral-200"></div>
                <div className="text-center px-4">
                  <p className="text-3xl font-bold text-primary">24/7</p>
                  <p className="text-neutral-600">Support</p>
                </div>
                <div className="h-12 w-px bg-neutral-200"></div>
                <div className="text-center px-4">
                  <p className="text-3xl font-bold text-primary">More</p>
                  <p className="text-neutral-600">Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white py-24 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">What Our Platform Offers</h2>
            <p className="text-neutral-600 mt-4 max-w-2xl mx-auto">Build meaningful relationships, exchange insights, and grow together as part of a vibrant, ever-evolving network.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-base-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-neutral-100">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Award className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mentorship Programs</h3>
              <p className="text-neutral-600">Connect with experienced professionals who can guide your career journey with personalized advice.</p>
            </div>
            
            <div className="bg-base-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-neutral-100">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Calendar className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Events</h3>
              <p className="text-neutral-600">Participate in networking events, workshops, and reunions designed to expand your professional connections.</p>
            </div>
            
            <div className="bg-base-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-neutral-100">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Job Opportunities</h3>
              <p className="text-neutral-600">Discover career opportunities shared exclusively by our alumni network and industry partners.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">Ready to join our community?</h3>
            <p className="text-neutral-600 mt-2">Start building your professional network today.</p>
          </div>
          <Link to={authUser ? "/network" : "/signup"} className="btn btn-primary gap-2 px-8 shadow-md">
            {authUser ? "Explore Now" : "Join Now"}
            <Zap className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;