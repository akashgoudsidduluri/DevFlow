import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Project",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        message: {
            type: String,
            required: true,
            maxlength: 300,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for high-speed chronological retrieval per project
discussionSchema.index({ projectId: 1, createdAt: 1 });

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion;