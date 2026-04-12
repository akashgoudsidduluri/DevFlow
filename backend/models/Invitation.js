import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    inviterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Auto-delete expired invitations after 24 hours (86400 seconds)
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('Invitation', invitationSchema);
