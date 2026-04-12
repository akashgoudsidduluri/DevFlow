import User from "../models/User.js";
import Project from "../models/Project.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                followersCount: 0,
                followingCount: 0
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                followersCount: user.followers.length,
                followingCount: user.following.length
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Search for users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) {
            return res.json({ users: [] });
        }

        // Use prefix-based regex for performance with indexing
        const users = await User.find({
            name: { $regex: `^${q}`, $options: "i" },
            _id: { $ne: req.user._id }
        })
        .select("name avatarUrl followers")
        .limit(20);

        // Inject isFollowing flag
        const results = users.map(user => ({
            _id: user._id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            isFollowing: (user.followers || []).some(f => f.toString() === req.user._id.toString())
        }));

        res.json({ users: results });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

            // Only update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                avatarUrl: updatedUser.avatarUrl,
                followersCount: updatedUser.followers.length,
                followingCount: updatedUser.following.length
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Get public profile by ID
// @route   GET /api/users/:id
// @access  Private
export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password -email") 
            .populate("followers", "name avatarUrl")
            .populate("following", "name avatarUrl");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch projects the user is involved in
        const projects = await Project.find({
            $or: [
                { owner: req.params.id },
                { members: req.params.id }
            ]
        }).select("name description isAtRisk").populate("owner", "name avatarUrl");

        res.json({
            ...user._doc,
            projects
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
export const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentId = req.user._id;

        if (targetId === currentId.toString()) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({ message: "User to follow not found" });
        }

        const currentUser = await User.findById(currentId);

        // Check already following
        if (currentUser.following.includes(targetId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        currentUser.following.push(targetId);
        targetUser.followers.push(currentId);

        await currentUser.save();
        await targetUser.save();

        res.json({ message: "Successfully followed" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
export const unfollowUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentId = req.user._id;

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentId);

        if (!targetUser) {
            return res.status(404).json({ message: "User to unfollow not found" });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentId.toString());

        await currentUser.save();
        await targetUser.save();

        res.json({ message: "Successfully unfollowed" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
