import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description?: string;
    type: 'Training' | 'Match' | 'Event';
    date: string;
    location: string;
    team: '1. Mannschaft' | '2. Mannschaft' | 'Both';
    attendance: {
        player: mongoose.Types.ObjectId;
        status: 'Confirmed' | 'Declined' | 'Pending';
    }[];
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ['Training', 'Match', 'Event'], required: true },
        date: { type: String, required: true },
        location: { type: String, required: true },
        team: { type: String, enum: ['1. Mannschaft', '2. Mannschaft', 'Both'], required: true },
        attendance: [
            {
                player: { type: Schema.Types.ObjectId, ref: 'Player' },
                status: { type: String, enum: ['Confirmed', 'Declined', 'Pending'], default: 'Pending' },
            },
        ],
    },
    { timestamps: true }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;
