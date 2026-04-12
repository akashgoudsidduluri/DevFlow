import Issue from "../models/Issue.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";
import { getIO } from "../utils/socketManager.js";

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
export const createIssue = async (req, res) => {
    try {
        const { title, description, priority, projectId, assignedTo, deadline } = req.body;

        // Verify valid Object IDs
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        // Verify project exists
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Verify the user is part of the project (Safely check for null/undefined)
        const isMember = project.members.some(member => member && member.equals(req.user._id));
        const isOwner = project.owner && project.owner.equals(req.user._id);

        if (!isMember && !isOwner) {
            return res.status(403).json({ message: "Not authorized to create issues in this project" });
        }

        const issue = new Issue({
            title,
            description,
            priority,
            project: projectId,
            assignedTo,
            createdBy: req.user._id,
            deadline: deadline || null,
        });

        const createdIssue = await issue.save();
        // Real-time: broadcast new issue to project room
        try { getIO().to(`project:${projectId}`).emit('issue_created', createdIssue); } catch(_) {}
        res.status(201).json(createdIssue);
    } catch (error) {
        res.status(400).json({ message: error.message || "Failed to create issue" });
    }
};

// @desc    Get all issues for a specific project
// @route   GET /api/issues/project/:projectId
// @access  Private
export const getIssuesByProject = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.projectId)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Safe membership check
        const projectMembers = project.members || [];
        const isMember = projectMembers.some(member => member && member.equals(req.user._id));
        const isOwner = project.owner && project.owner.equals(req.user._id);
        const isPublic = project.visibility === 'public';

        // Allow viewing issues if: member, owner, or project is public
        if (!isMember && !isOwner && !isPublic) {
            return res.status(403).json({ message: "Not authorized to view issues in this project" });
        }

        const issues = await Issue.find({ project: req.params.projectId })
            .populate("createdBy", "name email avatarUrl")
            .populate("assignedTo", "name email avatarUrl")
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        console.error("GET_ISSUES_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

const getAccessFlags = async (project, user) => {
    const projectMembers = project.members || [];
    const isMember = projectMembers.some(member => member && member.equals(user._id));
    const isOwner = project.owner && project.owner.equals(user._id);
    const isPublic = project.visibility === 'public';
    return { isMember, isOwner, isPublic };
};

export const getIssueById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid issue ID format' });
        }

        const issue = await Issue.findById(req.params.id)
            .populate('createdBy', 'name avatarUrl')
            .populate('assignedTo', 'name avatarUrl');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const project = await Project.findById(issue.project);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { isMember, isOwner, isPublic } = await getAccessFlags(project, req.user);
        if (!isMember && !isOwner && !isPublic) {
            return res.status(403).json({ message: 'Not authorized to view this issue' });
        }

        const comments = await Comment.find({ issueId: issue._id })
            .sort({ createdAt: 1 })
            .populate('userId', 'name avatarUrl');

        res.json({ issue, comments, isMember, isPublic });
    } catch (error) {
        console.error('GET_ISSUE_DETAIL_ERROR:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update an issue (status, assignment, etc.)
// @route   PUT /api/issues/:id
// @access  Private
export const updateIssue = async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo, deadline } = req.body;

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Verify the user is part of the project that owns the issue
        const project = await Project.findById(issue.project);
        const isMember = project.members.some(member => member && member.equals(req.user._id));
        const isOwner = project.owner && project.owner.equals(req.user._id);

        if (!isMember && !isOwner) {
            return res.status(403).json({ message: "Not authorized to update issues in this project" });
        }

        issue.title = title || issue.title;
        issue.description = description !== undefined ? description : issue.description;

        // Track time specifically for In Progress state
        let normalizedStatus = status;
        if (status) {
            // Map common variations to strict lowercase tokens
            const lowerStatus = status.toLowerCase().replace(/[^a-z_]/g, '');
            if (lowerStatus === 'inprogress' || lowerStatus === 'in_progress') normalizedStatus = 'in_progress';
            else if (lowerStatus === 'todo' || lowerStatus === 'to_do') normalizedStatus = 'todo';
            else if (lowerStatus === 'done') normalizedStatus = 'done';
            else normalizedStatus = 'todo'; // Default fallback

            if (normalizedStatus !== issue.status) {
                issue.status = normalizedStatus;
                if (normalizedStatus === 'in_progress') {
                    issue.inProgressSince = new Date();
                } else {
                    issue.inProgressSince = null;
                }
            }
        }

        issue.priority = priority || issue.priority;
        issue.assignedTo = assignedTo || issue.assignedTo;
        issue.deadline = deadline !== undefined ? deadline : issue.deadline;

        const updatedIssue = await issue.save();
        // Real-time: broadcast updated issue to project room
        try { getIO().to(`project:${updatedIssue.project}`).emit('issue_updated', updatedIssue); } catch(_) {}
        res.json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private
export const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const project = await Project.findById(issue.project);
        const isOwner = project.owner && project.owner.equals(req.user._id);
        const isCreator = issue.createdBy && issue.createdBy.equals(req.user._id);

        // Only the project owner or the person who created the issue can delete it
        if (!isOwner && !isCreator) {
            return res.status(403).json({ message: "Not authorized to delete this issue" });
        }

        await Issue.deleteOne({ _id: issue._id });
        res.json({ message: "Issue removed" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Assign an issue to a user
// @route   PUT /api/issues/:id/assign
// @access  Private
export const assignIssue = async (req, res) => {
    try {
        const { userId } = req.body;
        const issueId = req.params.id;

        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(issueId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Fetch project for membership check
        const project = await Project.findById(issue.project);
        if (!project) {
            return res.status(404).json({ message: "Project context not found" });
        }

        // Ensure user is in project.members or is owner
        const isAssigneeMember = project.members.some(m => m && m.toString() === userId) || (project.owner && project.owner.toString() === userId);
        
        if (!isAssigneeMember) {
            return res.status(403).json({ message: "Target user must be a project member" });
        }

        // Idempotent check
        if (issue.assignedTo && issue.assignedTo.toString() === userId) {
            return res.json(issue);
        }

        // Atomic update - no multi-step fetch/modify/save
        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            { $set: { assignedTo: userId } },
            { new: true, runValidators: true }
        ).populate("assignedTo", "name avatarUrl");

        // Real-time: broadcast assignment to project room
        try { getIO().to(`project:${issue.project}`).emit('issue_assigned', updatedIssue); } catch(_) {}
        res.json(updatedIssue);
    } catch (error) {
        console.error("ASSIGN_ISSUE_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get smart assignment suggestions
// @route   GET /api/issues/project/:projectId/suggestions
// @access  Private
export const getAssignmentSuggestions = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        const project = await Project.findById(projectId).populate("members", "name avatarUrl");
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const members = [...project.members];
        const owner = await User.findById(project.owner).select("name avatarUrl");
        if (owner && !members.some(m => m._id.toString() === owner._id.toString())) {
            members.push(owner);
        }

        // SINGLE QUERY: Fetch all active issues (status != done) for the project
        const activeIssues = await Issue.find({
            project: projectId,
            status: { $ne: "done" },
            assignedTo: { $exists: true, $ne: null }
        });

        // In-memory weighted aggregation
        const priorityWeights = { high: 3, medium: 2, low: 1 };
        const workloadMap = {};

        // Initialize map for all members to ensure they appear even with 0 load
        members.forEach(m => {
            workloadMap[m._id.toString()] = { totalWorkload: 0, activeTaskCount: 0 };
        });

        activeIssues.forEach(issue => {
            const assigneeId = issue.assignedTo.toString();
            if (workloadMap[assigneeId]) {
                const weight = priorityWeights[issue.priority] || 1;
                workloadMap[assigneeId].totalWorkload += weight;
                workloadMap[assigneeId].activeTaskCount += 1;
            }
        });

        const suggestions = members.map(member => ({
            _id: member._id,
            name: member.name,
            avatarUrl: member.avatarUrl,
            workload: workloadMap[member._id.toString()]
        })).sort((a, b) => a.workload.totalWorkload - b.workload.totalWorkload);

        res.json(suggestions);
    } catch (error) {
        console.error("GET_SUGGESTIONS_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
