import React, { useState, useEffect } from "react";
import { Users, Briefcase, Filter, X, Plus, MapPin, Building } from "lucide-react";
import axios from "axios";

const JobDashboardPage = () => {
  // Important: Initialize jobs as an empty array
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for form and filters
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: "",
    company: "",
    location: "",
    salary: "",
    status: "active"
  });
  const [filterStatus, setFilterStatus] = useState("all");

  // Sample data to use if API call fails
  const sampleJobs = [
    {
      _id: "1",
      jobTitle: "Frontend Developer",
      company: "TechCorp India",
      location: "Bangalore",
      salary: "₹12,00,000 - ₹16,00,000",
      status: "active",
      postedByInfo: "Amit Sharma, 2018 Batch"
    },
    {
      _id: "2",
      jobTitle: "UX/UI Designer",
      company: "Creative Solutions",
      location: "Remote",
      salary: "₹8,00,000 - ₹12,00,000",
      status: "active",
      postedByInfo: "Priya Patel, 2015 Batch"
    },
    {
      _id: "3",
      jobTitle: "Backend Engineer",
      company: "DataSystems Ltd.",
      location: "Hyderabad",
      salary: "₹14,00,000 - ₹18,00,000",
      status: "filled",
      postedByInfo: "Rahul Mehta, 2016 Batch"
    }
  ];

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/jobs${filterStatus !== "all" ? `?status=${filterStatus}` : ""}`);
        
        // Make sure we're setting an array
        setJobs(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        // Use sample data instead of showing error in development
        setJobs(sampleJobs.filter(job => filterStatus === "all" || job.status === filterStatus));
        setError("Using sample data. API connection failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filterStatus]);

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({
      ...newJob,
      [name]: value
    });
  };

  // Add new job
  const addJob = (e) => {
    e.preventDefault();
    
    try {
      // In development, just add to local state with fake ID
      const job = {
        ...newJob,
        _id: Date.now().toString(),
        postedByInfo: "You, 2023 Batch" 
      };
      
      setJobs([job, ...jobs]);
      
      // Reset form
      setNewJob({
        jobTitle: "",
        company: "",
        location: "",
        salary: "",
        status: "active"
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  // Delete job
  const deleteJob = (id) => {
    // No confirmation in this simplified version
    setJobs(jobs.filter(job => job._id !== id));
  };

  // Filter jobs for UI display
  const filteredJobs = Array.isArray(jobs) 
    ? (filterStatus === "all" ? jobs : jobs.filter(job => job.status === filterStatus))
    : [];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase className="size-8 text-primary" />
              Alumni Job Portal
            </h1>
            <p className="text-neutral-600 mt-2">
              Exclusive job opportunities shared by our alumni network
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary gap-2"
          >
            {showForm ? (
              <>
                <X className="size-5" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-5" />
                Post New Job
              </>
            )}
          </button>
        </div>
        
        {/* Add Job Form */}
        {showForm && (
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Share a Job Opportunity
            </h2>
            <form onSubmit={addJob}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newJob.jobTitle}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={newJob.company}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newJob.location}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary (₹)</label>
                  <input
                    type="text"
                    name="salary"
                    value={newJob.salary}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="₹5,00,000 - ₹8,00,000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={newJob.status}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="active">Active</option>
                    <option value="filled">Filled</option>
                    <option value="onhold">On Hold</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Share Job
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-base-200 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="size-5 text-neutral-500" />
            <span className="font-medium">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterStatus('all')}
            >
              All Jobs
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'active' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'filled' ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => setFilterStatus('filled')}
            >
              Filled
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'onhold' ? 'btn-error' : 'btn-outline'}`}
              onClick={() => setFilterStatus('onhold')}
            >
              On Hold
            </button>
          </div>
        </div>
        
        {/* Job count indicator */}
        <div className="text-sm text-neutral-500 mb-4">
          Showing {Array.isArray(filteredJobs) ? filteredJobs.length : 0} job opportunities
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Job Listings */}
        {!loading && Array.isArray(filteredJobs) && (
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job._id} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-5">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-900">{job.jobTitle}</h3>
                        <div className="flex items-center gap-2 text-neutral-600 mt-1">
                          <Building className="size-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 mt-1">
                          <MapPin className="size-4" />
                          {job.location}
                        </div>
                        <p className="font-medium mt-2 text-neutral-700">{job.salary}</p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`badge ${
                            job.status === 'active' ? 'badge-success' : 
                            job.status === 'filled' ? 'badge-warning' : 
                            'badge-error'
                          }`}>
                            {job.status === 'active' ? 'Active' : 
                            job.status === 'filled' ? 'Position Filled' : 'On Hold'}
                          </span>
                          <span className="text-sm text-neutral-500">
                            Posted by: {job.postedByInfo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => deleteJob(job._id)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          <X className="size-4" />
                          Remove
                        </button>
                        <button className="btn btn-sm btn-primary">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100 shadow border border-base-200 text-center py-12">
                <div className="card-body">
                  <div className="flex flex-col items-center gap-3">
                    <Briefcase className="size-16 text-neutral-300" />
                    <h3 className="text-xl font-medium">No job listings found</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      There are no job opportunities matching your selected filter. Please try another filter or check back later.
                    </p>
                    {filterStatus !== "all" && (
                      <button 
                        onClick={() => setFilterStatus("all")}
                        className="btn btn-primary mt-2"
                      >
                        View All Jobs
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Call to action */}
        <div className="mt-12 card bg-primary/10 p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="bg-primary rounded-full p-3">
              <Users className="size-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Know about an open position?</h3>
              <p className="text-neutral-600">
                Help fellow alumni and students by sharing job opportunities from your network
              </p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary ml-auto"
            >
              Share a Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDashboardPage;