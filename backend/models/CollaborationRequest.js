import mongoose from "mongoose";

const collaborationRequestSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'denied'],
        default: 'pending'
    },
    message: {
        type: String,
        maxLength: 500,
        default: "I'm interested in collaborating on this project"
    }
}, {
    timestamps: true
});

// Index to prevent duplicate pending requests
collaborationRequestSchema.index({ project: 1, requestedBy: 1, status: 1 }, { unique: true });

export default mongoose.model("CollaborationRequest", collaborationRequestSchema);
