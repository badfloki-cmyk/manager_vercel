import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    authorEmail: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['announcement', 'general'],
        default: 'general',
    },
    team: {
        type: String,
        enum: ['1. Mannschaft', '2. Mannschaft', 'Alle'],
        default: 'Alle',
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
