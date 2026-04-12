import express from "express";
const router = express.Router();
import { createDiscussion, getDiscussions } from "../controllers/discussionController.js";
import { protect } from "../middleware/authMiddleware.js";

router.route("/")
    .post(protect, createDiscussion);

router.route("/:projectId")
    .get(protect, getDiscussions);

export default router;
