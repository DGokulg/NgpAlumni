// models/job.model.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["active", "filled", "onhold"],
      default: "active" 
    },
    postedBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    postedByInfo: { type: String },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;