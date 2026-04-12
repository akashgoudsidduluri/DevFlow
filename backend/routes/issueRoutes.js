import express from "express";
import {
    createIssue,
    getIssuesByProject,
    updateIssue,
    deleteIssue,
    assignIssue,
    getAssignmentSuggestions
} from "../controllers/issueController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, createIssue);

router.route("/project/:projectId")
    .get(protect, getIssuesByProject);

router.get("/project/:projectId/suggestions", protect, getAssignmentSuggestions);

router.route("/:id")
    .put(protect, updateIssue)
    .delete(protect, deleteIssue);

router.put("/:id/assign", protect, assignIssue);

export default router;
