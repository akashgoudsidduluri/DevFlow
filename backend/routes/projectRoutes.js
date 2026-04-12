import express from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    verifyInvitation,
    getProjectInvitations,
    removeMember,
    getPublicProjects
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, createProject)
    .get(protect, getProjects);

router.get("/public", protect, getPublicProjects);

router.route("/:id")
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

router.route("/:id/members")
    .post(protect, addMember);

router.route("/:id/members/:memberId")
    .delete(protect, removeMember);

router.route("/:id/invitations")
    .get(protect, getProjectInvitations);

router.route("/invitations/verify")
    .post(protect, verifyInvitation);

export default router;
