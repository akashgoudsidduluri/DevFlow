import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';

const sanitizeText = (text) => {
    return String(text || '').trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const verifyIssueAccess = async (issue, user) => {
    const project = await Project.findById(issue.project);
    if (!project) {
        return { project: null, isMember: false, isOwner: false, isPublic: false };
    }

    const projectMembers = project.members || [];
    const isMember = projectMembers.some(member => member && member.equals(user._id));
    const isOwner = project.owner && project.owner.equals(user._id);
    const isPublic = project.visibility === 'public';

    return { project, isMember, isOwner, isPublic };
};

export const createComment = async (req, res) => {
    try {
        const { issueId, text } = req.body;
        if (!mongoose.isValidObjectId(issueId)) {
            return res.status(400).json({ message: 'Invalid issue ID' });
        }

        const trimmedText = sanitizeText(text);
        if (!trimmedText) {
            return res.status(400).json({ message: 'Comment text cannot be empty' });
        }

        if (trimmedText.length > 300) {
            return res.status(400).json({ message: 'Comment text cannot exceed 300 characters' });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const { isMember, isOwner } = await verifyIssueAccess(issue, req.user);
        if (!isMember && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to comment on this issue' });
        }

        const comment = new Comment({
            issueId,
            userId: req.user._id,
            text: trimmedText,
        });

        await comment.save();
        await comment.populate('userId', 'name avatarUrl');

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create comment' });
    }
};

export const getCommentsByIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        if (!mongoose.isValidObjectId(issueId)) {
            return res.status(400).json({ message: 'Invalid issue ID' });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const { isMember, isOwner, isPublic } = await verifyIssueAccess(issue, req.user);
        if (!isMember && !isOwner && !isPublic) {
            return res.status(403).json({ message: 'Not authorized to view comments on this issue' });
        }

        const comments = await Comment.find({ issueId })
            .sort({ createdAt: 1 })
            .populate('userId', 'name avatarUrl');

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load comments' });
    }
};
