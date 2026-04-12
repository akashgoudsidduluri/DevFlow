import Discussion from "../models/Discussion.js";
import Project from "../models/Project.js";

// @desc    Post a new discussion message
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
    try {
        const { projectId, message } = req.body;

        if (!projectId || !message) {
            return res.status(400).json({ message: "Project ID and message are required" });
        }

        if (message.length > 300) {
            return res.status(400).json({ message: "Message exceeds 300 character limit" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Membership check: user must be an owner or a member
        const isMember = project.members.some(m => m.toString() === req.user._id.toString()) ||
                        project.owner.toString() === req.user._id.toString();

        if (!isMember) {
            return res.status(403).json({ message: "Not authorized: Must be a project member" });
        }

        const discussion = await Discussion.create({
            projectId,
            userId: req.user._id,
            message,
        });

        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate("userId", "name avatarUrl");

        res.status(201).json(populatedDiscussion);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get all discussions for a project
// @route   GET /api/discussions/:projectId
// @access  Private
const getDiscussions = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Membership check
        const isMember = project.members.some(m => m.toString() === req.user._id.toString()) ||
                        project.owner.toString() === req.user._id.toString();

        if (!isMember) {
            return res.status(403).json({ message: "Not authorized: Must be a project member" });
        }

        const discussions = await Discussion.find({ projectId })
            .sort({ createdAt: 1 })
            .populate("userId", "name avatarUrl");

        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

export { createDiscussion, getDiscussions };

