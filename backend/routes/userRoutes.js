import express from "express";
import {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    searchUsers,
    updateUserProfile,
    getPublicProfile,
    followUser,
    unfollowUser,
    changePassword
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.get("/search", protect, searchUsers);
router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.post("/change-password", protect, changePassword);

router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);
router.get("/:id", protect, getPublicProfile);

export default router;
