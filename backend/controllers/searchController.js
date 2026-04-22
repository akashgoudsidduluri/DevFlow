import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Project from "../models/Project.js";

// @desc    Global search across users and projects
// @route   GET /api/search?q=
// @access  Private
export const globalSearch = asyncHandler(async (req, res) => {
  const query = req.query.q;
  const currentUserId = req.user._id;

  if (!query || query.length < 2) {
    return res.json({ users: [], projects: [] });
  }

  const keyword = {
    $regex: query,
    $options: 'i',
  };

  // Search users by name or email
  const users = await User.find({
    $or: [{ name: keyword }, { email: keyword }],
  })
    .select('-password -__v')
    .lean()
    .limit(5);

  // Get current user to check following status
  const currentUser = await User.findById(currentUserId).select('following').lean();
  const followingIds = currentUser?.following || [];

  // Add isFollowing property to each user
  const usersWithFollowStatus = users.map((user) => ({
    ...user,
    isFollowing: followingIds.some((id) => id.toString() === user._id.toString()),
  }));

  // Search public projects by title or description
  const projects = await Project.find({
    isPublic: true,
    $or: [{ title: keyword }, { description: keyword }],
  })
    .select('title description status isPublic githubUrl liveUrl createdAt')
    .populate('createdBy', 'name avatarUrl')
    .lean()
    .limit(5);

  res.json({
    users: usersWithFollowStatus,
    projects,
  });
});
