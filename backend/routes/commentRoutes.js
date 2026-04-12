import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createComment, getCommentsByIssue } from '../controllers/commentController.js';

const router = express.Router();

router.route('/')
    .post(protect, createComment);

router.route('/:issueId')
    .get(protect, getCommentsByIssue);

export default router;
