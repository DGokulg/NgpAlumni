// controllers/job.controller.js
import Job from "../models/job.model.js";
import User from "../models/user.model.js"; // Assuming you have a user model

export const createJob = async (req, res) => {
  try {
    const { jobTitle, company, location, salary, status } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Create job with reference to user who posted it
    const newJob = new Job({
      jobTitle,
      company,
      location,
      salary,
      status,
      postedBy: req.user._id,
      postedByInfo: `${user.fullName}, ${user.graduationYear} Batch`
    });
    
    await newJob.save();
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Error creating job:", error.message);
    res.status(500).json({ error: "Failed to create job" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTitle, company, location, salary, status } = req.body;
    
    // Find job and check if user is authorized to update it
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Check if this user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized to update this job" });
    }
    
    // Update and save
    job.jobTitle = jobTitle || job.jobTitle;
    job.company = company || job.company;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.status = status || job.status;
    
    await job.save();
    
    res.status(200).json(job);
  } catch (error) {
    console.error("Error updating job:", error.message);
    res.status(500).json({ error: "Failed to update job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find job and check if user is authorized to delete it
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Check if this user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized to delete this job" });
    }
    
    await Job.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
};