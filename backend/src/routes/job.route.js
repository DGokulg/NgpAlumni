// routes/job.route.js
import express from "express";
import { createJob, getJobs, updateJob, deleteJob } from "../controllers/job.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createJob);
router.get("/", getJobs);
router.put("/:id", protectRoute, updateJob);
router.delete("/:id", protectRoute, deleteJob);

export default router;