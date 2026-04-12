import Project from "../models/Project.js";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import { sendInvitationEmail } from "../utils/mailUtils.js";
import mongoose from "mongoose";
import crypto from "crypto";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
    try {
        const { name, description, deadline, projectType, emails, githubUrl } = req.body;

        const project = new Project({
            name,
            description,
            deadline,
            projectType: projectType || 'solo',
            githubUrl: githubUrl || "",
            owner: req.user._id,
            members: [req.user._id], // Owner is always the first member
        });

        const createdProject = await project.save();

        // Handle invitations for additional emails
        if (Array.isArray(emails) && emails.length > 0) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            
            for (const email of emails) {
                // Skip if it's the owner's email
                if (email === req.user.email) continue;

                const token = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                await Invitation.create({
                    email,
                    projectId: createdProject._id,
                    inviterId: req.user._id,
                    token,
                    expiresAt
                });

                const verificationLink = `${frontendUrl}/verify-invite/${token}`;
                await sendInvitationEmail(email, req.user.name, createdProject.name, verificationLink);
            }
        }

        res.status(201).json(createdProject);
    } catch (error) {
        res.status(400).json({ message: error.message || "Failed to create project" });
    }
};

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.aggregate([
            {
                $match: {
                    $or: [
                        { owner: mongoose.isValidObjectId(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null },
                        { members: mongoose.isValidObjectId(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'issues',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'issues'
                }
            },
            {
                $addFields: {
                    totalIssues: { $size: '$issues' },
                    completedIssues: {
                        $size: {
                            $filter: {
                                input: '$issues',
                                as: 'issue',
                                cond: { $eq: ['$$issue.status', 'Done'] }
                            }
                        }
                    },
                    highPriorityIssues: {
                        $size: {
                            $filter: {
                                input: '$issues',
                                as: 'issue',
                                cond: { 
                                    $and: [
                                        { $eq: ['$$issue.priority', 'high'] },
                                        { $ne: ['$$issue.status', 'Done'] }
                                    ]
                                }
                            }
                        }
                    },
                    overdueIssues: {
                        $size: {
                            $filter: {
                                input: '$issues',
                                as: 'issue',
                                cond: {
                                    $and: [
                                        { $ne: ['$$issue.status', 'Done'] },
                                        { $lt: ['$$issue.deadline', new Date()] },
                                        { $ne: ['$$issue.deadline', null] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    isAtRisk: {
                        $cond: {
                            if: { $eq: ['$totalIssues', 0] },
                            then: false,
                            else: { $gt: [{ $divide: ['$overdueIssues', '$totalIssues'] }, 0.5] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            { $unwind: '$owner' },
            {
                $project: {
                    'owner.password': 0,
                    'issues': 0
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        const project = await Project.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members", "name email");

        if (project) {
            // Validate that the user requesting the project has access to it (Safely)
            const isMember = project.members.some(member => member && member._id && member._id.equals(req.user._id));
            const isOwner = project.owner && project.owner._id && project.owner._id.equals(req.user._id);

            if (isMember || isOwner) {
                res.json(project);
            } else {
                res.status(403).json({ message: "Not authorized to access this project" });
            }
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            // Only the owner has permission to update the project
            if (!project.owner || !project.owner.equals(req.user._id)) {
                return res.status(403).json({ message: "Not authorized to update, owner only" });
            }

            project.name = name || project.name;
            project.description = description || project.description;

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            // Only the owner has permission to delete the project
            if (!project.owner || !project.owner.equals(req.user._id)) {
                return res.status(403).json({ message: "Not authorized to delete, owner only" });
            }

            await Project.deleteOne({ _id: project._id });
            res.json({ message: "Project removed" });
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Add member to project (Invite)
// @route   POST /api/projects/:id/members
// @access  Private
export const addMember = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized, owner only' });
        }

        if (req.user.email.toLowerCase() === email) {
            return res.status(400).json({ message: 'You are already a project member' });
        }

        const existingMember = await User.findOne({ email });
        if (existingMember && project.members.some((mId) => mId.toString() === existingMember._id.toString())) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        const existingInvitation = await Invitation.findOne({
            projectId: project._id,
            email
        });

        if (existingInvitation) {
            if (existingInvitation.status === 'pending') {
                return res.status(400).json({ message: 'This email already has a pending invitation' });
            }
            if (existingInvitation.status === 'accepted') {
                return res.status(400).json({ message: 'This email has already been invited and joined' });
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await Invitation.create({
            email,
            projectId: project._id,
            inviterId: req.user._id,
            token,
            expiresAt
        });

        const verificationLink = `${frontendUrl}/verify-invite/${token}`;
        await sendInvitationEmail(email, req.user.name, project.name, verificationLink);

        res.json({ message: 'Invitation protocol initiated. Email dispatched.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Verify invitation token and join project
// @route   POST /api/projects/invitations/verify
// @access  Private
export const verifyInvitation = async (req, res) => {
    try {
        const { token } = req.body;
        const invitation = await Invitation.findOne({ token });

        // Identify Idempotency: If invitation is missing but user is already a member
        // find the project via invitation or other means if needed.
        if (!invitation) {
            // Check if user is already a member of any project that might have sent an invite
            // Or more specifically, if they were invited but we can't find it now (deleted/archived)
            return res.status(404).json({ message: "Invalid or expired invitation token" });
        }

        // Check if invitation is already used
        if (invitation.status === 'accepted') {
             const project = await Project.findById(invitation.projectId);
             const isMember = project && project.members.some(id => id && id.toString() === req.user._id.toString());
             
             if (isMember) {
                return res.json({ message: "Successfully joined project", projectId: invitation.projectId });
             }
             return res.status(400).json({ message: "Invitation token already utilized" });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ message: "Invitation has expired" });
        }

        // Ensure the logged in user's email matches the invitation email (case-insensitive)
        if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            return res.status(403).json({ message: "This invitation was sent to a different email address" });
        }

        // ATOMIC OPERATION: Add to Set prevents duplicates at DB level
        const updatedProject = await Project.findByIdAndUpdate(
            invitation.projectId,
            { $addToSet: { members: req.user._id } },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Associated project no longer exists" });
        }

        // Mark invitation as accepted (Sequential Fail-Safe)
        invitation.status = 'accepted';
        await invitation.save();

        res.json({ message: "Successfully joined project", projectId: invitation.projectId });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get pending invitations for a project
// @route   GET /api/projects/:id/invitations
// @access  Private
export const getProjectInvitations = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Only owner or members can see invites
        const isOwner = project.owner && project.owner.equals(req.user._id);
        const isMember = project.members && project.members.includes(req.user._id);
        
        if (!isOwner && !isMember) return res.status(403).json({ message: "Not authorized" });

        const invitations = await Invitation.find({ 
            projectId: req.params.id, 
            status: 'pending' 
        }).select('email expiresAt createdAt');

        res.json(invitations);
    } catch (error) {
        console.error("GET_INVITATIONS_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private
export const removeMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Only owner can remove members
        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized, owner only" });
        }

        const { memberId } = req.params;

        // Prevent owner from removing themselves
        if (project.owner.equals(memberId)) {
            return res.status(400).json({ message: "Owner cannot be removed from the project" });
        }

        project.members = project.members.filter(m => m && m.toString() !== memberId);
        await project.save();

        res.json({ message: "Member removed", members: project.members });
    } catch (error) {
        console.error("REMOVE_MEMBER_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get public projects
// @route   GET /api/projects/public
// @access  Private
export const getPublicProjects = async (req, res) => {
    try {
        const projects = await Project.aggregate([
            {
                $match: { visibility: 'public' }
            },
            {
                $limit: 20
            },
            {
                $lookup: {
                    from: 'issues',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'issues'
                }
            },
            {
                $addFields: {
                    totalIssues: { $size: '$issues' },
                    overdueIssues: {
                        $size: {
                            $filter: {
                                input: '$issues',
                                as: 'issue',
                                cond: {
                                    $and: [
                                        { $ne: ['$$issue.status', 'Done'] },
                                        { $lt: ['$$issue.deadline', new Date()] },
                                        { $ne: ['$$issue.deadline', null] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    isAtRisk: {
                        $cond: {
                            if: { $eq: ['$totalIssues', 0] },
                            then: false,
                            else: { $gt: [{ $divide: ['$overdueIssues', '$totalIssues'] }, 0.5] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            { $unwind: '$owner' },
            {
                $project: {
                    'owner.password': 0,
                    'owner.email': 0,
                    'issues': 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.json({ projects });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
