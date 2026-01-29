import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayer extends Document {
    firstName: string;
    lastName: string;
    number: number;
    position: string;
    team: '1. Mannschaft' | '2. Mannschaft';
    status: 'Active' | 'Injured' | 'Away';
    role: 'Captain' | 'Regular' | 'Admin';
    photoUrl?: string;
    onBench: boolean;
    stats: {
        goals: number;
        assists: number;
        appearances: number;
    };
    fifaStats?: {
        pac: number;
        sho: number;
        pas: number;
        dri: number;
        def: number;
        phy: number;
        rating: number;
    };
    notes?: string[];
}

const PlayerSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        number: { type: Number, required: true },
        position: { type: String, required: true },
        team: { type: String, enum: ['1. Mannschaft', '2. Mannschaft'], required: true },
        status: { type: String, enum: ['Active', 'Injured', 'Away'], default: 'Active' },
        role: { type: String, enum: ['Captain', 'Regular', 'Admin'], default: 'Regular' },
        photoUrl: { type: String },
        onBench: { type: Boolean, default: false },
        stats: {
            goals: { type: Number, default: 0 },
            assists: { type: Number, default: 0 },
            appearances: { type: Number, default: 0 },
        },
        fifaStats: {
            pac: { type: Number, default: 50 },
            sho: { type: Number, default: 50 },
            pas: { type: Number, default: 50 },
            dri: { type: Number, default: 50 },
            def: { type: Number, default: 50 },
            phy: { type: Number, default: 50 },
            rating: { type: Number, default: 50 },
        },
        notes: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Prevent re-compiling models in Next.js HMR
const Player: Model<IPlayer> = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
