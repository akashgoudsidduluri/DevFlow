import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    deadline: {
        type: Date
    },
    projectType: {
        type: String,
        enum: ['solo', 'group'],
        default: 'solo'
    },
    githubUrl: {
        type: String,
        default: ""
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
}, {
    timestamps: true
});

// Index for fast search
projectSchema.index({ name: 'text' });

export default mongoose.model("Project", projectSchema);
